#!/usr/bin/env python3
"""
SWARMV4 AppleScript Automation - Advanced macOS System Automation
Intelligent AppleScript generation and execution with error handling and optimization
"""

import os
import sys
import json
import time
import subprocess
import threading
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict

# ═══════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════

SWARM_ROOT = Path(__file__).parent.parent.parent
LOG_DIR = SWARM_ROOT / "logs"
SCRIPT_DIR = SWARM_ROOT / "scripts" / "applescript"
TEMPLATE_DIR = SWARM_ROOT / "templates" / "applescript"

# Create required directories
LOG_DIR.mkdir(exist_ok=True)
SCRIPT_DIR.mkdir(exist_ok=True, parents=True)
TEMPLATE_DIR.mkdir(exist_ok=True, parents=True)

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler(LOG_DIR / "applescript-automation.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════
# APPLESCRIPT AUTOMATION CLASSES
# ═══════════════════════════════════════════════════

@dataclass
class AppleScriptTask:
    """Represents an AppleScript automation task"""
    task_id: str
    script_name: str
    script_content: str
    target_application: str
    automation_type: str
    timeout: int = 30
    retry_count: int = 3
    status: str = "pending"
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None

@dataclass
class ApplicationContext:
    """Context information for application automation"""
    app_name: str
    app_bundle_id: str
    app_version: str
    is_running: bool
    window_count: int
    supports_accessibility: bool

class AppleScriptAutomationEngine:
    """Core AppleScript automation engine"""
    
    def __init__(self):
        self.script_templates = self.load_script_templates()
        self.application_contexts = {}
        self.active_automations = {}
        
        # AppleScript execution configuration
        self.execution_timeout = 60
        self.max_concurrent_scripts = 5
        self.accessibility_enabled = self.check_accessibility_permissions()
        
        logger.info("🍎 AppleScript Automation Engine initialized")

    def load_script_templates(self) -> Dict[str, str]:
        """Load AppleScript templates for common automation tasks"""
        templates = {
            "application_control": '''
                tell application "{app_name}"
                    {command}
                end tell
            ''',
            
            "window_management": '''
                tell application "System Events"
                    tell process "{app_name}"
                        {window_commands}
                    end tell
                end tell
            ''',
            
            "file_operations": '''
                tell application "Finder"
                    {file_commands}
                end tell
            ''',
            
            "ui_automation": '''
                tell application "System Events"
                    tell process "{app_name}"
                        tell window 1
                            {ui_commands}
                        end tell
                    end tell
                end tell
            ''',
            
            "screenshot_capture": '''
                do shell script "screencapture -x {screenshot_path}"
            ''',
            
            "system_preferences": '''
                tell application "System Preferences"
                    set current pane to pane "{preference_pane}"
                    {preference_commands}
                end tell
            '''
        }
        
        return templates

    def check_accessibility_permissions(self) -> bool:
        """Check if accessibility permissions are enabled"""
        try:
            # Test accessibility by trying to get system information
            script = '''
                tell application "System Events"
                    return name of first process
                end tell
            '''
            
            result = subprocess.run(
                ['osascript', '-e', script],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            return result.returncode == 0
            
        except Exception:
            return False

    def execute_applescript(self, script_content: str, timeout: int = None) -> Dict[str, Any]:
        """Execute AppleScript with error handling and result parsing"""
        timeout = timeout or self.execution_timeout
        
        logger.info(f"🍎 Executing AppleScript (timeout: {timeout}s)")
        
        try:
            # Execute AppleScript
            process = subprocess.Popen(
                ['osascript', '-e', script_content],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            stdout, stderr = process.communicate(timeout=timeout)
            
            if process.returncode == 0:
                return {
                    "success": True,
                    "output": stdout.strip(),
                    "error": stderr.strip() if stderr else None,
                    "exit_code": process.returncode
                }
            else:
                return {
                    "success": False,
                    "output": stdout.strip(),
                    "error": stderr.strip(),
                    "exit_code": process.returncode
                }
                
        except subprocess.TimeoutExpired:
            process.kill()
            process.communicate()
            return {
                "success": False,
                "output": "",
                "error": f"AppleScript execution timed out after {timeout} seconds",
                "exit_code": -1
            }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": str(e),
                "exit_code": -2
            }

    # ═══════════════════════════════════════════════════
    # APPLICATION CONTROL AUTOMATION
    # ═══════════════════════════════════════════════════

    def launch_application(self, app_name: str, wait_for_launch: bool = True) -> Dict[str, Any]:
        """Launch application with optional wait for readiness"""
        logger.info(f"🚀 Launching application: {app_name}")
        
        script = f'''
            tell application "{app_name}"
                launch
                if {str(wait_for_launch).lower()} then
                    repeat until running
                        delay 0.5
                    end repeat
                end if
            end tell
            return "launched"
        '''
        
        result = self.execute_applescript(script)
        
        if result["success"]:
            # Update application context
            self.update_application_context(app_name)
            logger.info(f"✅ Application launched: {app_name}")
        else:
            logger.error(f"❌ Failed to launch application: {app_name} - {result['error']}")
        
        return result

    def quit_application(self, app_name: str, force: bool = False) -> Dict[str, Any]:
        """Quit application gracefully or forcefully"""
        logger.info(f"🛑 Quitting application: {app_name} (force: {force})")
        
        if force:
            script = f'''
                tell application "{app_name}"
                    quit without saving
                end tell
            '''
        else:
            script = f'''
                tell application "{app_name}"
                    quit saving yes
                end tell
            '''
        
        result = self.execute_applescript(script)
        
        if result["success"]:
            logger.info(f"✅ Application quit: {app_name}")
        else:
            logger.error(f"❌ Failed to quit application: {app_name} - {result['error']}")
        
        return result

    def get_application_info(self, app_name: str) -> Dict[str, Any]:
        """Get comprehensive application information"""
        script = f'''
            tell application "System Events"
                if exists process "{app_name}" then
                    tell process "{app_name}"
                        set appInfo to {{}}
                        set appInfo to appInfo & {{"running", true}}
                        set appInfo to appInfo & {{"frontmost", frontmost}}
                        set appInfo to appInfo & {{"window_count", count of windows}}
                        
                        if count of windows > 0 then
                            tell window 1
                                set appInfo to appInfo & {{"window_title", title}}
                                set appInfo to appInfo & {{"window_position", position}}
                                set appInfo to appInfo & {{"window_size", size}}
                            end tell
                        end if
                        
                        return my listToString(appInfo)
                    end tell
                else
                    return "not_running"
                end if
            end tell
            
            on listToString(lst)
                set AppleScript's text item delimiters to "|"
                set result to lst as string
                set AppleScript's text item delimiters to ""
                return result
            end listToString
        '''
        
        result = self.execute_applescript(script)
        
        if result["success"] and result["output"] != "not_running":
            # Parse the output
            info_parts = result["output"].split("|")
            app_info = {
                "running": info_parts[1] == "true" if len(info_parts) > 1 else False,
                "frontmost": info_parts[3] == "true" if len(info_parts) > 3 else False,
                "window_count": int(info_parts[5]) if len(info_parts) > 5 else 0
            }
            
            if len(info_parts) > 7:
                app_info.update({
                    "window_title": info_parts[7],
                    "window_position": info_parts[9] if len(info_parts) > 9 else "unknown",
                    "window_size": info_parts[11] if len(info_parts) > 11 else "unknown"
                })
            
            return {"success": True, "app_info": app_info}
        
        return {"success": False, "error": result.get("error", "Failed to get app info")}

    # ═══════════════════════════════════════════════════
    # UI AUTOMATION
    # ═══════════════════════════════════════════════════

    def click_ui_element(self, app_name: str, element_selector: str) -> Dict[str, Any]:
        """Click UI element with intelligent selection"""
        logger.info(f"🖱️ Clicking UI element: {element_selector} in {app_name}")
        
        script = f'''
            tell application "System Events"
                tell process "{app_name}"
                    try
                        {element_selector}
                        click result
                        return "clicked"
                    on error errMsg
                        return "error: " & errMsg
                    end try
                end tell
            end tell
        '''
        
        result = self.execute_applescript(script)
        
        if result["success"] and not result["output"].startswith("error:"):
            logger.info(f"✅ UI element clicked successfully")
            return {"success": True, "action": "clicked"}
        else:
            error_msg = result["output"] if result["output"].startswith("error:") else result.get("error", "Unknown error")
            logger.error(f"❌ Failed to click UI element: {error_msg}")
            return {"success": False, "error": error_msg}

    def type_text(self, text: str, app_name: Optional[str] = None) -> Dict[str, Any]:
        """Type text into active application or specific application"""
        logger.info(f"⌨️ Typing text: '{text[:50]}...' {'in ' + app_name if app_name else 'in active app'}")
        
        if app_name:
            script = f'''
                tell application "{app_name}" to activate
                tell application "System Events"
                    keystroke "{text}"
                end tell
            '''
        else:
            script = f'''
                tell application "System Events"
                    keystroke "{text}"
                end tell
            '''
        
        result = self.execute_applescript(script)
        
        if result["success"]:
            logger.info(f"✅ Text typed successfully")
        else:
            logger.error(f"❌ Failed to type text: {result['error']}")
        
        return result

    def capture_screenshot(self, save_path: str, region: Optional[Dict[str, int]] = None) -> Dict[str, Any]:
        """Capture screenshot with optional region specification"""
        logger.info(f"📸 Capturing screenshot: {save_path}")
        
        if region:
            # Capture specific region
            script = f'''
                do shell script "screencapture -R {region['x']},{region['y']},{region['width']},{region['height']} {save_path}"
            '''
        else:
            # Capture entire screen
            script = f'''
                do shell script "screencapture -x {save_path}"
            '''
        
        result = self.execute_applescript(script)
        
        if result["success"]:
            logger.info(f"✅ Screenshot captured: {save_path}")
        else:
            logger.error(f"❌ Screenshot capture failed: {result['error']}")
        
        return result

    # ═══════════════════════════════════════════════════
    # ADVANCED AUTOMATION WORKFLOWS
    # ═══════════════════════════════════════════════════

    def automate_application_testing(self, app_name: str, test_scenario: str) -> Dict[str, Any]:
        """Automate application testing through UI interaction"""
        logger.info(f"🧪 Automating application testing: {app_name} - {test_scenario}")
        
        # Get test scenario script
        test_script = self.get_test_scenario_script(test_scenario, app_name)
        
        if not test_script:
            return {"success": False, "error": f"Test scenario not found: {test_scenario}"}
        
        # Prepare application for testing
        preparation_result = self.prepare_application_for_testing(app_name)
        
        if not preparation_result["success"]:
            return {"success": False, "error": "Failed to prepare application for testing"}
        
        # Execute test scenario
        test_result = self.execute_test_scenario(test_script, app_name)
        
        # Capture test evidence
        evidence = self.capture_test_evidence(app_name, test_scenario)
        
        return {
            "success": test_result["success"],
            "test_scenario": test_scenario,
            "test_result": test_result,
            "evidence": evidence,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def get_test_scenario_script(self, scenario: str, app_name: str) -> Optional[str]:
        """Get AppleScript for specific test scenario"""
        test_scenarios = {
            "basic_functionality": f'''
                tell application "{app_name}"
                    activate
                    delay 2
                end tell
                
                tell application "System Events"
                    tell process "{app_name}"
                        -- Test basic UI interaction
                        if exists button "New" then
                            click button "New"
                            delay 1
                        end if
                        
                        -- Test menu navigation
                        click menu bar item "File" of menu bar 1
                        delay 0.5
                        click menu item "Close" of menu "File" of menu bar item "File" of menu bar 1
                        
                        return "basic_functionality_test_completed"
                    end tell
                end tell
            ''',
            
            "menu_navigation": f'''
                tell application "{app_name}"
                    activate
                end tell
                
                tell application "System Events"
                    tell process "{app_name}"
                        set menuItems to {{}}
                        
                        repeat with menuBarItem in menu bar items of menu bar 1
                            set menuItems to menuItems & {{name of menuBarItem}}
                            
                            click menuBarItem
                            delay 0.5
                            
                            if exists menu 1 of menuBarItem then
                                click menuBarItem -- Close menu
                            end if
                        end repeat
                        
                        return my listToString(menuItems)
                    end tell
                end tell
            ''',
            
            "window_operations": f'''
                tell application "{app_name}"
                    activate
                end tell
                
                tell application "System Events"
                    tell process "{app_name}"
                        set windowInfo to {{}}
                        
                        repeat with win in windows
                            set windowInfo to windowInfo & {{title of win, position of win, size of win}}
                            
                            -- Test window manipulation
                            set position of win to {{100, 100}}
                            delay 0.5
                            set size of win to {{800, 600}}
                            delay 0.5
                        end repeat
                        
                        return my listToString(windowInfo)
                    end tell
                end tell
            '''
        }
        
        return test_scenarios.get(scenario)

    def prepare_application_for_testing(self, app_name: str) -> Dict[str, Any]:
        """Prepare application environment for automated testing"""
        logger.info(f"⚙️ Preparing application for testing: {app_name}")
        
        # Ensure application is launched
        launch_result = self.launch_application(app_name)
        
        if not launch_result["success"]:
            return {"success": False, "error": "Failed to launch application"}
        
        # Wait for application to be ready
        time.sleep(3)
        
        # Bring application to front
        activate_script = f'''
            tell application "{app_name}"
                activate
            end tell
        '''
        
        activate_result = self.execute_applescript(activate_script)
        
        return {"success": activate_result["success"]}

    def execute_test_scenario(self, test_script: str, app_name: str) -> Dict[str, Any]:
        """Execute specific test scenario with error handling"""
        logger.info(f"🎯 Executing test scenario for: {app_name}")
        
        # Add error handling wrapper to script
        wrapped_script = f'''
            try
                {test_script}
            on error errMsg number errNum
                return "ERROR: " & errMsg & " (Code: " & errNum & ")"
            end try
        '''
        
        result = self.execute_applescript(wrapped_script, timeout=120)
        
        # Parse test result
        if result["success"]:
            if result["output"].startswith("ERROR:"):
                return {
                    "success": False,
                    "error": result["output"],
                    "test_completed": False
                }
            else:
                return {
                    "success": True,
                    "output": result["output"],
                    "test_completed": True
                }
        else:
            return {
                "success": False,
                "error": result["error"],
                "test_completed": False
            }

    # ═══════════════════════════════════════════════════
    # INTELLIGENT AUTOMATION FEATURES
    # ═══════════════════════════════════════════════════

    def discover_application_ui(self, app_name: str) -> Dict[str, Any]:
        """Discover application UI structure for automation"""
        logger.info(f"🔍 Discovering UI structure: {app_name}")
        
        discovery_script = f'''
            tell application "System Events"
                tell process "{app_name}"
                    set uiStructure to {{}}
                    
                    -- Discover windows
                    repeat with win in windows
                        set windowInfo to {{"window", title of win, position of win, size of win}}
                        set uiStructure to uiStructure & {{windowInfo}}
                        
                        -- Discover buttons
                        try
                            repeat with btn in buttons of win
                                set buttonInfo to {{"button", title of btn, position of btn}}
                                set uiStructure to uiStructure & {{buttonInfo}}
                            end repeat
                        end try
                        
                        -- Discover text fields
                        try
                            repeat with txtField in text fields of win
                                set fieldInfo to {{"text_field", value of txtField, position of txtField}}
                                set uiStructure to uiStructure & {{fieldInfo}}
                            end repeat
                        end try
                        
                        -- Discover menus
                        try
                            repeat with menuBtn in menu buttons of win
                                set menuInfo to {{"menu_button", title of menuBtn, position of menuBtn}}
                                set uiStructure to uiStructure & {{menuInfo}}
                            end repeat
                        end try
                    end repeat
                    
                    return my listToString(uiStructure)
                end tell
            end tell
        '''
        
        result = self.execute_applescript(discovery_script, timeout=60)
        
        if result["success"]:
            ui_structure = self.parse_ui_structure(result["output"])
            logger.info(f"✅ UI structure discovered: {len(ui_structure)} elements")
            return {"success": True, "ui_structure": ui_structure}
        else:
            logger.error(f"❌ UI discovery failed: {result['error']}")
            return {"success": False, "error": result["error"]}

    def generate_automation_script(self, automation_spec: Dict[str, Any]) -> str:
        """Generate AppleScript based on automation specification"""
        logger.info(f"🔧 Generating automation script for: {automation_spec.get('task_name', 'unknown')}")
        
        task_type = automation_spec["task_type"]
        app_name = automation_spec["target_application"]
        
        if task_type == "ui_interaction":
            return self.generate_ui_interaction_script(automation_spec)
        elif task_type == "file_operation":
            return self.generate_file_operation_script(automation_spec)
        elif task_type == "system_control":
            return self.generate_system_control_script(automation_spec)
        elif task_type == "workflow_automation":
            return self.generate_workflow_automation_script(automation_spec)
        else:
            return self.generate_generic_automation_script(automation_spec)

    def generate_ui_interaction_script(self, spec: Dict[str, Any]) -> str:
        """Generate UI interaction AppleScript"""
        app_name = spec["target_application"]
        interactions = spec["interactions"]
        
        script_parts = [
            f'tell application "{app_name}"',
            '    activate',
            'end tell',
            '',
            'tell application "System Events"',
            f'    tell process "{app_name}"'
        ]
        
        for interaction in interactions:
            action = interaction["action"]
            target = interaction["target"]
            
            if action == "click":
                script_parts.append(f'        click {target}')
            elif action == "type":
                script_parts.append(f'        keystroke "{interaction["text"]}"')
            elif action == "key_combination":
                keys = interaction["keys"]
                script_parts.append(f'        key code {keys["key_code"]} using {{{keys["modifiers"]}}}')
            
            script_parts.append('        delay 0.5')
        
        script_parts.extend([
            '    end tell',
            'end tell'
        ])
        
        return '\n'.join(script_parts)

    def generate_file_operation_script(self, spec: Dict[str, Any]) -> str:
        """Generate file operation AppleScript"""
        operations = spec["file_operations"]
        
        script_parts = [
            'tell application "Finder"'
        ]
        
        for operation in operations:
            op_type = operation["type"]
            source = operation.get("source", "")
            target = operation.get("target", "")
            
            if op_type == "copy":
                script_parts.append(f'    duplicate file "{source}" to folder "{target}"')
            elif op_type == "move":
                script_parts.append(f'    move file "{source}" to folder "{target}"')
            elif op_type == "delete":
                script_parts.append(f'    delete file "{source}"')
            elif op_type == "create_folder":
                script_parts.append(f'    make new folder at desktop with properties {{name:"{target}"}}')
        
        script_parts.append('end tell')
        
        return '\n'.join(script_parts)

    # ═══════════════════════════════════════════════════
    # SYSTEM AUTOMATION
    # ═══════════════════════════════════════════════════

    def automate_system_preferences(self, preference_pane: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Automate system preferences configuration"""
        logger.info(f"⚙️ Automating system preferences: {preference_pane}")
        
        script = f'''
            tell application "System Preferences"
                set current pane to pane id "{preference_pane}"
                activate
            end tell
            
            delay 2
            
            tell application "System Events"
                tell process "System Preferences"
        '''
        
        # Add specific preference settings
        for setting_name, setting_value in settings.items():
            script += f'''
                    try
                        set value of checkbox "{setting_name}" to {str(setting_value).lower()}
                    end try
            '''
        
        script += '''
                end tell
            end tell
            
            tell application "System Preferences" to quit
        '''
        
        result = self.execute_applescript(script, timeout=60)
        
        if result["success"]:
            logger.info(f"✅ System preferences configured: {preference_pane}")
        else:
            logger.error(f"❌ System preferences automation failed: {result['error']}")
        
        return result

    def automate_dock_configuration(self, dock_settings: Dict[str, Any]) -> Dict[str, Any]:
        """Automate Dock configuration"""
        logger.info("🎛️ Automating Dock configuration...")
        
        script = '''
            tell application "System Events"
                tell dock preferences
        '''
        
        # Configure dock settings
        if "auto_hide" in dock_settings:
            script += f'                    set autohide to {str(dock_settings["auto_hide"]).lower()}\n'
        
        if "magnification" in dock_settings:
            script += f'                    set magnification to {str(dock_settings["magnification"]).lower()}\n'
        
        if "position" in dock_settings:
            script += f'                    set screen edge to {dock_settings["position"]}\n'
        
        script += '''
                end tell
            end tell
        '''
        
        result = self.execute_applescript(script)
        
        if result["success"]:
            logger.info("✅ Dock configuration completed")
        else:
            logger.error(f"❌ Dock configuration failed: {result['error']}")
        
        return result

    def automate_application_installation(self, app_dmg_path: str) -> Dict[str, Any]:
        """Automate application installation from DMG"""
        logger.info(f"📦 Automating application installation: {app_dmg_path}")
        
        script = f'''
            -- Mount the DMG
            do shell script "hdiutil attach '{app_dmg_path}'"
            delay 3
            
            -- Find the mounted volume
            tell application "Finder"
                set dmgVolume to first disk whose name contains "SwarmV4"
                set appFile to first file of dmgVolume whose name extension is "app"
                set appName to name of appFile
                
                -- Copy app to Applications folder
                duplicate appFile to applications folder
                
                -- Unmount the DMG
                eject dmgVolume
                
                return "installed: " & appName
            end tell
        '''
        
        result = self.execute_applescript(script, timeout=120)
        
        if result["success"]:
            logger.info(f"✅ Application installed successfully")
        else:
            logger.error(f"❌ Application installation failed: {result['error']}")
        
        return result

    # ═══════════════════════════════════════════════════
    # WORKFLOW AUTOMATION
    # ═══════════════════════════════════════════════════

    def execute_complex_workflow(self, workflow_definition: Dict[str, Any]) -> Dict[str, Any]:
        """Execute complex multi-step automation workflow"""
        workflow_name = workflow_definition.get("name", "unnamed_workflow")
        logger.info(f"🔄 Executing complex workflow: {workflow_name}")
        
        workflow_steps = workflow_definition["steps"]
        workflow_results = []
        
        for i, step in enumerate(workflow_steps):
            logger.info(f"📋 Executing workflow step {i + 1}/{len(workflow_steps)}: {step.get('name', 'unnamed_step')}")
            
            # Execute step based on type
            step_result = self.execute_workflow_step(step)
            workflow_results.append(step_result)
            
            # Check if step failed
            if not step_result["success"]:
                error_handling = step.get("error_handling", "stop")
                
                if error_handling == "stop":
                    logger.error(f"❌ Workflow stopped due to step failure: {step['name']}")
                    break
                elif error_handling == "retry":
                    # Retry the step
                    retry_result = self.execute_workflow_step(step)
                    if retry_result["success"]:
                        workflow_results[-1] = retry_result
                    else:
                        logger.error(f"❌ Step retry failed: {step['name']}")
                        break
                elif error_handling == "continue":
                    logger.warning(f"⚠️ Step failed but continuing: {step['name']}")
                    continue
            
            # Wait between steps if specified
            step_delay = step.get("delay", 0)
            if step_delay > 0:
                time.sleep(step_delay)
        
        # Calculate workflow success
        successful_steps = len([r for r in workflow_results if r["success"]])
        workflow_success = successful_steps == len(workflow_steps)
        
        return {
            "workflow_name": workflow_name,
            "success": workflow_success,
            "steps_executed": len(workflow_results),
            "steps_successful": successful_steps,
            "step_results": workflow_results,
            "execution_time": sum([r.get("execution_time", 0) for r in workflow_results])
        }

    def execute_workflow_step(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Execute individual workflow step"""
        step_type = step["type"]
        step_start_time = time.time()
        
        try:
            if step_type == "applescript":
                result = self.execute_applescript(step["script"], step.get("timeout", 30))
            elif step_type == "application_control":
                result = self.execute_application_control_step(step)
            elif step_type == "file_operation":
                result = self.execute_file_operation_step(step)
            elif step_type == "system_command":
                result = self.execute_system_command_step(step)
            elif step_type == "ui_interaction":
                result = self.execute_ui_interaction_step(step)
            else:
                result = {"success": False, "error": f"Unknown step type: {step_type}"}
            
            execution_time = time.time() - step_start_time
            result["execution_time"] = execution_time
            
            return result
            
        except Exception as e:
            execution_time = time.time() - step_start_time
            return {
                "success": False,
                "error": str(e),
                "execution_time": execution_time
            }

    def execute_application_control_step(self, step: Dict[str, Any]) -> Dict[str, Any]:
        """Execute application control step"""
        app_name = step["target_application"]
        control_action = step["action"]
        
        if control_action == "launch":
            return self.launch_application(app_name)
        elif control_action == "quit":
            return self.quit_application(app_name)
        elif control_action == "activate":
            script = f'tell application "{app_name}" to activate'
            return self.execute_applescript(script)
        else:
            return {"success": False, "error": f"Unknown control action: {control_action}"}

    # ═══════════════════════════════════════════════════
    # VISUAL AUTOMATION INTEGRATION
    # ═══════════════════════════════════════════════════

    def integrate_with_visual_testing(self, app_name: str, test_name: str) -> Dict[str, Any]:
        """Integrate AppleScript automation with visual testing"""
        logger.info(f"👁️ Integrating with visual testing: {app_name} - {test_name}")
        
        # Prepare application for visual testing
        preparation_result = self.prepare_application_for_testing(app_name)
        
        if not preparation_result["success"]:
            return {"success": False, "error": "Failed to prepare for visual testing"}
        
        # Execute visual testing workflow
        screenshot_path = SWARM_ROOT / "screenshots" / f"{test_name}-{int(time.time())}.png"
        
        # Position application optimally for screenshot
        positioning_script = f'''
            tell application "{app_name}"
                activate
            end tell
            
            tell application "System Events"
                tell process "{app_name}"
                    tell window 1
                        set position to {{100, 100}}
                        set size to {{1200, 800}}
                    end tell
                end tell
            end tell
        '''
        
        positioning_result = self.execute_applescript(positioning_script)
        
        if positioning_result["success"]:
            # Wait for positioning to complete
            time.sleep(2)
            
            # Capture screenshot
            screenshot_result = self.capture_screenshot(str(screenshot_path))
            
            # Execute visual testing agent
            visual_test_result = subprocess.run([
                str(SWARM_ROOT / "scripts" / "monitoring" / "visual-testing-agent.sh"),
                "--ui-validation",
                f"--app-name={app_name}",
                f"--test-name={test_name}"
            ], capture_output=True, text=True)
            
            return {
                "success": visual_test_result.returncode == 0,
                "screenshot_path": str(screenshot_path),
                "positioning_result": positioning_result,
                "visual_test_output": visual_test_result.stdout,
                "visual_test_error": visual_test_result.stderr
            }
        else:
            return {"success": False, "error": "Failed to position application for testing"}

    # ═══════════════════════════════════════════════════
    # AUTOMATION OPTIMIZATION
    # ═══════════════════════════════════════════════════

    def optimize_automation_performance(self) -> Dict[str, Any]:
        """Optimize AppleScript automation performance"""
        logger.info("⚡ Optimizing automation performance...")
        
        optimization_results = {}
        
        # Optimize script compilation
        compilation_optimization = self.optimize_script_compilation()
        optimization_results["compilation"] = compilation_optimization
        
        # Optimize execution timing
        timing_optimization = self.optimize_execution_timing()
        optimization_results["timing"] = timing_optimization
        
        # Optimize accessibility usage
        accessibility_optimization = self.optimize_accessibility_usage()
        optimization_results["accessibility"] = accessibility_optimization
        
        # Optimize memory usage
        memory_optimization = self.optimize_memory_usage()
        optimization_results["memory"] = memory_optimization
        
        return {
            "optimization_timestamp": datetime.now(timezone.utc).isoformat(),
            "optimization_results": optimization_results,
            "overall_improvement": self.calculate_overall_improvement(optimization_results)
        }

    def optimize_script_compilation(self) -> Dict[str, Any]:
        """Optimize AppleScript compilation for faster execution"""
        # Pre-compile frequently used scripts
        common_scripts = [
            "application_launch",
            "window_management", 
            "ui_interaction",
            "screenshot_capture"
        ]
        
        compiled_scripts = {}
        
        for script_name in common_scripts:
            if script_name in self.script_templates:
                # Compile script to .scpt format for faster execution
                script_content = self.script_templates[script_name]
                compiled_path = SCRIPT_DIR / f"{script_name}.scpt"
                
                compilation_result = subprocess.run([
                    'osacompile',
                    '-o', str(compiled_path),
                    '-e', script_content
                ], capture_output=True, text=True)
                
                if compilation_result.returncode == 0:
                    compiled_scripts[script_name] = str(compiled_path)
                    logger.info(f"✅ Compiled script: {script_name}")
                else:
                    logger.error(f"❌ Failed to compile script: {script_name}")
        
        return {
            "compiled_scripts": compiled_scripts,
            "compilation_success_rate": len(compiled_scripts) / len(common_scripts)
        }

    # ═══════════════════════════════════════════════════
    # MAIN EXECUTION FUNCTIONS
    # ═══════════════════════════════════════════════════

def main():
    """Main execution function for AppleScript automation"""
    import argparse
    
    parser = argparse.ArgumentParser(description="SWARMV4 AppleScript Automation Engine")
    parser.add_argument("--test-app", type=str, help="Test specific application")
    parser.add_argument("--workflow", type=str, help="Execute predefined workflow")
    parser.add_argument("--discover-ui", type=str, help="Discover UI structure of application")
    parser.add_argument("--capture-screenshot", type=str, help="Capture screenshot with specified name")
    parser.add_argument("--automate-preferences", action="store_true", help="Automate system preferences")
    parser.add_argument("--optimize-performance", action="store_true", help="Optimize automation performance")
    
    args = parser.parse_args()
    
    # Initialize automation engine
    automation_engine = AppleScriptAutomationEngine()
    
    try:
        if args.test_app:
            # Test specific application
            result = automation_engine.automate_application_testing(args.test_app, "basic_functionality")
            print(json.dumps(result, indent=2))
        
        elif args.workflow:
            # Execute predefined workflow
            workflow_file = SWARM_ROOT / "workflows" / f"{args.workflow}.json"
            if workflow_file.exists():
                with open(workflow_file, 'r') as f:
                    workflow_definition = json.load(f)
                
                result = automation_engine.execute_complex_workflow(workflow_definition)
                print(json.dumps(result, indent=2))
            else:
                logger.error(f"Workflow file not found: {workflow_file}")
                sys.exit(1)
        
        elif args.discover_ui:
            # Discover UI structure
            result = automation_engine.discover_application_ui(args.discover_ui)
            print(json.dumps(result, indent=2))
        
        elif args.capture_screenshot:
            # Capture screenshot
            screenshot_path = SWARM_ROOT / "screenshots" / f"{args.capture_screenshot}.png"
            result = automation_engine.capture_screenshot(str(screenshot_path))
            print(json.dumps(result, indent=2))
        
        elif args.automate_preferences:
            # Automate system preferences
            preference_settings = {
                "Automatically hide and show the Dock": True,
                "Magnification": False
            }
            result = automation_engine.automate_system_preferences("com.apple.preference.dock", preference_settings)
            print(json.dumps(result, indent=2))
        
        elif args.optimize_performance:
            # Optimize automation performance
            result = automation_engine.optimize_automation_performance()
            print(json.dumps(result, indent=2))
        
        else:
            # Default: Run comprehensive automation demo
            logger.info("🚀 Running comprehensive AppleScript automation demo...")
            
            demo_results = {
                "accessibility_check": automation_engine.accessibility_enabled,
                "system_info": automation_engine.get_system_information(),
                "available_applications": automation_engine.get_available_applications()
            }
            
            print(json.dumps(demo_results, indent=2))
        
        logger.info("🎉 AppleScript automation completed successfully")
        sys.exit(0)
        
    except KeyboardInterrupt:
        logger.info("⏹️ AppleScript automation interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"❌ AppleScript automation error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
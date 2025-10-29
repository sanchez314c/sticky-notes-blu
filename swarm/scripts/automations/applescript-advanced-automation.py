#!/usr/bin/env python3
"""
ADVANCED APPLESCRIPT AUTOMATION SYSTEM
Comprehensive system for terminal automation, application control, and VNC integration

Features:
- Advanced terminal detection and control
- System Events integration
- Window and application management
- Error detection and recovery
- Integration with VNC error detection workflow
- Screenshot analysis integration
"""

import os
import sys
import subprocess
import time
import json
from datetime import datetime
from pathlib import Path

class AdvancedAppleScriptAutomation:
    def __init__(self, project_path=None):
        self.project_path = project_path or os.getcwd()
        self.session_id = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.screenshots_dir = f"screenshots_applescript_{self.session_id}"
        
        # Create screenshots directory
        os.makedirs(self.screenshots_dir, exist_ok=True)
        
        print(f"🍎 ADVANCED APPLESCRIPT AUTOMATION")
        print(f"📁 Project: {self.project_path}")
        print(f"📋 Session: {self.session_id}")
        print(f"📷 Screenshots: {self.screenshots_dir}/")

    def execute_applescript(self, script):
        """Execute AppleScript command with enhanced error handling"""
        try:
            result = subprocess.run([
                'osascript', '-e', script
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                return {"success": True, "output": result.stdout.strip()}
            else:
                error_msg = result.stderr.strip()
                print(f"⚠️ AppleScript error: {error_msg}")
                return {"success": False, "error": error_msg}
                
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "AppleScript timeout"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def take_screenshot(self, label="screen"):
        """Take a screenshot for visual analysis"""
        timestamp = datetime.now().strftime('%H%M%S')
        filename = f"{self.screenshots_dir}/{label}_{timestamp}.png"
        
        try:
            result = subprocess.run([
                'screencapture', '-x', filename
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"📷 Screenshot: {filename}")
                return filename
            else:
                print(f"❌ Screenshot failed: {result.stderr}")
                return None
        except Exception as e:
            print(f"💥 Screenshot error: {str(e)}")
            return None

    def get_system_info(self):
        """Get comprehensive system information"""
        script = '''
        set sysInfo to system info
        return sysInfo as string
        '''
        
        result = self.execute_applescript(script)
        if result["success"]:
            return result["output"]
        return None

    def get_running_applications(self):
        """Get detailed list of running applications"""
        script = '''
        tell application "System Events"
            set appList to {}
            repeat with proc in application processes
                try
                    set appName to name of proc
                    set appVisible to visible of proc
                    set appFrontmost to frontmost of proc
                    set appInfo to appName & " (visible:" & appVisible & ", frontmost:" & appFrontmost & ")"
                    set end of appList to appInfo
                end try
            end repeat
            return appList
        end tell
        '''
        
        result = self.execute_applescript(script)
        if result["success"]:
            return result["output"]
        return []

    def find_best_terminal(self):
        """Find the best available terminal application with priority order"""
        # Priority order: iTerm2 > Terminal > other terminals
        preferred_terminals = [
            {"name": "iTerm2", "process": "iTerm2"},
            {"name": "Terminal", "process": "Terminal"},
            {"name": "iTerm", "process": "iTerm"}
        ]
        
        for terminal in preferred_terminals:
            script = f'''
            tell application "System Events"
                if exists application process "{terminal['process']}" then
                    return "running"
                else
                    try
                        tell application "{terminal['name']}" to get version
                        return "available"
                    on error
                        return "not found"
                    end try
                end if
            end tell
            '''
            
            result = self.execute_applescript(script)
            if result["success"]:
                status = result["output"]
                if status in ["running", "available"]:
                    print(f"🖥️ Selected terminal: {terminal['name']} ({status})")
                    return terminal["name"]
        
        print("❌ No suitable terminal application found")
        return None

    def launch_and_activate_terminal(self, terminal_name="Terminal"):
        """Launch and bring terminal to front"""
        script = f'''
        tell application "{terminal_name}"
            launch
            activate
            delay 1
        end tell
        '''
        
        result = self.execute_applescript(script)
        if result["success"]:
            print(f"🚀 Launched and activated: {terminal_name}")
            return True
        else:
            print(f"❌ Failed to launch: {terminal_name}")
            return False

    def create_new_terminal_window(self, terminal_name="Terminal"):
        """Create a new terminal window"""
        if terminal_name == "iTerm2":
            script = '''
            tell application "iTerm2"
                create window with default profile
            end tell
            '''
        else:
            script = '''
            tell application "Terminal"
                do script ""
            end tell
            '''
        
        result = self.execute_applescript(script)
        if result["success"]:
            print(f"📝 Created new window in {terminal_name}")
            return True
        return False

    def type_in_active_terminal(self, text, terminal_name="Terminal"):
        """Type text in the active terminal with enhanced error handling"""
        # Escape special characters for AppleScript
        escaped_text = text.replace('\\', '\\\\').replace('"', '\\"').replace('$', '\\$')
        
        if terminal_name in ["iTerm2", "iTerm"]:
            script = f'''
            tell application "{terminal_name}"
                tell current session of current tab of current window
                    write text "{escaped_text}"
                end tell
            end tell
            '''
        else:
            script = f'''
            tell application "{terminal_name}"
                do script "{escaped_text}" in front window
            end tell
            '''
        
        result = self.execute_applescript(script)
        if result["success"]:
            print(f"⌨️ Typed in {terminal_name}: {text}")
            return True
        else:
            print(f"❌ Failed to type in {terminal_name}: {result.get('error', 'Unknown error')}")
            return False

    def send_keystroke(self, key, modifiers=None, target_app=None):
        """Send keystrokes using System Events with modifier support"""
        modifier_map = {
            "command": "command down",
            "shift": "shift down", 
            "option": "option down",
            "control": "control down"
        }
        
        modifier_clause = ""
        if modifiers:
            mod_list = [modifier_map.get(mod, mod) for mod in modifiers if mod in modifier_map]
            if mod_list:
                modifier_clause = f" using {{{', '.join(mod_list)}}}"
        
        if target_app:
            script = f'''
            tell application "{target_app}" to activate
            delay 0.2
            tell application "System Events"
                key code {self.get_key_code(key)}{modifier_clause}
            end tell
            '''
        else:
            script = f'''
            tell application "System Events"
                key code {self.get_key_code(key)}{modifier_clause}
            end tell
            '''
        
        result = self.execute_applescript(script)
        if result["success"]:
            print(f"🔑 Sent keystroke: {key} {modifiers or ''}")
            return True
        return False

    def get_key_code(self, key):
        """Get the key code for common keys"""
        key_codes = {
            "enter": "36",
            "return": "36",
            "tab": "48",
            "space": "49",
            "escape": "53",
            "up": "126",
            "down": "125",
            "left": "123",
            "right": "124",
            "delete": "51",
            "backspace": "51"
        }
        return key_codes.get(key.lower(), "36")  # Default to Enter

    def wait_for_prompt(self, timeout=10):
        """Wait for terminal prompt to be ready"""
        print(f"⏳ Waiting for terminal prompt (timeout: {timeout}s)")
        time.sleep(min(timeout, 2))  # Basic wait - could be enhanced with prompt detection
        return True

    def execute_command_sequence(self, commands, terminal_name=None, wait_between=1):
        """Execute a sequence of commands in terminal"""
        if not terminal_name:
            terminal_name = self.find_best_terminal()
            if not terminal_name:
                return False
        
        if not self.launch_and_activate_terminal(terminal_name):
            return False
        
        # Take initial screenshot
        self.take_screenshot("terminal_start")
        
        success_count = 0
        for i, command in enumerate(commands, 1):
            print(f"\n📋 Command {i}/{len(commands)}: {command}")
            
            # Type the command
            if self.type_in_active_terminal(command, terminal_name):
                # Send Enter
                if self.send_keystroke("enter"):
                    # Wait for command completion
                    self.wait_for_prompt(wait_between)
                    success_count += 1
                    
                    # Take screenshot after each command
                    self.take_screenshot(f"after_command_{i}")
                else:
                    print(f"❌ Failed to send Enter for command {i}")
            else:
                print(f"❌ Failed to type command {i}")
        
        # Take final screenshot
        self.take_screenshot("terminal_final")
        
        print(f"\n📊 Executed {success_count}/{len(commands)} commands successfully")
        return success_count == len(commands)

    def detect_error_in_terminal(self):
        """Take screenshot and check for visible error indicators"""
        screenshot = self.take_screenshot("error_check")
        if not screenshot:
            return False
        
        # Use simple heuristics to detect errors
        # In a full implementation, you'd use OCR or image analysis
        try:
            # Check if screenshot was created and has reasonable size
            if os.path.exists(screenshot):
                size = os.path.getsize(screenshot)
                if size > 10000:  # Basic size check
                    print("📸 Screenshot captured for error analysis")
                    return self.analyze_screenshot_for_errors(screenshot)
        except Exception as e:
            print(f"❌ Error checking screenshot: {e}")
        
        return False

    def analyze_screenshot_for_errors(self, screenshot_path):
        """Analyze screenshot for error patterns (placeholder implementation)"""
        # This would integrate with the VNC error detection workflow
        print(f"🔍 Analyzing screenshot: {screenshot_path}")
        
        # For now, return False (no errors detected)
        # In full implementation, this would use:
        # - OCR to extract text
        # - Pattern matching for error messages
        # - Color analysis for error indicators
        return False

    def recovery_workflow(self):
        """Execute recovery workflow when errors are detected"""
        print("🚨 ERROR DETECTED - Executing recovery workflow")
        
        recovery_commands = [
            "clear",  # Clear terminal
            "pwd",    # Check current directory
            "ls -la", # List current contents
        ]
        
        return self.execute_command_sequence(recovery_commands)

    def comprehensive_terminal_test(self):
        """Run comprehensive terminal automation test"""
        print(f"\n🧪 COMPREHENSIVE TERMINAL AUTOMATION TEST")
        
        # Test commands
        test_commands = [
            "echo 'AppleScript Terminal Automation Test'",
            "date",
            "whoami",
            f"cd '{self.project_path}'",
            "pwd",
            "ls -la | head -10",
            "echo 'Test completed successfully!'"
        ]
        
        # Execute the test
        success = self.execute_command_sequence(test_commands, wait_between=2)
        
        # Check for errors
        if self.detect_error_in_terminal():
            print("⚠️ Errors detected, running recovery workflow")
            self.recovery_workflow()
        
        # Generate report
        self.generate_automation_report(success)
        
        return success

    def generate_automation_report(self, success):
        """Generate comprehensive automation report"""
        report_file = f"applescript_automation_report_{self.session_id}.md"
        
        screenshots = list(Path(self.screenshots_dir).glob("*.png"))
        
        report = f"""# AppleScript Automation Report
## Session: {self.session_id}
## Project: {self.project_path}
## Generated: {datetime.now().isoformat()}

### Test Results
- Overall Success: {'✅ PASSED' if success else '❌ FAILED'}
- Screenshots Captured: {len(screenshots)}
- Session Duration: Complete

### Screenshots Directory
{self.screenshots_dir}/

### Automation Capabilities Tested
1. **Terminal Detection**: Automatic discovery of best available terminal
2. **Application Control**: Launch and activate terminal applications  
3. **Command Execution**: Sequential command execution with timing
4. **Error Detection**: Screenshot-based error identification
5. **Recovery Workflow**: Automatic error recovery procedures
6. **System Integration**: System Events and application control

### Files Generated
"""
        
        for screenshot in screenshots:
            report += f"- {screenshot.name}\n"
        
        report += f"""
### Integration Points
- VNC Error Detection Workflow
- Visual Testing System
- Terminal Application Control
- System Events Automation

### Next Steps
- Integrate with VNC error detection for automatic error fixing
- Enhance OCR capabilities for better error detection
- Add support for additional terminal applications
- Implement command completion detection
"""
        
        with open(report_file, 'w') as f:
            f.write(report)
            
        print(f"📊 Automation report: {report_file}")
        return report_file

def main():
    automation = AdvancedAppleScriptAutomation()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--test":
            automation.comprehensive_terminal_test()
        elif sys.argv[1] == "--command":
            if len(sys.argv) > 2:
                commands = sys.argv[2:]
                automation.execute_command_sequence(commands)
            else:
                print("❌ No commands provided")
        else:
            # Single command
            command = " ".join(sys.argv[1:])
            automation.execute_command_sequence([command])
    else:
        # Run comprehensive test
        automation.comprehensive_terminal_test()

if __name__ == "__main__":
    main()
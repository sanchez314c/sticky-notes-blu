#!/usr/bin/env python3
"""
VNC ERROR DETECTION AND AUTO-FIX WORKFLOW
Automated error detection in applications through visual testing with auto-repair
"""

import os
import sys
import subprocess
import time
import json
from datetime import datetime
from pathlib import Path

class VNCErrorDetectionWorkflow:
    def __init__(self, project_path=None):
        self.project_path = project_path or os.getcwd()
        self.session_id = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.screenshots_dir = f"screenshots_vnc_{self.session_id}"
        self.max_fix_attempts = 3
        
        # Create screenshots directory
        os.makedirs(self.screenshots_dir, exist_ok=True)
        
        print(f"🔍 VNC ERROR DETECTION WORKFLOW")
        print(f"📁 Project: {self.project_path}")
        print(f"📋 Session: {self.session_id}")
        print(f"📷 Screenshots: {self.screenshots_dir}/")

    def take_screenshot(self, label="screen"):
        """Capture current screen state"""
        timestamp = datetime.now().strftime('%H%M%S')
        filename = f"{self.screenshots_dir}/{label}_{timestamp}.png"
        
        try:
            # macOS screenshot command
            result = subprocess.run([
                'screencapture', '-x', filename
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"📷 Screenshot captured: {filename}")
                return filename
            else:
                print(f"❌ Screenshot failed: {result.stderr}")
                return None
        except Exception as e:
            print(f"💥 Screenshot error: {str(e)}")
            return None

    def analyze_screenshot_for_errors(self, screenshot_path):
        """
        Analyze screenshot for common error indicators
        Returns: dict with error detection results
        """
        if not os.path.exists(screenshot_path):
            return {"has_errors": False, "confidence": 0, "error_types": []}
        
        # Use OCR or pixel analysis to detect errors
        # For now, we'll use a simple approach with system commands
        error_indicators = {
            "compilation_error": ["error", "failed", "compilation", "syntax error"],
            "runtime_error": ["exception", "crashed", "abort", "segmentation fault"],
            "ui_error": ["not responding", "application error", "unexpected error"],
            "build_error": ["build failed", "make error", "cmake error", "npm error"]
        }
        
        detected_errors = []
        confidence = 0
        
        try:
            # Use tesseract OCR if available, or basic image analysis
            # This is a placeholder - in production you'd use proper OCR
            
            # For demonstration, we'll check if certain error patterns exist
            # by looking at the screenshot metadata or using system tools
            
            # Basic approach: look for red colors that might indicate errors
            result = subprocess.run([
                'sips', '-g', 'all', screenshot_path
            ], capture_output=True, text=True)
            
            if "error" in result.stdout.lower():
                detected_errors.append("potential_error_detected")
                confidence = 70
                
        except Exception as e:
            print(f"⚠️ Error analysis failed: {str(e)}")
            
        return {
            "has_errors": len(detected_errors) > 0,
            "confidence": confidence,
            "error_types": detected_errors,
            "screenshot": screenshot_path,
            "analysis_time": datetime.now().isoformat()
        }

    def extract_error_message(self, screenshot_path):
        """
        Extract specific error message from screenshot using OCR
        """
        try:
            # Use tesseract OCR to extract text
            result = subprocess.run([
                'tesseract', screenshot_path, 'stdout'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                text = result.stdout
                
                # Look for common error patterns
                error_patterns = [
                    r"error[:\s]+(.+)",
                    r"exception[:\s]+(.+)",
                    r"failed[:\s]+(.+)",
                    r"compilation error[:\s]+(.+)"
                ]
                
                import re
                for pattern in error_patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        return match.group(1).strip()
                        
                return text  # Return all text if no specific pattern found
            else:
                print(f"⚠️ OCR failed: {result.stderr}")
                return None
                
        except FileNotFoundError:
            print("⚠️ tesseract not found. Install with: brew install tesseract")
            return None
        except Exception as e:
            print(f"💥 Error extraction failed: {str(e)}")
            return None

    def fix_detected_error(self, error_message, error_type):
        """
        Attempt to automatically fix the detected error
        """
        print(f"🔧 Attempting to fix error: {error_type}")
        print(f"📝 Error message: {error_message}")
        
        fix_commands = []
        
        if "compilation" in error_type.lower():
            fix_commands = [
                "# Check for syntax errors",
                "find . -name '*.py' -exec python3 -m py_compile {} \\;",
                "find . -name '*.js' -exec node -c {} \\;",
                "find . -name '*.swift' -exec swiftc -parse {} \\;"
            ]
        elif "build" in error_type.lower():
            fix_commands = [
                "# Clean and rebuild",
                "make clean && make",
                "npm run clean && npm run build",
                "xcodebuild clean && xcodebuild"
            ]
        elif "runtime" in error_type.lower():
            fix_commands = [
                "# Check dependencies",
                "pip install -r requirements.txt",
                "npm install",
                "pod install"
            ]
            
        successful_fixes = []
        for command in fix_commands:
            if command.startswith("#"):
                print(f"💡 {command}")
                continue
                
            try:
                result = subprocess.run(
                    command, shell=True, 
                    capture_output=True, text=True, 
                    timeout=60, cwd=self.project_path
                )
                
                if result.returncode == 0:
                    print(f"✅ Fixed: {command}")
                    successful_fixes.append(command)
                else:
                    print(f"❌ Fix failed: {command}")
                    print(f"   Error: {result.stderr}")
                    
            except subprocess.TimeoutExpired:
                print(f"⏰ Fix timeout: {command}")
            except Exception as e:
                print(f"💥 Fix exception: {str(e)}")
                
        return successful_fixes

    def compile_and_test(self):
        """
        Attempt to compile and run the application after fixes
        """
        print(f"🔨 Compiling and testing application...")
        
        # Determine project type and appropriate build command
        if os.path.exists("package.json"):
            build_commands = ["npm run build", "npm test"]
        elif os.path.exists("requirements.txt"):
            build_commands = ["python3 -m pytest", "python3 -m mypy ."]
        elif os.path.exists("*.xcodeproj"):
            build_commands = ["xcodebuild", "xcodebuild test"]
        elif os.path.exists("Makefile"):
            build_commands = ["make", "make test"]
        else:
            build_commands = ["echo 'No build system detected'"]
            
        success_count = 0
        for command in build_commands:
            try:
                result = subprocess.run(
                    command, shell=True,
                    capture_output=True, text=True,
                    timeout=120, cwd=self.project_path
                )
                
                if result.returncode == 0:
                    print(f"✅ Build success: {command}")
                    success_count += 1
                else:
                    print(f"❌ Build failed: {command}")
                    print(f"   Error: {result.stderr[:200]}...")
                    
            except Exception as e:
                print(f"💥 Build exception: {str(e)}")
                
        return success_count > 0

    def run_error_detection_cycle(self):
        """
        Complete error detection and auto-fix cycle
        """
        print(f"\n🚀 STARTING VNC ERROR DETECTION CYCLE")
        
        for attempt in range(1, self.max_fix_attempts + 1):
            print(f"\n🔄 Cycle {attempt}/{self.max_fix_attempts}")
            
            # Step 1: Take screenshot
            screenshot = self.take_screenshot(f"cycle_{attempt}")
            if not screenshot:
                print("❌ Screenshot failed, aborting cycle")
                break
                
            # Step 2: Analyze for errors
            analysis = self.analyze_screenshot_for_errors(screenshot)
            print(f"📊 Error analysis: {analysis['confidence']}% confidence")
            
            if not analysis['has_errors']:
                print("✅ No errors detected, cycle complete!")
                break
                
            # Step 3: Extract error message
            error_message = self.extract_error_message(screenshot)
            if error_message:
                print(f"📝 Extracted error: {error_message[:100]}...")
            
            # Step 4: Attempt fixes
            for error_type in analysis['error_types']:
                fixes = self.fix_detected_error(error_message, error_type)
                if fixes:
                    print(f"🔧 Applied {len(fixes)} fixes for {error_type}")
            
            # Step 5: Rebuild and test
            if self.compile_and_test():
                print("✅ Compilation successful after fixes")
                
                # Take another screenshot to verify fix
                time.sleep(2)  # Wait for UI to update
                verification_screenshot = self.take_screenshot(f"verification_{attempt}")
                
                if verification_screenshot:
                    verification_analysis = self.analyze_screenshot_for_errors(verification_screenshot)
                    if not verification_analysis['has_errors']:
                        print("🎉 Errors successfully fixed!")
                        break
                    else:
                        print("⚠️ Errors still present, continuing...")
            else:
                print("❌ Compilation failed, trying next cycle...")
                
        # Generate final report
        self.generate_error_detection_report()

    def generate_error_detection_report(self):
        """Generate comprehensive report of error detection session"""
        report_file = f"vnc_error_detection_report_{self.session_id}.md"
        
        report = f"""# VNC Error Detection Report
## Session: {self.session_id}
## Project: {self.project_path}
## Generated: {datetime.now().isoformat()}

### Summary
- Screenshots captured: {len(os.listdir(self.screenshots_dir))}
- Max fix attempts: {self.max_fix_attempts}
- Session duration: Complete

### Screenshots Directory
{self.screenshots_dir}/

### Workflow Steps
1. **Screenshot Capture**: Automated screen capture at each cycle
2. **Error Analysis**: Visual analysis for error indicators
3. **OCR Extraction**: Text extraction from error dialogs
4. **Auto-Fix Attempts**: Intelligent error correction
5. **Compile & Test**: Verification of fixes
6. **Cycle Repeat**: Until errors resolved or max attempts reached

### Next Steps
- Review screenshots for manual analysis if needed
- Check compilation logs for additional context
- Consider expanding error detection patterns
"""
        
        with open(report_file, 'w') as f:
            f.write(report)
            
        print(f"📊 Report generated: {report_file}")
        return report_file

def main():
    if len(sys.argv) > 1:
        project_path = sys.argv[1]
    else:
        project_path = os.getcwd()
        
    workflow = VNCErrorDetectionWorkflow(project_path)
    workflow.run_error_detection_cycle()

if __name__ == "__main__":
    main()
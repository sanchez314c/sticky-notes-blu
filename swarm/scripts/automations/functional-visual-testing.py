#!/usr/bin/env python3
"""
FUNCTIONAL Visual Testing Implementation
Automatically captures screenshots and analyzes applications for errors
"""

import os
import sys
import time
import subprocess
import json
from datetime import datetime
from pathlib import Path

class FunctionalVisualTester:
    def __init__(self, session_id=None):
        self.session_id = session_id or datetime.now().strftime('%Y%m%d_%H%M%S')
        self.screenshots_dir = f"screenshots_{self.session_id}"
        self.logs_dir = f"logs"
        
        # Create directories
        os.makedirs(self.screenshots_dir, exist_ok=True)
        os.makedirs(self.logs_dir, exist_ok=True)
        
        self.log_file = f"{self.logs_dir}/visual_testing_{self.session_id}.log"
        self.results = []
        
        # Screenshot management - track current active screenshots
        self.active_screenshots = {
            'system_state': None,        # Current desktop/system state
            'app_launch': None,          # Most recent app launch state
            'error_state': None,         # Latest error screenshot (if any)
            'success_state': None,       # Latest successful operation
            'monitoring_latest': None,   # Most recent monitoring screenshot
        }
        self.max_historical_screenshots = 3  # Keep only 3 historical for navigation
        
        print(f"🖥️  FUNCTIONAL Visual Testing Initialized - Session: {self.session_id}")
        self.log("INIT", "Visual testing system started")

    def log(self, event, message):
        """Log events to file and console"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] [{event}] {message}"
        
        # Console output
        print(log_entry)
        
        # File output
        with open(self.log_file, 'a') as f:
            f.write(log_entry + '\n')

    def cleanup_old_screenshots(self, category, new_screenshot):
        """Clean up old screenshots for a specific category, keeping only what's needed"""
        if category in self.active_screenshots:
            old_screenshot = self.active_screenshots[category]
            if old_screenshot and old_screenshot != new_screenshot and os.path.exists(old_screenshot):
                try:
                    os.remove(old_screenshot)
                    self.log("CLEANUP", f"Deleted old screenshot: {os.path.basename(old_screenshot)}")
                except Exception as e:
                    self.log("ERROR", f"Failed to delete {old_screenshot}: {str(e)}")
        
        # Update active screenshot for this category
        self.active_screenshots[category] = new_screenshot
    
    def cleanup_historical_screenshots(self):
        """Keep only the most recent historical screenshots for navigation"""
        try:
            # Get all screenshots in directory
            all_screenshots = []
            for file in os.listdir(self.screenshots_dir):
                if file.endswith('.png'):
                    file_path = os.path.join(self.screenshots_dir, file)
                    # Skip active screenshots
                    if file_path not in self.active_screenshots.values():
                        all_screenshots.append((file_path, os.path.getctime(file_path)))
            
            # Sort by creation time (newest first)
            all_screenshots.sort(key=lambda x: x[1], reverse=True)
            
            # Remove old historical screenshots beyond the limit
            for i, (screenshot_path, _) in enumerate(all_screenshots):
                if i >= self.max_historical_screenshots:
                    try:
                        os.remove(screenshot_path)
                        self.log("CLEANUP", f"Deleted historical screenshot: {os.path.basename(screenshot_path)}")
                    except Exception as e:
                        self.log("ERROR", f"Failed to delete historical screenshot {screenshot_path}: {str(e)}")
                        
        except Exception as e:
            self.log("ERROR", f"Failed to cleanup historical screenshots: {str(e)}")

    def capture_screenshot(self, name, phase="unknown"):
        """Capture screenshot using available system tools with intelligent cleanup"""
        timestamp = datetime.now().strftime('%H%M%S')
        screenshot_path = f"{self.screenshots_dir}/{name}_{phase}_{timestamp}.png"
        
        try:
            # Try macOS screencapture first
            result = subprocess.run(['screencapture', '-x', screenshot_path], 
                                  capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0 and os.path.exists(screenshot_path):
                self.log("SCREENSHOT", f"Captured: {screenshot_path}")
                
                # Determine category and cleanup old screenshots
                category = self._determine_screenshot_category(phase)
                if category:
                    self.cleanup_old_screenshots(category, screenshot_path)
                
                # Cleanup historical screenshots periodically
                self.cleanup_historical_screenshots()
                
                return screenshot_path
            else:
                # Try Linux alternatives
                for cmd in [['scrot', screenshot_path], ['gnome-screenshot', '-f', screenshot_path]]:
                    try:
                        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
                        if result.returncode == 0 and os.path.exists(screenshot_path):
                            self.log("SCREENSHOT", f"Captured: {screenshot_path}")
                            
                            # Determine category and cleanup old screenshots
                            category = self._determine_screenshot_category(phase)
                            if category:
                                self.cleanup_old_screenshots(category, screenshot_path)
                            
                            # Cleanup historical screenshots periodically
                            self.cleanup_historical_screenshots()
                            
                            return screenshot_path
                    except FileNotFoundError:
                        continue
                
                self.log("ERROR", f"Failed to capture screenshot: {screenshot_path}")
                return None
                
        except Exception as e:
            self.log("ERROR", f"Screenshot capture failed: {str(e)}")
            return None
    
    def _determine_screenshot_category(self, phase):
        """Determine which category a screenshot belongs to for cleanup purposes"""
        phase_lower = phase.lower()
        
        if 'before' in phase_lower or 'desktop' in phase_lower or 'system' in phase_lower:
            return 'system_state'
        elif 'after_launch' in phase_lower or 'launch' in phase_lower:
            return 'app_launch'
        elif 'error' in phase_lower or 'crash' in phase_lower or 'fail' in phase_lower:
            return 'error_state'
        elif 'success' in phase_lower or 'complete' in phase_lower:
            return 'success_state'
        elif 'monitoring' in phase_lower:
            return 'monitoring_latest'
        else:
            return None  # Historical screenshot, will be managed by cleanup_historical_screenshots

    def launch_application(self, app_path):
        """Launch application and return process info"""
        try:
            if app_path.endswith('.app'):
                # macOS app bundle
                cmd = ['open', app_path]
                self.log("LAUNCH", f"Opening macOS app: {app_path}")
            elif app_path.endswith('.exe'):
                # Windows executable (if running under compatibility)
                cmd = [app_path]
                self.log("LAUNCH", f"Starting Windows exe: {app_path}")
            else:
                # Generic executable
                cmd = [app_path]
                self.log("LAUNCH", f"Starting executable: {app_path}")
            
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            self.log("SUCCESS", f"Launched {app_path} with PID: {process.pid}")
            return process
            
        except Exception as e:
            self.log("ERROR", f"Failed to launch {app_path}: {str(e)}")
            return None

    def analyze_screenshot(self, screenshot_path, app_name, phase):
        """Analyze screenshot for errors (placeholder for Claude integration)"""
        if not screenshot_path or not os.path.exists(screenshot_path):
            return None
            
        # Get file size for basic validation
        file_size = os.path.getsize(screenshot_path)
        
        analysis = {
            'screenshot': screenshot_path,
            'app_name': app_name,
            'phase': phase,
            'timestamp': datetime.now().isoformat(),
            'file_size': file_size,
            'status': 'captured'
        }
        
        # In a real implementation, this would use Claude's vision API
        # For now, we'll create a functional placeholder
        if file_size > 1000:  # Basic validation
            analysis['status'] = 'ready_for_analysis'
            analysis['notes'] = 'Screenshot captured successfully, ready for Claude vision analysis'
        else:
            analysis['status'] = 'error'
            analysis['notes'] = 'Screenshot too small, likely capture failed'
        
        self.log("ANALYSIS", f"Screenshot analyzed: {screenshot_path} ({file_size} bytes)")
        return analysis

    def test_application(self, app_path, test_duration=30):
        """Complete application testing workflow"""
        app_name = os.path.basename(app_path)
        self.log("TEST_START", f"Starting test for: {app_name}")
        
        results = {
            'app_path': app_path,
            'app_name': app_name,
            'test_duration': test_duration,
            'start_time': datetime.now().isoformat(),
            'screenshots': [],
            'analyses': [],
            'errors': []
        }
        
        # Capture before launch
        before_screenshot = self.capture_screenshot(app_name, "before_launch")
        if before_screenshot:
            analysis = self.analyze_screenshot(before_screenshot, app_name, "before_launch")
            if analysis:
                results['screenshots'].append(before_screenshot)
                results['analyses'].append(analysis)
        
        # Launch application
        process = self.launch_application(app_path)
        if not process:
            results['errors'].append("Failed to launch application")
            return results
        
        # Wait for app to initialize
        time.sleep(5)
        
        # Capture after launch
        after_screenshot = self.capture_screenshot(app_name, "after_launch")
        if after_screenshot:
            analysis = self.analyze_screenshot(after_screenshot, app_name, "after_launch")
            if analysis:
                results['screenshots'].append(after_screenshot)
                results['analyses'].append(analysis)
        
        # Monitor for specified duration
        end_time = time.time() + test_duration
        screenshot_count = 0
        
        while time.time() < end_time:
            # Check if process is still running
            poll = process.poll()
            if poll is not None:
                if poll != 0:
                    results['errors'].append(f"Application exited with code {poll}")
                break
            
            # Take periodic screenshots
            if time.time() % 10 < 1:  # Roughly every 10 seconds
                screenshot_count += 1
                monitor_screenshot = self.capture_screenshot(app_name, f"monitoring_{screenshot_count:02d}")
                if monitor_screenshot:
                    analysis = self.analyze_screenshot(monitor_screenshot, app_name, "monitoring")
                    if analysis:
                        results['screenshots'].append(monitor_screenshot)
                        results['analyses'].append(analysis)
            
            time.sleep(2)
        
        # Cleanup - terminate process if still running
        if process.poll() is None:
            try:
                process.terminate()
                process.wait(timeout=5)
                self.log("CLEANUP", f"Terminated {app_name}")
            except:
                process.kill()
                self.log("CLEANUP", f"Killed {app_name}")
        
        results['end_time'] = datetime.now().isoformat()
        results['total_screenshots'] = len(results['screenshots'])
        
        self.log("TEST_COMPLETE", f"Finished testing {app_name}: {len(results['screenshots'])} screenshots, {len(results['errors'])} errors")
        
        return results

    def test_directory(self, dist_dir):
        """Test all applications in a distribution directory"""
        self.log("SCAN_START", f"Scanning for applications in: {dist_dir}")
        
        if not os.path.exists(dist_dir):
            self.log("ERROR", f"Directory not found: {dist_dir}")
            return []
        
        # Find executable files
        app_extensions = ['.app', '.exe', '.AppImage', '.deb']
        applications = []
        
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                if any(file.endswith(ext) for ext in app_extensions):
                    app_path = os.path.join(root, file)
                    applications.append(app_path)
        
        self.log("SCAN_RESULT", f"Found {len(applications)} applications to test")
        
        # Test each application
        test_results = []
        for app_path in applications:
            self.log("TESTING", f"Testing: {app_path}")
            result = self.test_application(app_path)
            test_results.append(result)
            self.results.append(result)
        
        return test_results

    def generate_report(self):
        """Generate comprehensive testing report"""
        report_path = f"{self.logs_dir}/visual_testing_report_{self.session_id}.md"
        
        total_apps = len(self.results)
        total_screenshots = sum(len(r['screenshots']) for r in self.results)
        total_errors = sum(len(r['errors']) for r in self.results)
        
        report_content = f"""# 📸 Visual Testing Report
## Session: {self.session_id}
## Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

### Summary
- **Applications Tested**: {total_apps}
- **Screenshots Captured**: {total_screenshots}
- **Errors Detected**: {total_errors}

### Test Results
"""
        
        for result in self.results:
            report_content += f"""
#### {result['app_name']}
- **Path**: {result['app_path']}
- **Screenshots**: {len(result['screenshots'])}
- **Errors**: {len(result['errors'])}
- **Duration**: {result.get('test_duration', 'N/A')} seconds

"""
            if result['errors']:
                report_content += "**Errors Found:**\n"
                for error in result['errors']:
                    report_content += f"- {error}\n"
                report_content += "\n"
        
        report_content += f"""
### Screenshots Directory
All screenshots saved to: `{self.screenshots_dir}/`

### Next Steps
1. Review captured screenshots for visual errors
2. Analyze error patterns across applications
3. Generate fixes based on visual analysis
4. Rebuild and retest applications

---
*Generated by Functional Visual Testing System*
"""
        
        with open(report_path, 'w') as f:
            f.write(report_content)
        
        self.log("REPORT", f"Generated report: {report_path}")
        return report_path

def main():
    """Main execution function"""
    if len(sys.argv) < 2:
        print("Usage: python FUNCTIONAL-VISUAL-TESTING.py <command> [args]")
        print("Commands:")
        print("  test-app <path>     - Test specific application")
        print("  test-dist <dir>     - Test all apps in distribution directory")
        print("  demo                - Run demonstration")
        sys.exit(1)
    
    command = sys.argv[1]
    tester = FunctionalVisualTester()
    
    if command == "test-app" and len(sys.argv) > 2:
        app_path = sys.argv[2]
        result = tester.test_application(app_path)
        tester.results.append(result)
        
    elif command == "test-dist" and len(sys.argv) > 2:
        dist_dir = sys.argv[2]
        tester.test_directory(dist_dir)
        
    elif command == "demo":
        print("🎬 Running FUNCTIONAL Visual Testing Demo")
        # Create a demo test
        tester.capture_screenshot("demo_test", "demonstration")
        print("📸 Screenshot captured for demonstration")
        
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
    
    # Generate final report
    report_path = tester.generate_report()
    print(f"\n✅ Testing complete! Report: {report_path}")

if __name__ == "__main__":
    main()
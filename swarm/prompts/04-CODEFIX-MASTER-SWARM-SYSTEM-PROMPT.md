# 🔧 CodeFix Master + Swarm: Complete System Instructions
## AI-Driven Codebase Repair & Completion Methodology

*Created: August 24, 2025*  
*Purpose: Fix broken, incomplete, or problematic codebases using specialized AI swarm orchestration*

---

## 🎯 Your Role as CodeFix Master

When operating under this system, you are **CodeFix Master** - the AI repair coordinator that diagnoses, analyzes, and orchestrates specialized AI agents to fix any codebase issues. You maintain code quality standards while delegating specialized repair tasks to swarms.

**Core Responsibilities:**
- Analyze codebase health and identify all issues
- Coordinate parallel AI diagnostic swarms  
- Synthesize repair recommendations into action plans
- Execute systematic fixes with quality validation
- Ensure architectural integrity throughout repairs
- Generate comprehensive repair documentation

---

## 🔍 Diagnostic Swarm Deployment

### **Phase 1: Comprehensive Codebase Analysis (5 minutes)**

```bash
# ARCHITECTURE ANALYSIS AGENT
echo "ARCHITECTURE ANALYSIS: Analyze this codebase structure and identify architectural issues, anti-patterns, technical debt, and structural problems. Focus on: file organization, dependency management, separation of concerns, scalability issues, maintainability problems.
CODEBASE_PATH: [path_to_codebase]" | claude --model sonnet --dangerously-skip-permissions --print > architecture_analysis.txt &

# SECURITY VULNERABILITY AGENT  
echo "SECURITY AUDIT: Perform comprehensive security analysis of this codebase. Identify: authentication flaws, authorization issues, input validation problems, XSS vulnerabilities, SQL injection risks, secret exposure, dependency vulnerabilities.
CODEBASE_PATH: [path_to_codebase]" | claude --model sonnet --dangerously-skip-permissions --print > security_audit.txt &

# PERFORMANCE ANALYSIS AGENT
echo "PERFORMANCE AUDIT: Analyze this codebase for performance bottlenecks, memory leaks, inefficient algorithms, database query issues, loading problems, resource usage optimization opportunities.
CODEBASE_PATH: [path_to_codebase]" | claude --model sonnet --dangerously-skip-permissions --print > performance_analysis.txt &

# CODE QUALITY AGENT
echo "CODE QUALITY AUDIT: Review code quality issues including: syntax errors, logic bugs, code smells, documentation gaps, test coverage, naming conventions, code duplication, unused code.
CODEBASE_PATH: [path_to_codebase]" | claude --model sonnet --dangerously-skip-permissions --print > quality_analysis.txt &

# DEPENDENCY HEALTH AGENT
echo "DEPENDENCY AUDIT: Analyze all dependencies for: outdated packages, security vulnerabilities, compatibility issues, unused dependencies, license conflicts, update recommendations.
CODEBASE_PATH: [path_to_codebase]" | claude --model sonnet --dangerously-skip-permissions --print > dependency_audit.txt &

# FUNCTIONALITY COMPLETENESS AGENT
echo "FUNCTIONALITY AUDIT: Identify incomplete features, missing implementations, broken functionality, API endpoints that don't work, UI components that are non-functional, integration issues.
CODEBASE_PATH: [path_to_codebase]" | claude --model sonnet --dangerously-skip-permissions --print > functionality_audit.txt &

wait
```

### **Phase 2: Master Diagnosis Synthesis (3 minutes)**

```bash
# Combine all diagnostic outputs
cat *_analysis.txt *_audit.txt > combined_diagnostics.txt

# Generate comprehensive repair plan
echo "MASTER CODEFIX DIAGNOSIS: Analyze all diagnostic reports in 'combined_diagnostics.txt' and create a comprehensive codebase repair plan with:

1. CRITICAL ISSUES (must fix immediately)
   - Security vulnerabilities requiring immediate attention
   - Broken functionality preventing core operations
   - Architecture flaws causing system instability

2. HIGH PRIORITY ISSUES (fix next)
   - Performance bottlenecks affecting user experience  
   - Code quality issues impacting maintainability
   - Missing features for core functionality

3. MEDIUM PRIORITY ISSUES (fix when possible)
   - Technical debt and refactoring opportunities
   - Documentation gaps and code organization
   - Dependency updates and optimizations

4. LOW PRIORITY ISSUES (nice to have)
   - Code style improvements
   - Minor performance optimizations
   - Enhanced error handling

5. REPAIR STRATEGY
   - Recommended order of operations
   - Risk assessment for each repair
   - Testing strategy for validation
   - Rollback procedures if needed

Provide specific action items with file names, line numbers, and exact fixes needed." | claude --model sonnet --dangerously-skip-permissions --print > MASTER_REPAIR_PLAN.md
```

---

## ⚡ Specialized Repair Swarms

### **Critical Security Fix Swarm**

```bash
# AUTHENTICATION REPAIR AGENT
echo "AUTHENTICATION FIX: Fix all authentication vulnerabilities identified in the security audit. Focus on: secure password handling, session management, JWT implementation, multi-factor authentication, rate limiting.
SECURITY_ISSUES: [from security_audit.txt]
CODEBASE_PATH: [path]" | claude --model sonnet --dangerously-skip-permissions --print > auth_fixes.txt &

# INPUT VALIDATION REPAIR AGENT  
echo "INPUT VALIDATION FIX: Implement proper input validation and sanitization for all user inputs. Fix XSS vulnerabilities, SQL injection risks, command injection issues.
SECURITY_ISSUES: [from security_audit.txt]  
CODEBASE_PATH: [path]" | claude --model sonnet --dangerously-skip-permissions --print > validation_fixes.txt &

# SECRET MANAGEMENT REPAIR AGENT
echo "SECRET MANAGEMENT FIX: Secure all exposed secrets, API keys, passwords. Implement proper environment variable usage, secret rotation, encrypted storage.
SECURITY_ISSUES: [from security_audit.txt]
CODEBASE_PATH: [path]" | claude --model sonnet --dangerously-skip-permissions --print > secret_fixes.txt &

wait
```

### **Performance Optimization Swarm**

```bash
# DATABASE OPTIMIZATION AGENT
echo "DATABASE OPTIMIZATION: Fix all database performance issues. Optimize queries, add proper indexing, implement connection pooling, fix N+1 problems.
PERFORMANCE_ISSUES: [from performance_analysis.txt]
CODEBASE_PATH: [path]" | claude --model sonnet --dangerously-skip-permissions --print > db_optimizations.txt &

# FRONTEND PERFORMANCE AGENT
echo "FRONTEND OPTIMIZATION: Fix frontend performance issues. Optimize assets, implement lazy loading, reduce bundle size, improve rendering performance.
PERFORMANCE_ISSUES: [from performance_analysis.txt]
CODEBASE_PATH: [path]" | claude --model sonnet --dangerously-skip-permissions --print > frontend_optimizations.txt &

# CACHING IMPLEMENTATION AGENT
echo "CACHING STRATEGY: Implement comprehensive caching strategy. Add Redis/Memcached, browser caching, CDN optimization, database query caching.
PERFORMANCE_ISSUES: [from performance_analysis.txt]  
CODEBASE_PATH: [path]" | claude --model sonnet --dangerously-skip-permissions --print > caching_strategy.txt &

wait
```

### **Functionality Completion Swarm**

```bash
# MISSING FEATURES AGENT
echo "MISSING FEATURES: Implement all incomplete features identified in functionality audit. Complete half-built components, finish API endpoints, implement missing business logic.
FUNCTIONALITY_GAPS: [from functionality_audit.txt]
CODEBASE_PATH: [path]" | claude --model sonnet --dangerously-skip-permissions --print > feature_completions.txt &

# API REPAIR AGENT  
echo "API REPAIR: Fix all broken API endpoints, implement proper error handling, add validation, ensure consistent response formats, fix CORS issues.
API_ISSUES: [from functionality_audit.txt]
CODEBASE_PATH: [path]" | claude --model sonnet --dangerously-skip-permissions --print > api_repairs.txt &

# UI/UX FIX AGENT
echo "UI/UX REPAIR: Fix all broken UI components, implement responsive design, fix accessibility issues, improve user experience flows.
UI_ISSUES: [from functionality_audit.txt]
CODEBASE_PATH: [path]" | claude --model sonnet --dangerously-skip-permissions --print > ui_repairs.txt &

wait
```

---

## 🧪 Quality Validation Swarm

### **Real-Time Repair Validation**
After each fix, validate with specialized review agents:

```bash
# REPAIR VALIDATION AGENT
validate_repair() {
    local repair_files="$1"
    
    echo "REPAIR VALIDATION: Test and validate these code repairs. Verify fixes work correctly, don't break existing functionality, follow best practices, maintain performance.
    REPAIR_FILES: $repair_files
    RUN_TESTS: true
    CHECK_INTEGRATION: true" | claude --model sonnet --dangerously-skip-permissions --print > repair_validation.txt &
    
    echo "REGRESSION TEST: Ensure repairs don't introduce new bugs or break existing functionality. Run comprehensive test suite and report any regressions.
    REPAIR_FILES: $repair_files" | claude --model sonnet --dangerously-skip-permissions --print > regression_test.txt &
    
    wait
}
```

---

## 🎯 Execution Workflow

### **Step 1: Rapid Diagnosis (8 minutes)**
```bash
# Deploy all 6 diagnostic agents simultaneously
./diagnose_codebase.sh /path/to/broken/codebase
```

### **Step 2: Prioritized Repair (20-60 minutes depending on issues)**
```bash
# Execute repair swarms in priority order:
./repair_critical_security.sh    # 5-10 minutes
./repair_performance.sh          # 10-15 minutes  
./repair_functionality.sh        # 15-30 minutes
./validate_all_repairs.sh        # 5-10 minutes
```

### **Step 3: Documentation & Handoff (5 minutes)**
```bash
# Generate repair documentation
echo "REPAIR DOCUMENTATION: Document all repairs made, changes implemented, testing performed, and maintenance recommendations for the fixed codebase." | claude --model sonnet --dangerously-skip-permissions --print > REPAIR_DOCUMENTATION.md
```

---

## 🚀 Advanced Repair Strategies

### **Recursive Sub-Agent Deployment**
Each repair agent can spawn specialized sub-agents:

```bash
# SECURITY AGENT spawns sub-specialists:
echo "OAuth Implementation Sub-Agent: Fix OAuth 2.0 security issues" | claude ... &
echo "CSRF Protection Sub-Agent: Implement CSRF tokens everywhere" | claude ... &  
echo "Rate Limiting Sub-Agent: Add intelligent rate limiting" | claude ... &
```

### **Competitive Repair Approaches**
```bash
# Deploy multiple agents with different approaches:
echo "Performance Agent A: Fix with caching strategy" | claude ... &
echo "Performance Agent B: Fix with database optimization" | claude ... &
echo "Performance Agent C: Fix with frontend optimization" | claude ... &

# Meta-agent chooses best approach
echo "Performance Synthesizer: Choose best performance fixes from A, B, C" | claude ... &
```

### **Incremental Repair Validation**
```bash
# Test after every major repair:
repair_and_validate() {
    apply_repair "$1"
    run_tests
    if tests_pass; then commit_repair; else rollback_repair; fi
}
```

# Complete Multi-Platform Electron Build System

## AMMENDMENTS:

Run and Run from source scripts for Windows, Mac and Linux should be created and stored in the apps /scripts folder. When running build-compile-dist.sh be sure to purge the contents of the /dist folder. ### BUT CHECK FIRST AND MAKE SURE IT DOES NOT HOLD CRITICAL ELECTRON FILES ### And look for and use icon from within /resources folder.

This build system provides comprehensive support for building Electron applications for macOS, Windows, and Linux with all major installer formats.

## Build System Requirements

1. **Remove existing build scripts**: Delete any existing build, compile, or dist scripts
2. **Create new scripts**: Implement all scripts below with proper permissions
3. **Platform coverage**: Full support for macOS (Intel + ARM), Windows (x64 + x86), Linux (x64)
4. **Installer types**: All major formats including .msi, .exe, .deb, .rpm, .AppImage, .dmg, etc.

## Required /dist Folder Structure

After running `compile-build-dist.sh`, the `/dist` folder should contain:

```
dist/
├── linux-unpacked/          # Unpacked Linux application files
├── mac/                     # macOS Intel build
│   └── [AppName].app        # Intel .app bundle
├── mac-arm64/              # macOS ARM64 build
│   └── [AppName].app        # ARM64 .app bundle
├── win-unpacked/           # Unpacked Windows application files
├── win-ia32-unpacked/      # Unpacked Windows 32-bit files
├── builder-debug.yml       # Electron-builder debug info
├── latest-linux.yml        # Linux update info
├── latest-mac.yml          # macOS update info
├── latest.yml              # General update info
├── [AppName] Setup [version].exe              # Windows NSIS installer
├── [AppName] Setup [version].exe.blockmap     # Windows blockmap
├── [AppName] Setup [version].msi              # Windows MSI installer
├── [AppName]-[version]-arm64.dmg              # macOS ARM64 DMG
├── [AppName]-[version]-arm64.dmg.blockmap     # macOS ARM64 blockmap
├── [AppName]-[version]-win.zip                # Windows portable
├── [AppName]-[version]-ia32-win.zip           # Windows 32-bit portable
├── [AppName]-[version].AppImage               # Linux AppImage
├── [AppName]-[version].deb                    # Debian/Ubuntu package
├── [AppName]-[version].rpm                    # RedHat/Fedora package
├── [AppName]-[version].snap                   # Snap package
├── [AppName]-[version].dmg                    # macOS Intel DMG
├── [AppName]-[version].dmg.blockmap           # macOS Intel blockmap
└── [AppName]-[version].zip                    # macOS portable
```

## Script 1: compile-build-dist.sh
Main build script for all platforms:

```bash
#!/bin/bash

# Complete Multi-Platform Build Script
# Builds for macOS, Windows, and Linux with all installer types

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✔${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] ℹ${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to display help
show_help() {
    echo "Complete Multi-Platform Build Script"
    echo ""
    echo "Usage: ./compile-build-dist.sh [options]"
    echo ""
    echo "Options:"
    echo "  --no-clean         Skip cleaning build artifacts"
    echo "  --platform PLAT    Build for specific platform (mac, win, linux, all)"
    echo "  --arch ARCH        Build for specific architecture (x64, ia32, arm64, all)"
    echo "  --quick            Quick build (single platform only)"
    echo "  --help             Display this help message"
    echo ""
    echo "Examples:"
    echo "  ./compile-build-dist.sh                    # Full build for all platforms"
    echo "  ./compile-build-dist.sh --platform win     # Windows only"
    echo "  ./compile-build-dist.sh --quick            # Quick build for current platform"
    echo "  ./compile-build-dist.sh --no-clean         # Build without cleaning first"
}

# Parse command line arguments
NO_CLEAN=false
PLATFORM="all"
ARCH="all"
QUICK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-clean)
            NO_CLEAN=true
            shift
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --arch)
            ARCH="$2"
            shift 2
            ;;
        --quick)
            QUICK=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check for required tools
print_status "Checking requirements..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check for optional tools for better builds
if command_exists wine; then
    print_info "Wine detected - Windows builds will include better signatures"
fi

if command_exists docker; then
    print_info "Docker detected - Linux builds will be more compatible"
fi

print_success "All requirements met"

# Step 1: Clean everything if not skipped
if [ "$NO_CLEAN" = false ]; then
    print_status "🧹 Purging all existing builds..."
    rm -rf dist/
    rm -rf build/
    rm -rf node_modules/.cache/
    rm -rf out/
    print_success "All build artifacts purged"
fi

# Step 2: Install/update dependencies
print_status "📦 Installing/updating dependencies..."
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Install electron-builder if not present
if ! npm list electron-builder >/dev/null 2>&1; then
    print_status "Installing electron-builder..."
    npm install --save-dev electron-builder
fi

print_success "Dependencies ready"

# Step 3: Determine build targets
print_status "🎯 Determining build targets..."
BUILD_CMD="npm run dist"

if [ "$QUICK" = true ]; then
    print_info "Quick build mode - building for current platform only"
    BUILD_CMD="npm run dist:current"
elif [ "$PLATFORM" != "all" ]; then
    case $PLATFORM in
        mac)
            BUILD_CMD="npm run dist:mac"
            print_info "Building for macOS only"
            ;;
        win)
            BUILD_CMD="npm run dist:win"
            print_info "Building for Windows only"
            ;;
        linux)
            BUILD_CMD="npm run dist:linux"
            print_info "Building for Linux only"
            ;;
        *)
            print_error "Invalid platform: $PLATFORM"
            exit 1
            ;;
    esac
else
    print_info "Building for all platforms"
fi

# Step 4: Build all platform binaries and packages
print_status "🏗️ Building platform binaries and packages..."
print_status "Targets: macOS (Intel + ARM), Windows (x64 + x86), Linux (x64)"
print_status "Installers: .dmg, .exe, .msi, .deb, .rpm, .AppImage, .snap"

# Run the build
$BUILD_CMD
BUILD_RESULT=$?

if [ $BUILD_RESULT -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

print_success "All platform builds completed successfully"

# Step 5: Generate additional installer types if needed
if [ "$PLATFORM" = "all" ] || [ "$PLATFORM" = "win" ]; then
    if [ -f "dist/*.exe" ] && [ ! -f "dist/*.msi" ]; then
        print_status "Generating MSI installer..."
        npm run dist:win:msi 2>/dev/null || print_warning "MSI generation requires additional setup"
    fi
fi

# Step 6: Display build results
print_status "📋 Build Results Summary:"
echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"

if [ -d "dist" ]; then
    # Count files by type
    MAC_COUNT=$(find dist -name "*.dmg" -o -name "*.zip" | grep -E "(mac|darwin)" | wc -l)
    WIN_COUNT=$(find dist -name "*.exe" -o -name "*.msi" -o -name "*-win.zip" | wc -l)
    LINUX_COUNT=$(find dist -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.snap" | wc -l)
    
    print_info "📊 Build Statistics:"
    echo "   macOS packages: $MAC_COUNT"
    echo "   Windows packages: $WIN_COUNT"
    echo "   Linux packages: $LINUX_COUNT"
    echo ""
    
    # macOS builds
    if [ $MAC_COUNT -gt 0 ]; then
        print_success "🍎 macOS Builds:"
        [ -d "dist/mac" ] && echo "   ✓ Intel: dist/mac/*.app"
        [ -d "dist/mac-arm64" ] && echo "   ✓ ARM64: dist/mac-arm64/*.app"
        find dist -name "*.dmg" -type f | while read -r dmg; do
            size=$(ls -lh "$dmg" | awk '{print $5}')
            echo "   ✓ DMG: $(basename "$dmg") ($size)"
        done
        echo ""
    fi
    
    # Windows builds
    if [ $WIN_COUNT -gt 0 ]; then
        print_success "🪟 Windows Builds:"
        [ -d "dist/win-unpacked" ] && echo "   ✓ x64 Unpacked: dist/win-unpacked/"
        [ -d "dist/win-ia32-unpacked" ] && echo "   ✓ x86 Unpacked: dist/win-ia32-unpacked/"
        find dist -name "*.exe" -type f | while read -r exe; do
            size=$(ls -lh "$exe" | awk '{print $5}')
            echo "   ✓ EXE: $(basename "$exe") ($size)"
        done
        find dist -name "*.msi" -type f | while read -r msi; do
            size=$(ls -lh "$msi" | awk '{print $5}')
            echo "   ✓ MSI: $(basename "$msi") ($size)"
        done
        find dist -name "*-win.zip" -type f | while read -r zip; do
            size=$(ls -lh "$zip" | awk '{print $5}')
            echo "   ✓ Portable: $(basename "$zip") ($size)"
        done
        echo ""
    fi
    
    # Linux builds
    if [ $LINUX_COUNT -gt 0 ]; then
        print_success "🐧 Linux Builds:"
        [ -d "dist/linux-unpacked" ] && echo "   ✓ Unpacked: dist/linux-unpacked/"
        find dist -name "*.AppImage" -type f | while read -r app; do
            size=$(ls -lh "$app" | awk '{print $5}')
            echo "   ✓ AppImage: $(basename "$app") ($size)"
        done
        find dist -name "*.deb" -type f | while read -r deb; do
            size=$(ls -lh "$deb" | awk '{print $5}')
            echo "   ✓ DEB: $(basename "$deb") ($size)"
        done
        find dist -name "*.rpm" -type f | while read -r rpm; do
            size=$(ls -lh "$rpm" | awk '{print $5}')
            echo "   ✓ RPM: $(basename "$rpm") ($size)"
        done
        find dist -name "*.snap" -type f | while read -r snap; do
            size=$(ls -lh "$snap" | awk '{print $5}')
            echo "   ✓ Snap: $(basename "$snap") ($size)"
        done
        echo ""
    fi
    
    # Auto-update files
    print_info "🔄 Auto-update files:"
    for yml in dist/*.yml; do
        if [ -f "$yml" ]; then
            echo "   ✓ $(basename "$yml")"
        fi
    done
else
    print_warning "No dist directory found. Build may have failed."
fi

echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
print_success "🎉 Complete build process finished!"
print_status "📁 All binaries and packages are in: ./dist/"
print_status ""
print_info "To run the application:"
print_info "  macOS:   ./run-macos-source.sh (dev) or ./run-macos.sh (binary)"
print_info "  Windows: run-windows-source.bat (dev) or run-windows.bat (binary)"
print_info "  Linux:   ./run-linux-source.sh (dev) or ./run-linux.sh (binary)"
```

## Script 2: run-macos-source.sh
Run from source on macOS:

```bash
#!/bin/bash

# Run from Source on macOS (Development Mode)
# Launches the app directly from source code using Electron

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✔${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_status "🚀 Starting application from source (macOS)..."

# Check if we're on macOS
if [ "$(uname)" != "Darwin" ]; then
    print_error "This script is designed for macOS only"
    print_status "Use run-linux-source.sh for Linux or run-windows-source.bat for Windows"
    exit 1
fi

# Check for required tools
if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
    print_success "Dependencies installed"
fi

# Launch the app from source
print_status "Launching application from source code..."
print_status "Press Ctrl+C to stop the application"
echo ""

# Run the app in development mode
npm start

echo ""
print_success "Application session ended"
```

## Script 3: run-macos.sh
Run compiled binary on macOS:

```bash
#!/bin/bash

# Run Compiled Binary on macOS
# Launches the compiled macOS app from dist folder

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✔${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
}

print_status "🚀 Launching compiled application (macOS)..."

# Check if we're on macOS
if [ "$(uname)" != "Darwin" ]; then
    print_error "This script is designed for macOS only"
    print_status "For other platforms:"
    print_status "  Windows: Use run-windows.bat"
    print_status "  Linux: Use ./run-linux.sh"
    exit 1
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    print_error "No dist/ directory found. Please run ./compile-build-dist.sh first."
    exit 1
fi

# Detect system architecture
ARCH=$(uname -m)
APP_PATH=""

# Choose appropriate build based on architecture
if [ "$ARCH" = "arm64" ]; then
    print_status "Detected Apple Silicon Mac (ARM64)"
    # Look for ARM version first
    if [ -d "dist/mac-arm64" ]; then
        APP_PATH=$(find dist/mac-arm64 -name "*.app" -type d | head -n 1)
    fi
    # Fall back to universal or Intel build
    if [ -z "$APP_PATH" ] && [ -d "dist/mac" ]; then
        APP_PATH=$(find dist/mac -name "*.app" -type d | head -n 1)
        print_warning "ARM64 build not found, using Intel build with Rosetta"
    fi
else
    print_status "Detected Intel Mac (x64)"
    # Look for Intel version
    if [ -d "dist/mac" ]; then
        APP_PATH=$(find dist/mac -name "*.app" -type d | head -n 1)
    fi
fi

# If still no app found, look anywhere in dist
if [ -z "$APP_PATH" ]; then
    APP_PATH=$(find dist -name "*.app" -type d | head -n 1)
fi

# Launch the app if found
if [ -n "$APP_PATH" ] && [ -d "$APP_PATH" ]; then
    print_success "Found application: $(basename "$APP_PATH")"
    print_status "Launching..."
    
    # Launch the app
    open "$APP_PATH"
    
    print_success "Application launched successfully!"
    print_status "The app is now running"
else
    print_error "Could not find .app bundle in dist/ directory"
    print_warning "Available files in dist/:"
    
    if [ -d "dist" ]; then
        ls -la dist/ | head -20
    fi
    
    print_status ""
    print_status "To build the app first, run:"
    print_status "  ./compile-build-dist.sh"
    
    exit 1
fi
```

## Script 4: run-windows-source.bat
Run from source on Windows:

```batch
@echo off
setlocal enabledelayedexpansion

REM Run from Source on Windows (Development Mode)
REM Launches the app directly from source code using Electron

REM Set colors
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

REM Get script directory
cd /d "%~dp0"

echo %BLUE%[%TIME%]%NC% Starting application from source (Windows)...

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[%TIME%] X%NC% Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[%TIME%] X%NC% npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo %RED%[%TIME%] X%NC% package.json not found. Make sure you're in the project root directory.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo %BLUE%[%TIME%]%NC% Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo %RED%[%TIME%] X%NC% Failed to install dependencies
        pause
        exit /b 1
    )
    echo %GREEN%[%TIME%] OK%NC% Dependencies installed
)

REM Launch the app from source
echo %BLUE%[%TIME%]%NC% Launching application from source code...
echo Press Ctrl+C to stop the application
echo.

REM Run the app in development mode
call npm start

echo.
echo %GREEN%[%TIME%] OK%NC% Application session ended
pause
```

## Script 5: run-windows.bat
Run compiled binary on Windows:

```batch
@echo off
setlocal enabledelayedexpansion

REM Run Compiled Binary on Windows
REM Launches the compiled Windows app from dist folder

REM Set colors
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

REM Get script directory
cd /d "%~dp0"

echo %BLUE%[%TIME%]%NC% Launching compiled application (Windows)...

REM Check if dist directory exists
if not exist "dist" (
    echo %RED%[%TIME%] X%NC% No dist/ directory found. Please run compile-build-dist.sh first.
    echo.
    echo Build the application first using:
    echo   - Git Bash: ./compile-build-dist.sh
    echo   - WSL: ./compile-build-dist.sh
    echo   - PowerShell with WSL: wsl ./compile-build-dist.sh
    pause
    exit /b 1
)

REM Find the executable
set "APP_PATH="

REM Check for unpacked executable first (faster launch)
if exist "dist\win-unpacked\*.exe" (
    for %%F in (dist\win-unpacked\*.exe) do (
        set "APP_PATH=%%F"
        echo %BLUE%[%TIME%]%NC% Found unpacked executable: %%~nxF
        goto :found
    )
)

REM Check for installer
if exist "dist\*.exe" (
    for %%F in (dist\*.exe) do (
        REM Skip blockmap files
        echo %%F | findstr /C:".blockmap" >nul
        if errorlevel 1 (
            set "APP_PATH=%%F"
            echo %YELLOW%[%TIME%] !%NC% Found installer: %%~nxF
            echo %YELLOW%[%TIME%] !%NC% Note: This will install the application
            goto :found
        )
    )
)

REM No executable found
echo %RED%[%TIME%] X%NC% Could not find executable in dist/ directory
echo.
echo %YELLOW%[%TIME%] !%NC% Available files in dist/:
dir dist /b
echo.
echo To build the app first, run:
echo   - Git Bash: ./compile-build-dist.sh
echo   - WSL: ./compile-build-dist.sh
pause
exit /b 1

:found
REM Launch the application
echo %GREEN%[%TIME%] OK%NC% Launching application...
start "" "!APP_PATH!"

echo %GREEN%[%TIME%] OK%NC% Application launched successfully!
echo The app is now running
pause
```

## Script 6: run-linux-source.sh
Run from source on Linux:

```bash
#!/bin/bash

# Run from Source on Linux (Development Mode)
# Launches the app directly from source code using Electron

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✔${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_status "🚀 Starting application from source (Linux)..."

# Check if we're on Linux
if [ "$(uname)" != "Linux" ]; then
    print_error "This script is designed for Linux only"
    print_status "Use run-macos-source.sh for macOS or run-windows-source.bat for Windows"
    exit 1
fi

# Check for required tools
if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    print_status "Install with: sudo apt install nodejs (Debian/Ubuntu)"
    print_status "           or: sudo dnf install nodejs (Fedora)"
    print_status "           or: sudo pacman -S nodejs (Arch)"
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    print_status "Install with: sudo apt install npm (Debian/Ubuntu)"
    print_status "           or: sudo dnf install npm (Fedora)"
    print_status "           or: sudo pacman -S npm (Arch)"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
    print_success "Dependencies installed"
fi

# Set electron flags for better Linux compatibility
export ELECTRON_FORCE_WINDOW_MENU_BAR=1
export ELECTRON_TRASH=gio

# Launch the app from source
print_status "Launching application from source code..."
print_status "Press Ctrl+C to stop the application"
echo ""

# Run the app in development mode
npm start

echo ""
print_success "Application session ended"
```

## Script 7: run-linux.sh
Run compiled binary on Linux:

```bash
#!/bin/bash

# Run Compiled Binary on Linux
# Launches the compiled Linux app from dist folder

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✔${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] ℹ${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_status "🚀 Launching compiled application (Linux)..."

# Check if we're on Linux
if [ "$(uname)" != "Linux" ]; then
    print_error "This script is designed for Linux only"
    print_status "For other platforms:"
    print_status "  macOS: Use ./run-macos.sh"
    print_status "  Windows: Use run-windows.bat"
    exit 1
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    print_error "No dist/ directory found. Please run ./compile-build-dist.sh first."
    exit 1
fi

# Function to launch different package types
launch_appimage() {
    local appimage="$1"
    
    # Make sure it's executable
    chmod +x "$appimage"
    
    # Check if we need to extract and run
    if [ -z "$DISPLAY" ]; then
        print_error "No display detected. Cannot run GUI application."
        exit 1
    fi
    
    print_status "Launching AppImage..."
    "$appimage" &
    print_success "AppImage launched successfully!"
}

launch_unpacked() {
    local exec_path="$1"
    
    # Make sure it's executable
    chmod +x "$exec_path"
    
    print_status "Launching unpacked application..."
    "$exec_path" &
    print_success "Application launched successfully!"
}

# Look for application in order of preference
APP_FOUND=false

# 1. Try AppImage first (most portable)
if [ -f dist/*.AppImage ]; then
    for appimage in dist/*.AppImage; do
        if [ -f "$appimage" ]; then
            print_info "Found AppImage: $(basename "$appimage")"
            launch_appimage "$appimage"
            APP_FOUND=true
            break
        fi
    done
fi

# 2. Try unpacked version
if [ "$APP_FOUND" = false ] && [ -d "dist/linux-unpacked" ]; then
    # Find the main executable
    EXEC_NAME=$(grep -l '"name"' package.json | xargs grep '"name"' | cut -d'"' -f4 | head -1)
    
    if [ -z "$EXEC_NAME" ]; then
        # Try to find any executable
        EXEC_PATH=$(find dist/linux-unpacked -type f -executable | grep -v ".so" | head -1)
    else
        EXEC_PATH="dist/linux-unpacked/$EXEC_NAME"
    fi
    
    if [ -f "$EXEC_PATH" ]; then
        print_info "Found unpacked executable: $(basename "$EXEC_PATH")"
        launch_unpacked "$EXEC_PATH"
        APP_FOUND=true
    fi
fi

# 3. Check for distribution packages
if [ "$APP_FOUND" = false ]; then
    print_warning "No runnable binary found. Found these packages instead:"
    
    if ls dist/*.deb 2>/dev/null; then
        for deb in dist/*.deb; do
            print_info "DEB package: $(basename "$deb")"
            print_info "  Install with: sudo dpkg -i $deb"
        done
    fi
    
    if ls dist/*.rpm 2>/dev/null; then
        for rpm in dist/*.rpm; do
            print_info "RPM package: $(basename "$rpm")"
            print_info "  Install with: sudo rpm -i $rpm"
        done
    fi
    
    if ls dist/*.snap 2>/dev/null; then
        for snap in dist/*.snap; do
            print_info "Snap package: $(basename "$snap")"
            print_info "  Install with: sudo snap install --dangerous $snap"
        done
    fi
    
    echo ""
    print_status "Install one of these packages to run the application system-wide"
    exit 1
fi

if [ "$APP_FOUND" = false ]; then
    print_error "Could not find any Linux binary in dist/ directory"
    print_warning "Available files in dist/:"
    
    if [ -d "dist" ]; then
        ls -la dist/ | head -20
    fi
    
    print_status ""
    print_status "To build the app first, run:"
    print_status "  ./compile-build-dist.sh"
    
    exit 1
fi

print_status "The application is running in the background"
print_status "Check your desktop or dock to interact with it"
```

## Package.json Configuration

Add these scripts and build configuration to your package.json:

```json
{
  "name": "your-app-name",
  "version": "1.0.0",
  "description": "Your application description",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dist": "electron-builder --mac --win --linux",
    "dist:current": "electron-builder",
    "dist:mac": "electron-builder --mac",
    "dist:win": "electron-builder --win",
    "dist:win:msi": "electron-builder --win --config.win.target=msi",
    "dist:linux": "electron-builder --linux",
    "pack": "electron-builder --dir",
    "postinstall": "electron-builder install-app-deps"
  },
  "build": {
    "appId": "com.yourcompany.yourapp",
    "productName": "YourAppName",
    "copyright": "Copyright © 2024 ${author}",
    "directories": {
      "output": "dist",
      "buildResources": "build-resources"
    },
    "files": [
      "**/*",
      "!**/*.ts",
      "!*.code-workspace",
      "!LICENSE.md",
      "!package-lock.json",
      "!yarn.lock",
      "!pnpm-lock.yaml",
      "!.git",
      "!.vscode",
      "!node_modules/.cache",
      "!dist"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "icon": "build-resources/icon.icns",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build-resources/entitlements.mac.plist",
      "entitlementsInherit": "build-resources/entitlements.mac.plist",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        },
        {
          "target": "zip",
          "arch": ["x64", "arm64"]
        }
      ]
    },
    "dmg": {
      "contents": [
        {
          "x": 410,
          "y": 150,
          "type": "link",
          "path": "/Applications"
        },
        {
          "x": 130,
          "y": 150,
          "type": "file"
        }
      ]
    },
    "win": {
      "icon": "build-resources/icon.ico",
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        },
        {
          "target": "msi",
          "arch": ["x64", "ia32"]
        },
        {
          "target": "zip",
          "arch": ["x64", "ia32"]
        }
      ]
    },
    "nsis": {
      "oneClick": false,
      "installerIcon": "build-resources/icon.ico",
      "uninstallerIcon": "build-resources/icon.ico",
      "installerHeaderIcon": "build-resources/icon.ico",
      "allowToChangeInstallationDirectory": true,
      "perMachine": false,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "YourAppName"
    },
    "msi": {
      "oneClick": false,
      "perMachine": false,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "upgradeCode": "YOUR-UNIQUE-GUID-HERE"
    },
    "linux": {
      "icon": "build-resources/icons",
      "category": "Utility",
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        },
        {
          "target": "deb",
          "arch": ["x64"]
        },
        {
          "target": "rpm",
          "arch": ["x64"]
        },
        {
          "target": "snap",
          "arch": ["x64"]
        }
      ],
      "desktop": {
        "StartupNotify": "true",
        "Encoding": "UTF-8",
        "Icon": "yourapp",
        "Type": "Application",
        "Categories": "Utility;"
      }
    },
    "deb": {
      "depends": [
        "libgtk-3-0",
        "libnotify4",
        "libnss3",
        "libxss1",
        "libxtst6",
        "xdg-utils",
        "libatspi2.0-0",
        "libuuid1",
        "libsecret-1-0"
      ]
    },
    "rpm": {
      "depends": [
        "gtk3",
        "libnotify",
        "nss",
        "libXScrnSaver",
        "libXtst",
        "xdg-utils",
        "at-spi2-core",
        "libuuid",
        "libsecret"
      ]
    },
    "snap": {
      "grade": "stable",
      "summary": "Your app summary"
    },
    "appImage": {
      "systemIntegration": "ask"
    },
    "publish": [
      {
        "provider": "github",
        "owner": "your-github-username",
        "repo": "your-repo-name"
      }
    ]
  },
  "devDependencies": {
    "electron": "^27.0.0",
    "electron-builder": "^24.0.0"
  }
}
```

## Setting Up Icons and Resources

Create a `build-resources` directory with the following structure:

```
build-resources/
├── icon.icns           # macOS icon (1024x1024)
├── icon.ico            # Windows icon (256x256)
├── icons/              # Linux icons
│   ├── 16x16.png
│   ├── 32x32.png
│   ├── 48x48.png
│   ├── 64x64.png
│   ├── 128x128.png
│   ├── 256x256.png
│   └── 512x512.png
└── entitlements.mac.plist  # macOS entitlements
```

## macOS Entitlements File (entitlements.mac.plist)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
</dict>
</plist>
```

## Final Setup Steps

1. **Set executable permissions** for all shell scripts:
```bash
chmod +x compile-build-dist.sh
chmod +x run-macos-source.sh
chmod +x run-macos.sh
chmod +x run-linux-source.sh
chmod +x run-linux.sh
```

2. **Install required dependencies**:
```bash
npm install --save-dev electron electron-builder
```

3. **Create icon files** in the `build-resources` directory

4. **Test the build system**:
```bash
# Quick test for current platform
./compile-build-dist.sh --quick

# Full multi-platform build
./compile-build-dist.sh
```

## Additional Notes

- **Windows MSI**: Requires WiX Toolset installed on Windows for MSI generation
- **Linux Snap**: Requires snapcraft installed for snap package creation
- **Code Signing**: Add certificates for production releases
- **Auto-Update**: Configure GitHub releases or other update servers
- **CI/CD**: These scripts work with GitHub Actions, CircleCI, Travis CI, etc.

This complete build system provides:
- ✅ All platform support (macOS Intel/ARM, Windows x64/x86, Linux x64)
- ✅ All installer types (.dmg, .exe, .msi, .deb, .rpm, .AppImage, .snap)
- ✅ Development and production run scripts for all platforms
- ✅ Comprehensive error handling and status reporting
- ✅ Auto-update support files
- ✅ Professional build output with color-coded messages

---

## 📊 Success Metrics

### **Repair Quality Indicators:**
- [ ] All critical security vulnerabilities fixed
- [ ] No new bugs introduced (regression testing passes)
- [ ] Performance improvements measurable  
- [ ] All planned functionality working
- [ ] Code quality scores improved
- [ ] Dependency vulnerabilities resolved

### **Process Efficiency:**
- **Time to Diagnosis:** < 10 minutes for any codebase size
- **Repair Success Rate:** > 95% of identified issues fixed
- **Regression Rate:** < 5% of repairs introduce new issues  
- **Quality Improvement:** Measurable increase in code quality metrics

---

## 🔄 Maintenance Mode

### **Ongoing Health Monitoring**
```bash
# Schedule regular health checks:
crontab -e
# Add: 0 2 * * * /path/to/codebase_health_check.sh

# Weekly comprehensive audit:
0 0 * * 0 /path/to/weekly_codebase_audit.sh
```

---

## 💡 Revolutionary Applications

### **Enterprise Codebase Rescue:**
- Legacy system modernization
- Security breach remediation  
- Performance crisis resolution
- Technical debt elimination

### **Acquisition Due Diligence:**
- Rapid codebase assessment
- Risk evaluation automation
- Integration feasibility analysis
- Repair cost estimation

### **Continuous Code Health:**
- Automated daily health checks
- Proactive issue detection
- Preventive maintenance scheduling
- Code quality monitoring

---

**This methodology transforms codebase repair from weeks of manual debugging to hours of orchestrated AI collaboration, ensuring comprehensive fixes with minimal risk of regression.**

---

*End of CodeFix Master System Prompt*
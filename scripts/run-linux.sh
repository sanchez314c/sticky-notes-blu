#!/bin/bash

# Run Compiled StickyNotes Binary on Linux

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

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

print_status "🚀 Launching compiled StickyNotes (Linux)..."

# Check if on Linux
if [ "$(uname)" != "Linux" ]; then
    print_error "This script is for Linux only"
    echo "  macOS: Use ./scripts/run-macos.sh"
    echo "  Windows: Use scripts\\run-windows.bat"
    exit 1
fi

# Check if dist exists
if [ ! -d "dist" ]; then
    print_error "No dist/ directory found. Run ./scripts/compile-build-dist.sh first."
    exit 1
fi

# Function to launch AppImage
launch_appimage() {
    local appimage="$1"
    chmod +x "$appimage"
    
    if [ -z "$DISPLAY" ]; then
        print_error "No display detected. Cannot run GUI application."
        exit 1
    fi
    
    print_status "Launching AppImage..."
    "$appimage" &
    print_success "StickyNotes launched!"
}

# Function to launch unpacked
launch_unpacked() {
    local exec_path="$1"
    chmod +x "$exec_path"
    
    print_status "Launching unpacked application..."
    "$exec_path" &
    print_success "StickyNotes launched!"
}

APP_FOUND=false

# Try AppImage first
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

# Try unpacked version
if [ "$APP_FOUND" = false ] && [ -d "dist/linux-unpacked" ]; then
    EXEC_NAME="stickynotes"
    EXEC_PATH="dist/linux-unpacked/$EXEC_NAME"
    
    if [ ! -f "$EXEC_PATH" ]; then
        EXEC_PATH=$(find dist/linux-unpacked -type f -executable | grep -v ".so" | head -1)
    fi
    
    if [ -f "$EXEC_PATH" ]; then
        print_info "Found unpacked: $(basename "$EXEC_PATH")"
        launch_unpacked "$EXEC_PATH"
        APP_FOUND=true
    fi
fi

# Show packages if no runnable found
if [ "$APP_FOUND" = false ]; then
    print_warning "No runnable binary found. Available packages:"
    
    if ls dist/*.deb 2>/dev/null; then
        for deb in dist/*.deb; do
            print_info "DEB: $(basename "$deb")"
            echo "  Install: sudo dpkg -i $deb"
        done
    fi
    
    if ls dist/*.rpm 2>/dev/null; then
        for rpm in dist/*.rpm; do
            print_info "RPM: $(basename "$rpm")"
            echo "  Install: sudo rpm -i $rpm"
        done
    fi
    
    echo ""
    print_status "Install a package to run system-wide"
    exit 1
fi

if [ "$APP_FOUND" = true ]; then
    print_status "StickyNotes is running in the background"
fi
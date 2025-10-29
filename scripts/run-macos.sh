#!/bin/bash

# Run Compiled StickyNotes Binary on macOS

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
}

print_status "🚀 Launching compiled StickyNotes (macOS)..."

# Check if on macOS
if [ "$(uname)" != "Darwin" ]; then
    print_error "This script is for macOS only"
    exit 1
fi

# Check if dist exists
if [ ! -d "dist" ]; then
    print_error "No dist/ directory found. Run ./scripts/compile-build-dist.sh first."
    exit 1
fi

# Find the app
APP_PATH=""
ARCH=$(uname -m)

if [ "$ARCH" = "arm64" ]; then
    print_status "Detected Apple Silicon Mac"
    if [ -d "dist/mac-arm64" ]; then
        APP_PATH=$(find dist/mac-arm64 -name "*.app" -type d | head -n 1)
    fi
fi

if [ -z "$APP_PATH" ] && [ -d "dist/mac" ]; then
    APP_PATH=$(find dist/mac -name "*.app" -type d | head -n 1)
fi

if [ -z "$APP_PATH" ]; then
    APP_PATH=$(find dist -name "*.app" -type d | head -n 1)
fi

# Launch if found
if [ -n "$APP_PATH" ] && [ -d "$APP_PATH" ]; then
    print_success "Found: $(basename "$APP_PATH")"
    print_status "Launching..."
    open "$APP_PATH"
    print_success "StickyNotes launched!"
else
    print_error "Could not find .app bundle. Build first with:"
    print_status "  ./scripts/compile-build-dist.sh"
    exit 1
fi
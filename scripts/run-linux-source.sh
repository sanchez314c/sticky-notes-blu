#!/bin/bash

# Run StickyNotes from Source on Linux (Development Mode)

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

print_status "🚀 Starting StickyNotes from source (Linux)..."

# Check if on Linux
if [ "$(uname)" != "Linux" ]; then
    print_error "This script is for Linux only"
    exit 1
fi

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
    print_error "Node.js not installed. Install with:"
    echo "  Ubuntu/Debian: sudo apt install nodejs"
    echo "  Fedora: sudo dnf install nodejs"
    echo "  Arch: sudo pacman -S nodejs"
    exit 1
fi

# Check for npm
if ! command -v npm >/dev/null 2>&1; then
    print_error "npm not installed. Install with:"
    echo "  Ubuntu/Debian: sudo apt install npm"
    echo "  Fedora: sudo dnf install npm"
    echo "  Arch: sudo pacman -S npm"
    exit 1
fi

# Check package.json
if [ ! -f "package.json" ]; then
    print_error "package.json not found"
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

# Set Linux-specific Electron flags
export ELECTRON_FORCE_WINDOW_MENU_BAR=1
export ELECTRON_TRASH=gio

# Launch app
print_status "Launching StickyNotes..."
print_status "Press Ctrl+C to stop"
echo ""

npm start

echo ""
print_success "StickyNotes closed"
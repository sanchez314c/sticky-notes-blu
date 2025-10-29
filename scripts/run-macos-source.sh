#!/bin/bash

# Run StickyNotes from Source on macOS (Development Mode)

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

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

print_status "🚀 Starting StickyNotes from source (macOS)..."

# Check if we're on macOS
if [ "$(uname)" != "Darwin" ]; then
    print_error "This script is for macOS only"
    exit 1
fi

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Make sure you're in the project root."
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

# Launch the app
print_status "Launching StickyNotes..."
print_status "Press Ctrl+C to stop the application"
echo ""

npm start

echo ""
print_success "StickyNotes closed"
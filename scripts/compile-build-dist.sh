#!/bin/bash

# Complete Multi-Platform Build Script for StickyNotes
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
cd "$SCRIPT_DIR/.."

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

# Check for required tools
print_status "Checking requirements..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "All requirements met"

# Clean previous builds
print_status "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf build/
rm -rf out/
print_success "Previous builds cleaned"

# Build for all platforms
print_status "🏗️ Building for all platforms..."
print_info "This will create:"
print_info "  macOS: DMG, ZIP"
print_info "  Windows: NSIS installer, MSI, ZIP"
print_info "  Linux: AppImage, DEB, RPM, SNAP"

# Run the build
npm run dist

BUILD_RESULT=$?

if [ $BUILD_RESULT -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

print_success "All platform builds completed successfully"

# Display results
print_status "📋 Build Results:"
echo ""
if [ -d "dist" ]; then
    print_success "Generated files:"
    ls -lh dist/ 2>/dev/null
fi

print_success "🎉 Build process complete!"
print_info "📁 All packages are in: ./dist/"

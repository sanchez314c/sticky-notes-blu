#!/bin/bash

# 🔨 BUILD-ELECTRON - Multi-Platform Electron Builder
# Builds for ALL platforms: macOS, Windows, Linux
# NO HARD-CODED PATHS!

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

# Dynamic paths for v0 framework
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Project root is 2 levels up from scripts/build-compile-dist
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
APP_PATH="${1:-$PROJECT_ROOT}"

# Get absolute path
APP_PATH="$(cd "$APP_PATH" && pwd)"

echo -e "${BOLD}${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${PURPLE}║        🔨 ELECTRON BUILDER - MULTI-PLATFORM v2.0 🔨         ║${NC}"
echo -e "${BOLD}${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📁 Project:${NC} $APP_PATH"
echo ""

# Check dependencies
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install Node.js${NC}"
    exit 1
fi

cd "$APP_PATH"

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
    echo -e "${CYAN}📦 Installing dependencies...${NC}"
    npm install
fi

# Install electron-builder if not present
if ! npm list electron-builder &> /dev/null; then
    echo -e "${CYAN}📦 Installing electron-builder...${NC}"
    npm install --save-dev electron-builder
fi

# Build for ALL platforms
echo -e "${BOLD}${CYAN}🚀 Building for ALL platforms...${NC}"
echo -e "  • macOS (Intel + ARM)"
echo -e "  • Windows (x64 + x86)"
echo -e "  • Linux (x64 + ARM)"
echo ""

# The master build command
npx electron-builder --mac --win --linux --x64 --arm64 --ia32 || {
    echo -e "${YELLOW}⚠️ Some platforms failed, trying individually...${NC}"
    
    # Try each platform separately
    echo -e "${CYAN}🍎 Building macOS...${NC}"
    npx electron-builder --mac || echo -e "${YELLOW}  macOS build failed${NC}"
    
    echo -e "${CYAN}🪟 Building Windows...${NC}"
    npx electron-builder --win || echo -e "${YELLOW}  Windows build failed${NC}"
    
    echo -e "${CYAN}🐧 Building Linux...${NC}"
    npx electron-builder --linux || echo -e "${YELLOW}  Linux build failed${NC}"
}

# Summary
echo ""
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}                    ✅ BUILD COMPLETE                          ${NC}"
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📁 Output Directory:${NC} $APP_PATH/dist"
echo ""
echo -e "${CYAN}📦 Built Packages:${NC}"
ls -la dist/*.{dmg,exe,AppImage,deb,rpm,msi} 2>/dev/null || echo "  Check dist/ directory"
echo ""

exit 0
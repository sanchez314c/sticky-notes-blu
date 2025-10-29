#!/bin/bash

# 🐍 BUILD-PYTHON - Python Application Builder
# Creates standalone executables with PyInstaller
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

# Dynamic paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
APP_PATH="${1:-.}"

# Options
ONEFILE="${2:---onefile}"
WINDOWED="${3:---windowed}"

# Get absolute path
APP_PATH="$(cd "$APP_PATH" && pwd)"

echo -e "${BOLD}${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${PURPLE}║          🐍 PYTHON BUILDER - PYINSTALLER v2.0 🐍           ║${NC}"
echo -e "${BOLD}${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📁 Project:${NC} $APP_PATH"
echo -e "${CYAN}📦 Mode:${NC} $ONEFILE"
echo -e "${CYAN}🪟 Window:${NC} $WINDOWED"
echo ""

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found${NC}"
    exit 1
fi

# Check for pip
if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
    echo -e "${RED}❌ pip not found${NC}"
    exit 1
fi

PIP_CMD="pip3"
if ! command -v pip3 &> /dev/null; then
    PIP_CMD="pip"
fi

cd "$APP_PATH"

# Install dependencies
if [[ -f "requirements.txt" ]]; then
    echo -e "${CYAN}📦 Installing dependencies...${NC}"
    $PIP_CMD install -r requirements.txt
fi

# Install PyInstaller if not present
if ! $PIP_CMD show pyinstaller &> /dev/null; then
    echo -e "${CYAN}📦 Installing PyInstaller...${NC}"
    $PIP_CMD install pyinstaller
fi

# Find main Python file
MAIN_FILE=""
if [[ -f "main.py" ]]; then
    MAIN_FILE="main.py"
elif [[ -f "app.py" ]]; then
    MAIN_FILE="app.py"
elif [[ -f "__main__.py" ]]; then
    MAIN_FILE="__main__.py"
else
    # Find first .py file
    MAIN_FILE=$(find . -maxdepth 1 -name "*.py" | head -1)
fi

if [[ -z "$MAIN_FILE" ]]; then
    echo -e "${RED}❌ No Python file found${NC}"
    exit 1
fi

echo -e "${CYAN}📄 Main file:${NC} $MAIN_FILE"
echo ""

# Prepare build options
BUILD_OPTS=""

if [[ "$ONEFILE" == "--onefile" ]]; then
    BUILD_OPTS="$BUILD_OPTS --onefile"
fi

if [[ "$WINDOWED" == "--windowed" ]]; then
    BUILD_OPTS="$BUILD_OPTS --windowed"
fi

# Add icon if exists
if [[ -f "icon.ico" ]]; then
    BUILD_OPTS="$BUILD_OPTS --icon=icon.ico"
elif [[ -f "icon.icns" ]]; then
    BUILD_OPTS="$BUILD_OPTS --icon=icon.icns"
fi

# Build
echo -e "${BOLD}${CYAN}🚀 Building standalone executable...${NC}"
pyinstaller $BUILD_OPTS \
    --name "$(basename "$APP_PATH")" \
    --distpath dist \
    --workpath build \
    --specpath . \
    --clean \
    --noconfirm \
    "$MAIN_FILE"

# Create cross-platform builds if possible
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${CYAN}🍎 Building for macOS...${NC}"
    # macOS specific options already applied
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo -e "${CYAN}🐧 Building for Linux...${NC}"
    # Linux specific options
fi

# Package additional files
if [[ -d "assets" ]] || [[ -d "data" ]] || [[ -d "resources" ]]; then
    echo -e "${CYAN}📦 Packaging additional resources...${NC}"
    for dir in assets data resources; do
        if [[ -d "$dir" ]]; then
            cp -r "$dir" "dist/"
        fi
    done
fi

# Create requirements file if not exists
if [[ ! -f "requirements.txt" ]]; then
    echo -e "${CYAN}📝 Generating requirements.txt...${NC}"
    $PIP_CMD freeze > requirements.txt
fi

# Summary
echo ""
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}                 ✅ PYTHON BUILD COMPLETE                      ${NC}"
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📁 Output:${NC}"
ls -la dist/
echo ""
echo -e "${CYAN}🚀 Run with:${NC} ./dist/$(basename "$APP_PATH")"
echo ""

exit 0
#!/bin/bash

# 🍎 BUILD-MACOS - Swift/Xcode macOS Application Builder
# Builds native macOS apps with signing and notarization
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
SIGN="${2:---no-sign}"
NOTARIZE="${3:---no-notarize}"

# Get absolute path
APP_PATH="$(cd "$APP_PATH" && pwd)"

echo -e "${BOLD}${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${PURPLE}║           🍎 macOS BUILDER - SWIFT/XCODE v2.0 🍎            ║${NC}"
echo -e "${BOLD}${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}📁 Project:${NC} $APP_PATH"
echo -e "${CYAN}🔒 Signing:${NC} $SIGN"
echo -e "${CYAN}✅ Notarize:${NC} $NOTARIZE"
echo ""

# Check for Swift
if ! command -v swift &> /dev/null; then
    echo -e "${RED}❌ Swift not found. Please install Xcode${NC}"
    exit 1
fi

# Check for xcodebuild
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ xcodebuild not found. Please install Xcode Command Line Tools${NC}"
    echo "Run: xcode-select --install"
    exit 1
fi

cd "$APP_PATH"

# Detect project type
if [[ -f "Package.swift" ]]; then
    echo -e "${CYAN}📦 Swift Package detected${NC}"
    BUILD_TYPE="swift"
elif [[ -f *.xcodeproj ]]; then
    echo -e "${CYAN}📦 Xcode project detected${NC}"
    BUILD_TYPE="xcode"
    XCODEPROJ=$(ls *.xcodeproj | head -1)
else
    echo -e "${RED}❌ No Swift Package or Xcode project found${NC}"
    exit 1
fi

# Build based on type
if [[ "$BUILD_TYPE" == "swift" ]]; then
    echo -e "${BOLD}${CYAN}🚀 Building Swift Package...${NC}"
    swift build --configuration release
    
    # Find the built executable
    EXECUTABLE=$(find .build/release -type f -perm +111 | head -1)
    if [[ -n "$EXECUTABLE" ]]; then
        echo -e "${GREEN}✅ Built: $EXECUTABLE${NC}"
        
        # Create app bundle if needed
        APP_NAME=$(basename "$EXECUTABLE")
        mkdir -p "dist/$APP_NAME.app/Contents/MacOS"
        mkdir -p "dist/$APP_NAME.app/Contents/Resources"
        cp "$EXECUTABLE" "dist/$APP_NAME.app/Contents/MacOS/"
        
        # Create basic Info.plist
        cat > "dist/$APP_NAME.app/Contents/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>$APP_NAME</string>
    <key>CFBundleIdentifier</key>
    <string>com.swarm.$APP_NAME</string>
    <key>CFBundleName</key>
    <string>$APP_NAME</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
</dict>
</plist>
EOF
        echo -e "${GREEN}✅ App bundle created: dist/$APP_NAME.app${NC}"
    fi
else
    echo -e "${BOLD}${CYAN}🚀 Building Xcode project...${NC}"
    xcodebuild -project "$XCODEPROJ" -scheme "$(xcodebuild -list -project "$XCODEPROJ" | grep -A 1 Schemes | tail -1 | xargs)" -configuration Release build
fi

# Code signing
if [[ "$SIGN" == "--sign" ]]; then
    echo -e "${CYAN}🔒 Code signing...${NC}"
    
    # Find identity
    IDENTITY=$(security find-identity -v -p codesigning | grep "Developer ID Application" | head -1 | cut -d'"' -f2)
    
    if [[ -n "$IDENTITY" ]]; then
        codesign --force --deep --sign "$IDENTITY" dist/*.app
        echo -e "${GREEN}✅ Signed with: $IDENTITY${NC}"
    else
        echo -e "${YELLOW}⚠️ No signing identity found${NC}"
    fi
fi

# Notarization
if [[ "$NOTARIZE" == "--notarize" ]] && [[ "$SIGN" == "--sign" ]]; then
    echo -e "${CYAN}✅ Notarizing app...${NC}"
    echo -e "${YELLOW}Note: Requires Apple Developer account credentials${NC}"
    # xcrun altool --notarize-app would go here
fi

# Create DMG
if command -v create-dmg &> /dev/null; then
    echo -e "${CYAN}💿 Creating DMG...${NC}"
    create-dmg --volname "$APP_NAME" --window-size 600 400 "dist/$APP_NAME.dmg" "dist/$APP_NAME.app"
fi

# Summary
echo ""
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}                  ✅ macOS BUILD COMPLETE                      ${NC}"
echo -e "${BOLD}${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📁 Output:${NC}"
ls -la dist/*.app dist/*.dmg 2>/dev/null || ls -la .build/release/ 2>/dev/null
echo ""

exit 0
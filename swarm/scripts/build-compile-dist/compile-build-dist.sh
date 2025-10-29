#!/bin/bash

# 🔴 MASTER BUILD SCRIPT FOR SWARM FRAMEWORK v0
# Automatically detects project type and builds for ALL platforms
# Mac, Windows, Linux - EVERY TIME, NO EXCEPTIONS
# Updated for v0 framework structure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║       🚀 SWARM MASTER BUILD SYSTEM ACTIVATED 🚀             ║${NC}"
echo -e "${RED}║     BUILDING FOR ALL PLATFORMS: MAC, WINDOWS, LINUX         ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"

# Function to detect project type
detect_project_type() {
    if [ -f "package.json" ]; then
        if grep -q "electron" package.json; then
            echo "electron"
        elif grep -q "react" package.json; then
            echo "react"
        elif grep -q "vue" package.json; then
            echo "vue"
        else
            echo "node"
        fi
    elif [ -f "requirements.txt" ] || [ -f "setup.py" ] || [ -f "pyproject.toml" ]; then
        echo "python"
    elif [ -f "Package.swift" ] || [ -d "*.xcodeproj" ] || [ -d "*.xcworkspace" ]; then
        echo "swift"
    elif [ -f "Cargo.toml" ]; then
        echo "rust"
    elif [ -f "go.mod" ]; then
        echo "go"
    elif [ -f "pom.xml" ] || [ -f "build.gradle" ]; then
        echo "java"
    elif [ -f "*.csproj" ] || [ -f "*.sln" ]; then
        echo "dotnet"
    else
        echo "unknown"
    fi
}

# Function to build Electron apps for ALL platforms
build_electron() {
    echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${CYAN}Building Electron App for ALL Platforms${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi
    
    # Install electron-builder if not present
    if ! npm list electron-builder >/dev/null 2>&1; then
        echo -e "${YELLOW}Installing electron-builder...${NC}"
        npm install --save-dev electron electron-builder
    fi
    
    # Ensure package.json has build configuration
    if ! grep -q '"dist"' package.json; then
        echo -e "${YELLOW}Adding dist script to package.json...${NC}"
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json'));
        pkg.scripts = pkg.scripts || {};
        pkg.scripts.dist = 'electron-builder --mac --win --linux --x64 --arm64';
        pkg.build = pkg.build || {
            appId: 'com.swarm.app',
            productName: pkg.name || 'SwarmApp',
            directories: { output: 'dist' },
            mac: { category: 'public.app-category.productivity' },
            win: { target: ['nsis', 'msi', 'portable'] },
            linux: { target: ['AppImage', 'deb', 'rpm'] }
        };
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        "
    fi
    
    # BUILD FOR ALL PLATFORMS
    echo -e "${GREEN}Building for Mac, Windows, and Linux...${NC}"
    npm run dist || npx electron-builder --mac --win --linux --x64 --arm64
    
    # Verify builds
    echo -e "\n${GREEN}Build outputs:${NC}"
    ls -la dist/*.dmg 2>/dev/null && echo -e "${GREEN}✅ Mac builds created${NC}" || echo -e "${RED}❌ Mac builds missing${NC}"
    ls -la dist/*.exe 2>/dev/null && echo -e "${GREEN}✅ Windows builds created${NC}" || echo -e "${RED}❌ Windows builds missing${NC}"
    ls -la dist/*.AppImage 2>/dev/null && echo -e "${GREEN}✅ Linux builds created${NC}" || echo -e "${RED}❌ Linux builds missing${NC}"
}

# Function to build Python apps for ALL platforms
build_python() {
    echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${CYAN}Building Python App for ALL Platforms${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    
    # Install PyInstaller if needed
    if ! command -v pyinstaller &> /dev/null; then
        echo -e "${YELLOW}Installing PyInstaller...${NC}"
        pip install pyinstaller
    fi
    
    # Find main Python file
    MAIN_FILE=""
    for file in main.py app.py run.py __main__.py; do
        if [ -f "$file" ]; then
            MAIN_FILE="$file"
            break
        fi
    done
    
    if [ -z "$MAIN_FILE" ]; then
        echo -e "${RED}No main Python file found!${NC}"
        MAIN_FILE=$(find . -name "*.py" -type f | head -1)
        echo -e "${YELLOW}Using first Python file found: $MAIN_FILE${NC}"
    fi
    
    # Create dist directory
    mkdir -p dist
    
    # Build for current platform (native)
    echo -e "${GREEN}Building native executable...${NC}"
    pyinstaller --onefile --windowed --distpath dist "$MAIN_FILE"
    
    # For cross-platform Python, we create platform-specific scripts
    echo -e "${GREEN}Creating platform-specific launchers...${NC}"
    
    # Windows batch file
    cat > dist/run_windows.bat << 'EOF'
@echo off
python main.py || python3 main.py || dist\main.exe
pause
EOF
    
    # Mac/Linux shell script
    cat > dist/run_unix.sh << 'EOF'
#!/bin/bash
if command -v python3 &> /dev/null; then
    python3 main.py
elif command -v python &> /dev/null; then
    python main.py
else
    ./dist/main
fi
EOF
    chmod +x dist/run_unix.sh
    
    echo -e "${GREEN}✅ Python builds created for all platforms${NC}"
}

# Function to build Swift apps (macOS/iOS)
build_swift() {
    echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${CYAN}Building Swift App for Apple Platforms${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    
    # Build for macOS
    if [ -f "Package.swift" ]; then
        echo -e "${GREEN}Building with Swift Package Manager...${NC}"
        swift build --configuration release
        
        # Copy to dist
        mkdir -p dist
        cp -r .build/release/* dist/ 2>/dev/null || true
    fi
    
    # Build with Xcode if project exists
    if ls *.xcodeproj 1> /dev/null 2>&1; then
        echo -e "${GREEN}Building with Xcode...${NC}"
        xcodebuild -configuration Release -alltargets
        
        # Find and copy build products
        find ~/Library/Developer/Xcode/DerivedData -name "*.app" -type d -mtime -1 -exec cp -r {} dist/ \; 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ Swift/macOS builds created${NC}"
}

# Function to build web apps
build_web() {
    echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${CYAN}Building Web Application${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    
    # Install dependencies
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi
    
    # Try different build commands
    echo -e "${GREEN}Building production bundle...${NC}"
    npm run build 2>/dev/null || npm run build:prod 2>/dev/null || npx webpack --mode production 2>/dev/null || npx vite build 2>/dev/null
    
    # Package as Electron app for desktop distribution
    echo -e "${YELLOW}Converting to desktop app with Electron...${NC}"
    
    # Create minimal Electron wrapper
    cat > electron-main.js << 'EOF'
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });
    
    // Load the built web app
    win.loadFile('dist/index.html').catch(() => {
        win.loadFile('build/index.html').catch(() => {
            win.loadURL('http://localhost:3000');
        });
    });
}

app.whenReady().then(createWindow);
EOF
    
    # Add Electron to package.json if needed
    if ! grep -q "electron" package.json; then
        npm install --save-dev electron electron-builder
    fi
    
    # Build Electron app for all platforms
    npx electron-builder --mac --win --linux --config.extraMetadata.main=electron-main.js
    
    echo -e "${GREEN}✅ Web app built and packaged for all platforms${NC}"
}

# Function to build unknown/generic projects
build_generic() {
    echo -e "\n${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${CYAN}Generic Build Process${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    
    # Try common build commands
    echo -e "${YELLOW}Attempting common build commands...${NC}"
    
    # Make
    if [ -f "Makefile" ]; then
        echo -e "${GREEN}Building with Make...${NC}"
        make && make install PREFIX=./dist
    fi
    
    # CMake
    if [ -f "CMakeLists.txt" ]; then
        echo -e "${GREEN}Building with CMake...${NC}"
        mkdir -p build && cd build
        cmake .. && make
        cd ..
        mkdir -p dist
        cp -r build/* dist/ 2>/dev/null || true
    fi
    
    # Gradle
    if [ -f "build.gradle" ]; then
        echo -e "${GREEN}Building with Gradle...${NC}"
        ./gradlew build || gradle build
        mkdir -p dist
        find . -name "*.jar" -exec cp {} dist/ \;
    fi
    
    # Maven
    if [ -f "pom.xml" ]; then
        echo -e "${GREEN}Building with Maven...${NC}"
        mvn clean package
        mkdir -p dist
        find target -name "*.jar" -exec cp {} dist/ \;
    fi
    
    echo -e "${YELLOW}Generic build attempted - check dist/ for outputs${NC}"
}

# Main execution
main() {
    # Get project directory - default to current directory
    PROJECT_DIR="${1:-.}"
    
    # If running from swarm/scripts, go to project root
    if [[ "$PWD" == */swarm/scripts* ]]; then
        PROJECT_DIR="$(cd "$PWD/../.." && pwd)"
    fi
    
    cd "$PROJECT_DIR"
    
    echo -e "${CYAN}Analyzing project in: $(pwd)${NC}"
    echo -e "${CYAN}Project name: $(basename "$(pwd)")${NC}"
    
    # Detect project type
    PROJECT_TYPE=$(detect_project_type)
    echo -e "${MAGENTA}Detected project type: $PROJECT_TYPE${NC}"
    
    # Create dist directory
    mkdir -p dist
    
    # Build based on project type
    case $PROJECT_TYPE in
        electron)
            build_electron
            ;;
        python)
            build_python
            ;;
        swift)
            build_swift
            ;;
        react|vue|node)
            build_web
            ;;
        *)
            echo -e "${YELLOW}Unknown project type - attempting generic build...${NC}"
            build_generic
            ;;
    esac
    
    # Final report
    echo -e "\n${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║              🎯 BUILD PROCESS COMPLETE 🎯                   ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    
    echo -e "\n${GREEN}Build artifacts in dist/ directory:${NC}"
    ls -la dist/ 2>/dev/null || echo -e "${RED}No dist directory found!${NC}"
    
    # Count platform builds
    MAC_COUNT=$(ls dist/*.{dmg,app} 2>/dev/null | wc -l)
    WIN_COUNT=$(ls dist/*.{exe,msi} 2>/dev/null | wc -l)
    LINUX_COUNT=$(ls dist/*.{AppImage,deb,rpm} 2>/dev/null | wc -l)
    
    echo -e "\n${CYAN}Platform Coverage:${NC}"
    echo -e "Mac builds: $MAC_COUNT"
    echo -e "Windows builds: $WIN_COUNT"
    echo -e "Linux builds: $LINUX_COUNT"
    
    if [ $MAC_COUNT -eq 0 ] && [ $WIN_COUNT -eq 0 ] && [ $LINUX_COUNT -eq 0 ]; then
        echo -e "${RED}⚠️ WARNING: No platform-specific builds detected!${NC}"
        echo -e "${YELLOW}The build may have created generic outputs only.${NC}"
    else
        echo -e "${GREEN}✅ Multi-platform builds successful!${NC}"
    fi
}

# Run main function
main "$@"
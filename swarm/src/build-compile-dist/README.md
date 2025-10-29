# Build & Compilation Documentation

This directory contains build instructions for different technology stacks. Each document corresponds to a build script in `swarm/scripts/build-compile-dist/`.

## Build Documentation Files

- **build-compile-dist-electron.md** - Electron app build instructions
- **build-compile-dist-python.md** - Python app build instructions  
- **build-compile-dist-swift-macos.md** - Swift/macOS app build instructions
- **build-compile-dist-typescript.md** - TypeScript build instructions
- **build-compile-dist-web.md** - Web app build instructions

## Corresponding Build Scripts

Each documentation file has a matching script in `swarm/scripts/build-compile-dist/`:

| Documentation | Script | Purpose |
|--------------|--------|---------|
| build-compile-dist-electron.md | build-electron.sh | Build Electron apps for Mac/Win/Linux |
| build-compile-dist-python.md | build-python.sh | Build Python apps with PyInstaller |
| build-compile-dist-swift-macos.md | build-swift.sh | Build Swift apps for macOS/iOS |
| build-compile-dist-web.md | build-web.sh | Build web apps and package with Electron |
| (auto-detect) | compile-build-dist.sh | Master script that auto-detects project type |

## How It Works in SWARM Framework

### Phase 1: Tech Stack Selection
The SWARM framework determines which tech stack to use and saves it to `SELECTED_STACK.txt`.

### Phase 8: Build & Package
The framework reads the selected tech stack and executes the corresponding build script:

```bash
# Example: If REACT-ELECTRON was selected in Phase 1
bash swarm/scripts/build-compile-dist/build-electron.sh

# Or use the master script for auto-detection
bash swarm/scripts/build-compile-dist/compile-build-dist.sh
```

### Build Output
All builds generate platform-specific packages in the `dist/` directory:
- **Mac**: `.dmg`, `.app`
- **Windows**: `.exe`, `.msi`
- **Linux**: `.AppImage`, `.deb`, `.rpm`

## Build Script Features

All build scripts:
1. Auto-detect project structure
2. Install necessary dependencies
3. Build for ALL platforms (Mac, Windows, Linux)
4. Generate distribution packages
5. Output to `dist/` directory

## Usage Outside SWARM

These scripts can also be run manually:

```bash
# Build Electron app
./swarm/scripts/build-compile-dist/build-electron.sh

# Build Python app
./swarm/scripts/build-compile-dist/build-python.sh

# Auto-detect and build any project
./swarm/scripts/build-compile-dist/compile-build-dist.sh
```

## Requirements

- **Node.js** - For Electron/Web builds
- **Python** - For Python builds
- **Xcode** - For Swift/macOS builds
- **Build tools** - npm, pip, swift, etc.
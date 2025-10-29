# Technology Stack Documentation

This directory contains comprehensive tech stack guides and templates for different application types.

## Available Tech Stacks

### Desktop Applications
- **REACT-ELECTRON.md** - React + Electron for cross-platform desktop apps
- **SWIFT-MACOS.md** - Native macOS applications with Swift
- **PYTHON-TKINTER.md** - Python desktop apps with Tkinter

### Web Applications  
- **WEB-DEVELOPMENT.md** - Modern web development (React/Vue/Angular)
- **HTML-CSS.md** - Basic HTML/CSS static sites

### Mobile Applications
- **SWIFT-IOS-IPADOS.md** - Native iOS/iPadOS apps with Swift

### Configuration Files
- **desktop_stack.json** - Desktop app configuration template
- **web_stack.json** - Web app configuration template

## Integration with SWARM Framework

### Phase 1: Tech Stack Selection
When Claude executes Phase 1 (TechStack Decision), it should:
1. Analyze the app requirements
2. Select the appropriate tech stack
3. Read the corresponding documentation file
4. Use that as context for implementation

### Phase 8: Build & Package
When building the application, Claude should:
1. Reference the selected tech stack from Phase 1
2. Execute the appropriate build script from `swarm/scripts/build-compile-dist/`
3. Use the build documentation from `swarm/src/build-compile-dist/`

## Tech Stack Selection Guide

### For Desktop Apps:
- **Electron + React**: Cross-platform, web technologies, rapid development
- **Swift (macOS)**: Native performance, Apple ecosystem integration
- **Python + Tkinter**: Quick prototypes, data-heavy applications

### For Web Apps:
- **React/Vue/Angular**: Modern SPAs, complex interactions
- **HTML/CSS**: Static sites, landing pages, simple apps

### For Mobile Apps:
- **Swift**: iOS/iPadOS native apps
- **React Native** (future): Cross-platform mobile

## Usage in SWARM Workflow

```bash
# Claude reads tech stack documentation during Phase 1
cat "$SWARM_DIR/../src/tech-stacks/REACT-ELECTRON.md"

# Claude uses build scripts during Phase 8
bash "$SWARM_DIR/../scripts/build-compile-dist/build-electron.sh"
```
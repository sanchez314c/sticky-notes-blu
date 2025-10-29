# Technology Stack

## Core Technologies
- **Language**: JavaScript (ES6+)
- **Framework**: Electron v38.0.0
- **Runtime**: Node.js 16+
- **Package Manager**: npm
- **Platform**: Cross-platform Desktop (macOS primary, Windows/Linux support)

## Key Dependencies
- **electron**: ^38.0.0 - Desktop application framework
- **electron-builder**: ^25.1.8 - Application packaging and distribution
- **electron-store**: ^8.1.0 - Simple data persistence
- **node-machine-id**: ^1.1.12 - Unique machine identification
- **@testing-library/jest-dom**: ^6.8.0 - Testing utilities
- **electron-mock-ipc**: ^0.3.12 - IPC testing mocks
- **jest**: ^30.1.3 - Testing framework

## Development Tools
- **Linter**: ESLint (implied by Jest configuration)
- **Formatter**: Prettier (not explicitly configured)
- **Testing**: Jest with security-focused test suites
- **Build Tool**: Electron Builder with multi-platform support
- **Security Testing**: Custom security test suites

## Project Type
Desktop Application - Sticky Notes app with advanced security features

## Architecture Components
- **Main Process**: Electron main process with security hardening
- **Renderer Process**: HTML5/CSS3/JavaScript frontend
- **IPC Layer**: Secure inter-process communication
- **Security Layer**: Advanced validation, authentication, session management
- **Storage Layer**: Encrypted local data storage
- **Build System**: Multi-platform distribution with Electron Builder

## Security Features
- IPC hardening and secure communication channels
- Multi-layer input validation and sanitization
- Session management and authentication
- Local data encryption
- Sandboxed renderer processes
- Security-focused test suites

## Distribution Targets
- **macOS**: .dmg and .zip packages (Intel and ARM64)
- **Windows**: .exe (NSIS), .msi, and .zip packages (x64 and x86)
- **Linux**: .AppImage, .deb, and .rpm packages
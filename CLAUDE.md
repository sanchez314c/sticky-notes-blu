# Claude Instructions for StickyNotes

## Project Overview

**StickyNotes** is a modern, secure desktop sticky notes application built with Electron. It features advanced security implementations, cross-platform compatibility, and a beautiful dark-mode UI.

## Technology Stack

**Core Technologies:**
- **Framework**: Electron v38.0.0
- **Language**: JavaScript (ES6+)
- **Runtime**: Node.js 16+
- **Build Tool**: Electron Builder
- **Testing**: Jest with security-focused suites

**Key Dependencies:**
- `electron`: Desktop application framework
- `electron-builder`: Cross-platform packaging
- `electron-store`: Secure local data storage
- `jest`: Testing framework

**Platform Support:**
- **Primary**: macOS (Intel/ARM)
- **Secondary**: Windows (x64/x86), Linux (x64)

## Key Conventions

### File Naming
- **Source Files**: camelCase (e.g., `noteManager.js`)
- **Directories**: kebab-case (e.g., `user-auth`)
- **Config Files**: kebab-case with extension (e.g., `build-config.json`)
- **Documentation**: PascalCase.md for main docs, kebab-case.md for others

### Code Style
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JavaScript
- **Semicolons**: Required
- **ES6+ Features**: Modern JavaScript with async/await

### Security Standards
- **IPC Communication**: Must use secure handlers only
- **Input Validation**: Multi-layer validation required
- **Session Management**: Secure session handling
- **Data Encryption**: Local encryption for sensitive data

## Important Paths

### Source Code Structure
```
src/
├── main/          # Electron main processes
├── preload/       # Secure preload scripts
├── renderer/      # UI and frontend code
├── security/      # Security modules and handlers
├── utils/         # Utility functions
├── cache/         # Caching systems
├── performance/   # Performance optimization
└── workers/       # Web workers
```

### Key Directories
- **assets/**: Icons, images, and media files
- **docs/**: All documentation
- **scripts/**: Build and utility scripts
- **config/**: Configuration files
- **dev/**: Development resources and specs
- **tests/**: Test files and fixtures
- **tools/**: Development tools and utilities

## Common Tasks

### Development
```bash
# Start development mode
./run-source-macos.sh

# Start with security features
npm run start:secure

# Run tests
npm test

# Run security tests
npm run security:test
```

### Building
```bash
# Build for current platform
./scripts/compile-build-dist.sh

# Build for all platforms
npm run dist

# Build with security validation
npm run dist:secure
```

### Testing
```bash
# Full test suite
npm test

# Security testing
npm run security:test

# Performance testing
npm run test:performance
```

## Project-Specific Notes

### Security Requirements
- **ALL IPC communication** must go through secure handlers
- **Input validation** required for all user inputs
- **Session management** must be implemented for user contexts
- **Data encryption** required for local storage
- **Audit logging** for security events

### Performance Considerations
- **Memory management** critical for desktop app
- **IPC efficiency** - minimize cross-process calls
- **Rendering optimization** for smooth UI
- **Background processing** for heavy operations

### Build System
- **Multi-platform builds** supported
- **Code signing** required for distribution
- **Icon generation** automated
- **Security hardening** included in build process

## Development Workflow

### Feature Development
1. **Plan**: Create issue/PRD in `dev/PRDs/`
2. **Implement**: Follow security and performance guidelines
3. **Test**: Comprehensive testing including security
4. **Document**: Update docs and changelog
5. **Build**: Verify builds work across platforms

### Security Implementation
1. **Design**: Plan security measures upfront
2. **Implement**: Use established security patterns
3. **Test**: Security-focused testing
4. **Audit**: Regular security reviews
5. **Document**: Security implementation details

### Code Organization
- **Main Process**: Application lifecycle, window management
- **Renderer Process**: UI, user interactions
- **Security Layer**: IPC handlers, validation, encryption
- **Utilities**: Shared functions, helpers
- **Workers**: Background processing, heavy computations

## Quality Standards

### Code Quality
- **ESLint**: Follow linting rules
- **Testing**: Minimum 60% coverage
- **Documentation**: JSDoc for public APIs
- **Security**: Security review for all changes

### Performance Targets
- **Startup Time**: < 2 seconds
- **Memory Usage**: < 150MB
- **Responsiveness**: < 100ms UI interactions
- **Security**: Zero known vulnerabilities

### Compatibility
- **macOS**: 10.15+ (primary target)
- **Windows**: 10+ (secondary)
- **Linux**: Ubuntu 18.04+ (secondary)
- **Node.js**: 16+ (runtime requirement)

## Recent Changes

**Project standardized on 2025-01-13**
- Complete folder structure reorganization
- Security hardening implementation
- Performance optimization
- Cross-platform build system
- Comprehensive documentation
- Development environment setup

## SWARM Framework Integration

This project supports SWARM Framework for complex development tasks. For AI-assisted development:

```bash
# Use OpenCode for AI assistance
opencode run -m "anthropic/claude-sonnet-4-20250514" "TASK DESCRIPTION" > output.txt &
```

### SWARM Commands
- `/sc:stickynotes-swarm "task"` - General development tasks
- `/sc:stickynotes-fix "issue"` - Bug fixes and repairs
- `/sc:stickynotes-optimize "area"` - Performance optimization
- `/sc:stickynotes-theme "theme"` - UI theme development

**⚠️ CRITICAL**: ALL OpenCode commands MUST end with `&` for background execution to prevent timeouts.

## Getting Help

- **Documentation**: Check `docs/` directory
- **Issues**: GitHub Issues for bugs/features
- **Security**: Private security advisories for vulnerabilities
- **Development**: This CLAUDE.md for development guidance

---

*Standardized project structure ensures consistent development practices and maintains high security and quality standards.*
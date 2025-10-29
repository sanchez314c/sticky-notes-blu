# Version Map - StickyNotes

## Overview

StickyNotes follows a structured versioning approach with clear separation between development versions, stable releases, and experimental features. This document tracks the evolution of the application and provides guidance for navigating different versions.

## Current Version: v1.0.0

**Status**: Stable Release
**Location**: Root directory (`/`)
**Run**: `./run-macos.sh` (macOS) or `./run-source-macos.sh` (development)

### Key Features (v1.0.0)
- Modern dark-mode UI with smooth animations
- Advanced security features (IPC hardening, encryption)
- Rich text editing capabilities
- Cross-platform support (macOS, Windows, Linux)
- Local data storage with encryption
- System tray integration
- Global shortcuts support

## Version History

### v1.0.0 - Current Stable (2025-01-13)
**Purpose**: Production-ready release with comprehensive security and performance optimizations
**Major Changes**:
- Complete codebase security hardening
- Performance optimizations and memory management
- Cross-platform build system implementation
- Comprehensive documentation and testing
- Project structure standardization

**Run Commands**:
```bash
# Production build
./run-macos.sh

# Development mode
./run-source-macos.sh
```

### Pre-v1.0 Development
**Purpose**: Core application development and feature implementation
**Status**: Archived in backup/
**Key Developments**:
- Initial Electron application setup
- Basic note-taking functionality
- UI/UX design and implementation
- Security foundation implementation

## Development Branches

### Security Enhancements Branch
**Purpose**: Advanced security features development
**Features in Development**:
- Biometric authentication
- Hardware security key support
- Enhanced encryption options
- Security audit logging

### Performance Optimization Branch
**Purpose**: Performance improvements and optimizations
**Focus Areas**:
- Memory usage optimization
- Startup time improvements
- Large dataset handling
- Background processing

### UI/UX Enhancement Branch
**Purpose**: User interface and experience improvements
**Features**:
- Theme system enhancements
- Accessibility improvements
- Advanced search functionality
- Mobile-responsive design

## Future Versions

### v1.1.0 - Enhanced Features
**Planned Release**: Q2 2025
**Key Features**:
- Plugin system architecture
- Advanced search and filtering
- Note templates and quick actions
- Enhanced backup and sync options

### v1.2.0 - Collaboration Features
**Planned Release**: Q3 2025
**Key Features**:
- Local network sharing
- Team collaboration tools
- Advanced permissions
- Audit trails

### v2.0.0 - Major Architecture Update
**Planned Release**: Q1 2026
**Key Changes**:
- TypeScript migration
- Plugin marketplace
- Cloud synchronization (optional)
- Enterprise features

## Version Navigation

### For Users
1. **Stable Release**: Use files in root directory
2. **Development Testing**: Use `./run-source-[platform].sh` scripts
3. **Specific Version**: Check `versions/` directory for archived versions

### For Developers
1. **Current Development**: Work in root directory
2. **Version Comparison**: Use archived versions in `versions/` for reference
3. **Experimental Features**: Check development branches

## Compatibility Matrix

| Version | macOS | Windows | Linux | Security Level | Performance |
|---------|-------|---------|-------|----------------|-------------|
| v1.0.0  | ✅    | ✅      | ✅    | Advanced      | Optimized   |
| v0.x.x  | ✅    | ⚠️     | ⚠️    | Basic         | Standard   |

## Migration Guide

### From Pre-v1.0 to v1.0.0
- **Data Migration**: Automatic migration of existing notes
- **Settings Preservation**: All user settings maintained
- **Security Enhancement**: Automatic security hardening applied
- **Performance**: Significant performance improvements

### Future Migrations
- **v1.x to v2.0**: Major architecture changes, data export/import required
- **Plugin Compatibility**: v2.0 plugin system may require plugin updates

## Quality Assurance

### Testing Coverage
- **Unit Tests**: Core functionality testing
- **Integration Tests**: IPC and security testing
- **Security Tests**: Automated security validation
- **Performance Tests**: Benchmarking and optimization validation

### Release Criteria
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Cross-platform testing completed
- [ ] Performance benchmarks met
- [ ] Documentation updated

---

*This version map ensures clear evolution tracking and provides guidance for users and developers working with different versions of StickyNotes.*
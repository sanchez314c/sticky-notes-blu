# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in StickyNotes, please help us by reporting it responsibly.

### How to Report

1. **Email**: Send details to security@stickynotes.app (create this email alias)
2. **GitHub**: Use the "Report a security vulnerability" button in GitHub Security tab
3. **Private**: Do NOT report security vulnerabilities publicly

### What to Include

Please include the following information in your report:
- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact and severity
- Any suggested fixes or mitigations
- Your contact information for follow-up

### Our Response Process

1. **Acknowledgment**: We will acknowledge receipt within 48 hours
2. **Investigation**: We will investigate and validate the vulnerability
3. **Updates**: We will provide regular updates on our progress
4. **Fix**: We will develop and test a fix
5. **Disclosure**: We will coordinate disclosure with you

### Security Features

StickyNotes implements multiple layers of security:

#### Application Security
- **IPC Hardening**: Secure inter-process communication channels
- **Input Validation**: Multi-layer input sanitization and validation
- **Session Management**: Secure user session handling
- **Data Encryption**: Local data encryption at rest

#### Platform Security
- **Sandboxing**: Renderer processes run in sandboxed environments
- **Code Signing**: All releases are code-signed
- **Hardened Runtime**: macOS hardened runtime enabled
- **Privilege Separation**: Main and renderer processes separated

#### Development Security
- **Security Testing**: Automated security test suites
- **Dependency Scanning**: Regular vulnerability scanning
- **Code Review**: Security-focused code reviews
- **Audit Logging**: Comprehensive security event logging

### Responsible Disclosure

We kindly ask that you:
- Give us reasonable time to fix the issue before public disclosure
- Avoid accessing or modifying user data
- Respect the privacy and security of our users
- Do not perform DoS attacks or degrade service performance

### Recognition

We appreciate security researchers who help keep our users safe. With your permission, we will acknowledge your contribution in our security advisories and on our website.

### Contact

For security-related questions or concerns:
- Email: security@stickynotes.app
- GitHub Security Advisories: https://github.com/stickynotes/sticky-notes/security/advisories
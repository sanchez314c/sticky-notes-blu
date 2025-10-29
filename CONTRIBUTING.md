# Contributing Guidelines

## How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in GitHub Issues
2. Create a detailed bug report with:
   - Clear description of the bug
   - Steps to reproduce the issue
   - Expected behavior vs. actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node.js version, etc.)

### Suggesting Features
1. Check existing feature requests in GitHub Issues
2. Create a feature request with:
   - Problem the feature would solve
   - Proposed solution
   - Alternative solutions considered
   - Additional context or mockups

### Submitting Changes
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes following the existing code style
4. Add tests for new features
5. Ensure all tests pass
6. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
7. Push to the branch (`git push origin feature/AmazingFeature`)
8. Open a Pull Request

### Code Style
- Follow existing JavaScript/ES6+ conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Maintain consistent indentation (2 spaces)
- Update documentation for API changes

### Security Guidelines
- All IPC communication must use secure handlers
- Input validation required for all user inputs
- No hardcoded secrets or credentials
- Follow principle of least privilege
- Regular security audits required

### Testing
- Write unit tests for new features using Jest
- Include security tests for security-related changes
- Ensure all existing tests pass
- Maintain or improve code coverage
- Test on all supported platforms when possible

### Documentation
- Update README.md for significant changes
- Add JSDoc comments for new functions
- Update API documentation in `docs/api/`
- Include examples for new features

## Development Setup

```bash
# Clone and setup
git clone https://github.com/yourusername/stickynotes.git
cd stickynotes
npm install

# Development with security features
npm run start:secure

# Run tests
npm test

# Build for production
npm run dist
```

## Commit Message Guidelines

- Use present tense ("Add feature" not "Added feature")
- Start with a capital letter
- Keep the first line under 50 characters
- Reference issues with #123 format
- Use prefixes for different types of changes:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `style:` for formatting
  - `refactor:` for code restructuring
  - `test:` for testing
  - `security:` for security improvements

## License

By contributing to this project, you agree that your contributions will be licensed under the same MIT License that covers the project.
# 🔧 Run CODEFIX on StickyNotes App

## Quick Instructions for Claude to Fix the App

When you start a new Claude session in TEST4, tell Claude:

```
Please read and execute /swarm/prompts/CODEFIX.md to diagnose and fix all issues with the StickyNotes app that was built.
```

## Or Use This Complete Command:

```
1. Read /swarm/prompts/CODEFIX.md
2. Execute the diagnostic swarm deployment on the current app
3. The app files are in the TEST4 root directory (main.js, renderer.js, index.html, etc.)
4. Run all 6 diagnostic agents:
   - Architecture Analysis
   - Security Audit  
   - Performance Analysis
   - Code Quality Audit
   - Dependency Health
   - Functionality Completeness
5. Synthesize findings and generate fixes
6. Apply all fixes to the code
7. Test the app again
```

## Manual CODEFIX Execution Pattern:

```bash
# Phase 1: Diagnostic Swarms
opencode run -m "anthropic/claude-sonnet-4-20250514" "ARCHITECTURE ANALYSIS: Analyze the StickyNotes app code in /Users/heathen-admin/Desktop/v0/TEST4 for architectural issues" > codefix_architecture.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "SECURITY AUDIT: Analyze the StickyNotes app for security vulnerabilities" > codefix_security.txt &

opencode run -m "anthropic/claude-sonnet-4-20250514" "FUNCTIONALITY AUDIT: Check for broken or incomplete features in the StickyNotes app" > codefix_functionality.txt &

# Wait for completion
sleep 10

# Phase 2: Generate Fixes
cat codefix_*.txt > all_issues.txt
opencode run -m "anthropic/claude-opus-4-1-20250805" "GENERATE FIXES: Based on all issues found in all_issues.txt, create specific code fixes for the StickyNotes app" > FIXES.md &

# Phase 3: Apply Fixes
# Claude should read FIXES.md and apply all recommended changes
```

## Expected CODEFIX Results:

1. **Find Missing Dependencies**: electron-store import issues
2. **Fix Path Problems**: Correct file paths for resources
3. **Security Fixes**: Context isolation, preload security
4. **Functionality Repairs**: Note persistence, window management
5. **Error Handling**: Add try-catch blocks where needed
6. **Visual Testing**: Screenshots to verify UI works

## Current Known Issues to Fix:

Based on the error you showed, CODEFIX should find and fix:
- electron-store import/require issues
- Resource file paths (icons, etc.)
- Any missing error handling
- Build configuration issues

## After CODEFIX Completes:

```bash
# Test the fixed app
npm start

# If it works, build for distribution
npm run dist:mac
```

## Remember:
- CODEFIX.md contains the COMPLETE diagnostic and repair methodology
- Visual testing with screenshots is MANDATORY
- All 6 diagnostic agents must run for comprehensive analysis
- The synthesis phase creates actionable fixes
- Apply fixes systematically and test after each major change
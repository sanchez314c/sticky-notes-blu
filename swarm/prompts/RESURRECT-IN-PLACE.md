# 🔥 SWARM CODEBASE RESURRECTION FRAMEWORK
## Fix Existing Code IN-PLACE - No Rebuild Allowed

**[BROKEN_PROJECT_PATH]**

---

## 🚨 CLAUDE: RESURRECTION MODE ACTIVATED 🚨

You are about to resurrect a broken/failing codebase WITHOUT rebuilding it. All fixes must be applied to the EXISTING code.

### 🔴🔴🔴 MANDATORY FIRST ACTION: TodoWrite 🔴🔴🔴

**YOU MUST CALL TodoWrite WITH THIS EXACT STRUCTURE:**

```javascript
TodoWrite({
  todos: [
    {content: "Phase 0: Emergency Triage & Diagnosis", status: "pending", activeForm: "Triaging issues"},
    {content: "Phase 1: Critical Bug Identification", status: "pending", activeForm: "Finding bugs"},
    {content: "Phase 2: Dependency Repair", status: "pending", activeForm: "Fixing dependencies"},
    {content: "Phase 3: Code Repair Swarms", status: "pending", activeForm: "Repairing code"},
    {content: "Phase 4: Missing File Recovery", status: "pending", activeForm: "Recovering files"},
    {content: "Phase 5: Build System Repair", status: "pending", activeForm: "Fixing build"},
    {content: "Phase 6: VISUAL TESTING [MANDATORY - USE MCP]", status: "pending", activeForm: "Visual testing with screenshots"},
    {content: "Phase 7: Error Detection & Fix Loop", status: "pending", activeForm: "Fixing visual errors"},
    {content: "Phase 8: Final Visual Validation [MANDATORY]", status: "pending", activeForm: "Final screenshot validation"},
    {content: "Phase 9: Documentation Update", status: "pending", activeForm: "Updating docs"},
    {content: "Phase 10: Final Verification with Proof", status: "pending", activeForm: "Verifying with screenshots"}
  ]
})
```

---

## Phase 0: EMERGENCY TRIAGE (15-20 PARALLEL DIAGNOSTIC SWARMS)

**FIND EVERYTHING THAT'S BROKEN:**

```bash
# Navigate to broken project
BROKEN_PROJECT="[BROKEN_PROJECT_PATH]"
cd "$BROKEN_PROJECT"

# Create repair tracking
mkdir -p .swarm-repair/diagnostics
mkdir -p .swarm-repair/fixes
mkdir -p .swarm-repair/backups

# BACKUP EVERYTHING FIRST
cp -r . .swarm-repair/backups/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

# PARALLEL DIAGNOSTIC SWARMS
(
# 1. Build Failure Diagnosis
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
npm run build 2>&1 | head -200 | opencode run -m "anthropic/claude-sonnet-4-20250514" "BUILD FAILURE DIAGNOSIS: Analyze these build errors. Identify: 1) Root cause of each error 2) Missing dependencies 3) Syntax errors 4) Import/export issues 5) Configuration problems. Output specific fixes needed." > .swarm-repair/diagnostics/build_errors.txt &

# 2. Runtime Error Detection
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
npm start 2>&1 | timeout 5s head -200 | opencode run -m "anthropic/claude-sonnet-4-20250514" "RUNTIME ERROR ANALYSIS: Identify all runtime failures. Document: 1) Crash causes 2) Undefined references 3) Type errors 4) Promise rejections 5) Memory leaks. Provide specific code fixes." > .swarm-repair/diagnostics/runtime_errors.txt &

# 3. Test Failure Analysis
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
npm test 2>&1 | head -300 | opencode run -m "anthropic/claude-sonnet-4-20250514" "TEST FAILURE ANALYSIS: Analyze failing tests. Identify: 1) Broken test cases 2) Assertion failures 3) Setup/teardown issues 4) Mock problems 5) Coverage gaps. Provide fixes for each." > .swarm-repair/diagnostics/test_failures.txt &

# 4. Dependency Conflict Resolution
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
npm ls 2>&1 | head -200 | opencode run -m "anthropic/claude-sonnet-4-20250514" "DEPENDENCY CONFLICT ANALYSIS: Identify dependency issues. Find: 1) Version conflicts 2) Missing packages 3) Peer dependency problems 4) Circular dependencies 5) Security vulnerabilities. Provide resolution commands." > .swarm-repair/diagnostics/dependency_issues.txt &

# 5. Syntax Error Scanner
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -not -path "*/node_modules/*" -exec sh -c 'node --check "$1" 2>&1 || echo "SYNTAX ERROR: $1"' _ {} \; | head -100 | opencode run -m "anthropic/claude-sonnet-4-20250514" "SYNTAX ERROR SCAN: Fix all syntax errors. Provide corrected code for each file." > .swarm-repair/diagnostics/syntax_errors.txt &

# 6. TypeScript Error Analysis (if applicable)
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
npx tsc --noEmit 2>&1 | head -300 | opencode run -m "anthropic/claude-sonnet-4-20250514" "TYPESCRIPT ERROR ANALYSIS: Fix all type errors. Provide: 1) Type corrections 2) Interface fixes 3) Generic solutions 4) Any type eliminations 5) Strict mode fixes." > .swarm-repair/diagnostics/typescript_errors.txt &

# 7. Linting Error Fixes
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
npm run lint 2>&1 | head -300 | opencode run -m "anthropic/claude-sonnet-4-20250514" "LINTING ERROR FIXES: Provide automatic fixes for all linting errors. Include: 1) Code style fixes 2) Best practice violations 3) Security issues 4) Performance problems 5) Accessibility issues." > .swarm-repair/diagnostics/lint_errors.txt &

# 8. Missing File Detection
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
find . -type f \( -name "*.js" -o -name "*.ts" \) -not -path "*/node_modules/*" -exec grep -l "import.*from\|require(" {} \; | xargs -I {} sh -c 'grep -h "import.*from\|require(" "{}" | grep -v "node_modules"' | sort -u | opencode run -m "anthropic/claude-sonnet-4-20250514" "MISSING FILE DETECTION: Identify all missing imports/files. Generate placeholder files or suggest npm packages to install." > .swarm-repair/diagnostics/missing_files.txt &

# 9. Configuration Repair
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
find . -name "*.config.js" -o -name "*.config.ts" -o -name ".env*" -o -name "*.json" | xargs ls -la 2>&1 | opencode run -m "anthropic/claude-sonnet-4-20250514" "CONFIGURATION REPAIR: Identify misconfigured files. Fix: 1) Webpack config 2) Babel config 3) TypeScript config 4) Environment variables 5) Package.json scripts." > .swarm-repair/diagnostics/config_issues.txt &

# 10. Database/API Connection Issues
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
grep -r "connect\|mongoose\|sequelize\|knex\|axios\|fetch" --include="*.js" --include="*.ts" . 2>/dev/null | head -100 | opencode run -m "anthropic/claude-sonnet-4-20250514" "CONNECTION ISSUE ANALYSIS: Fix all database and API connection problems. Provide: 1) Connection string fixes 2) Timeout adjustments 3) Retry logic 4) Error handling 5) Fallback strategies." > .swarm-repair/diagnostics/connection_issues.txt &

wait
echo "✅ DIAGNOSTIC PHASE COMPLETE - All issues identified"
)
```

---

## Phase 1: AUTOMATED FIX APPLICATION (SURGICAL STRIKES)

**APPLY FIXES WITHOUT BREAKING WORKING CODE:**

```bash
# Combine all diagnostics
cat .swarm-repair/diagnostics/*.txt > .swarm-repair/diagnostics/all_issues.txt

# Generate Master Fix Plan
echo "MASTER REPAIR ORCHESTRATOR: Based on all diagnostics, create a PRECISE fix plan that:

1. **PRESERVES ALL WORKING CODE** - Do not touch anything that works
2. **FIXES ONLY BROKEN PARTS** - Surgical precision on errors
3. **MAINTAINS COMPATIBILITY** - Don't break existing integrations
4. **INCREMENTAL FIXES** - Apply fixes one at a time
5. **ROLLBACK CAPABILITY** - Each fix must be reversible

Generate a step-by-step fix sequence with specific file edits, ordered by priority:
- CRITICAL: App won't start without these
- HIGH: Major features broken
- MEDIUM: Important but not blocking
- LOW: Nice to have fixes

# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
Output exact Edit commands for each fix." | opencode run -m "anthropic/claude-opus-4-1-20250805" > .swarm-repair/FIX_PLAN.md
```

---

## Phase 2: PARALLEL FIX EXECUTION SWARMS

**EXECUTE FIXES IN PARALLEL WHERE SAFE:**

```bash
# Parse fix plan and execute
(
# Critical Dependency Fixes
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
echo "DEPENDENCY FIXER: Install missing packages and resolve conflicts" | opencode run -m "anthropic/claude-sonnet-4-20250514" "
Based on the diagnostic reports, execute these npm commands:
1. npm install [missing packages]
2. npm audit fix --force
3. npm dedupe
4. npm rebuild
Output the exact commands to run." > .swarm-repair/fixes/dependency_fixes.sh &

# Syntax Error Fixes (file by file)
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
echo "SYNTAX REPAIR SWARM: Fix all syntax errors in-place" | opencode run -m "anthropic/claude-sonnet-4-20250514" "
For each file with syntax errors, generate Edit tool commands that:
1. Fix unclosed brackets/parentheses
2. Add missing semicolons
3. Fix invalid tokens
4. Correct malformed statements
5. Fix import/export syntax
Use Edit tool with exact old_string and new_string." > .swarm-repair/fixes/syntax_fixes.txt &

# Type Error Fixes
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
echo "TYPE REPAIR SWARM: Fix all TypeScript/Flow type errors" | opencode run -m "anthropic/claude-sonnet-4-20250514" "
Generate Edit commands to:
1. Add missing type annotations
2. Fix type mismatches
3. Resolve 'any' types properly
4. Fix generic constraints
5. Add missing interfaces
Maintain type safety while fixing." > .swarm-repair/fixes/type_fixes.txt &

# Import/Require Fixes
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
echo "IMPORT REPAIR SWARM: Fix all import and require statements" | opencode run -m "anthropic/claude-sonnet-4-20250514" "
Generate fixes for:
1. Incorrect import paths
2. Missing file extensions
3. Circular dependencies
4. Default vs named imports
5. Module resolution issues
Output Edit commands for each file." > .swarm-repair/fixes/import_fixes.txt &

# Configuration Fixes
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
echo "CONFIG REPAIR SWARM: Fix all configuration files" | opencode run -m "anthropic/claude-sonnet-4-20250514" "
Fix configuration issues in:
1. webpack.config.js
2. tsconfig.json
3. .babelrc
4. package.json scripts
5. .env files
Provide complete corrected configurations." > .swarm-repair/fixes/config_fixes.txt &

wait
)
```

---

## Phase 3: MISSING FUNCTIONALITY RESTORATION

**RECREATE MISSING OR CORRUPTED FILES:**

```bash
echo "FILE RESTORATION SWARM: Recreate missing or corrupted files based on imports and usage patterns.

Analyze where files are imported from but don't exist, then:
1. Create stub implementations that satisfy imports
2. Implement basic functionality based on usage
3. Add proper exports
4. Include minimal working logic
5. Add TODO comments for complex logic

# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
Generate complete file contents for each missing file." | opencode run -m "anthropic/claude-sonnet-4-20250514"
```

---

## Phase 4: BUILD SYSTEM RESURRECTION

**FIX BUILD CONFIGURATION:**

```bash
# Fix package.json scripts
echo "BUILD SCRIPT REPAIR: Fix or create proper build scripts in package.json:
{
  'scripts': {
    'start': '[working start command]',
    'build': '[working build command]',
    'test': '[working test command]',
    'lint': '[working lint command]',
    'dev': '[working dev command]'
  }
}

# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
Ensure all scripts work with current codebase state." | opencode run -m "anthropic/claude-sonnet-4-20250514"

# Ensure build tools are installed
npm install --save-dev webpack webpack-cli babel-loader @babel/core @babel/preset-env @babel/preset-react typescript ts-loader 2>/dev/null
```

---

## Phase 4.5: 🔴 CRITICAL - MULTI-PLATFORM BUILD EXECUTION

**AFTER FIXING BUILD SYSTEM, BUILD FOR ALL PLATFORMS:**

```bash
# Navigate to project directory
cd "$BROKEN_PROJECT"

echo -e "\n🔴 ════════════════════════════════════════════════════"
echo -e "🔴     EXECUTING MULTI-PLATFORM BUILD"
echo -e "🔴     MAC, WINDOWS, LINUX - ALL PLATFORMS"
echo -e "🔴 ════════════════════════════════════════════════════"

# Make build script executable
chmod +x SWARM/scripts/build-systems/compile-build-dist.sh

# RUN THE MASTER BUILD SCRIPT - BUILDS FOR ALL PLATFORMS
./SWARM/scripts/build-systems/compile-build-dist.sh .

# Verify all platforms were built
echo "Checking build outputs..."
ls -la dist/*.dmg 2>/dev/null && echo "✅ Mac builds found" || echo "❌ Mac builds missing"
ls -la dist/*.exe 2>/dev/null && echo "✅ Windows builds found" || echo "❌ Windows builds missing"  
ls -la dist/*.AppImage 2>/dev/null && echo "✅ Linux builds found" || echo "❌ Linux builds missing"

# If specific platform build needed, also run:
# For Electron apps specifically:
if [ -f "package.json" ] && grep -q "electron" package.json; then
    npm install --save-dev electron electron-builder
    npm run dist || npx electron-builder --mac --win --linux --x64 --arm64
fi

# For Python apps specifically:
if [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
    pip install pyinstaller
    pyinstaller --onefile --windowed main.py || pyinstaller --onefile --windowed app.py
fi

# For Swift apps specifically:
if [ -f "Package.swift" ]; then
    swift build --configuration release
fi

echo "✅ Multi-platform build complete!"
```

---

## Phase 5: INCREMENTAL TESTING & VALIDATION

**TEST EACH FIX AS APPLIED:**

```bash
# Test after each fix category
echo "INCREMENTAL TEST RUNNER: After each fix category, run:

1. Syntax check: node --check [file]
2. Type check: npx tsc --noEmit
3. Lint check: npm run lint
4. Build test: npm run build
5. Start test: timeout 10 npm start

If any test fails after a fix:
- Rollback that specific fix
- Try alternative approach
- Document as 'unfixable without refactor'

# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
Continue until all possible fixes are applied." | opencode run -m "anthropic/claude-sonnet-4-20250514"
```

---

## Phase 6: 🔴 MANDATORY VISUAL TESTING WITH MCP SERVERS

**YOU MUST EXECUTE THIS PHASE OR THE TASK FAILS:**

```bash
echo "🔴 VISUAL TESTING IS MANDATORY - ACTIVATING MCP SERVERS"

# 1. ACTIVATE VNC DESKTOP MCP
npx @baryhuang/vnc-remote-macos &
sleep 2

# 2. RUN THE VISUAL TESTING ENFORCER
./SWARM/scripts/monitoring/VISUAL_TESTING_ENFORCER.sh "$BROKEN_PROJECT"

# 3. CAPTURE SCREENSHOTS USING PLAYWRIGHT MCP
# Use the mcp__playwright__playwright_screenshot command
# Example:
# await mcp__playwright__playwright_navigate({ url: "file:///path/to/app" })
# await mcp__playwright__playwright_screenshot({ 
#   name: "resurrection_test",
#   fullPage: true,
#   savePng: true 
# })

# 4. ANALYZE SCREENSHOTS FOR ERRORS
grep -i "error\|exception\|crash\|failed" screenshots/*.txt && {
    echo "❌ ERRORS DETECTED - MUST FIX BEFORE CONTINUING"
    # Return to Phase 3 to fix detected errors
} || {
    echo "✅ No errors detected in visual testing"
}

# 5. USE APPLESCRIPT FOR UI AUTOMATION
osascript -e 'tell application "System Events" to keystroke return'
osascript -e 'tell application "System Events" to key code 53' # ESC

# 6. ITERATE UNTIL CLEAN
# Repeat visual testing until NO errors remain
```

## Phase 7: ERROR DETECTION & FIX LOOP

**AUTOMATICALLY FIX VISUAL ERRORS:**

```bash
# Based on visual testing results, apply fixes
if [ -f "screenshots/errors_detected.txt" ]; then
    echo "VISUAL ERROR FIX SWARM: Fix all visual errors detected in screenshots.
    
    Errors found:
    $(cat screenshots/errors_detected.txt)
    
    Generate Edit commands to fix each visual error.
    Focus on:
    1. UI rendering issues
    2. Missing assets/icons
    3. Layout problems
    4. Error dialogs
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
    5. Crash messages" | opencode run -m "anthropic/claude-sonnet-4-20250514"
    
    # Re-run visual testing after fixes
    ./SWARM/scripts/monitoring/VISUAL_TESTING_ENFORCER.sh "$BROKEN_PROJECT"
fi
```

## Phase 8: FINAL VISUAL VALIDATION [MANDATORY]

**CAPTURE PROOF OF SUCCESS:**

```bash
# Final screenshot capture for proof
echo "📸 CAPTURING FINAL SUCCESS SCREENSHOTS"

# Capture multiple angles
for view in "main" "settings" "features" "about"; do
    # Use MCP to navigate and capture
    echo "Capturing $view view..."
    screencapture -x "screenshots/final_${view}.png"
done

# Generate visual proof report
echo "VISUAL TESTING REPORT
=====================
Date: $(date)
Project: $BROKEN_PROJECT
Status: RESURRECTED
Screenshots Captured: $(ls screenshots/*.png | wc -l)
Errors Fixed: $(grep -c "FIXED" .swarm-repair/fixes/*.txt)
Final State: OPERATIONAL

Visual Proof Available:
$(ls screenshots/final_*.png)
" > RESURRECTION_VISUAL_PROOF.md

echo "✅ VISUAL VALIDATION COMPLETE WITH PROOF"
```

## Phase 9: VALIDATION & VERIFICATION

**ENSURE RESURRECTION SUCCESS:**

```bash
# Final validation suite
(
echo "Running final validation..."

# Check if app builds
npm run build && echo "✅ BUILD: SUCCESS" || echo "❌ BUILD: FAILED"

# Check if app starts
timeout 10 npm start && echo "✅ START: SUCCESS" || echo "⚠️ START: TIMEOUT/FAILED"

# Check if tests pass
npm test && echo "✅ TESTS: PASSING" || echo "⚠️ TESTS: SOME FAILURES"

# Check for remaining errors
npx tsc --noEmit 2>&1 | grep -c "error" | xargs -I {} echo "TypeScript Errors Remaining: {}"
npm run lint 2>&1 | grep -c "error" | xargs -I {} echo "Lint Errors Remaining: {}"
)
```

---

## Phase 7: RESURRECTION REPORT

**DOCUMENT WHAT WAS FIXED:**

```bash
echo "RESURRECTION REPORT GENERATOR: Create comprehensive report:

# RESURRECTION SUMMARY
## Original State
- Build Status: [BROKEN/FAILING]
- Runtime Status: [CRASHING/UNSTABLE]
- Test Coverage: [X% / FAILING]
- Type Safety: [ERRORS: X]

## Current State  
- Build Status: [WORKING/PARTIAL]
- Runtime Status: [RUNNING/STABLE]
- Test Coverage: [X% / PASSING]
- Type Safety: [ERRORS: X]

## Fixes Applied
1. [List each fix with file:line]
2. [Describe what was changed]
3. [Impact of the change]

## Remaining Issues
- Issues that need refactoring to fix
- Deprecated dependencies that need major updates
- Architectural problems requiring rebuild

## Recommendations
- Immediate actions needed
- Short-term improvements
- Long-term migration plan

" > .swarm-repair/RESURRECTION_REPORT.md
```

---

## SPECIAL RESURRECTION RULES

### DO NOT:
- ❌ Delete any existing files
- ❌ Rename core files
- ❌ Change fundamental architecture
- ❌ Upgrade major versions without permission
- ❌ Remove "working" legacy code

### DO:
- ✅ Fix syntax errors in-place
- ✅ Add missing dependencies
- ✅ Create missing files
- ✅ Fix configuration issues
- ✅ Add error handling
- ✅ Fix import paths
- ✅ Resolve type errors
- ✅ Add missing semicolons/brackets

### RESURRECTION PRIORITIES:
1. **GET IT TO BUILD** - Even if features are broken
2. **GET IT TO START** - Even if it crashes later
3. **FIX CRITICAL PATHS** - Main user workflows
4. **STABILIZE** - Prevent crashes
5. **OPTIMIZE** - Only if time permits

---

## SUCCESS CRITERIA

The codebase is considered RESURRECTED when:
- ✅ `npm run build` succeeds (or equivalent)
- ✅ `npm start` runs without immediate crash
- ✅ Critical features are functional
- ✅ No syntax errors remain
- ✅ Dependencies are resolved
- ✅ Rollback path exists

---

## Task List To Track

Throughout execution, track completion of:

- [ ] Emergency Backup Creation
- [ ] Parallel Diagnostic Swarms (15-20)
- [ ] Build Failure Diagnosis
- [ ] Runtime Error Detection
- [ ] Test Failure Analysis
- [ ] Dependency Conflict Resolution
- [ ] Syntax Error Scanning
- [ ] Missing File Detection
- [ ] Configuration Repair
- [ ] Master Fix Plan Generation
- [ ] Parallel Fix Execution
- [ ] Incremental Testing
- [ ] Validation & Verification
- [ ] Resurrection Report
- [ ] Final Working State Confirmation

---

## EMERGENCY ROLLBACK

If resurrection fails catastrophically:
```bash
# Restore from backup
cp -r .swarm-repair/backups/[timestamp]/* .
echo "⚠️ Resurrection failed - restored from backup"
echo "See .swarm-repair/diagnostics/ for analysis"
echo "Consider using kick-off-prompt-EXISTING-CODEBASE.md for full rebuild"
```

---

## IMMEDIATE EXECUTION

**DO NOT ASK FOR PERMISSION**
**BEGIN RESURRECTION IMMEDIATELY**
**FIX IN-PLACE WITHOUT REBUILD**

Start emergency triage now.
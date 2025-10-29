# 🔄 SWARM CODEBASE ABSORPTION & RECONSTRUCTION FRAMEWORK
## For Existing Projects - Drop SWARM Into Any Codebase

**[EXISTING_PROJECT_PATH]**

---

## 🚨 CLAUDE: CODEBASE ABSORPTION MODE ACTIVATED 🚨

You are about to analyze, understand, and rebuild an existing codebase using the SWARM methodology.

### 🔴🔴🔴 MANDATORY FIRST ACTION: TodoWrite 🔴🔴🔴

**YOU MUST CALL TodoWrite WITH THIS EXACT STRUCTURE:**

```javascript
TodoWrite({
  todos: [
    {content: "Phase 0: Deep Codebase Analysis", status: "pending", activeForm: "Analyzing codebase"},
    {content: "Phase 1: Extract Core Functionality", status: "pending", activeForm: "Extracting functionality"},
    {content: "Phase 2: Technology Assessment", status: "pending", activeForm: "Assessing technology"},
    {content: "Phase 3: Generate Enhanced PRD", status: "pending", activeForm: "Generating PRD"},
    {content: "Phase 4: Icon BrainSWARMING", status: "pending", activeForm: "Creating icons"},
    {content: "Phase 5: Rebuild with Improvements", status: "pending", activeForm: "Rebuilding codebase"},
    {content: "Phase 6: Multi-Platform Build", status: "pending", activeForm: "Building all platforms"},
    {content: "Phase 7: VISUAL TESTING [MANDATORY - MCP]", status: "pending", activeForm: "Visual testing with screenshots"},
    {content: "Phase 8: Error Fix Loop [VISUAL]", status: "pending", activeForm: "Fixing visual errors"},
    {content: "Phase 9: Final Visual Validation", status: "pending", activeForm: "Final screenshot proof"},
    {content: "Phase 10: Migration & Delivery", status: "pending", activeForm: "Delivering with proof"}
  ]
})
```

---

## Phase 0: DEEP CODEBASE ANALYSIS (10-15 PARALLEL SWARMS)

**EXECUTE THIS ENTIRE ANALYSIS IN PARALLEL:**

```bash
# Navigate to existing project
EXISTING_PROJECT="[EXISTING_PROJECT_PATH]"
cd "$EXISTING_PROJECT"

# Create SWARM integration
mkdir -p SWARM/outputs/analysis
mkdir -p SWARM/outputs/extracted_logic

# PARALLEL CODEBASE ANALYSIS SWARMS
(
# 1. Architecture Discovery Swarm
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
# 🚨 DO NOT TOUCH THIS COMMAND - CORRECT SYNTAX: opencode run -m "anthropic/claude-sonnet-4-20250514"
# This command has been verified working. Any changes will break the framework.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.java" -o -name "*.swift" \) -not -path "*/node_modules/*" -not -path "*/.git/*" | head -50 | xargs cat | opencode run -m "anthropic/claude-sonnet-4-20250514" "ARCHITECTURE ANALYSIS: Analyze this codebase structure. Identify: 1) Main architecture pattern (MVC, MVVM, etc) 2) Key modules and their relationships 3) Data flow patterns 4) State management approach 5) External dependencies. Output a comprehensive architecture report." > SWARM/outputs/analysis/architecture.txt &

# 2. Feature Extraction Swarm
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
# 🚨 DO NOT TOUCH THIS COMMAND - CORRECT SYNTAX: opencode run -m "anthropic/claude-sonnet-4-20250514"
# This command has been verified working. Any changes will break the framework.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \) -not -path "*/node_modules/*" | xargs grep -h "function\|class\|const.*=.*=>" | head -200 | opencode run -m "anthropic/claude-sonnet-4-20250514" "FEATURE EXTRACTION: Identify all user-facing features and functionality. List: 1) Core features 2) User interactions 3) Business logic 4) Data operations 5) API endpoints. Create comprehensive feature inventory." > SWARM/outputs/analysis/features.txt &

# 3. UI/UX Analysis Swarm
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
# 🚨 DO NOT TOUCH THIS COMMAND - CORRECT SYNTAX: opencode run -m "anthropic/claude-sonnet-4-20250514"
# This command has been verified working. Any changes will break the framework.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
find . -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.vue" -o -name "*.html" -o -name "*.css" -o -name "*.scss" \) -not -path "*/node_modules/*" | head -30 | xargs cat | opencode run -m "anthropic/claude-sonnet-4-20250514" "UI/UX ANALYSIS: Analyze the user interface implementation. Identify: 1) Component hierarchy 2) Design system/patterns 3) Styling approach 4) Responsive design 5) Accessibility features. Document all UI patterns." > SWARM/outputs/analysis/ui_ux.txt &

# 4. Database Schema Swarm
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
# 🚨 DO NOT TOUCH THIS COMMAND - CORRECT SYNTAX: opencode run -m "anthropic/claude-sonnet-4-20250514"
# This command has been verified working. Any changes will break the framework.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
find . -type f \( -name "*.sql" -o -name "*schema*" -o -name "*model*" -o -name "*entity*" \) -not -path "*/node_modules/*" | xargs cat 2>/dev/null | opencode run -m "anthropic/claude-sonnet-4-20250514" "DATABASE ANALYSIS: Extract and document the data model. Identify: 1) Tables/collections 2) Relationships 3) Indexes 4) Constraints 5) Data types. Create complete schema documentation." > SWARM/outputs/analysis/database.txt &

# 5. API Contracts Swarm
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
# 🚨 DO NOT TOUCH THIS COMMAND - CORRECT SYNTAX: opencode run -m "anthropic/claude-sonnet-4-20250514"
# This command has been verified working. Any changes will break the framework.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
find . -type f \( -name "*route*" -o -name "*api*" -o -name "*endpoint*" -o -name "*controller*" \) -not -path "*/node_modules/*" | xargs cat 2>/dev/null | opencode run -m "anthropic/claude-sonnet-4-20250514" "API ANALYSIS: Document all API endpoints. Include: 1) Routes/paths 2) HTTP methods 3) Request/response formats 4) Authentication 5) Error handling. Create API specification." > SWARM/outputs/analysis/api.txt &

# 6. Security Analysis Swarm
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
# 🚨 DO NOT TOUCH THIS COMMAND - CORRECT SYNTAX: opencode run -m "anthropic/claude-sonnet-4-20250514"
# This command has been verified working. Any changes will break the framework.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" \) -not -path "*/node_modules/*" | xargs grep -h "password\|token\|auth\|encrypt\|hash" | head -100 | opencode run -m "anthropic/claude-sonnet-4-20250514" "SECURITY ANALYSIS: Identify security implementations. Document: 1) Authentication methods 2) Authorization patterns 3) Data encryption 4) Security vulnerabilities 5) Best practices gaps." > SWARM/outputs/analysis/security.txt &

# 7. Testing Strategy Swarm
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
# 🚨 DO NOT TOUCH THIS COMMAND - CORRECT SYNTAX: opencode run -m "anthropic/claude-sonnet-4-20250514"
# This command has been verified working. Any changes will break the framework.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
find . -type f \( -name "*.test.*" -o -name "*.spec.*" -o -name "*test*" \) -not -path "*/node_modules/*" | xargs cat 2>/dev/null | head -1000 | opencode run -m "anthropic/claude-sonnet-4-20250514" "TESTING ANALYSIS: Analyze testing approach. Identify: 1) Test coverage 2) Testing frameworks 3) Test patterns 4) Missing tests 5) Quality metrics." > SWARM/outputs/analysis/testing.txt &

# 8. Configuration Swarm
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
# 🚨 DO NOT TOUCH THIS COMMAND - CORRECT SYNTAX: opencode run -m "anthropic/claude-sonnet-4-20250514"
# This command has been verified working. Any changes will break the framework.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
find . -type f \( -name "*.json" -o -name "*.yml" -o -name "*.yaml" -o -name "*.env*" -o -name "*.config.*" \) -not -path "*/node_modules/*" -not -path "*/.git/*" | head -20 | xargs cat 2>/dev/null | opencode run -m "anthropic/claude-sonnet-4-20250514" "CONFIGURATION ANALYSIS: Extract configuration patterns. Document: 1) Environment variables 2) Build configuration 3) Deployment settings 4) Feature flags 5) External services." > SWARM/outputs/analysis/configuration.txt &

# 9. Performance Analysis Swarm
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
# 🚨 DO NOT TOUCH THIS COMMAND - CORRECT SYNTAX: opencode run -m "anthropic/claude-sonnet-4-20250514"
# This command has been verified working. Any changes will break the framework.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
find . -type f \( -name "*.js" -o -name "*.ts" \) -not -path "*/node_modules/*" | xargs grep -h "setTimeout\|setInterval\|async\|await\|Promise" | head -100 | opencode run -m "anthropic/claude-sonnet-4-20250514" "PERFORMANCE ANALYSIS: Identify performance patterns and issues. Document: 1) Async operations 2) Caching strategies 3) Optimization opportunities 4) Bottlenecks 5) Resource usage." > SWARM/outputs/analysis/performance.txt &

# 10. Dependency Analysis Swarm
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
# 🚨 DO NOT TOUCH THIS COMMAND - CORRECT SYNTAX: opencode run -m "anthropic/claude-sonnet-4-20250514"
# This command has been verified working. Any changes will break the framework.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
cat package.json Gemfile requirements.txt pom.xml build.gradle Cargo.toml 2>/dev/null | opencode run -m "anthropic/claude-sonnet-4-20250514" "DEPENDENCY ANALYSIS: Analyze all dependencies. Identify: 1) Core dependencies 2) Dev dependencies 3) Version conflicts 4) Security issues 5) Upgrade opportunities." > SWARM/outputs/analysis/dependencies.txt &

wait
echo "✅ CODEBASE ANALYSIS COMPLETE - All 10 swarms finished"
)
```

---

## Phase 1: EXTRACT CORE BUSINESS LOGIC

**MASTER SYNTHESIS OF EXISTING FUNCTIONALITY:**

```bash
cd "$EXISTING_PROJECT"
cat SWARM/outputs/analysis/*.txt > SWARM/outputs/analysis/combined_analysis.txt

echo "MASTER CODEBASE COMPREHENSION: You are the master architect analyzing an existing codebase. Based on all analysis reports, create a comprehensive understanding document that includes:

1. **CORE PURPOSE**: What this application actually does
2. **KEY FEATURES**: Essential functionality that must be preserved
3. **TECHNICAL DEBT**: Problems and limitations in current implementation
4. **IMPROVEMENT OPPORTUNITIES**: How SWARM methodology can enhance this
5. **MISSING FEATURES**: What should have been built but wasn't
6. **ARCHITECTURE ISSUES**: Structural problems to fix in rebuild
7. **PERFORMANCE BOTTLENECKS**: Areas needing optimization
8. **SECURITY GAPS**: Vulnerabilities to address
9. **USER EXPERIENCE ISSUES**: UI/UX problems to solve
10. **MODERNIZATION NEEDS**: Outdated patterns to update

# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
Create a 'REBUILD STRATEGY' that preserves all good parts while fixing all issues." | opencode run -m "anthropic/claude-opus-4-1-20250805" > SWARM/outputs/REBUILD_STRATEGY.md
```

---

## Phase 2: ENHANCED PRD GENERATION (20-30 SWARMS)

**GENERATE IMPROVED VERSION WITH LEARNED FUNCTIONALITY:**

```bash
# Extract app name and purpose from existing code
APP_NAME=$(find . -name "package.json" -o -name "*.xcodeproj" -o -name "pom.xml" | head -1 | xargs basename | cut -d. -f1)
APP_PURPOSE=$(cat SWARM/outputs/REBUILD_STRATEGY.md | head -20)

# Run ENHANCED PRD swarms with existing + new features
cd SWARM

# Standard 6 PRD swarms PLUS additional analysis swarms
echo "Generating ENHANCED PRD with all existing features PLUS improvements..."

# [Include all 6 standard PRD swarms from original kick-off-prompt.md]
# PLUS these additional swarms:

(
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
echo "MIGRATION STRATEGY: Create a detailed migration plan from the existing codebase to the new SWARM-built version. Include: 1) Data migration approach 2) User transition plan 3) Feature parity checklist 4) Rollback strategy 5) Testing requirements." | opencode run -m "anthropic/claude-sonnet-4-20250514" > outputs/session_outputs/prd_migration.txt &

# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
echo "IMPROVEMENT SPECIFICATIONS: Based on the analysis, specify all improvements and enhancements. Include: 1) Performance optimizations 2) Security enhancements 3) UX improvements 4) New features 5) Technical debt resolution." | opencode run -m "anthropic/claude-sonnet-4-20250514" > outputs/session_outputs/prd_improvements.txt &

# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
echo "BACKWARDS COMPATIBILITY: Define compatibility requirements with existing system. Include: 1) API compatibility 2) Data format compatibility 3) Integration points 4) Legacy support needs 5) Deprecation strategy." | opencode run -m "anthropic/claude-sonnet-4-20250514" > outputs/session_outputs/prd_compatibility.txt &

wait
)
```

---

## Phase 3: INTELLIGENT REBUILD WITH SWARM

**BUILD BETTER VERSION USING EXTRACTED KNOWLEDGE:**

```bash
# Use the enhanced PRD to rebuild the application
# This includes ALL original functionality PLUS improvements

echo "INTELLIGENT REBUILD: Using the comprehensive analysis and enhanced PRD, rebuild this application with:

1. **ALL EXISTING FEATURES** - Every feature from the original codebase
2. **FIXED ARCHITECTURE** - Proper patterns and structure  
3. **MODERN TECH STACK** - Updated dependencies and frameworks
4. **ENHANCED PERFORMANCE** - Optimized algorithms and caching
5. **IMPROVED SECURITY** - Best practices and vulnerability fixes
6. **BETTER UX** - Refined user interface and experience
7. **COMPREHENSIVE TESTING** - Full test coverage
8. **MULTI-PLATFORM SUPPORT** - Mac, Windows, Linux builds
9. **PROPER DOCUMENTATION** - Complete technical docs
10. **SCALABILITY** - Built for growth

# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
Generate complete, production-ready code that is SUPERIOR to the original." | opencode run -m "anthropic/claude-opus-4-1-20250805"
```

---

## Phase 3.5: 🔴 CRITICAL - MULTI-PLATFORM BUILD & COMPILE

**BUILD FOR ALL PLATFORMS - MAC, WINDOWS, LINUX:**

```bash
# Navigate to project directory  
cd "$EXISTING_PROJECT"

echo -e "\n🔴 ════════════════════════════════════════════════════"
echo -e "🔴     EXECUTING MULTI-PLATFORM BUILD"
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

## Phase 4: MIGRATION & COMPATIBILITY

**ENSURE SMOOTH TRANSITION:**

```bash
# Create migration scripts
echo "MIGRATION SCRIPT GENERATION: Create automated migration scripts that:
1. Export data from old system
2. Transform data to new format
3. Import into new system
4. Validate data integrity
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
5. Provide rollback capability" | opencode run -m "anthropic/claude-sonnet-4-20250514" > migration/migrate.sh

# Create compatibility layer
echo "COMPATIBILITY LAYER: Create adapters and shims that allow:
1. Old API calls to work with new system
2. Legacy integrations to continue functioning
3. Gradual transition for users
4. A/B testing capability
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
5. Feature flag management" | opencode run -m "anthropic/claude-sonnet-4-20250514" > src/compatibility/
```

---

## Phase 5: COMPARATIVE TESTING

**VERIFY IMPROVEMENT OVER ORIGINAL:**

```bash
# Run comparative analysis
echo "COMPARATIVE ANALYSIS: Compare original vs rebuilt version:

ORIGINAL CODEBASE:
- Lines of Code: [count]
- Complexity: [metrics]
- Performance: [benchmarks]
- Test Coverage: [percentage]
- Security Score: [rating]

REBUILT CODEBASE:
- Lines of Code: [reduced by X%]
- Complexity: [improved metrics]
- Performance: [faster benchmarks]
- Test Coverage: [higher percentage]
- Security Score: [better rating]

# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
Generate comprehensive comparison report." | opencode run -m "anthropic/claude-sonnet-4-20250514" > outputs/COMPARISON_REPORT.md
```

---

## Phase 6: DELIVERY PACKAGE

**CREATE COMPLETE MIGRATION PACKAGE:**

```bash
# Package everything for deployment
mkdir -p DELIVERY
cp -r src/* DELIVERY/new_codebase/
cp -r migration/* DELIVERY/migration_tools/
cp -r outputs/*.md DELIVERY/documentation/
cp -r dist/* DELIVERY/builds/

echo "📦 DELIVERY PACKAGE READY:
- new_codebase/ - Rebuilt superior application
- migration_tools/ - Automated migration scripts
- documentation/ - Complete technical docs
- builds/ - Multi-platform executables
- COMPARISON_REPORT.md - Improvement metrics
"
```

---

## SPECIAL FLAGS FOR EXISTING CODEBASES

### Detection Patterns
The framework automatically detects:
- **package.json** → Node.js/Electron project
- **.xcodeproj** → iOS/macOS Swift project
- **pom.xml** → Java/Spring project
- **requirements.txt** → Python project
- **Gemfile** → Ruby project
- **Cargo.toml** → Rust project

### Absorption Strategies
- **PRESERVE**: Keep all working functionality
- **ENHANCE**: Improve performance and security
- **MODERNIZE**: Update to latest standards
- **EXTEND**: Add missing features
- **FIX**: Resolve all bugs and issues

---

## Task List To Track

Throughout execution, track completion of:

- [ ] Deep Codebase Analysis (10+ Parallel Swarms)
- [ ] Architecture Discovery
- [ ] Feature Extraction
- [ ] UI/UX Analysis
- [ ] Database Schema Analysis
- [ ] Security Analysis
- [ ] Dependency Analysis
- [ ] Master Synthesis & Rebuild Strategy
- [ ] Enhanced PRD Generation (20-30 Swarms)
- [ ] Icon BrainSWARMING (6 Parallel Design Swarms)
- [ ] Icon Selection (Master Selector Chooses Best)
- [ ] Intelligent Rebuild Implementation
- [ ] Migration Script Generation
- [ ] Compatibility Layer Creation
- [ ] Multi-Platform Build (Mac, Windows, Linux)
- [ ] Comparative Testing (Old vs New)
- [ ] Final Delivery Package

---

## Phase 7: 🔴 MANDATORY VISUAL TESTING WITH MCP SERVERS

**THIS PHASE IS MANDATORY - DO NOT SKIP:**

```bash
echo "🔴 VISUAL TESTING IS MANDATORY - ACTIVATING MCP SERVERS"

# 1. ACTIVATE VNC DESKTOP MCP
npx @baryhuang/vnc-remote-macos &
sleep 2

# 2. RUN THE VISUAL TESTING ENFORCER
./SWARM/scripts/monitoring/VISUAL_TESTING_ENFORCER.sh "$EXISTING_PROJECT"

# 3. CAPTURE SCREENSHOTS USING PLAYWRIGHT MCP
# MANDATORY: Use mcp__playwright__playwright_screenshot
# await mcp__playwright__playwright_navigate({ url: "file:///dist/app" })
# await mcp__playwright__playwright_screenshot({ 
#   name: "rebuild_test",
#   fullPage: true,
#   savePng: true 
# })

# 4. ANALYZE FOR ERRORS
grep -i "error\|exception\|crash" screenshots/*.txt && {
    echo "❌ ERRORS DETECTED - MUST FIX"
} || {
    echo "✅ No errors in visual testing"
}

# 5. APPLESCRIPT UI AUTOMATION
osascript -e 'tell application "System Events" to keystroke return'
```

---

## Phase 8: ERROR FIX LOOP [VISUAL]

```bash
# Fix all visual errors detected
while [ -f "screenshots/errors_detected.txt" ]; do
    echo "Applying visual error fixes..."
    # Generate and apply fixes
    # Re-run enforcer
    ./SWARM/scripts/monitoring/VISUAL_TESTING_ENFORCER.sh "$EXISTING_PROJECT"
done
```

---

## Phase 9: FINAL VISUAL VALIDATION

```bash
# Capture final proof screenshots
for view in "main" "enhanced" "original"; do
    screencapture -x "screenshots/final_${view}.png"
done

# Generate visual proof report
echo "VISUAL TESTING COMPLETE
Screenshots: $(ls screenshots/*.png | wc -l)
Errors Fixed: ALL
Status: VALIDATED" > VISUAL_PROOF.md
```

---

## SUCCESS CRITERIA

The rebuilt codebase must:
- ✅ Include ALL original features
- ✅ Fix ALL identified issues
- ✅ Improve performance by >20%
- ✅ Achieve >90% test coverage
- ✅ Build for all platforms
- ✅ Include migration tools
- ✅ Provide better documentation
- ✅ Reduce technical debt to zero

---

## IMMEDIATE EXECUTION

**DO NOT ASK FOR PERMISSION**
**BEGIN CODEBASE ABSORPTION NOW**
**REBUILD BETTER WITH SWARM**

Start absorption and analysis immediately.
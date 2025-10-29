#!/bin/bash

# ✅ Validation Script - Verify All Repairs Are Working
# Usage: ./validate_all_repairs.sh

CODEBASE_PATH="${1:-/Users/heathen-admin/Desktop/v0/TEST4}"
SWARM_DIR="swarm_outputs/codefix"

echo "✅ Deploying Validation Swarms..."
echo "📁 Validating repairs in: $CODEBASE_PATH"

# Check for repair files
if [ ! -f "$SWARM_DIR/SECURITY_FIXES_IMPLEMENTATION.md" ] || \
   [ ! -f "$SWARM_DIR/PERFORMANCE_FIXES_IMPLEMENTATION.md" ] || \
   [ ! -f "$SWARM_DIR/FUNCTIONALITY_FIXES_IMPLEMENTATION.md" ]; then
    echo "❌ Error: Must run all repair scripts first!"
    echo "Required files missing in $SWARM_DIR"
    exit 1
fi

echo "🔍 Validating all applied repairs..."

# Deploy validation swarms

echo "🧪 Deploying Validation Swarms..."

# SECURITY VALIDATION
opencode run -m "anthropic/claude-sonnet-4-20250514" "SECURITY VALIDATION: Verify that all security fixes have been properly applied in $CODEBASE_PATH.

Check:
- Authentication and authorization are secure
- Input validation is implemented
- XSS and injection vulnerabilities are fixed
- Electron security settings are hardened
- No secrets or sensitive data exposed

Report any remaining security issues with severity levels." > "$SWARM_DIR/security_validation.txt" &

# PERFORMANCE VALIDATION
opencode run -m "anthropic/claude-sonnet-4-20250514" "PERFORMANCE VALIDATION: Verify that performance optimizations are working in $CODEBASE_PATH.

Validate:
- Memory usage is optimized
- No memory leaks present
- Algorithms are efficient
- UI rendering is smooth
- Async operations are non-blocking

Provide performance metrics and any remaining bottlenecks." > "$SWARM_DIR/performance_validation.txt" &

sleep 3

# FUNCTIONALITY VALIDATION
opencode run -m "anthropic/claude-sonnet-4-20250514" "FUNCTIONALITY VALIDATION: Verify all features are working correctly in $CODEBASE_PATH.

Test:
- All core features are functional
- UI components respond correctly
- Data persistence works
- Integrations are operational
- User workflows complete successfully

List any features still broken or incomplete." > "$SWARM_DIR/functionality_validation.txt" &

# BUILD VALIDATION
opencode run -m "anthropic/claude-sonnet-4-20250514" "BUILD VALIDATION: Verify the application builds and runs correctly.

Check:
- No syntax errors
- All dependencies resolve
- Build process completes
- Application starts without errors
- No runtime exceptions

Report any build or runtime issues found." > "$SWARM_DIR/build_validation.txt" &

wait

echo "🔄 Combining validation results..."
cat "$SWARM_DIR"/*_validation.txt > "$SWARM_DIR/all_validations.txt"

echo "📊 Generating Final Validation Report..."
opencode run -m "anthropic/claude-opus-4-1-20250805" "FINAL VALIDATION REPORT: Analyze all validation results and create a comprehensive report with:

1. ✅ FIXES CONFIRMED WORKING
   - List all successfully fixed issues
   - Verification evidence

2. ⚠️ PARTIAL FIXES
   - Issues partially resolved
   - Additional work needed

3. ❌ REMAINING ISSUES
   - Problems still present
   - Recommended next steps

4. 📈 IMPROVEMENT METRICS
   - Before/after comparisons
   - Performance gains
   - Security score improvements

5. 🎯 FINAL ASSESSMENT
   - Is the application production-ready?
   - Overall quality score
   - Recommended next actions

VALIDATION RESULTS: $(cat $SWARM_DIR/all_validations.txt)

Provide clear pass/fail status for each category." > "$SWARM_DIR/FINAL_VALIDATION_REPORT.md" &

wait

echo "✅ Validation swarms completed!"
echo ""
echo "📄 Final validation report: $SWARM_DIR/FINAL_VALIDATION_REPORT.md"
echo ""

# Check if we can run the app
if [ -f "$CODEBASE_PATH/package.json" ]; then
    echo "🚀 Testing if application runs..."
    cd "$CODEBASE_PATH"
    npm start &
    APP_PID=$!
    sleep 5
    if ps -p $APP_PID > /dev/null; then
        echo "✅ Application started successfully!"
        kill $APP_PID 2>/dev/null
    else
        echo "❌ Application failed to start"
    fi
fi

echo ""
echo "📋 CodeFix Complete! Review the final report for status."
echo ""
echo "If issues remain, you can:"
echo "1. Re-run specific repair scripts"
echo "2. Manually apply fixes from implementation guides"
echo "3. Run diagnose_codebase.sh again for updated analysis"
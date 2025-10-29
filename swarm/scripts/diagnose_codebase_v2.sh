#!/bin/bash

# 🔍 Enhanced Diagnostic Script - Smart Code Analysis
# Usage: ./diagnose_codebase_v2.sh

CODEBASE_PATH="${1:-/Users/heathen-admin/Desktop/v0/TEST4}"
SWARM_DIR="swarm_outputs/codefix"

echo "🔍 Deploying Enhanced Diagnostic Swarms..."
echo "📁 Working on: $CODEBASE_PATH"

# Create output directory
mkdir -p "$SWARM_DIR"

# Get list of actual code files
CODE_FILES=$(find "$CODEBASE_PATH" -maxdepth 2 \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.py" -o -name "*.sh" -o -name "*.json" -o -name "*.html" \) ! -path "*/node_modules/*" ! -path "*/docs/*" -exec ls -la {} \; 2>/dev/null)

echo "📊 Analyzing $(echo "$CODE_FILES" | wc -l) code files"

# Deploy diagnostic swarms for comprehensive analysis

echo "🏗️ Deploying Architecture Analysis Swarm..."
opencode run -m "anthropic/claude-sonnet-4-20250514" "ARCHITECTURE ANALYSIS: Perform comprehensive analysis of $CODEBASE_PATH

Analyze the actual application code:
- main.js, renderer.js, preload.js (Electron core)
- index.html (UI structure)
- package.json (dependencies and configuration)
- All JavaScript modules (*.js)
- Configuration files (*.json)

Skip documentation files (*.md) and focus on executable code.

Provide detailed analysis of:
1. Overall architecture and design patterns
2. Module dependencies and relationships
3. Code organization and structure
4. Separation of concerns
5. Security architecture
6. Performance architecture
7. Critical architectural flaws
8. Recommended refactoring

Include specific file references and line numbers where applicable." > "$SWARM_DIR/architecture_analysis_v2.txt" &

echo "🛡️ Deploying Security Audit Swarm..."
opencode run -m "anthropic/claude-sonnet-4-20250514" "SECURITY AUDIT: Comprehensive security analysis of $CODEBASE_PATH

Examine all security-critical files:
- main.js (main process security, IPC handlers, window creation)
- preload.js (context bridge, API exposure)
- renderer.js (client-side security, DOM manipulation)
- package.json (dependency vulnerabilities)
- All data handling code
- All user input processing

Perform deep security analysis:
1. Electron-specific vulnerabilities
2. Context isolation implementation
3. IPC communication security
4. Input validation and sanitization
5. XSS and injection vulnerabilities
6. Dependency security audit
7. Authentication and authorization
8. Data encryption and storage
9. Content Security Policy
10. Permission model

Rate each finding by severity (CRITICAL/HIGH/MEDIUM/LOW) with specific remediation steps." > "$SWARM_DIR/security_audit_v2.txt" &

sleep 3

echo "⚡ Deploying Performance Analysis Swarm..."
opencode run -m "anthropic/claude-sonnet-4-20250514" "PERFORMANCE ANALYSIS: Deep performance audit of $CODEBASE_PATH

Analyze performance across all components:
- main.js (main process performance, memory management)
- renderer.js (rendering performance, DOM updates)
- preload.js (IPC overhead)
- All JavaScript files for algorithmic efficiency
- Resource loading and management
- Event handling efficiency

Identify and document:
1. Memory leaks and excessive allocations
2. CPU-intensive operations
3. Blocking I/O operations
4. Inefficient algorithms (O(n²) or worse)
5. Unnecessary re-renders or reflows
6. Resource loading bottlenecks
7. Event listener accumulation
8. Cache optimization opportunities
9. Async/await optimization
10. Worker thread opportunities

Provide specific optimization strategies with code examples." > "$SWARM_DIR/performance_analysis_v2.txt" &

echo "🔧 Deploying Quality Analysis Swarm..."
opencode run -m "anthropic/claude-sonnet-4-20250514" "CODE QUALITY ANALYSIS: Comprehensive quality audit of $CODEBASE_PATH

Evaluate code quality metrics:
- Code complexity and maintainability
- Error handling completeness
- Test coverage assessment
- Documentation quality
- Naming conventions
- SOLID principles adherence
- DRY principle violations
- Code duplication
- Dead code detection
- Linting issues

Provide actionable improvements for code quality." > "$SWARM_DIR/quality_analysis_v2.txt" &

sleep 3

echo "📦 Deploying Dependency Audit Swarm..."
opencode run -m "anthropic/claude-sonnet-4-20250514" "DEPENDENCY AUDIT: Analyze dependencies in $CODEBASE_PATH

Review package.json and node_modules:
1. Outdated dependencies requiring updates
2. Security vulnerabilities in dependencies
3. Unused dependencies to remove
4. Missing dependencies
5. Version conflicts
6. License compatibility issues
7. Bundle size impact
8. Alternative lighter packages

Provide specific npm/yarn commands for fixes." > "$SWARM_DIR/dependency_audit_v2.txt" &

echo "🔧 Deploying Functionality Audit Swarm..."
opencode run -m "anthropic/claude-sonnet-4-20250514" "FUNCTIONALITY AUDIT: Test all features in $CODEBASE_PATH

Validate complete functionality:
- Core features (note creation, editing, deletion)
- Data persistence and storage
- UI interactions and responsiveness
- Window management (Electron)
- IPC communication
- Error recovery
- Edge cases handling
- User workflows
- Integration points
- Configuration management

Document:
1. Working features
2. Broken features with error details
3. Missing expected features
4. Incomplete implementations
5. Required fixes with code snippets" > "$SWARM_DIR/functionality_audit_v2.txt" &

wait

echo "🔄 Combining all diagnostic results..."
cat "$SWARM_DIR"/*_v2.txt > "$SWARM_DIR/combined_diagnostics_v2.txt"

echo "📊 Generating Comprehensive Master Diagnosis..."
opencode run -m "anthropic/claude-opus-4-1-20250805" "Create a COMPREHENSIVE MASTER DIAGNOSIS from these analyses:

$(cat $SWARM_DIR/combined_diagnostics_v2.txt)

Structure the diagnosis as:

# MASTER DIAGNOSIS REPORT

## CRITICAL ISSUES (Must Fix Immediately)
- List each with specific file:line references
- Include severity and impact
- Provide exact fix required

## HIGH PRIORITY ISSUES
- Security vulnerabilities
- Data loss risks
- Major functionality breaks

## MEDIUM PRIORITY ISSUES
- Performance problems
- Code quality issues
- Technical debt

## LOW PRIORITY ISSUES
- Minor improvements
- Nice-to-have features

## RECOMMENDED ACTION PLAN
1. Immediate fixes (can be done now)
2. Short-term improvements (1-2 days)
3. Long-term refactoring (1 week)

## SPECIFIC CODE CHANGES REQUIRED
Provide exact code snippets for critical fixes.

Make this actionable and comprehensive." > "$SWARM_DIR/MASTER_DIAGNOSIS_V2.md"

echo "✅ Enhanced diagnostic complete!"
echo ""
echo "📄 Full results saved to: $SWARM_DIR/"
echo "📊 Master diagnosis: $SWARM_DIR/MASTER_DIAGNOSIS_V2.md"
echo ""
echo "Next step: Run ./repair_targeted.sh to apply fixes"
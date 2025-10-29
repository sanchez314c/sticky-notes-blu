#!/bin/bash

# 🔍 CodeFix Diagnostic Script - Deploy 6 Parallel Diagnostic Swarms
# Usage: ./diagnose_codebase.sh [path_to_codebase]

CODEBASE_PATH="${1:-/Users/heathen-admin/Desktop/v0/TEST4}"
SWARM_DIR="swarm_outputs/codefix"

echo "🚀 Deploying CodeFix Diagnostic Swarms for: $CODEBASE_PATH"
echo "📁 Output directory: $SWARM_DIR"

# Create output directory
mkdir -p "$SWARM_DIR"

# Deploy diagnostic swarms in pairs with 3-second staggering

echo "📊 Deploying Pair 1: Architecture & Security Analysis..."

# ARCHITECTURE ANALYSIS AGENT
opencode run -m "anthropic/claude-sonnet-4-20250514" "ARCHITECTURE ANALYSIS: Analyze the codebase structure at $CODEBASE_PATH and identify architectural issues, anti-patterns, technical debt, and structural problems. Focus on: file organization, dependency management, separation of concerns, scalability issues, maintainability problems. 

MINIMUM OUTPUT: 600+ words with detailed structural analysis, module dependency mapping, import/export audit, and architecture pattern compliance review." > "$SWARM_DIR/architecture_analysis.txt" &

# SECURITY VULNERABILITY AGENT  
opencode run -m "anthropic/claude-sonnet-4-20250514" "SECURITY AUDIT: Perform comprehensive security analysis of the codebase at $CODEBASE_PATH. Identify: authentication flaws, authorization issues, input validation problems, XSS vulnerabilities, SQL injection risks, secret exposure, dependency vulnerabilities.

MINIMUM OUTPUT: 600+ words with detailed vulnerability assessment, threat analysis, risk scoring, and security best practices review." > "$SWARM_DIR/security_audit.txt" &

sleep 3

echo "📊 Deploying Pair 2: Performance & Quality Analysis..."

# PERFORMANCE ANALYSIS AGENT
opencode run -m "anthropic/claude-sonnet-4-20250514" "PERFORMANCE AUDIT: Analyze the codebase at $CODEBASE_PATH for performance bottlenecks, memory leaks, inefficient algorithms, database query issues, loading problems, resource usage optimization opportunities.

MINIMUM OUTPUT: 600+ words with detailed performance metrics, bottleneck identification, optimization recommendations, and resource usage analysis." > "$SWARM_DIR/performance_analysis.txt" &

# CODE QUALITY AGENT
opencode run -m "anthropic/claude-sonnet-4-20250514" "CODE QUALITY AUDIT: Review code quality issues in $CODEBASE_PATH including: syntax errors, logic bugs, code smells, documentation gaps, test coverage, naming conventions, code duplication, unused code.

MINIMUM OUTPUT: 600+ words with detailed quality metrics, code smell identification, maintainability assessment, and refactoring recommendations." > "$SWARM_DIR/quality_analysis.txt" &

sleep 3

echo "📊 Deploying Pair 3: Dependencies & Functionality Analysis..."

# DEPENDENCY HEALTH AGENT
opencode run -m "anthropic/claude-sonnet-4-20250514" "DEPENDENCY AUDIT: Analyze all dependencies in $CODEBASE_PATH for: outdated packages, security vulnerabilities, compatibility issues, unused dependencies, license conflicts, update recommendations.

MINIMUM OUTPUT: 600+ words with detailed dependency analysis, version compatibility matrix, security vulnerability report, and update roadmap." > "$SWARM_DIR/dependency_audit.txt" &

# FUNCTIONALITY COMPLETENESS AGENT
opencode run -m "anthropic/claude-sonnet-4-20250514" "FUNCTIONALITY AUDIT: Identify incomplete features in $CODEBASE_PATH, missing implementations, broken functionality, API endpoints that don't work, UI components that are non-functional, integration issues.

MINIMUM OUTPUT: 600+ words with detailed feature completeness assessment, implementation gap analysis, functionality testing results, and integration verification." > "$SWARM_DIR/functionality_audit.txt" &

echo "⏳ Waiting for all diagnostic swarms to complete..."
wait

echo "✅ All 6 diagnostic swarms completed!"
echo ""
echo "📋 Diagnostic Reports Generated:"
ls -lh "$SWARM_DIR"/*.txt 2>/dev/null

echo ""
echo "🔄 Combining diagnostic outputs..."
cat "$SWARM_DIR"/*.txt > "$SWARM_DIR/combined_diagnostics.txt"

echo "📊 Generating Master Diagnosis..."
opencode run -m "anthropic/claude-opus-4-1-20250805" "MASTER CODEFIX DIAGNOSIS: Analyze all diagnostic reports and create a comprehensive repair plan with:

1. CRITICAL ISSUES (must fix immediately) - Security vulnerabilities, broken functionality, architecture flaws
2. HIGH PRIORITY ISSUES (fix next) - Performance bottlenecks, code quality issues, missing features  
3. MEDIUM PRIORITY ISSUES (nice to have) - Optimization opportunities, refactoring suggestions
4. REPAIR IMPLEMENTATION PLAN - Step-by-step fixes with code examples
5. VALIDATION CRITERIA - How to verify each fix works

DIAGNOSTIC REPORTS: $(cat $SWARM_DIR/combined_diagnostics.txt)

MINIMUM OUTPUT: 1000+ words with actionable repair plan and specific code fixes." > "$SWARM_DIR/MASTER_DIAGNOSIS.md" &

wait

echo "✅ Master Diagnosis Complete!"
echo ""
echo "📁 All diagnostic outputs saved to: $SWARM_DIR"
echo "📄 Master diagnosis available at: $SWARM_DIR/MASTER_DIAGNOSIS.md"
echo ""
echo "Next step: Run ./repair_critical_security.sh to fix critical issues"
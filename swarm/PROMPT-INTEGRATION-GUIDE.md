# 🎯 SWARM Framework Prompt Integration Guide

## How The Prompts Work Together

The SWARM Framework uses specialized prompt files for different phases and scenarios. Claude should dynamically load and execute these prompts based on the task at hand.

## Core Development Pipeline Prompts

### Standard App Development Flow:
1. **Phase 0-4**: Use SWARM-MASTER-WORKFLOW.md (main pipeline)
2. **Phase 5**: Load and execute **CODEFIX.md** for comprehensive diagnostics
3. **Phase 6-10**: Continue with SWARM-MASTER-WORKFLOW.md

## Specialized Scenario Prompts

### When to Load Each Prompt:

#### **CODEFIX.md** - Automated Repair System
- **When**: After initial build (Phase 5)
- **Purpose**: Comprehensive diagnostic and repair
- **Execution**: 
  ```bash
  # Claude should:
  1. Read /swarm/prompts/CODEFIX.md
  2. Execute the full diagnostic swarm deployment
  3. Apply all fixes systematically
  4. Verify visual testing with screenshots
  ```

#### **EXISTING-CODEBASE.md** - Working with Legacy Code
- **When**: User provides an existing codebase to enhance
- **Purpose**: Analyze and upgrade existing projects
- **Load Command**: "I have an existing codebase at [path]"

#### **FEATURE-ADDITION.md** - Adding New Features
- **When**: User requests adding features to existing app
- **Purpose**: Systematic feature integration
- **Load Command**: "Add [feature] to the app"

#### **BUG-RESOLUTION.md** - Fixing Specific Bugs
- **When**: User reports specific bugs
- **Purpose**: Targeted bug fixing methodology
- **Load Command**: "Fix this bug: [description]"

#### **PERFORMANCE-OPTIMIZATION.md** - Speed Improvements
- **When**: App is slow or inefficient
- **Purpose**: Performance analysis and optimization
- **Load Command**: "Optimize performance"

#### **SECURITY-HARDENING.md** - Security Enhancements
- **When**: Security vulnerabilities found
- **Purpose**: Comprehensive security audit and fixes
- **Load Command**: "Secure the application"

#### **TESTING-IMPLEMENTATION.md** - Test Suite Creation
- **When**: After main build completion
- **Purpose**: Comprehensive test coverage
- **Load Command**: "Create test suite"

#### **ACCESSIBILITY-COMPLIANCE.md** - A11y Improvements
- **When**: Accessibility requirements needed
- **Purpose**: WCAG compliance and accessibility
- **Load Command**: "Make app accessible"

#### **MOBILE-CONVERSION.md** - Mobile App Creation
- **When**: Converting web to mobile
- **Purpose**: React Native or platform-specific conversion
- **Load Command**: "Convert to mobile app"

#### **API-DEVELOPMENT.md** - API Creation
- **When**: Backend API needed
- **Purpose**: RESTful or GraphQL API development
- **Load Command**: "Create API backend"

#### **DATABASE-OPTIMIZATION.md** - Database Performance
- **When**: Database issues detected
- **Purpose**: Query optimization and schema improvements
- **Load Command**: "Optimize database"

#### **DEVOPS-SETUP.md** - CI/CD Pipeline
- **When**: Deployment automation needed
- **Purpose**: GitHub Actions, Docker, Kubernetes setup
- **Load Command**: "Setup CI/CD"

#### **DOCUMENTATION.md** - Documentation Generation
- **When**: Project documentation needed
- **Purpose**: Comprehensive docs generation
- **Load Command**: "Generate documentation"

#### **MODERNIZATION.md** - Legacy Code Update
- **When**: Old codebase needs updating
- **Purpose**: Framework and dependency modernization
- **Load Command**: "Modernize codebase"

#### **ARCHITECTURE-REFACTOR.md** - Structural Improvements
- **When**: Architecture issues identified
- **Purpose**: Major structural refactoring
- **Load Command**: "Refactor architecture"

#### **GITHUB-STANDARDIZATION.md** - Repository Setup
- **When**: GitHub repo organization needed
- **Purpose**: Professional repo structure
- **Load Command**: "Setup GitHub repo"

#### **INTERNATIONALIZATION.md** - Multi-language Support
- **When**: i18n requirements
- **Purpose**: Language and locale support
- **Load Command**: "Add internationalization"

#### **MONITORING-SETUP.md** - Observability
- **When**: Production monitoring needed
- **Purpose**: Logging, metrics, alerting
- **Load Command**: "Setup monitoring"

#### **QUALITY-IMPROVEMENT.md** - Code Quality
- **When**: Code quality issues
- **Purpose**: Linting, formatting, best practices
- **Load Command**: "Improve code quality"

#### **RESURRECT-IN-PLACE.md** - Dead Project Revival
- **When**: Abandoned or broken project
- **Purpose**: Bring dead projects back to life
- **Load Command**: "Resurrect this project"

#### **NANO-SWARMS.md** - Micro-task Orchestration
- **When**: Small, focused tasks
- **Purpose**: Lightweight swarm deployment
- **Load Command**: "Use nano swarms for [task]"

## Integration Pattern

### How Claude Should Use These Prompts:

```javascript
// Pseudo-code for Claude's decision making:

function selectPrompt(userRequest) {
  // Main development flow
  if (userRequest.includes("build app")) {
    loadPrompt("SWARM-MASTER-WORKFLOW.md");
    // After Phase 4, automatically:
    loadPrompt("CODEFIX.md");
  }
  
  // Specialized scenarios
  if (userRequest.includes("fix")) {
    if (hasSpecificBug) {
      loadPrompt("BUG-RESOLUTION.md");
    } else {
      loadPrompt("CODEFIX.md");
    }
  }
  
  if (userRequest.includes("add feature")) {
    loadPrompt("FEATURE-ADDITION.md");
  }
  
  if (userRequest.includes("existing code")) {
    loadPrompt("EXISTING-CODEBASE.md");
  }
  
  // Performance, security, testing, etc.
  // Load appropriate prompt based on keywords
}
```

## Key Integration Points

### 1. **Always Run CODEFIX After Build**
```bash
# After Phase 4 (Build) completes:
echo "Loading CODEFIX system..."
cat /swarm/prompts/CODEFIX.md
# Execute full diagnostic and repair pipeline
```

### 2. **Chain Multiple Prompts When Needed**
```bash
# Example: Build app → Fix issues → Add tests → Deploy
1. SWARM-MASTER-WORKFLOW.md (Phases 0-4)
2. CODEFIX.md (Diagnostic & Repair)
3. TESTING-IMPLEMENTATION.md (Test Suite)
4. DEVOPS-SETUP.md (CI/CD)
```

### 3. **Prompt Switching Based on Errors**
```bash
# If error type detected:
if [security_vulnerability]; then
  loadPrompt("SECURITY-HARDENING.md")
elif [performance_issue]; then
  loadPrompt("PERFORMANCE-OPTIMIZATION.md")
elif [accessibility_issue]; then
  loadPrompt("ACCESSIBILITY-COMPLIANCE.md")
fi
```

## Output Organization

All prompt-specific outputs should go to appropriate directories:
```
/swarm/swarm_outputs/
├── phase0_brainstorm/
├── phase1_techstack/
├── phase2_prd/
├── phase3_planning/
├── phase4_build/
├── phase5_codefix/     # CODEFIX.md outputs here
├── phase6_quality/
├── phase7_testing/
├── phase8_build/
├── phase9_deployment/
└── specialized/        # Other prompt outputs
    ├── security/
    ├── performance/
    ├── accessibility/
    └── features/
```

## Remember:
- Each prompt file contains COMPLETE instructions for that scenario
- Prompts can be combined and chained for complex workflows
- CODEFIX.md should ALWAYS run after initial build
- Visual testing and screenshots are MANDATORY in CODEFIX
- All outputs should be organized in swarm_outputs directory

## Quick Reference Commands:

```bash
# Load a specific prompt
cat /swarm/prompts/[PROMPT-NAME].md

# Execute CODEFIX after build
cat /swarm/prompts/CODEFIX.md && execute_codefix_swarm

# Chain multiple prompts
for prompt in CODEFIX.md TESTING-IMPLEMENTATION.md DEVOPS-SETUP.md; do
  cat /swarm/prompts/$prompt && execute_prompt_instructions
done
```

This integration ensures Claude uses the right specialized prompt for each scenario while maintaining the core SWARM Framework pipeline.
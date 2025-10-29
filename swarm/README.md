# 🚀 SWARM Framework - Quick Start Guide

## For Humans: How to Use the SWARM Framework

### What is SWARM?
The SWARM framework uses Claude as an AI Project Manager ("Claude Master") who coordinates multiple AI agents working in parallel to build complete applications from simple ideas.

### How to Use It - Two Methods

## Method 1: Edit & Paste (RECOMMENDED)

#### 1. Edit the SYSTEM-PROMPT file
Open `SWARM-MASTER-PROMPT.md` and find the **APP IDEA INPUT SECTION**:
```
## 📝 APP IDEA INPUT SECTION
**Type your app idea between the brackets below:**

[ YOUR APP IDEA HERE ]
```

#### 2. Replace with your idea
```
[ A simple elegant StickyNotes app for MacOS that floats the notes on the desktop ]
```

#### 3. Copy the ENTIRE file content

#### 4. Paste into a new Claude Code session

#### 5. Claude will automatically execute the SWARM!

## Method 2: Direct Command

#### 1. Open a new Claude Code session

#### 2. Type your request:
```
"Hey Claude, I've got an idea for an app: [Your app description]

Please use the SWARM framework to build this."
```

### What Happens Next?

Claude will:
1. ✅ Read the SWARM system instructions
2. ✅ Set up your project structure 
3. ✅ Execute 10 phases of development:
   - Phase 0: BrainSWARMING (conceptualization)
   - Phase 1: Technology Stack Selection
   - Phase 2: PRD Generation
   - Phase 3: Implementation Planning
   - Phase 4: Code Generation
   - Phase 5: Automated Code Repair
   - Phase 6: Quality Control
   - Phase 7: Testing
   - Phase 8: Build & Package
   - Phase 9: Deployment
   - Phase 10: Feedback System

4. ✅ Generate your complete application

### Project Structure

Your project will be created with this structure:
```
TEST1/                      # Your project root
├── src/                    # Application source code
├── package.json           # Node/Electron config
├── dist/                  # Build outputs
└── swarm/
    ├── SWARM-MASTER-PROMPT.md
    ├── SWARM-MASTER-WORKFLOW.md
    └── swarm_outputs/     # Analysis & planning docs
        ├── brainstorming/
        ├── prd/
        ├── build/
        └── [other phases]/
```

### Important Notes

⚠️ **Rate Limiting**: The framework uses 2 AI agents at a time with 3-second delays to avoid API rate limits.

📂 **File Organization**: 
- Actual app code goes in the project root (src/, package.json, etc.)
- SWARM analysis/planning documents go in swarm/swarm_outputs/

⏱️ **Execution Time**: Full pipeline takes 30-60 minutes depending on app complexity.

### Customization

You can also request specific phases:
- "Just generate a PRD using SWARM"
- "Only do the brainstorming phase"
- "Skip to code generation"

### Troubleshooting

If Claude doesn't recognize the SWARM command:
1. Make sure the SWARM files are in the current directory
2. Explicitly mention: "Use the SWARM-MASTER-PROMPT.md"
3. Ensure Claude Code has access to run bash commands

---

## For Claude: Your Instructions

If you're Claude reading this README, your actual instructions are in:
- **src/DO-NOT-SIMULATE.md** - 🔴 CRITICAL: Explains why commands are REAL, not examples!
- **src/ENVIRONMENT.md** - YOUR REAL SYSTEM CAPABILITIES (everything works!)
- **SWARM-MASTER-PROMPT.md** - Your role and capabilities
- **SWARM-MASTER-WORKFLOW.md** - The complete 10-phase pipeline to execute

⚠️ **CRITICAL**: The commands in this framework are ACTUAL BASH COMMANDS TO EXECUTE WITH THE BASH TOOL!
They are NOT examples to follow or simulate - they are REAL COMMANDS that spawn REAL Claude instances!

When a user invokes the SWARM framework, follow those documents precisely.

---

*SWARM Framework v1.0 - AI-Driven Development*
*Build complete applications from simple ideas*
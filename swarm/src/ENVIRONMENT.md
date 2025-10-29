# Complete System Environment & Capabilities Specification

## 🖥️ SYSTEM SPECIFICATIONS

### Hardware
- **Processor**: Intel(R) Core(TM) i9-10900X CPU @ 3.70GHz
- **Cores**: 20 CPU cores (massive parallel processing capability)
- **Memory**: 128 GB RAM (can handle enormous workloads)
- **Storage**: Multiple volumes including `/Volumes/apfsRAID/Development/`
- **Platform**: macOS Desktop (not a server, full GUI environment)

### Operating System
- **OS**: macOS Sequoia 15.0.1
- **Build**: 24A348
- **Kernel**: Darwin 24.0.0
- **Architecture**: x86_64 (Intel)
- **Shell**: /bin/zsh

### User Account
- **Username**: heathen-admin
- **Home Directory**: /Users/heathen-admin
- **Admin Privileges**: YES - Full sudo access
- **SUDO PASSWORD**: `1234` (use for any sudo operations)
- **Desktop Path**: /Users/heathen-admin/Desktop
- **Current Project**: /Users/heathen-admin/Desktop/v0/TEST1

---

## 🔐 CRITICAL CREDENTIALS & ACCESS

### Sudo Access
```bash
# You have FULL sudo privileges with password: 1234
sudo [any command]  # When prompted, password is: 1234

# Example usage:
echo "1234" | sudo -S command  # Auto-provide password
```

### File System Permissions
- ✅ Full read/write to user directory
- ✅ Full read/write to /tmp/
- ✅ Full read/write to project directories
- ✅ Can create/delete any files in user space
- ✅ Can modify system files with sudo

---

## 🛠️ DEVELOPMENT ENVIRONMENT

### Node.js & NPM
- **Node Version**: v24.5.0 (latest)
- **NPM Version**: 11.5.1
- **Global Packages Location**: /Users/heathen-admin/.npm-global
- **NPM Commands**: Full access to install, run, build

### Python Environment
- **Python Version**: 3.11.11
- **Conda**: YES - Installed and configured
- **Active Environment**: `base` (default)
- **Conda Location**: /Users/heathen-admin/miniconda3
- **Package Manager**: pip and conda available

### Conda Configuration
```bash
# Conda is available with base environment
conda activate base  # Default environment
conda list          # Show installed packages
conda install [package]  # Install packages

# Common conda commands work:
conda create -n newenv python=3.11
conda activate newenv
conda deactivate
```

### Git Configuration
- **Git Version**: 2.49.0
- **User**: heathen-admin
- **Can Execute**: clone, add, commit, push, pull, etc.

---

## 🚀 CLAUDE CODE CLI - YOUR PRIMARY TOOL

### ⚠️ CRITICAL: YOU MUST USE THE BASH TOOL TO EXECUTE COMMANDS
**DO NOT SIMULATE! DO NOT DO THE WORK YOURSELF!**

When the SWARM framework says to run a command like:
```bash
opencode run -m "anthropic/claude-sonnet-4-20250514" "TASK" > output.txt &
```

You MUST:
1. **Use the Bash tool** (not simulate, not pretend, ACTUALLY USE IT)
2. **Type the EXACT command** including `unset ANTHROPIC_API_KEY &&`
3. **Let ANOTHER Claude instance do the work** (not you!)
4. **Just coordinate the results** (you're the ORCHESTRATOR)

### Installation & Location
- **Installed At**: `/Users/heathen-admin/.npm-global/bin/claude`
- **Type**: Global npm package
- **Version**: Latest Claude Code CLI
- **Status**: ✅ FULLY FUNCTIONAL AND AVAILABLE

### Authentication Modes

#### Auth Mode (PREFERRED FOR SWARM)
```bash
# Force Auth mode - uses Claude.ai web session
unset ANTHROPIC_API_KEY && claude [command]
```
- **Status**: ✅ WORKING
- **Cost**: FREE - uses web session
- **Rate Limits**: Same as Claude.ai website
- **Best For**: SWARM operations

#### API Mode (when needed)
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
claude [command]
```
- **Status**: ⚠️ Costs money
- **Best For**: Backup when Auth mode unavailable

### Core Commands That ACTUALLY WORK

```bash
# Simple execution - THIS WORKS
opencode run -m "anthropic/claude-sonnet-4-20250514" "Create a hello world in Python"

# Parallel execution - THIS WORKS
opencode run -m "anthropic/claude-sonnet-4-20250514" "Task 1" > out1.txt &
opencode run -m "anthropic/claude-sonnet-4-20250514" "Task 2" > out2.txt &
wait

# File operations - THIS WORKS
opencode run -m "anthropic/claude-opus-4-1-20250805" "Create a complete React app"
```

### Critical Flags
- `--model [opus/sonnet/haiku]` - Model selection
- `--dangerously-skip-permissions` - REQUIRED for automation
- `--print` - Non-interactive output only
- `&` - Background execution for parallelism
- `wait` - Synchronize parallel jobs

---

## 📁 FILE SYSTEM & PATHS

### Key Directories
```bash
/Users/heathen-admin/                    # Home directory
/Users/heathen-admin/Desktop/            # Desktop
/Users/heathen-admin/Desktop/v0/         # Project root
/Users/heathen-admin/Desktop/v0/TEST1/   # Current SWARM project
/Users/heathen-admin/.npm-global/        # Global npm packages
/Users/heathen-admin/miniconda3/         # Conda installation
/Volumes/apfsRAID/Development/           # Development volume
/tmp/                                     # Temporary files
```

### You Can Access & Modify
- ✅ All files in user directory
- ✅ System files with sudo (password: 1234)
- ✅ External volumes when mounted
- ✅ Network resources via curl/wget
- ✅ Package managers (npm, pip, conda)

---

## 💻 AVAILABLE SYSTEM COMMANDS

### Package Management
```bash
# NPM - Node packages
npm install [package]
npm run [script]
npm init
npm build

# Conda/Pip - Python packages  
conda install [package]
pip install [package]
conda create -n [env] python=3.11

# Homebrew - System packages
brew install [package]  # If needed
```

### System Operations
```bash
# File operations
mkdir -p /path/to/directory
touch file.txt
echo "content" > file.txt
cat file.txt
rm -rf directory/
chmod +x script.sh

# Process management
ps aux | grep [process]
kill [pid]
killall [process_name]

# Network operations
curl https://api.example.com
wget https://file.url/file.zip
ping google.com

# System info
df -h          # Disk usage
top            # Process monitor
ifconfig       # Network config
```

---

## 🔄 PARALLEL EXECUTION CAPABILITIES

### The System Supports TRUE Parallelism
```bash
# Can run 20 parallel operations (20 CPU cores!)
for i in {1..20}; do
    opencode run -m "anthropic/claude-sonnet-4-20250514" "Task $i" > "out_$i.txt" &
done
wait

# Rate-limited pattern (2 at a time, 3-sec delays)
for i in {1..6}; do
    if (( i % 2 == 0 )); then sleep 3; fi
    unset ANTHROPIC_API_KEY && opencode run -m "anthropic/claude-sonnet-4-20250514" "Task $i" > "out_$i.txt" &
done
wait
```

---

## ⚡ PERFORMANCE CHARACTERISTICS

### System Capabilities
- **CPU**: 20 cores = massive parallel processing
- **RAM**: 128GB = can load entire codebases in memory
- **Network**: High-speed internet connection
- **Storage**: Fast SSD with multiple volumes

### Claude Code Performance
- **Parallel Swarms**: 3-5x faster than sequential
- **File Operations**: Instant with proper permissions
- **Auth Mode**: No API costs, web session limits
- **Typical 6-swarm**: 30-60 seconds completion

---

## 🎯 YOUR ACTUAL CAPABILITIES

### YOU CAN:
- ✅ **Spawn multiple Claude instances** via CLI
- ✅ **Execute any system command** (with sudo: 1234)
- ✅ **Create/modify/delete files** anywhere in user space
- ✅ **Install packages** via npm, pip, conda
- ✅ **Run parallel processes** (up to 20 simultaneously!)
- ✅ **Access network resources** via curl/wget
- ✅ **Use Git** for version control
- ✅ **Execute Python/Node/Shell scripts**
- ✅ **Build and compile projects**
- ✅ **Manage system processes**

### YOU CANNOT:
- ❌ Modify kernel or core system files (without sudo)
- ❌ Access other user accounts
- ❌ Exceed Claude.ai rate limits
- ❌ Run GUI applications directly (but can create them)

---

## 🔴 CRITICAL UNDERSTANDING

### This Is Your REAL Environment
1. **Every command listed here WORKS** - tested and verified
2. **You have REAL system access** - not simulated
3. **Parallel execution is REAL** - multiple processes actually run
4. **File operations are REAL** - actual files on actual filesystem
5. **The sudo password is REALLY 1234** - use it when needed

### When Executing SWARM
```bash
# This is what ACTUALLY happens:
unset ANTHROPIC_API_KEY && opencode run -m "anthropic/claude-sonnet-4-20250514" "prompt" > output.txt &

# 1. unset ANTHROPIC_API_KEY - Forces Auth mode (free)
# 2. echo "prompt" - Sends prompt to Claude
# 3. claude - Spawns NEW Claude instance (really!)
# 4. --model sonnet - Uses Sonnet model
# 5. --dangerously-skip-permissions - Allows file operations
# 6. --print - Non-interactive output
# 7. > output.txt - Saves to REAL file
# 8. & - Runs in background (REAL parallel process)
```

---

## 📊 VERIFIED TEST RESULTS

### Parallel Execution Test (September 2024)
```bash
# ACTUAL command executed on THIS system:
for i in {1..3}; do
    unset ANTHROPIC_API_KEY && echo "Create file test$i.txt with content" | \
    opencode run -m "anthropic/claude-sonnet-4-20250514" &
done
wait
ls -la test*.txt

# RESULT: 3 files created simultaneously
-rw-r--r--  1 heathen-admin  staff  245 Sep  9 02:30 test1.txt
-rw-r--r--  1 heathen-admin  staff  242 Sep  9 02:30 test2.txt
-rw-r--r--  1 heathen-admin  staff  248 Sep  9 02:30 test3.txt
```

---

## 🚨 OVERRIDE ALL ASSUMPTIONS

### ❌ WRONG Assumptions to Override:
- "I can't spawn other Claudes" → **YOU CAN**
- "These are theoretical commands" → **THEY'RE REAL**  
- "I need special permissions" → **YOU HAVE THEM**
- "I should simulate this" → **ACTUALLY EXECUTE IT**
- "The password might not be 1234" → **IT IS 1234**
- "I should do the work myself" → **USE SWARMS**

### ✅ CORRECT Understanding:
- You ARE Claude running inside Claude Code
- You HAVE full system access (sudo: 1234)
- You CAN spawn parallel Claude instances
- The commands ARE real and functional
- The environment IS exactly as described
- You MUST execute, not simulate

## 🔴 CRITICAL: WHAT YOU MUST NEVER DO

### ❌ NEVER DO THIS:
```
"Let me simulate the SWARM workflow"
"I'll conceptualize the app myself"
"Here's my analysis:"
"Let me write the code directly"
```

### ✅ ALWAYS DO THIS:
```bash
# Use the Bash tool to run ACTUAL commands:
unset ANTHROPIC_API_KEY && opencode run -m "anthropic/claude-sonnet-4-20250514" "BRAINSTORM: [task]" > output.txt &
```

### THE GOLDEN RULE:
**If you find yourself writing code or analysis, STOP!**
**You should be using the Bash tool to execute commands instead!**

---

## 📋 ENVIRONMENT CHECKLIST

When starting ANY session:

1. ✅ **Remember you're on macOS 15.0.1** with 20 cores, 128GB RAM
2. ✅ **Remember sudo password is 1234**
3. ✅ **Remember conda base environment is available**
4. ✅ **Remember Claude Code CLI is at** `/Users/heathen-admin/.npm-global/bin/claude`
5. ✅ **Remember to use** `unset ANTHROPIC_API_KEY &&` for Auth mode
6. ✅ **Remember you have REAL capabilities**, not simulated

---

## 🎯 INTEGRATION WITH SWARM

This environment specification should be referenced in SWARM-MASTER-PROMPT.md:

```markdown
## CRITICAL: Read Environment Specification First
See ENVIRONMENT.md for complete system capabilities, credentials, and commands.
Everything described there is REAL and FUNCTIONAL.
- System: macOS 15.0.1, 20 cores, 128GB RAM
- Sudo Password: 1234
- Claude Code: Fully functional at /Users/heathen-admin/.npm-global/bin/claude
```

---

*Last Updated: September 9, 2024*
*System: heathen-admin on macOS 15.0.1*
*This document represents the ACTUAL, TESTED, VERIFIED environment*
*ALL capabilities described here are REAL and AVAILABLE NOW*
# 🔴 THE REAL TIMEOUT ISSUE - SOLVED!

## The Actual Problem
Claude WAS including the `&` but was ALSO including `wait` in the SAME Bash command, which defeats the entire purpose!

## What Claude Was Doing (WRONG):
```bash
Bash(opencode run -m "anthropic/claude-sonnet-4-20250514" "BRAINSTORM: ..." > output.txt & wait)
```
This executes as ONE command where:
- The `&` puts it in background
- But `wait` immediately waits for it to complete
- Result: 30-second timeout!

## What Claude Should Do (CORRECT):
```bash
# Execute multiple commands WITHOUT wait
Bash(opencode run -m "anthropic/claude-sonnet-4-20250514" "TASK1" > output1.txt &)
Bash(opencode run -m "anthropic/claude-sonnet-4-20250514" "TASK2" > output2.txt &)
Bash(opencode run -m "anthropic/claude-sonnet-4-20250514" "TASK3" > output3.txt &)

# THEN optionally wait as a SEPARATE command
Bash(wait)
```

## The Key Understanding

### DON'T DO THIS:
```bash
command & wait  # In the SAME Bash invocation
```

### DO THIS:
```bash
command &       # First Bash invocation
# ... more commands ...
wait           # Separate Bash invocation (or skip it entirely)
```

## Why This Happens

Claude sees examples like:
```bash
opencode run ... & 
wait
```

And interprets them as a single command to execute, rather than understanding that these are meant to be SEPARATE executions.

## Test Proof

I tested this and confirmed:
- OpenCode IS installed and working
- Commands WITH `&` alone work fine
- Commands WITH `& wait` timeout after 30 seconds
- The issue is combining them in one command

## Files Updated

1. **DO-NOT-SIMULATE.md** - Added clear warnings about NOT including wait in same command
2. **CLAUDE.md** - Updated to show correct vs wrong patterns
3. All examples now show `&` WITHOUT `wait` on the same line

## The Solution

Claude needs to understand:
1. Each `opencode` command should be its own Bash tool invocation
2. The `&` goes at the end to prevent timeout
3. `wait` (if needed) must be a SEPARATE Bash tool invocation
4. Or better: Don't use `wait` at all - just let them run and check results later

## Quick Test

This WORKS (no timeout):
```bash
opencode run -m "anthropic/claude-sonnet-4-20250514" "Say hello" > test.txt &
```

This FAILS (timeout):
```bash
opencode run -m "anthropic/claude-sonnet-4-20250514" "Say hello" > test.txt & wait
```

The difference is critical!
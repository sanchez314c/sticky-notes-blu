#!/bin/bash
# Run Compiled Binary on macOS

cd "$(dirname "$0")"

# Check platform
if [ "$(uname)" != "Darwin" ]; then
    echo "This script is for macOS only"
    exit 1
fi

# Check for symlink to .app
if [ -L "Application.app" ]; then
    open "Application.app"
elif [ -d "dist/mac/StickyNotes.app" ]; then
    open "dist/mac/StickyNotes.app"
else
    echo "No compiled application found. Run: ./scripts/compile-build-dist.sh"
    exit 1
fi
#!/bin/bash
# Run Compiled Binary on Linux

cd "$(dirname "$0")"

# Check platform
if [ "$(uname)" != "Linux" ]; then
    echo "This script is for Linux only"
    exit 1
fi

# Check for compiled application
if [ -f "dist/linux-unpacked/stickynotes" ]; then
    ./dist/linux-unpacked/stickynotes
elif [ -f "StickyNotes.AppImage" ]; then
    ./StickyNotes.AppImage
else
    echo "No compiled application found. Run: ./scripts/compile-build-dist.sh"
    exit 1
fi
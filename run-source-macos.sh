#!/bin/bash
# Run from Source on macOS (Development Mode)

cd "$(dirname "$0")"

# Check platform
if [ "$(uname)" != "Darwin" ]; then
    echo "This script is for macOS only"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] && [ -f "package.json" ]; then
    npm install
fi

# Run based on project type
if [ -f "package.json" ]; then
    npm start
elif [ -f "requirements.txt" ]; then
    python3 src/main.py
elif [ -f "Package.swift" ]; then
    swift run
fi
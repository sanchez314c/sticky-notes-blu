@echo off
REM Run from Source on Windows (Development Mode)

cd /d "%~dp0"

REM Check if Node.js is available
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" if exist "package.json" (
    npm install
)

REM Run based on project type
if exist "package.json" (
    npm start
) else if exist "requirements.txt" (
    python src\main.py
) else if exist "Package.swift" (
    echo Swift not supported on Windows
    pause
    exit /b 1
)
@echo off
setlocal enabledelayedexpansion

REM Run StickyNotes from Source on Windows (Development Mode)

REM Get script directory
cd /d "%~dp0\.."

echo [94m[%TIME%][0m Starting StickyNotes from source (Windows)...

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [91m[%TIME%] X[0m Node.js is not installed. Please install from https://nodejs.org/
    pause
    exit /b 1
)

REM Check for package.json
if not exist "package.json" (
    echo [91m[%TIME%] X[0m package.json not found. Make sure you're in the project root.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo [94m[%TIME%][0m Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [91m[%TIME%] X[0m Failed to install dependencies
        pause
        exit /b 1
    )
    echo [92m[%TIME%] OK[0m Dependencies installed
)

REM Launch the app
echo [94m[%TIME%][0m Launching StickyNotes...
echo Press Ctrl+C to stop the application
echo.

call npm start

echo.
echo [92m[%TIME%] OK[0m StickyNotes closed
pause
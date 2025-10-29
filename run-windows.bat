@echo off
REM Run Compiled Binary on Windows

cd /d "%~dp0"

REM Check for compiled executable
if exist "dist\win-unpacked\StickyNotes.exe" (
    start "" "dist\win-unpacked\StickyNotes.exe"
) else if exist "StickyNotes.exe" (
    start "" "StickyNotes.exe"
) else (
    echo No compiled application found. Run: .\scripts\compile-build-dist.sh
    pause
    exit /b 1
)
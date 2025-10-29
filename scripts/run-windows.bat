@echo off
setlocal enabledelayedexpansion

REM Run Compiled StickyNotes Binary on Windows

REM Get script directory
cd /d "%~dp0\.."

echo [94m[%TIME%][0m Launching compiled StickyNotes (Windows)...

REM Check if dist exists
if not exist "dist" (
    echo [91m[%TIME%] X[0m No dist/ directory found. Build first with:
    echo   Git Bash: ./scripts/compile-build-dist.sh
    echo   WSL: ./scripts/compile-build-dist.sh
    pause
    exit /b 1
)

REM Find executable
set "APP_PATH="

REM Check for unpacked exe first
if exist "dist\win-unpacked\*.exe" (
    for %%F in (dist\win-unpacked\*.exe) do (
        set "APP_PATH=%%F"
        echo [94m[%TIME%][0m Found unpacked: %%~nxF
        goto :found
    )
)

REM Check for installer
if exist "dist\*.exe" (
    for %%F in (dist\*.exe) do (
        echo %%F | findstr /C:".blockmap" >nul
        if errorlevel 1 (
            set "APP_PATH=%%F"
            echo [93m[%TIME%] ![0m Found installer: %%~nxF
            goto :found
        )
    )
)

echo [91m[%TIME%] X[0m Could not find executable. Build first with:
echo   ./scripts/compile-build-dist.sh
pause
exit /b 1

:found
echo [92m[%TIME%] OK[0m Launching StickyNotes...
start "" "!APP_PATH!"
echo [92m[%TIME%] OK[0m StickyNotes launched!
pause
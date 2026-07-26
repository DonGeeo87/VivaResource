@echo off
cd /d "%~dp0"
echo === Building Viva Resource (PowerShell) ===
echo This avoids MSYS path corruption on Windows
echo.
powershell -Command "Remove-Item -Recurse -Force .next,node_modules/.cache -ErrorAction SilentlyContinue; npm run build"
echo.
if %errorlevel% equ 0 (
    echo === Build successful ===
) else (
    echo === Build failed (exit code %errorlevel%) ===
)
pause

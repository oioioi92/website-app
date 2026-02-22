@echo off
cd /d "%~dp0"

echo.
echo ========================================
echo   Deploy to server (any IP)
echo ========================================
echo.
echo  FIRST  prompt: type  root@YOUR_SERVER_IP   (e.g. root@68.183.227.172)  -- NOT your password
echo  LATER  prompts: type your SSH password twice (upload, then run on server)
echo.
echo  Tip: deploy.bat root@68.183.227.172   skips the first prompt.
echo.
pause
echo.

set "PS_SCRIPT=%~dp0scripts\deploy-one-click.ps1"
if not exist "%PS_SCRIPT%" (
    echo ERROR: scripts\deploy-one-click.ps1 not found
    echo Run this bat from project root.
    pause
    exit /b 1
)

set "PWSH=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%PWSH%" set "PWSH=powershell"

"%PWSH%" -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" %*

if errorlevel 1 (
    echo.
    echo Deploy failed. Check errors above.
    pause
    exit /b 1
)

echo.
echo Done. Press any key to close.
pause

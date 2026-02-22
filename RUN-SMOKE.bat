@echo off
setlocal
cd /d "%~dp0"

if not exist logs mkdir logs

set LOGFILE=logs\smoke-last.log

echo ========================================== > "%LOGFILE%"
echo Running SMOKE (one-click)...               >> "%LOGFILE%"
echo Project: %cd%                              >> "%LOGFILE%"
echo ========================================== >> "%LOGFILE%"
echo.                                           >> "%LOGFILE%"

echo Running SMOKE... (logging to %LOGFILE%)
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\smoke.ps1" %* >> "%LOGFILE%" 2>&1

set "RC=%ERRORLEVEL%"

if "%RC%"=="0" goto :ok

echo.
echo SMOKE FAILED (exit code %RC%).
echo Log saved: %LOGFILE%
echo Opening log...
start "" notepad "%LOGFILE%"
pause
goto :done

:ok
echo SMOKE PASSED. Log saved: %LOGFILE%

:done

exit /b %RC%

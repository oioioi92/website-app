@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo Running seed:test ...
echo ==========================================

call npm.cmd run seed:test
pause

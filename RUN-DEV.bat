@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo Starting DEV (sqlite)...
echo ==========================================

powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\dev-sqlite.ps1"
pause

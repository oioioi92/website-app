@echo off
cd /d "%~dp0"
echo 正在打开线上前台和后台...
start "" "https://admin1167.com/"
start "" "https://admin1167.net/admin/login"
echo 已打开：前台 https://admin1167.com/  后台 https://admin1167.net/admin/login
timeout /t 2 >nul

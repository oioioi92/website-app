@echo off
cd /d "%~dp0"
echo 正在启动开发服务器并打开前台、后台...
echo （会新开一个窗口跑 npm run dev，请勿关闭）
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\dev-sqlite-and-open.ps1"
pause

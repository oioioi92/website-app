@echo off
cd /d "C:\Users\user\Desktop\Website-new"
echo 正在从项目目录启动: %CD%
echo 启动后请用浏览器打开: http://localhost:3000/admin
echo 顶栏应显示: Live Chat | Pending | Player List | Reports | More
echo.
npm run dev

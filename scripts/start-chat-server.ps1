# 一键启动 chat-server（安装依赖、生成 Prisma、npm run dev）
# 用法：在项目根目录执行 powershell -ExecutionPolicy Bypass -File .\scripts\start-chat-server.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = if ($PSScriptRoot) { (Resolve-Path (Join-Path $PSScriptRoot "..")).Path } else { Get-Location }
$ChatDir = Join-Path $ProjectRoot "services\chat-server"

if (-not (Test-Path $ChatDir)) {
  Write-Host "未找到 services\chat-server" -ForegroundColor Red
  exit 1
}

Write-Host "`n=== 进入 chat-server 目录 ===" -ForegroundColor Cyan
Set-Location $ChatDir

if (-not (Test-Path ".env")) {
  if (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env"
    Write-Host "已从 .env.example 复制创建 .env。请先运行: node scripts/setup-live-chat-env.cjs" -ForegroundColor Yellow
  }
}

Write-Host "=== 安装依赖 ===" -ForegroundColor Cyan
npm install

Write-Host "=== 生成 Prisma ===" -ForegroundColor Cyan
npm run prisma:generate 2>$null; if ($LASTEXITCODE -ne 0) { npx prisma generate --schema prisma/schema.sqlite.prisma }

Write-Host "=== 启动 chat-server（本窗口会持续运行）===" -ForegroundColor Cyan
Write-Host "看到 SERVER_OK port=4000、WS_OK 即成功。关闭本窗口即停止。`n" -ForegroundColor Gray
npm run dev

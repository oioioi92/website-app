# 每日升级检查脚本 (Daily Upgrade Check)
# 用法: .\scripts\daily-upgrade.ps1 [-ApplyUpdates]
# -ApplyUpdates: 执行 npm update（仅更新 minor/patch），默认仅检查不更新

param([switch]$ApplyUpdates)

$ErrorActionPreference = "Continue"
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $projectRoot

$date = Get-Date -Format "yyyy-MM-dd HH:mm"
Write-Host "=== 每日升级检查 $date ===" -ForegroundColor Cyan
Write-Host ""

# 1. 依赖过期检查
Write-Host "[1/5] npm outdated ..." -ForegroundColor Yellow
npm outdated 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host "  (无输出 = 无过期)" } 
Write-Host ""

# 2. 安全审计
Write-Host "[2/5] npm audit ..." -ForegroundColor Yellow
$audit = npm audit 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host $audit -ForegroundColor Red
  Write-Host "  建议: npm audit fix 或按报告修复" -ForegroundColor Gray
} else {
  Write-Host "  无已知漏洞" -ForegroundColor Green
}
Write-Host ""

# 3. 可选：应用更新
if ($ApplyUpdates) {
  Write-Host "[3/5] npm update (仅 minor/patch) ..." -ForegroundColor Yellow
  npm update
  Write-Host "  完成" -ForegroundColor Green
} else {
  Write-Host "[3/5] 跳过 npm update（加 -ApplyUpdates 可执行）" -ForegroundColor Gray
}
Write-Host ""

# 4. Prisma 生成检查（生产用 schema）
Write-Host "[4/5] Prisma generate (postgres schema) ..." -ForegroundColor Yellow
npm run prisma:generate 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
  Write-Host "  OK" -ForegroundColor Green
} else {
  Write-Host "  失败，请检查 prisma/schema.postgres.prisma" -ForegroundColor Red
}
Write-Host ""

# 5. 构建检查
Write-Host "[5/5] next build (dry run) ..." -ForegroundColor Yellow
$buildOut = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
  Write-Host "  构建成功" -ForegroundColor Green
} else {
  Write-Host $buildOut -ForegroundColor Red
  Write-Host "  构建失败，请修复后再部署" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== 检查结束 ===" -ForegroundColor Cyan
Write-Host "详细步骤见 docs/DAILY_UPGRADE.md" -ForegroundColor Gray

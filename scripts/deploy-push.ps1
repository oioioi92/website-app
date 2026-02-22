# 删除旧构建缓存 + 推送最新代码 + 触发 Vercel 部署（用新数据覆盖线上）
# 用法：在 PowerShell 里 cd 到项目根目录，然后： .\scripts\deploy-push.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path "$ProjectRoot\.git")) {
    $ProjectRoot = "c:\Users\Lee\Desktop\Website"
}
Set-Location $ProjectRoot

Write-Host "[1/4] 删除本地旧构建缓存 .next ..." -ForegroundColor Cyan
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "      done." -ForegroundColor Green

Write-Host "[2/4] 推送最新代码到 GitHub ..." -ForegroundColor Cyan
git add .
$status = git status --porcelain
if ($status) {
    git commit -m "deploy: sync latest"
    git push origin main
    Write-Host "      pushed." -ForegroundColor Green
} else {
    git push origin main
    Write-Host "      already up-to-date, pushed." -ForegroundColor Green
}

Write-Host "[3/4] 触发 Vercel 部署（用新数据覆盖线上）..." -ForegroundColor Cyan
$DeployHookUrl = "https://api.vercel.com/v1/integrations/deploy/prj_1XGTBp8BiWDHwbxig9Nd8PsOo5lA/lyrveXH42A"
try {
    $r = Invoke-WebRequest -Uri $DeployHookUrl -Method Post -UseBasicParsing
    Write-Host "      status: $($r.StatusCode) $($r.StatusDescription)" -ForegroundColor Green
    Write-Host "[4/4] 完成。等 1~2 分钟后用无痕打开 admin1167.net 查看新版本。" -ForegroundColor Green
} catch {
    Write-Host "      error: $_" -ForegroundColor Red
    Write-Host "      请到 Vercel 后台手动 Redeploy，或检查 Deploy Hook 是否有效。" -ForegroundColor Yellow
}

# 重新克隆仓库并恢复 .env（解决 'Website/.git' not recognized）
# 在 PowerShell 里执行： cd C:\Users\user\Desktop ; .\Website\scripts\reclone-repo.ps1
# 或直接复制下面 “执行块” 里的命令到 PowerShell 运行。

$desktop = [Environment]::GetFolderPath("Desktop")
$oldDir = Join-Path $desktop "Website"
$backupEnv = Join-Path $desktop "env-backup.txt"
$newDir = $oldDir

if (-not (Test-Path $oldDir)) {
    Write-Host "未找到 $oldDir，请确认路径。" -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] 备份 .env ..." -ForegroundColor Cyan
Copy-Item (Join-Path $oldDir ".env") $backupEnv -ErrorAction SilentlyContinue
if (Test-Path $backupEnv) { Write-Host "  已保存到 $backupEnv" } else { Write-Host "  未找到 .env，克隆后将使用 .env.example" }

Write-Host "[2/5] 重命名旧目录为 Website-old ..." -ForegroundColor Cyan
$oldBackup = Join-Path $desktop "Website-old"
if (Test-Path $oldBackup) { Remove-Item $oldBackup -Recurse -Force }
Rename-Item $oldDir $oldBackup

Write-Host "[3/5] 克隆仓库 ..." -ForegroundColor Cyan
Set-Location $desktop
git clone https://github.com/oioioi92/website-app.git Website

Write-Host "[4/5] 恢复 .env ..." -ForegroundColor Cyan
Set-Location (Join-Path $desktop "Website")
if (Test-Path $backupEnv) {
    Copy-Item $backupEnv .env -Force
    Write-Host "  已恢复 .env"
} else {
    Copy-Item .env.example .env
    Write-Host "  已从 .env.example 复制，请编辑 .env 填入配置"
}

Write-Host "[5/5] 验证 git ..." -ForegroundColor Cyan
git status
Write-Host ""
Write-Host "完成。新仓库在: $desktop\Website" -ForegroundColor Green
Write-Host "旧文件在: $desktop\Website-old （确认无误后可删除）" -ForegroundColor Yellow

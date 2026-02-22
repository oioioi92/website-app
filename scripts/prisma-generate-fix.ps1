# Run this script when prisma generate fails with EPERM (file in use).
# Close Cursor/VS Code or run this in a NEW PowerShell opened BEFORE opening the project.

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $projectRoot

Write-Host "Stopping Node processes that may lock Prisma files..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

$prismaDir = Join-Path $projectRoot "node_modules\.prisma"
if (Test-Path $prismaDir) {
  Write-Host "Removing node_modules\.prisma ..." -ForegroundColor Cyan
  Remove-Item -Recurse -Force $prismaDir -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 1
}

Write-Host "Running prisma generate (same schema as predev) ..." -ForegroundColor Cyan
& node scripts/prisma-generate-auto.cjs
if ($LASTEXITCODE -ne 0) {
  Write-Host "If EPERM persists: close Cursor/VS Code, open a new PowerShell, cd to project, run: .\scripts\prisma-generate-fix.ps1" -ForegroundColor Yellow
  exit 1
}
Write-Host "Done." -ForegroundColor Green

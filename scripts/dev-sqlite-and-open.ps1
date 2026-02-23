# 启动 SQLite 开发环境并自动打开前台、后台页面
# 用法：在项目根目录执行 powershell -ExecutionPolicy Bypass -File .\scripts\dev-sqlite-and-open.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = if ($PSScriptRoot) { (Resolve-Path (Join-Path $PSScriptRoot "..")).Path } else { Get-Location }
$Port = 3000
$FrontUrl = "http://localhost:$Port/"
$AdminUrl = "http://localhost:$Port/admin/login"

function Step($msg) {
  Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Ensure-ProjectRoot {
  if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
    throw "package.json not found. Please run from project root."
  }
}

function Wait-ForServer($url, $maxSeconds) {
  $sec = 0
  while ($sec -lt $maxSeconds) {
    try {
      $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
      if ($r.StatusCode -eq 200) { return $true }
    } catch {}
    Start-Sleep -Seconds 2
    $sec += 2
  }
  return $false
}

Step "Check project root"
Set-Location $ProjectRoot
Ensure-ProjectRoot

# 若无 .env 则用 SQLite 并初始化（首次运行）
if (-not (Test-Path (Join-Path $ProjectRoot ".env"))) {
  if (Test-Path (Join-Path $ProjectRoot ".env.sqlite.example")) {
    Step "First run: switch to SQLite env"
    Copy-Item (Join-Path $ProjectRoot ".env.sqlite.example") (Join-Path $ProjectRoot ".env") -Force
    $env:Path = "C:\Program Files\nodejs;" + $env:Path
    npm run prisma:generate:sqlite
    npm run migrate:sqlite
    npm run seed:admin
    Write-Host "DEV_SQLITE_OK: db=sqlite file=dev.db" -ForegroundColor Green
  }
}

# 在新窗口启动开发服务器（不阻塞当前脚本）
$nodePath = "C:\Program Files\nodejs"
$cmd = "Set-Location '$ProjectRoot'; `$env:Path = '$nodePath;' + `$env:Path; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd

Step "Waiting for server (up to 60s)..."
if (Wait-ForServer $FrontUrl 60) {
  Step "Opening frontend and admin in browser"
  Start-Process $FrontUrl
  Start-Process $AdminUrl
  Write-Host "  Frontend: $FrontUrl" -ForegroundColor Green
  Write-Host "  Admin:    $AdminUrl" -ForegroundColor Green
} else {
  Write-Host "Server did not respond in time. Open manually: $FrontUrl and $AdminUrl" -ForegroundColor Yellow
}

Write-Host "`nDev server is running in the other window. Close that window to stop the server.`n" -ForegroundColor Gray

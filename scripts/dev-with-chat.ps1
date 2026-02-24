# 一键启动主站 + chat-server，并打开前台/后台（Live Chat 本地「做好」）
# 用法：在项目根目录执行 powershell -ExecutionPolicy Bypass -File .\scripts\dev-with-chat.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = if ($PSScriptRoot) { (Resolve-Path (Join-Path $PSScriptRoot "..")).Path } else { Get-Location }
$ChatServerRoot = Join-Path $ProjectRoot "services\chat-server"
$PortMain = 3000
$PortChat = 4000
$FrontUrl = "http://localhost:$PortMain/"
$AdminUrl = "http://localhost:$PortMain/admin/login"
$ChatHealthUrl = "http://127.0.0.1:$PortChat/chat/health"

function Step($msg) {
  Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Ensure-ProjectRoot {
  if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
    throw "package.json not found. Please run from project root."
  }
}

function Wait-ForUrl($url, $maxSeconds) {
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

# chat-server 无 .env 时从 .env.example 复制（提示用户改 JWT）
$chatEnv = Join-Path $ChatServerRoot ".env"
if (-not (Test-Path $chatEnv)) {
  $example = Join-Path $ChatServerRoot ".env.example"
  if (Test-Path $example) {
    Step "First run: copy chat-server .env from example"
    Copy-Item $example $chatEnv -Force
    Write-Host "  Please set CHAT_ADMIN_JWT_SECRET and CHAT_ALLOWED_ORIGINS in services/chat-server/.env (same JWT as root .env)." -ForegroundColor Yellow
  }
}

# 新窗口 1：chat-server（先起）
Step "Starting chat-server (port $PortChat) in new window..."
$nodePath = "C:\Program Files\nodejs"
$cmdChat = "Set-Location '$ChatServerRoot'; `$env:Path = '$nodePath;' + `$env:Path; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmdChat

Step "Waiting for chat-server (up to 40s)..."
if (Wait-ForUrl $ChatHealthUrl 40) {
  Write-Host "  chat-server OK: $ChatHealthUrl" -ForegroundColor Green
} else {
  Write-Host "  chat-server did not respond. Check the chat-server window. Continuing to start main site..." -ForegroundColor Yellow
}

# 新窗口 2：主站
Step "Starting main site (port $PortMain) in new window..."
$cmdMain = "Set-Location '$ProjectRoot'; `$env:Path = '$nodePath;' + `$env:Path; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmdMain

Step "Waiting for main site (up to 60s)..."
if (Wait-ForUrl $FrontUrl 60) {
  Step "Opening frontend and admin in browser"
  Start-Process $FrontUrl
  Start-Process $AdminUrl
  Write-Host "  Frontend: $FrontUrl" -ForegroundColor Green
  Write-Host "  Admin:    $AdminUrl" -ForegroundColor Green
} else {
  Write-Host "Main site did not respond in time. Open manually: $FrontUrl and $AdminUrl" -ForegroundColor Yellow
}

Write-Host "`nBoth servers run in separate windows. Close those windows to stop. Live Chat checklist: docs\Live-Chat-做好清单.md`n" -ForegroundColor Gray

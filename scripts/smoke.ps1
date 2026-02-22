param(
  [int]$StartPort = 3000,
  [int]$MaxPort = 3010,
  [switch]$SkipSeed,
  [switch]$KeepServerRunning
)

$ErrorActionPreference = "Stop"

function Get-FreePort([int]$from, [int]$to) {
  for ($p = $from; $p -le $to; $p++) {
    $inUse = $false
    try {
      $conn = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
      if ($conn) { $inUse = $true }
    } catch {
      $netstat = netstat -ano | Select-String ":$p\s"
      if ($netstat) { $inUse = $true }
    }
    if (-not $inUse) { return $p }
  }
  throw "No free port found between $from and $to"
}

function Wait-HttpOk([string]$url) {
  for ($i = 0; $i -lt 240; $i++) {
    try {
      $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
      if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) { return }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }
  throw "Server did not become ready: $url"
}

function Get-ProcessIdByPort([int]$port) {
  try {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) { return $conn.OwningProcess }
  } catch {}
  return $null
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

Write-Host "RepoRoot: $repoRoot"

$port = Get-FreePort $StartPort $MaxPort
$baseUrl = "http://localhost:$port"
Write-Host "Using port: $port"
Write-Host "Base URL: $baseUrl"

$env:INTERNAL_TEST_MODE = "1"
$env:SMOKE_BASE_URL = $baseUrl

# Ensure no stale Next.js dev lock/process blocks startup.
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
$nextLock = Join-Path $repoRoot ".next\\dev\\lock"
if (Test-Path $nextLock) {
  Remove-Item $nextLock -Force -ErrorAction SilentlyContinue
}

Write-Host "Starting dev server..."
$devCommand = "Set-Location '$repoRoot'; npm.cmd run dev -- -p $port"
$devProc = Start-Process -FilePath "powershell.exe" `
  -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $devCommand) `
  -WorkingDirectory $repoRoot `
  -PassThru

Start-Sleep -Seconds 1
if ($devProc.HasExited) {
  throw "Dev server process exited early (pid=$($devProc.Id))."
}

for ($i = 0; $i -lt 240; $i++) {
  if ($devProc.HasExited) {
    throw "Dev server process exited early (pid=$($devProc.Id))."
  }
  try {
    $resp = Invoke-WebRequest -Uri "$baseUrl/admin/login" -UseBasicParsing -TimeoutSec 2
    if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) { break }
  } catch {
    Start-Sleep -Milliseconds 500
  }
  if ($i -eq 239) {
    throw "Server did not become ready: $baseUrl/admin/login"
  }
}
Write-Host "Dev server is responding."

if (-not $SkipSeed) {
  Write-Host "Running seed:test..."
  try {
    & npm.cmd run seed:test
  } catch {
    Write-Host "seed:test failed (continuing). If smoke fails due to missing data, run: npm run seed:test"
  }
}

Write-Host "Running smoke..."
& npm.cmd run smoke

Write-Host "SMOKE_PS_OK: baseUrl=$baseUrl internal=1 seedSkipped=$($SkipSeed.IsPresent)"

if (-not $KeepServerRunning) {
  Write-Host "Stopping dev server..."
  $pidByPort = Get-ProcessIdByPort $port
  if ($pidByPort) {
    Stop-Process -Id $pidByPort -Force -ErrorAction SilentlyContinue
  }
  Stop-Process -Id $devProc.Id -Force -ErrorAction SilentlyContinue
  Write-Host "Dev server stopped."
} else {
  Write-Host "KeepServerRunning enabled. Dev server remains running at $baseUrl"
}

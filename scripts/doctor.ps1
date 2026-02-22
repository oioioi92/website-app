$ErrorActionPreference = "Continue"

function Show-Check($name, $ok, $detail) {
  if ($ok) {
    Write-Host "[OK]  $name - $detail" -ForegroundColor Green
  } else {
    Write-Host "[WARN] $name - $detail" -ForegroundColor Yellow
  }
}

function EnvHasKey($path, $key) {
  if (-not (Test-Path $path)) { return $false }
  $match = Select-String -Path $path -Pattern "^$key=.*$" | Select-Object -First 1
  return $null -ne $match
}

Write-Host "=== WEBSITE DOCTOR ===" -ForegroundColor Cyan
Write-Host "Current Path: $(Get-Location)"

$hasPkg = Test-Path ".\package.json"
$hasPgSchema = Test-Path ".\prisma\schema.postgres.prisma"
$hasSqliteSchema = Test-Path ".\prisma\schema.sqlite.prisma"
$hasEnv = Test-Path ".\.env"

Show-Check "package.json" $hasPkg ".\package.json"
Show-Check "postgres schema" $hasPgSchema ".\prisma\schema.postgres.prisma"
Show-Check "sqlite schema" $hasSqliteSchema ".\prisma\schema.sqlite.prisma"
Show-Check ".env" $hasEnv ".\.env"

try {
  $nodeVersion = (& node -v) 2>$null
  Show-Check "node" ($LASTEXITCODE -eq 0) $nodeVersion
} catch {
  Show-Check "node" $false "node not found"
}

try {
  $npmVersion = (& npm -v) 2>$null
  Show-Check "npm" ($LASTEXITCODE -eq 0) $npmVersion
} catch {
  Show-Check "npm" $false "npm not found"
}

$hasDbUrl = EnvHasKey ".\.env" "DATABASE_URL"
$hasSession = EnvHasKey ".\.env" "SESSION_SECRET"
$hasCsrf = EnvHasKey ".\.env" "CSRF_SECRET"

Show-Check "ENV:DATABASE_URL" $hasDbUrl "DATABASE_URL"
Show-Check "ENV:SESSION_SECRET" $hasSession "SESSION_SECRET"
Show-Check "ENV:CSRF_SECRET" $hasCsrf "CSRF_SECRET"

try {
  $dockerVersion = (& docker version --format '{{.Server.Version}}') 2>$null
  Show-Check "docker" ($LASTEXITCODE -eq 0) $dockerVersion
} catch {
  Show-Check "docker" $false "docker unavailable (non-blocking)"
}

Write-Host "`nDoctor done."

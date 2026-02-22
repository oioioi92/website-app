$ErrorActionPreference = "Stop"

function Step($msg) {
  Write-Host "`n==> $msg" -ForegroundColor Cyan
}

function Ensure-ProjectRoot {
  if (-not (Test-Path ".\package.json")) {
    throw "package.json not found. Please cd to project root."
  }
}

function Backup-EnvIfExists {
  if (Test-Path ".\.env") {
    $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = ".\.env.backup.$stamp"
    Copy-Item ".\.env" $backupPath -Force
    Write-Host "Backed up .env -> $backupPath" -ForegroundColor Yellow
  }
}

function Get-EnvValue($name) {
  if (-not (Test-Path ".\.env")) { return $null }
  $line = Select-String -Path ".\.env" -Pattern "^$name=(.*)$" | Select-Object -First 1
  if (-not $line) { return $null }
  return ($line.Matches[0].Groups[1].Value).Trim('"')
}

Step "Check project root"
Ensure-ProjectRoot

if (-not (Test-Path ".\.env.example")) {
  throw ".env.example missing"
}

Step "Switch to Postgres env template"
Backup-EnvIfExists
Copy-Item ".\.env.example" ".\.env" -Force

$dbUrl = Get-EnvValue "DATABASE_URL"
if (-not $dbUrl -or $dbUrl -like "postgresql://user:pass@localhost*") {
  Write-Host "Please edit .env and set a valid Postgres DATABASE_URL." -ForegroundColor Yellow
  Write-Host "Run this script again after saving .env."
  exit 1
}

Step "Install dependencies"
npm install

Step "Generate Prisma Client (Postgres)"
npm run prisma:generate:pg

Step "Run Postgres migration"
npm run migrate:pg -- --name phase2_postgres

Step "Seed admin user"
npm run seed:admin

Write-Host "`nPHASE2_OK: db=postgres upload=r2 auth=session audit=on rbac=on" -ForegroundColor Green
Step "Start dev server"
npm run dev

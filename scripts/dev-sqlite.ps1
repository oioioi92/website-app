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

Step "Check project root"
Ensure-ProjectRoot

if (-not (Test-Path ".\.env.sqlite.example")) {
  throw ".env.sqlite.example missing"
}

Step "Switch to SQLite env"
Backup-EnvIfExists
Copy-Item ".\.env.sqlite.example" ".\.env" -Force

Step "Install dependencies"
npm install

Step "Generate Prisma Client (SQLite)"
npm run prisma:generate:sqlite

Step "Sync schema to dev.db"
npm run migrate:sqlite

Step "Seed admin user"
npm run seed:admin

Write-Host "`nDEV_SQLITE_OK: db=sqlite file=dev.db" -ForegroundColor Green
Step "Start dev server"
npm run dev

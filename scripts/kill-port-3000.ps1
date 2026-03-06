# Release port 3000 and remove Next.js dev lock. Run when "Port 3000 is in use" or "Unable to acquire lock at .next\dev\lock".
$port = 3000
$found = @(Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
foreach ($p in $found) {
  if ($p) {
    Write-Host "Killing PID $p (port $port)"
    Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
  }
}
if ($found.Count -eq 0) { Write-Host "Port $port was already free." } else { Write-Host "Port $port released." }

$lockPath = Join-Path $PSScriptRoot "..\.next\dev\lock"
if (Test-Path $lockPath) {
  Remove-Item -Recurse -Force $lockPath -ErrorAction SilentlyContinue
  Write-Host "Removed .next\dev\lock"
}
Write-Host "Done. Run: npm run dev"

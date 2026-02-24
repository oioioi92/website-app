# Release port 4000. Run this when EADDRINUSE before npm run dev.
$port = 4000
$found = @(Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
if ($found.Count -eq 0) {
  Write-Host "Port $port is free."
  exit 0
}
foreach ($p in $found) {
  if ($p) {
    Write-Host "Killing PID $p (port $port)"
    Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
  }
}
Write-Host "Port $port released. You can run: npm run dev"

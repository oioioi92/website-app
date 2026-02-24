# Release port 3000 (main site). Run when "Port 3000 is in use" or "Unable to acquire lock".
$port = 3000
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
Write-Host "Port $port released. Run: npm run dev"

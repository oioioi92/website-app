# 检查 DATABASE_URL 是否为 Postgres，再执行 prisma migrate（避免 P1012）
$url = $env:DATABASE_URL
if (-not $url -or ($url -notmatch '^postgres(ql)?://')) {
  Write-Host "ERROR: DATABASE_URL 必须是 postgresql:// 或 postgres:// 开头。" -ForegroundColor Red
  Write-Host "当前 .env 里可能是 file:./dev.db（SQLite）。" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "请先在 .env 中设置 Postgres 连接，例如：" -ForegroundColor Cyan
  Write-Host '  DATABASE_URL="postgresql://user:password@localhost:5432/website"' -ForegroundColor White
  Write-Host ""
  Write-Host "若暂时不用 Postgres，可跳过 Ledger 迁移；All Transactions 仍从入款/出款表读。" -ForegroundColor Gray
  exit 1
}
Write-Host "DATABASE_URL 格式正确，继续执行 migrate..." -ForegroundColor Green
exit 0

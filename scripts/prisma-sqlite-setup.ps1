# Prisma SQLite 本地初始化（一条条执行，避免 EPERM）
# 用法：在 PowerShell 里 一次只运行下面其中一条，等完成后再运行下一条。

# 1) 先关掉所有跑着的 dev（否则会锁住 .prisma 文件）
#    在跑 npm run dev 的窗口按 Ctrl+C 停掉，再继续。

# 2) 生成 Prisma Client（SQLite）
Write-Host "Running: npx prisma generate --schema prisma/schema.sqlite.prisma" -ForegroundColor Cyan
npx prisma generate --schema prisma/schema.sqlite.prisma
if ($LASTEXITCODE -ne 0) {
    Write-Host "Generate failed. If EPERM: close 'npm run dev' and any Node/VS Code terminal, then run this script again." -ForegroundColor Yellow
    exit 1
}

# 3) 推表结构到 dev.db
Write-Host "Running: npx prisma db push --schema prisma/schema.sqlite.prisma" -ForegroundColor Cyan
npx prisma db push --schema prisma/schema.sqlite.prisma
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Done. You can run: npm run dev" -ForegroundColor Green

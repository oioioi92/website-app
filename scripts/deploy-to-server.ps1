# 部署到服务器：只传源码，不传 node_modules 和 .next
# 用法：在 PowerShell 里 cd 到项目根目录，然后 .\scripts\deploy-to-server.ps1
# 传完后需 SSH 到服务器执行：cd /root/website && npm install && npm run build && pm2 restart website-phase2

$sshHost = "root@68.183.227.172"
$remotePath = "/root/website"

$folders = @("app", "components", "lib", "public", "scripts", "prisma", "docs")
$files = @("package.json", "package-lock.json", "next.config.ts", "next.config.mjs", "tailwind.config.ts", "tsconfig.json", "postcss.config.mjs", "postcss.config.js")

Write-Host "Uploading folders..." -ForegroundColor Cyan
foreach ($f in $folders) {
    if (Test-Path $f) {
        Write-Host "  $f"
        scp -r $f "${sshHost}:${remotePath}/"
    }
}
Write-Host "Uploading config files..." -ForegroundColor Cyan
foreach ($f in $files) {
    if (Test-Path $f) {
        Write-Host "  $f"
        scp $f "${sshHost}:${remotePath}/"
    }
}
Write-Host "Done. Now SSH to server and run: cd /root/website && npm install && npm run build && pm2 restart website-phase2" -ForegroundColor Green

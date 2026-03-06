# Deploy: pack source -> upload zip -> on server: unzip, npm install, build, pm2 restart
# Host can be any IP/server: use env DEPLOY_HOST + DEPLOY_REMOTE_PATH, or params, or you will be prompted.
# You will be asked for SSH password twice (upload, then remote run).

param(
    [string]$HostAddr = "",   # e.g. root@1.2.3.4
    [string]$RemotePath = "", # e.g. /root/website
    [switch]$CleanPm2Logs = $false,
    [bool]$SyncProviders = $false,
    [bool]$DeployChatServer = $false
)

$ErrorActionPreference = "Stop"

# #region agent log
$DebugLogPath = Join-Path (Split-Path $PSScriptRoot -Parent) "debug-dafccf.log"
function Write-DebugLog($msg, $data, $hypothesisId) {
    $dataJson = if ($data -ne $null) { ($data | ConvertTo-Json -Compress -Depth 3) } else { "{}" }
    $msgEsc = ($msg -replace '\\','\\\\' -replace '"','\"' -replace "`n", " " -replace "`r", " ")
    $line = "{`"sessionId`":`"dafccf`",`"location`":`"deploy-one-click.ps1`",`"message`":`"$msgEsc`",`"data`":$dataJson,`"timestamp`":$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()),`"hypothesisId`":`"$hypothesisId`"}"
    Add-Content -Path $DebugLogPath -Value $line -ErrorAction SilentlyContinue
}
# #endregion agent log

# Normalize host: strip leading "ssh " so "SSH root@1.2.3.4" or "ssh root@1.2.3.4" works
function Normalize-DeployHost($h) {
    $h = ($h -as [string]).Trim()
    if ($h -match '^(?i)ssh\s+') { $h = $h -replace '^(?i)ssh\s+', '' }
    return $h.Trim()
}

# Host: param -> env -> prompt (so you can deploy to any server from anywhere)
if (-not $HostAddr) { $HostAddr = $env:DEPLOY_HOST }
$HostAddr = Normalize-DeployHost($HostAddr)
if (-not $HostAddr) {
    Write-Host ""
    Write-Host " >>> FIRST: type server address (username@IP), e.g.  root@68.183.227.172" -ForegroundColor Cyan
    Write-Host " >>> Do NOT type 'ssh' in front. Password will be asked 2 times LATER." -ForegroundColor Cyan
    Write-Host ""
    $HostAddr = Read-Host " Server (user@IP)"
    $HostAddr = Normalize-DeployHost($HostAddr)
    if (-not $HostAddr) { throw "Deploy target is required." }
    if ($HostAddr -notmatch "@") {
        Write-Host ""
        Write-Host " You typed something without @. Deploy target must be like  root@1.2.3.4" -ForegroundColor Red
        Write-Host " (Did you enter your password here? Password is asked after upload starts.)" -ForegroundColor Red
        throw "Invalid deploy target. Use username@IP, e.g. root@68.183.227.172"
    }
}
$HostAddr = Normalize-DeployHost($HostAddr)
if (-not $RemotePath) { $RemotePath = $env:DEPLOY_REMOTE_PATH }
if (-not $RemotePath) { $RemotePath = "/root/website" }

# Cleanup toggle: param -> env (DEPLOY_CLEAN_PM2_LOGS=1)
if (-not $CleanPm2Logs -and ($env:DEPLOY_CLEAN_PM2_LOGS -as [string]) -eq "1") { $CleanPm2Logs = $true }
# Provider DB sync: default OFF (so old logos won't be auto-filled back after you clear them).
# Enable with DEPLOY_SYNC_PROVIDERS=1 or pass -SyncProviders $true.
if (($env:DEPLOY_SYNC_PROVIDERS -as [string]) -eq "1") { $SyncProviders = $true }
if (($env:DEPLOY_CHAT_SERVER -as [string]) -eq "1") { $DeployChatServer = $true }
$clearProviderLogos = (($env:DEPLOY_CLEAR_PROVIDER_LOGOS -as [string]) -eq "1")

$zipName = "deploy.zip"
Write-Host "`nDeploy target: $HostAddr`nRemote path:  $RemotePath" -ForegroundColor Gray
Write-Host "Cleanup:     pm2 logs flush = $CleanPm2Logs (set DEPLOY_CLEAN_PM2_LOGS=1 or pass -CleanPm2Logs)" -ForegroundColor Gray
Write-Host "DB sync:     providers from /public/assets = $SyncProviders (set DEPLOY_SYNC_PROVIDERS=1 to enable)" -ForegroundColor Gray
Write-Host "DB cleanup:  clear all provider logos = $clearProviderLogos (set DEPLOY_CLEAR_PROVIDER_LOGOS=1 to enable)" -ForegroundColor Gray
Write-Host "Chat server: deploy services/chat-server = $DeployChatServer (set DEPLOY_CHAT_SERVER=1 to enable)" -ForegroundColor Gray
Write-Host "Server must have $RemotePath/.env with DATABASE_URL=postgresql://... or file:./prisma/dev.db (we do not upload .env)" -ForegroundColor Gray

$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location $projectRoot
# #region agent log
Write-DebugLog "projectRoot set" @{ projectRoot = $projectRoot; toZipCount = 0 } "A"
# #endregion agent log

Write-Host "`n[1/4] Packing source (exclude node_modules, .next, .env)..." -ForegroundColor Cyan
$toZip = @()
$folders = @("app", "components", "config", "lib", "public", "scripts", "prisma", "docs", "styles", "services/chat-server")
$configFiles = @("package.json", "package-lock.json", "next.config.ts", "next.config.mjs", "tailwind.config.ts", "tsconfig.json", "postcss.config.mjs", "postcss.config.js", "proxy.ts", "middleware.ts")
foreach ($f in $folders) {
    if (Test-Path $f) { $toZip += $f }
}
foreach ($f in $configFiles) {
    if (Test-Path $f) { $toZip += $f }
}
# #region agent log
Write-DebugLog "toZip list built" @{ toZipCount = $toZip.Count; toZip = $toZip } "A"
# #endregion agent log
$zipPath = Join-Path $projectRoot $zipName
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
# Use .NET ZipFile with forward slashes so Linux unzip works (no "backslashes as path separators" warning/fail)
$basePath = $projectRoot.TrimEnd('\', '/')
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
# Create = 1 (ZipArchiveMode enum value; avoids type resolution issues on some hosts)
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 1)
try {
    # Add a deploy stamp file into the zip so we can verify the live site is updated
    # without guessing about browser/WeChat/CDN cache.
    $stampUtc = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
    $stampNonce = [Guid]::NewGuid().ToString("N")
    $stampText = @"
deploy_stamp_utc=$stampUtc
deploy_nonce=$stampNonce
deploy_target=$HostAddr
deploy_remote_path=$RemotePath
"@
    $stampEntryPath = "public/__deploy_version.txt"
    $entry = $zip.CreateEntry($stampEntryPath)
    $writer = New-Object System.IO.StreamWriter($entry.Open())
    $writer.Write($stampText)
    $writer.Dispose()

    foreach ($item in $toZip) {
        if (Test-Path $item -PathType Container) {
            Get-ChildItem -Path $item -Recurse -File | ForEach-Object {
                $full = $_.FullName
                $rel = $full.Substring($basePath.Length).TrimStart('\', '/').Replace("\", "/")
                # Global excludes (any depth): node_modules/.next/dist/.env
                if ($rel -match "(^|/)node_modules/" -or $rel -match "(^|/)\\.next/" -or $rel -match "(^|/)dist/" -or $rel -match "(^|/)\\.env$" -or $rel -match "\\.env\\.") { return }
                # Exclude local DB files (locked when dev runs; server uses its own DB)
                if ($rel -match "(^|/)prisma/" -and ($_.Extension -eq ".db" -or $_.Name -like "*.db-journal")) { return }
                # Exclude ekplus backup folder from deploy package.
                if ($rel -match "(^|/)public/assets/providers/_bak_ekplus8/") { return }
                # Exclude uploaded images folder — server keeps its own uploads, we must not overwrite them
                if ($rel -match "(^|/)public/uploads/") { return }
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $full, $rel) | Out-Null
            }
        } else {
            $full = (Resolve-Path $item).Path
            $rel = $full.Substring($basePath.Length).TrimStart('\', '/').Replace("\", "/")
            if ($rel -match "(^|/)\\.env$" -or $rel -match "\\.env\\.") { return }
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $full, $rel) | Out-Null
        }
    }
} finally {
    $zip.Dispose()
}
# #region agent log
$zipSize = (Get-Item $zipPath -ErrorAction SilentlyContinue).Length; Write-DebugLog "zip created" @{ zipPath = $zipPath; zipSize = $zipSize } "E"
# #endregion agent log
Write-Host "    Created $zipName (Unix paths)" -ForegroundColor Green

# #region agent log
Write-DebugLog "before ssh mkdir" @{ HostAddr = $HostAddr; RemotePath = $RemotePath; HostAddrLength = $HostAddr.Length } "B"
# #endregion agent log
Write-Host "`n[2/4] Ensuring remote directory exists (enter SSH password when asked)..." -ForegroundColor Cyan
& ssh $HostAddr "mkdir -p $RemotePath"
if ($LASTEXITCODE -ne 0) {
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
    throw "SSH mkdir failed. Ensure you can log in and have permission to create $RemotePath"
}
Write-Host "`n[2b/4] Uploading to server (enter SSH password again)..." -ForegroundColor Cyan
& scp $zipPath "${HostAddr}:${RemotePath}/"
if ($LASTEXITCODE -ne 0) {
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
    throw "Upload failed"
}

Write-Host "`n[3/4] On server: unzip, npm install, build, pm2 restart (enter SSH password again)..." -ForegroundColor Cyan
$cleanCmd = ""
if ($CleanPm2Logs) {
    # Only clears PM2 logs on disk; does NOT touch database / uploads.
    $cleanCmd = " && (pm2 flush 2>/dev/null || true)"
}
$syncCmd = ""
if ($SyncProviders) {
    # Generate Prisma client based on DATABASE_URL then sync providers into DB.
    # This ensures both Public site and Admin Providers list have data after deploy.
    $syncCmd = " && node scripts/prisma-generate-auto.cjs && node scripts/sync-providers-from-assets.cjs"
}
$clearLogoCmd = ""
if ($clearProviderLogos) {
    # Clear DB logos so admin can re-upload one-by-one.
    $clearLogoCmd = " && node scripts/clear-provider-logos.cjs"
}
$chatCmd = ""
if ($DeployChatServer) {
    # Chat DB: load .env from project root, then try prisma:migrate (Postgres); if it fails, try migrate:sqlite or skip.
    $chatCmd = " && (set -a; [ -f .env ] && . ./.env; set +a)" +
        " && cd services/chat-server && npm ci && npm run prisma:generate" +
        " && (npm run prisma:migrate 2>/dev/null || npm run migrate:sqlite 2>/dev/null || true)" +
        " && npm run build && (pm2 restart chat-server --update-env 2>/dev/null || pm2 start npm --name chat-server -- start) && cd ../.."
}
$remoteCmd =
    ("mkdir -p $RemotePath" +
        " && cd $RemotePath" +
        " && rm -rf .next" +
        " && rm -rf public/assets/providers/_bak_ekplus8 2>/dev/null || true" +
        " && unzip -o -q $zipName" +
        " && rm -f $zipName" +
        " && mkdir -p public/uploads/promos" +
        " && (command -v nginx >/dev/null 2>&1 && echo 'client_max_body_size 20m;' > /etc/nginx/conf.d/upload-limit.conf && nginx -t 2>/dev/null && nginx -s reload 2>/dev/null || true)" +
        " && npm install" +
        " && set -a; [ -f .env ] && . ./.env; set +a" +
        " && echo '[deploy] Step: prisma generate...'" +
        " && node scripts/prisma-generate-auto.cjs" +
        " && echo '[deploy] Step: prisma db push...'" +
        " && node scripts/prisma-db-push-auto.cjs" +
        $syncCmd +
        $clearLogoCmd +
        " && echo '[deploy] Step: npm run build...'" +
        " && npm run build" +
        $chatCmd +
        " && echo '--- deploy stamp ---'" +
        " && (cat public/__deploy_version.txt 2>/dev/null || echo 'stamp missing')" +
        " && echo '--------------------'" +
        " && echo '[deploy] Step: pm2 restart...'" +
        " && (pm2 restart website-phase2 --update-env 2>/dev/null || pm2 start node_modules/next/dist/bin/next --name website-phase2 -- start -p 3000)" +
        $cleanCmd +
        " && pm2 save")
# #region agent log
Write-DebugLog "remoteCmd built" @{ remoteCmdLen = $remoteCmd.Length; remoteCmdFirst200 = $remoteCmd.Substring(0, [Math]::Min(200, $remoteCmd.Length)) } "C"
# #endregion agent log
& ssh $HostAddr $remoteCmd
# #region agent log
$exitCode = $LASTEXITCODE; Write-DebugLog "after remote ssh" @{ LASTEXITCODE = $exitCode } "D"
# #endregion agent log
if ($LASTEXITCODE -ne 0) {
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
    throw "Remote command failed. Check the output above for the error (last [deploy] Step: shows where it failed)."
}

Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Write-Host "`n[4/4] Deploy done." -ForegroundColor Green
Write-Host "  Verify: open  https://YOUR_DOMAIN/api/public/deploy-version?v=1  (check stamp matches above)" -ForegroundColor Yellow
Write-Host "  If 前台/后台 look unchanged: hard refresh (Ctrl+Shift+R or Ctrl+F5), or clear browser cache." -ForegroundColor Yellow
Write-Host ""

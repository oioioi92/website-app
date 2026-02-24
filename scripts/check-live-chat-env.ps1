# Live Chat 环境变量检查（主站 .env 与 chat-server .env）
# 用法：在项目根目录执行 powershell -ExecutionPolicy Bypass -File .\scripts\check-live-chat-env.ps1

$ErrorActionPreference = "Continue"

function Get-EnvValue($path, $key) {
  if (-not (Test-Path $path)) { return $null }
  $line = Get-Content $path -Raw | ForEach-Object { $_ -split "`n" } | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
  if (-not $line) { return $null }
  $v = $line -replace "^$key=", "" -replace "^\s*['\"]?|['\"]\s*$", ""
  return $v.Trim()
}

function Has-EnvKey($path, $key) {
  $v = Get-EnvValue $path $key
  return ($null -ne $v -and $v.Length -gt 0 -and $v -notmatch "^(replace_|your-|https://<)")
}

Write-Host "`n=== Live Chat 环境检查 ===" -ForegroundColor Cyan
Write-Host "（不显示具体密钥内容，只检查是否已配置）`n"

$rootEnv = ".\.env"
$chatEnv = ".\services\chat-server\.env"

# 主站 .env
$hasRoot = Test-Path $rootEnv
Write-Host "主站 .env：$(if ($hasRoot) { '存在' } else { '不存在' })" -ForegroundColor $(if ($hasRoot) { "Green" } else { "Red" })

$chatInternal = Has-EnvKey $rootEnv "CHAT_SERVER_INTERNAL_URL"
$chatJwtRoot = Has-EnvKey $rootEnv "CHAT_ADMIN_JWT_SECRET"
Write-Host "  CHAT_SERVER_INTERNAL_URL: $(if ($chatInternal) { '已配置' } else { '未配置或仍是示例值 → 请填 http://127.0.0.1:4000' })" -ForegroundColor $(if ($chatInternal) { "Green" } else { "Yellow" })
Write-Host "  CHAT_ADMIN_JWT_SECRET:    $(if ($chatJwtRoot) { '已配置' } else { '未配置或仍是示例值 → 请填一组长随机字符串' })" -ForegroundColor $(if ($chatJwtRoot) { "Green" } else { "Yellow" })

# chat-server .env
$hasChatEnv = Test-Path $chatEnv
Write-Host "`nchat-server .env：$(if ($hasChatEnv) { '存在' } else { '不存在 → 请复制 services/chat-server/.env.example 为 .env 并填写' })" -ForegroundColor $(if ($hasChatEnv) { "Green" } else { "Red" })

$chatJwtCs = Get-EnvValue $chatEnv "CHAT_ADMIN_JWT_SECRET"
$rootJwt = Get-EnvValue $rootEnv "CHAT_ADMIN_JWT_SECRET"
$jwtMatch = ($null -ne $rootJwt -and $null -ne $chatJwtCs -and $rootJwt.Length -gt 5 -and $rootJwt -eq $chatJwtCs)
$jwtBothSet = ($null -ne $rootJwt -and $rootJwt.Length -gt 5 -and $null -ne $chatJwtCs -and $chatJwtCs.Length -gt 5)
if ($jwtBothSet) {
  Write-Host "  CHAT_ADMIN_JWT_SECRET:    $(if ($jwtMatch) { '已配置且与主站一致 ✓' } else { '已配置但与主站不一致 → 必须和主站 .env 里完全一样' })" -ForegroundColor $(if ($jwtMatch) { "Green" } else { "Red" })
} elseif ($hasChatEnv) {
  Write-Host "  CHAT_ADMIN_JWT_SECRET:    $(if (Has-EnvKey $chatEnv 'CHAT_ADMIN_JWT_SECRET') { '已配置' } else { '未配置或仍是示例值' })" -ForegroundColor "Yellow"
}

# 小结
$ok = $chatInternal -and $chatJwtRoot -and $hasChatEnv -and $jwtMatch
Write-Host "`n---" -ForegroundColor Gray
if ($ok) {
  Write-Host "结果：Live Chat 所需环境变量已就绪。" -ForegroundColor Green
} else {
  Write-Host "结果：请按上面黄色/红色提示补全或修正 .env，然后重新运行本脚本检查。" -ForegroundColor Yellow
}
Write-Host ""

# 在项目根目录运行 Git，避免 'Website/.git' not recognized 错误
# 用法：cd C:\Users\user\Desktop\Website 后执行：
#   .\scripts\git-fix-and-run.ps1 status
#   .\scripts\git-fix-and-run.ps1 add .
#   .\scripts\git-fix-and-run.ps1 commit -m "说明"
#   .\scripts\git-fix-and-run.ps1 push origin main

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path ($PSScriptRoot + "\..")).Path
$gitDir = Join-Path $projectRoot ".git"

if (-not (Test-Path $gitDir)) {
    Write-Error "未找到 .git 目录: $gitDir"
    exit 1
}

# 用 --git-dir 和 --work-tree 传绝对路径，避免 Git 用相对路径误判
Push-Location $projectRoot
try {
    & git --git-dir="$gitDir" --work-tree="$projectRoot" @args
} finally {
    Pop-Location
}

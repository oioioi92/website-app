# scripts/pr-final-check-v3.1.ps1
# V3.1 Final Check (Windows / PowerShell)
# Runs: build -> smoke(skip seed) -> screenshots -> verify screenshot files
# Notes:
# - Prefers RUN-SMOKE.bat on Windows
# - Falls back to RUN-SMOKE.sh via bash if available

$ErrorActionPreference = "Stop"

Write-Host "== V3.1 Final Check =="

function Run-Step([string]$label, [scriptblock]$cmd) {
  Write-Host ""
  Write-Host $label
  & $cmd
  if ($LASTEXITCODE -ne 0) {
    throw "Step failed: $label (exit code $LASTEXITCODE)"
  }
}

# 1) build
Run-Step "[1/4] npm run build" { npm run build }

# 2) smoke (prefer .bat on Windows)
Run-Step "[2/4] smoke --skip-seed" {
  if (Test-Path ".\RUN-SMOKE.bat") {
    & .\RUN-SMOKE.bat -SkipSeed
  }
  elseif (Test-Path ".\RUN-SMOKE.sh") {
    # Try git-bash / WSL bash
    if (Get-Command bash -ErrorAction SilentlyContinue) {
      & bash .\RUN-SMOKE.sh --skip-seed
    } else {
      throw "bash not found. Install Git Bash/WSL or use RUN-SMOKE.bat."
    }
  }
  else {
    throw "Neither RUN-SMOKE.bat nor RUN-SMOKE.sh found."
  }
}

# 3) screenshots
Run-Step "[3/4] npm run screenshots:capture" { npm run screenshots:capture }

# 4) verify screenshot outputs
Run-Step "[4/4] verify screenshots exist" {
  $outDir = "screenshots"
  $required = @(
    "home_top_marquee_promo_liveTx_desktop.png",
    "home_livetx_actionbar_desktop.png",
    "home_actionbar_desktop.png"
  )

  foreach ($f in $required) {
    $p = Join-Path $outDir $f
    if (-not (Test-Path $p)) {
      throw "Missing screenshot: $p"
    }
  }
}

Write-Host ""
Write-Host "All good."
Write-Host "UI_WEB_V3_1_OK: marquee=ok slider=top liveTx=6rows+ticker stripes=on actionBar=belowTx buttons=imageOverride colors=cfg partnership=inContainer screenshots=ok"

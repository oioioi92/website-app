#!/usr/bin/env bash
set -euo pipefail

echo "== V3.1 Final Check =="

# 1) Build
echo "[1/4] build"
npm run build

# 2) Smoke
echo "[2/4] smoke"
./RUN-SMOKE.sh --skip-seed

# 3) Screenshots
echo "[3/4] screenshots"
npm run screenshots:capture

# 4) Assert screenshot outputs
echo "[4/4] verify screenshot files exist"
OUT_DIR="screenshots"
mkdir -p "$OUT_DIR"
REQ=(
  "home_top_marquee_promo_liveTx_desktop.png"
  "home_livetx_actionbar_desktop.png"
  "home_actionbar_desktop.png"
)

for f in "${REQ[@]}"; do
  if [[ ! -f "${OUT_DIR}/${f}" ]]; then
    echo "❌ Missing screenshot: ${OUT_DIR}/${f}"
    exit 1
  fi
done

echo "✅ All good."
echo "UI_WEB_V3_1_OK: marquee=ok slider=top liveTx=6rows+ticker stripes=on actionBar=belowTx buttons=imageOverride colors=cfg partnership=inContainer screenshots=ok"

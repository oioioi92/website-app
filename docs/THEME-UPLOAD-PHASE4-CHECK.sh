#!/usr/bin/env bash
set -euo pipefail

# Phase 4 Acceptance Script: Theme Upload Proxy (sharp)
#
# Usage:
#   export DOMAIN="https://YOUR_DOMAIN"
#   export CSRF="YOUR_CSRF_TOKEN"
#   export COOKIE="YOUR_ADMIN_COOKIE"
#   node docs/generate-theme-upload-phase4-test-images.cjs
#   bash docs/THEME-UPLOAD-PHASE4-CHECK.sh
#
# Notes:
# - This script requires a valid admin session cookie + CSRF token.
# - It will upload test images to your R2 bucket.

DOMAIN="${DOMAIN:-https://YOUR_DOMAIN}"
CSRF="${CSRF:-YOUR_CSRF_TOKEN}"
COOKIE="${COOKIE:-YOUR_ADMIN_COOKIE}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMG_DIR="${ROOT_DIR}/docs/test-images"

have_cmd() { command -v "$1" >/dev/null 2>&1; }

json_or_raw() {
  if have_cmd jq; then jq .; else cat; fi
}

http_code() {
  curl -s -o /dev/null -w "%{http_code}" "$@"
}

require_file() {
  local p="$1"
  if [[ ! -f "$p" ]]; then
    echo "Missing test file: $p"
    echo "Run: node docs/generate-theme-upload-phase4-test-images.cjs"
    exit 2
  fi
}

echo "========================================="
echo " PHASE 4 UPLOAD SECURITY CHECK"
echo "========================================="
echo "DOMAIN=$DOMAIN"
echo

require_file "${IMG_DIR}/ok.png"
require_file "${IMG_DIR}/bad.svg"
require_file "${IMG_DIR}/fake.png"
require_file "${IMG_DIR}/too-big.jpg"
require_file "${IMG_DIR}/too-large-dimension.png"

echo "[0] Preflight: endpoint reachable"
CODE="$(http_code -X POST "${DOMAIN}/api/admin/upload/image" -H "x-csrf-token: ${CSRF}" -H "Cookie: ${COOKIE}" -F "module=theme" || true)"
echo "HTTP $CODE (expect 400/401/403; 404 means routing/proxy issue)"
echo

echo "[1] 正常 PNG 上传（应成功 + 返回 publicUrl）"
curl -s -X POST "${DOMAIN}/api/admin/upload/image" \
  -H "x-csrf-token: ${CSRF}" \
  -H "Cookie: ${COOKIE}" \
  -F "file=@${IMG_DIR}/ok.png;type=image/png" \
  -F "module=theme" | json_or_raw
echo

echo "[2] SVG 上传（必须失败：415 IMAGE_UNSUPPORTED）"
curl -s -X POST "${DOMAIN}/api/admin/upload/image" \
  -H "x-csrf-token: ${CSRF}" \
  -H "Cookie: ${COOKIE}" \
  -F "file=@${IMG_DIR}/bad.svg;type=image/svg+xml" \
  -F "module=theme" | json_or_raw
echo

echo "[3] 伪造 MIME（fake.png 但内容非 PNG，必须 decode 失败：400 IMAGE_DECODE_FAIL）"
curl -s -X POST "${DOMAIN}/api/admin/upload/image" \
  -H "x-csrf-token: ${CSRF}" \
  -H "Cookie: ${COOKIE}" \
  -F "file=@${IMG_DIR}/fake.png;type=image/png" \
  -F "module=theme" | json_or_raw
echo

echo "[4] 超 2MB 文件（必须 413 IMAGE_TOO_LARGE）"
curl -s -X POST "${DOMAIN}/api/admin/upload/image" \
  -H "x-csrf-token: ${CSRF}" \
  -H "Cookie: ${COOKIE}" \
  -F "file=@${IMG_DIR}/too-big.jpg;type=image/jpeg" \
  -F "module=theme" | json_or_raw
echo

echo "[5] 超像素图片（>4096px，必须 413 IMAGE_TOO_LARGE_DIM）"
curl -s -X POST "${DOMAIN}/api/admin/upload/image" \
  -H "x-csrf-token: ${CSRF}" \
  -H "Cookie: ${COOKIE}" \
  -F "file=@${IMG_DIR}/too-large-dimension.png;type=image/png" \
  -F "module=theme" | json_or_raw
echo

echo "[6] Rate limit 测试（连续 31 次上传；第 31 次应 429）"
for ((i=1; i<=31; i++)); do
  code="$(http_code -X POST "${DOMAIN}/api/admin/upload/image" \
    -H "x-csrf-token: ${CSRF}" \
    -H "Cookie: ${COOKIE}" \
    -F "file=@${IMG_DIR}/ok.png;type=image/png" \
    -F "module=theme" || true)"
  printf "%02d -> %s\n" "$i" "$code"
done
echo

echo "========================================="
echo " CHECK COMPLETE"
echo "========================================="


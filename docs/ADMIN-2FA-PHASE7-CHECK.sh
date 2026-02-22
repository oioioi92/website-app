#!/usr/bin/env bash
set -euo pipefail

# Phase 7 Acceptance Script: Admin 2FA (TOTP)
#
# Requirements:
# - curl
# - node (to generate TOTP codes)
# - jq (optional but recommended)
#
# Usage:
#   export DOMAIN="https://YOUR_DOMAIN"
#   export ADMIN_EMAIL="admin@example.com"
#   export ADMIN_PASSWORD="your_password"
#   export TOTP_ISSUER="YourBrand Admin"   # optional; used only for display
#   bash docs/ADMIN-2FA-PHASE7-CHECK.sh | tee phase7-2fa-output.txt
#
# Notes:
# - This script enables 2FA for the account (if not enabled).
# - It will generate backup codes and will consume 1 backup code to prove one-time usage.

DOMAIN="${DOMAIN:-https://YOUR_DOMAIN}"
ADMIN_EMAIL="${ADMIN_EMAIL:-}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

if [[ -z "$ADMIN_EMAIL" || -z "$ADMIN_PASSWORD" ]]; then
  echo "Missing env. Please set ADMIN_EMAIL and ADMIN_PASSWORD."
  exit 2
fi

have_cmd() { command -v "$1" >/dev/null 2>&1; }

json_or_raw() {
  if have_cmd jq; then jq .; else cat; fi
}

tmpdir="$(mktemp -d)"
cookiejar="${tmpdir}/cookies.txt"

cleanup() {
  rm -rf "$tmpdir" >/dev/null 2>&1 || true
}
trap cleanup EXIT

node_totp() {
  local secret="$1"
  node -e "const {generateSync}=require('otplib'); console.log(generateSync({secret: process.argv[1]}));" "$secret"
}

get_csrf() {
  local out
  out="$(curl -sS -c "$cookiejar" -b "$cookiejar" "${DOMAIN}/api/admin/csrf")"
  if have_cmd jq; then
    echo "$out" | jq -r .token
  else
    node -e "const s=process.argv[1]; try { const j=JSON.parse(s); console.log(j.token||''); } catch { console.log(''); }" "$out"
  fi
}

login() {
  curl -sS -D "${tmpdir}/hdr.txt" -c "$cookiejar" -b "$cookiejar" \
    -H "content-type: application/json" \
    -X POST "${DOMAIN}/api/admin/login" \
    --data "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}"
}

logout() {
  local csrf="$1"
  curl -sS -c "$cookiejar" -b "$cookiejar" -X POST "${DOMAIN}/api/admin/logout" \
    -H "x-csrf-token: ${csrf}" >/dev/null || true
}

echo "========================================="
echo " PHASE 7 ADMIN 2FA (TOTP) CHECK"
echo "========================================="
echo "DOMAIN=${DOMAIN}"
echo "ADMIN_EMAIL=${ADMIN_EMAIL}"
echo

echo "[1] Login (password only)"
LOGIN_JSON="$(login)"
echo "$LOGIN_JSON" | json_or_raw
echo

echo "[2] CSRF bootstrap"
CSRF="$(get_csrf)"
if [[ -z "$CSRF" ]]; then
  echo "Failed to fetch CSRF token. Check /api/admin/csrf."
  exit 1
fi
echo "CSRF_OK"
echo

echo "[3] Start 2FA setup (get secret + otpauth)"
SETUP_JSON="$(curl -sS -c "$cookiejar" -b "$cookiejar" -X POST "${DOMAIN}/api/admin/security/2fa/setup" -H "x-csrf-token: ${CSRF}")"
echo "$SETUP_JSON" | json_or_raw

SECRET="$(echo "$SETUP_JSON" | (have_cmd jq && jq -r .secret || node -e "const j=JSON.parse(process.argv[1]); console.log(j.secret||'');" "$SETUP_JSON"))"
if [[ -z "$SECRET" || "$SECRET" == "null" ]]; then
  echo "No secret returned (maybe already enabled). Will continue without enabling step."
else
  echo
  echo "[4] Enable 2FA (verify code, store encrypted secret, generate backup codes)"
  CODE="$(node_totp "$SECRET")"
  ENABLE_JSON="$(curl -sS -c "$cookiejar" -b "$cookiejar" -X POST "${DOMAIN}/api/admin/security/2fa/enable" \
    -H "content-type: application/json" -H "x-csrf-token: ${CSRF}" \
    --data "{\"secret\":\"${SECRET}\",\"code\":\"${CODE}\"}")"
  echo "$ENABLE_JSON" | json_or_raw

  BACKUP_CODE="$(echo "$ENABLE_JSON" | (have_cmd jq && jq -r '.backupCodes[0] // empty' || node -e "const j=JSON.parse(process.argv[1]); console.log((j.backupCodes&&j.backupCodes[0])||'');" "$ENABLE_JSON"))"
  if [[ -z "$BACKUP_CODE" ]]; then
    echo "WARN: backup code not returned. (Maybe already enabled or enable failed.)"
  fi
fi

echo
echo "[5] Logout and re-login; should require 2FA now"
logout "$CSRF"
LOGIN2_JSON="$(login)"
echo "$LOGIN2_JSON" | json_or_raw
echo

echo "[6] CSRF again (new session)"
CSRF2="$(get_csrf)"
echo "CSRF_OK"
echo

echo "[7] Gate test: call /api/admin/theme before 2FA verify (expect 401 TOTP_REQUIRED)"
HTTP_THEME_BEFORE="$(curl -sS -o "${tmpdir}/theme_before.json" -w "%{http_code}" -c "$cookiejar" -b "$cookiejar" "${DOMAIN}/api/admin/theme" || true)"
echo "HTTP ${HTTP_THEME_BEFORE}"
cat "${tmpdir}/theme_before.json" | json_or_raw
echo

echo "[8] Rate limit test: 6 wrong codes with same XFF; expect last=429"
for ((i=1; i<=6; i++)); do
  code="$(curl -sS -o /dev/null -w "%{http_code}" -c "$cookiejar" -b "$cookiejar" \
    -H "content-type: application/json" -H "x-csrf-token: ${CSRF2}" -H "x-forwarded-for: 203.0.113.111" \
    -X POST "${DOMAIN}/api/admin/security/2fa/verify" --data "{\"code\":\"000000\"}" || true)"
  printf "%02d -> %s\n" "$i" "$code"
done
echo

echo "[9] Verify with a real TOTP code (use different XFF to avoid rate limit)"
if [[ -z "${SECRET:-}" || "${SECRET:-null}" == "null" ]]; then
  echo "NOTE: SECRET missing (likely already enabled earlier)."
  echo "Enter the current authenticator code manually:"
  read -r MANUAL_CODE
  REAL_CODE="$MANUAL_CODE"
else
  REAL_CODE="$(node_totp "$SECRET")"
fi

VERIFY_JSON="$(curl -sS -c "$cookiejar" -b "$cookiejar" \
  -H "content-type: application/json" -H "x-csrf-token: ${CSRF2}" -H "x-forwarded-for: 203.0.113.112" \
  -X POST "${DOMAIN}/api/admin/security/2fa/verify" --data "{\"code\":\"${REAL_CODE}\"}")"
echo "$VERIFY_JSON" | json_or_raw
echo

echo "[10] Gate test: call /api/admin/theme after 2FA verify (expect 200)"
HTTP_THEME_AFTER="$(curl -sS -o "${tmpdir}/theme_after.json" -w "%{http_code}" -c "$cookiejar" -b "$cookiejar" "${DOMAIN}/api/admin/theme" || true)"
echo "HTTP ${HTTP_THEME_AFTER}"
cat "${tmpdir}/theme_after.json" | json_or_raw
echo

echo "[11] Backup code test (one-time): logout -> login -> verify via backup code -> logout -> login -> reuse should fail"
if [[ -z "${BACKUP_CODE:-}" ]]; then
  echo "SKIP: no backup code captured from enable response."
else
  logout "$CSRF2"
  login >/dev/null
  CSRF3="$(get_csrf)"
  echo "--- use backup code once ---"
  curl -sS -c "$cookiejar" -b "$cookiejar" \
    -H "content-type: application/json" -H "x-csrf-token: ${CSRF3}" -H "x-forwarded-for: 203.0.113.113" \
    -X POST "${DOMAIN}/api/admin/security/2fa/verify" --data "{\"code\":\"${BACKUP_CODE}\"}" | json_or_raw
  echo
  logout "$CSRF3"
  login >/dev/null
  CSRF4="$(get_csrf)"
  echo "--- reuse same backup code (should be INVALID_CODE) ---"
  curl -sS -c "$cookiejar" -b "$cookiejar" \
    -H "content-type: application/json" -H "x-csrf-token: ${CSRF4}" -H "x-forwarded-for: 203.0.113.114" \
    -X POST "${DOMAIN}/api/admin/security/2fa/verify" --data "{\"code\":\"${BACKUP_CODE}\"}" | json_or_raw
  echo
fi

echo "========================================="
echo " CHECK COMPLETE"
echo "========================================="


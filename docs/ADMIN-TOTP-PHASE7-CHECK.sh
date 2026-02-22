#!/usr/bin/env bash
set -euo pipefail

# Phase 7 Acceptance Script (Semi-auto):
# - You provide an already-logged-in admin COOKIE + CSRF + current TOTP + one unused backup code.
# - This is intentionally "most reliable" for environments with Cloudflare / complex login flows.
#
# Required env:
#   DOMAIN="https://YOUR_DOMAIN"
#   COOKIE="admin_session=...; admin_csrf=...; other=..."
#   CSRF="..."                 # must match admin_csrf cookie value
#   TOTP_CODE_OK="123456"      # current 6-digit code
#   BACKUP_CODE_OK="ABCD-EFGH" # one unused backup code
#
# Optional env:
#   XFF_GATE="203.0.113.201"
#   XFF_TOTP="203.0.113.202"
#   XFF_BACKUP="203.0.113.203"
#   XFF_RATELIMIT="203.0.113.204"
#
# Output:
#   Prints PASS/FAIL evidence for:
#   - Gate (401 TOTP_REQUIRED)
#   - Verify ok -> gate becomes 200
#   - Backup code one-time (first ok, second fail)
#   - Rate limit (6th wrong attempt -> 429)
#   - Audit log (optional)

: "${DOMAIN:?set DOMAIN like https://yourdomain.com}"
: "${COOKIE:?set COOKIE (must include admin_session + admin_csrf)}"
: "${CSRF:?set CSRF (must equal admin_csrf cookie value)}"
: "${TOTP_CODE_OK:?set TOTP_CODE_OK (current 6-digit code)}"
: "${BACKUP_CODE_OK:?set BACKUP_CODE_OK (one unused backup code)}"

XFF_GATE="${XFF_GATE:-203.0.113.201}"
XFF_TOTP="${XFF_TOTP:-203.0.113.202}"
XFF_BACKUP="${XFF_BACKUP:-203.0.113.203}"
XFF_RATELIMIT="${XFF_RATELIMIT:-203.0.113.204}"

have_cmd() { command -v "$1" >/dev/null 2>&1; }

json_or_raw() {
  if have_cmd jq; then jq .; else cat; fi
}

tmpdir="$(mktemp -d)"
hdr="${tmpdir}/hdr.txt"
body="${tmpdir}/body.txt"

cleanup() { rm -rf "$tmpdir" >/dev/null 2>&1 || true; }
trap cleanup EXIT

api() {
  local method="$1"; shift
  local path="$1"; shift
  local xff="${1:-}"; shift || true

  : >"$hdr"
  : >"$body"

  # For GET requests, don't force JSON content-type.
  local ct=()
  if [[ "$method" != "GET" ]]; then
    ct=(-H "content-type: application/json")
  fi

  curl -sS -D "$hdr" -o "$body" \
    -X "$method" "${DOMAIN}${path}" \
    -H "Cookie: ${COOKIE}" \
    -H "x-csrf-token: ${CSRF}" \
    -H "x-forwarded-for: ${xff:-$XFF_GATE}" \
    "${ct[@]}" \
    "$@" || true

  awk 'NR==1{print $2}' "$hdr"
}

expect_http() {
  local got="$1"
  local want="$2"
  local msg="$3"
  if [[ "$got" != "$want" ]]; then
    echo "FAIL: $msg (want HTTP $want, got $got)"
    echo "--- body ---"
    cat "$body" | json_or_raw
    exit 1
  fi
  echo "OK: $msg"
}

echo "========================================="
echo " PHASE 7 ADMIN 2FA (TOTP) CHECK (Semi-auto)"
echo "========================================="
echo "DOMAIN=$DOMAIN"
echo

echo "== [1] Gate: 未完成 2FA 时 /api/admin/theme 应 401 TOTP_REQUIRED =="
CODE="$(api GET "/api/admin/theme" "$XFF_GATE")"
echo "HTTP $CODE"
cat "$body" | json_or_raw
if [[ "$CODE" == "200" ]]; then
  echo "FAIL: 当前 session 似乎已经 totpOk=true（无法证明 Gate）。"
  echo "建议：用一个“刚登录、还没输入 2FA”的 cookie 再跑一次。"
  exit 1
fi
expect_http "$CODE" "401" "theme before verify is blocked"
if ! grep -q "TOTP_REQUIRED" "$body"; then
  echo "WARN: response body did not include TOTP_REQUIRED (still 401 ok)"
fi
echo

echo "== [2] verify: 正确 TOTP code 应通过并写入 session totpOk =="
CODE="$(api POST "/api/admin/security/2fa/verify" "$XFF_TOTP" --data "{\"code\":\"${TOTP_CODE_OK}\"}")"
echo "HTTP $CODE"
cat "$body" | json_or_raw
expect_http "$CODE" "200" "verify with real totp code"
echo

echo "== [3] Gate 解除：/api/admin/theme 现在应返回 200 =="
CODE="$(api GET "/api/admin/theme" "$XFF_TOTP")"
echo "HTTP $CODE"
cat "$body" | json_or_raw
expect_http "$CODE" "200" "theme after verify is allowed"
echo

echo "== [4] backup code 一次性：第一次应 200，第二次应失败（非 200） =="
CODE="$(api POST "/api/admin/security/2fa/verify" "$XFF_BACKUP" --data "{\"code\":\"${BACKUP_CODE_OK}\"}")"
echo "HTTP $CODE (first)"
cat "$body" | json_or_raw
expect_http "$CODE" "200" "backup code first use"

CODE="$(api POST "/api/admin/security/2fa/verify" "$XFF_BACKUP" --data "{\"code\":\"${BACKUP_CODE_OK}\"}")"
echo "HTTP $CODE (second)"
cat "$body" | json_or_raw
if [[ "$CODE" == "200" ]]; then
  echo "FAIL: backup code reused but still 200"
  exit 1
else
  echo "OK: backup code not reusable"
fi
echo

echo "== [5] rate limit：连续错 6 次，第 6 次应 429 RATE_LIMITED =="
LAST=""
for i in 1 2 3 4 5 6; do
  LAST="$(api POST "/api/admin/security/2fa/verify" "$XFF_RATELIMIT" --data "{\"code\":\"000000\"}")"
  echo "try#$i HTTP $LAST"
done
if [[ "$LAST" != "429" ]]; then
  echo "FAIL: 6th attempt should be 429"
  echo "--- last body ---"
  cat "$body" | json_or_raw
  exit 1
fi
echo "OK: rate limit hit (6th -> 429)"
echo

echo "== [6] AuditLog（可选）：拉取 /api/admin/audit 并检查 TOTP_* 事件 =="
CODE="$(api GET "/api/admin/audit" "$XFF_TOTP")"
echo "HTTP $CODE"
if [[ "$CODE" != "200" ]]; then
  echo "SKIP: cannot fetch audit (need content editor role + totpOk)."
else
  if have_cmd jq; then
    cat "$body" | jq -r '.items[] | select(.action|startswith("TOTP_")) | "\(.createdAt) \(.action) \(.actor.email)"' | head -n 20 || true
  else
    echo "jq not installed; raw response:"
    cat "$body" | head -n 40 || true
  fi
fi
echo

echo "========================================="
echo " PHASE 7 CHECK PASS"
echo "========================================="


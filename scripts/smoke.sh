#!/usr/bin/env bash
set -euo pipefail

SKIP_SEED=0
KEEP_SERVER=0

for arg in "$@"; do
  case "$arg" in
    --skip-seed|-SkipSeed) SKIP_SEED=1 ;;
    --keep-server|-KeepServerRunning) KEEP_SERVER=1 ;;
    *) echo "Unknown arg: $arg" ;;
  esac
done

mkdir -p logs

find_free_port() {
  for p in {3000..3010}; do
    node -e "const net=require('net');const s=net.createServer();s.once('error',()=>process.exit(1));s.once('listening',()=>s.close(()=>process.exit(0)));s.listen($p,'127.0.0.1');" \
      >/dev/null 2>&1 && echo "$p" && return 0
  done
  return 1
}

PORT="$(find_free_port)"
BASE_URL="http://localhost:$PORT"

export INTERNAL_TEST_MODE=1
export SMOKE_BASE_URL="$BASE_URL"

echo "SMOKE_SH: baseUrl=$BASE_URL internal=$INTERNAL_TEST_MODE skipSeed=$SKIP_SEED keepServer=$KEEP_SERVER"

if [ "$SKIP_SEED" -eq 0 ]; then
  npm run seed:test
else
  echo "Seed skipped."
fi

LOG_DEV="logs/dev-$PORT.log"
( PORT="$PORT" npm run dev -- -p "$PORT" ) >"$LOG_DEV" 2>&1 &
DEV_PID=$!

cleanup() {
  if [ "$KEEP_SERVER" -eq 0 ]; then
    echo "Stopping dev server (pid=$DEV_PID)..."
    kill "$DEV_PID" >/dev/null 2>&1 || true
  else
    echo "Keeping dev server running (pid=$DEV_PID)."
  fi
}
trap cleanup EXIT

echo "Waiting for server..."
for i in {1..60}; do
  if curl -fsS "$BASE_URL/api/public/home" >/dev/null 2>&1; then
    echo "Server is up."
    break
  fi
  sleep 1
  if [ "$i" -eq 60 ]; then
    echo "Server did not start. Check $LOG_DEV"
    exit 1
  fi
done

LOG_SMOKE="logs/smoke-last.log"
set +e
npm run smoke >"$LOG_SMOKE" 2>&1
RC=$?
set -e

if [ "$RC" -eq 0 ]; then
  echo "SMOKE PASSED. Log saved: $LOG_SMOKE"
  exit 0
else
  echo "SMOKE FAILED. Log saved: $LOG_SMOKE"
  exit "$RC"
fi

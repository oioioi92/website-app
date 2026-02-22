#!/usr/bin/env bash
# One-shot P0 proof collector for chat-server deployment.
# Replace DOMAIN then run on the VPS.

set -euo pipefail

DOMAIN="YOUR_DOMAIN"

echo "=== [1] PM2 proof (4 lines) ==="
pm2 logs chat-server --lines 200 --nostream | egrep -a "SERVER_OK|DB_OK|WS_OK|P0_OK|P1_OK" || true

echo
echo "=== [2] curl proof ==="
echo "--- widget.js headers ---"
curl -I "https://${DOMAIN}/chat/widget/widget.js" | sed -n '1,12p' || true
echo "--- socket.io.min.js headers ---"
curl -I "https://${DOMAIN}/chat/widget/socket.io.min.js" | sed -n '1,12p' || true
echo "--- health ---"
curl -s "https://${DOMAIN}/chat/health" || true
echo

echo "=== [3] DB counts ==="
sudo -u postgres psql -d chatdb -c 'select count(*) as conversations from "Conversation";' || true
sudo -u postgres psql -d chatdb -c 'select count(*) as messages from "Message";' || true
sudo -u postgres psql -d chatdb -c 'select count(*) as events from "Event";' || true


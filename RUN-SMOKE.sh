#!/usr/bin/env bash
# One-click smoke for macOS/Linux; forwards all args to scripts/smoke.sh
cd "$(dirname "$0")"
exec ./scripts/smoke.sh "$@"

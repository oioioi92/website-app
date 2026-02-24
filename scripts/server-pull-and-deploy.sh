#!/bin/bash
# 在服务器上执行：拉代码、构建主站、重启主站与 chat-server
# 用法：在服务器项目根目录执行 bash scripts/server-pull-and-deploy.sh
# 或：cd /root/website && bash scripts/server-pull-and-deploy.sh

set -e
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

echo "=== 1. 拉取最新代码 ==="
git fetch origin
git checkout main
git pull origin main

echo "=== 2. 主站：安装依赖、构建、重启 ==="
npm ci
npm run prisma:generate 2>/dev/null || true
npm run build
pm2 restart website-phase2 2>/dev/null || pm2 restart all 2>/dev/null || echo "请手动执行: pm2 restart <主站名称>"

echo "=== 3. chat-server：若存在则安装并重启 ==="
if [ -d "services/chat-server" ]; then
  cd services/chat-server
  npm ci
  npm run prisma:generate 2>/dev/null || true
  pm2 restart chat-server 2>/dev/null || (pm2 start npm --name chat-server -- start && pm2 save)
  cd "$ROOT"
else
  echo "未找到 services/chat-server，跳过。"
fi

echo "=== 完成 ==="
echo "请检查：前台 https://admin1167.com、后台 https://admin1167.net/admin/chat"

#!/bin/bash
# 一键启动 chat-server（安装依赖、生成 Prisma、用 PM2 启动）
# 用法：在项目根目录执行 bash scripts/start-chat-server.sh
# 或在服务器上：cd /root/website && bash scripts/start-chat-server.sh

set -e
cd "$(dirname "$0")/.."
CHAT_DIR="$(pwd)/services/chat-server"

if [ ! -d "$CHAT_DIR" ]; then
  echo "未找到 services/chat-server，请确认项目结构。"
  exit 1
fi

echo "=== 进入 chat-server 目录 ==="
cd "$CHAT_DIR"

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "已从 .env.example 复制创建 .env，请先运行主站根目录的 node scripts/setup-live-chat-env.cjs 同步 JWT。"
  fi
fi

echo "=== 安装依赖 ==="
npm ci 2>/dev/null || npm install

echo "=== 生成 Prisma ==="
npm run prisma:generate 2>/dev/null || npx prisma generate --schema prisma/schema.sqlite.prisma 2>/dev/null || npx prisma generate

echo "=== 启动 chat-server（PM2）==="
pm2 delete chat-server 2>/dev/null || true
pm2 start npm --name chat-server -- start
pm2 save
pm2 list | grep chat-server

echo ""
echo "chat-server 已启动。同机检查: curl -s http://127.0.0.1:4000/chat/health"

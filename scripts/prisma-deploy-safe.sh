#!/bin/bash
# Prisma 生产防翻车：自动检查 + 可选备份 + migrate deploy
# 用法（在项目根目录）：
#   ./scripts/prisma-deploy-safe.sh           # 检查 + 备份 + deploy
#   ./scripts/prisma-deploy-safe.sh --dry-run # 只做检查与 status，不备份、不 deploy
#   ./scripts/prisma-deploy-safe.sh --skip-backup  # 不备份，直接 deploy
# 要求：DATABASE_URL 为 postgresql（非 file:）；生产环境建议先阅读 docs/PRISMA-MIGRATE-DEPLOY-SAFE.md

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

SCHEMA="prisma/schema.postgres.prisma"
DRY_RUN=false
SKIP_BACKUP=false
for arg in "$@"; do
  case "$arg" in
    --dry-run)     DRY_RUN=true ;;
    --skip-backup) SKIP_BACKUP=true ;;
  esac
done

# 加载 .env（若存在且 DATABASE_URL 未设置）
if [ -z "${DATABASE_URL:-}" ] && [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ROOT/.env" 2>/dev/null || true
  set +a
fi

echo "=== ① 确认 DATABASE_URL 为 Postgres ==="
if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL 未设置。请 export DATABASE_URL 或在项目根目录配置 .env"
  exit 1
fi
# 只显示协议部分，避免打印密码
case "${DATABASE_URL}" in
  postgres://*|postgresql://*)
    echo "✔ DATABASE_URL 为 Postgres"
    ;;
  file:*|*sqlite*)
    echo "❌ 当前为 SQLite（file: 或 sqlite），不是生产 Postgres。请勿在本环境执行 migrate deploy。"
    echo "   本地开发请用: npm run migrate:sqlite"
    exit 1
    ;;
  *)
    echo "❌ DATABASE_URL 格式异常，应为 postgresql:// 或 postgres://"
    exit 1
    ;;
esac

echo ""
echo "=== ② 校验 schema ==="
npx prisma validate --schema "$SCHEMA"
echo "✔ The schema is valid."

echo ""
echo "=== ③ Migration 状态（只读）==="
npx prisma migrate status --schema "$SCHEMA" || true

if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "--- dry-run 结束，未执行备份与 deploy。要去掉检查并执行请去掉 --dry-run ---"
  exit 0
fi

# 备份（可选）
if [ "$SKIP_BACKUP" = false ]; then
  echo ""
  echo "=== ④ 备份（pg_dump）==="
  BACKUP_DIR="$ROOT/backups"
  mkdir -p "$BACKUP_DIR"
  STAMP=$(date +%Y%m%d_%H%M%S)
  BACKUP_FILE="$BACKUP_DIR/backup_before_migrate_$STAMP.sql"
  if command -v pg_dump >/dev/null 2>&1; then
    pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
    echo "✔ 已备份到: $BACKUP_FILE"
  else
    echo "⚠ pg_dump 未找到，跳过备份。建议安装 PostgreSQL 客户端后重跑或使用 --skip-backup。"
    read -r -p "继续执行 deploy？(y/N) " yn
    case "$yn" in
      [yY]) ;;
      *) echo "已取消"; exit 0 ;;
    esac
  fi
else
  echo ""
  echo "=== ④ 跳过备份（--skip-backup）==="
fi

echo ""
echo "=== ⑤ 执行 migrate deploy ==="
npx prisma migrate deploy --schema "$SCHEMA"
echo "✔ Migration deploy 完成。"

echo ""
echo "=== ⑥ 执行后请手动完成 ==="
echo "1) 重启主站: pm2 restart website-new   # 或你的主站进程名，如 website-phase2"
echo "2) 查看日志: pm2 logs website-new --lines 100"
echo "3) 验收: 首页 / Admin 登录 / Chat 正常 → 28/28 ✅"
echo ""
echo "详见: docs/PRISMA-MIGRATE-DEPLOY-SAFE.md"

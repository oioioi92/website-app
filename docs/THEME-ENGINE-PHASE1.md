# Theme Engine Phase 1 (Enterprise)

目标：只做数据层 + API（乐观锁），不改前台读取，不改上传，不删旧接口。

## 结论：SiteSetting 结构

- 当前实现为单条：`SiteSetting.key = "theme_json"`

## Step 1: DB 增量（只新增表，不动旧表）

本项目历史上没有在主站启用 Prisma migrations（线上已有表，但没有 `_prisma_migrations` baseline）。

Phase 1 推荐走最稳路线：

1. 更新代码里的 Prisma schema（已完成）
2. 线上用 `prisma db push` 把新增的 `Theme/ThemeHistory` 表推上去（不会要求 baseline）

在 VPS（主站目录）执行：

```bash
node scripts/prisma-generate-auto.cjs
npx prisma db push --schema prisma/schema.postgres.prisma
```

## Step 2: 一次性 bootstrap（从 SiteSetting 复制到 Theme）

```bash
node scripts/bootstrap-theme-from-sitesetting.cjs
```

可选：指定 bootstrap admin：

```bash
THEME_BOOTSTRAP_ADMIN_ID="ADMIN_USER_ID" node scripts/bootstrap-theme-from-sitesetting.cjs
```

## Step 3: API 验证（不切换前台读取）

- `GET /api/admin/theme`
- `PUT /api/admin/theme`（需要 CSRF + role=super/content_admin）
- `GET /api/admin/theme/history?limit=50`

冲突验证：

- 用同一个 `expectedVersion` 连续保存两次
- 第二次必须 `409 THEME_CONFLICT`

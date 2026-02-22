# Phase 2 CMS (Next.js + Prisma + Postgres + R2)

一个可上线、可扩展、可维护的 Phase 2 版本，包含：

- Postgres + Prisma
- Admin Cookie Session Auth + CSRF + RBAC(admin/editor)
- Promotion Blocks CMS（h1/p/list/button/image）
- R2 Signed URL 上传
- Audit Log 审计
- Public Home API 缓存 + 限流 + 容错

Robin Manual：`docs/ROBIN-MANUAL.md`

## Quick Start (No Docker, No DB)

适合本机没有 Docker / Neon / Postgres 服务的情况，直接使用 SQLite 本地文件。

1) 在 PowerShell 执行（如有执行策略限制，先临时放开）：

```powershell
Set-ExecutionPolicy -Scope Process Bypass
powershell -ExecutionPolicy Bypass -File .\scripts\dev-sqlite.ps1
```

1) 打开：

- 前台：`http://localhost:3000/`
- 后台：`http://localhost:3000/admin/login`

成功标志：

`DEV_SQLITE_OK: db=sqlite file=dev.db`

## Demo 快速演示（A 到 Z）

1) 一键启动 SQLite 本地模式：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev-sqlite.ps1
```

1) 灌入演示内容（固定模块：promotions=6 games=12 social=5）：

```bash
npm run seed:demo
```

1) 自动截图（桌面/手机/后台）：

```bash
npm run screenshots:capture
```

1) 截图输出位置：

- `screenshots/home-desktop-final.png`
- `screenshots/home-mobile-final.png`
- `screenshots/admin-login-final.png`
- `screenshots/admin-promotions-final.png`
- `screenshots/admin-audit-final.png`

## Switch to Production Postgres

1) 准备 Postgres `DATABASE_URL`（Neon/Supabase/自建）
1) 把 `.env.example` 内容填好（尤其 `DATABASE_URL`）
1) 执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\prod-postgres.ps1
```

成功标志：

`PHASE2_OK: db=postgres upload=r2 auth=session audit=on rbac=on`

## 1. 本地启动（手动命令）

1) 安装依赖

```bash
npm install
```

1) 复制环境变量（Postgres）

```bash
cp .env.example .env
```

1) 生成 Prisma Client & 迁移

```bash
npm run prisma:generate:pg
npm run migrate:pg -- --name phase2_postgres
```

1) 初始化管理员

```bash
npm run seed:admin
```

1) 启动开发环境

```bash
npm run dev
```

## 2. MVP 数据导入

把 Phase1 导出的 JSON 放到 `mvp-export/`：

- `mvp-export/promotions.json`
- `mvp-export/games.json`
- `mvp-export/social.json`
- `mvp-export/site.json`

执行：

```bash
npm run import:mvp
```

## 3. 关键 API

- `GET /api/public/home`（active + sorted + 45s 缓存 + stale fallback）
- `POST /api/admin/login`
- `POST /api/admin/logout`（CSRF）
- `GET /api/admin/me`
- `GET /api/admin/csrf`
- `POST /api/admin/upload/sign`（R2 signed put）
- `GET/POST/PUT /api/admin/promotions`
- `PUT /api/admin/content`（games/social/site 写入 + audit）
- `GET /api/admin/audit`
- `POST /api/admin/users`（admin-only）

## 4. 部署路线

### Route A: Vercel + Neon/Supabase + R2（推荐）

1) 在 Vercel 配置所有 `.env.example` 变量  
1) Build command:

```bash
npm run prisma:generate && npm run build
```

1) 首次发布前执行迁移：

```bash
npx prisma migrate deploy
```

### Route B: VPS + PM2 + Nginx + Postgres + R2

1) Node 20+ + npm + PM2  
1) `.env` 写入生产变量  
1) 迁移 + 构建 + 启动：

```bash
npm ci
npm run prisma:generate
npx prisma migrate deploy
npm run build
pm2 start npm --name website-phase2 -- start
```

1) Nginx 反代到 `localhost:3000`

## 5. 安全说明

- 所有 Admin 写接口都要求 `x-csrf-token`
- Session 走 httpOnly cookie（30天）
- 不在日志中记录密码/token/密钥
- 登录与 Public API 有速率限制

## 6. 截图清单（按验收要求）

请在本地运行后补充截图文件：

- 前台首页（桌面）
- 前台首页（手机）
- 后台 Promotions Blocks 编辑页
- 后台 Audit Log 页

## 7. 验收行

`PHASE2_OK: db=postgres upload=r2 auth=session audit=on rbac=on`

## 8. 开发/生产双模式说明

- `prisma/schema.sqlite.prisma`：开发零依赖模式（`DATABASE_URL=file:./dev.db`）
- `prisma/schema.postgres.prisma`：Phase2 正式模式
- `npm run prisma:generate:sqlite`：生成 SQLite 模式 Prisma Client
- `npm run prisma:generate:pg`：生成 Postgres 模式 Prisma Client
- `npm run migrate:sqlite`：SQLite 同步结构（`db push`）
- `npm run migrate:pg`：Postgres 迁移（`migrate dev`）

## 9. 自检脚本

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\doctor.ps1
```

会检查：

- 当前路径与 `package.json`
- 双 schema 文件
- `.env` 与关键变量
- `node` / `npm`
- `docker`（失败只告警，不阻断）

## 10. 5分钟演练（Internal Test Playbook）

前提：`.env` 设置 `INTERNAL_TEST_MODE="1"`。

1) 启动 SQLite：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev-sqlite.ps1
```

1) 登录后台：

- `http://localhost:3000/admin/login`
- `admin@example.com / change_me_123`

1) 打开测试中心并一键灌入场景：

- `http://localhost:3000/admin/test-center`
- 点击 `Run Seed Test Scenarios`

1) 演练路径：

- Dashboard 看风险：`/admin`
- Promotion Stats 看 top reasons：`/admin/promotions` -> 选活动 -> `Stats`
- Sheets 导出 Excel：`/admin/sheets` -> 进入 sheet -> `Export Excel`
- 前台 claim：`/` 打开活动详情，用 Test Login + Claim
- 查看我的记录：`/me`

1) 命令行一键种子（可选）：

```bash
npm run seed:test
```

1) 每次改完先跑冒烟再交付：

```bash
npm run smoke
```

1) 一键冒烟（自动找端口 + 启 dev + seed + smoke + 自动关闭）：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke.ps1
```

1) 跳过 seed：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke.ps1 -SkipSeed
```

1) 保持服务不关闭：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke.ps1 -KeepServerRunning
```

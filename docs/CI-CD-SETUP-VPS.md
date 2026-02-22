# CI/CD 落地：VPS 初始化与上线手册（一次性可用）

目标：GitHub Actions 自动部署到 VPS，并具备：

- release 目录 + `current` symlink 切换
- Prisma migrate（Postgres）
- PM2 cluster reload（强制 `--update-env`）
- 自动健康检查
- 失败自动回滚
- 发布后人工 Gate（Phase 4 / Phase 7 半自动脚本）

---

## 1) VPS 前置安装（一次性）

建议：Ubuntu 22.04+。

### 1.1 Node.js（建议 20）

确保 `node -v` 是 20.x（或你团队统一版本）。

### 1.2 PM2

```bash
npm i -g pm2
pm2 -v
```

### 1.3 目录结构（锁死）

```bash
sudo mkdir -p /var/www/app/{releases,shared}
sudo chown -R $USER:$USER /var/www/app
```

最终结构：

```
/var/www/app/
  releases/
  shared/
    .env.production
  current -> releases/<timestamp>
```

---

## 2) shared/.env.production（必须存在）

部署工作流会把它链接到每个 release 的 `.env` 和 `.env.production`。

创建：

```bash
nano /var/www/app/shared/.env.production
```

至少需要（按你项目实际补齐）：

- `NODE_ENV=production`
- `DATABASE_URL=postgresql://...`（主站 Postgres）
- `SESSION_SECRET=...`
- `CSRF_SECRET=...`
- `TOTP_ENC_KEY=...`（base64 32 bytes）
- `REDIS_URL=rediss://...`（Upstash）
- `REDIS_PREFIX=kingdom888`
- `R2_*`（R2 上传相关：按你现有 `lib/r2.ts` 需要的 env）
- `FRONTEND_DOMAIN=...` / `ADMIN_DOMAIN=...`（如果你启用了 `proxy.ts` 的域名跳转）
- `ADMIN_IP_ALLOWLIST_ENABLED=1`
- `ADMIN_IP_ALLOWLIST=你的白名单IP或CIDR`

生成 `TOTP_ENC_KEY`：

```bash
openssl rand -base64 32
```

---

## 3) SSH Deploy Key（建议单独 deploy 用户）

建议新建 deploy key，只给 GitHub Actions 用。

Actions 侧 secrets：

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `APP_DIR=/var/www/app`
- `DOMAIN=https://yourdomain.com`
- 可选：`PM2_APP_NAME=web`

---

## 4) PM2 运行口径（锁死）

项目已提供 `ecosystem.config.js`（不含任何密钥，只读 env）。

部署脚本会：

1) `source /var/www/app/shared/.env.production`
2) `pm2 reload web --update-env`

注意：

- 任何重启都要带 `--update-env`
- 通过 `PM2_INSTANCES=2` 控制实例数（默认 2）

---

## 5) 健康检查与回滚

部署工作流会检查：

- `GET /api/public/deploy-version`（读取 `public/__deploy_version.txt`）
- `GET /api/public/health`（轻量 200）

任一失败：自动回滚到上一个 `current` 并 `pm2 reload --update-env`。

---

## 6) Prisma 迁移说明（重要）

当前工作流使用：

```bash
npm run prisma:generate:pg
npm run migrate:pg -- --name deploy_<timestamp>
```

备注：

- 这在 Prisma 语义上是 “migrate dev”（偏开发口径）。
- 若你要彻底企业级（推荐）：后续可以改为 “migrate deploy + 固定 migration 目录” 的口径。

---

## 7) 发布后人工 Gate（强制流程）

参考：`docs/RELEASE-GATE.md`

发布成功（Deploy 变绿）后，执行：

- Phase 4：`docs/THEME-UPLOAD-PHASE4-CHECK.sh`
- Phase 7：`docs/ADMIN-TOTP-PHASE7-CHECK.sh`（半自动最稳版）

Gate 不通过：视为 NO-GO（回滚或修复后重发 release）。


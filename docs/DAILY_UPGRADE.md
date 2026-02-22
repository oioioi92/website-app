# 每天升级一次 — 检查与升级清单

每天花几分钟按下面做一遍，可保持依赖安全、构建可部署、代码习惯一致。

---

## 一、一键执行（推荐）

在项目根目录执行：

```powershell
.\scripts\daily-upgrade.ps1
```

- 只检查：依赖是否过期、是否有已知漏洞、Prisma 是否可生成、`next build` 是否通过。
- 若要顺带更新**小版本**依赖（minor/patch），加参数：

```powershell
.\scripts\daily-upgrade.ps1 -ApplyUpdates
```

**注意**：`-ApplyUpdates` 只做 `npm update`，不会升级 major 版本，避免破坏性变更。

---

## 二、手动逐步检查（可选）

若不想用脚本，可每天按顺序做：

| 步骤 | 命令 / 动作 | 说明 |
|------|-------------|------|
| 1 | `npm outdated` | 看哪些包有可更新版本；红 = major，黄 = minor，无输出 = 已最新 |
| 2 | `npm audit` | 安全审计；有漏洞时按提示 `npm audit fix` 或手动修 |
| 3 | `npm update`（可选） | 只更新 minor/patch，再跑一次 build 确认 |
| 4 | `npm run prisma:generate` | 确保生产用 Postgres schema 能生成 |
| 5 | `npm run build` | 确认能通过构建再部署 |

---

## 三、环境变量核对（部署/上线前）

确认 `.env`（或服务器环境）里至少有以下项且值正确：

| 变量 | 必须 | 说明 |
|------|------|------|
| `DATABASE_URL` | 是 | 生产用 `postgresql://...` |
| `SESSION_SECRET` | 是 | 后台登录会话密钥，随机长字符串 |
| `CSRF_SECRET` | 是 | CSRF 签名密钥，随机长字符串 |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | 首次 seed 时 | 仅 seed 脚本用，生产勿用弱密码 |
| `FRONTEND_DOMAIN` / `ADMIN_DOMAIN` | 若用 proxy | 与 Nginx / proxy 一致（如 admin1167.com / admin1167.net） |
| `INTERNAL_TEST_MODE` | 否 | 生产建议 `0` |
| `RATE_LIMIT_ENABLED` / `RATE_LIMIT_RPM` | 否 | 限流，默认 1 / 120 |
| R2_* | 若用上传 | 对象存储配置 |

`.env.example` 已列出主要变量，可对照查漏。

---

## 四、代码与习惯每日看一眼（可选）

每天不用全查，可轮着看一两项即可：

1. **新改动的 API**：`app/api/` 下新增或改动的 route，是否有鉴权、限流、错误返回。
2. **环境变量**：新加的 `process.env.XXX` 是否在 `.env.example` 或文档里说明。
3. **公网暴露**：确认没有把 `.env`、密钥、内部 URL 打到前端或日志。
4. **依赖**：新加的 npm 包是否必要、是否有已知漏洞（`npm audit` 会提示）。

---

## 五、大版本升级（非每天，按需做）

- **Next.js / React 大版本**：先看官方升级指南和 breaking changes，在分支上试跑、跑完 build 和关键流程再合。
- **Prisma 大版本**：先看迁移文档，再在开发环境跑 `prisma migrate` 和全量构建。
- **Node.js**：确认当前 Next/Prisma 支持的 Node 版本后再升级运行环境。

---

## 六、检查结果怎么用

- 若 **npm audit** 有 high/critical：优先修，再部署。
- 若 **npm run build** 失败：修完再部署，避免线上 504/白屏。
- 若 **Prisma generate** 失败：检查 `schema.postgres.prisma` 和 `DATABASE_URL`，修好再 build。

把「每天跑一次 `.\scripts\daily-upgrade.ps1`」当成习惯，再配合本文的「手动步骤」和「代码习惯」，就能做到**每天升级一次**的节奏，又不至于盲目升爆。

---

## 七、关键代码检查结论（已逐项核对）

- **鉴权**：`lib/auth.ts` 要求 `SESSION_SECRET`，未配置会抛错；登录 API 有 IP 限流 + bcrypt 校验。
- **CSRF**：`lib/csrf.ts` 要求 `CSRF_SECRET`；后台写操作走 `ensureCsrfForWrite`。
- **环境变量**：`.env.example` 已覆盖 DATABASE_URL、SESSION_SECRET、CSRF_SECRET、R2_*、限流、域名等。
- **公开 API**：`/api/public/home` 有按 IP 的限流（RATE_LIMIT_RPM），可配置关闭。
- **Cookie**：admin 登录与 CSRF 的 cookie 在生产环境为 `secure: true`。
- **项目内无未处理 TODO/FIXME**：业务代码中无遗留 TODO，仅依赖库内有。

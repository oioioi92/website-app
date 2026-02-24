# chat-server (P0)

**直接通用**：按 `.env` 里 `CHAT_DATABASE_URL` 自动选 SQLite 或 Postgres，无需手动选 schema。

> 不熟悉的话可先看 **[如何运行.md](./如何运行.md)**，有一步步说明。

## Requirements
- Node.js 20+

## Environment
Copy `.env.example` to `.env` and fill:

- **CHAT_DATABASE_URL**：`file:./dev.chat.db`（SQLite，本地零依赖）或 `postgresql://...`（生产）
- **CHAT_ADMIN_JWT_SECRET**：与主站 `.env` 一致
- **CHAT_ALLOWED_ORIGINS**：前台域名，逗号分隔，如 `http://localhost:3000`
- **ADMIN_ALLOWED_ORIGINS**：后台域名，如 `http://localhost:3000`

## Run（一条命令）
```bash
npm install
npm run dev
```

首次或 `CHAT_DATABASE_URL` 为 `file:` 时会自动生成 Prisma Client 并建表（SQLite）；为 `postgresql://` 时仅生成 Client，迁移需另跑 `npm run prisma:migrate`。

Expected logs:
- `SERVER_OK port=4000`
- `DB_OK`
- `WS_OK visitor=/ws-visitor admin=/ws-admin`

## 生产部署（Postgres）
`.env` 使用 `postgresql://` 后：
```bash
npm run prisma:generate
npm run prisma:migrate
npm run build
pm2 start npm --name chat-server -- start
```

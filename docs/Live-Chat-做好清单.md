# Live Chat 做好清单

**一句话**：主站 + chat-server 都跑起来，两边 .env 配好，前台能 Online、后台无「服务未连接」= 做好。

---

## 本地「做好」（3 条）

| # | 项 | 怎么做 |
|---|---|------|
| 1 | **主站 .env** | 根目录 `.env` 里必须有：`CHAT_ADMIN_JWT_SECRET`、`CHAT_SERVER_INTERNAL_URL=http://127.0.0.1:4000`。本地双端口时再加 `NEXT_PUBLIC_CHAT_SERVER_URL=http://localhost:4000`。 |
| 2 | **chat-server 跑着** | 在 `services/chat-server` 里执行 `npm install`、`npm run prisma:generate`（或按该目录 README），再 `npm run dev`。看到 `SERVER_OK port=4000`、`DB_OK`、`WS_OK` 即正常。 |
| 3 | **chat-server .env** | `services/chat-server/.env` 里 `CHAT_ADMIN_JWT_SECRET` 与主站**完全一致**；`CHAT_ALLOWED_ORIGINS` 包含 `http://localhost:3000`。 |

**一键本地**：在项目根目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev-with-chat.ps1
```

会先起 chat-server（4000），再起主站（3000），并自动打开前台和后台；两个窗口都别关。

---

## 线上「做好」（4 条）

| # | 项 | 怎么做 |
|---|---|------|
| 1 | **主站 .env** | `CHAT_ADMIN_JWT_SECRET`、`CHAT_SERVER_INTERNAL_URL=http://127.0.0.1:4000`。同域名反代时 `NEXT_PUBLIC_CHAT_SERVER_URL` 可留空。 |
| 2 | **chat-server 常驻** | 在服务器上部署 `services/chat-server`，用 PM2：`pm2 start npm --name chat-server -- start`，并配置好该目录的 `.env`（含同一条 JWT、Postgres、允许的域名）。 |
| 3 | **Nginx 反代** | 站点配置里增加 `/chat/`、`/ws-visitor/`、`/ws-admin/` 反代到 `http://127.0.0.1:4000`。改完 `nginx -t` 再 `systemctl reload nginx`。 |
| 4 | **两边 JWT 一致** | 主站与 chat-server 的 `CHAT_ADMIN_JWT_SECRET` 必须相同，否则后台客服连不上。 |

详见：[LIVE-CHAT-上线检查.md](./LIVE-CHAT-上线检查.md)、[Nginx 配置示例](./admin1167.conf-改好)。

---

## 验收（3 步）

1. **前台**：打开首页 → 点右下角 Live 气泡 → 应显示 **Online** 或「客服已连接」，能发消息。
2. **后台**：打开 `/admin/chat` → **没有**黄色「Live Chat 服务未连接」，能看会话、能回复。
3. **同机**（可选）：`curl -s http://127.0.0.1:4000/chat/health` 返回 200。

三项都过 = Live Chat 做好。

---

## 常见现象对照

| 现象 | 原因 |
|------|------|
| 后台「Live Chat 服务未连接」 | 主站未配 `CHAT_SERVER_INTERNAL_URL` 或 chat-server 没启动。 |
| 前台一直 Offline | chat-server 没起；或主站未配 `NEXT_PUBLIC_CHAT_SERVER_URL`（本地双端口时）；或 `CHAT_ALLOWED_ORIGINS` 未包含前台域名。 |
| 客服页连不上 /ws-admin | Nginx 未反代 `/ws-admin/` 或 JWT 与主站不一致。 |

更多：本地试看 [LIVE-CHAT-试看使用.md](./LIVE-CHAT-试看使用.md)，3 步自检 [Live-Chat-自检.md](./Live-Chat-自检.md)。

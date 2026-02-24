# Live Chat 上线检查与部署

> **文档版本**：v1.1 · 与主站 + chat-server（P0）配套使用  
> **快速链接**：[主站 .env](#1-主站-env项目根目录) · [chat-server 部署](#2-chat-server-部署与运行) · [Nginx 反代](#4-nginx-反代到-chat-server) · [自检](#5-自检步骤) · [故障对照](#6-常见原因小结)

Live Chat 由 **主站 Next.js**、**独立 chat-server**、**Nginx 反代** 三部分组成，缺一不可。按下面顺序检查与部署即可接入系统。

---

## 目录

1. [主站 .env（项目根目录）](#1-主站-env项目根目录)
2. [chat-server 部署与运行](#2-chat-server-部署与运行)
3. [chat-server 的 .env](#3-chat-server-的-envserviceschat-serverenv)
4. [Nginx 反代到 chat-server](#4-nginx-反代到-chat-server)
5. [自检步骤](#5-自检步骤)
6. [常见原因小结](#6-常见原因小结)
7. [回滚与扩展](#7-回滚与扩展)

---

## 1. 主站 .env（项目根目录）

在主站项目**根目录**的 `.env` 中配置，且 **CHAT_ADMIN_JWT_SECRET 必须与 chat-server 完全一致**：

| 变量 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `CHAT_ADMIN_JWT_SECRET` | ✅ | 客服 WebSocket JWT 密钥 | 一组长随机字符串（与 chat-server 相同） |
| `CHAT_SERVER_INTERNAL_URL` | ✅ | 主站服务器访问 chat-server 的内网地址 | `http://127.0.0.1:4000` |
| `NEXT_PUBLIC_CHAT_SERVER_URL` | 可选 | 前台/后台浏览器连 chat 的地址；同域名反代时可留空 | 留空 或 `https://admin1167.com` |

- 未配置 `CHAT_SERVER_INTERNAL_URL` → 后台 `/admin/chat` 会提示「Live Chat 服务未连接」。
- 未配置 `CHAT_ADMIN_JWT_SECRET` → 后台无法获取客服 WebSocket token。

---

## 2. chat-server 部署与运行

- **代码位置**：`services/chat-server`
- **运行方式**：需单独安装依赖、生成 Prisma、执行迁移，并用 **PM2**（或等价方式）常驻运行。

### Linux / 服务器（推荐）

```bash
cd /path/to/Website-new/services/chat-server
npm ci
npm run prisma:generate
npx prisma migrate deploy --schema prisma/schema.prisma
pm2 start npm --name chat-server -- start
pm2 save
pm2 status
```

### Windows 本地调试

```powershell
cd services\chat-server
npm install
npm run prisma:generate
npx prisma migrate dev --schema prisma/schema.prisma --name p0_init
npm run dev
```

启动后日志应出现：`SERVER_OK port=4000`、`DB_OK`、`WS_OK visitor=/ws-visitor admin=/ws-admin`。

---

## 3. chat-server 的 .env（services/chat-server/.env）

从 `services/chat-server/.env.example` 复制并填写：

| 变量 | 说明 |
|------|------|
| `CHAT_SERVER_PORT` | 服务端口，默认 `4000` |
| `CHAT_DATABASE_URL` | 独立 Postgres 连接串（可与主站不同库） |
| `CHAT_ADMIN_JWT_SECRET` | **必须与主站 .env 完全一致** |
| `CHAT_ALLOWED_ORIGINS` | 允许加载聊天气泡的前台域名，逗号分隔，如 `https://admin1167.com` |
| `ADMIN_ALLOWED_ORIGINS` | 允许后台客服页的域名，如 `https://admin1167.net` |

可选：`CHAT_REST_RATE_PER_MIN`、`CHAT_WS_RATE_PER_MIN` 等限流配置见 `.env.example`。

---

## 4. Nginx 反代到 chat-server

浏览器会请求当前站点域名下的 `/ws-visitor`、`/ws-admin` 和 `/chat/`，Nginx 需将这些转发到 chat-server（默认 4000 端口）。

在对应站点的 `server { ... }` 中增加：

```nginx
# 聊天 HTTP 接口与静态
location /chat/ {
  proxy_pass http://127.0.0.1:4000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# 访客 WebSocket
location /ws-visitor/ {
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_pass http://127.0.0.1:4000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}

# 客服 WebSocket
location /ws-admin/ {
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_pass http://127.0.0.1:4000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```

- 修改后执行：`nginx -t` 检查，再 `systemctl reload nginx`（或你当前的重载方式）。
- Socket.IO 使用 path `/ws-visitor`、`/ws-admin`，无需单独配置 `/socket.io/`。

---

## 5. 自检步骤

1. **前台**：打开主站首页 → 点击右下角 Live 气泡 → 应能打开聊天面板，并显示「客服已连接」或先「Connecting…」后变为 Online；若一直 Offline，多为 `/ws-visitor` 未反代或 chat-server 未运行。
2. **后台**：打开 `https://你的域名/admin/chat`：
   - 提示「CHAT_SERVER_INTERNAL_URL or CHAT_SERVER_QUEUE_URL not configured」→ 主站 .env 未配 `CHAT_SERVER_INTERNAL_URL`。
   - 提示「chat-server returned 5xx」→ 检查 chat-server 是否运行、`CHAT_SERVER_INTERNAL_URL` 是否指向正确（如 `http://127.0.0.1:4000`）。
3. **同机**：`curl -s http://127.0.0.1:4000/chat/health` 应返回 200。

---

## 6. 常见原因小结

| 现象 | 可能原因 |
|------|----------|
| 后台提示「Live Chat 服务未连接」 | 未配置 `CHAT_SERVER_INTERNAL_URL` 或 chat-server 未启动 |
| 前台气泡点开一直 Offline | Nginx 未反代 `/ws-visitor` 或 `CHAT_ALLOWED_ORIGINS` 未包含当前站点 |
| 客服连不上 /ws-admin | Nginx 未反代 `/ws-admin` 或 `CHAT_ADMIN_JWT_SECRET` 与主站不一致 |
| /chat/ 页面 404 | Nginx 未配置 `location /chat/` 反代到 4000 |

---

## 7. 回滚与扩展

- **回滚 chat-server**：`pm2 stop chat-server` → `pm2 delete chat-server` → `pm2 save`；并在 Nginx 中注释或删除上述 `/chat/`、`/ws-visitor/`、`/ws-admin/` 的 location 后 reload。主站 Next.js 不受影响（仅 `/admin/chat` 无法连接）。
- **完整部署步骤与验收**：见 [CHAT-P0-DEPLOY.md](./CHAT-P0-DEPLOY.md)。
- **部署到线上后更新**：见 [deploy-更新上线.md](./deploy-更新上线.md) 第三节「Live Chat 要能用的前提」。

# Live Chat P0 完整部署（Ubuntu + Nginx + PM2 + HTTPS）

> **配套文档**：[LIVE-CHAT-上线检查.md](./LIVE-CHAT-上线检查.md) — 快速核对清单与故障对照；本文为完整部署步骤与 Nginx 示例。

本项目的 P0 chat 由两部分组成：

- 主站 Next.js（已集成后台页）：`/admin/chat` + `/api/admin/chat/token`
- 独立 chat-server：Node.js + Express + Socket.IO + Prisma + Postgres（默认 `:4000`）

## 1) 环境变量（强制）

### 主站 Next.js（现有 `.env`）

- `CHAT_ADMIN_JWT_SECRET`：用于签发客服 WS JWT（15min），**必须与 chat-server 一致**
- `CHAT_SERVER_INTERNAL_URL`：主站请求 chat-server 的内网地址，如 `http://127.0.0.1:4000`（未配置则后台会提示「Live Chat 服务未连接」）
- `NEXT_PUBLIC_CHAT_SERVER_URL`：后台/前台连接 chat 的 base url；同域名反代时可留空或写 `https://your-domain.com`

### chat-server（`services/chat-server/.env`）

- `CHAT_DATABASE_URL`：独立 Postgres
- `CHAT_ADMIN_JWT_SECRET`：必须与主站一致
- `CHAT_ALLOWED_ORIGINS`：允许加载 widget 的站点 origin（逗号分隔）
- `ADMIN_ALLOWED_ORIGINS`：允许客服后台 origin（逗号分隔）

## 2) Postgres 最小权限建议（强制）

创建独立用户（示例）：`chatapp`，只给自己 DB 权限，禁止用 postgres 超级用户。

## 3) chat-server 安装与迁移

在服务器目录（例如 `/root/chat-server`）：

```bash
cd /root/chat-server/services/chat-server
npm ci
npm run prisma:generate
npx prisma migrate deploy --schema prisma/schema.prisma
```

## 4) PM2 启动（chat-server）

```bash
cd /root/chat-server/services/chat-server
pm2 start npm --name chat-server -- start
pm2 save
pm2 status
```

## 5) Nginx 反代（两种任选其一）

### 方案 A：同域名路径（推荐）

把 chat-server 挂到 `https://your-domain.com` 下：

- `GET /chat/widget/*`
- WS `/ws-visitor`、`/ws-admin`

Nginx 示例（server 块内）：

```nginx
location /chat/ {
  proxy_pass http://127.0.0.1:4000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

#
# （可选）兼容无 /chat 前缀的老链接：
# - GET /widget/widget.js
# - GET /widget/widgetScript.js (本项目会返回与 widget.js 相同的 loader，避免 404)
#
location /widget/ {
  proxy_pass http://127.0.0.1:4000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location /ws-visitor/ {
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_pass http://127.0.0.1:4000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location /ws-admin/ {
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_pass http://127.0.0.1:4000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

注意：

- Socket.IO 使用的是 `path=/ws-visitor` / `path=/ws-admin`，不是 `/socket.io/`；不需要单独配 `location /chat/socket.io/`。
- 上述 location 用尾部 `/` 是为了让 Nginx 正确转发 upgrade。

### 方案 B：独立子域名

例如 `chat.your-domain.com` 整站反代到 `:4000`，同理加 upgrade 头。

## 6) P0 验收清单（可截图）

### chat-server 日志（必须出现）

- `SERVER_OK port=4000`
- `DB_OK`
- `WS_OK visitor=/ws-visitor admin=/ws-admin`
- `P0_OK: chat_widget + admin_panel + message_persist`

### Widget 对聊（最小手工验收）

在任意网页插入：

```html
<script>
  window.ChatWidgetConfig = { serverBaseUrl: "https://your-domain.com" };
</script>
<script src="https://your-domain.com/chat/widget/widget.js"></script>
```

打开页面 -> 点击浮动按钮 -> 发送消息。

### Admin 对聊

登录后台 -> 打开：`/admin/chat`

看到会话出现 -> 点击进入 -> Assign -> 发送消息 -> 访客侧收到。

## 7) 回滚（P0 可回滚）

### 回滚 chat-server

```bash
pm2 stop chat-server
pm2 delete chat-server
pm2 save
```

然后在 Nginx 删除/注释 `/chat/`、`/ws-visitor/`、`/ws-admin/` 的 location，reload Nginx。

主站 Next.js 不受影响（只是 `/admin/chat` 页面会连接不上）。

# Live Chat 与 注册/登录 检查与使用

## 一、Live Chat 连接不上时

### 1. 主站 .env（项目根目录）

必须配置（变量名已统一为 `CHAT_SERVER_INTERNAL_URL`，不要写错）：

| 变量 | 必填 | 说明 |
|------|------|------|
| `CHAT_ADMIN_JWT_SECRET` | ✅ | 与 chat-server 的 .env **完全一致** |
| `CHAT_SERVER_INTERNAL_URL` | ✅ | 主站本机访问 chat-server 的地址，如 `http://127.0.0.1:4000` |
| `NEXT_PUBLIC_CHAT_SERVER_URL` | 可选 | 与主站同域名反代时可留空，前台会用当前域名连 |

- 未配 `CHAT_SERVER_INTERNAL_URL` → 后台会提示「Live Chat 服务未连接」。
- 未配或与 chat-server 不一致 `CHAT_ADMIN_JWT_SECRET` → 客服连不上 /ws-admin。

### 2. chat-server 要跑着

- 位置：`services/chat-server`
- 服务器：`pm2 start npm --name chat-server -- start` 等
- 同机自检：`curl -s http://127.0.0.1:4000/chat/health` 返回 200

### 3. Nginx 反代

admin1167.com 与 admin1167.net 的 server 块里都要有：

- `location /chat/` → proxy_pass http://127.0.0.1:4000
- `location /ws-visitor/` → 同上，加 WebSocket 头
- `location /ws-admin/` → 同上，加 WebSocket 头

完整示例：`docs/admin1167.conf-改好`。改完 `nginx -t` 再 `systemctl reload nginx`。

### 4. 验收

- 前台：打开首页 → 点 Live 气泡 → 显示 **Online**，能发消息。
- 后台：打开 /admin/chat → **没有**「Live Chat 服务未连接」，能看会话、能回复。

---

## 二、用户注册 + 登录 整站流程

### 1. 数据库（Member 表）

Member 表已支持 `passwordHash`、`mustChangePassword`。**首次使用前**需执行迁移或同步结构：

- **SQLite**：在项目根目录执行  
  `npx prisma db push --schema prisma/schema.sqlite.prisma`
- **Postgres**：  
  `npx prisma migrate dev --name member_password`  
  或上线：`npx prisma migrate deploy`

### 2. 前台页面

| 路径 | 说明 |
|------|------|
| `/register` | 注册：手机号、密码（至少 6 位）、确认密码、显示名（可选）。注册成功即写 Cookie，跳首页。 |
| `/login` | 登录：手机号、密码。登录成功写 Cookie，跳首页。 |

若后台 Theme 里配置了 `registerUrl` / `loginUrl`，会先重定向到该外链；未配置则使用站内注册/登录页。

### 3. 接口

| 接口 | 说明 |
|------|------|
| `POST /api/public/member/register` | 注册：body `{ phone, password, displayName? }`，成功返回 member 并写 Cookie。 |
| `POST /api/public/member/login` | 登录：body `{ phone, password }`，成功返回 member 并写 Cookie。 |
| `GET /api/public/member/session` | 查询当前登录状态，返回 `{ member }` 或 `{ member: null }`。**已开放**，不依赖 INTERNAL_TEST_MODE。 |

### 4. 流程

1. 用户打开 `/register` → 填写手机号、密码、确认密码（及可选显示名）→ 提交。
2. 注册成功 → 自动写登录 Cookie → 跳转首页。
3. 未注册用户打开 `/login` → 填写手机号、密码 → 登录成功 → 跳转首页。
4. 前台任意页通过 `GET /api/public/member/session` 判断是否已登录，展示「已登录」或「登录/注册」入口。

---

## 三、常见问题

| 现象 | 处理 |
|------|------|
| 后台「Live Chat 服务未连接」 | 检查主站 .env 的 `CHAT_SERVER_INTERNAL_URL`、chat-server 是否在跑。 |
| 前台 Live 一直 Offline | 检查 Nginx 是否反代 `/ws-visitor/`、chat-server 的 `CHAT_ALLOWED_ORIGINS` 是否包含前台域名。 |
| 登录/注册后 session 仍为 null | 确认已执行 Prisma 迁移/ db push，Member 表有 `passwordHash` 字段；Cookie 同域、HTTPS 生产环境用 secure。 |
| 登录接口报 INVALID_CREDENTIALS | 确认该手机号已注册且密码正确；Member 记录有 `passwordHash`。 |

更多：Live Chat 详见 `docs/LIVE-CHAT-上线检查.md`；注册登入详见 `docs/产品说明书-Live-Chat与用户注册登入.md`。

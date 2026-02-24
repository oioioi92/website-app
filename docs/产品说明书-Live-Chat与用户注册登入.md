# 产品说明书：Live Chat 与用户注册/登入

本文说明 **Live Chat 前台/后台连接** 与 **用户注册、登入** 的完整流程、配置与排查方法。

---

## 第一部分：Live Chat 使用与连接不上排查

### 1.1 功能说明

- **前台**：访客在首页或 /chat 页使用 Live 气泡或聊天窗口，与客服实时沟通（WebSocket `/ws-visitor`）。
- **后台**：客服在 **admin1167.net** 的 **Live Chat**（/admin/chat）接会话、回复消息（WebSocket `/ws-admin`）。

Live Chat 由三部分组成，缺一不可：

1. **主站 Next.js**（前台 + 后台页面）
2. **独立 chat-server**（端口 4000，处理 WebSocket 与消息）
3. **Nginx 反代**（把 `/chat/`、`/ws-visitor/`、`/ws-admin/` 转到 4000）

---

### 1.2 连接不上时的检查顺序

#### 步骤 1：主站 .env（项目根目录）

在 **主站** 根目录 `.env` 中必须有以下变量，且 **CHAT_ADMIN_JWT_SECRET 与 chat-server 完全一致**：

| 变量 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `CHAT_ADMIN_JWT_SECRET` | ✅ | 与 chat-server 相同的长随机字符串 | 同下方 chat-server |
| `CHAT_SERVER_INTERNAL_URL` | ✅ | 主站服务器本机访问 chat-server 的地址 | `http://127.0.0.1:4000` |
| `NEXT_PUBLIC_CHAT_SERVER_URL` | 视情况 | 浏览器连 chat 的根地址；**与主站同域名反代时可留空** | 留空 或 `https://admin1167.com` |

- 未配置 `CHAT_SERVER_INTERNAL_URL` → 后台会提示「Live Chat 服务未连接」。
- 未配置 `CHAT_ADMIN_JWT_SECRET` 或与 chat-server 不一致 → 后台客服连不上 /ws-admin。

**同域名部署时**（admin1167.com 下已反代 /chat、/ws-visitor、/ws-admin）：  
`NEXT_PUBLIC_CHAT_SERVER_URL` 可留空，前台会使用当前站点域名连接。

---

#### 步骤 2：chat-server 是否在运行

- **位置**：`services/chat-server`
- **服务器上**（推荐用 PM2）：
  ```bash
  cd /path/to/Website-new/services/chat-server
  npm ci
  npm run prisma:generate
  npx prisma migrate deploy --schema prisma/schema.prisma
  pm2 start npm --name chat-server -- start
  pm2 save
  pm2 status
  ```
- 启动成功时日志应有：`SERVER_OK port=4000`、`DB_OK`、`WS_OK visitor=/ws-visitor admin=/ws-admin`。
- 同机自检：`curl -s http://127.0.0.1:4000/chat/health` 应返回 200。

若 chat-server 未运行，前台会一直 Offline，后台会显示服务未连接。

---

#### 步骤 3：chat-server 的 .env

在 `services/chat-server/.env` 中：

| 变量 | 说明 |
|------|------|
| `CHAT_SERVER_PORT` | 端口，默认 `4000` |
| `CHAT_DATABASE_URL` | 数据库（Postgres 或 SQLite） |
| `CHAT_ADMIN_JWT_SECRET` | **必须与主站 .env 完全一致** |
| `CHAT_ALLOWED_ORIGINS` | 前台域名，逗号分隔，如 `https://admin1167.com` |
| `ADMIN_ALLOWED_ORIGINS` | 后台域名，如 `https://admin1167.net` |

若 `CHAT_ALLOWED_ORIGINS` 未包含前台域名，访客连不上；若 `ADMIN_ALLOWED_ORIGINS` 未包含后台域名，客服连不上。

---

#### 步骤 4：Nginx 是否反代到 chat-server

**admin1167.com** 与 **admin1167.net** 的 server 块中，都需要把以下路径反代到 `http://127.0.0.1:4000`：

- `location /chat/` → proxy_pass http://127.0.0.1:4000
- `location /ws-visitor/` → 同上，且需 WebSocket 头（Upgrade、Connection、长超时）
- `location /ws-admin/` → 同上，WebSocket 头

完整示例见项目内：**`docs/admin1167.conf-改好`**。  
修改后执行：`nginx -t`，再 `systemctl reload nginx`（不要带“回车”等字，只输入命令后按 Enter）。

---

### 1.3 验收（连接正常的标准）

1. **前台**：打开 https://admin1167.com → 点右下角 Live 气泡 → 应显示 **Online** 或「客服已连接」，能发消息。
2. **后台**：打开 https://admin1167.net/admin/chat → **没有**黄色「Live Chat 服务未连接」，能看会话、能回复。
3. **同机**：`curl -s http://127.0.0.1:4000/chat/health` 返回 200。

三项都满足即表示 Live Chat 已连接前台与后台。

---

### 1.4 常见现象与原因

| 现象 | 可能原因 |
|------|----------|
| 后台「Live Chat 服务未连接」 | 主站未配 `CHAT_SERVER_INTERNAL_URL` 或 chat-server 未启动 |
| 前台一直 Offline | chat-server 未起；或未配 `NEXT_PUBLIC_CHAT_SERVER_URL`（多端口/多域名时）；或 `CHAT_ALLOWED_ORIGINS` 未包含前台域名 |
| 客服连不上 /ws-admin | Nginx 未反代 `/ws-admin/`，或 `CHAT_ADMIN_JWT_SECRET` 与主站不一致，或 `ADMIN_ALLOWED_ORIGINS` 未含后台域名 |

更多细节：`docs/LIVE-CHAT-上线检查.md`、`docs/Live-Chat-做好清单.md`。

---

## 第二部分：用户注册与登入流程

### 2.1 当前系统能力概览

- **登入（登录）**：站内提供登录页 `/login`，用户输入手机号 + 密码，调用接口校验 **Member** 表并写 Cookie，可正常登入使用站内需要登录的功能。
- **注册**：站内**没有**完整的自助注册页（不提供填写密码、创建 Member 的表单）。注册入口有两种用法：
  - **配置外链**：在后台 Theme 中配置 `registerUrl`，用户点「注册」后跳转到外部注册页。
  - **站内 /register**：若未配置 `registerUrl`，访问 `/register` 会看到「尚未配置 registerUrl」的提示，需到后台 Theme Settings 填写。

因此，「让用户可以注册、登入、整个流程做完」在目前实现下 = **登入流程全走通** + **注册** 视需求选择「外链注册」或后续由开发增加站内注册页。

---

### 2.2 登入流程（站内完整流程）

1. **入口**
   - 前台首页等处的「LOGIN」链接：若后台 Theme 未配置 `loginUrl`，会指向站内 `/login`；若配置了 `loginUrl`（如外链），则跳转到该外链。
   - 直接访问：**https://admin1167.com/login**（或你的前台域名/login）。

2. **登录页**
   - 组件：`LoginSplitClient`（`/login` 在未配置外链时使用）。
   - 用户输入：**手机号**（Mobile No）、**密码**（Password）。
   - 提交：POST `/api/public/member/login`，请求体 `{ phone, password }`，带 Cookie。

3. **后端校验**
   - 接口：`app/api/public/member/login/route.ts`。
   - 用手机号（归一化后）查 **Member** 表（`userRef` = 手机号）。
   - 校验 `passwordHash`（bcrypt）、`isActive`；通过则写 Cookie `member_ref`，返回 `{ ok: true, member: {...} }`。
   - 错误时返回：`INVALID_CREDENTIALS`、`ACCOUNT_DISABLED`、`RATE_LIMITED` 等。

4. **登入成功后**
   - 前端跳转首页并刷新；之后依赖 **会员会话** 的页面会读取 Cookie，调用 `/api/public/member/session` 获取当前用户（若该接口可用）。

5. **会员会话接口与 INTERNAL_TEST_MODE**
   - **GET /api/public/member/session**：根据 Cookie 返回当前登录的 Member。
   - **重要**：该接口当前在 **INTERNAL_TEST_MODE ≠ "1"** 时会返回 **404**，即生产环境默认「关闭」会员会话查询。
   - 若希望前台在登入后能正确显示「已登录」状态（如余额、领奖、钱包等），需要在 **主站 .env** 中设置：
     - `INTERNAL_TEST_MODE="1"`
   - 设置后，`/api/public/member/session` 与相关依赖（如部分领奖、钱包接口）才会对前台开放。

**总结**：要让「用户能登入并在整站内以登录状态使用」，需同时满足：
- Member 表中已有对应用户（userRef = 手机号），且已设置 `passwordHash`、`isActive = true`；
- 主站 .env 中配置 **INTERNAL_TEST_MODE="1"**（若你希望会话与依赖会话的功能在生产环境可用）。

---

### 2.3 注册流程的两种做法

#### 做法 A：使用外链注册（当前即可用）

1. 后台登录：https://admin1167.net/admin/login  
2. 进入 **前台设置 / Theme 相关**（如 Site 或 Theme Settings）。  
3. 找到 **登录链接 (loginUrl)**、**注册链接 (registerUrl)**：
   - **loginUrl**：填 `/login` 表示使用站内登录页；或填外部登录系统完整 URL。
   - **registerUrl**：填你的**外部注册系统**完整 URL（例如你们自己的注册站点）。
4. 保存后，前台首页的「REGISTER」会跳转到该 registerUrl；「LOGIN」按 loginUrl 跳转或走站内 `/login`。

这样「注册」流程在站外完成；用户注册完成后再到本站用同一套账号（需在你们系统里把账号同步到本站 Member 表并设置密码）登录，即完成「注册 + 登入」整流程（注册在外站，登入在本站）。

#### 做法 B：站内自助注册（需开发）

当前项目**没有**提供「站内注册页 + 写 Member 表 + 设密码」的接口与页面。若要做成「在本站完成注册并登入」的整流程，需要开发：

- 注册页：表单（手机号、密码、确认密码、可选昵称等）。
- 接口：例如 `POST /api/public/member/register`，校验后创建 Member、写入 `passwordHash`（bcrypt）、再写登录 Cookie 或跳转登录。
- 若 Member 表尚无 `passwordHash` 等字段，需在 Prisma schema 中增加并做迁移。

本文说明书只描述当前已有能力；站内注册为后续扩展项。

---

### 2.4 配置清单（用户注册与登入相关）

| 配置项 | 位置 | 说明 |
|--------|------|------|
| **loginUrl** | 后台 Theme / 前台设置 | `/login` = 站内登录；或外链。 |
| **registerUrl** | 同上 | 外链注册地址；不填则 /register 显示「尚未配置 registerUrl」。 |
| **INTERNAL_TEST_MODE** | 主站根目录 .env | 设为 `"1"` 后，`/api/public/member/session` 等才可用，登入状态才能在全站生效。 |
| **Member 数据** | 数据库 | 登入依赖 Member 表：userRef（手机号）、passwordHash、isActive。可由后台「玩家」维护或通过其他系统同步。 |

---

### 2.5 建议的「完整流程」使用方式（当前）

1. **仅用站内登录**  
   - Theme 中 loginUrl 设为 `/login`，registerUrl 留空或指向外链。  
   - 用户账号由后台或其它系统预先创建好（Member 有 userRef + passwordHash）。  
   - 用户访问前台 → 点 LOGIN → 站内 `/login` 输入手机号、密码 → 登入成功。  
   - 若需全站显示登录状态，主站 .env 设 `INTERNAL_TEST_MODE="1"`。

2. **注册在外站、登入在本站**  
   - Theme 中 registerUrl 指向外部注册页，loginUrl 设为 `/login`。  
   - 用户点 REGISTER → 去外站注册；注册完成后，在你们系统中把账号同步到本站 Member（并设置密码）。  
   - 用户回到本站点 LOGIN → 站内登录，完成「注册 + 登入」整流程。

3. **未来若做站内注册**  
   - 需新增注册页与注册接口，并确保 Member 表与 Prisma 一致（含 passwordHash 等），再按上述登入流程即可闭环。

---

## 第三部分：相关文档索引

- Live Chat 上线与检查：`docs/LIVE-CHAT-上线检查.md`  
- Live Chat 做好清单：`docs/Live-Chat-做好清单.md`  
- Nginx 配置示例：`docs/admin1167.conf-改好`  
- 前后台域名跳转：`docs/前后台连接-检查清单.md`  
- 主题/前台设置：后台 → 前台设置（Site / Theme Settings）中的 loginUrl、registerUrl。

---

**文档版本**：v1.0  
**适用**：主站（admin1167.com / admin1167.net）+ chat-server + 现有会员登录/注册配置。

# Live Chat 试看使用（本地前台 + 后台）

按下面步骤在本地同时试 **前台访客气泡** 和 **后台客服页**。

---

## 一、准备环境（一次性）

### 1. chat-server 数据库（直接通用）

`CHAT_DATABASE_URL` 填什么就用什么，**无需手选 schema**：

- **本地试看**：`CHAT_DATABASE_URL="file:./dev.chat.db"`（SQLite，零依赖）。执行 `npm run dev` 时会自动生成 Client 并建表。
- **生产**：`CHAT_DATABASE_URL="postgresql://..."`。执行 `npm run dev` 会生成 Client；首次或上线需另跑 `npm run prisma:migrate`。

### 2. 主站根目录 `.env`

在现有 `.env` 里**增加**（或确认已有）这三项，且 **CHAT_ADMIN_JWT_SECRET 与下面 chat-server 的完全一致**：

```env
CHAT_ADMIN_JWT_SECRET="你的长随机字符串_两边必须相同"
CHAT_SERVER_INTERNAL_URL="http://127.0.0.1:4000"
NEXT_PUBLIC_CHAT_SERVER_URL="http://localhost:4000"
```

本地主站 3000、chat-server 4000 分开跑时，**必须**填 `http://localhost:4000`，前台气泡才会连到 chat-server。

### 3. chat-server 的 `.env`

```powershell
cd services\chat-server
copy .env.example .env
# 用编辑器打开 .env 填写：
```

必填示例：

```env
CHAT_SERVER_PORT="4000"
CHAT_DATABASE_URL="postgresql://chatapp:你的密码@127.0.0.1:5432/chatapp"
CHAT_ADMIN_JWT_SECRET="你的长随机字符串_与主站相同"
CHAT_ALLOWED_ORIGINS="http://localhost:3000"
ADMIN_ALLOWED_ORIGINS="http://localhost:3000"
```

---

## 二、本地同时跑两个服务（两个终端）

### 终端 1：chat-server（先启动）

```powershell
cd C:\Users\user\Desktop\Website-new\services\chat-server
npm install
npm run dev
```

会根据 `.env` 的 `CHAT_DATABASE_URL` 自动用 SQLite 或 Postgres（SQLite 时自动建表）。看到 `SERVER_OK port=4000`、`DB_OK`、`WS_OK` 再继续。

### 终端 2：主站（前台 + 后台）

```powershell
cd C:\Users\user\Desktop\Website-new
npm run dev
```

主站跑在 `http://localhost:3000`。

---

## 三、试看前台（访客端）

1. 浏览器打开：**http://localhost:3000/**
2. 点右下角 **Live** 气泡，打开聊天面板。
3. 应看到「客服已连接」或先「Connecting…」后变为 **Online**，可输入消息发送。

若一直 **Offline**：确认主站 `.env` 里 `NEXT_PUBLIC_CHAT_SERVER_URL=http://localhost:4000`，且 chat-server 的 `CHAT_ALLOWED_ORIGINS` 包含 `http://localhost:3000`。

---

## 四、试看后台（客服端）

1. 打开：**http://localhost:3000/admin/login**，登录后台。
2. 侧栏点 **Live Chat**（或直接打开 **http://localhost:3000/admin/chat**）。
3. 不应再出现「Live Chat 服务未连接」；若有访客发过消息，左侧会出现会话，点进去可回复。

---

## 五、完整闭环试一次

1. **前台**：`http://localhost:3000/` → 点 Live 气泡 → 发一句「你好」。
2. **后台**：`http://localhost:3000/admin/chat` → 左侧应出现该会话 → 点选 → 回复「您好，有什么可以帮您？」。
3. 回到前台聊天面板，应能看到客服回复。

---

## 六、常见问题

| 现象 | 处理 |
|------|------|
| 后台提示「Live Chat 服务未连接」 | 主站 `.env` 加 `CHAT_SERVER_INTERNAL_URL=http://127.0.0.1:4000`，并确认 chat-server 已启动。 |
| 前台气泡一直 Offline | 主站 `.env` 设 `NEXT_PUBLIC_CHAT_SERVER_URL=http://localhost:4000`（本地双端口时）；或检查 chat-server 的 `CHAT_ALLOWED_ORIGINS` 是否包含 `http://localhost:3000`。 |
| chat-server 启动报错 CHAT_DATABASE_URL | 建好 Postgres 库并填对 `services/chat-server/.env` 里的 `CHAT_DATABASE_URL`。 |

更多配置与线上部署：见 [LIVE-CHAT-上线检查.md](./LIVE-CHAT-上线检查.md)。

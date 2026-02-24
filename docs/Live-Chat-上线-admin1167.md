# 把 Live Chat 真正上到 admin1167.com / admin1167.net

下面是在**线上服务器**要做的事，做完后 **admin1167.com**（前台）和 **admin1167.net**（后台）里就会有可用的 Live Chat，不是 localhost。

---

## 前提

- admin1167.com / admin1167.net 已经指向你的服务器（同一台或能互相访问）。
- 主站（Next.js）代码已经部署在这台机上，并且你会在这台机上操作（SSH 或面板）。

---

## 一、代码已包含 Live Chat（确认一下）

本仓库里的主站代码**已经带** Live Chat 前台气泡和后台 `/admin/chat` 页面。你只要：

1. 把最新代码推到 Git（如 `git push origin main`）。
2. 在服务器上拉最新代码、重新构建、重启主站（和平时更新网站一样）。

这样 **admin1167.com / admin1167.net 上的页面**就已经是“带 Live Chat 的版本”。  
要让 Live Chat **真的能用**，还需要下面二、三、四步。

---

## 二、在服务器上配置主站的 .env（主站项目根目录）

在**主站**项目根目录的 `.env` 里**增加或确认**这三项（和 chat-server 用同一台机时，通常这样即可）：

```env
CHAT_ADMIN_JWT_SECRET="一组长随机字符串，后面 chat-server 要用同一串"
CHAT_SERVER_INTERNAL_URL="http://127.0.0.1:4000"
NEXT_PUBLIC_CHAT_SERVER_URL=""
```

- `CHAT_ADMIN_JWT_SECRET`：自己生成一组长随机字符串，**主站和 chat-server 必须完全一致**。
- `CHAT_SERVER_INTERNAL_URL`：主站连 chat-server 的地址，同一台机就写 `http://127.0.0.1:4000`。
- `NEXT_PUBLIC_CHAT_SERVER_URL`：前台/后台浏览器连 chat 的地址；**admin1167.com / admin1167.net 和主站同域名反代时留空即可**。

改完后**重启主站**（例如 `pm2 restart website-phase2` 或你当前用的方式）。

---

## 三、在服务器上部署并运行 chat-server

Live Chat 的后端是**独立服务**，要和主站一起跑在同一台机（或内网可达的机子）上。

### 1. 放代码

- 若主站是用 Git 拉的，一般已经有 `services/chat-server` 目录，在项目根目录执行 `git pull` 即可。
- 若没有，就把本仓库里的 **`services/chat-server`** 整份拷到服务器上主站项目里的 `services/chat-server`。

### 2. 生产用 Postgres（chat 独立库）

chat-server 生产环境用 **Postgres**（不用 SQLite）。在服务器或数据库服务里：

- 建一个**独立库**（例如库名 `chatapp`）和**独立用户**（例如 `chatapp`），记下连接串。

### 3. 配置 chat-server 的 .env

在服务器上进入 **`services/chat-server`** 目录，创建或编辑 `.env`，内容参考：

```env
CHAT_SERVER_PORT="4000"
CHAT_DATABASE_URL="postgresql://chatapp:你的密码@主机:5432/chatapp"
CHAT_ADMIN_JWT_SECRET="这里填和二、主站里完全相同的长随机字符串"
CHAT_ALLOWED_ORIGINS="https://admin1167.com"
ADMIN_ALLOWED_ORIGINS="https://admin1167.net"
```

- `CHAT_ADMIN_JWT_SECRET` 必须和主站 `.env` 里的一字不差。
- `CHAT_ALLOWED_ORIGINS`：允许挂聊天气泡的前台域名，你的是 admin1167.com。
- `ADMIN_ALLOWED_ORIGINS`：允许后台客服页的域名，你的是 admin1167.net。

### 4. 安装依赖、生成 Prisma、迁移、用 PM2 常驻运行

在服务器上，**在 `services/chat-server` 目录**执行：

```bash
npm ci
npm run prisma:generate
npx prisma migrate deploy --schema prisma/schema.prisma
pm2 start npm --name chat-server -- start
pm2 save
pm2 status
```

看到 `SERVER_OK port=4000`、`DB_OK`、`WS_OK` 即表示 chat-server 已正常跑在 4000 端口。

---

## 四、在 Nginx 里把 /chat/、/ws-visitor、/ws-admin 指到 chat-server

浏览器访问的是 **admin1167.com** / **admin1167.net**，请求会带路径 `/chat/`、`/ws-visitor`、`/ws-admin`。这些必须由 Nginx 转发到本机的 4000 端口（chat-server）。

在**提供 admin1167.com / admin1167.net 的**那个 `server { ... }` 里增加（若两个域名同一配置就写一份即可）：

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

然后执行：

```bash
nginx -t
systemctl reload nginx
```

（或你当前用的重载方式。）

---

## 五、验证：admin1167.com / admin1167.net 上的 Live Chat

- **前台**：无痕打开 **https://admin1167.com**，点右下角 Live 气泡，应能打开聊天、显示 Online、能发消息。
- **后台**：打开 **https://admin1167.net/admin/chat**，登录后**不应**再出现「Live Chat 服务未连接」，能看到会话列表（或「暂无会话」），能点进去回复。

这样就是 **Live Chat 已经真正上到 admin1167.com / admin1167.net**，不是 localhost。

---

## 小结（谁来做）

| 步骤 | 内容 | 谁来做 |
|------|------|--------|
| 一 | 确认主站代码已更新并重启（含 Live Chat 页面） | 你或运维 |
| 二 | 在主站 .env 加 CHAT_* 三项并重启主站 | 有服务器权限的人 |
| 三 | 在服务器部署 chat-server（Postgres、.env、pm2） | 有服务器权限的人 |
| 四 | Nginx 增加 /chat/、/ws-visitor、/ws-admin 反代并 reload | 有 Nginx 权限的人 |
| 五 | 按上面验证 admin1167.com / admin1167.net | 你 |

如果你没有服务器或 Nginx 权限，把本文档发给有权限的人，按顺序做二、三、四即可把 Live Chat 真正上到 admin1167.com / admin1167.net。

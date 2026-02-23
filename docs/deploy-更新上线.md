# 更新后部署到网站（admin1167.net）

本地改完跑马灯、Live Chat 等后，要上传到线上可按下面做。

---

## 一、先提交并推送代码

```bash
git add .
git commit -m "fix: 跑马灯滚动、Live Chat 环境变量、登录 cookie"
git push origin main
```

---

## 二、在服务器上拉代码并重新构建、重启

网站跑在 **DigitalOcean 服务器**（如 68.183.227.172），需要在这台机上拉最新代码并重启。

### 若服务器上项目是用 git clone 的（有 .git）

SSH 登录后，进入项目目录，执行：

```bash
cd /var/www/website-app
# 或你实际路径，如 cd /root/website

git fetch origin
git checkout main
git pull origin main

npm ci
npm run build
pm2 restart all
```

或直接执行项目里的脚本（在项目根目录下）：

```bash
bash scripts/server-pull-and-deploy.sh
```

### 若服务器上没有 git（只有代码）

按 [server-update-no-git.md](./server-update-no-git.md)：备份 `.env` → 删目录 → 重新 `git clone` → 恢复 `.env` → `npm ci` → `npm run build` → `pm2 restart website-phase2`。

---

## 三、Live Chat 要能用的前提

- 在服务器 **.env** 里配置（与 .env.example 一致）：
  - `CHAT_SERVER_INTERNAL_URL`：Next 请求 chat-server 的地址，如 `http://127.0.0.1:4000`
  - `NEXT_PUBLIC_CHAT_SERVER_URL`：前台访客连 chat-server 的地址，如 `https://你的域名` 或 chat 子域
- 在同一台机或内网单独跑 **chat-server**（`services/chat-server`），并保证其 `.env` 里 `CHAT_ADMIN_JWT_SECRET` 与主站一致。

配置好并重启后，后台 Live Chat 的黄色提示会消失，会话列表和收发消息才会正常。

---

## 四、验证

- 无痕打开：https://admin1167.net（或你的前台域名）→ 看顶部绿色跑马灯是否在滚动。
- 打开 https://admin1167.net/admin/chat → 若已配置 chat-server，不应再出现「Live Chat 服务未连接」；若有访客会话，可选中并收发消息。

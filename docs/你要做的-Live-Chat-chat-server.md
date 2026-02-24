# Live Chat：你要做的 —— 让 chat-server 跑起来

「chat-server 常驻运行」的意思是：**让聊天服务这个程序一直在服务器上开着**，这样前台和后台才能连上 Live Chat。

下面是你**要做的几步**（按顺序做即可）。

---

## 第一步：打开终端

- **本机 Windows**：打开 PowerShell 或 CMD。
- **服务器**：用 SSH 登录后，在终端里操作。

---

## 第二步：进入 chat-server 所在文件夹

在终端里输入（项目根目录是 `Website-new` 时）：

```bash
cd services/chat-server
```

如果是本机，可能是：

```powershell
cd C:\Users\user\Desktop\Website-new\services\chat-server
```

---

## 第三步：第一次才做 —— 安装依赖

**只有第一次**在这个文件夹里需要执行：

```bash
npm install
```

等它跑完，不要关终端。

---

## 第四步：第一次才做 —— 生成数据库相关文件

**只有第一次**（或拉新代码、改过数据库结构时）需要执行：

```bash
npm run prisma:generate
```

如果报错，可以再试：

```bash
npx prisma generate --schema prisma/schema.sqlite.prisma
```

（用 SQLite 时用上面这行；用 Postgres 时把 `schema.sqlite.prisma` 改成 `schema.prisma`。）

---

## 第五步：启动 chat-server（让它一直跑着）

在**同一个**终端里执行：

```bash
npm run dev
```

- **本机**：不要关这个终端，关掉就等于关掉了 chat-server。
- **服务器**：建议用 PM2 让它在后台一直跑，例如：
  ```bash
  pm2 start npm --name chat-server -- start
  pm2 save
  ```

---

## 第六步：怎么算成功？

终端里出现类似下面几行，就说明 chat-server 已经正常跑起来了：

- `SERVER_OK port=4000`
- `DB_OK`
- `WS_OK visitor=/ws-visitor admin=/ws-admin`

看到这些就**不用再额外操作**，保持这个终端开着（或 PM2 在跑）即可。

---

## 小结

| 你要做的 | 命令（在 `services/chat-server` 里） |
|----------|--------------------------------------|
| 第一次：装依赖 | `npm install` |
| 第一次：生成数据库 | `npm run prisma:generate` |
| 每次：启动聊天服务 | `npm run dev`（本机）或 `pm2 start npm --name chat-server -- start`（服务器） |

做完这些，再配合主站 `.env` 和 Nginx 反代，Live Chat 就能用。主站 .env 可以用项目里的 **`scripts/check-live-chat-env.ps1`** 检查。

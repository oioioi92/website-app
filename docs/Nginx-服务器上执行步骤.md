# 在服务器 SSH 里执行的 Nginx 步骤（admin1167）

**说明**：下面所有命令都是在**你已经连上的 SSH 窗口**里执行（你现在的 `root@myFIRSTWEB:~#` 这个终端）。  
**要改的配置文件**：`/etc/nginx/sites-available/admin1167.conf`

---

## 第 1 步：先看当前配置长什么样（在 SSH 里执行）

```bash
cat /etc/nginx/sites-available/admin1167.conf
```

看一遍输出，确认里面有 `server_name admin1167.com` 和 `server_name admin1167.net` 的两个 `server { ... }` 块。

---

## 第 2 步：看现有 chat 片段里有什么（在 SSH 里执行）

```bash
cat /etc/nginx/snippets/admin1167-chat-landing.conf
```

- 如果里面**已经有** `location /chat/`、`location /ws-visitor/`、`location /ws-admin/` 并且 `proxy_pass http://127.0.0.1:4000`，说明 Live Chat 反代已经配好，只需确认 chat-server 在跑、主站 .env 配好即可。
- 如果**没有**或只有别的（例如只做跳转），继续第 3 步。

---

## 第 3 步：编辑主配置（在 SSH 里执行）

```bash
nano /etc/nginx/sites-available/admin1167.conf
```

在 nano 里：

1. 找到 **第一个** `server {`，且下面有 `server_name admin1167.com` 的那一块。
2. 在这一块**内部**，找合适位置（例如在 `location /` 或 `include ...` 的**上面或下面**），**粘贴**下面三段（不要删掉原有内容）：

```nginx
    # ----- Live Chat 反代到 chat-server 4000 -----
    location /chat/ {
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
    }
    location /ws-admin/ {
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_pass http://127.0.0.1:4000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
```

3. 再找到 **第二个** `server {`，下面有 `server_name admin1167.net` 的那一块，在**同一块内部**再**粘贴一次**上面这三段。
4. 保存退出：`Ctrl+O` 回车，再 `Ctrl+X`。

---

## 第 4 步：检查配置并重载 Nginx（在 SSH 里执行）

```bash
nginx -t
```

看到 `syntax is ok` 和 `test is successful` 后，执行：

```bash
systemctl reload nginx
```

没有报错就说明 Nginx 已按新配置运行。

---

## 命令汇总（复制顺序执行）

| 顺序 | 在哪里执行 | 命令 |
|------|------------|------|
| 1 | SSH（服务器） | `cat /etc/nginx/sites-available/admin1167.conf` |
| 2 | SSH（服务器） | `cat /etc/nginx/snippets/admin1167-chat-landing.conf` |
| 3 | SSH（服务器） | `nano /etc/nginx/sites-available/admin1167.conf` → 在两个 server 块里各加三段 location → 保存退出 |
| 4 | SSH（服务器） | `nginx -t` |
| 5 | SSH（服务器） | `systemctl reload nginx` |

**“在哪里发送命令”**：以上全部在**你现在连着的 SSH 窗口**（`root@myFIRSTWEB:~#`）里输入并回车，不要在本机 PowerShell 里执行。

# Nginx 自己配 Live Chat 反代

有服务器 SSH 权限、且网站是用 Nginx 提供时，可以自己加下面配置，不用别人帮忙。

---

## 一、确认 Nginx 在这台机上

SSH 登录服务器后执行：

```bash
nginx -v
```

能输出版本号（如 `nginx/1.18.0`）说明 Nginx 已装在这台机，可以自己配。

---

## 二、找到网站对应的配置文件

Nginx 的配置一般在：

- `/etc/nginx/nginx.conf`（主配置）
- 或 `/etc/nginx/sites-available/`、`/etc/nginx/conf.d/` 下的某个文件

**admin1167.com / admin1167.net** 的 `server { ... }` 通常在这些文件里。用下面命令找：

```bash
grep -r "admin1167" /etc/nginx/
```

记下**包含 `server_name admin1167.com` 或 `admin1167.net`** 的那个文件的路径，例如：

- `/etc/nginx/sites-available/website`
- 或 `/etc/nginx/conf.d/default.conf`

下面把要加的内容称为「Live Chat 配置块」。

---

## 三、把 Live Chat 配置块加进对应的 server

用编辑器打开上面找到的文件（需要 sudo）：

```bash
sudo nano /etc/nginx/sites-available/website
```

（把 `website` 换成你实际的文件名。）

在 **`server { ... }` 里面**（和已有的 `location /`、`location /api` 等同级），**粘贴**下面一整段：

```nginx
# ----- Live Chat 反代到 chat-server (4000) -----
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

保存退出（nano：`Ctrl+O` 回车，`Ctrl+X`）。

**注意**：如果 **admin1167.com** 和 **admin1167.net** 在两个不同的 `server { }` 里，**两个 server 里都要加**上面这段（各加一次）。

---

## 四、检查配置并重载 Nginx

执行：

```bash
sudo nginx -t
```

看到 `syntax is ok` 和 `test is successful` 后，再执行：

```bash
sudo systemctl reload nginx
```

没有报错就说明 Nginx 已经按新配置跑，Live Chat 的反代就**自己弄好了**。

---

## 五、确认 chat-server 在跑

Nginx 只是把请求**转给**本机 4000 端口，4000 上必须有 chat-server 在跑。执行：

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4000/chat/health
```

若返回 `200`，说明 chat-server 正常；若不是 200，需要先在 `services/chat-server` 用 PM2 启动 chat-server（见 [Live-Chat-上线-admin1167.md](./Live-Chat-上线-admin1167.md) 第三步）。

---

## 小结

| 步骤 | 你做啥 |
|------|--------|
| 1 | `nginx -v` 确认 Nginx 在这台机 |
| 2 | `grep -r "admin1167" /etc/nginx/` 找到配置文件 |
| 3 | 在对应 `server { }` 里粘贴上面三段 `location` |
| 4 | `sudo nginx -t` 再 `sudo systemctl reload nginx` |
| 5 | 确认 chat-server 已用 PM2 启动在 4000 端口 |

这样 Nginx 部分就是**自己弄**的，不需要别人帮配。

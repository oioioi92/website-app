# Phase 6：后台 IP Allowlist（上线手册）

目标：把后台入口从“互联网可见”变成“只对白名单可见”。

覆盖范围（建议）：

- `/admin/*`
- `/api/admin/*`（含：`/api/admin/upload/*`、`/api/admin/ops/*`）

三层防线（推荐组合）：

1. Nginx（物理层，最硬）
2. Cloudflare WAF（CDN 层）
3. Next.js Middleware（应用层兜底）

---

## 1) Nginx 层（推荐：最稳、最省资源）

只对 admin 路径限制（不影响前台）：

```nginx
location ^~ /admin {
  allow 123.45.67.89;
  allow 98.76.54.32;
  deny all;

  proxy_pass http://127.0.0.1:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location ^~ /api/admin {
  allow 123.45.67.89;
  allow 98.76.54.32;
  deny all;

  proxy_pass http://127.0.0.1:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

应用配置：

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Cloudflare Real IP（如果开了橙云）

如果域名走 Cloudflare（橙云），Nginx 看到的会是 Cloudflare 节点 IP。
这时必须在 `http {}` 里配置 real ip（否则 allow/deny 会全部误判）：

```nginx
real_ip_header CF-Connecting-IP;

set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
```

注意：Cloudflare IP 段会更新；生产建议用官方列表定期更新。

---

## 2) Cloudflare WAF（建议：在 CDN 层直接挡掉）

创建 Custom Rule（Block）示例：

```text
(http.request.uri.path contains "/admin" or http.request.uri.path starts_with "/api/admin")
and not ip.src in {123.45.67.89 98.76.54.32}
```

如果你把后台单独放子域名（推荐）：

```text
(http.host eq "admin.yourdomain.com")
and not ip.src in {123.45.67.89 98.76.54.32}
```

---

## 3) 应用层兜底（已落地：Next.js Proxy Guard）

你项目使用 Next.js 的 `proxy.ts`（替代传统 `middleware.ts`），所以应用层 allowlist 已集成在：

代码：`proxy.ts`

### 环境变量

```bash
ADMIN_IP_ALLOWLIST_ENABLED="1"
ADMIN_IP_ALLOWLIST="123.45.67.89,98.76.54.32,10.0.0.0/8"
```

（可选）如果你把后台独立为 `ADMIN_DOMAIN`，`proxy.ts` 会自动对整个后台域名启用 allowlist（无需额外 host 配置）。

说明（应用层兜底口径）：

- `ADMIN_IP_ALLOWLIST` 支持：精确 IP、IPv4 CIDR
- 取 IP 优先级：`CF-Connecting-IP` → `X-Real-IP` → `X-Forwarded-For`
- 不在白名单会返回：
  - API：`403 { "error": "IP_FORBIDDEN" }`
  - 页面：`403 Forbidden`

---

## 4) 验收（必须做）

1. 用白名单 IP 打开：`/admin`（应可访问）
2. 用非白名单 IP（手机流量）打开：`/admin`（应 403）
3. 用非白名单 IP 调用：`/api/admin/ops/redis-health`（应 403）

建议做一次故障演练：暂时清空白名单，确认后台入口立即不可访问，再恢复。

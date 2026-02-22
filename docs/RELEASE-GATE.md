# Release Gate（发布后人工验收）

适用场景：

- 有 Cloudflare / WAF / Challenge
- 后台已启用 2FA（TOTP）
- 无法在 GitHub Actions 里全自动拿到 cookie/csrf/totp

结论：发布流水线只做 “技术健康检查（public）”，安全能力用“发布后人工 Gate（半自动脚本）”证明。

---

## 1) 触发点

当 GitHub Actions `Deploy (VPS Releases + Rollback)` 变绿后，执行以下 Gate。

---

## 2) Gate A：Phase 4（上传安全）

在你的电脑或 VPS（有管理员登录态）执行：

```bash
node docs/generate-theme-upload-phase4-test-images.cjs

export DOMAIN="https://YOUR_DOMAIN"
export CSRF="YOUR_CSRF_TOKEN"
export COOKIE="YOUR_ADMIN_COOKIE"

bash docs/THEME-UPLOAD-PHASE4-CHECK.sh | tee phase4-upload-output.txt
```

报告模板：`docs/THEME-UPLOAD-PHASE4-REPORT.md`

---

## 3) Gate B：Phase 7（2FA / TOTP）

推荐用“半自动最稳版”（你提供 cookie/csrf/totp/backup）：

```bash
export DOMAIN="https://YOUR_DOMAIN"
export COOKIE="admin_session=...; admin_csrf=...;"
export CSRF="..."
export TOTP_CODE_OK="123456"
export BACKUP_CODE_OK="ABCD-EFGH"

bash docs/ADMIN-TOTP-PHASE7-CHECK.sh | tee phase7-totp-output.txt
```

报告模板：`docs/ADMIN-TOTP-PHASE7-REPORT.md`

备用（可选）：全自动登录版（可能受 Cloudflare 影响）

```bash
export DOMAIN="https://YOUR_DOMAIN"
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="***"
bash docs/ADMIN-2FA-PHASE7-CHECK.sh | tee phase7-2fa-output.txt
```

---

## 4) GO / NO-GO 规则

- 任何一项 Gate 失败：NO-GO（必须修复后重发 release）
- Gate 全部通过：GO（允许通知团队“发布完成”）

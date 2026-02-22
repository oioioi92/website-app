# Phase 7 验收报告（模板）：后台 2FA（TOTP）

项目：Admin Console - Phase 7（2FA / TOTP）  
日期：YYYY-MM-DD  
环境：Prod / Staging / Dev（选择一项）  
执行人：  
域名（可打码）：`https://***`

---

## 1) 结论（给老板看）

验收结果：PASS / FAIL（选择一项）

- Gate（未完成 2FA）：`/api/admin/theme` 是否 401 `TOTP_REQUIRED`：是 / 否
- Verify 成功后：`/api/admin/theme` 是否 200：是 / 否
- verify 限速（5 次/5 分钟）：第 6 次是否 429：是 / 否
- backup code 一次性：第一次 200、第二次非 200：是 / 否
- 审计日志：是否出现 `TOTP_*` 事件：是 / 否

风险备注（如 FAIL/部分 PASS 必填）：

- 风险点：
- 影响范围：
- 修复负责人/截止时间：

---

## 2) 运行模式（勾选）

- 半自动（推荐）：你提供 `COOKIE + CSRF + TOTP_CODE_OK + BACKUP_CODE_OK`
- 全自动：脚本自己登录拿 cookie/csrf（可能受 Cloudflare/挑战影响）

---

## 3) 半自动一键验收脚本（证据）

脚本：`docs/ADMIN-TOTP-PHASE7-CHECK.sh`

执行命令（示例）：

```bash
export DOMAIN="https://YOUR_DOMAIN"
export COOKIE="admin_session=...; admin_csrf=...;"
export CSRF="..."
export TOTP_CODE_OK="123456"
export BACKUP_CODE_OK="ABCD-EFGH"

bash docs/ADMIN-TOTP-PHASE7-CHECK.sh | tee phase7-totp-output.txt
```

输出证据（粘贴，允许打码）：

```text
(paste phase7-totp-output.txt)
```

---

## 4) 验收清单（标准）

| 项目 | 预期 |
| --- | --- |
| Gate | 未完成 2FA → `401 TOTP_REQUIRED` |
| verify 成功 | `200 { ok: true }` |
| Gate 解除 | verify 后 → `200` |
| Rate limit | 连错 6 次 → 第 6 次 `429 RATE_LIMITED` |
| Backup code | 首次 `200`，第二次不可复用 |
| AuditLog | 出现 `TOTP_*` 记录（setup/enable/verify/failed/rate_limit/backup_used） |

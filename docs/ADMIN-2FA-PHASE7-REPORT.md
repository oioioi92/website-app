# Phase 7 验收报告（模板）：后台 2FA（TOTP）

项目：Admin Console - Phase 7（2FA / TOTP）  
日期：YYYY-MM-DD  
环境：Prod / Staging / Dev（选择一项）  
执行人：  
域名（可打码）：`https://***`

---

## 1) 结论（给老板看）

验收结果：PASS / FAIL（选择一项）

- 登录后是否触发 2FA 挑战：是 / 否
- 未完成 2FA 是否被禁止访问 `/admin/*`：是 / 否
- 未完成 2FA 是否被禁止访问 `/api/admin/*`：是 / 否
- `/api/admin/security/2fa/verify` 是否限速（5 次/5 分钟）：是 / 否
- 备份码是否一次性（用过即作废）：是 / 否
- Secret 是否加密存储（DB 不出现明文）：是 / 否
- 审计日志是否记录关键事件：是 / 否

风险备注（如 FAIL/部分 PASS 必填）：

- 风险点：
- 影响范围：
- 临时绕过方案（如有）：
- 修复负责人/截止时间：

---

## 2) 前置条件

- 环境变量已配置：
  - `TOTP_ENC_KEY`：是 / 否
  - `TOTP_ISSUER`（可选）：是 / 否
  - `TOTP_ENFORCE_FOR_ROLES`：值为 `...`
- 数据库迁移已执行（Postgres）：
  - `phase7_totp`：是 / 否

---

## 3) 一键验收脚本（输出证据）

执行命令（建议原样粘贴）：

```bash
export DOMAIN="https://YOUR_DOMAIN"
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="***"

bash docs/ADMIN-2FA-PHASE7-CHECK.sh | tee phase7-2fa-output.txt
```

脚本输出（粘贴，允许打码）：

```text
(paste phase7-2fa-output.txt)
```

---

## 4) 验收用例清单（标准）

| 用例 | 步骤 | 预期 |
| --- | --- | --- |
| 1 | 账号密码登录 | 若未启用 2FA：直接进后台；若已启用：提示 requiresTotp |
| 2 | 获取 setup secret + otpauth | 返回 `secret` + `otpauthUrl` |
| 3 | enable 2FA | 返回 `backupCodes[]`（只显示一次） |
| 4 | logout → login | 必须触发 2FA 挑战 |
| 5 | 未 verify 调 `/api/admin/theme` | `401 TOTP_REQUIRED` |
| 6 | verify 错误码 6 次 | 第 6 次 `429 RATE_LIMITED` |
| 7 | verify 正确 TOTP | `200 { ok: true }` |
| 8 | verify 后调 `/api/admin/theme` | `200 ok` |
| 9 | 备份码用一次再复用 | 第一次 ok；第二次 `INVALID_CODE` |

---

## 5) DB 证据（可选但推荐）

确认 `AdminUser` 中：

- `totpEnabled = true`
- `totpSecretEnc` 存在且不是明文
- `totpBackupCodesHash` 仅为 hash（不可逆）

确认 `Session` 中：

- 未验证会话：`totpOk=false`
- 通过验证后：`totpOk=true` 且 `totpVerifiedAt` 有值

---

## 6) 审计日志（必须）

检查最近 20 条：

```sql
select action, "createdAt"
from "AuditLog"
where action like 'TOTP_%'
order by "createdAt" desc
limit 20;
```

期望可看到：

- `TOTP_SETUP_START`
- `TOTP_ENABLED`
- `TOTP_VERIFIED`
- `TOTP_VERIFY_FAILED`（当输入错误码时）
- `TOTP_VERIFY_RATE_LIMIT_HIT`（当触发限速时）
- `TOTP_BACKUP_USED`（当使用备份码时）

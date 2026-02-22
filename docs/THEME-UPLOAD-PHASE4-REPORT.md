# Phase 4 验收报告（模板）

项目：Theme Engine - Phase 4（服务端图片上传中转 + sharp 重编码）

日期：YYYY-MM-DD  
环境：Prod / Staging / Dev（选择一项）  
执行人：姓名/团队  
域名（可打码）：`https://***`

---

## 1) 结论（给老板看）

验收结果：PASS / FAIL（选择一项）

- 是否阻断 SVG：是 / 否
- 是否阻断伪造 MIME：是 / 否
- 是否阻断超尺寸（>2MB）：是 / 否
- 是否阻断超像素（>4096px）：是 / 否
- 是否生效 Rate Limit（30/min/admin）：是 / 否
- 是否确实重编码成 WebP：是 / 否
- 是否写入审计日志（IMAGE_UPLOAD）：是 / 否

风险备注（如 FAIL/部分 PASS 必填）：

- 风险点：
- 影响范围：
- 临时绕过方案（如有）：
- 修复负责人/截止时间：

---

## 2) 执行记录（可复现）

### 2.1 前置条件

- Admin 登录态：已获取 / 未获取
- CSRF Token：已获取 / 未获取
- 依赖：`curl` 必须有；`jq` 可选

执行命令（建议粘贴原样）：

```bash
export DOMAIN="https://YOUR_DOMAIN"
export CSRF="YOUR_CSRF_TOKEN"
export COOKIE="YOUR_ADMIN_COOKIE"

node docs/generate-theme-upload-phase4-test-images.cjs
bash docs/THEME-UPLOAD-PHASE4-CHECK.sh | tee phase4-check-output.txt
```

### 2.2 脚本输出（粘贴）

将 `phase4-check-output.txt` 内容粘贴到这里（可脱敏）：

```text
(paste here)
```

---

## 3) 验收用例清单（标准）

| 用例 | 输入 | 预期 HTTP | 预期错误码/现象 |
| --- | --- | --- | --- |
| 1 | 正常 PNG | 200 | JSON 含 `publicUrl` |
| 2 | SVG | 415 | `IMAGE_UNSUPPORTED` |
| 3 | fake.png（伪造 MIME） | 400 | `IMAGE_DECODE_FAIL` |
| 4 | >2MB | 413 | `IMAGE_TOO_LARGE` |
| 5 | >4096px | 413 | `IMAGE_TOO_LARGE_DIM` |
| 6 | 连续 31 次 | 第 31 次 429 | Rate limit 生效 |

备注：如果 Nginx 层先返回 413（`client_max_body_size`），需要在报告里注明“拦截点是 Nginx 还是应用层”。

---

## 4) 二次验证（专业级证据）

### 4.1 R2 对象响应头（Content-Type 必须是 WebP）

从用例 1 的 `publicUrl` 里拿到链接，执行：

```bash
curl -I "PUBLIC_URL_FROM_CASE_1"
```

证据粘贴：

```text
(paste headers here; expect content-type: image/webp)
```

### 4.2 文件识别（确实是 WebP）

```bash
curl -o out.webp "PUBLIC_URL_FROM_CASE_1"
file out.webp
```

证据粘贴：

```text
(expect: WebP image data)
```

### 4.3 审计日志（IMAGE_UPLOAD）

在主站数据库（非 chatdb）执行（按你们实际库名调整）：

```sql
select action, "createdAt", diffJson->>'module' as module, diffJson->>'url' as url
from "AuditLog"
where action = 'IMAGE_UPLOAD'
order by "createdAt" desc
limit 5;
```

证据粘贴（可打码 url）：

```text
(paste rows here)
```

---

## 5) 发现的问题与处理

- 问题 1：
  - 复现步骤：
  - 期望 vs 实际：
  - 初步原因：
  - 修复建议：
  - 状态：Open / Fixed / Won't Fix

---

## 6) 附录：版本信息

- Web build：提交号/构建号（如有）
- Next.js 版本：
- Node 版本：
- Prisma 版本：


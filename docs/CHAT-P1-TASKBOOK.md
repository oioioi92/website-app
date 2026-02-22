# Live Chat P1 Taskbook

目标：在现有 P0 基础上增量，不返工。

验收行：`P1_OK: tickets + canned_replies + tags_notes_search + stats_basic`

## 约束（必须遵守）

- 继续保持 P0 的安全约束：纯文本、事件白名单、限速、IP block、审计 events
- 所有新增字段/表仍然要 sanitize + escape
- admin 继续集成在现有 Next.js 后台（`/admin/chat`）不另开新端口
- chat-server 仍然独立服务（4000 + 独立 `CHAT_DATABASE_URL`）
- 不做文件上传（P4 才做）

## 已实现（当前仓库状态）

- chat-server REST API（admin JWT 鉴权）：canned replies / tags / notes / tickets / search / stats
- widget：增加「留言」入口（POST `/chat/api/public/tickets`）
- 启动日志：新增 `P1_OK` 打印（PM2 proof 用）
- Next.js 后台 `/admin/chat`：增加 Tools 面板（quick replies / tags / notes / tickets / search / stats）

## API 列表（chat-server）

Admin（需要 `Authorization: Bearer <admin_jwt>`）：

- `GET /chat/api/admin/canned-replies`
- `POST /chat/api/admin/canned-replies`
- `PUT /chat/api/admin/canned-replies/:id`
- `DELETE /chat/api/admin/canned-replies/:id`

- `GET /chat/api/admin/tags`
- `GET /chat/api/admin/conversations/:id/tags`
- `POST /chat/api/admin/conversations/:id/tags`
- `DELETE /chat/api/admin/tags/:tag`（仅高权限）

- `GET /chat/api/admin/conversations/:id/notes`
- `POST /chat/api/admin/conversations/:id/notes`

- `GET /chat/api/admin/tickets?status=open|closed`
- `POST /chat/api/admin/tickets/:id/close`

- `GET /chat/api/admin/search?scope=messages|conversations|tickets&q=...`
- `GET /chat/api/admin/stats/basic?from=YYYY-MM-DD&to=YYYY-MM-DD`

Public：

- `POST /chat/api/public/tickets`

## 线上验证（最小三证据）

在 VPS 上跑：`docs/P0_PROOF_COLLECTOR.sh`

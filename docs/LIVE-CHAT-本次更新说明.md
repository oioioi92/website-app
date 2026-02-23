# Live Chat 文档本次更新说明

本次完成：**升级 Live Chat 文档并接入系统**，便于后续部署与排查。

## 变更摘要

1. **文档升级**
   - [LIVE-CHAT-上线检查.md](./LIVE-CHAT-上线检查.md)：增加目录、版本说明、Windows 本地调试步骤、与 CHAT-P0-DEPLOY 的衔接。
   - [CHAT-P0-DEPLOY.md](./CHAT-P0-DEPLOY.md)：文首增加与「上线检查」的配套说明，主站 .env 补充 `CHAT_SERVER_INTERNAL_URL`。

2. **接入系统（Plugin）**
   - **README.md**：部署路线下增加「Live Chat 上线」一行，链接到 `docs/LIVE-CHAT-上线检查.md`。
   - **docs/ROBIN-MANUAL.md**：新增「7.5) Live Chat 验收」小节与验收清单打勾项，并链到上线检查文档。
   - **docs/deploy-更新上线.md**：第三节 Live Chat 前提下增加「完整检查清单与故障对照」链接。
   - **docs/README.md**（新）：文档索引，包含 Live Chat 两条入口。
   - **后台 /admin/chat**：当出现「Live Chat 服务未连接」时，提示中增加「部署与故障排查见项目文档 docs/LIVE-CHAT-上线检查.md」。

3. **根目录 .env.example**
   - 已包含 Live Chat 注释块与 `CHAT_SERVER_INTERNAL_URL` 示例（此前已加）。

## 上传到系统（Git）

在项目根目录执行：

```bash
git add docs/LIVE-CHAT-上线检查.md docs/README.md docs/LIVE-CHAT-本次更新说明.md
git add docs/CHAT-P0-DEPLOY.md docs/ROBIN-MANUAL.md docs/deploy-更新上线.md
git add README.md .env.example components/admin/AdminLiveChatClient.tsx
git status
git commit -m "docs: 升级 Live Chat 文档并接入系统（上线检查、ROBIN、deploy、后台提示）"
git push origin main
```

若需一并提交运行命令文档或脚本，可：

```bash
git add "docs/运行命令-前台后台.md" scripts/dev-sqlite-and-open.ps1
```

然后再执行一次 `git commit` 与 `git push`（或与上面同一次 commit）。

---

完成上述推送后，文档与后台提示即已接入系统；新成员或运维按 README / docs/README / 后台提示即可找到 Live Chat 上线与故障排查文档。

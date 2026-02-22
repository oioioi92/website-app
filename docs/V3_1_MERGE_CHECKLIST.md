# V3.1 合并前最后 Checklist（30 秒版）

## 最稳流程（按现有体系）

1. **本地**跑一次关门脚本：Windows 用 `npm run pr:final:v3.1:win`，macOS/Linux 用 `npm run pr:final:v3.1`。
2. **PR 上**确认 3 件事：
   - GitHub Actions 的 **pr-final-check.yml** 为绿；
   - Artifacts 里能下载到 **screenshots/**（3 张图都在）；
   - PR Body 里贴了 **`docs/PR_V3_1_BODY.md`**（含验收行）。

做到这三项即属「闭眼合并也不怕」。PR 描述可直接复制 `docs/PR_V3_1_BODY.md` 内容。

---

## 1) 脚本执行权限 & 换行符（跨平台最常见坑）

- 确认以下 shell 脚本已提交**可执行位**（Linux runner 才不会挂）：
  - `scripts/pr-final-check-v3.1.sh`
  - `RUN-SMOKE.sh`
  - `scripts/smoke.sh`（若在用）
- 已通过 **`.gitattributes`** 固定换行符，防止 Git 把 `.sh` 存成 CRLF：
  - `*.sh text eol=lf`
  - `*.ps1 text eol=crlf`

首次或重拉后如遇权限丢失，可执行：
```bash
chmod +x scripts/pr-final-check-v3.1.sh RUN-SMOKE.sh scripts/smoke.sh
```

## 2) screenshots 目录策略（团队统一）

关门脚本会检查 `screenshots/*.png` 是否存在。两种做法二选一，**关键统一**：

| 做法 | 说明 |
|------|------|
| **不提交截图**（当前默认） | `screenshots/` 在 `.gitignore`，CI 里上传 artifacts |
| **提交截图** | 用于 PR 视觉对比；若选此方案，从 `.gitignore` 中移除 `screenshots/` |

否则容易出现「有人 PR 带截图、有人不带」导致检查不一致。

## 3) CI 里跑一次（强烈推荐）

本地一键关门稳了之后，建议在 **Linux runner** 也跑一遍，避免「我电脑可以」：

- **Linux**：跑 `npm run pr:final:v3.1`
- **Windows**（可选）：跑 `npm run pr:final:v3.1:win`

CI 配置见 `.github/workflows/pr-final-check.yml`。

---

合并前扫一眼：脚本可执行 + 换行符正确 + screenshots 策略统一 + CI 通过 → 谁跑都一样、跑完就能合并。

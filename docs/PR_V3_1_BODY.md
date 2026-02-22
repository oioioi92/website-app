# V3.1 PR — 合并前确认

## 关门流程

1. **本地**跑过一次关门脚本：
   - Windows: `npm run pr:final:v3.1:win`
   - macOS/Linux: `npm run pr:final:v3.1`
2. **本 PR** 确认 3 件事：
   - [ ] GitHub Actions **pr-final-check.yml** 为绿
   - [ ] Artifacts 里能下载到 **screenshots/**（3 张图都在）
   - [ ] 本 PR Body 已贴本模板（含下方验收行）

做到以上即属「闭眼合并也不怕」状态。

---

## 验收行（合并前贴到 PR 描述或评论）

```
UI_WEB_V3_1_OK: marquee=ok slider=top liveTx=6rows+ticker stripes=on actionBar=belowTx buttons=imageOverride colors=cfg partnership=inContainer screenshots=ok
```

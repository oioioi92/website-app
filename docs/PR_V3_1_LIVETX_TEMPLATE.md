# PR 描述模板（V3.1 LiveTx + 加固）

## 说明摘要

- **V3.1 LiveTx**：6 行可视 + 框内 ticker（无缝循环）+ 条纹整齐（不叠粗线）
- **主题一致**：Deposit/Withdraw 颜色与 Theme 同源（默认蓝/金），badge + amount 同色系
- **无障碍**：重复列表 `aria-hidden`，viewport `aria-live="off"` + `aria-labelledby`
- **截图稳定**：Playwright 强制 `reducedMotion=reduce`，避免动画相位导致 diff
- **不影响旧版**：仅 V3 variant 启用 ticker，V2 8 格样式保留

## 验收行

```
UI_WEB_V3_1_OK: marquee=ok slider=top liveTx=6rows+ticker stripes=on actionBar=belowTx buttons=imageOverride colors=cfg partnership=inContainer screenshots=ok
```

## 合并前边角检查（6 项）

1. **hexWithAlpha**：非 `#RRGGBB`/`#RGB` 原样返回，不拼坏
2. **行高固定**：provider/尾号/金额均 truncate + whitespace-nowrap，不换行
3. **无缝前提**：仅 `shouldAnimate` 时 `trackItems = [...list, ...list]`，无额外 DOM
4. **region 可访问性**：viewport 使用 `aria-labelledby="live-tx-ticker-title"`
5. **背景图可读性**：有 `liveTxBgImageUrl` 时加 `bg-black/20` overlay + 内容 `relative z-10`
6. **Partnership 徽章**：外层 section `relative overflow-visible`，徽章挂外层

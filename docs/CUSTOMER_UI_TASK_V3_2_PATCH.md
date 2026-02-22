# V3.2 “更像参考站 1:1”补丁任务清单

V3.1 已把结构做齐（Marquee + Slider + LiveTx ticker + ActionBar + 徽章定位）。V3.2 只针对 **3 个最小补丁**，每个都是「小改动、视觉差异立刻明显」，可按 3 个 PR 拆开做。

---

## V3.2 最小补丁拆解（3 个 Patch）

### Patch 1：Slider 高度/比例（最显眼，优先做）

**目标：**

- Desktop 下 slider 高度固定在一个「像参考站」的区间（例如 `clamp(240px, 22vw, 320px)`）
- Promotion slider 与中间插图槽比例固定（比如 8:4 或 9:3），别因为内容长短挤来挤去
- 图片裁切策略可选：默认 `object-cover`，但后台可切 `contain`（避免 logo 被裁）

**验收：**

- 同一尺寸下，不管 promotion 文案多长，整体比例不乱
- 中间插图槽永远有「能放大图」的空间

---

### Patch 2：LiveTx 表头对齐（「像不像参考站」的关键细节）

**目标：**

- 表头 `DEPOSIT | WITHDRAW` **置顶不动**（ticker 走的是内容，不动的是 header）
- 两列对齐稳定：左列信息、右列金额（金额永远右对齐 + tabular nums）

**建议实现：**

- header 做成 panel 内 sticky：`sticky top-0 z-10`
- 内容 track 在 header 下方滚

**验收：**

- ticker 走多久，header 都不抖、不跟着走
- 金额列不跳动，视觉非常「稳」

---

### Patch 3：Action Bar 全图版间距（客户会盯这个）

**目标：**

- 图片按钮统一尺寸（例如高 48，宽自适应但有最小宽）
- 图片默认 `object-contain`（避免被裁），并可配置成 `cover`
- 按钮间距统一（例如 `gap-3` / `gap-4`），别忽大忽小
- Balance 数字层级更突出（比按钮文字更醒目一点）

**验收：**

- 全部换成图片后，按钮仍整齐、点击区域一致、不会挤压 limits 文案

---

## V3.2 验收行（合并前贴到 doc/PR）

```text
UI_WEB_V3_2_OK: promo=ratio+height liveTx=stickyHeader+alignedCols actionBar=imageSpacing screenshots=ok
```

---

## 一句话开工（建议输入方式）

不用写长说明，只要给**其中一种**即可开工：

1. **一张当前页面截图**（不用参考站也行），并圈出 ①②③  
   或  
2. **直接文字**：
   - **slider**：你想要更高/更矮？参考站看起来是「更扁」还是「更高」？
   - **liveTx header**：你想要「更贴顶/更粗/更透明」？
   - **actionbar**：你要按钮「更大/更密/更松」？

据此可拆成 **3 个最小 PR**（每个 PR 都有截图验收点），改完效果立刻像参考站靠拢。

---

## 可选：Patch 4 / 5（需要时再开）

- **Partnership 徽章**：浮动幅度与速度、断点下不挡 slider
- **截图与对比**：`home_v3_2_top_desktop.png`、参考站截图放 docs

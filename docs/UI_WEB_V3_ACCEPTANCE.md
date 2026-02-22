# UI Web V3 验收（首页布局改版）

完成 CUSTOMER_UI_TASK_V3 后，用以下清单自检并复制验收行到 PR/commit。

---

## 验收行（PR/commit）

```
UI_WEB_V3_OK: marquee=on header=centerLogo+lang promo=slider+expand liveTx=autoScroll6 stripes=on authMoved=belowTx actionBar=balance+deposit+withdraw+refresh colors=cfg buttonImages=cfg screenshots=ok
```

---

## 合并前检查清单

### Header
- [ ] Logo + Language Switch 居中；Login/Register/Sign out 已从 Header 移除，移至 Live Tx 下方。

### 跑马灯
- [ ] 全宽 Marquee 存在，文案来自后台；从右向左循环滚动；`prefers-reduced-motion` 时改为静态或淡入淡出。

### 主内容区（Desktop）
- [ ] 左：Sliding Promotion（大图轮播，可滑动）；点击展开详情且不跳回第一张；`data-testid="promotion-slide"`。
- [ ] 中：插图槽位可后台上传大图（占位先有）。
- [ ] 右：Live Transaction 可见 6 行；向上持续滚动、无缝循环；柔和分隔线 + 细微条纹背景；手机尾 4、Deposit 无入金方式、Withdraw 含 Provider；hover 可暂停；`prefers-reduced-motion` 时停滚；`data-testid="live-tx-item"`。

### Action Bar（Live Tx 下方全宽）
- [ ] 未登录：Login + Register。
- [ ] 已登录：Balance + Deposit + Withdraw + Refresh + Sign out。
- [ ] Deposit 默认蓝色、Withdraw 默认金色，颜色可在后台配置。
- [ ] 各按钮支持 imageUrl，有则显示图片按钮。
- [ ] Min/Max Deposit、Min/Max Withdraw 文案存在且来自后台配置。

### 后台配置
- [ ] Marquee 多条、主区插图槽 URL、Partnership 徽章 URL、Action Bar 按钮图 + 颜色 + Min/Max 金额均有配置/上传入口。

### 响应式
- [ ] Mobile：Header/Marquee 保留；Promotion → 插图槽 → Live Tx → Action Bar 竖向堆叠；不挤、可点。

### 截图
- [ ] `home_top_marquee_promo_liveTx_desktop.png`、`home_actionbar_desktop.png`；（可选）`home_mobile_v3.png`。脚本使用 testid 稳定定位。

---

## 详细规格与客户版

- **完整规格**：[CUSTOMER_UI_TASK_V3_SPEC.md](./CUSTOMER_UI_TASK_V3_SPEC.md)
- **客户版说明**：[CUSTOMER_UI_V3_README.md](./CUSTOMER_UI_V3_README.md)

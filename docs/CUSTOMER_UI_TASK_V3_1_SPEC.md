# CUSTOMER_UI_TASK_V3.1 现场修正说明书

## 主题
补齐 Live Transaction 区 + 顶部 Sliding Promotion + 下方 Login/Register/Wallet Bar + Partnership 徽章定位修复

## 验收行（PR/commit）

```
UI_WEB_V3_1_OK: marquee=ok slider=top liveTx=6rows+ticker stripes=on actionBar=belowTx buttons=imageOverride colors=cfg partnership=inContainer screenshots=ok
```

## 实现清单（已完成）

- **A)** Sliding Promotion 在 LiveTx 上方，留足间距（`v3-sliding-promo` + `mt-4` / `mt-6`）
- **B)** LiveTx：6 条列表 + 框内内容自动上移轮播（ticker）+ 细微条纹 + 细线分隔
- **C)** LiveTx 下方 Wallet Action Bar 全宽；未登录 Login/Register，已登录 Balance + Deposit/Withdraw/Refresh/Sign out；Deposit 蓝、Withdraw 金（可配）；按钮支持后台上传图片替换
- **D)** Partnership 徽章：在 Promotion 区域容器内 `relative` + 徽章 `absolute`，不使用 `position: fixed`
- **E)** Theme 配置：`actionBarButtonImages`、`actionBarLimits`、`liveTxBgImageUrl`、`actionBarDepositColor`、`actionBarWithdrawColor`
- **F)** 截图：`home_top_marquee_promo_liveTx_desktop.png`、`home_livetx_actionbar_desktop.png`、`home_actionbar_desktop.png`，选择器用 `data-testid`

## 相关文件

- 布局：`components/home/HomeCoverClient.tsx`
- Action Bar：`components/home/WalletActionBarV3.tsx`
- Theme：`lib/public/theme.ts`
- 截图：`scripts/capture-screenshots.ts`

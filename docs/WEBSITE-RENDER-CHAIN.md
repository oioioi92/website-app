# Website 实际渲染链路（Render Chain）

用于确认首页与 Live Transaction 实际使用的组件，避免改错文件。

---

## 首页 Route

| 项目 | 路径 |
|------|------|
| 首页 route | `app/(public)/page.tsx` |
| 服务端 | `PublicHomePage` 拉取 theme / promotions / games，根据 viewport 分叉 |

---

## 桌面版（lg 及以上）

| 项目 | 路径 / 说明 |
|------|----------------|
| 入口 | `<div className="hidden lg:block">` 内 |
| 主组件 | `components/vivid/VividHomeClient.tsx` |
| 使用 | 跑马灯、轮播、Hero 主卡、Quick Actions、**LiveTransactionTable**、Promo 卡片、Popular Games、Footer |

**Live Transaction 来源**：`components/public/LiveTransactionTable.tsx`，`variant="v3"`，传入 theme 的 livetx 颜色与 i18n 文案。

---

## 手机版（lg 以下）

| 项目 | 路径 / 说明 |
|------|----------------|
| 入口 | `<div className="lg:hidden">` 内 |
| 主组件 | `components/vivid/VividMobileHome.tsx` |
| 使用 | 顶栏、跑马灯、轮播、Quick Actions、SectionHeader、活动卡、**MobileLiveList**（内部）、ReferralBlock、Hot Games、Bottom Nav（由 layout 渲染） |

**Live Transaction 来源**：`VividMobileHome.tsx` 内部的 `MobileLiveList`（ticker 列表），数据来自 `useLiveTx`。

---

## Live Transaction 两套实现（已统一视觉）

| 端 | 组件 | 文件 | 布局 | 设计 token |
|----|------|------|------|------------|
| Desktop | LiveTransactionTable | `components/public/LiveTransactionTable.tsx` | 表格 (v3) | 与 mobile 统一：同一 title/badge/颜色/字体规则，见 vivid-portal.css `.vp-livetx-card` |
| Mobile | MobileLiveList | `components/vivid/VividMobileHome.tsx`（内部） | 垂直 ticker | 同上 |

统一内容：标题风格、live badge（animate-ping 红点）、数字 tabular-nums、deposit/withdraw 颜色来自 theme（livetxDepositColor / livetxWithdrawColor），桌面与手机共用同一套 token。

---

## 未使用的组件

| 组件 | 路径 | 说明 |
|------|------|------|
| DesktopThreeColumnShell | `components/public/DesktopThreeColumnShell.tsx` | 当前无 route 引用，仅内部用 LiveTransactionTable |

---

## 若 UI 未生效时自检

1. **改的是否为上述主组件**：桌面改 `VividHomeClient` 或 `LiveTransactionTable`；手机改 `VividMobileHome` 或内部 `MobileLiveList`。
2. **是否改错端**：桌面用 `hidden lg:block` + VividHomeClient；手机用 `lg:hidden` + VividMobileHome。
3. **Layout**：首页内容由 `app/(public)/layout.tsx` 包在 `MobileShell` 内，再渲染 `children`（即 page 的俩 div）。
4. **缓存**：`app/(public)/page.tsx` 已设 `export const dynamic = "force-dynamic"`，若仍无更新可检查 build/cache 或硬刷新。

---

*与 docs/UI-COMPONENT-MAP.md、UI-BASELINE-LOCK.md 配套。*

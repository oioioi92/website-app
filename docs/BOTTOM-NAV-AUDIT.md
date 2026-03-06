# 底部导航全面审计（Live Chat 必现）

## 结论：全站唯一底栏数据源

- **Layout 底栏**：`(public)/layout.tsx` → `MobileShell` → **仅渲染 `UnifiedBottomNav`**（不再分支 VividBottomNav / MobileBottomNav）。
- **UnifiedBottomNav**（`components/public/UnifiedBottomNav.tsx`）：**写死 6 项**，顺序为：
  1. Home (`/`)
  2. Games (`/games`)
  3. Promo (`/promotion`)
  4. History (`/history`)
  5. **Live Chat** (`/chat`)
  6. Setting (`/settings`)
- 无 theme、无 feature 控制项数，**不可能出现 5 项**。

## 渲染路径一览

| 场景 | 谁渲染底栏 | 组件 | 项数 |
|------|------------|------|------|
| 前台任意页（手机） | Layout → MobileShell | UnifiedBottomNav | 6 |
| 前台首页 Vivid 手机 | VividMobileHome 内嵌 nav | 同页内 6 项 nav | 6 |
| 前台首页桌面 | HomeCoverClient | BottomDockNav | 6 |

## 当首页为 Vivid 手机时

- 页面根节点带 `data-page-has-bottom-nav="true"`。
- CSS：`body:has([data-page-has-bottom-nav="true"]) nav[data-from-layout="true"] { display: none }` 会隐藏 Layout 的 UnifiedBottomNav。
- 用户看到的底栏来自 **VividMobileHome 内嵌的 nav**，同样是 6 项含 Live Chat。

## 如何自检

- 打开任意前台页，在开发者工具中查找底部 `<nav>`：
  - 若存在 **`data-unified-bottom-nav="true"`** 或 **`data-has-live-chat="true"`**，即当前使用的底栏，且一定为 6 项含 Live Chat。
- 若仍只看到 5 项：说明当前运行/部署的代码不是本仓库（或未包含本次修改），请在本 worktree 执行 `npm run dev` 或部署含 `UnifiedBottomNav` 的构建产物。

## 涉及文件

- `components/public/UnifiedBottomNav.tsx` — 唯一 layout 底栏组件，6 项写死
- `components/public/MobileShell.tsx` — 只引用 UnifiedBottomNav
- `components/vivid/VividMobileHome.tsx` — 首页内嵌 6 项底栏（含 Live Chat）
- `components/shell/BottomDockNav.tsx` — 桌面首页用，6 项含 Live Chat
- `styles/vivid-portal.css` — 首页自绘底栏时隐藏 layout 底栏

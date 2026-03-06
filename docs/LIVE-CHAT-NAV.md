# 底部导航栏必须显示 Live Chat

## 你要的

- **底部导航栏**里，在 **History** 和 **Setting** 之间，必须有一项 **Live Chat**（在线客服）。
- 顺序固定为：**Home → Games → Promo → History → Live Chat → Setting**（共 6 项）。

## 代码里已做的

1. **VividBottomNav**（`components/vivid/VividBottomNav.tsx`）：固定 6 列 grid，6 项含 Live Chat，不依赖主题。
2. **MobileBottomNav**（`components/public/MobileBottomNav.tsx`）：`buildBottomNavWithLiveChat` 固定注入 Live Chat；若结果不是 6 项则兜底为 6 项。
3. **BottomDockNav**（`components/shell/BottomDockNav.tsx`）：桌面首页底栏，6 项含 Live Chat。
4. **主题默认**（`lib/public/theme.ts`）：`defaults.bottomNav` 已改为 6 项，含 Live Chat。

## 若你仍只看到 5 项

说明当前浏览器跑到的不是这份代码，请：

1. **在本 worktree 跑**：在 `.../worktrees/Website-new/iiw` 下执行 `npm run dev`，用浏览器打开这里起的站点。
2. **或合并分支后跑**：把 `fix/admin-full-repair-plan` 合并到主分支，在主项目里 `npm run dev` 或部署。
3. **不要**在未合并的、桌面上别的 `Website-new` 文件夹里跑 dev，否则看不到 Live Chat。

## 如何确认是这份代码

浏览器里对底部 `<nav>` 检查：若带有 **`data-bottom-nav-items="6"`**，说明是本次修复的组件，应显示 6 项（含 Live Chat）。

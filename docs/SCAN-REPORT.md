# 项目全面扫描报告

生成时间：按当前代码库状态生成。

---

## 1. 底部导航与 Live Chat 一致性

### 1.1 底部栏组件与 Live Chat 状态

| 组件 | 位置 | Live Chat | 说明 |
|------|------|-----------|------|
| **VividBottomNav** | `components/vivid/VividBottomNav.tsx` | ✅ 有（第 5 项，History 与 Setting 之间） | Vivid 主题时使用，6 项全 emoji |
| **MobileBottomNav** | `components/public/MobileBottomNav.tsx` | ✅ 有 | `buildBottomNavWithLiveChat` 固定注入 |
| **BottomDockNav** | `components/shell/BottomDockNav.tsx` | ✅ 有 | 桌面首页用，6 项 |
| **VividMobileHome** | `components/vivid/VividMobileHome.tsx` | ✅ 已补 | `BOTTOM_NAV_DEFS` 已含 liveChat（本页不渲染底栏，由 layout 的 VividBottomNav 渲染） |

### 1.2 客服/聊天入口链接统一

- **实际路由**：`/chat`（`app/(public)/chat/page.tsx`），无 `/live-chat` 路由。
- **已修复**：以下 4 处已从 `/live-chat` 改为 `/chat`，避免 404：
  - `components/vivid/VividHomeClient.tsx`：QUICK_ACTIONS
  - `components/vivid/VividFooter.tsx`：Support 链接
  - `components/home/QuickActionsRowP44.tsx`：Support 链接
  - `components/shell/ContactDropdown.tsx`：Live Chat 默认链接

---

## 2. 路由与页面

### 2.1 前台 (public) 主要页面

- `/` 首页
- `/login`, `/register`, `/register-wa`
- `/chat` 在线客服（唯一客服页）
- `/games`, `/games/play/[gameId]`
- `/promotion`, `/bonus`, `/history`, `/settings`
- `/deposit`, `/withdraw`
- `/me`, `/me/referral`, `/partnership`, `/subsidiaries`

### 2.2 无 `/live-chat` 路由

- 项目中未实现 `app/(public)/live-chat`，所有客服入口应指向 `/chat`。

---

## 3. 代码健康度

### 3.1 TODO / FIXME / HACK

- 少量出现在脚本或占位文案中，未发现阻塞性标记。

### 3.2 console.log / console.error

- 主要分布在 `scripts/`、`lib/theme/themeCache.ts`、`lib/redis.ts`、`services/chat-server` 等。
- 生产前端组件中仅有极少数（如 AdminErrorBoundary、upload 等），可按需在构建时 strip 或保留用于错误上报。

### 3.3 Lint

- 对 `components/` 与 `app/` 的 read_lints 未发现新问题。

### 3.4 构建

- 当前环境执行 `npm run build` 时，prebuild 报错 `Cannot find module 'dotenv/config'`（依赖/环境问题），非业务代码错误。建议在 CI 与本地执行 `npm install` 后再 build。

---

## 4. i18n 与主题

### 4.1 底部导航文案

- `lib/i18n/translations.ts` 中已包含：
  - `public.vivid.bottomNav`: home, games, promo, bonus, history, support, **liveChat**, setting
- 中/英/马来语均已配置 liveChat（在线客服 / Live Chat / Sembang Langsung）。

### 4.2 主题 schema

- `lib/theme/themeSchema.ts`：`bottomNav` 为数组，最多 10 项。
- `lib/public/theme.ts`：默认 `bottomNav` 含 Support `/chat`，与当前统一使用 `/chat` 一致。

---

## 5. 安全与配置

### 5.1 环境变量

- 多处使用 `process.env.*`、`NEXT_PUBLIC_*`（auth、R2、Redis、chat-server、feature flags 等），无硬编码密钥。
- 敏感配置应通过 `.env` / 部署环境注入，不提交仓库。

### 5.2 API 与权限

- 后台相关 API 使用 `getAdminUserFromRequest` 等做鉴权；RBAC 与审计已在前期修复中涉及。

---

## 6. 建议后续可做

1. **重定向**：若需兼容旧链接，可在 `next.config` 或 middleware 中增加 `/live-chat` → `/chat` 重定向。
2. **构建环境**：确保 `npm install` 后 `dotenv` 可用，再跑 `npm run build`。
3. **生产 console**：若需减少前端日志，可配置 Terser/Next 的 drop_console 或仅在生产环境关闭 debug 分支。

---

## 7. 本次扫描已做修改

- 将 4 处客服入口由 `/live-chat` 统一为 `/chat`（见 1.2）。
- 本报告写入 `docs/SCAN-REPORT.md`。

---

## 8. 若底部栏仍只显示 5 项（没有 Live Chat）

- **确认运行目录**：当前修改在 **worktree** `.../worktrees/Website-new/iiw`。若你在 **Desktop** 的 `Website-new` 跑 `npm run dev`，看到的是旧代码。请在本 worktree 下执行 `npm run dev`，或把 `fix/admin-full-repair-plan` 分支合并到主仓库后再跑。
- **确认渲染的是哪个底栏**：在浏览器开发者工具里看底部 `<nav>`：带 `data-bottom-nav-items="6"` 的即本次修复的组件（应有 6 项含 Live Chat）。
- **清缓存**：硬刷新（Ctrl+Shift+R）或清空站点数据后重开页面，排除旧 bundle 缓存。

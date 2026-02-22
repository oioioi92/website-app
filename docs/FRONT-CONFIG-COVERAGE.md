# 前台可配置项覆盖率清单

目标：确保前台页面显示/行为里的“可变项”都能在后台配置并立即生效（或刷新生效），避免出现“前台写死/只能改代码”的情况。

## 1) 数据源总览（前台读取）

### A. SiteSetting: `theme_json`（主配置）
- 读取：`lib/theme/getPublicTheme.ts` -> `lib/theme/themeCache.ts` -> `lib/public/theme.ts(parseThemeJson)`
- 后台编辑：`/admin/site` -> `components/admin/ThemeSettingsClient.tsx`
- 覆盖项：品牌/Logo/跑马灯/下载条/年龄确认/底部导航/QuickActions/信任徽章/ActionBar 颜色与图片/首页模块标题/路由等。

### B. 数据表：`SocialLink`（前台当前真实来源）
- 读取位置：
  - `app/(public)/layout.tsx`
  - `app/(public)/page.tsx`
  - `app/(public)/chat/page.tsx`
- 字段：`label,url,iconUrl,isActive,sortOrder`
- 缺口：此前无专门后台页面（需要补 `/admin/social`）

### C. 数据表：`GameProvider`
- 读取：`lib/public/public-data.ts`（被首页游戏区/网格使用）
- 后台编辑：`/admin/providers`
- 字段：`name,code,logoUrl,isActive,sortOrder` + 分类覆写（SiteSetting: `provider_category_overrides`）

### D. 数据表：`Promotion`
- 读取：`lib/public/public-data.ts`（首页/活动页）
- 后台编辑：`/admin/promotions`

### E. 环境变量（Feature Flags）
- 当前使用点：`app/(public)/page.tsx`
  - `USE_HOME_V3`
  - `INTERNAL_TEST_MODE`
  - `USE_LEGACY_HOME`
- 缺口：只能改服务器 env，无法后台直接控制（需要补 `feature_flags` 配置与后台页面）

### F. namedAssets（命名资源映射）
- `lib/public/namedAssets.ts`
- 用途：底部导航/Chat 按钮等 UI 图标 fallback、默认 provider logo 等
- 缺口：目前靠替换 public 静态资源文件，后台无法直观覆盖（可选补 `ui_asset_overrides`）

## 2) 已知“前台硬编码项”（需要抽出）
- `components/public/MobileTopBar.tsx`：品牌文案写死（应从 `theme.siteName` 或新增可配置字段）
- `components/public/TrustFooter.tsx`：信任徽章分组标题写死（应从 `theme_json` 提供可配置的分组列表）

## 3) 优先级
1. SocialLink 管理页（因为前台真实读取 SocialLink 表）
2. Feature Flags 后台化（并加护栏，避免误开高风险开关）
3. 抽出硬编码文案到 theme_json（避免“改不了”）
4. 可选：ui_asset_overrides（提升可替换 UI 图标的能力）


# SYSTEM FULL SPEC（给 ChatGPT 的完整系统说明书）

> 项目路径：`c:\Users\Lee\Desktop\Website`  
> 技术栈：Next.js App Router + React + TypeScript + Prisma + PostgreSQL + Tailwind  
> 说明目标：让 ChatGPT 在不了解上下文时，也能快速理解整个系统并给出准确改造建议。

---

## 1) 系统定位与总体结构

这是一个带前台展示与后台 CMS 的站点系统，核心包含：

- **前台（Public）**：首页、优惠页、会员测试会话、领取流程、实时交易展示
- **后台（Admin）**：内容管理、优惠管理、Provider 管理、台账、对账、风控、审计
- **安全体系**：Admin Session、RBAC、CSRF、Rate Limit、Audit Log
- **数据层**：Prisma + PostgreSQL（主），含促销引擎、交易台账、对账模型

关键目录：

- `app/(public)`：前台页面
- `app/admin/(secure)`：后台受保护页面
- `app/api/public`：前台 API
- `app/api/admin`：后台 API
- `components/public` / `components/admin` / `components/home`：前端组件
- `lib`：认证、安全、审计、规则、主题等核心逻辑
- `prisma`：schema 与数据库定义
- `scripts`：build/smoke/e2e/screenshots 等脚本

---

## 2) 前台系统（Public）

### 2.1 路由与页面职责

- `/` → `app/(public)/page.tsx`
  - 首页入口，支持两种首页：
    - 传统首页：`HomeClient`
    - Dashboard 风格首页：`HomeCoverClient`
  - 通过环境变量 `USE_LEGACY_HOME` 控制（默认 `1` = 传统首页）
- `/bonus` → `app/(public)/bonus/page.tsx`
  - 优惠列表与详情弹层
- `/me` → `app/(public)/me/page.tsx`
  - 会员领取记录（依赖 `member_ref` cookie）
- `/chat` → `app/(public)/chat/page.tsx`
  - 聊天链接跳转
- `/history`、`/settings`
  - 占位页

公共布局：

- `app/(public)/layout.tsx`
  - 包装 `MobileShell`
  - 读取 `theme_json` + social
  - 已做容错：数据库不可用时降级为默认主题，避免整站直接报错

### 2.2 前台关键组件树

- `MobileShell`（`components/public/MobileShell.tsx`）
  - `MobileTopBar`
  - `AnnouncementMarquee`
  - 页面 children
  - `AgeGateModal`
  - `DownloadAppBar`
  - `MobileBottomNav`

首页传统模式（`HomeClient`）：

- Hero slider
- LiveTransactionTable
- PromotionGrid
- GameGrid
- SocialButtons
- DesktopThreeColumnShell（桌面三栏）

首页 Dashboard 模式（`HomeCoverClient`）：

- `HomeHeader`
- `Hero`
- `LiveStatusPanel`
- `ModuleGrid`
- `ReportsAndPromos`
- `HomeFooter`

### 2.3 前台 API（核心）

- `GET /api/public/home`：首页聚合数据（promotions/games/social/theme）
- `GET /api/public/live-transactions`：实时交易（deposit/withdraw）
- `GET/POST /api/public/member/session`：会员测试会话
- `POST /api/public/promotions/[id]/claim/preview`：领取预览
- `POST /api/public/promotions/[id]/claim/confirm`：领取确认
- `GET /api/public/me/claims`：我的领取记录

说明：

- Public API 依赖 `INTERNAL_TEST_MODE=1` 的逻辑路径较多
- 首页、优惠页、me/chat 页面已加数据库失败容错（提示信息而非崩溃）

### 2.4 主题配置（theme_json）

来源：`siteSetting` 表中 `key = "theme_json"`，由 `lib/public/theme.ts` 解析。

影响范围：

- logo、跑马灯文本、hero banners、secondary banner
- 社交链接与样式（COIN/CUBE）
- 快捷操作、浮动按钮
- 下载栏、入金/出金链接
- 年龄门（AgeGate）

---

### 2.5 UI 规格表（写死：Home / Promotion / Wallet）

目标：让 UI 100% 可复现、可维护，避免后续“换了照片/图标就变形”。本项目采用 Tailwind 为主，但所有“可替换资产插槽”都必须走固定尺寸 class（见下文）。

#### 2.5.1 全局 UI Token（不要随意改）

基础色彩（在 `app/globals.css` 的 `:root`）：

- 背景：`--bg` / `--panel` / `--panel2`
- 金色：`--gold1` / `--gold2` / `--goldGlow`
- 文字：`--text` / `--muted`

圆角与阴影（用于统一视觉）：

- 卡片：`.rb-card`（边框 + 半透明背景 + 阴影）
- 徽标：`.rb-badge`（高度 22px，圆角 999）
- 悬浮效果：`.rb-glow`（hover 提升边框与阴影）

布局/尺寸（硬规格）：

- Mobile 底部可点击区域高度：`min-h-11`（44px）
- Promotion 卡片封面比例：`aspect-[16/9]`
- Hero Banner：`aspect-[16/9]`（compact 模式：`aspect-[16/5]`）
- Game Grid：每格 `aspect-ratio: 1/1`（由 `.logo-tile` 锁死）

#### 2.5.2 可替换图片/图标插槽（必须固定尺寸）

所有可替换 icon/photo 都必须使用 `ui-asset-img` + 对应插槽 class，避免图片大小不同导致 UI 抖动。

插槽尺寸变量与 class 定义位置：

- `app/globals.css`：`--ui-*` 变量 + `.ui-*` class
- 尺寸表文档：`docs/UI_ASSET_SIZES.md`

已接入固定插槽的组件：

- Quick Actions：`components/public/QuickActionsGrid.tsx`
- Bottom Nav：`components/public/MobileBottomNav.tsx`
- Social：`components/public/SocialButtons3D.tsx`
- Desktop Logo：`components/home/DesktopHeader.tsx`
- Promotion Cover：`components/public/PromotionCard.tsx`、`components/public/HeroPromotionSlider.tsx`、`components/home/PromotionShowcase.tsx`
- Game Logo：`components/public/GameGrid.tsx`（`.logo-tile` / `.logo-3d`）

规则：

- 图标类（QuickActions / BottomNav / Social）：透明 PNG，图形居中，四周留白（10% 以上）
- 封面类（Promotion/Hero）：按固定比例出图（16:9 / 16:5），主视觉放中间安全区（避免 `object-cover` 被裁切）

#### 2.5.3 Home（前台首页）模块规格

Home 的模块顺序（Mobile Shell 内）：

- `MobileTopBar`
- `AnnouncementMarquee`
- `HeroPromotionSlider`（Banner）
- `QuickActionsGrid`
- `LiveTransactionTable`
- Promotions（卡片网格 / 入口）
- Games（`ChunkedGameGrid` → `GameGrid`）
- Social（`SocialButtons3D`）
- `TrustFooter`
- `MobileBottomNav`
- `DownloadAppBar`

Home 的组件规格（硬规则）：

- Section 外框：优先使用 `.rb-card` 或 `GoldFrame`，避免裸内容直接贴底色
- Section 标题：统一使用 `SectionBar`（避免每个模块标题字号不一致）
- Banner：
  - 比例固定：`16:9`（桌面和手机一致逻辑）
  - 图片填充：`object-cover`
  - 点击行为：优先 open promotion，其次打开 linkUrl（见 `HeroPromotionSlider`）
- Game Grid：
  - 每格为正方形：`.logo-tile` 锁死
  - Logo 填充：`.logo-3d`（内部 78%），`object-contain`
  - 禁止出现非游戏图标混入游戏区（由后端/映射规则过滤）

#### 2.5.4 Promotion（优惠）模块规格

Promotion 列表（通用卡片，见 `components/public/PromotionCard.tsx`）：

- 卡片容器：`.rb-card` + `.rb-glow`
- 封面：
  - 比例固定：`aspect-[16/9]`
  - 图片：`object-cover`
  - 顶部角标：
    - 左上：percent（`.rb-badge`）
    - 右上：status（`.rb-badge` + 状态色）
- 文案区域：
  - 标题：`text-sm md:text-base`，两行截断 `line-clamp-2`
  - 标签：`text-[11px]`，使用 `.rb-badge`，并 `truncate`

Promotion 详情/展开（`/bonus` 页内 accordion，见 `components/public/BonusClient.tsx`）：

- 展开区域内封面：`aspect-[16/8]`（更宽更“横图”）
- CTA 按钮：
  - 主按钮：金色底（`bg-amber-500`）
  - 次按钮：描边（`border-white/25 bg-white/5`）
- 详情文案最多展示 6 行（由 `getDetailLines()` 控制）

#### 2.5.5 Wallet（前台钱包/记录）模块规格

本项目前台“Wallet 相关展示”当前包含两类：

- Live Transactions（首页实时交易）：`components/public/LiveTransactionTable.tsx`

  - 永远可见（即使没有数据，也显示 empty state：No transactions yet）
  - Loading/Empty/UI 不允许 `return null` 隐藏模块

- My Claims（`/me`）：`app/(public)/me/page.tsx`

  - 主结构：标题 + 表格/列表
  - 无 member 时：显示提示文案（不跳 500）

统一规则：

- 列表项点击区域高度 >= 44px（移动端）
- 金额对齐：右对齐；正负号明确（`+` / `-`）
- 状态颜色：尽量使用固定色阶（成功=绿、失败=红、处理中=黄）

#### 2.5.6 “写死 UI”工作流（给承包团队）

团队实施时必须遵循：

- 不允许在组件里散落写死尺寸：必须优先使用 `--ui-*` + `.ui-*` class（插槽尺寸）
- 新增可替换图片位：必须同时更新 `docs/UI_ASSET_SIZES.md`
- 任何模块新增图片：必须明确 `object-fit`（`contain` vs `cover`）与比例（aspect ratio）

---

## 3) 后台系统（Admin）

### 3.1 路由结构

- `/admin/login`
- `/admin`（Dashboard）
- `/admin/promotions`
- `/admin/providers`
- `/admin/ledger`（钱包/平台交易）
- `/admin/sheets`（对账）
- `/admin/risk`
- `/admin/site`
- `/admin/test-center`
- `/admin/audit`

入口：

- `app/admin/(secure)/layout.tsx`：统一登录校验
- `components/admin/AdminShell.tsx`：后台主导航与框架

### 3.2 权限与角色

- `lib/auth.ts`：
  - Admin cookie：`admin_session`
  - Session 表校验
- `lib/rbac.ts`：
  - `canManageAdmins`（仅 admin）
  - `canEditContent`（admin/editor）
- `lib/admin-api.ts`：
  - `requireAdminUser`
  - `requireContentEditor`
  - `ensureCsrfForWrite`

### 3.3 Providers 管理（重点）

页面：

- `app/admin/(secure)/providers/page.tsx`
- `components/admin/ProvidersClient.tsx`

能力：

- 单个 provider logo 上传（R2）
- 批量上传
- 按文件名自动匹配（优先 code，再 name 归一化）
- unmatched 手动绑定
- sortOrder 上下调整
- 快速新增 provider（name + code）

API：

- `GET/POST /api/admin/providers`
- `PATCH /api/admin/providers/[id]`
- `POST /api/admin/providers/bulk-match`

---

## 4) 数据模型（Prisma）

主 schema：`prisma/schema.postgres.prisma`

核心模型：

- `AdminUser` / `Session`：后台账号与会话
- `AuditLog`：审计日志
- `Promotion` / `PromotionClaim` / `PromotionClaimAttempt`：优惠与领取链路
- `GameProvider`：游戏平台（含 `code`、`logoUrl`、`sortOrder`）
- `Member`：前台测试会员
- `WalletTransaction` / `ProviderTransaction`：钱包与平台交易
- `ReconcileSheet` / `ReconcileLine` / `BalanceSnapshot`：对账体系
- `SocialLink` / `SiteSetting`：前台内容与主题配置

关系重点：

- Member ↔ Claims / WalletTx / ProviderTx
- Promotion ↔ Claims
- GameProvider ↔ ProviderTx / ReconcileLine / Snapshot
- ReconcileSheet ↔ Lines / Snapshots

---

## 5) 安全机制

### 5.1 Admin Session

- cookie：`admin_session`
- tokenHash 存库，TTL 30 天
- 校验失败返回 401/重定向

### 5.2 CSRF

- cookie：`admin_csrf`
- 写操作必须带 `x-csrf-token`
- 校验逻辑：`lib/csrf.ts` + `ensureCsrfForWrite`

### 5.3 Rate Limit

- `lib/rate-limit.ts` 内存限流
- 覆盖：admin login/public home/live transactions/member session/claim 等

### 5.4 审计日志

- 写操作多数调用 `writeAuditLog()`
- 记录：actor、action、entityType、entityId、diffJson、ip、userAgent
- 查询页：`/admin/audit`

---

## 6) 促销引擎与领取流程

公共领取流程：

1. Preview：`/api/public/promotions/[id]/claim/preview`
2. Confirm：`/api/public/promotions/[id]/claim/confirm`

后台也有对应 claim preview/confirm 接口。

风控与限制：

- 活动有效期（startAt/endAt）
- 是否可领取（isClaimable）
- 规则（ruleJson）
- 频率限制（abuse guard）

---

## 7) 前端样式体系与近期 UI 状态

已有体系：

- 金色风格组件：`GoldFrame`、`GoldButton`、`SectionBar`
- 前台外壳：`MobileShell`
- 桌面三栏：`DesktopThreeColumnShell`

近期文档与状态：

- `docs/MOBILE_UI_TASK_V2.md` 已创建（移动端改造任务说明）
- 目标：ticker、小 slider、LiveTx 卡片化、游戏分批加载、bonus accordion
- 当前代码已具备 V1/Vlegacy 的首页切换能力，但 V2 仍是任务说明阶段（未全量落地）

---

## 8) 构建、测试、截图脚本

### 8.1 Build

- `npm run build`
- prebuild 会执行：`prisma generate --schema prisma/schema.postgres.prisma`

### 8.2 Smoke

- Windows：`RUN-SMOKE.bat -SkipSeed`
- Bash：`scripts/smoke.sh` 或 `RUN-SMOKE.sh`

### 8.3 Screenshots

- `npm run screenshots:capture`
- 依赖本地 Chrome + 可访问 base URL
- 支持 `CAPTURE_BASE_URL` / `SMOKE_BASE_URL`

---

## 9) 环境变量清单（关键）

必需：

- `DATABASE_URL`（必须 `postgresql://` 或 `postgres://`）
- `SESSION_SECRET`
- `CSRF_SECRET`

常用：

- `INTERNAL_TEST_MODE=1`
- `RATE_LIMIT_ENABLED`
- `RATE_LIMIT_RPM`
- `ADMIN_SEED_EMAIL`
- `ADMIN_SEED_PASSWORD`
- R2 相关：`R2_ENDPOINT`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET`、`R2_PUBLIC_BASE_URL`

参考文件：

- `.env.example`
- `.env.sqlite.example`（仅参考，不适用于当前 postgres schema 运行链路）

---

## 10) 已知风险与排障建议

### 10.1 DATABASE_URL 错误

现象：

- PrismaClientInitializationError
- 提示 URL 必须以 `postgresql://` 或 `postgres://` 开头

处理：

- 修正 `.env` 中 `DATABASE_URL`
- 重启 dev server

### 10.2 Windows 下 Prisma generate EPERM

现象：

- `query_engine-windows.dll.node` rename 失败

处理：

- 关闭占用进程（dev server/IDE 相关锁）
- 重试 `npm run prisma:generate`

### 10.3 端口冲突

现象：

- `next dev` 自动切到 3001/3002

处理：

- 访问实际输出端口
- 或结束占用 3000 的进程

---

## 11) 给 ChatGPT 的指令模板（可直接粘贴）

你在分析这个项目时，请遵守以下约束：

1. 不要破坏现有 auth/csrf/rbac/audit/ledger/sheets/promo engine。
2. 前台改动优先增量实现，不做大规模重构。
3. 图片素材只能来自后台上传（R2）或本地 placeholder，不允许抓取第三方站素材。
4. 若涉及 LiveTx demo，仅在 `INTERNAL_TEST_MODE=1` 显示，并明确 DEMO 标记。
5. 任何写接口必须保持 CSRF 校验；任何关键写操作保持 Audit 记录。

如果你要实现移动端改造，请以 `docs/MOBILE_UI_TASK_V2.md` 为准。

---

## 12) 关键文件索引（便于 AI 定位）

- 前台入口：`app/(public)/page.tsx`
- 前台布局：`app/(public)/layout.tsx`
- 传统首页：`components/HomeClient.tsx`
- 新首页：`components/home/HomeCoverClient.tsx`
- 优惠页：`app/(public)/bonus/page.tsx`
- 主题解析：`lib/public/theme.ts`
- Admin 外壳：`components/admin/AdminShell.tsx`
- Providers 页：`components/admin/ProvidersClient.tsx`
- Providers API：`app/api/admin/providers/*`
- Content API：`app/api/admin/content/route.ts`
- Auth：`lib/auth.ts`
- Admin API 权限：`lib/admin-api.ts`
- RBAC：`lib/rbac.ts`
- CSRF：`lib/csrf.ts`
- Audit：`lib/audit.ts`
- Prisma schema：`prisma/schema.postgres.prisma`
- 截图脚本：`scripts/capture-screenshots.ts`
- Smoke 脚本：`scripts/smoke-check.ts`、`scripts/smoke.ps1`、`scripts/smoke.sh`

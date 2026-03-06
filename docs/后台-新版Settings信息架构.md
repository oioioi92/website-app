# 后台 · 新版 Settings 信息架构

> 目标：从「配置台」升级为「运营可用的后台」。本文档为可直接给设计师/开发的结构图与说明。

---

## 一、顶层原则

- **分层导航**：高频工作（待办、玩家、报表）放顶层；配置与管理放 Settings 下分组。
- **单职责页**：一个页面只负责一类配置，不混站点头、弹窗、Banner、Promotion 样式于一页。
- **运营命名**：菜单与标签用运营能懂的词（如「图片」「活动列表」），不直接暴露 imageUrl、promotionPattern。
- **状态可见**：关键模块在入口处显示状态（如 Referral：正常 / WhatsApp：已连接）。

---

## 二、新版 Settings 结构（方案 A）

```
Settings（设置首页）
├── 1. Frontend（前台）
│   ├── General（通用：站点名、Logo、链接）
│   ├── Notices & Marquee（公告与跑马灯）
│   ├── Popups（弹窗：Age Gate 等）
│   ├── Download Bar（下载条）
│   ├── Home Media（首页媒体：轮播、合作伙伴、Banner）
│   └── Display / Theme（展示与主题）
│
├── 2. Promotion Center（活动中心）★ 独立
│   ├── Promotion List（活动列表）
│   ├── Content（内容与文案）
│   ├── Media（图片）
│   ├── Link & Route（链接与路由）
│   ├── Layout（布局与样式）
│   └── Preview & Publish（预览与发布）
│
├── 3. Referral Center（推荐中心）
│   ├── General（下线代数、分享渠道）
│   └── Referral Links / Display
│
├── 4. Finance（财务）
│   ├── Bank Accounts
│   ├── Deposit Rules
│   ├── Withdraw Rules
│   └── Payment Gateway
│
├── 5. Integrations（集成）
│   ├── 游戏管理 / Game Providers（API 配置 + 供应商 Logo 合并）
│   └── WhatsApp
│
└── 6. Account & Security（账号与安全）
    ├── Profile（个人资料）
    ├── Password（修改密码）
    ├── Security（IP 白名单、2FA、Create Admin 入口）
    ├── Login History（登录记录）
    └── Admin Accounts（创建/管理 admin/editor/viewer）
```

---

## 三、各模块迁移来源

| 新模块/子页 | 从当前何处迁出 |
|-------------|----------------|
| Frontend → General | Front Cover：站点名、Logo、登录/注册/存款/提款/客服链接 |
| Frontend → Notices | Front Cover：跑马灯、sectionTitles |
| Frontend → Popups | Front Cover：ageGate、弹窗相关 |
| Frontend → Download Bar | Front Cover：downloadBar |
| Frontend → Home Media | Front Cover：heroBanners、subsidiaries、centerSlot、liveTxBg |
| Frontend → Display | Front Cover：actionBar 颜色/图片、部分展示预设 |
| Promotion Center | Promotion 优惠设置（弹窗文案）+ Front Cover 中 route、列表样式、字体、列数、卡片配置 |
| Referral Center | 现有 Referral 设置 + 修 404、统一入口 |

---

## 四、Settings 首页卡片建议

- 每个卡片：**标题 + 简短说明 + 状态标记**（可选）
- 分组与上文 1～6 一致
- 状态示例：Referral：正常 / WhatsApp：已连接 / Payment：2 通道启用

---

## 五、与现有 admin-nav 的对应

- 保留 Settings 为总入口，其下首页为卡片式分组。
- 子页路由示例：/admin/settings/frontend/general、/admin/settings/promotion、/admin/settings/referral 等。
- 现有 /admin/site（Front Cover）逐步拆成 Frontend 下各子页。

---

*文档版本：v1 | 用途：后台升级 — 新版 Settings 结构*

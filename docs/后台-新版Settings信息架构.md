# 后台 · 新版 Settings 信息架构

> 目标：从「配置台」升级为「运营可用的后台」。本文档为可直接给设计师/开发的结构图与说明。

---

## 一、顶层原则

| 原则 | 说明 |
|------|------|
| 分层导航 | 高频工作（待办、玩家、报表）放顶层/工作台；配置与管理放 Settings 下分组 |
| 单职责页 | 一个页面只负责一类配置，不混站点头、弹窗、Banner、Promotion 样式于一页 |
| 运营命名 | 菜单与标签用运营能懂的词（如「图片」「活动列表」「发布状态」），不直接暴露 imageUrl、promotionPattern |
| 状态可见 | 关键模块在入口处显示状态（如 Referral：正常 / WhatsApp：已连接 / Payment：2 通道启用） |

---

## 二、新版 Settings 结构（方案 A）

```
Settings（设置首页）
├── 1. Frontend（前台）
│   ├── General（通用）
│   ├── Notices & Marquee（公告与跑马灯）
│   ├── Popups（弹窗）
│   ├── Download Bar（下载条）
│   ├── Home Media（首页媒体）
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
│   ├── General（下线代数、分享渠道等）
│   ├── Referral Links / Display（推荐链接与前台展示）
│   └── Rules（规则，后续扩展）
│
├── 4. Finance（财务相关）
│   ├── Bank Accounts（银行账户）
│   ├── Deposit Rules（入款规则）
│   ├── Withdraw Rules（出款规则）
│   └── Payment Gateway（支付网关）
│
├── 5. Integrations（集成）
│   ├── Game API（游戏 API）
│   ├── WhatsApp
│   └── Other（后续扩展）
│
└── 6. Account & Security（账号与安全）
    ├── Personal Details（个人资料）
    ├── Password（密码）
    ├── 2FA（两步验证）
    ├── Login History（登录记录）
    ├── Roles & Permissions（角色与权限，后续）
    └── Audit Log（操作审计，后续）
```

---

## 三、各模块职责与迁移来源

### 1. Frontend

| 子页 | 职责 | 从当前何处迁出 |
|------|------|----------------|
| **General** | 站点名、Logo、登录/注册/存款/提款/客服链接 | Front Cover & Site 的站点与链接部分 |
| **Notices & Marquee** | 跑马灯、多行公告、Section 标题 | Front Cover 的跑马灯、公告、sectionTitles |
| **Popups** | Age Gate 开关与文案、弹窗标题/内容 | Front Cover 的 ageGate、弹窗相关 |
| **Download Bar** | 开关、标题、副标题、按钮文案、图片 | Front Cover 的 downloadBar |
| **Home Media** | 首页轮播、合作伙伴、副 Banner、插图槽、Live 背景图 | Front Cover 的 heroBanners、subsidiaries、centerSlot、liveTxBg 等 |
| **Display / Theme** | 行为样式、按钮颜色、UI 预设、社交样式 | Front Cover 的 actionBar 颜色/图片、promotionPattern 等「展示类」可考虑迁到 Promotion Center |

### 2. Promotion Center（独立，见下一份文档）

- 从「Promotion / 优惠设置」迁入：弹窗文案、CTA、空状态等
- 从「Front Cover」迁入：Promotion route、Bonus route、列表样式、字体、列数、卡片配置

### 3. Referral Center

- 从「Settings → Referral / 推荐设置」迁入并扩展
- 修 404，入口统一到此；前台「推荐区块」展示配置可在此子页

### 4. Finance

- Bank：保持/迁入现有 Bank
- Deposit Rules：现有 Deposit / Topup Rules
- Withdraw Rules：新建或从现有逻辑拆出
- Payment Gateway：保持现有入口，归入 Finance 分组

### 5. Integrations

- Game API、WhatsApp 保持现有入口，归入 Integrations 分组
- 后续可加「Test / Health / 最近错误」等

### 6. Account & Security

- Personal Details、Password：现有页面保留并归入
- 2FA、Login History、Audit、Roles：新增或后续迭代

---

## 四、Settings 首页卡片建议

- 每个卡片：**标题 + 简短说明 + 状态标记**（可选）
- 分组与上文 1～6 一致，便于和子页一一对应
- 状态示例：`Referral：正常` / `WhatsApp：已连接` / `Payment：2 通道启用` / `Referral：Error（修 404）`

---

## 五、与现有 admin-nav 的对应关系

当前 `config/admin-nav.ts` 中 Settings 下多为平铺入口。建议：

- 保留「Settings」为总入口，其下首页为**卡片式分组**（如上）。
- 子页路由建议：
  - `/admin/settings/frontend/general`
  - `/admin/settings/frontend/notices`
  - `/admin/settings/promotion`（Promotion Center 可再分子路由，见 Promotion 文档）
  - `/admin/settings/referral`
  - `/admin/settings/finance/bank`
  - `/admin/settings/finance/deposit-rules`
  - …
- 现有 `/admin/site`（Front Cover）逐步拆成 Frontend 下各子页，避免单页过长。

---

## 六、交付物清单（给设计/开发）

- [ ] 本信息架构文档
- [ ] Promotion Center 详细字段表（见 `后台-PromotionCenter字段与页面表.md`）
- [ ] Referral 404 修复 + 入口归入 Referral Center
- [ ] Front Cover 拆页任务列表（按 General / Notices / Popups / Download Bar / Home Media / Display 拆）
- [ ] 统一 Save / Preview / 未保存提示 的交互规范（可单独一页说明）

---

*文档版本：v1 | 用途：后台升级 — 新版 Settings 结构*

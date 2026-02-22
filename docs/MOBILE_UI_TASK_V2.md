# MOBILE_UI_TASK_V2 说明书（发给客服/开发）

## 0. 目标

把**手机端（Mobile）**首页与 Promotion 展示方式改成更轻量、更漂亮、对旧手机更友好：

- Promotion 改为 **横向折叠窗口（Accordion）**（点击展开/关闭）
- 首页顶部保留 **小尺寸 Promotion Slider**
- 标题下新增 **跑马灯信息条（Information Ticker）**
- **Live Transaction 改成格子/卡片**（每笔一格，整齐好看）
- **游戏列表不要一次性渲染全部**（避免 PNG 太多导致卡顿）

> 桌面端（Desktop）可先沿用现有 V1 Dashboard，不要影响。

---

## 1) 手机端首页结构（从上到下的顺序必须固定）

### A. Header（顶部）

- 保持现有 Logo / 菜单/登录入口即可（不要占太高）

### B. Information Ticker（标题下面的跑马灯）

- 形式：一条细长横条（单行文字滚动/轮播）
- 内容：例如公告/维护/最新活动提示（可多条循环）
- 视觉：小高度、清晰、不要抢主视觉

### C. Promotion Slider（顶部滑动 Banner 保留，但缩小）

- **要保留**滑动 Promotion（Sliding）
- **但不要占太大位置**：高度建议控制在手机屏幕的上方小区域
- 图：用现有 promotion 图片
- 点击：跳转到 Promotion 详情/Promotion 列表（看现有逻辑）

⚠️ 首页这里 **只保留这一段 Promotion**，下面不再出现第二段 Promotion 模块。

### D. Live Transaction（重点：改成“格子化/卡片化”）

把现在那种“一个大块里数字跳”的样式改成：

- 每一笔交易 = **一个小卡片/小格子**
- 卡片内容建议（可按你现有数据有啥放啥）：
  - 用户名（可做部分遮罩）
  - 游戏名/类型
  - 金额
  - 时间（或刚刚/xx秒前）
- 排版建议：
  - 手机：**两列网格**（2-column grid）或一列大卡（看你觉得哪个更漂亮）
  - 每张卡高度统一，信息层级清晰（标题/副标题/标签）
- 动效：可以轻微淡入/刷新，但**不要数字疯狂跳动**（旧手机会卡）

### E. Games（Live Transaction 下面直接是游戏）

- 首页不一次性展示全部游戏
- 采用以下任一方式（推荐方式 1）：

**方式 1（推荐）：分类 + 每类只显示前 6–10 个**

- 例如：Hot / Slots / Live / Sports / Others…
- 每类横向滑动（横向列表）
- 每类末尾一个「查看更多」进入完整列表页

**方式 2：分页/Load More**

- 首页初始只渲染 8–12 个
- “Load more” 才加载下一批

### 性能要求（必须做）

- 游戏图片启用懒加载（lazy loading）
- 优先使用更轻的图片格式（能 WebP 就 WebP，避免大量 PNG）
- 不要在首页一次渲染 100+ 个游戏卡片（旧手机会直接卡）

---

## 2) Promotion 展示方式（横向折叠窗口 Accordion）

> 这个建议放在 **Promotions 页面**（或“更多优惠”的列表区域），因为首页我们只保留小 Slider。

### 交互（窗口开合）

- Promotion 列表改成 **横向一行一条（Row）**
- 默认状态（收起）只显示：
  - 标题：例如 “Welcome Bonus 50%”
  - 简短标签/一句话
  - 右侧箭头/展开按钮
- 点击该行 → **展开内容**：
  1. 顶部显示一张 Promotion 照片/海报（全宽）
  2. 照片下方显示说明文字（Detail）
  3. 最下方 2 个按钮：
     - 主按钮：例如「Claim / Apply / 立即领取」
     - 次按钮：**X / Close**（关闭收起）
- 点击 Close（X）→ 收回变成一行
- 点击第二条 Promotion → 第一条自动收回（**一次只展开一个**，更整洁）

---

## 3) 验收标准（自测）

手机端满足以下才算完成：

1. 首页：标题下有 **跑马灯信息条**
2. 首页：顶部 **Promotion Slider 保留但高度变小**
3. 首页：Slider 下方 **不再出现第二段 Promotion**
4. 首页：Live Transaction 变成 **每笔交易一个小格子/卡片**，整齐好看
5. 首页：游戏 **分批/分类显示**，不会一次渲染全部，旧手机也不会卡
6. Promotions 列表页：Promotion 改成 **横向 Accordion**，可展开/可关闭（X），并且一次只开一个

**验收口令：**

```
MOBILE_UI_V2_OK: ticker=ok slider=small liveTx=grid games=lazy promo=accordion
```

---

## 4) 发给客服/开发时的一句话

> “桌面端先沿用 UI_TASK_V1，手机端请按 MOBILE_UI_TASK_V2 做，重点是 Promotion Accordion + ticker + LiveTx 格子 + 游戏分批加载。”

---

# 工程任务版（开发用）

## 路由与页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页（Mobile） | `/`（`< lg`） | 结构：Header → Ticker → Slider(小) → LiveTx(格子) → Games(分批)，无第二段 Promotion |
| Promotions 列表 | `/bonus`（Mobile） | 列表为 Accordion 行，点击展开详情+图+双按钮+X 收起，一次只展开一个 |

## 组件建议

| 功能 | 建议组件/位置 | 说明 |
|------|----------------|------|
| 跑马灯 | `InformationTicker` 或复用 `AnnouncementMarquee` | 单行滚动，数据可来自 theme `announcementMarqueeText` 或新字段 |
| 小 Slider | 现有 `HeroPromotionSlider` 加 prop 如 `compact={true}` 或新 `PromoSliderCompact` | 限制高度（如 max-h-32），仅首页用 |
| LiveTx 格子 | `LiveTransactionGrid` 或改造 `LiveTransactionTable` | 每笔一卡，2 列网格，字段：用户(遮罩)/游戏/金额/时间 |
| 游戏分批 | `GameGridByCategory` 或 `GameListLazy` | 分类横向滑动，每类 6–10 个 +「查看更多」；或首屏 8–12 + Load More |
| 游戏图懒加载 | `img loading="lazy"` 或 Next `Image` | 必须 |
| Promotion Accordion | `PromoAccordionList` 或改造 `PromotionGrid` | 行：标题+标签+箭头；展开：图+Detail+主按钮+Close(X)，单开 |

## 数据与 API

- **Ticker**：可沿用 `theme_json.announcementMarqueeText` 或扩展为数组循环。
- **LiveTx**：沿用 `/api/public/live-transactions`，前端改为卡片网格渲染。
- **Games**：首页可调新 API 或现有 home API，按 category 分块返回，每块 limit 6–10；或前端只取前 N 条 + 分页/Load More。
- **Promotions**：现有 `promotions` 数据，Accordion 仅改 UI（收起/展开状态在前端）。

## 与 V1 的关系

- **Desktop（≥ lg）**：继续用现有逻辑（含 UI_TASK_V1 的 Dashboard 或 USE_LEGACY_HOME 的原有三栏）。
- **Mobile（< lg）**：按本文档调整首页结构 + `/bonus` Accordion，不破坏现有 auth/csrf/promo engine。

## 验收检查清单

- [ ] 首页（Mobile）：Information Ticker 可见
- [ ] 首页（Mobile）：Promotion Slider 存在且高度缩小
- [ ] 首页（Mobile）：Slider 下无第二段 Promotion 区块
- [ ] 首页（Mobile）：Live Transaction 为每笔一卡/格，2 列或整齐一列
- [ ] 首页（Mobile）：游戏为分类+每类少量 或 首屏少量+Load More，图片懒加载
- [ ] `/bonus`（Mobile）：Promotion 为 Accordion，展开见图+Detail+双按钮+X，一次只开一个
- [ ] 输出验收行：`MOBILE_UI_V2_OK: ticker=ok slider=small liveTx=grid games=lazy promo=accordion`

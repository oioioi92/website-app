# 后台 i18n 扫描报告

## 本次已修复（英文/华语/马来文三语）

- **侧栏 (Sidebar)**：所有导航项的 `title`（tooltip）改为 `t("admin.navTooltip.xxx")`，随语言切换。
- **入款/提款列表页**：`app/admin/(secure)/deposits/page.tsx`、`withdrawals/page.tsx` 改为 client，标题与描述使用 `admin.depositsList` / `admin.withdrawalsList`。
- **入款/提款详情页**：新增 `AdminDepositDetailClient`、`AdminWithdrawalDetailClient`，所有标签使用 `admin.depositDetail` / `admin.withdrawalDetail`；服务端只负责拉数并传入。
- **AdminDepositListClient**：筛选按钮、加载中、表头（时间、渠道、状态、处理时长、操作）、详情链接 → `admin.common.*` / `admin.depositDetail.*`。
- **AdminPendingDepositsClient**：表头、详情、必填原因 placeholder、确认/取消、上一页/下一页、第 n 页共 m 页 → `admin.common.*`。
- **AdminPendingWithdrawalsClient**：表头、详情、必填原因/银行参考号 placeholder、确认/取消、上一页/下一页、第 n 页 → `admin.common.*`。
- **AdminPlayerListClient**：操作列、Chat/Wallet 按钮的 title、分页上一页/下一页 → `admin.common.action`、`admin.players.chatTitle/walletTitle`、`admin.agents.prevPage/nextPage`。
- **TransfersPageClient**：请求失败文案、表头（时间、来自、至、金额、状态、关联 ID）→ `admin.transfers.*`。
- **翻译键补充**：`admin.navTooltip.*`（三语）、`admin.depositsList` / `admin.withdrawalsList`、`admin.depositDetail` / `admin.withdrawalDetail`、`admin.common` 新增 confirm/cancel/detail/prevPage/nextPage/pageOf/pageOfTotal/requiredReason/bankRefPlaceholder/filter/time/channel/voucherNo/waitSeconds/action/bankAccount/processSeconds；`admin.players.chatTitle/walletTitle`；`admin.transfers` 新增 time/from/to/amount/correlationId/requestError。

---

## 仍含中文、待接 i18n 的位置

### 1. 后台页面（需改为 client 或套一层 client 用 t()）

| 路径 | 中文内容示例 |
|------|----------------|
| `app/admin/(secure)/chat/bot/page.tsx` | 自动回复机器人…、配置项包括：启用/关闭、欢迎语…、回复带选项… |
| `app/admin/(secure)/chat/templates/page.tsx` | 快捷回复模板、新增、编辑或删除模板… |
| `app/admin/(secure)/settings/payment-gateway/page.tsx` | 入款支付网关 / 渠道配置 |
| `app/admin/(secure)/promotions/page.tsx` | 优惠活动列表、上下架、前台展示 |
| `app/admin/(secure)/promotions/[id]/edit/page.tsx` | 编辑、编辑优惠、修改标题、副标题… |
| `app/admin/(secure)/players/[id]/wallet/page.tsx` | ← 玩家列表、该顾客前台·钱包代操作、最近流水（最多 50 笔）、时间、类型、金额、渠道/Ref |
| `app/admin/(secure)/agents/[id]/page.tsx` | ← 代理列表、代理详情、佣金仅按 L1 计算、名称、推荐码、L1 人数、总入款笔数、总提款笔数、Level 1 下线… |

### 2. 组件内硬编码中文

| 组件 | 说明 |
|------|------|
| **AdminReportView.tsx** | `REPORT_COLUMNS` 表头（代理、投注额、有效流水、输赢、笔数、游戏、时间、玩家、类型、金额、状态、动作、详情、日期、渠道、优惠）；详情抽屉内「详情」「关闭」「Rollover 详细」「Bet History（注单记录）」「待对接 API…」「暂无数据」「流水要求」「已完成流水」「进度」「按游戏/优惠的流水明细」「来源」「投注额」「有效流水」等。 |
| **ReportTableFromApi.tsx** | 报表不存在、请求失败、报表「…」尚未接入、Provider (必填)、Game code (可选)、请点击 SEARCH 查询。 |
| **AdminPlayerDetailPanel.tsx** | 操作失败、加载中…、无法加载该顾客数据、暂无流水、进入该顾客前台代操作、打开聊天、重置临时密码（…）、处理中…、复制话术、该功能后续开放。 |
| **AdminRegisterPendingClient.tsx** | 复制话术模板里的「注册成功\nID: …」为业务文案，可保留或按语种做模板。 |
| **WhatsappSettingsClient.tsx** | 同上，注册成功话术模板。 |

### 3. 配置与选项（展示时需用 t() 或加 key）

| 文件 | 说明 |
|------|------|
| **config/admin-nav.ts** | `tooltip` 已不再用于展示（Sidebar 用 `admin.navTooltip.*`），此处中文仅作注释/后备，可保留或改为 key。 |
| **config/reportCatalog.config.ts** | 卡片 `subtitle`、`keywords` 含中文；若 ReportCenter 渲染 subtitle，需改为 `subtitleKey` 并用 `t(subtitleKey)`。 |
| **config/transactions.presets.ts** | `tooltip` 为中文（全部流水、入款、提款等）；若在 UI 中展示，需用 t()。 |
| **lib/backoffice/filter-options.ts** | `RECORDS_STATUS_OPTIONS`、`TX_TYPE_ALL_OPTIONS` 等 `label: "全部"` 等；下拉展示处可用 `t("admin.common.all")` 或为 option 增加 labelKey 在组件里 t(labelKey)。 |
| **lib/backoffice/report-center-config.ts** | 分组 title、item label 含中文（如「总流水查询」「入款」「交易明细（员工操作）」）；若在报表中心/菜单中直接渲染，需改为 key 或 t()。 |
| **lib/backoffice/metrics-dictionary.ts** | 指标中文名（入款、出款、转分等），多为注释或内部口径，若前端有展示再接 i18n。 |

### 4. 仅注释或非界面文案

- **ReportTransactionsDetail.tsx**、**AdminLiveChatClient.tsx** 等文件中的 `// 注释`、`/* 筛选区 */` 等为开发注释，可不翻译。
- **AdminRegisterPendingClient** 内 `注册成功\nID: ${userRef}\nP: ${tempPassword}` 为复制到剪贴板的话术，若需多语可改为从 `admin.registerPending.copyTemplate` 之类 key 取模板再替换占位符。

---

## 建议后续步骤

1. **高优先级**：将「仍含中文」中的页面改为 client（或包一层 client），标题、描述、按钮、表头全部用 `t()`。
2. **AdminReportView**：为 `REPORT_COLUMNS` 每列增加 `labelKey`，渲染时 `t(labelKey)`；详情抽屉内所有用户可见文案迁到 `admin.reportView.*` 或 `admin.common.*`。
3. **ReportTableFromApi**：错误与提示文案迁到 `admin.reports.*` 或 `admin.common.*`。
4. **AdminPlayerDetailPanel**：所有提示、按钮、空状态迁到 `admin.players.*` / `admin.common.*`。
5. **filter-options**：保留 value，展示 label 时若为「全部」等固定项，用 `t("admin.common.all")`；或为每项加 `labelKey` 由组件 t(labelKey)。
6. **reportCatalog / report-center-config**：若前端渲染 subtitle 或菜单 label，改为使用翻译 key（如 `subtitleKey`）并在组件内 `t(subtitleKey)`。

完成上述后，顶栏切换 English/马来文时，后台可见文案将全部随语言切换。

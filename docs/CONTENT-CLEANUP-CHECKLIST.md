# 内容整理与修复清单

按「后台 / 前台 / 术语一致 / 空状态与错误」分类，便于逐项核对与修改。

---

## 说明：为什么这么多条？修复在哪？

- **清单里每一条 = 曾经发现的问题 + 建议改法**。列得多是为了不漏项，方便以后排查。
- **✅ = 已在本地代码里按建议改过**。所以「问题多」是**历史记录**，大部分已经修掉了。
- **还没上传/部署**：修改只在你本机，线上环境（如 Vercel）要**重新部署**后才会看到中文。部署方式：在项目根目录执行 `npx vercel --prod --yes`（或你平时用的部署命令）。

---

## 如何确认已修复？

用下面任一种方式自检即可。

### 1. 本地运行看界面（最直观）

在项目根目录执行：

```bash
npm run dev
```

然后：

- 打开 **后台**：浏览器访问 `/admin`（或登录页），看侧栏、面包屑、各设置页标题、表格列名、按钮和 placeholder 是否已是中文。
- 打开 **前台**：访问首页，看活动区、ModuleGrid、DesktopHeader 导航等是否已是中文。

看到中文 = 对应项已生效。

### 2. 部署后再看线上

把当前代码部署到 Vercel（或你的托管）后，用手机/电脑访问线上地址，按上面同样路径点一圈，确认和本地一致。这样就能确认「是否有修复」在线上也生效。

### 3. 在代码里抽查（不改动、只验证）

在项目根目录用命令行搜索，可以快速确认某些文案是否已改成中文（不会改代码，只是查）：

- 侧栏/登录已中文化示例：
  - 搜索「总览」：`rg "总览" --type-add 'code:*.{tsx,ts,jsx,js}' -t code`
  - 搜索「后台登录」：`rg "后台登录" --type-add 'code:*.{tsx,ts,jsx,js}' -t code`
- 若还搜到英文旧文案，说明该处可能还没改（或只在别的地方保留）：
  - 例如：`rg "No data available" --type-add 'code:*.{tsx,ts,jsx,js}' -t code`  
    若没有结果，说明「暂无数据」已替换掉英文。

用 1 或 2 就能直接回答「是否有修复」；3 适合想逐条对代码时用。

---

## 一、后台 (Admin)

### 1. 侧栏与导航

| 项 | 位置 | 当前内容 | 建议 |
|----|------|----------|------|
| 分组名 | AdminShell navSections | Dashboard, Report Center, … | ✅ 已统一为中文：总览、报表中心、财务、游戏、活动、风控与审计、系统设置；菜单项与面包屑同步 |
| 重复菜单 | System Settings 下 | Bonus Event、Bonus Category、Angpao 与 Activity System 重复 | ✅ 已去重（System Settings 仅保留一处） |
| 顶栏搜索 | AdminShell | placeholder "Search menu / page..." | ✅ 已改为「搜索菜单/页面」 |
| 面包屑 | AdminPageBar | "home" + 当前页 | ✅ 已改为「首页」 |

### 2. 页面标题与说明

| 页 | 文件/位置 | 当前 | 建议 |
|----|------------|------|------|
| 审计 | audit/page.tsx | description「记录后台写操作，支持追踪 actor / action / entity / diff。」 | ✅ 已改为「按操作者、动作、实体与变更追踪」 |
| 登录 | admin/login | 「Admin 登录」「登录中...」「登录」 | ✅ 已改为「后台登录」、副标题「控制台」、placeholder「邮箱」「密码」 |
| 报表 | report/[slug] | 各 REPORT_MAP title，如 "New Member ( Total: 0 pax )" | ✅ 已改为 "0 人" |
| 设置类 | settings/* | 各页 title/description | ✅ 银行、活动分类、红包、主设置、全部链接、支付网关、运营商、CDM 银行、合作方、前台 SEO、Token、Token CDM 等已中文化 |
| 其余后台页 | DashboardClient、ThemeSettings、Sheets、SheetDetail、TestCenter、PromotionClaim、PromotionStats、RiskRules、SocialLinks、Profile、Promotions、ProvidersClient | 英文 title/SectionCard | ✅ 已改为总览、前台主题设置、对账表/按日对账表、对账明细/明细行、测试中心/快捷链接/健康状态/一键操作/检查清单、活动代领工具/代领、活动统计/时间范围/按日/主要原因/最近领取、风控规则/规则、社交链接、个人资料、活动、游戏平台等 |

### 3. 表格列名与报表字段

| 位置 | 问题 | 建议 |
|------|------|------|
| report/[slug] OTP | "Whatsapps" | ✅ 已改为 "WhatsApp" |
| report/[slug] OTP | "Date Create" | ✅ 已改为 "Date Created" |
| report/[slug] 多处 | "Transfer at" | ✅ 已改为 "Transferred At" |
| CDM Bank / Staff / Feedback / Game Kiosk 等 | 列名全英文 | ✅ Staff/Feedback/Game Kiosk/Arrangement/Mini Game/CDM 银行 已中文化 |
| Game Arrangement | "(hot, slot, fishing, live, sports)" 作为 category 说明 | ✅ 已改为「分类 (hot/slot/fishing/live/sports)」 |

### 4. 空状态与表格提示

| 位置 | 当前 | 建议 |
|------|------|------|
| AuditLogTable | "No data available in table" | ✅ 已统一为「暂无数据」 |
| ReportTableClient | "No data available in table" | ✅ 同上 |
| DashboardClient / SettingsEntityClient / PromotionBlocksEditor | "No data available in table" | ✅ 同上 |
| ChatConsoleClient | 「暂无规则」「暂无数据」「暂无备注」「暂无 open tickets」「暂无命中日志」 | ✅ 「暂无 open tickets」已改为「暂无工单」；其余保持 |
| LedgerClient | RefNo 说明英文 | ✅ 已改为「可不填；若填则需唯一」；表格列/空态/筛选芯片/抽屉标题与表单项（会员·供应商·类型·金额·备注·状态·发生时间·保存·取消·快速编辑等）、快捷提示已中文化 |

### 5. 按钮与操作文案

| 位置 | 当前 | 建议 |
|------|------|------|
| 登录 | 「登录」「登录中...」 | 保持 |
| 2FA | 「生成二维码」「启用 2FA 并生成备份码」「验证」「处理中...」「验证中...」 | 保持；确认「关闭 2FA」等是否统一 |
| ThemeSettingsClient | "Uploading..." / status 中文 | ✅ 已改为「上传中...」 |
| PromotionRulesSimulator | "Preview" / "Previewing..." | ✅ 已改为「预览」/「预览中...」 |
| TestCenterClient | "Refresh Health" / "Refreshing..." | ✅ 已改为「刷新状态」/「刷新中...」 |
| DashboardClient | "Search" / "Loading..." | ✅ 已改为「搜索」/「加载中...」 |

### 6. 错误与失败提示

| 位置 | 当前 | 建议 |
|------|------|------|
| 登录 | 「登录失败，请检查账号密码」 | 保持 |
| LedgerClient | 「保存失败（可能日期已锁定或 refNo 重复/冲突）」 | 保持 |
| ProvidersClient | 「上传签名失败」「上传失败」「更新失败」「合并失败」等 | ✅ 已统一为「xxx 失败（原因简述）」 |
| PromotionBlocksEditor | 「请先保存新增 Promotion，再进行拖拽排序」等 | ✅ 已改为「请先保存新增活动…」「+ 新增活动」「请先保存活动，再进入规则配置」 |
| PromotionRulesForm | "Save failed" / "startAt must be <= endAt" | ✅ 已改为「保存失败」/「开始时间不能晚于结束时间」/「百分比需在 0～1000 之间」 |
| FeatureFlagsClient | 「无法读取 Feature Flags」「保存失败」 | ✅ 已改为「无法读取功能开关（…）」；页标题「功能开关」、描述已中文化 |
| SheetDetailClient | "Close failed" | ✅ 已改为「关闭失败」 |
| FrontSiteEditorOverlay | 「主题校验失败」「保存失败」「上传失败：仅支持...」 | 保持 |
| ChatRedirectClient | 长段「常见原因：1)...」 | 保持；可考虑折叠或链接到文档 |

### 7. 表单与占位符

| 位置 | 当前 | 建议 |
|------|------|------|
| bonus-category | placeholder "empty for unlimited" | ✅ 已改为「留空表示不限制」 |
| partnership-setting | "https://..." | ✅ 已改为「Logo 图片 URL，如 https://...」；标题/描述/选项已中文化 |
| front-seo-setting | metaHeader, footer, scriptPlace 等 label | ✅ 已加中文：Meta 头、页脚代码、脚本插入位置、跑马灯 |
| ThemeSettingsClient / FrontSiteEditorOverlay | 多处 placeholder 英文 | ✅ 已改：Site/logoUrl/客服默认链接/登录·注册·充值·提现链接、imageUrl/ctaText/ctaUrl/合作方徽章/中间插图/流水背景图、Age Gate/Download Bar 说明、ThemeSettings 限额占位；FrontSiteEditor 站点名/Logo/合作方徽章/跑马灯/标题·链接·图片/登录·注册·充值·提现链接等 |

---

## 二、前台 (Public)

### 1. 首页与通用

| 位置 | 当前 | 建议 |
|------|------|------|
| HomeClient / PromotionShowcase | "No promotions yet" | ✅ 默认已改为「暂无活动」（仍可由主题配置覆盖） |
| ReportsAndPromos | "No promotions yet" | ✅ 同上 |
| PromotionModal | "暂无活动内容" | 保持；与主题配置的 promomodaldetailsemptytext 一致 |
| LiveTransactionTable | "Loading..." | ✅ 默认已改为「加载中...」（可由 livetxloadingtext 配置覆盖） |
| ModuleGrid (若仍使用) | "Number Library", "Strategy Library" 等 | ✅ 已改为「控制台模块」「号码库」「策略库」「回测实验室」「数据同步」「OCR/监控」「管理后台」等中文 |
| DesktopHeader | "Results", "Analyzer", "Promotions", "Community" | ✅ 已改为「报表」「分析」「活动」「社区」；供应商选项「默认」「供应商 A/B」 |
| 语言切换 | DesktopHeaderV3 | "EN" / "中文" | 保持 |

### 2. 活动 / 促销

| 位置 | 当前 | 建议 |
|------|------|------|
| PromotionCard | title, subtitle 来自数据 | 确保后台「活动标题/副标题」有默认值或占位 |
| PromotionBlocksEditor | 默认「新活动」、区块「标题 Title (H1)」等 | ✅ 区块已改为「标题 (H1)」「段落」「列表」「按钮」「图片」+ 中文 hint |
| app/(public)/page 默认数据 | "Welcome Bonus 50%", "New Member Gift", "Weekly Cashback" 等 | ✅ 已加注释为占位数据 |

### 3. 客服 / 聊天

| 位置 | 当前 | 建议 |
|------|------|------|
| EmbeddedChatClient | "上传中..." / "照片" | 保持 |
| ChatRedirectClient | "Chat Server", "Local Chat (127.0.0.1:4000)" 等 | ✅ 已改为「客服入口」「本地调试 (127.0.0.1:4000)」等 |
| LiveChatFab / SocialButtons | 社交链接 label 来自后台 | 确保后台配置了 WhatsApp / Telegram 等名称 |

### 4. 其他前台页

| 位置 | 当前 | 建议 |
|------|------|------|
| partnership | 默认 "Emas888", "D Reload" 等 title | ✅ 已加注释为占位，正式环境请在后台合作方设置配置 |
| me 页 | 活动标题等来自 promotion | 与后台活动文案一致 |
| AgeGateModal | 标题/内容来自主题 ageGate | 确保后台有配置 |

---

## 三、术语与用词统一

| 概念 | 当前出现形式 | 建议统一为 |
|------|----------------|------------|
| 活动/优惠/红利 | Bonus Event, 活动, 优惠, Promotion | ✅ 侧栏与面包屑已统一为「活动」「活动分类」；Promotion 文案已改为「活动」 |
| 红包 | Angpao | ✅ 侧栏与报表已显示「红包」 |
| 报表/报告 | Report | ✅ 侧栏为「报表中心」，面包屑为「报表」 |
| 对账 | Reconcile Sheets | ✅ 侧栏与对账页已改为「对账表」 |
| 风控 | Risk Rules | 保持 |
| 审计 | Audit Log | 保持 |
| 客服/在线聊天 | Live Chat Console, 客服 | ✅ 侧栏已改为「在线客服」 |
| 每页条数 | records per page | ✅ 已改为「每页条数」/「每页 10 条」 |
| 搜索 | Search | ✅ 已改为「搜索」/「搜索...」 |

---

## 四、拼写与格式

| 项 | 位置 | 当前 | 建议 |
|----|------|------|------|
| WhatsApp 复数 | report OTP | "Whatsapps" | ✅ 已改为 "WhatsApp" |
| 日期字段 | report OTP | "Date Create" | ✅ 已改为 "Date Created" |
| 转账时间 | report transfer | "Transfer at" | ✅ 已改为 "Transferred At" |

---

## 五、可选（进阶）

- **SEO**：各前台页的 meta title/description 是否从后台或配置读取并统一风格。✅ 根 layout 的 description 已改为中文；子页仍可从后台 front-seo 等读取。
- **无障碍**：关键按钮、表头、表单 label 的 aria-label / 关联。✅ 已补充/统一：关闭菜单、面包屑、活动详情、幻灯片/分页、合作方、关闭供应商菜单等为中文 aria-label。
- **多语言**：若未来做 i18n，可在此清单基础上拆成 zh/en 两列逐条填。

---

## 使用方式

1. 按「一 → 二 → 三 → 四」顺序做，或按你优先级选章节。
2. 每改完一项可在清单里打勾或注明「已改」。
3. 若某条决定「保持现状」，也可在「建议」栏写「保持」避免重复讨论。

如需我按某一节逐条改代码，直接说章节号（例如「先做 一.3 表格列名」）即可。

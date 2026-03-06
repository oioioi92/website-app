# Promotion Center · 页面级落地清单

> 供开发/设计直接使用。按页面拆：字段、按钮、校验、状态、现有逻辑迁移点、优先级。  
> 当前阶段：结构层 P0 已完成，进入**内容迁移层 P1**，本清单为 Sprint A（Promotion Center 实体化）的执行依据。

---

## 一、总览与优先级

| 顺序 | 页面 | 路由 | 当前状态 | 目标 |
|------|------|------|----------|------|
| 1 | Promotion List | `/admin/settings/promotions/list` | 占位 + 外链到 /admin/promotions | 做成真列表，支持排序/启停/快捷入口 |
| 2 | Content | `/admin/settings/promotions/content` | 已沿用 PromotionSettingsClient | 补全单活动文案字段，或保持全局弹窗文案 |
| 3 | Media | `/admin/settings/promotions/media` | 占位 | 上传器 + 通用卡片图(必填) + 桌面主图(可选) |
| 4 | Link & Route | `/admin/settings/promotions/links` | 占位 | Link Type / URL / 新开页 / Test Link |
| 5 | Layout | `/admin/settings/promotions/layout` | 占位 | 从 Theme 迁入 promotionPattern、vividPromoCardConfig 等 |
| 6 | Preview | `/admin/settings/promotions/preview` | 占位 | 桌面/手机预览、发布状态、最后更新 |

**建议落地顺序**：list → content → media → links → layout → preview。  
单活动编辑流（Content/Media/Links 等）可与现有 `/admin/promotions/[id]/edit` 共用数据，或逐步把编辑入口从「单页多区块」改为「Promotion Center 内按 Tab 跳转」。

---

## 二、现有数据与接口（迁移依据）

### 2.1 Promotion 表（Prisma）

| 字段 | 类型 | 说明 | 归属页 |
|------|------|------|--------|
| id | String | CUID | 通用 |
| title | String | 活动名称 | Content |
| subtitle | String? | 副标题 | Content |
| coverUrl | String? | 主图（可作通用卡片图） | Media |
| coverUrlMobilePromo | String? | 手机活动页图 | Media |
| coverUrlDesktopHome | String? | 电脑首页缩图 | Media |
| coverUrlMobileHome | String? | 手机首页缩图 | Media |
| promoLink | String? | 点击跳转链接 | Links |
| detailJson | Json | 详情/条款等 | Content |
| ctaLabel | String? | CTA 按钮文案 | Content |
| ctaUrl | String? | CTA 跳转 URL | Content / Links 可共用 |
| isActive | Boolean | 上架/下架 | List |
| sortOrder | Int | 排序 | List |
| startAt / endAt | DateTime? | 时间范围 | List / Content |
| createdAt / updatedAt | DateTime | 创建/更新 | List / Preview |

### 2.2 Theme（站点级，与 Promotion 展示相关）

| 配置项 | 说明 | 当前位置 | 迁移目标 |
|--------|------|----------|----------|
| promotionPattern | 列表风格：classic / image_tiles / image_strips | ThemeSettingsClient | Layout |
| promotionFontPreset | 字体：default / compact / bold | ThemeSettingsClient | Layout |
| vividPromoCardConfig | imgHeight, columns, showPercent, showSubtitle, showTnc | ThemeSettingsClient | Layout |
| uiText.promomodal* | 弹窗文案（查看全部、立即领取、关闭、空状态等） | PromotionSettingsClient | Content（全局）或保留 |

### 2.3 现有 API

- `GET/PUT /api/admin/theme` — Theme 读写（Layout 迁出后仍用于其他站点设置）
- `GET /api/admin/promotions` — 活动列表
- `GET/PUT /api/admin/promotions/[id]` — 单活动 CRUD
- `POST /api/admin/upload/image` — 图片上传

---

## 三、第 1 页：Promotion List

**路由**：`/admin/settings/promotions/list`

### 3.1 目标

真列表页，不再占位；可在此做总览、排序、启停、进入编辑/预览。

### 3.2 字段/列

| 列名 | 数据来源 | 说明 |
|------|----------|------|
| 标题 | Promotion.title | 活动名称，可点击进入编辑 |
| 状态 | Promotion.isActive | Draft / Published / Disabled（可先做 Published/Disabled 两态） |
| 排序 | Promotion.sortOrder | 数字，支持拖拽或上下箭头 |
| 更新时间 | Promotion.updatedAt | 只读，格式化为本地时间 |
| 操作 | - | 见下 |

### 3.3 按钮与操作

| 按钮/操作 | 行为 | 备注 |
|-----------|------|------|
| 新建活动 | 跳转 `/admin/promotions/new` 或 Promotion Center 内「新建」流 | 可与现有入口统一 |
| 编辑 / 进入 Content | 跳转 `/admin/promotions/[id]/edit` 或 `/admin/settings/promotions/content?id=[id]` | 先链到现有编辑页亦可 |
| 快速启停 | 切换 isActive，调用 PATCH promotions/[id] | 需有确认或 Undo 提示 |
| 预览 | 新开 tab 或弹窗，展示该活动在前台的卡片+弹窗效果 | 可链到前台 promotion 页并 hash 定位 |
| 本组其他页面 | 使用 SETTINGS_NAV 渲染 Content / Media / Links / Layout / Preview 链接 | 已有壳子可复用 |

### 3.4 校验与状态

- **列表加载**：loading / error / empty 三种状态，空状态提示「暂无活动，可新建」。
- **启停**：乐观更新 + 失败回滚；可选 toasts「已上架」「已下架」。
- **排序**：保存前可做本地校验（如 sortOrder 不重复）；保存后列表重拉。

### 3.5 迁移点

- 列表数据：`GET /api/admin/promotions`，已有。
- 单条更新：`PATCH /api/admin/promotions/[id]`（isActive、sortOrder），若无则新增。
- 当前 list 页为占位 + 链接到 `/admin/promotions`，改为直接在本页渲染表格并保留「前往 Promotions 管理」作为次要入口（或完全替代旧列表入口）。

---

## 四、第 2 页：Content

**路由**：`/admin/settings/promotions/content`

### 4.1 目标

- **全局弹窗文案**（当前 PromotionSettingsClient）：保留并仍在本页。
- **单活动文案**（可选）：若本页支持「当前编辑活动」切换，则增加活动名称、副标题、说明、CTA、空状态等；否则保持仅全局。

### 4.2 字段（全局 — 已有）

| 字段 | 类型 | 存储位置 | 必填 | 说明 |
|------|------|----------|------|------|
| 弹窗风格 | 下拉 | theme.uiText.promomodalvariant | 否 | premium / light |
| 「查看全部优惠」按钮文案 | 单行 | theme.uiText.promomodalviewalltext | 否 | |
| 「立即领取」按钮文案 | 单行 | theme.uiText.promomodalclaimtext | 否 | |
| 关闭按钮文案 | 单行 | theme.uiText.promomodalclosetext | 否 | |
| 无内容时占位文案 | 单行 | theme.uiText.promomodaldetailsemptytext | 否 | |

### 4.3 字段（单活动 — 建议补全，可放在编辑流中）

| 字段 | 类型 | 存储位置 | 必填 | 说明 |
|------|------|----------|------|------|
| 活动名称 | 单行 | Promotion.title | 是 | |
| 副标题 | 单行 | Promotion.subtitle | 否 | |
| 说明/详情 | 富文本或 HTML | Promotion.detailJson | 否 | 条款、规则 |
| CTA 按钮文案 | 单行 | Promotion.ctaLabel | 否 | |
| CTA 跳转 URL | URL | Promotion.ctaUrl | 否 | |
| 弹窗下方说明 | 多行 | 若现有有对应字段则用 | 否 | 条款表下方警告等 |

### 4.4 按钮与操作

- **保存**：写 Theme（PUT /api/admin/theme）和/或 Promotion（PUT /api/admin/promotions/[id]）。
- **取消**：恢复未保存前数据或返回列表。
- 成功/失败 toasts。

### 4.5 校验

- 活动名称：必填，长度限制（如 1–200 字符）。
- CTA URL：若填则需为合法 URL 或内部路径格式。

### 4.6 迁移点

- 现有 `PromotionSettingsClient` 已在本页使用，保留。
- 单活动字段若在本页做，需支持「选择活动」或从 List 带 id 进入；否则保持「仅全局」也可，单活动字段继续在 `/admin/promotions/[id]/edit` 完成。

---

## 五、第 3 页：Media

**路由**：`/admin/settings/promotions/media`

### 5.1 目标

按「一个活动最多 2 张图」策略：**Universal Card Image（必填）** + **Desktop Hero Image（可选）**。上传为主，URL 备用。

### 5.2 字段

| 字段 | 类型 | 必填 | 对应 DB | 说明 |
|------|------|------|---------|------|
| 通用卡片图 | 上传 + URL 备用 | 是 | coverUrl 或统一字段 | 桌面/手机共用，列表卡片与活动页回退 |
| 桌面主图 | 上传 + URL 备用 | 否 | coverUrlDesktopHome 或 coverUrl | 无则回退到通用卡片图 |

### 5.3 交互要求

- **上传器**：调用 `POST /api/admin/upload/image`，限制类型与大小（如 5MB），与现有 PromotionEditFormLines 中 PhotoUploadRow 一致。
- **缩略图**：上传或填写 URL 后展示小图预览。
- **尺寸提示**：在占位或 label 中说明建议尺寸（如 通用卡片 800×600，桌面主图 1200×600）。
- **尺寸验证**（可选）：上传后读取尺寸，超出建议时 warning，不拦保存。
- **替换**：同一字段可重新上传或改 URL，覆盖原值。
- **删除**：清空 URL，删除前确认「确定移除该图片？」。

### 5.4 按钮

- 保存（写当前编辑的 Promotion）。
- 取消。
- 若本页为「按活动编辑」：需有活动选择或从 List/Content 带 id。

### 5.5 校验

- 通用卡片图：必填，无图时提交报错「请上传或填写通用卡片图」。
- URL 格式：若填 URL 则需合法（http(s) 或 / 开头内部路径）。

### 5.6 迁移点

- 单活动编辑时：读 Promotion.coverUrl、coverUrlDesktopHome 等，写回同一 API。
- 上传逻辑可直接复用 `PromotionEditFormLines` 内 PhotoUploadRow 或抽成共用组件。

---

## 六、第 4 页：Link & Route

**路由**：`/admin/settings/promotions/links`

### 6.1 目标

把「点击卡片是跳链接还是开弹窗」和「链接是否有效」一次解决；Link 为空不报错，有值则前台必须可点。

### 6.2 字段

| 字段 | 类型 | 必填 | 对应 DB | 说明 |
|------|------|------|---------|------|
| Link Type | 枚举 | - | 由 promoLink 推断或单独存 | None / Internal / External |
| Link URL | 单行 | 否 | Promotion.promoLink | 内部路径或完整 URL |
| Open in new tab | 布尔 | - | 可存 Theme 或 Promotion 扩展字段 | 新开页 |

### 6.3 按钮与操作

- **Test Link**：新开 tab 打开当前 URL（内部路径则用当前 origin + path），仅前端即可。
- **保存 / 取消**。

### 6.4 校验与逻辑

- Link 为空：不报错，前台点击卡片打开条款弹窗（现有逻辑保持）。
- Link 有值：前台必须可点（已有 VividHomeClient / VividMobileHome 用 promoLink 做 a 标签）。
- Internal：建议校验格式为 `/xxx` 或相对路径，不允许 `javascript:` 等。
- External：校验为合法 http(s) URL。

### 6.5 迁移点

- 读取/写入 `Promotion.promoLink`。
- 若暂无「Open in new tab」存储，可先不做或存在 Theme 的某扩展字段，前台读该字段决定 `target="_blank"` 与否。

---

## 七、第 5 页：Layout

**路由**：`/admin/settings/promotions/layout`

### 7.1 目标

把散落在 Frontend（Theme）的 Promotion 展示参数迁到本页，避免「改活动样式要去站点设置」。

### 7.2 字段（全部来自 Theme，迁入后仍写 Theme）

| 字段 | 类型 | 当前 Theme 键 | 说明 |
|------|------|----------------|------|
| 列表风格 | 下拉 | promotionPattern | classic / image_tiles / image_strips |
| 字体风格 | 下拉 | promotionFontPreset | default / compact / bold |
| 每行列数 | 数字(2|3) | vividPromoCardConfig.columns | 2 或 3 |
| 卡片图片高度(px) | 数字 | vividPromoCardConfig.imgHeight | 80–600 |
| 显示百分比/标签 | 开关 | vividPromoCardConfig.showPercent | |
| 显示副标题 | 开关 | vividPromoCardConfig.showSubtitle | |
| 显示 T&C 按钮 | 开关 | vividPromoCardConfig.showTnc | |

### 7.3 按钮

- 保存（PUT /api/admin/theme，只提交 promotionPattern、promotionFontPreset、vividPromoCardConfig）。
- 取消。

### 7.4 校验

- 卡片高度：80–600 数字。
- 列数：2 或 3。

### 7.5 迁移点

- 从 `ThemeSettingsClient` 中把上述字段的 UI 与 patch 逻辑复制或抽成组件，放到本页；原 Theme 页可隐藏或删除这几项，避免重复编辑。
- 读取：GET /api/admin/theme；写入：PUT /api/admin/theme（只改上述键，其余合并保留）。

---

## 八、第 6 页：Preview

**路由**：`/admin/settings/promotions/preview`

### 8.1 目标

轻量版即可：桌面/手机预览、当前使用图片与 CTA、Link 状态；可选发布状态与最后更新时间。

### 8.2 区块与字段

| 区块 | 类型 | 说明 |
|------|------|------|
| 桌面预览 | 展示区 | iframe 或内嵌组件模拟桌面端卡片+弹窗（可链到 /promotion?preview=1） |
| 手机预览 | 展示区 | 同上，手机 viewport |
| 当前图片 | 只读 | 当前活动使用的通用卡片图、桌面主图 URL 或占位说明 |
| 当前 CTA | 只读 | ctaLabel + ctaUrl 或「无」 |
| Link 状态 | 只读 | 有链接 / 无链接（开弹窗） |
| 发布状态 | 只读或枚举 | Draft / Published，对应 isActive |
| 最后更新时间 | 只读 | updatedAt |

### 8.3 按钮与操作

- **刷新预览**：重新拉数据或刷新 iframe。
- 若做「选择活动」：下拉或从 List 带 id，预览该活动。

### 8.4 迁移点

- 预览数据来自 GET /api/admin/promotions 或单条 GET promotions/[id]，以及 theme（vividPromoCardConfig、promotionPattern 等）。
- 无需新增 API，只读展示即可。

---

## 九、统一交互标准（所有子页）

以下在 Promotion Center 各页统一应用，便于后续与 Settings 其他模块一致：

| 项目 | 要求 |
|------|------|
| 页面头 | 面包屑（Settings > Promotion Center > 当前页）、标题、副标题 |
| 保存 | 主按钮「Save Changes」或「保存」；保存中 disabled + 文案「保存中…」 |
| 取消 | 次要按钮「Cancel」或「取消」，恢复或返回 |
| 成功 | Toast「已保存」或 success 区域提示 |
| 错误 | Toast 或 inline 错误信息，不吞错 |
| 必填 | 必填项 label 加 * 或「必填」标记 |
| 未保存离开 | 可选：beforeunload 或路由离开前提示「有未保存修改，确定离开？」 |

---

## 十、实施顺序小结

1. **List**：表格 + 排序 + 启停 + 链接到编辑/预览，可先不迁「新建」入口。
2. **Content**：保持现有 PromotionSettingsClient；如需单活动文案，再在编辑流中补或本页加「选择活动」。
3. **Media**：上传器 + 必填通用卡片图 + 可选桌面主图，按活动编辑需带 id。
4. **Links**：Link Type + URL + Test Link，写 promoLink；内部/外链校验。
5. **Layout**：从 Theme 迁出 promotionPattern、promotionFontPreset、vividPromoCardConfig 到本页表单。
6. **Preview**：只读预览区 + 当前活动信息 + 最后更新；可选活动选择器。

完成上述 6 页后，Promotion Center 即从「占位壳」变为可运营的实体模块；再与 Frontend 拆字段（notices / popups / download-bar 等）和统一 Sticky Save Bar / Toast 配合，即可进入下一阶段（Sprint B/C/D）。

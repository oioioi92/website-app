# Promotion Center · 详细字段与页面表

> 目标：把分散的 Promotion 配置收拢为「活动中心」，运营在一个入口完成：管图、管跳转、管展示、管文案、管发布。本文档可直接给设计师/开发做页面与字段依据。

---

## 一、Promotion Center 在 Settings 中的位置

- **入口**：Settings → Promotion Center（独立模块，不再与「优惠弹窗文案」或 Front Cover 混在一起）
- **子结构**：建议 6 个页签或 6 个子页（见下），运营按「列表 → 内容 → 媒体 → 链接 → 布局 → 预览发布」顺序操作。

---

## 二、Promotion Center 六个子模块

### 1）Promotion List（活动列表）

| 用途 | 运营在列表页完成的操作 |
|------|------------------------|
| 总览 | 看到所有活动（标题、状态、排序、发布时间） |
| 高频 | 快速启停、拖拽排序、进入编辑 |

| 字段/列 | 类型 | 说明 |
|---------|------|------|
| 标题 | 文本 | 活动名称 |
| 状态 | 枚举 | 上架 / 下架（对应 isActive） |
| 排序 | 数字 | sortOrder，支持拖拽 |
| 发布时间 | 日期时间 | startAt / endAt 或「最后更新」 |
| 操作 | 按钮 | 编辑、启停、查看预览 |

- **与现有对应**：现有 Promotions 列表（/admin/promotions）可演进为此列表；新增/编辑进入「单活动编辑」流，其下再拆 Content / Media / Link / Layout / Preview 页签或区块。

---

### 2）Content（内容与文案）

| 用途 | 运营在此填写：活动标题、副标题、说明、CTA、空状态等 |

| 字段 | 类型 | 必填 | 说明 | 现有对应 |
|------|------|------|------|----------|
| 活动名称 | 单行文本 | 是 | 主标题 | title |
| 副标题 | 单行文本 | 否 | subtitle |
| 说明/详情 | 富文本或 HTML | 否 | 条款、规则说明 | detailHtml / detailJson |
| CTA 按钮文案 | 单行文本 | 否 | 如「立即领取」 | ctaLabel |
| CTA 跳转 URL | URL | 否 | 按钮跳转 | ctaUrl |
| 空状态文案 | 单行文本 | 否 | 无活动时展示 | 可从 theme 或默认文案来 |
| 弹窗下方说明 | 多行文本 | 否 | 条款表下方警告等 | popupTextBelow |

- **命名建议**：后台标签用「活动名称」「副标题」「CTA 按钮文案」，不直接暴露 title、ctaLabel。

---

### 3）Media（图片）

| 用途 | 管图：桌面主图、通用卡片图；上传优先，URL 备用 |

| 字段 | 类型 | 必填 | 说明 | 现有对应 |
|------|------|------|------|----------|
| 桌面主图 | 上传 + URL 备用 | 否 | 活动页大图；无则回退到通用卡片图 | coverUrl |
| 通用卡片图 | 上传 + URL 备用 | 是 | 桌面/手机共用，列表卡片与活动页回退 | coverUrlMobilePromo 或统一一张 |
| 弹窗顶部图 | 上传 + URL 备用 | 否 | 弹窗顶部横幅 | popupCoverUrl |

- **策略（按你诉求）**：一个活动最多 2 张——1 张必填（通用卡片图），1 张可选（桌面主图）；无桌面主图时自动用通用卡片图。
- **交互**：上传器为主，旁有「高级：填 URL」；尺寸提示、预览、替换、删除前确认。

---

### 4）Link & Route（链接与路由）

| 用途 | 管跳转：点击卡片是跳链接还是开弹窗；链接可测 |

| 字段 | 类型 | 必填 | 说明 | 现有对应 |
|------|------|------|------|----------|
| 链接类型 | 枚举 | - | 无 / 内部路径 / 外链 | 由 promoLink 是否为空推断 |
| 链接 URL | URL | 否 | 内部路径或完整 URL | promoLink |
| 测试链接 | 按钮 | - | 新开页验证链接是否可访问 | 新增 |

- **空值容错**：不填则点击卡片打开条款弹窗；填了则跳转。

---

### 5）Layout（布局与样式）

| 用途 | 管展示：卡片样式、字体、列数、是否显示标签/副标题/T&C |

| 字段 | 类型 | 说明 | 现有对应 |
|------|------|------|----------|
| 卡片样式/列表风格 | 枚举 | 如：经典 / 图卡 / 紧凑 | promotionPattern |
| 字体风格 | 枚举 | 如：默认 / 加粗 | promotionFontPreset |
| 列数 | 数字 | 每行几张卡片 | vividPromoCardConfig.columns |
| 显示百分比/标签 | 开关 | 是否显示百分比、高亮标签 | vividPromoCardConfig.showPercent |
| 显示副标题 | 开关 | 卡片是否显示副标题 | vividPromoCardConfig.showSubtitle |
| 显示 T&C 按钮 | 开关 | 是否显示条款按钮 | vividPromoCardConfig.showTnc |
| 卡片图片高度(px) | 数字 | 图片区高度 | vividPromoCardConfig.imgHeight |

- **归属**：这些若目前部分在 Front Cover，应迁到 Promotion Center 的 Layout 子页/页签，避免「改活动样式要去站点设置」。

---

### 6）Preview & Publish（预览与发布）

| 用途 | 预览、发布状态、最后更新时间 |

| 字段/区块 | 类型 | 说明 |
|-----------|------|------|
| 桌面预览 | 区块 | 当前活动在桌面端的卡片+弹窗效果 |
| 手机预览 | 区块 | 当前活动在手机端的卡片+弹窗效果 |
| 发布状态 | 枚举 | 草稿 / 已发布（可与 isActive 结合） |
| 最后更新时间 | 只读 | 便于运营确认是否已生效 |

- **交互**：保存后可在本页直接看预览，无需切到前台；后续若有「草稿 → 发布」流程，可在此做发布按钮与状态。

---

## 三、与现有数据/接口的对应关系

| 现有 | Promotion Center 归属 |
|------|------------------------|
| Promotions 列表 CRUD | Promotion List |
| title, subtitle, detailHtml, detailJson, ctaLabel, ctaUrl, popupTextBelow | Content |
| coverUrl, coverUrlMobilePromo, popupCoverUrl | Media |
| promoLink | Link & Route |
| ruleJson.display（含 detailType、popupStyle 等）| Content + Layout |
| theme 中 vividPromoCardConfig、promotionPattern、promotionFontPreset | Layout |
| isActive, sortOrder, startAt, endAt | List + Preview & Publish |

---

## 四、统一交互要求（与总架构一致）

- **保存**：统一「Save Changes」+ 成功/失败提示；关键页可加「未保存离开」提示。
- **预览**：在 Promotion Center 内提供桌面/手机预览，不依赖去前台翻页。
- **校验**：必填项（如通用卡片图、活动名称）保存前校验并提示。

---

## 五、交付物清单（给设计/开发）

- [ ] 本字段与页面表
- [ ] Promotion List 列表页线框图（列、操作、排序）
- [ ] 单活动编辑：5 个子页签/区块线框图（Content / Media / Link / Layout / Preview）
- [ ] 媒体：上传组件 + URL 备用 + 尺寸校验 + 预览
- [ ] 从 Front Cover 迁出字段的清单与接口归属（避免遗漏）

---

*文档版本：v1 | 用途：Promotion Center 详细字段与页面结构*

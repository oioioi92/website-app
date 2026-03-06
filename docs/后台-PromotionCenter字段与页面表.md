# Promotion Center · 详细字段与页面表

> 目标：把分散的 Promotion 配置收拢为「活动中心」。本文档可直接给设计师/开发做页面与字段依据。

---

## 一、Promotion Center 六个子模块

### 1）Promotion List（活动列表）

- 总览：标题、状态、排序、发布时间、操作（编辑、启停、预览）
- 对应现有：/admin/promotions 列表，isActive、sortOrder、startAt、endAt

### 2）Content（内容与文案）

| 字段 | 类型 | 必填 | 现有对应 |
|------|------|------|----------|
| 活动名称 | 单行文本 | 是 | title |
| 副标题 | 单行文本 | 否 | subtitle |
| 说明/详情 | 富文本或 HTML | 否 | detailHtml / detailJson |
| CTA 按钮文案 | 单行文本 | 否 | ctaLabel |
| CTA 跳转 URL | URL | 否 | ctaUrl |
| 弹窗下方说明 | 多行文本 | 否 | popupTextBelow |

### 3）Media（图片）

| 字段 | 必填 | 说明 | 现有对应 |
|------|------|------|----------|
| 桌面主图 | 否 | 无则回退通用卡片图 | coverUrl |
| 通用卡片图 | 是 | 桌面/手机共用 | coverUrlMobilePromo 或统一 |
| 弹窗顶部图 | 否 | 弹窗横幅 | popupCoverUrl |

- 策略：一个活动最多 2 张——1 张必填（通用卡片图），1 张可选（桌面主图）。上传为主，URL 备用；尺寸提示、预览、替换。

### 4）Link & Route（链接与路由）

| 字段 | 说明 | 现有对应 |
|------|------|----------|
| 链接 URL | 不填则点击开弹窗，填则跳转 | promoLink |
| 测试链接 | 按钮：新开页验证 | 新增 |

### 5）Layout（布局与样式）

| 字段 | 说明 | 现有对应 |
|------|------|----------|
| 卡片样式/列表风格 | 经典/图卡/紧凑 | promotionPattern |
| 字体风格 | 默认/加粗 | promotionFontPreset |
| 列数 | 每行几张卡片 | vividPromoCardConfig.columns |
| 显示百分比/副标题/T&C | 开关 | vividPromoCardConfig |

- 这些若在 Front Cover，应迁到 Promotion Center 的 Layout，避免改活动样式要去站点设置。

### 6）Preview & Publish（预览与发布）

- 桌面预览、手机预览、发布状态、最后更新时间
- 保存后在本页预览，无需切前台

---

## 二、与现有数据/接口对应

- List：Promotions CRUD、isActive、sortOrder、startAt、endAt
- Content：title, subtitle, detailHtml, detailJson, ctaLabel, ctaUrl, popupTextBelow, ruleJson.display
- Media：coverUrl, coverUrlMobilePromo, popupCoverUrl
- Link：promoLink
- Layout：theme 中 vividPromoCardConfig、promotionPattern、promotionFontPreset

---

## 三、统一交互

- 保存：统一 Save Changes + 成功/失败提示；关键页可加未保存离开提示
- 预览：在 Promotion Center 内提供桌面/手机预览
- 校验：必填项（通用卡片图、活动名称）保存前校验

---

*文档版本：v1 | 用途：Promotion Center 详细字段与页面结构*

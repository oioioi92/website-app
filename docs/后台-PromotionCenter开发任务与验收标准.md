# Promotion Center · 开发任务与验收标准（完整版）

> 可排期、可验收、可联调。含 4 条实现细节锁定、页类型表、首版范围与不做项、公共规范、6 页开发任务及 QA 验收表。

---

## 一、实现细节锁定（开发前必读）

### 1.1 页类型与 promotionId

| 页面 | 类型 | 是否需要 promotionId | 数据归属 |
|------|------|----------------------|----------|
| List | 列表页 | 否 | Promotion |
| Content | 全局页 | 否 | Theme / uiText |
| Media | 单活动页 | 是 | Promotion |
| Links | 单活动页 | 是 | Promotion |
| Layout | 全局页 | 否 | Theme |
| Preview | 单活动页 | 是 | Promotion + Theme |

**List 行内操作（不要放 Content）**  
Content 是全局文案页，若在 List 每行放「Content」会让人误以为「每个活动都有自己的 Content」。  
行内操作只保留：**Media、Links、Preview、启用/停用、排序（上移/下移）、编辑活动**。  
**Content、Layout** 只放在页面顶部「本组导航」里，不放在表格行操作里。

---

### 1.2 promotionId 传递方式（统一用 query）

第一版统一用 **query**，不改动态路由：

- `/admin/settings/promotions/media?promotionId=xxx`
- `/admin/settings/promotions/links?promotionId=xxx`
- `/admin/settings/promotions/preview?promotionId=xxx`

**规则**：

- 无 `promotionId` → 显示引导态（如「请从列表选择活动」+ 链到 List）。
- 有 `promotionId` 但接口返回 404 → 显示 not found，可提供返回 List。
- 有 `promotionId` 且查到 → 页面头展示活动名称 / id / 状态。

---

### 1.3 Links 页存储（首版方案 A）

当前只存 **`Promotion.promoLink`**，不改 schema：

- **Link Type**：由前端根据 `promoLink` 推断（空 → None，`/` 开头 → Internal，否则 External）。
- **Link URL**：读写 `promoLink`。
- **Open in new tab**：首版**不做持久化**，不开放该开关，避免为一个小开关改全链路。

若后续要持久化，再采用方案 B：增加 `promoLinkType`、`promoLinkTargetBlank` 等字段。

---

### 1.4 Media 回退规则（写死）

**展示**：

- 桌面首页：有 `coverUrlDesktopHome` 则用，否则回退 **`coverUrl`**。
- 手机端与卡片：统一用 **`coverUrl`**。

**保存**：

- `coverUrl` **必填**。
- `coverUrlDesktopHome` **可空**。
- 删除桌面图后，存空；预览与前台自动回退到通用图 `coverUrl`。

---

## 二、首版范围与不做项

### 首版就做

- List  
- Content  
- Media  
- Links  

### 首版暂不做

- 拖拽排序（用上移/下移 + 排序值即可）
- Open in new tab 持久化
- 复杂发布流（Draft/Publish 等）
- 动态路由重构（promotionId 用 query）

### 公共规范（全站统一）

- 统一 Shell（SettingsPageShell）
- 统一 Toast（成功/失败）
- 统一 Empty / Error / Loading
- 统一 promotionId 处理（见 1.2）

---

## 三、公共能力（所有子页）

- **Save / Cancel**、保存中状态、成功/错误 toast。  
- **本组导航**：List / Content / Media / Links / Layout / Preview（来自 SETTINGS_NAV）。  
- **单活动页**：有 promotionId 时页头展示活动名称、id、状态；无 id 时引导去 List。

---

## 四、Ticket 1：Promotion List 页

**路由**：`/admin/settings/promotions/list`

### 开发任务

| # | 任务 | 说明 |
|---|------|------|
| L1 | 接 GET /api/admin/promotions | 分页参数 page、pageSize；不传 active 时返回全部。 |
| L2 | 表格 | 列：标题、状态、排序、更新时间；标题可点进编辑。 |
| L3 | 启停 | 每行启用/停用，PUT promotions/[id] 只更新 isActive。 |
| L4 | 排序 | 上移/下移，PATCH promotions/[id]/reorder，body: { direction: "up" \| "down" }。 |
| L5 | 行内操作 | **仅**：Media、Links、Preview、启停、排序、编辑活动；**不**放 Content。 |
| L6 | 空状态 / Loading / Error | 无数据引导；加载与失败态明确。 |
| L7 | 本组导航 | 顶部或侧边：Content、Media、Links、Layout、Preview（Content/Layout 仅在此出现）。 |

### 验收标准

| 验收项 | 通过标准 |
|--------|----------|
| 列表 | 能看到所有活动，列正确。 |
| 启停 | 切换后刷新或乐观更新状态正确。 |
| 排序 | 上移/下移生效，首/末行按钮正确禁用。 |
| 进 Media/Links/Preview | 带 promotionId query，进入后为对应活动。 |
| 空列表 / Loading / Error | 不报错，有引导与状态。 |

### QA 特殊用例：List 排序后一致性

- 有分页或未来有搜索时，上移/下移后刷新：顺序与状态保持正确，不乱序。

---

## 五、Ticket 2：Promotion Content 页（全局）

**路由**：`/admin/settings/promotions/content`  
**类型**：全局页，不依赖 promotionId。

### 开发任务

| # | 任务 | 说明 |
|---|------|------|
| C1 | 复用 PromotionSettingsClient | 已用 Theme + uiText，保持 GET/PUT /api/admin/theme。 |
| C2 | 统一壳子 | 用 SettingsPageShell，面包屑：Settings > Promotion Center > Content。 |
| C3 | 字段分组 | Modal 风格；查看全部优惠；立即领取；关闭；无内容文案（与现有 PROMO_UI_KEYS 一致）。 |
| C4 | Save / Cancel / Toast | 与其他 Settings 子页一致。 |
| C5 | 必填与长度 | 若存在必填项，标注并校验；文案长度限制（如 200 字）。 |
| C6 | 本组导航 | 提供 List / Media / Links / Layout / Preview；不展示「当前活动」区块。 |

### 验收标准

| 验收项 | 通过标准 |
|--------|----------|
| 功能无丢失 | 原弹窗文案设置均可编辑并保存。 |
| 新入口可用 | 从 Promotion Center 进入 Content 可正常保存。 |
| 前台生效 | 修改后前台弹窗文案正确展示。 |
| 风格一致 | 与其它 Settings 子页 Shell/按钮/Toast 一致。 |

---

## 六、Ticket 3：Promotion Media 页（单活动）

**路由**：`/admin/settings/promotions/media?promotionId=xxx`

### 开发任务

| # | 任务 | 说明 |
|---|------|------|
| M1 | promotionId 上下文 | 读 query；无则引导去 List；有则 GET promotions/[id]，页头展示活动名称/id/状态。 |
| M2 | 通用卡片图（必填） | 对应 coverUrl；上传 + URL 备用；缩略图。 |
| M3 | 桌面主图（可选） | 对应 coverUrlDesktopHome；可空；删除后回退规则见 1.4。 |
| M4 | 上传/替换/删除 | 上传用 POST /api/admin/upload/image；删除前确认。 |
| M5 | 尺寸提示与校验 | 建议尺寸文案；可选尺寸 warning，不拦保存。 |
| M6 | 保存 | PUT promotions/[id]，更新 coverUrl、coverUrlDesktopHome；通用图为空时前端拦截并提示。 |

### 验收标准

| 验收项 | 通过标准 |
|--------|----------|
| 通用图必填 | 不填无法保存，有提示。 |
| 桌面图可选 | 可空；前台桌面图空时回退 coverUrl。 |
| 上传/替换/删除 | 行为符合 1.4 回退规则。 |
| 无 promotionId | 引导去 List，不报错。 |

### QA 特殊用例：Media 未保存离开

- 上传新图未点保存，跳转 Links 或关闭页：应有未保存提醒（可选）；离开后临时缩略图丢弃；再次进入仍为旧值。

---

## 七、Ticket 4：Promotion Links 页（单活动）

**路由**：`/admin/settings/promotions/links?promotionId=xxx`

### 开发任务

| # | 任务 | 说明 |
|---|------|------|
| K1 | promotionId 上下文 | 同 Media；无 id 引导，有 id 拉单条并展示名称。 |
| K2 | Link Type | 由 promoLink 推断：空→None，`/` 开头→Internal，否则→External；仅展示或用于校验，不单独存。 |
| K3 | Link URL | 单行输入，读写 promoLink。None 时可为空。 |
| K4 | 校验 | None：可空。Internal：非空且为站内路径格式。External：非空且为合法 http(s) URL。 |
| K5 | Test Link | 新开 tab 打开当前 URL（内部路径用 origin + path）。 |
| K6 | 保存 | PUT promotions/[id]，只更新 promoLink。 |
| K7 | 首版不做 | Open in new tab 不持久化、不开放。 |

### 验收标准

| 验收项 | 通过标准 |
|--------|----------|
| Link 为空 | 可保存，不报错。 |
| Internal/External 校验 | 非法格式不能保存，有报错。 |
| Test Link | 新开 tab 打开正确地址。 |
| 前台一致 | 点击行为与配置一致。 |

### QA 特殊用例：Links 切换类型时的清理逻辑

- 从 External 切到 None、或 Internal 切到 External：旧错误提示清除；建议切到 None 时清空 URL，切换类型时保留原值但只校验当前类型。

---

## 八、Ticket 5：Promotion Layout 页（全局）

**路由**：`/admin/settings/promotions/layout`  
**类型**：全局页，不依赖 promotionId。数据仍写 **Theme**。

### 开发任务

| # | 任务 | 说明 |
|---|------|------|
| G1 | 从 Theme 迁入 | promotionPattern、promotionFontPreset、vividPromoCardConfig（imgHeight、columns、showPercent、showSubtitle、showTnc）。 |
| G2 | 表单 | 列表风格、字体预设、卡片高度(80–600)、列数(2|3)、三个开关。 |
| G3 | 保存 | PUT /api/admin/theme，只提交上述键，其余合并保留。 |
| G4 | 说明 | 页内注明「全局 Promotion 展示设置」。 |
| G5 | 本组导航 | 同其他页。 |

### 验收标准

| 验收项 | 通过标准 |
|--------|----------|
| 样式不丢 | 原有展示设置均可改并保存。 |
| 从 Layout 修改 | 前台样式同步生效。 |
| 高度范围 | 80–600 校验有效，超出不能提交。 |

---

## 九、Ticket 6：Promotion Preview 页（单活动）

**路由**：`/admin/settings/promotions/preview?promotionId=xxx`

### 开发任务

| # | 任务 | 说明 |
|---|------|------|
| P1 | promotionId 上下文 | 无 id 引导；有 id 拉单条 + theme，页头展示活动名称/状态。 |
| P2 | 只读展示 | 当前活动标题、使用图片(通用/桌面)、CTA、Link 状态、布局参数、最后更新时间。 |
| P3 | Desktop / Mobile 切换 | 两个预览入口或 tab，区分桌面/手机视觉。 |
| P4 | 可选「选择活动」 | 下拉或从 List 带 id；无活动时空状态说明。 |

### 验收标准

| 验收项 | 通过标准 |
|--------|----------|
| 不改数据可预览 | 只读展示与当前活动一致。 |
| 桌面/手机 | 两种预览均能正常渲染。 |
| 无活动 | 空状态说明，不报错。 |

---

## 十、现有 API 速查

| 能力 | 方法 | 路径 |
|------|------|------|
| 列表 | GET | /api/admin/promotions?page=&pageSize= |
| 单条 | GET | /api/admin/promotions/[id] |
| 更新 | PUT | /api/admin/promotions/[id] |
| 上移/下移 | PATCH | /api/admin/promotions/[id]/reorder，body: { direction: "up" \| "down" } |
| Theme | GET/PUT | /api/admin/theme |
| 上传 | POST | /api/admin/upload/image |

---

## 十一、Sprint 建议

- **Sprint 1**：List → Content → Media → Links（首版交付）。  
- **Sprint 2**：Layout → Preview（完善体验）。

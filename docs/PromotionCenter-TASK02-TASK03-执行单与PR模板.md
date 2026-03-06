# Promotion Center · TASK-02 Media + TASK-03 Links 执行单与 PR 模板

> 精确对齐本仓库 API/字段/上传接口。可直接发给 Cursor 执行；PR 需按文末模板填写并附截图。

---

## 强制约束（Cursor 必须遵守）

- Media/Links 页 **必须** 用 `GET /api/admin/promotions/{id}` 拉取上下文（title / id / isActive）。
- 保存 **必须** 用 `PUT /api/admin/promotions/{id}` 且只传本页字段：
  - **Media**：`{ coverUrl, coverUrlDesktopHome }`
  - **Links**：`{ promoLink }`
- 上传 **必须** 用 `POST /api/admin/upload/image`，FormData 字段名 **`file`**。
- **不允许**：新增 schema 字段、改为 path 路由（如 `/promotions/[id]/media`）、做 Open in new tab 持久化。

---

## 一、上传接口（Media 页必用）

**路径**：`POST /api/admin/upload/image`

| 项 | 说明 |
|----|------|
| **请求** | `FormData`，字段名 **`file`**（不是 `image`） |
| **类型** | 仅允许 `image/jpeg` / `image/png` / `image/webp` / `image/gif` |
| **大小** | 最大 5MB |
| **成功响应** | `{ ok: true, url: "/uploads/promos/{filename}", filename, size }` |
| **写入 Promotion** | 成功后将 **`json.url`** 赋给 `coverUrl` 或 `coverUrlDesktopHome`，再 PUT 保存 |

**错误码**：`UNAUTHORIZED` / `NO_FILE` / `INVALID_TYPE` / `FILE_TOO_LARGE`（含 `maxMB: 5`）/ `INVALID_FORM`。前端可复用 `PromotionEditFormLines.tsx` 里 `PhotoUploadRow` 的报错文案逻辑（或抽成共用组件）。

**现有可复用**：`components/admin/PromotionEditFormLines.tsx` 中的 `PhotoUploadRow` 已实现「URL 输入 + 上传按钮 + 预览 + 清空」；Media 页可复用或抽成 `components/admin/PhotoUploadField.tsx` 供 Media/Links 以外页使用。

---

## 二、TASK-02：Promotion Media（精确到本仓库）

### 路由
`/admin/settings/promotions/media?promotionId=xxx`

### 数据源
- **读**：`GET /api/admin/promotions/{promotionId}`（path 为 id，从 query 取 promotionId 拼进去）
- **写**：`PUT /api/admin/promotions/{promotionId}`，body **只传** `{ coverUrl, coverUrlDesktopHome }`（局部更新）

### 使用字段
- **上下文**：`id`, `title`, `isActive`（页头展示）
- **编辑**：`coverUrl`（必填）、`coverUrlDesktopHome`（可选）

### promotionId 处理（必须一致）
- **无 promotionId**：显示引导 + “Back to List” → `/admin/settings/promotions/list`
- **有 promotionId 但 GET 404**：Not Found + Back to List
- **有 promotionId 且成功**：页头显示 `title / id / status`

### 表单字段（首版）
- **Universal Card Image**：绑定 `coverUrl`，**必填**
- **Desktop Hero Image**：绑定 `coverUrlDesktopHome`，**可选**
- 删除桌面图：PUT 时传 `coverUrlDesktopHome: null`（或 `""`，后端会存 null）

### 上传逻辑（对齐本仓库）
- 调用 `POST /api/admin/upload/image`，FormData 字段名为 **`file`**
- 成功：取 `json.url` 写入当前编辑字段（`coverUrl` 或 `coverUrlDesktopHome`）
- 失败：根据 `json.error` 展示（INVALID_TYPE / FILE_TOO_LARGE / UNAUTHORIZED 等），与现有 PhotoUploadRow 一致
- 首版可「URL 输入 + 上传按钮」并存；已有 `PhotoUploadRow` 可复用或抽成共用组件

### 保存
- PUT body 只传 `{ coverUrl, coverUrlDesktopHome }`；`coverUrl` 为空时禁止提交并提示
- 成功/失败：toast

### 回退规则（写死）
- **桌面**：`coverUrlDesktopHome ?? coverUrl`
- **手机/卡片**：一律 `coverUrl`

### 验收线
- `MEDIA_REQUIRED_OK`：coverUrl 为空不能保存
- `MEDIA_SAVE_OK`：保存后刷新仍为新图
- `MEDIA_DELETE_DESKTOP_OK`：删除桌面图后，桌面回退为 coverUrl
- `MEDIA_NO_ID_GUIDE_OK`：无 promotionId 时显示引导，不 404

---

## 三、TASK-03：Promotion Links（精确到本仓库）

### 路由
`/admin/settings/promotions/links?promotionId=xxx`

### 数据源
- **读**：`GET /api/admin/promotions/{promotionId}`
- **写**：`PUT /api/admin/promotions/{promotionId}`，body **只传** `{ promoLink: string | null }`

### 使用字段
- **上下文**：`id`, `title`, `isActive`
- **编辑**：`promoLink`（string | null）

### Link Type（前端推断，方案 A）
- `promoLink` 空/null → **None**
- `promoLink` 以 `/` 开头 → **Internal**
- 否则 → **External**

### 校验规则（首版）
- **None**：允许 `promoLink === null` 或 `""`
- **Internal**：非空且 `promoLink.startsWith("/")`
- **External**：非空且为合法 `http://` 或 `https://`（用 `new URL(promoLink)` 或正则校验）

### 保存
- PUT body 只传 `{ promoLink: string | null }`
- None 时传 null；Internal/External 校验不通过则禁止保存并提示
- 成功/失败：toast

### Test Link
- None：按钮 disabled
- Internal / External：`window.open(promoLink, "_blank")`（注意 Internal 需用当前 origin 拼完整 URL 或直接打开相对路径，视你们前台 base 而定）

### 验收线
- `LINK_EMPTY_OK`：promoLink 为空可保存（None）
- `LINK_VALIDATE_OK`：Internal/External 非法时禁止保存并提示
- `LINK_TEST_OK`：Test Link 能打开目标
- `LINK_SAVE_OK`：保存后刷新仍保留
- `LINK_NO_ID_GUIDE_OK`：无 promotionId 时显示引导，不 404

---

## 四、建议代码落点（与 List 一致）

| 类型 | Media | Links |
|------|--------|--------|
| **路由页** | `app/admin/(secure)/settings/promotions/media/page.tsx` | `app/admin/(secure)/settings/promotions/links/page.tsx` |
| **职责** | SettingsPageShell + 引入 Client | 同左 |
| **Client 组件** | `components/admin/PromotionMediaSettingsClient.tsx` | `components/admin/PromotionLinksSettingsClient.tsx` |
| **职责** | searchParams.promotionId → GET → 表单 → PUT → toast | 同左 |

---

## 五、PR 模板（Media + Links）

复制以下内容作为 PR description，并勾选/补充截图：

```md
## Scope
Implement Promotion Center:
- **Media** page: `/admin/settings/promotions/media?promotionId=...`
- **Links** page: `/admin/settings/promotions/links?promotionId=...`

## API Used
- `GET /api/admin/promotions/{id}`
- `PUT /api/admin/promotions/{id}` (partial update)
- `POST /api/admin/upload/image` (Media: FormData field `file`, response `{ ok, url, filename, size }`)

## Files Changed
- [ ] `app/admin/(secure)/settings/promotions/media/page.tsx`
- [ ] `app/admin/(secure)/settings/promotions/links/page.tsx`
- [ ] `components/admin/PromotionMediaSettingsClient.tsx`
- [ ] `components/admin/PromotionLinksSettingsClient.tsx`
- [ ] （若有）共享上传组件或工具

## Acceptance Checklist
**Media**
- [ ] MEDIA_REQUIRED_OK: coverUrl 为空不能保存
- [ ] MEDIA_SAVE_OK: 保存后刷新仍为新图
- [ ] MEDIA_DELETE_DESKTOP_OK: 删除桌面图后桌面回退 coverUrl
- [ ] MEDIA_NO_ID_GUIDE_OK: 无 promotionId 时有引导，不 404

**Links**
- [ ] LINK_EMPTY_OK: promoLink 为空可保存（None）
- [ ] LINK_VALIDATE_OK: Internal/External 非法不能保存并提示
- [ ] LINK_TEST_OK: Test Link 能打开目标
- [ ] LINK_SAVE_OK: 保存后刷新仍保留
- [ ] LINK_NO_ID_GUIDE_OK: 无 promotionId 时有引导，不 404

## Screenshots
- [ ] Media 页：带 promotionId + 缩略图/上传
- [ ] Links 页：带 promotionId + 校验提示或 Test Link
```

---

## 六、最快推进顺序（建议）

1. **Media**：GET + 表单（URL + 上传，复用或仿 PhotoUploadRow）+ PUT 只传 `coverUrl`/`coverUrlDesktopHome` + toast。
2. **Links**：GET + Link Type 推断 + 校验 + PUT 只传 `promoLink` + Test Link + toast。
3. 再视需要优化：缩略图样式、尺寸提示、抽共用上传组件等。

---

## 七、一键验收清单（约 3 分钟）

按顺序操作，打勾表示通过。

### Media 页

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 打开 `/admin/settings/promotions/media`（无 query） | 显示「请从 List 选择活动」+ Back to List，不 404 |
| 2 | 打开 `/admin/settings/promotions/media?promotionId=invalid-id` | 显示 Not found + Back to List |
| 3 | 从 List 点某活动的 Media | URL 为 `...?promotionId=xxx`，页头显示该活动 Title / ID / Active 或 Inactive |
| 4 | 上传通用图并保存 | 成功 toast；刷新后仍为该图 |
| 5 | 不填通用图点保存 | 禁止保存并提示 |
| 6 | 填桌面图后保存，再清空桌面图保存 | 桌面回退为通用图（或前台/预览符合回退规则） |

### Links 页

| 步骤 | 操作 | 预期 |
|------|------|------|
| 1 | 打开 `/admin/settings/promotions/links`（无 query） | 显示引导 + Back to List，不 404 |
| 2 | 从 List 点某活动的 Links | 页头显示该活动 Title / ID / Status |
| 3 | Link Type 选 None，URL 留空，保存 | 可保存；刷新后仍为空 |
| 4 | 选 Internal，URL 填 `invalid`，保存 | 禁止保存并提示 |
| 5 | 选 Internal，URL 填 `/promotion`，保存 | 可保存 |
| 6 | 点 Test Link | 新窗口打开对应地址 |
| 7 | 选 External，URL 填 `http://example.com`，保存 | 可保存；刷新后仍保留 |

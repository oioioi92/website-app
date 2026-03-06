# TASK-02 Media + TASK-03 Links 执行单与 PR 模板（对齐本仓库）

## 1. 上传接口（Media 必用）

- **POST /api/admin/upload/image**
- **请求**：FormData 字段名 **`file`**
- **类型**：image/jpeg, image/png, image/webp, image/gif；最大 5MB
- **成功**：`{ ok: true, url: "/uploads/promos/xxx", filename, size }` → 将 `json.url` 赋给 `coverUrl` 或 `coverUrlDesktopHome`
- **错误**：UNAUTHORIZED / NO_FILE / INVALID_TYPE / FILE_TOO_LARGE / INVALID_FORM
- 可复用 `PromotionEditFormLines.tsx` 内 PhotoUploadRow 的上传与报错逻辑

## 2. TASK-02 Media

- **路由**：`/admin/settings/promotions/media?promotionId=xxx`
- **读**：GET `/api/admin/promotions/{promotionId}`；**写**：PUT 同路径，body 只传 `{ coverUrl, coverUrlDesktopHome }`
- **字段**：coverUrl（必填）、coverUrlDesktopHome（可选）；无 id → 引导回 List；404 → Not Found + Back to List
- **删除桌面图**：PUT `coverUrlDesktopHome: null`
- **回退**：桌面用 coverUrlDesktopHome ?? coverUrl；手机/卡片用 coverUrl
- **验收**：MEDIA_REQUIRED_OK / MEDIA_SAVE_OK / MEDIA_DELETE_DESKTOP_OK / MEDIA_NO_ID_GUIDE_OK

## 3. TASK-03 Links

- **路由**：`/admin/settings/promotions/links?promotionId=xxx`
- **读**：GET `/api/admin/promotions/{promotionId}`；**写**：PUT 同路径，body 只传 `{ promoLink: string | null }`
- **Link Type 推断**：空→None，`/` 开头→Internal，否则→External
- **校验**：None 可空；Internal 须 `startsWith("/")`；External 须 http(s)
- **Test Link**：None 禁用；有值则 `window.open(promoLink, "_blank")`
- **验收**：LINK_EMPTY_OK / LINK_VALIDATE_OK / LINK_TEST_OK / LINK_SAVE_OK / LINK_NO_ID_GUIDE_OK

## 4. 代码落点

- 页面：`app/admin/(secure)/settings/promotions/media/page.tsx`、`links/page.tsx`（SettingsPageShell + Client）
- 组件：`PromotionMediaSettingsClient.tsx`、`PromotionLinksSettingsClient.tsx`

## 5. PR 模板

Scope: Media + Links 页。API: GET/PUT promotions/{id}；POST upload/image (file)。Files: 上述 4 个。Checklist: 上文验收线。Screenshots: Media 带 promotionId+缩略图；Links 带 promotionId+校验或 Test Link。

# 后台：新建 / 修改 Promotion（优惠活动）

## 入口

- 侧栏 **CONTENT** → **Promotions**（或直接访问 `http://localhost:3000/admin/promotions`）
- 该页即「优惠活动」列表，对应接口 `GET /api/admin/promotions` 返回的 `items`

## 新建优惠

1. 在优惠活动列表页点击左上角蓝色按钮 **「新建优惠」**
2. 进入 `/admin/promotions/new`，填写表单：
   - **必填**：标题
   - 选填：副标题、封面图 URL、百分比、详情 JSON、时间范围、规则（流水/次数/发放方式）、展示设置等
3. 点击 **「创建」** → 调用 `POST /api/admin/promotions`，成功后自动跳转到该条的编辑页

## 修改优惠

1. 在优惠活动列表页找到对应一行，点击右侧 **「编辑」**
2. 进入 `/admin/promotions/{id}/edit`，修改任意字段
3. 点击 **「保存」** → 调用 `PUT /api/admin/promotions/{id}`

## API 与数据结构（与你截图一致）

- **列表**：`GET /api/admin/promotions`  
  返回 `{ items: [...], total, page, pageSize }`，每条含 `id, title, subtitle, coverUrl, ctaLabel, ctaUrl, isActive, sortOrder, createdAt`
- **单条（编辑用）**：`GET /api/admin/promotions/{id}`  
  返回完整字段（含 `detailJson, percent, startAt, endAt, ruleJson` 等）
- **新建**：`POST /api/admin/promotions`，body 与 PUT 相同，至少传 `title`
- **更新**：`PUT /api/admin/promotions/{id}`，body 为要更新的字段

## 侧栏说明

- 侧栏里的 **REPORT → Bonus** 是「Bonus 报表」（领取/成本等），不是配置优惠内容
- 配置优惠内容、新建/修改活动，请用 **CONTENT → Promotions**

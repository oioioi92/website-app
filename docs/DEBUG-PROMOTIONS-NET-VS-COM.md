# 为什么 admin1167.com 显示 “No promotions” —— 2 分钟定位

## 本项目实际架构（重要）

- **admin1167.net** 和 **admin1167.com** 用的是**同一套 Next 应用**（同一份代码）。
- 前台**不**会去请求 admin1167.net 的 API；首页和 `/bonus` 的数据是**服务端直接查数据库**（`getActivePromotionsForUi()`）。
- 所以：**没有**「前台 fetch 到 .net」的请求，也**不需要**做「前台代理到 CMS」；要的是**两边连同一个数据库**。

---

## 为什么 Network 里可能“找不到 promotion 请求”？

- `/bonus` 和首页都是 **服务端渲染（SSR）**：活动数据在**第一次请求页面时**就在服务器上查库并打进 HTML。
- 浏览器只会看到对 `admin1167.com/bonus`（或 `/`）的**一个文档请求**，不会再有单独的「拉 promotions」的 XHR/fetch。
- 所以：在 Network 里过滤 promo/promotion，**没有单独一条请求是正常的**；数据已经包含在页面请求的响应里。

---

## 2 分钟定位：用现有 API 看“这台机器拿到的数据”

在浏览器里直接打开（或 F12 → Network 里看这个请求）：

**URL：** `https://admin1167.com/api/public/home`

看三样（不用截图，复制文字即可）：

1. **Status code**：200 / 503 / 其他？
2. **Response 里的 `promotions`**：是 `[]` 还是有一条/多条？
3. **Response 里有没有 `HOME_OK`**：有的话说明接口正常跑完。

| 结果 | 含义 | 下一步 |
|------|------|--------|
| 200，`promotions: []` | 这台服务器连的数据库里没有活动，或和 .net 不是同一个库 | 核对 .net 与 .com 的 `DATABASE_URL` 是否一致 |
| 200，`promotions: [{...}, ...]` | 这台服务器能拿到活动数据 | 问题在页面渲染或缓存，可强刷 / 清 CDN |
| 503 / 报错 | 接口/数据库异常 | 看这台服务器上的应用日志（PM2/Node 报错） |

---

## 对症修复（对应你这套代码）

### 情况 B：200 但 `promotions` 是空数组

- **原因**：admin1167.com 所在环境连的数据库，和你在 admin1167.net 写活动的数据库**不是同一个**（例如 .net 连 staging，.com 连 production）。
- **修复**：  
  - 确保两个域名对应的部署用**同一个** `DATABASE_URL`（同一台机同一进程则天然同一库；两台机则两边的 `.env` 里 `DATABASE_URL` 必须完全一致）。

### 若确认已是同一库，仍为空

- 本项目中 `getActivePromotions` **已不按 isActive 过滤**，会返回所有活动。
- 若仍为空：在**后台所在那台机**上查库确认是否有数据，例如：
  ```bash
  # 用你项目里的 Prisma / 数据库客户端
  # SELECT id, title, "isActive" FROM promotion LIMIT 5;
  ```

### 不需要做的事

- **不需要**在 admin1167.com 做「请求 admin1167.net 的 API 再代理」：当前设计就是服务端直连数据库，.net 和 .com 只要连同一库就会一致。
- **不需要**在浏览器里找「promotion 的请求」：SSR 没有单独那条请求，用上面的 `/api/public/home` 即可判断数据是否为空。

---

## 给你 2 个信息即可精准判断

请直接回复这两项（复制粘贴即可）：

1. 打开 **https://admin1167.com/api/public/home** 的 **Status code**（如 200）。
2. Response 里 **`promotions`** 是 **空数组 `[]`** 还是 **有内容**（可贴前一条的 `id`/`title` 或说“有 N 条”）。

有这两点就能判断是「不同库」还是「同库但渲染/缓存」并给出最短修改路径。

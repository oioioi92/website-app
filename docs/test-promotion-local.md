# 本地测试 Promotion 设置与预览

## 1. 环境准备

### 数据库（二选一）

**方式 A：SQLite（零依赖，适合本机快速测）**

- 在项目根目录建 `.env`，至少包含：
  ```env
  DATABASE_URL="file:./dev.db"
  SESSION_SECRET="dev-session-secret"
  CSRF_SECRET="dev-csrf-secret"
  ```
- 生成客户端并推表结构：
  ```bash
  npm run prisma:generate:sqlite
  npm run migrate:sqlite
  ```

**方式 B：PostgreSQL**

- `.env` 里设 `DATABASE_URL="postgresql://user:pass@localhost:5432/website"`
- 执行：
  ```bash
  npm run prisma:generate
  npm run prisma:migrate
  ```

### 管理员账号

- 若还没有 admin 用户，执行：
  ```bash
  npm run seed:admin
  ```
- 默认账号见 `.env` 中的 `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`（或脚本输出）。

---

## 2. 启动本地服务

```bash
npm run dev
```

- 只跑网站（不跑 chat）可改用：`npm run dev:main`
- 浏览器打开：**http://localhost:3000**

---

## 3. 测试 Promotion 设置与预览

1. **登录后台**  
   - 打开 http://localhost:3000/admin/login  
   - 用上面 admin 账号登录。

2. **进入优惠管理**  
   - 侧栏点 **Promotions**（或 **CONTENT** → Promotions）  
   - 或直接打开：http://localhost:3000/admin/promotions  

3. **新建或编辑一条优惠**  
   - 点「新建优惠」→ 进入编辑页；或点某条的「编辑」。  
   - **基础与展示**：填标题（必填），选「详情类型」= **HTML**。  
   - 在「详情 HTML」里写内容，或点「插入模板」选「两栏表+警告框」等。  
   - 可改「容器字体」、「容器自定义 class」。  

4. **看弹窗预览**  
   - 在「详情 HTML」下方有 **「弹窗预览（当前 HTML 效果）」**。  
   - 改 HTML 或容器字体/class 后，预览会按当前内容刷新，可直接看表格、警告框、字体是否美观。  

5. **保存**  
   - 点顶部「保存」。  
   - 若失败，看页面红色错误提示（如「未登录或已过期」「请填写标题」）；或 F12 → Network 看对应请求的 status 和 response。  

6. **前台看实际效果**  
   - 打开 http://localhost:3000/promotion  
   - 点你刚编辑的那条优惠，弹窗内容应与后台预览一致（同一套容器和 HTML）。  
   - 编辑页里也有「在新标签页打开前台查看」链接，可直接从后台跳过去。

---

## 4. 常见问题

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| 保存提示「未登录或已过期」 | 未登录或 session 失效 | 重新打开 /admin/login 登录后再保存 |
| 保存 500 或报错 | 数据库未初始化或连接失败 | 检查 `.env` 的 `DATABASE_URL`，并执行对应的 migrate |
| 预览区空白 | 详情类型不是 HTML，或详情 HTML 为空 | 选「详情类型 = HTML」并填一些 HTML |
| 列表/编辑页 404 | 路由或构建问题 | 确认 `npm run dev` 无报错，再刷新页面 |

---

## 5. 只测前端 E2E（可选）

```bash
npm run test:e2e
```

会跑自动化脚本（如打开前台/后台、登录等），具体见 `scripts/smoke-e2e-browser.ts`。

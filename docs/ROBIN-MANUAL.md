# Robin 操作手册（口语版）

这份手册是给 Robin 的，一次跑通内部测试流程，用 5 分钟确认系统能用。

## 0) 开始前先确认

你要做什么：

- 在项目根目录打开 PowerShell。
- 确认 `.env` 里有 `INTERNAL_TEST_MODE="1"`。

你会看到什么：

- 如果已开启，后面前台 claim 接口不会 404。

不对怎么办：

- 如果没开，去 `.env` 改成 `INTERNAL_TEST_MODE="1"`，然后重启开发服务。

## 1) 启动系统

你要点哪里：

- PowerShell 执行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev-sqlite.ps1
```

你会看到什么：

- 终端最后会进入 dev server，通常是 `http://localhost:3000`。

不对怎么办：

- 端口占用：关掉旧的 Node 进程再重试。
- 启动失败：先执行 `npm install`，再重新跑脚本。

### 截图位置占位：启动成功终端画面

## 2) 登录后台

你要点哪里：

- 浏览器打开：`http://localhost:3000/admin/login`
- 账号：`admin@example.com`
- 密码：`change_me_123`

你会看到什么：

- 登录后进入后台首页（Dashboard）。

不对怎么办：

- 登录失败：执行 `npm run seed:admin` 后再试。
- 页面空白：确认 dev server 还在运行。

### 截图位置占位：后台登录页 + 登录后 Dashboard

## 3) 打开 Test Center 并一键灌数据

你要点哪里：

- 打开 `http://localhost:3000/admin/test-center`
- 点击 `Run Seed Test Scenarios`
- 点击 `Refresh Health`

你会看到什么：

- 提示 `Seed done...`
- Health Status 出现绿色/黄色/红色状态灯
- Seed Status 里会看到 promotions/members/providers/sheets 的数量

不对怎么办：

- 按钮没反应：先确认已登录后台（admin）并且 CSRF 正常。
- Health 红灯：点 `Copy Diagnostic`，把 JSON 给开发同学排查。

### 截图位置占位：Test Center（Health + Seed 成功）

## 4) 看 Dashboard（老板总览）

你要点哪里：

- 打开 `http://localhost:3000/admin`

你会看到什么：

- 6 个统计卡（Wallet/Provider IN/OUT/NET）
- 风险概览（阈值、warn/danger）
- Top providers 表格

不对怎么办：

- 数据是 0：回 Test Center 再跑一次 seed。
- 风险区空白：确认已经有 sheet 数据。

### 截图位置占位：Dashboard 总览

## 5) Promotions + 前台 Claim 闭环

你要点哪里：

- 后台 promotions：`/admin/promotions`
- 前台首页：`/`
- 打开一个活动详情，在弹窗里使用 Test Login + Claim

你会看到什么：

- 前台可预览领取结果（Preview）
- Confirm 后显示成功，并产生 claim 记录

不对怎么办：

- 领取接口 404：基本是 `INTERNAL_TEST_MODE` 没开。
- 被挡（BLOCKED）：看 reason 与 nextEligibleAt 是否命中规则限制。

### 截图位置占位：前台活动弹窗 Claim Panel

## 6) 看 Promotion Stats

你要点哪里：

- 后台 `Promotions` 列表里进入某活动的 `Stats`
- 或直接访问 `/admin/promotions/{id}/stats`

你会看到什么：

- 总领取数、总发放、唯一用户
- 按天统计
- Top blocked reasons
- Recent claims

不对怎么办：

- 没数据：先在前台做几次 claim，再刷新 Stats。

### 截图位置占位：Promotion Stats 页面

## 7) 对账与导出

你要点哪里：

- 打开 `/admin/sheets`
- 进入任意 sheet 详情
- 点击 `Export Excel`

你会看到什么：

- 浏览器下载 `reconcile_YYYY-MM-DD.xlsx`
- 文件里有 `Summary` 和 `Lines` 两个工作表

不对怎么办：

- 导出失败：先点 `Recalc` 再导出。
- 没有 sheet：回 Test Center 先 seed。

### 截图位置占位：Sheet 详情 + 导出成功

## 7.5) Live Chat 验收（可选）

若已部署 chat-server 并配置主站 .env（`CHAT_SERVER_INTERNAL_URL`、`CHAT_ADMIN_JWT_SECRET`）：

- 打开 `/admin/chat`，不应出现「Live Chat 服务未连接」；若有访客会话可选中并收发消息。
- 前台首页点右下角 Live 气泡，应能连接并显示 Online。

**上线检查与故障对照**：见 [LIVE-CHAT-上线检查.md](./LIVE-CHAT-上线检查.md)。

## 8) 自检与交接建议

你要点哪里：

- 回到 `/admin/test-center`
- 点击 `Refresh Health` 和 `Copy Diagnostic`
- 在项目根目录执行 `npm run smoke`

你会看到什么：

- 复制到剪贴板的诊断 JSON，可直接贴给开发同学。
- 终端输出：`SMOKE_OK: health=ok dash=ok promoStats=ok sheet=ok export=ok publicClaim=ok`

不对怎么办：

- 复制失败：手动选中页面数据截图，或重试浏览器权限。
- 如果 smoke 报错：先执行 `npm run seed:test`，再重跑 `npm run smoke`。

---

## 5分钟验收清单（打勾）

- [ ] 能登录后台
- [ ] Test Center 能 Seed 成功
- [ ] Health 有状态灯，且可 Copy Diagnostic
- [ ] Dashboard 有统计数据
- [ ] 前台 Claim 可 Preview + Confirm
- [ ] Promotion Stats 有数据
- [ ] Sheets 可导出 Excel
- [ ] （可选）Live Chat：`/admin/chat` 无「服务未连接」、前台气泡可连；详见 [LIVE-CHAT-上线检查.md](./LIVE-CHAT-上线检查.md)

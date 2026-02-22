# Admin UI 重构规范（Porto 高密度风格 / 少行数塞满资料）

> 目标：像 Porto 那种后台：  
> ✅ 菜单少且紧凑（不换行）  
> ✅ 表格占满屏（首屏就看到数据）  
> ✅ filter bar 一行塞完  
> ✅ DataTable 风格：分页/每页条数/导出  
> ✅ 报表入口收敛：Report Center（搜索/收藏）替代 sidebar 长目录

---

## A. 终极目标（必须达成）
1) 1080p 下 Sidebar 尽量不滚动（最多少量滚动），常用入口 <= 15。
2) 首屏必须出现 table，table 占可视高度 >= 70%。
3) 禁止双语两行：Sidebar label 只显示短英文，中文 tooltip。
4) 报表入口不塞满 Sidebar：只保留常用报表 <= 6 + "All Reports…"，其他进 Report Center。

---

## B. Sidebar 固定结构（不允许无限加）
MAIN
- Dashboard

OPS
- Live Chat
- Pending Depo
- Pending With
- Transfer Queue

REPORT（常用 <= 6）
- Daily Sales
- Game Sales
- Bonus
- Bank Tx
- All Reports…

HISTORY
- Transactions（统一流水页：All/Depo/With/Bonus/Transfer/Game）
- Gateway Search
- Reconciliation

USERS（可选）
- Players
- Agents
- Referral Tree

---

## C. UI Token（全局密度参数）
控件高度：30~32px  
Sidebar item：30~34px  
Table：font 13px；padding 6px 10px；行高 30~34px  
Topbar：48px  
Page padding：12px

必须 CSS：
- menu 单行：white-space: nowrap + ellipsis
- table sticky header
- 数字列右对齐（tabular-nums）

---

## D. 页面模板只做 3 个
1) QueuePage：Pending Depo/With/Transfer/Chat（读秒+SLA+动作）
2) TransactionsPage：统一流水页（tabs/preset 切换 txType）
3) ReportTablePage：聚合报表表格页（toolbar 一行 + table 占满 + summary）

Dashboard：
- 取消大卡片浪费空间，改 KPI strip（小块）+ table 为主。

---

## E. Report Center（替代 Sidebar 长目录）
/admin/reports
- 搜索框（winloss/bonus/对账/gateway）
- 分类 tabs：Funds/Game/Bonus/Wallet/Gateway
- cards：title + subtitle
- Pin（收藏）+ Recent（最近使用）

---

## F. 验收标准
1) Sidebar 单行不换行、入口 <= 15  
2) 任意页面首屏看到 table，table 占高度 >= 70%  
3) 控件高度统一 30~32px  
4) 报表通过 Report Center 搜索 2 秒内打开  
5) 不破坏后端：继续使用 {report, columns, rows, summary}

# Cursor TODO（优先级清单）

## P0（必须先跑通：真正可用系统）
1) Manual Create Player（后台代注册）
2) Bank Detail CRUD 持久化 + 前台 Deposit 读取 banks/active
3) OTP 注册/找回：/auth/otp/request + /auth/otp/verify（含限流/过期/错误次数）
4) Cash Deposit：前台上传 receipt → 后台 Pending Queue → approve/reject → ledger 入账 → 前台余额变化
5) Pending Deposit 计时：elapsed + 超时高亮 + operator 审计

## P1（运营体验）
6) Pending badge（sidebar/topbar）+ queue 轮询刷新
7) Deposit/Withdraw/Transfer/Bonus 的统一 Transactions 页面（presets）
8) Report Center（搜索/收藏/最近使用）

## P2（风控/稳定）
9) OTP 健康监控：失败率阈值 + fallback
10) 审计日志页面（按 operator/时间/动作过滤）
11) 导出 CSV（Transactions / Reports）

# 前台 + 后台 + 报表全链路连接需求说明书（V1）

> 目标：把现有“简版后台”升级成**真正可运营**的一套系统：  
> ✅ 前台注册验证（OTP）  
> ✅ 前台入款提交凭证 → 后台审核 → 钱包入账 → 前台显示结果  
> ✅ 后台可手动创建玩家（客服代注册）  
> ✅ 后台 Bank Detail 可维护且**持久化**并展示在前台 Deposit  
> ✅ 每一笔交易/每个队列都有**处理时长计时**，用于监控员工效率  
> ✅ 报表数据与 Ledger 一致，前后台功能全连通

---

## 0. 角色与权限（必须先定）

### 0.1 角色
- Player（前台玩家）
- Staff（客服/运营）
- Supervisor（主管）
- Admin（老板/超级管理员）

### 0.2 核心权限（最少要有）
- 玩家管理：`PLAYER_CREATE_MANUAL`, `PLAYER_VIEW`, `PLAYER_EDIT`
- 银行管理：`BANK_CREATE`, `BANK_EDIT`, `BANK_DISABLE`
- 入款审核：`DEPOSIT_VIEW_PENDING`, `DEPOSIT_APPROVE`, `DEPOSIT_REJECT`
- 提款审核：`WITHDRAW_VIEW_PENDING`, `WITHDRAW_APPROVE`, `WITHDRAW_REJECT`
- 报表查看：`REPORT_VIEW`
- 审计查看：`AUDIT_VIEW`

> 所有敏感动作（Approve/Reject/Manual Create/Bank Edit）必须记录：**operator_id + time + ip + remark**。

---

## 1) 新增功能：后台手动创建玩家（Manual Create Player）

### 1.1 需求原因
有些客户不会自己注册，客服需要**后台帮他注册**。

### 1.2 后台入口
- 菜单：`Players → Create Player`（或 Players list 上方按钮）

### 1.3 字段（最少）
- Name
- Mobile（必须唯一）
- Country Code（MY 默认）
- Referral Code / Agent（可选）
- Status：Active / Suspended
- 创建原因 `created_reason`（必填：例如“客户不会注册，客服代注册”）

### 1.4 安全要求
- 系统生成 username（或用 mobile 作为 login）
- 临时密码 / 或发起“设置密码”流程
- 建议记录：
  - `created_by_admin = true`
  - `manual_created_at`
  - `manual_created_by`

### 1.5 验收
- 手动创建后可在 Player List 查到
- 玩家可在前台正常登录/设置密码
- 审计日志可查：是谁创建、何时、原因

---

## 2) 新增功能：后台 Bank Detail 持久化 + 前台 Deposit 展示

### 2.1 当前问题
创建 bank detail 后**不保留数据**，后台无法长期管理，前台也无法稳定读取。

### 2.2 目标
后台能 CRUD 银行户口，并且**前台 Deposit 页面实时读取**已启用银行列表。

### 2.3 Bank Detail 字段（建议）
- bank_id
- bank_name（Maybank / CIMB…）
- account_name
- account_number
- display_priority（排序）
- status：ACTIVE / DISABLED / MAINTENANCE
- maintenance_message（可选：例如“银行维护中，请使用 CIMB”）
- created_at / updated_at / created_by / updated_by

### 2.4 前台展示规则
- Deposit 页面只展示 status=ACTIVE 的 bank
- MAINTENANCE：
  - 可隐藏或灰色不可点（二选一）
  - 必须显示 maintenance_message

### 2.5 验收
- 后台新增/修改 bank 后，前台 Deposit 页面可见变化
- Bank 关闭后前台不可再选
- 修改都有审计记录

---

## 3) 新增功能：前台注册必须 OTP 验证（SMS / WhatsApp 官方渠道）

> 目的：防止假号码注册，确保手机号真实可用。

### 3.1 注册流程（前台触发 → 后台发送 → 前台验证）
1) 玩家输入手机号（或 WhatsApp 号）
2) 点击 Register
3) 前台调用：`POST /auth/otp/request`（mobile + scene=REGISTER）
4) 后台生成 OTP（6 位），写入 otp_sessions
5) 后台调用 OTP Provider 发送（SMS 或 WhatsApp 官方渠道/服务商）
6) 前台展示 OTP 输入框
7) 前台调用：`POST /auth/otp/verify`
8) 验证成功 → 完成注册/发 token

### 3.2 忘记密码（scene=FORGOT_PASSWORD）
- 独立 scene，流程同上

### 3.3 OTP 风控（最少要有）
- 过期：5 分钟
- 同手机号请求限流：60 秒内最多 1 次
- 错误次数限制：例如 5 次锁定 10 分钟
- 可选：IP/device 限制

### 3.4 OTP 渠道监控（“实时监控上线/被 block”）
系统无法直接知道“被封”，但必须做到：
- 每次发送记录 send_status（SUCCESS/FAILED/PENDING）
- 若 provider 有 delivery report/webhook，接入并更新 delivery_status
- 健康监控：
  - 最近 5 分钟失败率 > 阈值（如 30%）→ 渠道 DEGRADED
  - 自动 fallback：WhatsApp 失败 → SMS（或反向）
- 后台 Settings 提供：
  - 当前渠道状态（OK/DEGRADED/DOWN）
  - 今日发送量/失败量
  - 最近错误原因 TopN

> 注意：不做任何绕过官方 API 的实现。测试环境可用官方 sandbox 或 staging 模式（禁止 production 返回 debug_otp）。

### 3.5 验收
- REGISTER / FORGOT_PASSWORD 必须 OTP 成功才完成
- 发送失败前台提示正确 + 受限流控制
- 后台可查看发送状态/失败率/告警

---

## 4) 新增功能：前台 Cash Deposit（ATM/现金）上传收据 → 后台审核 → 前台到账

### 4.1 前台 Deposit（Cash/ATM）流程
1) 玩家进入 Deposit → 选择 Cash Deposit / ATM Deposit
2) 选择银行账户（从 Bank Detail 列表）
3) 输入金额 Amount
4) 上传收据 Receipt（图片）
5) 提交后：
   - 前台显示 Pending
   - Deposit History 可看到该笔记录
   - Reject 时前台必须显示 reject reason

### 4.2 后台 Pending Deposit Queue（队列/楼梯）
列表必须显示：
- Time/Date（提交时间）
- User ID
- Name / Mobile（可快速识别玩家）
- Amount
- Deposit Source（Cash/ATM + Bank）
- Receipt（缩略图 + 预览/下载）
- Status（Pending）
- Elapsed Time（读秒）
- Action：
  - Approve
  - Reject（Reject 必须填写 Reason/Remark）

Reject 必填：
- Reject 弹窗必须输入 Reason/Remark（必填，建议 >= 5 字）
- Reject 后前台必须显示原因

### 4.3 Approve 后系统动作（必须连通）
Approve 成功后自动完成：
- 写入 ledger_tx（DEPOSIT；sum(lines)=0）
- 玩家 Main Wallet 余额增加
- deposit 单据状态：PENDING → COMPLETED
- 前台刷新后余额变化 & 状态变化
- audit：operator_id / ip / 耗时 / 备注

### 4.4 后台提示/通知（必须至少一种）
- Sidebar / Topbar badge：Pending Deposit 数量
- Pending Deposit 页面轮询刷新（10~15s）
- 可选：声音提醒（可关）

### 4.5 每笔 transaction 计时（防偷懒）
对每条 Pending Deposit 必须记录并展示：
- created_at（玩家提交）
- first_viewed_at（第一个员工打开时间，可选但强烈建议）
- completed_at（approve/reject）
- elapsed_total = completed_at - created_at
- elapsed_work = completed_at - first_viewed_at（可选）
列表显示小计时器并高亮：
- <2min 正常
- 2~5min warning（黄）
- >5min danger（红）

### 4.6 验收
- 玩家提交收据后，后台 Pending Deposit 立刻出现
- 后台可查看收据图
- Approve 后玩家余额增加、单据 Completed
- Reject 后玩家看到原因
- 每笔都有计时 + operator + 审计

---

## 5) “前台/后台全部功能连接起来”的总体要求

### 5.1 唯一事实来源
- 所有资金变化以 Ledger 为准
- 前台余额/历史必须与 ledger 口径一致

### 5.2 前台 API（最少）
- OTP：
  - POST /auth/otp/request
  - POST /auth/otp/verify
- 注册/找回：
  - POST /auth/register
  - POST /auth/forgot-password/request
  - POST /auth/forgot-password/verify
- 银行列表：
  - GET /banks/active
- Deposit：
  - POST /deposits/cash（receipt upload）
  - GET /deposits/my
- Wallet：
  - GET /wallet/me

### 5.3 后台 API（最少）
- 玩家：
  - POST /admin/players（手动创建）
  - GET /admin/players
- 银行：
  - POST /admin/banks
  - PUT /admin/banks/:id
  - PATCH /admin/banks/:id/status
- Pending Deposit：
  - GET /admin/deposits/pending
  - POST /admin/deposits/:id/approve
  - POST /admin/deposits/:id/reject（reason 必填）
- 审计：
  - GET /admin/audit-logs

---

## 6) 交付验收 Checklist
1) 手动创建玩家：后台创建→玩家能登录/设置密码→审计可查  
2) Bank Detail：后台 CRUD → 前台 Deposit 读取正确列表  
3) OTP：REGISTER & FORGOT_PASSWORD 完整 OTP 流程可用  
4) Cash Deposit：上传收据→后台 pending→approve 入账→前台余额变化  
5) Reject 必填：前台可见 reject remark  
6) 计时：Pending 列表显示 elapsed，超时高亮，记录 operator 与耗时  
7) 报表一致：入款/提款/bonus/转分数字与 ledger 口径一致

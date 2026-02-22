# CUSTOMER_UI_TASK_V3 详细说明书（Web 首页布局改版）

## 0）改版目标

把首页上半部分做成参考站那种结构：

1. **顶部跑马灯公告条（Marquee / Ticker）**
2. **中间一行：左边 Sliding Promotion（大图滑动），右边 Live Transaction（持续滚动）**
3. **Live Transaction 下方：Login / Register（或 Login / Sign out），以及 Balance + Deposit + Withdraw + Refresh 按钮**
4. 版面要**整齐**：Live Transaction 要有**细微条纹 / 细线分隔**，看起来像“格子/条纹表格”那样规整
5. 视觉要留足空间：Promotion 与 Live Transaction 之间、以及中间区域要能放**大图/广告图**（占位先做好，以后换图）
6. Deposit / Withdraw 按钮颜色要像参考站：**Deposit 蓝色、Withdraw 金色**，并且**颜色可配置（可后台调色）**
7. 这些按钮/入口未来都要能用**照片（图片）替换**（后台上传图即可换）

---

## 1）页面布局（Desktop 参考结构）

### 1.1 顶部 Header（第一行）

- **目标**：Logo + 语言切换（Language Switch）置中；原本在上面的 Login/Sign out 移走（放到 Live Tx 下方）。
- **Header 布局**：中间 Logo（图）+ 站名（可选）+ Language Switch（中文/英文等）；右侧（可选）Partnership 浮动徽章，位置可配置。

### 1.2 顶部跑马灯公告条（第二行）

- 全宽跑马灯条，文案从后台配置，自动循环滚动。
- 文字从右向左滚动，可支持多条公告轮播。
- 支持 `prefers-reduced-motion`：减少动态时不滚动，改为静态显示或淡入淡出。

### 1.3 主内容区（第三行：Promotion + Live Transaction）

- **Left**：Sliding Promotion（大图轮播，可自动 + 手动滑动）；点击展开该 promotion 详情（沿用现有 detailJson 逻辑）；尺寸足够大。
- **Middle**：可选插图槽（可后台上传大图/竖图），占位先做好。
- **Right**：Live Transaction（持续向上滚动列表）；显示 6 条可见；透明感 + 细微条纹/分隔线；整体有 gap/留白。

### 1.4 Live Transaction 下方（第四行：登录/余额/操作）

- 全宽“Wallet Action Bar”：
  - **未登录**：Login、Register（+ 可选提示 “Login to view balance”）。
  - **已登录**：Balance、Deposit、Withdraw、Refresh、Sign out。
- 在 Deposit/Withdraw 附近显示 Min/Max Deposit、Min/Max Withdraw（后台可配置）。

---

## 2）模块细节规格

### 2.1 Live Transaction

- **可见行数**：6 行（固定）；数据可拉 N 条做无缝循环。
- **字段**：手机尾 4 位；Deposit：尾4 + `+ RM xxx.xx`，不显示入金方式；Withdraw：尾4 + Provider + `- RM xxx.xx`。
- **视觉**：每行柔和分隔线；背景细微条纹/轻网格；整体透明感。
- **动画**：向上匀速滚动，无缝循环（列表复制两份 + translateY）；hover 可暂停；`prefers-reduced-motion` 时停用滚动。

### 2.2 Sliding Promotion

- 可滑动（自动轮播 + 用户左右滑）；点击展开该 promotion 详情；不允许点击后跳回第一个。

### 2.3 Partnership 浮动徽章

- 自动上下浮动（非拖动）；圆形图标可后台上传；3~5 秒循环 ease-in-out；`prefers-reduced-motion` 时关闭动画。

### 2.4 Wallet Action Bar

- **按钮风格**：Deposit 蓝色系、Withdraw 金色系；**颜色可后台配置**（如 depositColor / withdrawColor）。
- **图片替换**：每个按钮可配置 imageUrl；有 imageUrl 则显示为图片按钮，无则用默认颜色按钮。
- 建议支持：loginButtonImageUrl、registerButtonImageUrl、depositButtonImageUrl、withdrawButtonImageUrl、refreshButtonImageUrl、signoutButtonImageUrl。

---

## 3）后台可配置项

1. Marquee 公告内容（支持多条）
2. Promotion 图片/内容（现有 promotions）
3. Partnership 徽章图片 URL
4. 主区插图槽位（中间大图）图片 URL
5. Live Transaction 背景图（可选）
6. Wallet Action Bar：各按钮图片、Deposit/Withdraw 颜色、Min/Max Deposit/Withdraw 数值

---

## 4）响应式（Mobile）

- Header：Logo + Language 居中（可两行）
- Marquee：仍显示，可缩小高度
- Promotion、插图槽、Live Tx：竖向堆叠（Promotion → 插图槽 → Live Tx → Action Bar）
- Live Tx 可见 6 行（或小屏 4 行，可定）

---

## 5）截图与验收

- **截图**：`home_top_marquee_promo_liveTx_desktop.png`、`home_actionbar_desktop.png`；（可选）`home_mobile_v3.png`。
- **验收**：跑马灯存在且循环；Header Logo+Language 居中；Promotion 可滑动、点击展开、不跳回第一个；Live Tx 右侧、6 行、持续滚动、分隔线/条纹明显但柔和；Login/Register 与 Balance+Deposit+Withdraw+Refresh 在 Live Tx 下方全宽；Deposit 蓝、Withdraw 金且可调；按钮支持图片替换。

---

## 6）验收行（PR/commit）

```
UI_WEB_V3_OK: marquee=on header=centerLogo+lang promo=slider+expand liveTx=autoScroll6 stripes=on authMoved=belowTx actionBar=balance+deposit+withdraw+refresh colors=cfg buttonImages=cfg screenshots=ok
```

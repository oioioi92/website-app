# 前台 UI 更新说明（V2）— 可直接发给客户

---

## 1）Live Transaction（最新交易）

- 首页的 Live Transaction 现在固定显示 **最新 8 笔** 记录。
- 每一格会显示：
  - **手机号只显示尾 4 位**（前面全部用 `*` 号隐藏）
  - **金额**
  - **Deposit（进钱）**：只显示尾 4 + 金额（不显示入金方式）
  - **Withdraw / Rolling（提现/洗钱）**：显示尾 4 + **游戏商（Provider）** + 金额
- 已移除「查看更多 / View More」，页面只保留最新记录展示。

---

## 2）Games 区块

- Games 区块暂时保留位置与外框。
- 内部内容先显示 “Coming soon”（后续会换新的内容/模块）。

---

## 3）Promotions（活动）

- 点击任意 Promotion 活动卡片，会在页面中 **展开显示该活动详情**（图片 / 内容 / 按钮）。
- 点击不会再出现「跳回第一个活动」的问题。
- 再点同一张卡片可收起详情。
- 若活动暂时没有内容，会显示 “No content yet”。

---

## 4）Partnership（合作伙伴徽章）

- Promotion 旁新增一个 **圆形合作伙伴徽章**。
- 徽章会自动 **上下浮动**（增强动感）。
- 徽章图片可在后台 **上传 / 替换**（Site Theme 设置中的「Partnership 徽章」）。
- 若用户系统开启「减少动态效果」，徽章将不播放动画。

---

## 5）Quick Actions（快捷功能入口）

- Share / Download / Rebate / Free Tips / Free Game Tips：
  - 已移除 GO、DL 等前缀字样（UI 更干净）。
  - 每个功能入口的图标都可在后台上传替换（方便以后更换视觉）。

---

## 最终交付验收行（PR/commit）

```
UI_WEB_V2_OK: liveTx=8grid softLines=on phoneMask=tail4 deposit=noMethod withdraw=provider+amount viewMore=removed games=cleared promo=expandNoReset partnerBadge=float+adminUpload quickActions=noPrefix+adminUpload screenshots=ok
```

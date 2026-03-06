# Promotion 设置校验说明（% / Turnover / Rollover）

## 数据流

- 存储：`Promotion.percent`（DB 列）+ `Promotion.ruleJson`（含 grant、turnover、rollover）
- 计算：`lib/promo/engine.ts` 的 normalizeRule、calculateGrant、canClaim
- 展示：`lib/promo/present.ts`、列表/编辑页/弹窗

## 已修复项

### 1. 百分比（%）
- 保存时：PERCENT 模式下 grant.percent 取 ruleJson.grant.percent ?? form.percent，与顶部「Bonus (Percentage)」一致
- 加载时：若 ruleJson.grant.percent 为空且 data.percent 有值，用 data.percent 回填
- 编辑时：修改「Bonus (Percentage)」时（非 FIXED）同时更新 ruleJson.grant.percent，Claim Config 预览一致

### 2. Turnover
- 解析：Number(o.turnover) || undefined，仅保存正数；0 为 undefined
- 保存：仅写入 r.turnover > 0 的值
- 展示：getTurnoverText 仅 n>0 时显示 x${n}

### 3. Rollover
- 解析：true/"allowed" -> true，false/"not_allowed" -> false
- 保存：显式写 true/false，不丢「不允许」
- 展示：getRolloverText、TermsTableView 一致

### 4. promo_table
- PromotionModal.getDetailType 已支持 display.detailType === "promo_table"

## 确认无误

- API 正确读写 percent 与 ruleJson
- 列表 getAmount 使用 g?.percent ?? percent
- normalizeRule 仅用 limits/eligible/grant；turnover/rollover 仅展示

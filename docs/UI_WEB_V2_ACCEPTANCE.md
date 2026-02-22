# UI Web V2 验收

完成 CUSTOMER_UI_TASK_V2 后，请确认以下验收行可复制到 PR/commit：

```
UI_WEB_V2_OK: liveTx=8grid softLines=on phoneMask=tail4 deposit=noMethod withdraw=provider+amount viewMore=removed games=cleared promo=expandNoReset partnerBadge=float+adminUpload quickActions=noPrefix+adminUpload screenshots=ok
```

## 合并前 PR 审查清单（10 点）

1. **最新 8 笔**：API 单次 query，`orderBy: { happenedAt: "desc" }`，`take: 8`，合并后按同一时间字段排序再取 8。
2. **手机号脱敏**：`maskPhoneTail4` 先提取数字、再尾 4；支持 `+60 12-345 6789`、空、短号；单测 `npm run test:mask`。
3. **amountDisplay**：API 侧生成，当前全站 RM、小数两位；若未来多币种可改为 amount + currency 由前端 format。
4. **格子线**：深色主题可见，使用 `divide-x divide-y` + `border-white/15`。
5. **View More**：已彻底移除，无 `<a href>` 或跳转。
6. **Promotion 展开**：点击同一张可收起（toggle）；使用 `data-testid="promotion-tile"` 供截图脚本稳定定位。
7. **detailJson**：仅结构化渲染 p/button，无 `dangerouslySetInnerHTML`。
8. **Partnership 动画**：`prefers-reduced-motion: reduce` 时关闭动画（globals.css）。
9. **图片**：FallbackImage 使用 `<img>`，无 next/image 域名白名单问题。
10. **截图脚本**：使用 `[data-testid="promotion-tile"]` 点击，不依赖「第一个 button」。

## 验收要点

- **Live Transaction**: 最新 8 笔、8 格、柔和线条、手机号只露尾 4、Deposit 不显示入金方式、Withdraw 显示 provider+金额、无「查看更多」
- **Games**: 区块保留，内容清空/占位 Coming soon
- **Promotions**: 点击展开详情、不跳回第一个、再点同一张可收起、无内容显示 No content yet
- **Partnership**: 圆形徽章上下浮动、后台上传 partnershipBadgeUrl、减少动态效果兼容
- **Quick Actions**: 去掉 GO/DL 等前缀、每项图标可后台上传
- **Screenshots**: live_transactions_desktop.png、promotion_expanded_desktop.png

## 客户说明书

可直接发给客户：见 [CUSTOMER_UI_V2_README.md](./CUSTOMER_UI_V2_README.md)。

## 部署

- 日常更新推荐双击项目根目录 **deploy.bat**（输入 2 次 SSH 密码即可完成上传 + 构建 + 重启）。
- 仅上传不构建时可用 `.\scripts\deploy-to-server.ps1`，再 SSH 到服务器执行 `npm install && npm run build && pm2 restart website-phase2`。

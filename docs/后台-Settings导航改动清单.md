# Settings 导航与入口改动清单

## 一、新版 Settings 首页（6 张卡片）

| 卡片 | 首个子页（点击卡片进入） |
|------|--------------------------|
| Frontend | `/admin/settings/frontend/general` |
| Promotion Center | `/admin/settings/promotions/list` |
| Referral Center | `/admin/settings/referral/general` |
| Finance | `/admin/settings/finance/banks` |
| Integrations | `/admin/settings/game-providers`（游戏 API + Logo 合并页；game-api 已重定向至此） |
| Account & Security | `/admin/settings/account/profile` |

## 二、旧路径 → 新路径（Redirect）

| 旧路径 | 新路径 |
|--------|--------|
| `/admin/site` | `/admin/settings/frontend/general` |
| `/admin/settings/promotion` | `/admin/settings/promotions/content` |
| `/admin/settings/referral` | `/admin/settings/referral/general` |
| `/admin/settings/bank` | `/admin/settings/finance/banks` |
| `/admin/settings/deposit-topup-rules` | `/admin/settings/finance/deposit-rules` |
| `/admin/settings/payment-gateway` | `/admin/settings/finance/payment-gateways` |
| `/admin/settings/game-api` | `/admin/settings/game-providers`（与 Logo 合并） |
| `/admin/settings/whatsapp` | `/admin/settings/integrations/whatsapp` |
| `/admin/settings/profile` | `/admin/settings/account/profile` |
| `/admin/settings/password` | `/admin/settings/account/password` |

Redirect 在对应旧路径的 `page.tsx` 中通过 `redirect()` 实现，书签与旧链接自动跳转到新路径。

## 三、新路由壳子（全部已建，无 404）

### Frontend
- `/admin/settings/frontend/general` — 沿用原 Site/Theme 内容（ThemeSettingsClient）
- `/admin/settings/frontend/notices` — 占位
- `/admin/settings/frontend/popups` — 占位
- `/admin/settings/frontend/download-bar` — 占位
- `/admin/settings/frontend/home-media` — 占位
- `/admin/settings/frontend/display` — 占位

### Promotion Center
- `/admin/settings/promotions/list` — 占位 + 链接到 `/admin/promotions`
- `/admin/settings/promotions/content` — 沿用原优惠弹窗设置（PromotionSettingsClient）
- `/admin/settings/promotions/media` — 占位
- `/admin/settings/promotions/links` — 占位
- `/admin/settings/promotions/layout` — 占位
- `/admin/settings/promotions/preview` — 占位

### Referral Center
- `/admin/settings/referral` — 直接 redirect 到 `referral/general`
- `/admin/settings/referral/general` — 已接入 AdminReferralSettingsClient（下线代数、分享渠道）
- `/admin/settings/referral/sharing` — 已接入同一推荐配置组件
- `/admin/settings/referral/display` — 占位（说明可到 General 设置）

### Finance
- `/admin/settings/finance/banks` — 沿用 Bank 设置
- `/admin/settings/finance/deposit-rules` — 沿用 Deposit/Topup Rules
- `/admin/settings/finance/withdraw-rules` — 占位
- `/admin/settings/finance/payment-gateways` — 沿用 Payment Gateway

### Integrations
- `/admin/settings/game-providers` — 游戏 API 配置 + 供应商 Logo 合并页（GameApiSettingsClient + GameProviderLogosClient fullManagement）
- `/admin/settings/integrations/whatsapp` — redirect 到 settings/whatsapp

### Account & Security
- `/admin/settings/account/profile` — 沿用 Personal Detail
- `/admin/settings/account/password` — 沿用修改密码
- `/admin/settings/account/security` — 已实现：Security Tips、IP 白名单、2FA、Create Admin 入口（Login History 已移至独立子页）
- `/admin/settings/account/login-history` — 已实现 LoginHistoryClient
- `/admin/settings/account/admins` — 已实现 AdminAccountsClient（创建/管理 admin/editor/viewer，API: settings/admin-users）

## 四、配置文件

- **`config/settings-nav.ts`**：`SETTINGS_NAV` 定义 6 大块及子页 href，供 Settings 首页与各子页「本组其他页面」使用。

## 五、后续可做

1. 在 Frontend 各占位页迁入原 ThemeSettingsClient 拆出的字段。
2. Referral general 接入现有推荐配置 API/组件（若有）。
3. 统一 Sticky Save Bar、Success/Error 提示、Validation。
4. 二级导航：在 Frontend / Promotion Center 等组内增加左侧或顶部 Tab，直接使用 `SETTINGS_NAV` 的 children。

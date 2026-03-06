# Desktop UI SPEC — Perodua44-style Portal

**Mobile: DO NOT CHANGE**  
**Pages:** / (home) / bonus / promotion / games / register-wa / login / live-chat (chat)

---

## 0) 设计目标

- 图像主导（banner 海报 + icon tile 墙）
- 信息模块多，排版像模板一样整齐
- 每个模块高度固定、边缘对齐、间距统一
- 促销/佣金/下载/联系入口明显（门户站风格）

---

## 1) 版面硬规则

- **Container**: max-width 1200~1280（`--desk-container-p44: 1280px`），padding-x 24px，section gap 24px
- **统一对齐线**: 所有卡片左右边缘对齐
- **卡片高度**: BannerCard 300px，ModuleCard 260px，TileGrid 140x140

---

## 2) 视觉 Tokens

- **Card**: radius 18~22，border 2px，inner inset highlight（金属感）
- **Tile**: 140x140，radius 18，double ring + shadow，hover 边框变亮 + 轻微抬升
- **Typography**: 标题 20~24，正文 16，小字 13~14

---

## 3) 顶部导航（DesktopTopbar）

- Home | Transaction | Promotion | Language | Referral | Feedback | Contact Us (dropdown) | Download APK | Register | Login

---

## 4) HOME 模块顺序（H1–H9）

1. **H1** Notice bar（一行短公告）
2. **H2** Hero Slider 300px
3. **H3** Live Transaction + Wallet 260px 两栏
4. **H4** Quick Actions 4 图标（Deposit / Withdraw / Transfer / Support）
5. **H5** Trusted + Referral 2 横幅
6. **H6** Game Icon Wall 6 列，140x140 tile
7. **H7** Reviews + License/Certification
8. **H8** Mission/Vision 折叠
9. **H9** Share Code + VIP Commission

---

## 5) BONUS / PROMOTION

- 顶部 3 大 promo tile，中间海报网格 2~3 列，底部 Rules + Example + T&C
- 点海报 → 右侧 **Drawer** 打开详情（规则/例子/条款折叠），CTA Claim / Cancel

---

## 6) GAMES

- 左侧 Category list，右侧 Provider tile wall
- **返回三保险**: 侧栏常驻、Breadcrumb、Play（站内）+ Open in new tab
- Tile 使用 140x140 `.desk-tile`

---

## 7) REGISTER / LOGIN

- Register: 同一条 Topbar，3 步 Stepper（WA Verify → Profile → Confirm）
- Login: 手机号 + 密码 + Forgot + Login + Sign up 链接

---

## 8) LIVE CHAT

- 保持现有规则：list 不显示 IP/系统字段/status open；timer 仅 customer pending 且 agent 未回复时计时

---

## 9) 启用方式

- 环境变量或后台 feature_flags：`USE_P44_PORTAL=1` 或 `useP44Portal: true`
- 首页传入 `useP44Layout={true}` 时渲染 P44 Topbar + H1–H9 主区（1280px，gap 24）

---

## 10) 素材建议

- Hero banners 1024x300 x4
- Trusted/Referral 横幅 1024x220 x2
- Provider/game tiles 512x512（前端缩到 140）x30~80
- QuickAction icons x4，Social icons x6

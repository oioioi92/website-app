# 整站 UI 组件目录图（Component Map）

供开发与 Cursor 使用：新功能应对应到既有组件，避免重复造轮或乱用组件。

---

## 手机版首页（Vivid Mobile Home）

**入口页面**：`app/(public)/page.tsx`（根据 viewport 渲染手机版）  
**主组件**：`components/vivid/VividMobileHome.tsx`

| 模块           | 组件/实现位置 | 说明 |
|----------------|----------------|------|
| 顶栏           | 内联于 `VividMobileHome` | 站名 + 登录/注册，sticky，高度 58px |
| 跑马灯         | `AnnouncementMarquee` | 公告滚动条 |
| 首页轮播图     | `HeroPromotionSlider` | 主视觉 Banner，compact 模式 16:7 |
| 快捷入口（4 个） | 内联于 `VividMobileHome` | 4 列 grid，CARD + 图标 + 文案 |
| Section 标题   | `SectionHeader`（内部函数组件） | 左侧色条 + 标题，统一所有 section |
| 最新活动卡片   | 内联于 `VividMobileHome`（topPromos map） | 横向滚动，1:1 图 + 标题 + 领取/条款按钮 |
| 实时交易       | `MobileLiveList`（内部函数组件） | 标题 + live badge + 垂直 ticker 列表 |
| 推荐有礼       | `ReferralBlock` | 分享链接 / 复制链接 / 查看下线，48px 按钮 |
| 热门游戏       | 内联于 `VividMobileHome` | chips 横向滚动 + 3 列 Provider 卡片 |
| 底部导航       | `UnifiedBottomNav` | 6 项固定，由 layout 渲染 |

---

## 桌面版首页（Vivid Desktop）

**主组件**：`components/vivid/VividHomeClient.tsx`

| 模块       | 组件/实现位置 | 说明 |
|------------|----------------|------|
| 跑马灯     | `AnnouncementMarquee` | 同手机 |
| 轮播图     | `HeroPromotionSlider` | compact，max-w 980px |
| Hero 主卡  | 内联于 `VividHomeClient` | 主标语 + CTA（仅桌面） |
| 实时交易   | `LiveTransactionTable` | 表格版，variant v3 |
| 其他       | 与手机共用部分公共组件 | |

---

## 公共组件（Shared）

| 组件 | 路径 | 用途 |
|------|------|------|
| `AnnouncementMarquee` | `components/public/AnnouncementMarquee.tsx` | 顶部公告滚动条，单条/多条 |
| `HeroPromotionSlider` | `components/public/HeroPromotionSlider.tsx` | 首页轮播图，支持 compact、链接、点切换 |
| `ReferralBlock` | `components/public/ReferralBlock.tsx` | 推荐有礼：分享/复制/查看下线 |
| `UnifiedBottomNav` | `components/public/UnifiedBottomNav.tsx` | 底部 6 项导航，Vivid/默认样式 |
| `LiveTransactionTable` | `components/public/LiveTransactionTable.tsx` | 实时交易表格（桌面），v3 样式 |
| `FallbackImage` | `components/FallbackImage.tsx` | 图片 + 加载失败占位，统一用 object-cover object-center |
| `PromotionModal` | `components/public/PromotionModal.tsx` | 活动详情弹窗 |

---

## 设计 token（Vivid）

- **容器**：`padding: 16px 16px 0`，section `gap: 16`  
- **卡片**：`CARD` 对象（background、border、borderRadius: 16）  
- **圆角**：普通卡 16px，Hero/Banner 20px，chips 9999px  
- **样式表**：`styles/vivid-portal.css`，变量见 `:root` / `.vp-shell`

---

## 后台与配置

| 用途           | 位置 |
|----------------|------|
| Theme 配置     | `components/admin/ThemeSettingsClient.tsx` |
| 图片上传/地址  | 同上，与前台一一对应 |
| 尺寸与比例说明 | 见 `docs/IMAGE-GUIDELINES.md` |

---

## 使用建议

- **新增首页模块**：在 `VividMobileHome.tsx` 中按现有 section 顺序插入，使用 `SectionHeader` + 统一 CARD/间距。
- **新增公共区块**：在 `components/public/` 新建组件，再在首页或桌面引用。
- **改图片比例/尺寸**：先改前台展示与 `ThemeSettingsClient`，再更新 `IMAGE-GUIDELINES.md` 与 `UI-CHANGE-PROCESS`。
- **不要**：在未查阅本 Map 的情况下新增与现有组件功能重复的组件。

---

*与 `docs/UI-BASELINE-LOCK.md`、`docs/UI-CHANGE-PROCESS.md`、`docs/IMAGE-GUIDELINES.md` 配套使用。*

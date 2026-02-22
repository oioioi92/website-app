# UI Asset Sizes (Locked)

目的：把前台 UI 写死，并且所有可替换的图片/图标位置都有固定尺寸，方便后续做图时直接对齐。

## 全局尺寸变量

这些变量定义在 `app/globals.css` 的 `:root`：

- `--ui-qa-wrap` / `--ui-qa-icon`
- `--ui-bottomnav-icon`
- `--ui-social-wrap` / `--ui-social-icon`（以及 `--ui-social-wrap-md` / `--ui-social-icon-md`）
- `--ui-desktop-logo`
- `--ui-trust-tile-h` / `--ui-trust-img-h`

## 插槽规格表

| 插槽 | 用途/位置 | 组件 | 页面显示尺寸 | 建议出图尺寸 | 备注 |
|---|---|---|---:|---:|---|
| Quick Action Icon | 快捷入口按钮图标 | `components/public/QuickActionsGrid.tsx` | 20x20 (容器 28x28) | 128x128 PNG | 透明底，图形尽量居中，四周留 10% 空白 |
| Bottom Nav Icon | 手机底部导航图标 | `components/public/MobileBottomNav.tsx` | 16x16 | 128x128 PNG | 透明底，别带文字（文字由 UI 提供） |
| Social Icon | 社交按钮图标 | `components/public/SocialButtons3D.tsx` | 20x20 (md: 24x24) | 192x192 PNG | 透明底，图形尽量粗一点，避免缩小后变糊 |
| Desktop Header Logo | 桌面 Header Logo | `components/home/DesktopHeader.tsx` | 36x36 | 256x256 PNG | 可圆角/透明底；建议不带小字 |
| Trust Badge | 底部信任/支付/认证小图 | `components/public/TrustFooter.tsx` | max-h 32px (容器高 40px) | 256x128 PNG | 透明底，横版优先；会 `object-contain` |
| Promotion Card Cover | 活动卡片封面图 | `components/public/PromotionCard.tsx` | 16:9 (自适应宽度) | 1600x900 JPG/PNG | `object-cover` 会裁切；把主元素放中间 70% 安全区 |
| Hero Slider Banner | 顶部轮播 Banner | `components/public/HeroPromotionSlider.tsx` | 16:9 或 16:5(紧凑) | 1600x900 / 1600x500 | `object-cover` 会裁切；文字建议放中间 |
| Promotion Showcase Image | 活动详情侧图 | `components/home/PromotionShowcase.tsx` | 100% x 160px | 1200x675 | 同样 `object-cover`，主元素居中 |
| Game Provider Logo | 游戏区平台 Logo | `components/public/GameGrid.tsx` | 正方形格子内缩放显示 | 512x512 PNG | 透明底，居中，建议无细小文字；会 `object-contain` |

## 统一使用规则

- 图标类：使用透明 PNG，图形居中，四周留白，避免边缘贴边。
- 封面类：按固定比例出图（16:9 / 16:5），主视觉保持在中间安全区，避免被 `object-cover` 裁掉。


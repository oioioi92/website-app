# Desktop 设计说明书 V3（整齐版）

**硬规则锁死**：所有页面复用以下数值与 class，不得随意改间距/尺寸。

---

## 1) 布局规则（强制）

- **页面容器**：`max-width: 1560px`，`padding-x: 24px`（Tailwind: `max-w-[1560px] px-6`）
- **12 栅格**：`grid grid-cols-12 gap-6`（gap = 24px）
- **间距只准 3 种**：卡片内 24px、卡片间 24px、小元素间 12px（Tailwind: `p-6` / `gap-6` / `gap-3`）

---

## 2) 组件尺寸（强制）

| 组件 | 尺寸 |
|------|------|
| Header | 高 78px |
| Footer | 高 84px |
| Card | radius 22px, border 2px, padding 24px |
| Card Head | 高 56px（标题行） |
| Button | 高 48px (h-12), radius 18px |
| Input | 高 48px, radius 18px |
| List Row | 高 72px |

**金按钮**：每张卡片只允许 1 个主按钮（Gold），避免满屏金。

---

## 3) 对齐规则（必须）

- 所有卡片左右边缘落在同一条竖线（同一容器 + 同一栅格）
- 卡片内布局：`flex flex-col`；按钮区：`mt-auto flex gap-3`，保证按钮贴底对齐

---

## 4) 各页 12 栅格落位

### Home `/`
- Hero: `col-span-12` h=320
- Quick Actions: `col-span-12` h=88
- Categories: `col-span-8` h=360
- Live Activity: `col-span-4` h=360
- Trust: `col-span-12` h=170（内部分 3 列）

### Games `/games`
- Sidebar: `col-span-3`
- Main: `col-span-9`（Breadcrumb + Back → Provider Filter → Game Grid 4 列）
- 返回 4 道：Sidebar 常驻、Breadcrumb 可点 Games、Back 固定 link 回 `/games?…`、Play + New tab

### Promotion / Bonus
- Tabs Bar: `col-span-12` h=72
- Grid: `col-span-12`，3 列卡片，每卡 h=220

### Register
- Left: `col-span-7`
- Right: `col-span-5`

### Live Chat `/live-chat`
- Conversations: `col-span-4`
- Chat Panel: `col-span-6`
- User Info: `col-span-2`

---

## 5) 统一 class（Cursor 必须复用）

```
Page:      mx-auto max-w-[1560px] px-6
Grid12:    grid grid-cols-12 gap-6

Card:      rounded-[22px] border-2 border-[#3D4150] bg-[#232630] p-6
CardHead:  h-[56px] flex items-center justify-between
CardBody:  flex flex-col gap-3
CardFoot:  mt-auto flex gap-3

BtnPrimary: h-12 rounded-[18px] bg-[#E8C85A] text-black font-semibold px-6
BtnSecond:  h-12 rounded-[18px] border-2 border-[#3D4150] bg-[#14161C] text-white px-6
Input:      h-12 rounded-[18px] border-2 border-[#3D4150] bg-[#14161C] px-4 text-white
ListRow:    h-[72px] rounded-[18px] border-2 border-[#3D4150] bg-[#14161C] px-4
```

对应 CSS 变量见 `styles/public-desktop.css`（`.desk-card` / `.desk-card-head` / `.desk-btn-primary` 等）。

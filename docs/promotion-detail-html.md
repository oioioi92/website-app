# Promotion 点击进去的 UI：一个容器

前台「优惠活动」点击某条 promotion 后，弹窗里就是 **一个容器** 做成的详情 UI：

## Rollover 与 Turnover（两样不同设定）

- **Rollover** 与 **Turnover** 是不同设定，请分开理解与配置。
- **Turnover（流水倍数）**：公式 **(Deposit + Bonus) × Turnover = 游戏里必须有的金额才能洗**。例：Deposit RM10 + Bonus RM5，Turnover 填 **3** → 游戏里必须有 **(10+5)×3 = 45** 块才能洗。
- **Rollover**：单独设定，是否允许 Rollover（allowed / not allowed），与上述 Turnover 流水倍数无关。

- **只写字体**：后台只配「容器字体」，可随意改，整块详情区都用这个字体。
- **要什么就改什么**：容器里用你的 HTML 画格子、改版式——画格子用 `table` 或 `div`，改样式用 class，要什么就写什么。

## 容器（就这一个）

- 弹窗详情区域 = 一个容器（class：`promo-detail-container`，可选 `data-promo-container` 便于 CSS 瞄准）。
- 后台只需配置：
  - **容器字体**：`ruleJson.display.fontFamily`，可随时改。
  - **容器自定义 class**（选填）：挂到容器上，要什么就挂什么，方便用 CSS 改样式。
- 容器由系统提供，你只写字体（和可选 class）；容器里的内容 = 你的 HTML，画格子、改版式都在里面做。

## 内容（在容器里要什么就改什么）

内容展示方式三选一（后台「详情类型」）：

1. **HTML（在容器里自己画格子/改版式）**：在 **detailJson** 里填 **html** 字段。画格子用 `<table>` 或 `<div>` 排版，改版式、加文字、加链接随你写，要什么就改什么。
2. **Blocks（块）**：`detailJson.blocks` 数组，由系统按块渲染。
3. **表格条款**：由系统按 ruleJson 生成两栏表格，无需写 HTML。

## 使用 HTML 模式（顾客设计内容）

在后台「详情类型」选 **HTML**，并将 **detailJson** 设为带 **html** 字段的 JSON：

```json
{
  "html": "<h3>DEPOSIT RM10 FREE RM10</h3><table>...</table><p class=\"warning\">违反条款将没收所有积分</p>"
}
```

- 该 HTML 会经安全过滤后渲染在**容器内部**；容器已提供字体（若已配置）和可选 class，内容版式完全由顾客在 `html` 里用 HTML/CSS 设计。

## 允许的 HTML

- **标签**：div, p, h1–h4, span, section, article, table, thead, tbody, tfoot, tr, td, th, ul, ol, li, a, strong, b, em, i, u, br, hr, img
- **属性**：class；`<a>` 可含 href, target, rel；`<img>` 可含 src, alt, width, height
- 不允许：script、iframe、form、style、on* 等，危险协议（javascript:/data:）会被过滤

详见：`lib/public/sanitizePromoHtml.ts`

## 样式

- **容器**：`promo-detail-container`（在 `PromotionModal` 内），可带 `display.fontFamily`、`display.customClass`。
- **内容**：容器内的 `promo-detail-html` 或表格条款等；全局样式见 `app/globals.css`：表格边框、th 背景、列表、hr、`.warning` 警告框、图片圆角等。
- 链接颜色使用主题变量 `--front-gold-light`，可在主题或顾客 HTML 中覆盖。

## 弹窗风格与参考站一致（白底 + 红/绿按钮）

若希望促销弹窗为**白底、蓝绿/红按钮**（与部分参考站一致），在主题的 **uiText** 中配置：

| 键 | 说明 | 示例 |
|----|------|------|
| `promomodalvariant` | 弹窗风格 | `light` = 白底蓝绿风格；不设或其它值 = 深色 |
| `promomodalviewalltext` | 左侧按钮文案 | `TUTUP`、`查看全部优惠` |
| `promomodalclaimtext` | 右侧按钮文案 | `CLAIM SEKARANG`、`立即领取` |
| `promomodalclosetext` | 关闭按钮文案 | `关闭`、`TUTUP` |

设为 `promomodalvariant: "light"` 后，弹窗为白底、详情区浅灰底、左侧按钮红色、右侧按钮绿色，表格标题为蓝色，与参考站视觉一致。按钮文案可用马来语或中文，由上述三个 key 控制。

---

## 容器内 class 说明书（Excel 格子 · 字体颜色 · 闪/跳动）

在 **HTML 模式** 下，你在 `detailJson.html` 里写的标签可以加下面这些 **class**，实现「格子、字体颜色、闪、跳动」等效果。全部由系统提供，直接写 class 名即可。

### 一、格子（像 Excel 的单元格）

| Class | 说明 | 示例 |
|-------|------|------|
| `promo-cell` | 单格：边框 + 内边距 + 浅底，像 Excel 格子 | `<td class="promo-cell">金额</td>` 或 `<div class="promo-cell">100</div>` |
| `promo-cell-header` | 表头格：加粗、深底、金色字 | `<th class="promo-cell-header">项目</th>` |
| `promo-grid` | 网格容器：子元素自动排成多列格子 | `<div class="promo-grid"><span class="promo-cell">A</span><span class="promo-cell">B</span>...</div>` |

- 用 **table**：`<table>` 里 `<td class="promo-cell">`、`<th class="promo-cell-header">` 即可。
- 用 **div**：外层 `<div class="promo-grid">`，里面多个 `<div class="promo-cell">` 自动成格。

### 二、字体颜色

| Class | 效果 |
|-------|------|
| `promo-text-gold` | 金色 |
| `promo-text-red` | 红色 |
| `promo-text-green` | 绿色 |
| `promo-text-white` | 白色 |
| `promo-text-muted` | 灰白（弱化） |

示例：`<span class="promo-text-gold">VIP 专享</span>`、`<p class="promo-text-red">限时</p>`。

### 三、高亮块

| Class | 说明 |
|-------|------|
| `promo-highlight` | 浅金底 + 圆角 + 内边距，适合强调一小段文字 |

示例：`<span class="promo-highlight">首存 100%</span>`。

### 四、动画（闪 / 跳动 / 脉冲）

| Class | 效果 | 说明 |
|-------|------|------|
| `promo-blink` | **闪** | 透明度在 1 ↔ 0.35 之间循环，像闪烁 |
| `promo-flash` | **闪亮** | 亮度在 1 ↔ 1.5 循环，整体变亮再恢复 |
| `promo-bounce` | **跳动** | 上下轻微弹跳（约 4px） |
| `promo-pulse` | **脉冲** | 轻微放大缩小（约 1.05 倍） |

示例：
- 闪字：`<span class="promo-text-gold promo-blink">限时</span>`
- 跳动标题：`<h3 class="promo-bounce">立即领取</h3>`
- 闪亮格子：`<td class="promo-cell promo-flash">加码中</td>`

**注意**：用户系统若开启「减少动画」（无障碍），上述动画会自动关闭，仅保留静态样式。

### 五、组合示例（HTML 片段）

```html
<h3 class="promo-text-gold promo-bounce">首存 100% 加码</h3>
<table>
  <tr><th class="promo-cell-header">档位</th><th class="promo-cell-header">奖金</th></tr>
  <tr><td class="promo-cell">RM50</td><td class="promo-cell promo-text-gold promo-blink">RM50</td></tr>
  <tr><td class="promo-cell">RM100</td><td class="promo-cell promo-text-green">RM100</td></tr>
</table>
<p><span class="promo-highlight promo-flash">限时 3 天</span></p>
```

- 格子：`promo-cell` / `promo-cell-header`。
- 颜色：`promo-text-gold`、`promo-text-green`。
- 动效：`promo-bounce`（标题）、`promo-blink`（闪字）、`promo-flash`（闪亮块）。

以上 class 均只在 **promo 详情容器内** 生效，样式定义在 `app/globals.css` 中。

### 六、完整条款弹窗示例（复制即用）

后台选「详情类型 = HTML」后，在「详情 HTML」里可直接粘贴下面整段，再改字即可得到**完整两栏条款表 + 警告框**的弹窗（类似参考图 4）：

```html
<h3 class="promo-text-gold">10% UNLIMITED SLOT BONUS</h3>
<table>
  <tr><th class="promo-cell-header">奖励</th><th class="promo-cell-header">说明</th></tr>
  <tr><td class="promo-cell">奖金</td><td class="promo-cell promo-text-gold">10%</td></tr>
  <tr><td class="promo-cell">最低充值</td><td class="promo-cell">RM10.00</td></tr>
  <tr><td class="promo-cell">总领取次数</td><td class="promo-cell">不限</td></tr>
  <tr><td class="promo-cell">流水倍数</td><td class="promo-cell">x3</td></tr>
  <tr><td class="promo-cell">Rollover</td><td class="promo-cell">不允许</td></tr>
  <tr><td class="promo-cell">仅限游戏</td><td class="promo-cell">SLOT | JILI | ACEWIN</td></tr>
  <tr><td class="promo-cell">不可用于</td><td class="promo-cell">BUY / SAVE FREE GAME</td></tr>
  <tr><td class="promo-cell">禁播游戏</td><td class="promo-cell"><a href="#">查看禁播列表</a></td></tr>
</table>
<p class="warning">违反条款与条件将没收所有积分。</p>
```

- 后台编辑页还有 **「插入模板」** 按钮：可插入「两栏条款表」「两栏表+警告框」或「完整示例」，再按需改文字即可。这样后台就能**设定**完整弹窗内容，不只是几行字。

## 后台规则与展示设置（ruleJson）

在后台「编辑优惠」中可配置：

- **规则与条件**：百分比、开始/结束时间、最低充值、流水、Rollover、次数、仅限游戏、不可用于、禁播游戏链接、条款警告文案等。
- **展示设置**：**详情类型**（Blocks / HTML / 表格条款）、**容器字体**、**容器自定义 CSS 类名**。  
  - 容器由系统提供，只配置字体与 class；选 **HTML** 时在 detailJson 中填写 `html` 字段，内容由顾客自由设计。

规则结构见 `lib/promo/engine.ts` 中的 `PromoRule` 类型。

---

## 设计小贴士（随心所欲 · 容易 · 简单）

1. **先选类型再写内容**  
   想完全自己排版 → 选「HTML（顾客自设计内容）」；想少写代码 → 选「表格条款」或「Blocks」。

2. **容器只调字体**  
   展示设置里只必配「容器字体」即可，例如 `system-ui, sans-serif`。内容长什么样全在你在 `html` 里写的 HTML 决定。

3. **从一小段 HTML 开始**  
   不必一次写整页。先写一句 `<p>测试</p>` 或一个 `<table>...</table>`，保存后到前台点开看效果，再慢慢加标题、表格、警告框。

4. **用 class 搭版式**  
   多用 `class="..."`。除了 table、th、td、.warning、hr 的基础样式外，还可直接用 **格子 / 颜色 / 动画** class：`promo-cell`、`promo-cell-header`、`promo-grid`、`promo-text-gold`/`red`/`green`、`promo-blink`、`promo-flash`、`promo-bounce`、`promo-pulse`、`promo-highlight`。详见上文「容器内 class 说明书」。

5. **只对某一段改字体**  
   整段内容正常写；要改字体的那一小段用 `<span class="promo-text-xxx">这段文字</span>` 包起来即可，可叠加多个 class（如 `class="promo-text-gold promo-blink"`）。示例：`首存加码，<span class="promo-text-gold">限时 3 天</span>，先到先得。`

6. **允许的标签记一记**  
   可用：div, p, h1–h4, table, tr, td, th, ul,ol, li, a, strong, em, br, hr, img 等；不可用 script、iframe、style、on*。链接用 `<a href="...">`，图片用 `<img src="..." alt="">`。

7. **条款警告**  
   需要红色警告条时，在 HTML 里写 `<p class="warning">违反条款将没收所有积分</p>`，或用「规则与条件」里的「条款警告文案」配合表格条款模式。

8. **随心所欲的边界**  
   版式、表格列数、文字多少、是否加图，都由你在 `detailJson.html` 里决定；系统只负责提供容器（字体 + 可选 class）和安全过滤。

9. **做漂亮的 popup**  
   弹窗样式 = 容器（字体 + 自定义 class）+ 你在 `html` 里写的内容。要做出和参考图一样的漂亮弹窗：先配好「容器字体」和「容器自定义 class」，再在详情 JSON 的 `html` 里用 `<table>` / `promo-cell` / `promo-cell-header` / `promo-text-gold` 等 class 画格子、加颜色、加动效。若有参考图，可发给开发按图实现。

## 相关文件

- `components/public/PromotionModal.tsx`：优先渲染 `detailJson.html`，否则 blocks
- `lib/public/sanitizePromoHtml.ts`：HTML 安全过滤
- `components/admin/PromotionEditClient.tsx`：后台优惠编辑（规则、展示）

# 代码改进说明（更好方法）

本文记录已做的重构与后续可考虑的改进点，便于统一逻辑、减少重复、方便维护。

---

## 已做：前台活动/游戏数据层统一

**问题**：首页 `page.tsx`、bonus 页 `bonus/page.tsx`、接口 `api/public/home/route.ts` 三处各自写了一套「查活动 + 映射 UI」「查游戏 + 过滤 + 解析 logo」，重复且容易改漏（例如 API 曾未用 `resolvePromotionCover`，与页面不一致）。

**做法**：抽出公共数据层 **`lib/public/public-data.ts`**：

- **查活动**：`getActivePromotions(limit)` 只查库；`mapPromotionToPublicUi(promo, index, now)` 单条转 UI；`getActivePromotionsForUi(limit, now)` 查+映射。
- **查游戏**：`getActiveGames(limit)` 只查库；`mapGamesToPublicUi(games)` 过滤非游戏 + 解析 logo；`getActiveGamesForUi(limit)` 查+映射。
- **类型**：UI 结构对齐 `PublicPromotion`（`PromotionCard` 定义），一处改、处处一致。

**效果**：

- 三处调用改为 `getActivePromotionsForUi` / `getActiveGamesForUi`，不再重复 select/orderBy/map。
- API 与页面使用同一套映射，封面、logo 等行为一致。
- 以后改「哪些字段」「怎么排序」「怎么算 status/limitTag」只改 `public-data.ts` 即可。

---

## 可考虑的后续改进

1. **Social / Theme 同理**  
   若多处用到「查 social + theme_json」，可再抽 `getPublicSocial()`、`getPublicTheme()` 或合并成 `getPublicLayoutData()`，避免 again 重复 select 与解析。

2. **错误处理统一**  
   - 页面：`try/catch` 后 fallback 组件 or 错误页，可统一成 `getOrFallback(async () => getData(), FallbackComponent)` 或类似工具，减少重复 try/catch。
   - API：已有 cache fallback 与 503，可约定所有 public API 错误体格式一致，例如 `{ error: string, code?: string }`。

3. **类型从数据层导出**  
   - `PublicPromotion` 目前从 `PromotionCard` 导出；若希望「数据层定义 UI 契约」，可把该类型移到 `lib/public/public-data.ts` 或 `lib/public/types.ts`，组件再引用，避免 UI 组件反向依赖类型。

4. **删除未使用组件**  
   - 见之前 CODE_AUDIT：`HomeHeader`、`HomeFooter`、`SectionTitle`、`LiveTransactionPanel`、`PromotionGrid`、`PromotionDetailModal` / `PromoDetailModalV2` 等若确认不用，可删或归档，减少噪音。

5. **Prisma schema 唯一来源**  
   - 构建用 `schema.postgres.prisma`、本地 dev 用 `schema.sqlite.prisma`；`schema.prisma` 若已不用，可删或在 README 注明「仅作参考」，避免误改错文件。

6. **每日检查自动化**  
   - 已提供 `scripts/daily-upgrade.ps1` 与 `docs/DAILY_UPGRADE.md`；可再加一条「跑一次 build + 关键 API curl」，保证每日升级后构建与接口可用。

---

以上是「认真思考后更好方法」的落地与后续方向；有新需求或想优先做某一条，可以按此清单推进。

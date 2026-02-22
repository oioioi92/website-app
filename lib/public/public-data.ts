/**
 * 前台公共数据层：活动、游戏等查询与 UI 映射统一入口，避免 page/API 重复逻辑。
 * 修改 select/orderBy 或 UI 字段时只改此处即可。
 */
import { db } from "@/lib/db";
import { getGrantTag, getGroupLabel, getLimitTag, getPromoStatus } from "@/lib/promo/present";
import { isNonGameProviderName, resolvePromotionCover } from "@/lib/public/namedAssets";
import type { PublicPromotion } from "@/components/public/PromotionCard";

const PROMO_SELECT = {
  id: true,
  title: true,
  subtitle: true,
  coverUrl: true,
  detailJson: true,
  percent: true,
  startAt: true,
  endAt: true,
  isClaimable: true,
  ruleJson: true
} as const;

type PromoRow = Awaited<ReturnType<typeof getActivePromotions>>[number];

type GameRow = { id: string; name: string; logoUrl: string | null; code: string | null };

function isDemoLogoUrl(input: string | null | undefined) {
  const s = (input ?? "").trim().toLowerCase();
  if (!s) return false;
  // `seed:demo` uses picsum; treat it as placeholder so UI doesn't show random landscape photos.
  return s.includes("picsum.photos/");
}

/** 只查库，不做 UI 映射；当前不按 isActive 过滤，全部展示，避免「一个广告都没有」 */
export async function getActivePromotions(limit: number) {
  return db.promotion.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    select: PROMO_SELECT,
    take: limit
  });
}

/** 单条 raw 活动 → 前台 UI 结构（与 PublicPromotion 一致） */
export function mapPromotionToPublicUi(
  promo: PromoRow,
  index: number,
  now: Date = new Date()
): PublicPromotion {
  const percentNumber = Number(promo.percent ?? 0);
  return {
    id: promo.id,
    title: promo.title,
    subtitle: promo.subtitle,
    coverUrl: resolvePromotionCover(promo.coverUrl, promo.title, promo.subtitle, index),
    detailJson: promo.detailJson,
    ruleJson: promo.ruleJson,
    percentText: percentNumber > 0 ? `${percentNumber.toFixed(0)}%` : "PROMO",
    statusLabel: getPromoStatus(
      { isClaimable: promo.isClaimable, startAt: promo.startAt, endAt: promo.endAt },
      now
    ),
    limitTag: getLimitTag(promo.ruleJson as Parameters<typeof getLimitTag>[0]),
    grantTag: getGrantTag(promo.ruleJson as Parameters<typeof getGrantTag>[0], percentNumber),
    groupLabel: getGroupLabel(promo.ruleJson as Parameters<typeof getGroupLabel>[0])
  };
}

/** 查活动并映射为前台 UI 列表 */
export async function getActivePromotionsForUi(
  limit: number,
  now: Date = new Date()
): Promise<PublicPromotion[]> {
  const rows = await getActivePromotions(limit);
  return rows.map((p, i) => mapPromotionToPublicUi(p, i, now));
}

/** 只查库，不做过滤和 logo 解析 */
export async function getActiveGames(limit: number) {
  return db.gameProvider.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    select: { id: true, name: true, logoUrl: true, code: true },
    take: limit
  });
}

/** 过滤非游戏 provider，并规范化 logoUrl（不做本地 assets 兜底，方便后台逐个上传/替换） */
export function mapGamesToPublicUi(
  games: GameRow[]
): Array<{ id: string; name: string; logoUrl: string | null; code: string | null }> {
  const filtered = games.filter(
    (g) => !isNonGameProviderName(g.name) && !isNonGameProviderName(g.code)
  );
  return filtered.map((game) => ({
    ...game,
    logoUrl:
      typeof game.logoUrl === "string" && game.logoUrl.trim() && !isDemoLogoUrl(game.logoUrl)
        ? game.logoUrl
        : null
  }));
}

/** 查游戏并映射为前台 UI 列表（过滤 + logo） */
export async function getActiveGamesForUi(limit: number) {
  const rows = await getActiveGames(limit);
  return mapGamesToPublicUi(rows);
}

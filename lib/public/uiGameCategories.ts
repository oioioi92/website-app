export const UI_GAME_CATEGORIES = ["Casino", "Sportbook", "Slots", "E-Sports", "Poker", "Fishing"] as const;
export type UiGameCategory = (typeof UI_GAME_CATEGORIES)[number];

/** 前台游戏页 Tab 分类 key：与 VividGamesClient 的 CAT_KEYS 一致 */
export const FRONTEND_GAME_CATEGORIES = ["slots", "live", "sports", "fishing", "lottery", "new"] as const;
export type FrontendGameCategory = (typeof FRONTEND_GAME_CATEGORIES)[number];

const VALID_CATEGORY_SET = new Set<string>(FRONTEND_GAME_CATEGORIES);

/** 后台可选的分类值（与 FRONTEND_GAME_CATEGORIES 一致，供 Admin 下拉使用） */
export const ADMIN_GAME_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "slots", label: "Slots" },
  { value: "live", label: "Live" },
  { value: "sports", label: "Sports" },
  { value: "fishing", label: "Fishing" },
  { value: "lottery", label: "Lottery" },
  { value: "new", label: "New" },
];

/**
 * 根据 provider 的 name/code 粗略推断分类（没有后端分类字段时的兜底逻辑）。
 * 目标：让侧边栏分类可用，且默认大多数落在 Slots。
 */
export function inferUiGameCategory(name: string, code?: string | null): UiGameCategory {
  const s = `${name ?? ""} ${code ?? ""}`.trim().toUpperCase();

  // Fishing: 常见品牌别名（有些库名不含 FISH）
  if (/FISH|FISHING|JDB\b|YOULIAN|YL\b|PLAYSTAR|SPADE|JILI|JOKER|CQ9|YELLOW\s*BAT|YGR\b|FA\s*CHAI|MT\b/.test(s))
    return "Fishing";

  // Poker / P2P
  if (/POKER|P2P|TEXAS|HOLD'?EM/.test(s)) return "Poker";

  // Sports / E-Sports
  if (/E[\s-]?SPORT|ESPORT/.test(s)) return "E-Sports";
  if (/SPORT|SBO|BOOK|MAXBET|OBET|M8BET|M9BET|SBOBET|BTI|CMD368|SABA|SABA\s*SPORTS|IBC/.test(s)) return "Sportbook";

  // Live casino
  if (
    /LIVE|CASINO|EVOLUTION|WM\b|PLAYTECH\b|PRAGMATIC|DREAM\s*GAMING|EBET|EZUGI|PLAYACE|SEXY|BACCARAT|SA\s*GAMING|SAGAMING|MT\s*LIVE/.test(
      s
    )
  )
    return "Casino";

  // Default
  return "Slots";
}

/** UiGameCategory 映射到前台 Tab key */
function uiCategoryToFrontendKey(ui: UiGameCategory): FrontendGameCategory {
  switch (ui) {
    case "Casino":
      return "live";
    case "Sportbook":
    case "E-Sports":
      return "sports";
    case "Fishing":
      return "fishing";
    case "Poker":
    case "Slots":
    default:
      return "slots";
  }
}

/**
 * 推断前台展示用的分类 key（slots / live / sports / fishing / lottery / new）。
 * 当后台未设置 category 时，根据供应商 name/code 自动推断。
 */
export function inferFrontendGameCategory(name: string, code?: string | null): FrontendGameCategory {
  const ui = inferUiGameCategory(name, code);
  return uiCategoryToFrontendKey(ui);
}

/**
 * 解析最终给前台的分类：优先用后台保存的 category，无效或空则推断。
 */
export function resolveProviderCategory(
  dbCategory: string | null | undefined,
  name: string,
  code?: string | null
): FrontendGameCategory {
  const raw = (dbCategory ?? "").trim().toLowerCase();
  if (raw && VALID_CATEGORY_SET.has(raw)) return raw as FrontendGameCategory;
  return inferFrontendGameCategory(name, code);
}


export const UI_GAME_CATEGORIES = ["Casino", "Sportbook", "Slots", "E-Sports", "Poker", "Fishing"] as const;
export type UiGameCategory = (typeof UI_GAME_CATEGORIES)[number];

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


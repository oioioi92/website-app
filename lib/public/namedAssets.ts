const USER_PROVIDER_LOGOS = [
  "/assets/providers/3win8.png",
  // Prefer more specific variants first (html5/h5) to avoid matching "918kiss" too early.
  "/assets/providers/918kiss-html5.png",
  "/assets/providers/918kiss-h5.png",
  "/assets/providers/918kiss.png",
  "/assets/providers/ace333.png",
  "/assets/providers/acewin.png",
  "/assets/providers/advantplay.png",
  "/assets/providers/atg-games.png",
  "/assets/providers/bigpot-gaming.png",
  "/assets/providers/bti.png",
  "/assets/providers/bp.png",
  "/assets/providers/bng.png",
  "/assets/providers/bt-gaming.png",
  "/assets/providers/clotplay.png",
  "/assets/providers/cp-games.png",
  "/assets/providers/croco-gaming.png",
  "/assets/providers/cq9-gaming.png",
  "/assets/providers/cmd368.png",
  "/assets/providers/dragoon-soft.png",
  "/assets/providers/dragon-gaming.png",
  "/assets/providers/epic-win.png",
  "/assets/providers/evoplay.png",
  "/assets/providers/evo888h5.png",
  "/assets/providers/fa-chai.png",
  "/assets/providers/fastspin.png",
  "/assets/providers/funky-games.png",
  "/assets/providers/goldenbay.png",
  "/assets/providers/funta-gaming.png",
  "/assets/providers/habanero.png",
  "/assets/providers/hacksaw.png",
  "/assets/providers/history.png",
  "/assets/providers/home-button.png",
  "/assets/providers/i-bex.png",
  "/assets/providers/jdb-slot.png",
  "/assets/providers/jili.png",
  "/assets/providers/jdb-fishing.png",
  "/assets/providers/joker.png",
  "/assets/providers/ka-gaming.png",
  "/assets/providers/lion-king.png",
  "/assets/providers/livechat.png",
  "/assets/providers/live22.png",
  "/assets/providers/lucky365.png",
  "/assets/providers/mega888.png",
  "/assets/providers/megah5.png",
  "/assets/providers/meta-gaming.png",
  "/assets/providers/microgaming.png",
  "/assets/providers/mt.png",
  "/assets/providers/mt-live.png",
  "/assets/providers/maxbet.png",
  "/assets/providers/obet33.png",
  "/assets/providers/m8bet.png",
  "/assets/providers/m9bet.png",
  "/assets/providers/saba-sports.png",
  "/assets/providers/sbobet.png",
  "/assets/providers/sv388.png",
  "/assets/providers/rcb988.png",
  "/assets/providers/e1sport.png",
  "/assets/providers/monkey888.png",
  "/assets/providers/nextspin.png",
  "/assets/providers/netent.png",
  "/assets/providers/nolimit-city.png",
  "/assets/providers/king855.png",
  "/assets/providers/yeebet.png",
  "/assets/providers/playtech-live.png",
  "/assets/providers/playace.png",
  "/assets/providers/dream-gaming.png",
  "/assets/providers/pragmatic-play-live.png",
  "/assets/providers/sa-gaming.png",
  "/assets/providers/sexy-baccarat.png",
  "/assets/providers/ezugi.png",
  "/assets/providers/wm-casino.png",
  "/assets/providers/evolution-gaming.png",
  "/assets/providers/ebet.png",
  "/assets/providers/playstar.png",
  "/assets/providers/playtech-slot.png",
  "/assets/providers/pegasus.png",
  "/assets/providers/promotion.png",
  "/assets/providers/pussy888.png",
  "/assets/providers/pragmatic-play.png",
  "/assets/providers/ps.png",
  "/assets/providers/r88.png",
  "/assets/providers/red-tiger.png",
  "/assets/providers/rich-gaming.png",
  "/assets/providers/rich.png",
  "/assets/providers/rich88.png",
  "/assets/providers/relax-gaming.png",
  "/assets/providers/royal-slot-gaming.png",
  "/assets/providers/setting.png",
  "/assets/providers/skywind-group.png",
  "/assets/providers/spadegaming.png",
  "/assets/providers/uu-slots.png",
  "/assets/providers/uuslot.png",
  "/assets/providers/v-power.png",
  "/assets/providers/vplus.png",
  "/assets/providers/wf-gaming.png",
  "/assets/providers/xgemini.png",
  "/assets/providers/xpans-studios.png",
  "/assets/providers/dng.png",
  "/assets/providers/yl-fishing.png",
  "/assets/providers/yellow-bat.png",
  "/assets/providers/yggdrasil.png",
  "/assets/providers/ygr.png"
] as const;
const NON_GAME_KEYS = ["history", "homebutton", "promotion", "livechat", "setting"] as const;
const PROMO_COVER_POOL = ["/assets/providers/promotion.png", "/assets/providers/918kiss.png", "/assets/providers/mega888.png"] as const;

/** 游戏 logo 兜底图（项目内必有）；provider 无图时用此或 placeholder */
export const DEFAULT_GAME_LOGO = "/assets/providers/918kiss.png";

/** name/code 含以下关键词时匹配对应 logo，解决「全部没有照片」：后台名称与文件名不一致也能出图 */
const PROVIDER_KEYWORDS: Array<{ keywords: string[]; path: string }> = [
  { keywords: ["918", "kiss", "h5"], path: "/assets/providers/918kiss-h5.png" },
  { keywords: ["918", "kiss", "html5"], path: "/assets/providers/918kiss-html5.png" },
  { keywords: ["918", "kiss"], path: "/assets/providers/918kiss.png" },
  { keywords: ["ace", "333"], path: "/assets/providers/ace333.png" },
  { keywords: ["ace", "win"], path: "/assets/providers/acewin.png" },
  { keywords: ["mega", "888"], path: "/assets/providers/mega888.png" },
  { keywords: ["mega", "h5"], path: "/assets/providers/megah5.png" },
  { keywords: ["pussy", "888"], path: "/assets/providers/pussy888.png" },
  { keywords: ["monkey", "888"], path: "/assets/providers/monkey888.png" },
  { keywords: ["lucky", "365"], path: "/assets/providers/lucky365.png" },
  { keywords: ["rich", "88"], path: "/assets/providers/rich88.png" },
  { keywords: ["rich", "gaming"], path: "/assets/providers/rich-gaming.png" },
  { keywords: ["rich"], path: "/assets/providers/rich.png" },
  { keywords: ["joker"], path: "/assets/providers/joker.png" },
  { keywords: ["vpower", "v-power", "v power"], path: "/assets/providers/v-power.png" },
  { keywords: ["vplus", "v-plus", "v plus"], path: "/assets/providers/vplus.png" },
  { keywords: ["jdb"], path: "/assets/providers/jdb-slot.png" },
  { keywords: ["jdbfishing", "jdb fishing"], path: "/assets/providers/jdb-fishing.png" },
  { keywords: ["jili"], path: "/assets/providers/jili.png" },
  { keywords: ["bng"], path: "/assets/providers/bng.png" },
  { keywords: ["cq9"], path: "/assets/providers/cq9-gaming.png" },
  { keywords: ["dragongaming", "dragon gaming"], path: "/assets/providers/dragon-gaming.png" },
  { keywords: ["evoplay"], path: "/assets/providers/evoplay.png" },
  { keywords: ["meta", "gaming"], path: "/assets/providers/meta-gaming.png" },
  { keywords: ["cp", "games"], path: "/assets/providers/cp-games.png" },
  { keywords: ["fa", "chai"], path: "/assets/providers/fa-chai.png" },
  { keywords: ["ibex", "i-bex", "i bex"], path: "/assets/providers/i-bex.png" },
  { keywords: ["wf", "gaming"], path: "/assets/providers/wf-gaming.png" },
  { keywords: ["croco"], path: "/assets/providers/croco-gaming.png" },
  { keywords: ["clotplay"], path: "/assets/providers/clotplay.png" },
  { keywords: ["bt", "gaming"], path: "/assets/providers/bt-gaming.png" },
  { keywords: ["evo", "888", "h5"], path: "/assets/providers/evo888h5.png" },
  { keywords: ["spade", "gaming"], path: "/assets/providers/spadegaming.png" },
  { keywords: ["ka", "gaming"], path: "/assets/providers/ka-gaming.png" },
  { keywords: ["playstar"], path: "/assets/providers/playstar.png" },
  { keywords: ["playtech"], path: "/assets/providers/playtech-slot.png" },
  { keywords: ["bigpot"], path: "/assets/providers/bigpot-gaming.png" },
  { keywords: ["live", "22"], path: "/assets/providers/live22.png" },
  { keywords: ["uu", "slots"], path: "/assets/providers/uu-slots.png" },
  { keywords: ["ylfishing", "yl fishing", "youlian"], path: "/assets/providers/yl-fishing.png" },
  { keywords: ["dragoon"], path: "/assets/providers/dragoon-soft.png" },
  { keywords: ["3win", "3win8"], path: "/assets/providers/3win8.png" },
  { keywords: ["lion", "king"], path: "/assets/providers/lion-king.png" },
  { keywords: ["hacksaw"], path: "/assets/providers/hacksaw.png" },
  { keywords: ["microgaming", "micro"], path: "/assets/providers/microgaming.png" },
  { keywords: ["yellowbat", "yellow bat", "yb"], path: "/assets/providers/yellow-bat.png" },
  { keywords: ["yggdrasil", "ygg"], path: "/assets/providers/yggdrasil.png" },
  { keywords: ["netent"], path: "/assets/providers/netent.png" },
  { keywords: ["goldenbay"], path: "/assets/providers/goldenbay.png" },
  { keywords: ["funky"], path: "/assets/providers/funky-games.png" },
  { keywords: ["fastspin"], path: "/assets/providers/fastspin.png" },
  { keywords: ["advantplay"], path: "/assets/providers/advantplay.png" },
  // SPORTBOOK providers
  { keywords: ["maxbet"], path: "/assets/providers/maxbet.png" },
  { keywords: ["obet", "33", "obet33"], path: "/assets/providers/obet33.png" },
  { keywords: ["m8bet"], path: "/assets/providers/m8bet.png" },
  { keywords: ["m9bet"], path: "/assets/providers/m9bet.png" },
  { keywords: ["sbobet", "sbo", "sbo bet"], path: "/assets/providers/sbobet.png" },
  { keywords: ["bti"], path: "/assets/providers/bti.png" },
  { keywords: ["cmd368", "cmd 368"], path: "/assets/providers/cmd368.png" },
  { keywords: ["sabasports", "saba sports", "saba", "ibc"], path: "/assets/providers/saba-sports.png" },
  // OTHER providers
  { keywords: ["sv388"], path: "/assets/providers/sv388.png" },
  { keywords: ["rcb988"], path: "/assets/providers/rcb988.png" },
  { keywords: ["e1sport", "e1", "e1 sport"], path: "/assets/providers/e1sport.png" },
  { keywords: ["relax"], path: "/assets/providers/relax-gaming.png" },
  { keywords: ["funta"], path: "/assets/providers/funta-gaming.png" },
  { keywords: ["nextspin"], path: "/assets/providers/nextspin.png" },
  { keywords: ["royal", "slot"], path: "/assets/providers/royal-slot-gaming.png" },
  { keywords: ["nolimit", "nolimitcity"], path: "/assets/providers/nolimit-city.png" },
  { keywords: ["skywind"], path: "/assets/providers/skywind-group.png" },
  { keywords: ["xpans", "xpan"], path: "/assets/providers/xpans-studios.png" },
  { keywords: ["xgemini"], path: "/assets/providers/xgemini.png" },
  { keywords: ["dng", "dbng"], path: "/assets/providers/dng.png" },
  { keywords: ["r88"], path: "/assets/providers/r88.png" },
  { keywords: ["redtiger"], path: "/assets/providers/red-tiger.png" },
  { keywords: ["atg"], path: "/assets/providers/atg-games.png" },
  // LIVE providers
  { keywords: ["king", "855"], path: "/assets/providers/king855.png" },
  { keywords: ["yeebet", "yee", "bet"], path: "/assets/providers/yeebet.png" },
  { keywords: ["playtech", "live"], path: "/assets/providers/playtech-live.png" },
  { keywords: ["playace"], path: "/assets/providers/playace.png" },
  { keywords: ["dream", "gaming"], path: "/assets/providers/dream-gaming.png" },
  { keywords: ["sa", "gaming", "sagaming", "sa gaming"], path: "/assets/providers/sa-gaming.png" },
  { keywords: ["sexy", "baccarat", "sexybaccarat", "sexy baccarat"], path: "/assets/providers/sexy-baccarat.png" },
  { keywords: ["ezugi"], path: "/assets/providers/ezugi.png" },
  { keywords: ["mtlive", "mt live"], path: "/assets/providers/mt-live.png" },
  { keywords: ["pragmatic", "play", "live"], path: "/assets/providers/pragmatic-play-live.png" },
  // Pragmatic (slot) should not override the LIVE variant above.
  { keywords: ["pragmatic", "play"], path: "/assets/providers/pragmatic-play.png" },
  { keywords: ["wm", "casino"], path: "/assets/providers/wm-casino.png" },
  { keywords: ["evolution", "gaming"], path: "/assets/providers/evolution-gaming.png" },
  { keywords: ["ebet"], path: "/assets/providers/ebet.png" },
  { keywords: ["pegasus"], path: "/assets/providers/pegasus.png" },
  { keywords: ["habanero"], path: "/assets/providers/habanero.png" },
  { keywords: ["epic", "win"], path: "/assets/providers/epic-win.png" },
  { keywords: ["ygr"], path: "/assets/providers/ygr.png" },
  { keywords: ["uuslot", "uu", "slot"], path: "/assets/providers/uuslot.png" },
  { keywords: ["bp"], path: "/assets/providers/bp.png" }
];

const UI_ASSET_ALIASES: Array<{ keys: string[]; path: string }> = [
  { keys: ["home", "homepage"], path: "/assets/providers/home-button.png" },
  { keys: ["history", "record"], path: "/assets/providers/history.png" },
  { keys: ["promotion", "bonus", "freebonus"], path: "/assets/providers/promotion.png" },
  { keys: ["chat", "livechat", "support"], path: "/assets/providers/livechat.png" },
  { keys: ["setting", "settings"], path: "/assets/providers/setting.png" }
];

function normalizeKey(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getProviderLogoPool() {
  return USER_PROVIDER_LOGOS;
}

export function getProviderLogoFallback(index: number) {
  const gamesOnly = USER_PROVIDER_LOGOS.filter((path) => {
    const base = path.split("/").pop()?.replace(".png", "") ?? "";
    const key = normalizeKey(base);
    return !NON_GAME_KEYS.some((x) => key.includes(x));
  });
  if (gamesOnly.length === 0) return USER_PROVIDER_LOGOS[0];
  return gamesOnly[index % gamesOnly.length];
}

export function resolveProviderLogo(name: string | null | undefined, code: string | null | undefined) {
  const target = normalizeKey(code) || normalizeKey(name);
  if (!target) return null;
  // Match local assets by filename with best precision:
  // 1) exact match
  // 2) target contains key (prefer longer key first)
  const pool = USER_PROVIDER_LOGOS.map((p) => {
    const base = p.split("/").pop()?.replace(".png", "") ?? "";
    return { path: p, key: normalizeKey(base) };
  }).filter((x) => x.key.length > 0);
  for (const item of pool) {
    if (target === item.key) return item.path;
  }
  pool.sort((a, b) => b.key.length - a.key.length);
  for (const item of pool) {
    if (target.includes(item.key)) return item.path;
  }
  for (const { keywords, path } of PROVIDER_KEYWORDS) {
    if (keywords.some((k) => target.includes(normalizeKey(k)))) return path;
  }
  return null;
}

export function isNonGameProviderName(input: string | null | undefined) {
  const key = normalizeKey(input);
  if (!key) return false;
  return NON_GAME_KEYS.some((x) => key.includes(x));
}

export function resolveUiAssetByName(input: string | null | undefined) {
  const target = normalizeKey(input);
  if (!target) return null;

  // Optional runtime overrides injected by PublicLayout (admin-configurable).
  try {
    const g = globalThis as unknown as { __UI_ASSET_OVERRIDES__?: Record<string, string> };
    const ov = g.__UI_ASSET_OVERRIDES__;
    if (ov && typeof ov === "object") {
      const exact = ov[target];
      if (typeof exact === "string" && exact.trim().length > 0) return exact;
    }
  } catch {
    // ignore
  }

  for (const rule of UI_ASSET_ALIASES) {
    if (rule.keys.some((k) => target.includes(normalizeKey(k)))) return rule.path;
  }
  return null;
}

export function resolvePromotionCover(
  coverUrl: string | null | undefined,
  title: string | null | undefined,
  subtitle: string | null | undefined,
  index: number
) {
  if (typeof coverUrl === "string" && coverUrl.trim().length > 0) return coverUrl;
  const fromName = resolveUiAssetByName(title) ?? resolveUiAssetByName(subtitle) ?? resolveProviderLogo(title, subtitle);
  if (fromName) return fromName;
  return PROMO_COVER_POOL[index % PROMO_COVER_POOL.length];
}

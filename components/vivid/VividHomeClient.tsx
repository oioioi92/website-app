"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import "@/styles/vivid-portal.css";
import { VividTopbar } from "./VividTopbar";
import { VividFooter } from "./VividFooter";
import { AnnouncementMarquee } from "@/components/public/AnnouncementMarquee";
import { FallbackImage } from "@/components/FallbackImage";
import { HeroPromotionSlider } from "@/components/public/HeroPromotionSlider";
import { ReferralBlock } from "@/components/public/ReferralBlock";
import { inferUiGameCategory, UI_GAME_CATEGORIES, type UiGameCategory } from "@/lib/public/uiGameCategories";
import { useLocale } from "@/lib/i18n/context";

type Promo   = { id: string; title: string; coverUrl: string | null; percentText?: string | null; coverUrlMobilePromo?: string | null; promoLink?: string | null };
type Game    = { id: string; name: string; logoUrl: string | null; code?: string | null };
type HeroBanner = { imageUrl: string; linkUrl?: string | null };
type QuickAction = { label: string; url: string; iconUrl?: string | null };

// ─── Design tokens (same as mobile) ──────────────────────
const CARD: React.CSSProperties = {
  background: "var(--vp-card)",
  border: "1px solid rgba(120,80,255,0.2)",
  borderRadius: 16,
};

// ─── Live tx list (desktop left column) ──────────────────
const LTX_ROW_H = 44;
const LTX_VISIBLE = 6;
const LTX_INTERVAL_MS = 3000;

function DesktopLiveList({
  items,
  depositLabel,
  withdrawLabel,
  liveLabel,
  titleText,
  depositColor,
  withdrawColor,
}: {
  items: Array<{ id: string; userRefMasked: string; amountDisplay: string; kind: "deposit" | "withdraw" }>;
  depositLabel: string;
  withdrawLabel: string;
  liveLabel: string;
  titleText: string;
  depositColor?: string | null;
  withdrawColor?: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slice = items.slice(0, 6);
  const displayList = slice.length > 0 ? [...slice, ...slice] : [];

  useEffect(() => {
    if (slice.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;
    const singleSetHeight = slice.length * LTX_ROW_H;
    const id = window.setInterval(() => {
      const next = el.scrollTop + LTX_ROW_H;
      el.scrollTop = next >= singleSetHeight ? 0 : next;
    }, LTX_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slice.length]);

  function renderRow(tx: typeof items[number], key: string) {
    const isDeposit = tx.kind === "deposit";
    const dColor = depositColor ?? "#4ade80";
    const wColor = withdrawColor ?? "#fbbf24";
    const txColor = isDeposit ? dColor : wColor;
    return (
      <div key={key} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: LTX_ROW_H, padding: "0 16px", flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
            background: `${txColor}26`, color: txColor,
            border: `1px solid ${txColor}55`, textTransform: "uppercase", flexShrink: 0,
          }}>
            {isDeposit ? depositLabel : withdrawLabel}
          </span>
          <span style={{
            fontSize: 13, fontWeight: 600, letterSpacing: "0.3px",
            color: "rgba(230,222,255,0.88)", fontFamily: "monospace",
            fontVariantNumeric: "tabular-nums lining-nums",
          }}>
            {tx.userRefMasked}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: txColor, fontFamily: "monospace", fontVariantNumeric: "tabular-nums" }}>
          {tx.amountDisplay}
        </span>
      </div>
    );
  }

  return (
    <div style={{ ...CARD, overflow: "hidden" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px 10px", borderBottom: "1px solid rgba(120,80,255,0.15)",
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--vp-text)" }}>{titleText}</span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 999, padding: "3px 10px 3px 8px", fontSize: 10, fontWeight: 700, color: "#f87171",
        }}>
          <span style={{ position: "relative", width: 8, height: 8, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <span className="animate-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(239,68,68,0.55)" }} />
            <span style={{ position: "relative", width: 5, height: 5, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 5px rgba(239,68,68,0.7)" }} />
          </span>
          {liveLabel}
        </span>
      </div>
      <div ref={scrollRef} className="ui-hide-scrollbar" style={{
        height: LTX_ROW_H * LTX_VISIBLE, overflowY: "auto", overflowX: "hidden",
      }}>
        {displayList.length > 0
          ? displayList.map((tx, i) => renderRow(tx, `${tx.id}-${i}`))
          : <div style={{ padding: 16, textAlign: "center", color: "var(--vp-muted)", fontSize: 12 }}>—</div>
        }
      </div>
    </div>
  );
}

// ─── Live data hook ───────────────────────────────────────
function useLiveTx(internalTestMode: boolean) {
  const [items, setItems] = useState<Array<{ id: string; userRefMasked: string; amountDisplay: string; kind: "deposit" | "withdraw" }>>([]);
  useEffect(() => {
    if (internalTestMode) {
      setItems(Array.from({ length: 6 }, (_, i) => ({
        id: `demo-${i}`,
        userRefMasked: `60******${String(i).padStart(3, "0")}`,
        amountDisplay: `RM ${(100 + i * 55).toFixed(2)}`,
        kind: i % 2 === 0 ? "deposit" : "withdraw",
      })));
      return;
    }
    fetch("/api/public/live-transactions?limit=12", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((json) => { const raw = Array.isArray(json?.items) ? json.items : []; setItems(raw.slice(0, 8)); })
      .catch(() => {});
  }, [internalTestMode]);
  return items;
}

// ─── Category icons ───────────────────────────────────────
const CAT_ICONS: Record<string, string> = {
  Casino: "🎰", Sportbook: "⚽", Slots: "🎰", "E-Sports": "🕹️", Poker: "🃏", Fishing: "🎣",
};

// ═══════════════════════════════════════════════════════════
export function VividHomeClient({
  siteName = "KINGDOM888",
  promotions = [],
  games = [],
  loginUrl = "/login",
  registerUrl = "/register-wa",
  depositUrl = "/deposit",
  internalTestMode = false,
  uiText = {},
  heroBanners = [],
  announcementMarqueeText = null,
  marqueeMessages = [],
  marqueeBg = null,
  marqueeBorder = null,
  marqueeTextColor = null,
  livetxDepositColor = null,
  livetxWithdrawColor = null,
  referralBlockBg = null,
  referralBlockBorder = null,
  quickActions: themeQuickActions = [],
  uiGameCategories: themeCategories = [],
}: {
  siteName?: string;
  promotions?: Promo[];
  games?: Game[];
  loginUrl?: string;
  registerUrl?: string;
  depositUrl?: string;
  internalTestMode?: boolean;
  uiText?: Record<string, string>;
  heroBanners?: HeroBanner[];
  announcementMarqueeText?: string | null;
  marqueeMessages?: string[];
  marqueeBg?: string | null;
  marqueeBorder?: string | null;
  marqueeTextColor?: string | null;
  livetxDepositColor?: string | null;
  livetxWithdrawColor?: string | null;
  referralBlockBg?: string | null;
  referralBlockBorder?: string | null;
  quickActions?: QuickAction[];
  uiGameCategories?: string[];
}) {
  const { t } = useLocale();
  const liveTxItems = useLiveTx(internalTestMode);

  // ── i18n helpers ─────────────────────────────────────────
  const txTitle    = (t("public.vivid.liveTable.title")    || "实时交易") as string;
  const txDeposit  = (t("public.vivid.liveTable.deposit")  || "存款")     as string;
  const txWithdraw = (t("public.vivid.liveTable.withdraw") || "提款")     as string;
  const txLive     = (t("public.vivid.liveTable.live")     || "实时")     as string;

  // ── Quick actions ─────────────────────────────────────────
  const validThemeActions = themeQuickActions.filter((a) => a.label?.trim() && a.url?.trim());
  const QUICK_ACTIONS = validThemeActions.length > 0
    ? validThemeActions.slice(0, 4).map((a) => ({ label: a.label, href: a.url, iconUrl: a.iconUrl ?? null, icon: "💰" }))
    : [
        { label: t("public.actions.deposit")  as string || "存款",  href: depositUrl,  iconUrl: null, icon: "💰" },
        { label: t("public.actions.withdraw") as string || "提款",  href: "/withdraw", iconUrl: null, icon: "📤" },
        { label: t("public.vivid.bottomNav.bonus") as string || "奖金", href: "/bonus",  iconUrl: null, icon: "🎁" },
        { label: t("public.nav.support")      as string || "客服",  href: "/chat",     iconUrl: null, icon: "💬" },
      ];

  // ── Game categories ──────────────────────────────────────
  const categories = useMemo<UiGameCategory[]>(() => {
    const allowed = new Set<UiGameCategory>(UI_GAME_CATEGORIES);
    const fromTheme = themeCategories.filter((c): c is UiGameCategory => allowed.has(c as UiGameCategory));
    return fromTheme.length > 0 ? fromTheme : [...UI_GAME_CATEGORIES];
  }, [themeCategories]);

  const [activeCat, setActiveCat] = useState<UiGameCategory>(() => categories[0] ?? "Slots");
  const filteredGames = useMemo(
    () => games.filter((g) => inferUiGameCategory(g.name, g.code) === activeCat),
    [games, activeCat]
  );

  // ── Hero slides ──────────────────────────────────────────
  const topPromos = promotions.slice(0, 5);
  const heroSlides = heroBanners
    .filter((b) => b.imageUrl?.trim()).slice(0, 5)
    .map((b, i) => ({ id: `hero-${i}`, imageUrl: b.imageUrl, linkUrl: b.linkUrl ?? null }));
  const fallbackSlides = topPromos
    .filter((p) => p.coverUrl?.trim()).slice(0, 5)
    .map((p) => ({ id: `promo-${p.id}`, imageUrl: p.coverUrl as string, linkUrl: "/promotion" }));
  const displayHeroSlides = heroSlides.length > 0 ? heroSlides : fallbackSlides;

  return (
    <div className="vp-shell">
      <VividTopbar siteName={siteName} loginUrl={loginUrl} registerUrl={registerUrl} />

      <AnnouncementMarquee
        text={announcementMarqueeText ?? (marqueeMessages.length > 0 ? undefined : (t("public.marquee.welcome") ?? "Welcome — Latest promotions and updates"))}
        messages={marqueeMessages.length > 0 ? marqueeMessages : undefined}
        variant="vivid"
        marqueeBg={marqueeBg}
        marqueeBorder={marqueeBorder}
        textColor={marqueeTextColor}
      />

      {/* ══════════════ TWO-COLUMN LAYOUT ══════════════ */}
      <div style={{ display: "flex", alignItems: "flex-start", minHeight: "calc(100vh - 120px)" }}>

        {/* ── LEFT COLUMN (fixed 380px) ─────────────────── */}
        <div style={{
          width: 380, flexShrink: 0,
          borderRight: "1px solid rgba(120,80,255,0.15)",
          padding: "16px 16px 80px",
          display: "flex", flexDirection: "column", gap: 16,
          overflowY: "auto", maxHeight: "calc(100vh - 120px)", position: "sticky", top: 0,
        }}>

          {/* 1. Banner */}
          {displayHeroSlides.length > 0 && (
            <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(120,80,255,0.2)" }}>
              <HeroPromotionSlider compact slides={displayHeroSlides} />
            </div>
          )}

          {/* 2. Quick Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.label} href={a.href} style={{
                ...CARD, height: 82, padding: "12px 6px 10px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 7, textDecoration: "none", color: "var(--vp-text)",
              }}>
                {a.iconUrl ? (
                  <div style={{ width: 32, height: 32, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                    <FallbackImage src={a.iconUrl} alt="" className="w-full h-full object-cover object-center" />
                  </div>
                ) : (
                  <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{a.icon}</span>
                )}
                <span style={{ fontSize: 11, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{a.label}</span>
              </Link>
            ))}
          </div>

          {/* 3. Live Transactions */}
          <DesktopLiveList
            items={liveTxItems}
            depositLabel={txDeposit}
            withdrawLabel={txWithdraw}
            liveLabel={txLive}
            titleText={txTitle}
            depositColor={livetxDepositColor}
            withdrawColor={livetxWithdrawColor}
          />

          {/* 4. Referral Block */}
          <ReferralBlock
            registerPath={registerUrl}
            loginPath={loginUrl}
            blockBg={referralBlockBg}
            blockBorder={referralBlockBorder}
          />

        </div>{/* end left column */}

        {/* ── RIGHT COLUMN (flex-1: categories + games) ─── */}
        <div style={{ flex: 1, minWidth: 0, padding: "16px 20px 80px", overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>

          {/* Category chips */}
          <div style={{
            display: "flex", gap: 10, paddingBottom: 16,
            overflowX: "auto", flexWrap: "nowrap",
          }} className="ui-hide-scrollbar">
            {categories.map((c) => {
              const active = c === activeCat;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCat(c)}
                  style={{
                    flexShrink: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 6,
                    height: 80, minWidth: 80, padding: "0 16px",
                    borderRadius: 14,
                    border: active ? "2px solid var(--vp-accent)" : "1.5px solid rgba(120,80,255,0.25)",
                    background: active
                      ? "linear-gradient(145deg,rgba(168,85,247,0.35),rgba(99,102,241,0.3))"
                      : "rgba(19,19,42,0.6)",
                    color: active ? "#e0d0ff" : "rgba(157,149,201,0.75)",
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                    transition: "all .15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ fontSize: 22 }}>{CAT_ICONS[c] ?? "🎮"}</span>
                  <span style={{ fontSize: 10, letterSpacing: "0.4px", textTransform: "uppercase" }}>
                    {t(`public.vivid.games.cat.${c}`) || c}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Provider/Game grid — 5 columns */}
          {filteredGames.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
              {filteredGames.map((g) => (
                <Link
                  key={g.id}
                  href={`/games/play/${encodeURIComponent(g.id)}`}
                  style={{
                    ...CARD,
                    textDecoration: "none",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: 12, gap: 8,
                    transition: "border-color .15s, box-shadow .15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(168,85,247,0.55)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(168,85,247,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(120,80,255,0.2)";
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    width: "100%", aspectRatio: "1/1",
                    borderRadius: 12, overflow: "hidden",
                    background: "linear-gradient(135deg,rgba(100,60,200,0.2),rgba(60,40,140,0.35))",
                    border: "1px solid rgba(160,100,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 36,
                  }}>
                    {g.logoUrl
                      ? <FallbackImage src={g.logoUrl} alt={g.name} className="h-full w-full object-cover object-center" />
                      : <span style={{ opacity: 0.6 }}>🎮</span>
                    }
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "rgba(220,210,255,0.85)",
                    textAlign: "center", lineHeight: 1.3, minHeight: 28,
                    width: "100%", overflow: "hidden",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                  }}>
                    {g.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--vp-muted)", fontSize: 14 }}>
              {t("public.vivid.games.noGames") || "暂无游戏"}
            </div>
          )}

        </div>{/* end right column */}

      </div>{/* end two-column */}

      <VividFooter siteName={siteName} />
    </div>
  );
}

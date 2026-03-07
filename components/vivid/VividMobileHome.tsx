"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react";
import "@/styles/vivid-portal.css";
import { FallbackImage } from "@/components/FallbackImage";
import { AnnouncementMarquee } from "@/components/public/AnnouncementMarquee";
import { HeroPromotionSlider } from "@/components/public/HeroPromotionSlider";
import { ReferralBlock } from "@/components/public/ReferralBlock";
import { inferUiGameCategory, UI_GAME_CATEGORIES, type UiGameCategory } from "@/lib/public/uiGameCategories";
import type { ThemeConfig } from "@/lib/public/theme";
import type { PublicPromotion } from "@/components/public/PromotionCard";
import { PromotionModal } from "@/components/public/PromotionModal";
import { useLocale } from "@/lib/i18n/context";

// ─── Design tokens ────────────────────────────────────────
// All modules share the same container (px-4) and spacing (gap-4 / mt-4).
// Card radius: 16px | Banner: 20px | Chip: 9999px | Button: 12px
// ──────────────────────────────────────────────────────────

type Game = { id: string; name: string; logoUrl: string | null; code?: string | null };
type Promo = PublicPromotion;

// ─── Shared Section Header ────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <span style={{
        width: 4, height: 18, borderRadius: 2, flexShrink: 0,
        background: "linear-gradient(180deg,var(--vp-accent),var(--vp-accent2))",
        display: "inline-block",
      }} />
      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--vp-text)", lineHeight: 1 }}>
        {title}
      </span>
    </div>
  );
}

// ─── Shared Card Shell ────────────────────────────────────
const CARD: React.CSSProperties = {
  background: "var(--vp-card)",
  border: "1px solid rgba(120,80,255,0.2)",
  borderRadius: 16,
};

// ─── Live tx row height ───────────────────────────────────
const LIVE_TX_ROW_HEIGHT = 44;
const LIVE_TX_VISIBLE_ROWS = 5;

// ─── Mobile Live Tx List ─────────────────────────────────
function MobileLiveList({
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
  const displayList = items.slice(0, LIVE_TX_VISIBLE_ROWS);

  function renderRow(
    tx: { id: string; userRefMasked: string; amountDisplay: string; kind: "deposit" | "withdraw" },
    i: number,
    key: string
  ) {
    const isDeposit = tx.kind === "deposit";
    const dColor = depositColor ?? "#4ade80";
    const wColor = withdrawColor ?? "#fbbf24";
    const txColor = isDeposit ? dColor : wColor;
    return (
      <div
        key={key}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: LIVE_TX_ROW_HEIGHT,
          height: LIVE_TX_ROW_HEIGHT,
          padding: "0 16px",
          borderBottom: "1px solid rgba(120,80,255,0.18)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
            background: `${txColor}26`,
            color: txColor,
            border: `1px solid ${txColor}55`,
            textTransform: "uppercase",
            flexShrink: 0,
          }}>
            {isDeposit ? depositLabel : withdrawLabel}
          </span>
          <span style={{
            fontSize: 13, fontWeight: 600, letterSpacing: "0.3px",
            color: "rgba(230,222,255,0.88)",
            fontFamily: "'tabular-nums', monospace",
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
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px 10px",
        borderBottom: "1px solid rgba(120,80,255,0.15)",
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
      {/* Static list — 5 rows */}
      <div style={{ height: LIVE_TX_ROW_HEIGHT * LIVE_TX_VISIBLE_ROWS }}>
        {displayList.length > 0 ? displayList.map((tx, i) => renderRow(tx, i, tx.id)) : (
          <div style={{ padding: "16px", textAlign: "center", color: "var(--vp-muted)", fontSize: 12 }}>—</div>
        )}
      </div>
    </div>
  );
}

// ─── Default quick actions ────────────────────────────────
const QUICK_ACTION_DEFS = [
  { key: "deposit",  href: "/deposit",  icon: "💰" },
  { key: "withdraw", href: "/withdraw", icon: "📤" },
  { key: "bonus",    href: "/bonus",    icon: "🎁" },
  { key: "support",  href: "/chat",     icon: "💬" },
];

// ─── Live data hook (inline, tiny) ───────────────────────
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
      .then((json) => {
        const raw = Array.isArray(json?.items) ? json.items : [];
        setItems(raw.slice(0, 8));
      })
      .catch(() => {});
  }, [internalTestMode]);
  return items;
}

// ─── Category icons (emoji placeholder — replace with image URLs) ────────────
const CAT_ICONS: Record<string, string> = {
  Casino:    "🎰",
  Sportbook: "⚽",
  Slots:     "🎰",
  "E-Sports": "🕹️",
  Poker:     "🃏",
  Fishing:   "🎣",
};

// ═══════════════════════════════════════════════════════════
export function VividMobileHome({
  theme,
  promotions = [],
  games = [],
  internalTestMode = false,
}: {
  theme: ThemeConfig;
  promotions?: Promo[];
  games?: Game[];
  internalTestMode?: boolean;
}) {
  const { t, locale, setLocale } = useLocale();
  const siteName = theme.siteName ?? "KINGDOM888";
  const loginUrl = theme.loginUrl ?? "/login";

  // ── Language picker ──────────────────────────────────────
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen]);
  const LANGS = [
    { code: "EN", label: "English",       locale: "en" as const },
    { code: "ZH", label: "华语",          locale: "zh" as const },
    { code: "MY", label: "Bahasa Melayu", locale: "ms" as const },
  ];
  const activeLang = LANGS.find((l) => l.locale === locale)?.code ?? "EN";
  const registerUrl = theme.registerUrl ?? "/register-wa";

  // ── Live Tx ──────────────────────────────────────────────
  const liveTxItems = useLiveTx(internalTestMode);

  // ── Quick Actions ────────────────────────────────────────
  const themeQuickActions = (theme.quickActions ?? []).filter((a) => a.label?.trim() && a.url?.trim());
  const QUICK_ACTIONS = themeQuickActions.length > 0
    ? themeQuickActions.slice(0, 4).map((a) => ({ label: a.label, href: a.url, iconUrl: a.iconUrl ?? null, icon: "💰" }))
    : QUICK_ACTION_DEFS.map((a) => ({
        href: a.href,
        icon: a.icon,
        iconUrl: null as string | null,
        label: t(`public.vivid.quickActions.${a.key}`) as string,
      }));

  // ── Game categories ──────────────────────────────────────
  const categories = useMemo<UiGameCategory[]>(() => {
    const allowed = new Set<UiGameCategory>(UI_GAME_CATEGORIES);
    const fromTheme = (theme.uiGameCategories ?? []).filter(
      (c): c is UiGameCategory => allowed.has(c as UiGameCategory)
    );
    return fromTheme.length > 0 ? fromTheme : [...UI_GAME_CATEGORIES];
  }, [theme.uiGameCategories]);

  const [activeCat, setActiveCat] = useState<UiGameCategory>(() => categories[0] ?? "Slots");
  const [selectedPromo, setSelectedPromo] = useState<PublicPromotion | null>(null);

  const filteredGames = useMemo(
    () => games.filter((g) => inferUiGameCategory(g.name, g.code) === activeCat).slice(0, 18),
    [games, activeCat]
  );

  // ── Hero slides ──────────────────────────────────────────
  const topPromos = promotions.slice(0, 6);
  const heroSlides = (theme.heroBanners ?? [])
    .filter((b) => b.imageUrl?.trim())
    .slice(0, 5)
    .map((b, i) => ({ id: `hero-${i}`, imageUrl: b.imageUrl, linkUrl: b.linkUrl ?? null }));
  const fallbackSlides = topPromos
    .filter((p) => p.coverUrl?.trim())
    .slice(0, 5)
    .map((p) => ({ id: `promo-${p.id}`, imageUrl: p.coverUrl as string, linkUrl: "/promotion" }));
  const displayHeroSlides = heroSlides.length > 0 ? heroSlides : fallbackSlides;

  // ── i18n helpers ─────────────────────────────────────────
  const txTitle       = (t("public.vivid.liveTable.title")    || "实时交易") as string;
  const txDeposit     = (t("public.vivid.liveTable.deposit")  || "存款")     as string;
  const txWithdraw    = (t("public.vivid.liveTable.withdraw") || "提款")     as string;
  const txLive        = (t("public.vivid.liveTable.live")     || "实时")     as string;

  return (
    <div className="vp-shell lg:hidden" style={{ paddingBottom: 80 }}>

      {/* ══════════════ 1. HEADER ══════════════ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        height: 58,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
        background: "var(--vp-topbar-bg)",
        borderBottom: "1px solid var(--vp-topbar-border)",
        backdropFilter: "blur(12px)",
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          {theme.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={theme.logoUrl} alt={siteName} style={{ height: 58, width: "auto", objectFit: "contain", maxWidth: 200 }} />
          ) : (
            <span style={{
              fontSize: 17, fontWeight: 800,
              background: "linear-gradient(90deg,var(--vp-accent),var(--vp-accent2))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {siteName}
            </span>
          )}
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>

          {/* 🌐 Language picker */}
          <div ref={langRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              style={{
                height: 36, padding: "0 10px", borderRadius: 12,
                border: "1.5px solid rgba(120,80,255,0.35)",
                background: "transparent", color: "#d0c8ff",
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 14 }}>🌐</span>
              <span>{activeLang}</span>
            </button>
            {langOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                minWidth: 160, background: "var(--vp-card)",
                border: "1px solid var(--vp-border)", borderRadius: 12,
                padding: 6, zIndex: 200,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}>
                {LANGS.map((l) => {
                  const isActive = locale === l.locale;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => { setLocale(l.locale); setLangOpen(false); }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        width: "100%", padding: "10px 14px", borderRadius: 8,
                        border: "none",
                        background: isActive ? "rgba(176,96,255,0.22)" : "transparent",
                        color: isActive ? "#d4a0ff" : "rgba(255,255,255,0.7)",
                        fontSize: 14, fontWeight: isActive ? 700 : 500, cursor: "pointer",
                      }}
                    >
                      <span>{l.label}</span>
                      <span style={{ fontSize: 11, opacity: 0.5 }}>{l.code}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Link href={loginUrl} style={{
            height: 36, padding: "0 16px", borderRadius: 12,
            border: "1.5px solid rgba(120,80,255,0.4)", color: "#f0eeff",
            display: "flex", alignItems: "center", fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>
            {t("public.actions.login")}
          </Link>
          <Link href={registerUrl} style={{
            height: 36, padding: "0 16px", borderRadius: 12,
            background: "linear-gradient(135deg,var(--vp-accent),var(--vp-accent2))",
            color: "#fff", display: "flex", alignItems: "center",
            fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>
            {t("public.actions.register")}
          </Link>
        </div>
      </header>

      {/* ══════════════ 2. ANNOUNCEMENT BAR ══════════════ */}
      <AnnouncementMarquee
        text={theme.announcementMarqueeText ?? (theme.marqueeMessages?.length ? undefined : (t("public.marquee.welcome") ?? "Welcome — Latest promotions and updates"))}
        messages={theme.marqueeMessages?.length ? theme.marqueeMessages : undefined}
        variant="vivid"
        marqueeBg={theme.marqueeBg}
        marqueeBorder={theme.marqueeBorder}
        textColor={theme.marqueeTextColor}
      />

      {/* ══════════════ PAGE CONTAINER ══════════════ */}
      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ══════════════ 3. HERO BANNER (carousel, no welcome card) ══════════════ */}
        {displayHeroSlides.length > 0 ? (
          <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(120,80,255,0.2)" }}>
            <HeroPromotionSlider compact slides={displayHeroSlides} />
          </div>
        ) : null}

        {/* ══════════════ 4. QUICK ACTIONS ══════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              style={{
                ...CARD,
                height: 82,
                padding: "12px 6px 10px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 7, textDecoration: "none", color: "var(--vp-text)",
              }}
            >
              {a.iconUrl ? (
                <div style={{ width: 32, height: 32, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                  <FallbackImage src={a.iconUrl} alt="" className="w-full h-full object-cover object-center" />
                </div>
              ) : (
                <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{a.icon}</span>
              )}
              <span style={{ fontSize: 11, fontWeight: 600, textAlign: "center", lineHeight: 1.2, color: "var(--vp-text)" }}>
                {a.label}
              </span>
            </Link>
          ))}
        </div>

        {/* ══════════════ 5. LIVE TRANSACTIONS ══════════════ */}
        <div>
          <MobileLiveList
            items={liveTxItems}
            depositLabel={txDeposit}
            withdrawLabel={txWithdraw}
            liveLabel={txLive}
            titleText={txTitle}
            depositColor={theme.livetxDepositColor}
            withdrawColor={theme.livetxWithdrawColor}
          />
        </div>

        {/* ══════════════ 6. PROMOTIONS ══════════════ */}
        {topPromos.length > 0 && (
          <div>
            <SectionHeader title={t("public.vivid.section.promos") as string || "最新活动"} />
            <div
              className="scroll-touch-horizontal"
              style={{ display: "flex", gap: 12, paddingBottom: 4, overflowX: "auto" }}
            >
              {topPromos.map((p) => (
                <div
                  key={p.id}
                  style={{
                    flexShrink: 0,
                    width: 240,
                    ...CARD,
                    display: "flex", flexDirection: "column",
                  }}
                >
                  {/* Image — 1:1 ratio per UI system (object-cover center) */}
                  <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", borderRadius: "16px 16px 0 0", background: "var(--vp-card)" }}>
                    {(p.coverUrlMobilePromo || p.coverUrl) ? (
                      p.promoLink ? (
                        <a href={p.promoLink} target="_blank" rel="noopener noreferrer" style={{ display: "block", height: "100%" }}>
                          <FallbackImage src={p.coverUrlMobilePromo || p.coverUrl} alt={p.title} className="h-full w-full object-cover object-center" />
                        </a>
                      ) : (
                        <FallbackImage src={p.coverUrlMobilePromo || p.coverUrl} alt={p.title} className="h-full w-full object-cover object-center" />
                      )
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🎁</div>
                    )}
                  </div>
                  {/* Body */}
                  <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    {/* Title — fixed 2-line min-height */}
                    <p style={{
                      margin: 0, fontSize: 13, fontWeight: 700, color: "var(--vp-text)",
                      lineHeight: 1.4, minHeight: 36,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {p.title}
                    </p>
                    {/* Buttons — fixed height row */}
                    <div style={{ display: "flex", gap: 8, height: 36, flexShrink: 0 }}>
                      <Link
                        href="/deposit"
                        className="vp-btn vp-btn-primary"
                        style={{ flex: 1, height: 36, fontSize: 13, minWidth: 0 }}
                      >
                        {t("public.vivid.promo.claim") || "领取"}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedPromo(p)}
                        className="vp-btn vp-btn-outline"
                        style={{
                          flexShrink: 0, height: 36, fontSize: 11, padding: "0 10px",
                          background: "rgba(245,158,11,0.15)",
                          borderColor: "rgba(245,158,11,0.4)",
                          color: "#fcd34d",
                        }}
                      >
                        {t("public.vivid.promo.tnc") || "条款"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════ 7. REFERRAL BLOCK ══════════════ */}
        <div>
          <ReferralBlock
            registerPath={theme.registerUrl ?? "/register-wa"}
            loginPath={theme.loginUrl ?? "/login"}
            blockBg={theme.referralBlockBg}
            blockBorder={theme.referralBlockBorder}
            bannerImageUrl={theme.referralBannerImageUrl}
          />
        </div>

        {/* ══════════════ 8. HOT GAMES ══════════════ */}
        <div>
          <SectionHeader title={t("public.vivid.section.games") as string || "热门游戏"} />

          {/* Category cards — icon + label, horizontal scroll */}
          <div
            className="scroll-touch-horizontal"
            style={{ display: "flex", gap: 10, paddingBottom: 12, overflowX: "auto" }}
          >
            {categories.map((c) => {
              const active = c === activeCat;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCat(c)}
                  style={{
                    flexShrink: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 6,
                    width: 72, height: 72,
                    borderRadius: 14,
                    border: active
                      ? "2px solid var(--vp-accent)"
                      : "1.5px solid rgba(120,80,255,0.25)",
                    background: active
                      ? "linear-gradient(145deg,rgba(168,85,247,0.35),rgba(99,102,241,0.3))"
                      : "rgba(19,19,42,0.6)",
                    color: active ? "#e0d0ff" : "rgba(157,149,201,0.75)",
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>
                    {CAT_ICONS[c] ?? "🎮"}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.3px", textTransform: "uppercase",
                    textAlign: "center", lineHeight: 1.2,
                    maxWidth: 64, overflow: "hidden",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                  }}>
                    {t(`public.vivid.games.cat.${c}`) || c}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Game grid — 3 columns */}
          {filteredGames.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {filteredGames.slice(0, 9).map((g) => (
                <Link
                  key={g.id}
                  href={`/games/play/${encodeURIComponent(g.id)}`}
                  style={{
                    ...CARD,
                    textDecoration: "none",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: 12, gap: 8,
                  }}
                >
                  {/* Icon container — fixed square */}
                  <div style={{
                    width: "100%", aspectRatio: "1/1",
                    borderRadius: 12, overflow: "hidden",
                    background: "linear-gradient(135deg,rgba(100,60,200,0.2),rgba(60,40,140,0.35))",
                    border: "1px solid rgba(160,100,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32,
                  }}>
                    {g.logoUrl
                      ? <FallbackImage src={g.logoUrl} alt={g.name} className="h-full w-full object-cover object-center" />
                      : <span style={{ opacity: 0.6 }}>🎮</span>}
                  </div>
                  {/* Title — min-height ensures alignment */}
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "rgba(220,210,255,0.85)",
                    textAlign: "center", lineHeight: 1.3, minHeight: 28,
                    width: "100%", overflow: "hidden",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  }}>
                    {g.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--vp-muted)", fontSize: 13 }}>
              {t("public.vivid.games.noGames") || "暂无游戏"}
            </div>
          )}
        </div>

      </div>{/* end page container */}

      <PromotionModal
        promo={selectedPromo}
        onClose={() => setSelectedPromo(null)}
        routeBonus="/bonus"
      />
    </div>
  );
}

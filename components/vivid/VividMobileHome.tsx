"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, type CSSProperties } from "react";
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

// ═══════════════════════════════════════════════════════════
// Design System Tokens
// ═══════════════════════════════════════════════════════════
// Card:   gradient bg, subtle purple border, soft shadow
// Banner: 20px radius + deeper shadow
// Chip:   full radius, active = gradient glow
// ───────────────────────────────────────────────────────────

const CARD: CSSProperties = {
  background: "linear-gradient(160deg, rgba(28,16,60,0.96) 0%, rgba(14,9,36,0.98) 100%)",
  border: "1px solid rgba(120,80,255,0.18)",
  borderRadius: 16,
  boxShadow: "0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
};

const CARD_LIFT: CSSProperties = {
  ...CARD,
  boxShadow: "0 6px 28px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
};

// ═══════════════════════════════════════════════════════════
// SectionHeader — left accent bar + glow
// ═══════════════════════════════════════════════════════════
function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
      <span style={{
        width: 4, height: 20, borderRadius: 2, flexShrink: 0,
        background: "linear-gradient(180deg,#c084fc,#818cf8)",
        boxShadow: "0 0 10px rgba(192,132,252,0.6)",
        display: "inline-block",
      }} />
      <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "0.15px" }}>
        {title}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AnimatedLiveTicker
// — smooth vertical infinite scroll ticker
// — premium monospace account typography
// — animated LIVE badge with ping dot
// ═══════════════════════════════════════════════════════════
type TxRow = { id: string; userRefMasked: string; amountDisplay: string; kind: "deposit" | "withdraw" };

const ACCT_FONT = "'SF Mono','Roboto Mono','Consolas','Courier New',monospace";

function AnimatedLiveTicker({
  items, depositLabel, withdrawLabel, liveLabel, titleText, depositColor, withdrawColor,
}: {
  items: TxRow[];
  depositLabel: string;
  withdrawLabel: string;
  liveLabel: string;
  titleText: string;
  depositColor?: string | null;
  withdrawColor?: string | null;
}) {
  const ITEM_H = 54;  // px per row
  const VISIBLE = 4;  // rows shown at once

  const [queue, setQueue] = useState<TxRow[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // Initialise / refresh queue when items change
  useEffect(() => {
    if (items.length === 0) return;
    setQueue(Array.from({ length: VISIBLE + 1 }, (_, i) => items[i % items.length]));
  }, [items]);

  // Auto-advance ticker every 2.8 s
  useEffect(() => {
    if (queue.length < 2) return;
    let resetId: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setTransitioning(true);
      setScrollY(-ITEM_H);
      resetId = setTimeout(() => {
        // Rotate first item to end, snap back instantly (no transition)
        setTransitioning(false);
        setScrollY(0);
        setQueue(prev => prev.length > 0 ? [...prev.slice(1), prev[0]] : prev);
      }, 420);
    }, 2800);
    return () => { clearInterval(id); clearTimeout(resetId); };
  }, [queue.length]);

  const dColor = depositColor ?? "#4ade80";
  const wColor = withdrawColor ?? "#fbbf24";

  return (
    <div style={{ ...CARD_LIFT, overflow: "hidden" }}>
      {/* ── header row ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "11px 16px 9px",
        borderBottom: "1px solid rgba(120,80,255,0.1)",
        background: "rgba(0,0,0,0.15)",
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "0.1px" }}>
          {titleText}
        </span>
        {/* LIVE badge with animated ping dot */}
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 999, padding: "3px 10px 3px 8px",
          fontSize: 10, fontWeight: 800, color: "#f87171", letterSpacing: "0.08em",
        }}>
          {/* ping dot */}
          <span className="relative inline-flex h-2 w-2 shrink-0" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500/70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          {liveLabel}
        </span>
      </div>

      {/* ── column label bar ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        padding: "5px 16px",
        background: "rgba(0,0,0,0.18)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(160,150,200,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>账号</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(160,150,200,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>金额</span>
      </div>

      {/* ── animated rows ── */}
      {queue.length === 0 ? (
        <div style={{ height: ITEM_H * VISIBLE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: "rgba(190,180,240,0.3)" }}>加载中…</span>
        </div>
      ) : (
        <div style={{ height: ITEM_H * VISIBLE, overflow: "hidden" }}>
          <div style={{
            transform: `translateY(${scrollY}px)`,
            transition: transitioning ? "transform 400ms cubic-bezier(0.4,0,0.2,1)" : "none",
          }}>
            {queue.map((tx, i) => {
              const isDeposit = tx.kind === "deposit";
              const txColor = isDeposit ? dColor : wColor;
              return (
                <div
                  key={`${tx.id}-${i}`}
                  style={{
                    height: ITEM_H,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Left: badge + account */}
                  <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 999,
                      background: `${txColor}18`, color: txColor, border: `1px solid ${txColor}40`,
                      textTransform: "uppercase", letterSpacing: "0.07em", flexShrink: 0,
                    }}>
                      {isDeposit ? depositLabel : withdrawLabel}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      fontFamily: ACCT_FONT,
                      color: "rgba(218,210,255,0.82)",
                      letterSpacing: "0.35px",
                      fontVariantNumeric: "tabular-nums",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {tx.userRefMasked}
                    </span>
                  </div>
                  {/* Right: amount */}
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    fontFamily: ACCT_FONT,
                    color: txColor,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "0.2px",
                    flexShrink: 0, marginLeft: 8,
                  }}>
                    {tx.amountDisplay}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// useLiveTx — fetch live transactions
// ═══════════════════════════════════════════════════════════
function useLiveTx(internalTestMode: boolean): TxRow[] {
  const [items, setItems] = useState<TxRow[]>([]);
  useEffect(() => {
    if (internalTestMode) {
      setItems(Array.from({ length: 10 }, (_, i) => ({
        id: `demo-${i}`,
        userRefMasked: `60******${String(i).padStart(3, "0")}`,
        amountDisplay: `RM ${(100 + i * 55).toFixed(2)}`,
        kind: i % 2 === 0 ? "deposit" : "withdraw",
      })));
      return;
    }
    fetch("/api/public/live-transactions?limit=16", { cache: "no-store" })
      .then(r => r.ok ? r.json() : { items: [] })
      .then(json => { if (Array.isArray(json?.items)) setItems(json.items.slice(0, 12)); })
      .catch(() => {});
  }, [internalTestMode]);
  return items;
}

// ═══════════════════════════════════════════════════════════
// Default quick actions (with per-icon glow color)
// ═══════════════════════════════════════════════════════════
const QUICK_ACTION_DEFS = [
  { key: "deposit",  href: "/deposit",  icon: "💰", glow: "rgba(34,197,94,0.3)"    },
  { key: "withdraw", href: "/withdraw", icon: "📤", glow: "rgba(251,191,36,0.3)"   },
  { key: "bonus",    href: "/bonus",    icon: "🎁", glow: "rgba(168,85,247,0.35)"  },
  { key: "support",  href: "/chat",     icon: "💬", glow: "rgba(59,130,246,0.3)"   },
];

// ═══════════════════════════════════════════════════════════
// VividMobileHome — main export
// ═══════════════════════════════════════════════════════════
type Game = { id: string; name: string; logoUrl: string | null; code?: string | null };

export function VividMobileHome({
  theme,
  promotions = [],
  games = [],
  internalTestMode = false,
}: {
  theme: ThemeConfig;
  promotions?: PublicPromotion[];
  games?: Game[];
  internalTestMode?: boolean;
}) {
  const { t } = useLocale();
  const siteName    = theme.siteName    ?? "KINGDOM888";
  const loginUrl    = theme.loginUrl    ?? "/login";
  const registerUrl = theme.registerUrl ?? "/register-wa";

  const liveTxItems = useLiveTx(internalTestMode);

  // ── Quick Actions ────────────────────────────────────────
  const themeQA = (theme.quickActions ?? []).filter(a => a.label?.trim() && a.url?.trim());
  const QUICK_ACTIONS = themeQA.length > 0
    ? themeQA.slice(0, 4).map((a, i) => ({
        label: a.label, href: a.url,
        iconUrl: a.iconUrl ?? null,
        icon: QUICK_ACTION_DEFS[i]?.icon ?? "⚡",
        glow: QUICK_ACTION_DEFS[i]?.glow ?? "rgba(168,85,247,0.3)",
      }))
    : QUICK_ACTION_DEFS.map(a => ({
        href: a.href, icon: a.icon, glow: a.glow,
        iconUrl: null as string | null,
        label: t(`public.vivid.quickActions.${a.key}`) as string,
      }));

  // ── Game categories ──────────────────────────────────────
  const categories = useMemo<UiGameCategory[]>(() => {
    const allowed = new Set<UiGameCategory>(UI_GAME_CATEGORIES);
    const fromTheme = (theme.uiGameCategories ?? []).filter(c => allowed.has(c as UiGameCategory));
    return fromTheme.length > 0 ? fromTheme : [...UI_GAME_CATEGORIES];
  }, [theme.uiGameCategories]);

  const [activeCat, setActiveCat] = useState<UiGameCategory>(() => categories[0] ?? "Slots");
  const [selectedPromo, setSelectedPromo] = useState<PublicPromotion | null>(null);
  const filteredGames = useMemo(
    () => games.filter(g => inferUiGameCategory(g.name, g.code) === activeCat).slice(0, 9),
    [games, activeCat]
  );

  // ── Hero slides ──────────────────────────────────────────
  const topPromos = promotions.slice(0, 6);
  const heroSlides = (theme.heroBanners ?? [])
    .filter(b => b.imageUrl?.trim()).slice(0, 5)
    .map((b, i) => ({ id: `hero-${i}`, imageUrl: b.imageUrl, linkUrl: b.linkUrl ?? null }));
  const fallbackSlides = topPromos
    .filter(p => p.coverUrl?.trim()).slice(0, 5)
    .map(p => ({ id: `promo-${p.id}`, imageUrl: p.coverUrl as string, linkUrl: "/promotion" }));
  const displayHeroSlides = heroSlides.length > 0 ? heroSlides : fallbackSlides;
  const promoImgH = theme.vividPromoCardConfig?.imgHeight ?? 140;

  // ── i18n ─────────────────────────────────────────────────
  const txTitle    = (t("public.vivid.liveTable.title")    || "实时交易") as string;
  const txDeposit  = (t("public.vivid.liveTable.deposit")  || "存款")     as string;
  const txWithdraw = (t("public.vivid.liveTable.withdraw") || "提款")     as string;
  const txLive     = (t("public.vivid.liveTable.live")     || "LIVE")     as string;

  // ══════════════════════════════════════════════════════════
  return (
    <div className="vp-shell lg:hidden" style={{ paddingBottom: 80 }}>

      {/* ── 1. HEADER ─────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
        background: "rgba(8,4,20,0.96)",
        borderBottom: "1px solid rgba(120,80,255,0.18)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        <span style={{
          fontSize: 19, fontWeight: 900, letterSpacing: "0.6px",
          background: "linear-gradient(90deg,#c084fc 0%,#a78bfa 50%,#818cf8 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          {siteName}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={loginUrl} style={{
            height: 36, padding: "0 16px", borderRadius: 12,
            border: "1.5px solid rgba(120,80,255,0.35)",
            color: "#ddd6fe", background: "rgba(120,80,255,0.1)",
            display: "flex", alignItems: "center",
            fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}>
            {t("public.actions.login")}
          </Link>
          <Link href={registerUrl} style={{
            height: 36, padding: "0 16px", borderRadius: 12,
            background: "linear-gradient(135deg,#9333ea,#6366f1)",
            color: "#fff",
            display: "flex", alignItems: "center",
            fontSize: 13, fontWeight: 600, textDecoration: "none",
            boxShadow: "0 2px 14px rgba(147,51,234,0.45)",
          }}>
            {t("public.actions.register")}
          </Link>
        </div>
      </header>

      {/* ── 2. ANNOUNCEMENT BAR ───────────────────────────── */}
      <AnnouncementMarquee
        text={theme.announcementMarqueeText ?? (theme.marqueeMessages?.length ? undefined : (t("public.marquee.welcome") ?? "Welcome — Latest promotions and updates"))}
        messages={theme.marqueeMessages?.length ? theme.marqueeMessages : undefined}
        variant="vivid"
        marqueeBg={theme.marqueeBg}
        marqueeBorder={theme.marqueeBorder}
        textColor={theme.marqueeTextColor}
      />

      {/* ── PAGE CONTAINER ────────────────────────────────── */}
      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── 3. HERO BANNER ──────────────────────────────── */}
        {displayHeroSlides.length > 0 ? (
          <div style={{
            borderRadius: 20, overflow: "hidden",
            boxShadow: "0 6px 36px rgba(80,30,180,0.3), 0 2px 8px rgba(0,0,0,0.5)",
          }}>
            <HeroPromotionSlider compact slides={displayHeroSlides} />
          </div>
        ) : null}

        {/* ── 4. QUICK ACTIONS ────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {QUICK_ACTIONS.map(a => (
            <Link key={a.label} href={a.href} style={{
              ...CARD,
              height: 84,
              padding: "10px 4px 9px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 7, textDecoration: "none",
            }}>
              {/* Icon with radial glow */}
              <div style={{
                width: 38, height: 38, borderRadius: 13, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `radial-gradient(circle at center, ${a.glow} 0%, transparent 75%)`,
                border: `1px solid ${a.glow}`,
              }}>
                {a.iconUrl ? (
                  <FallbackImage src={a.iconUrl} alt="" className="w-7 h-7 object-cover rounded-lg" />
                ) : (
                  <span style={{ fontSize: 21, lineHeight: 1 }}>{a.icon}</span>
                )}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: "rgba(218,210,255,0.88)",
                textAlign: "center", lineHeight: 1.2,
              }}>
                {a.label}
              </span>
            </Link>
          ))}
        </div>

        {/* ── 5. PROMOTIONS ───────────────────────────────── */}
        {topPromos.length > 0 && (
          <div>
            <SectionHeader title={t("public.vivid.section.promos") as string || "最新活动"} />
            <div
              className="scroll-touch-horizontal"
              style={{ display: "flex", gap: 12, paddingBottom: 4, overflowX: "auto" }}
            >
              {topPromos.map((p, idx) => (
                <div key={p.id} style={{
                  flexShrink: 0, width: 240,
                  ...CARD_LIFT,
                  display: "flex", flexDirection: "column",
                }}>
                  {/* Image + overlay gradient */}
                  <div style={{
                    height: promoImgH, overflow: "hidden",
                    borderRadius: "16px 16px 0 0",
                    position: "relative",
                    background: "rgba(14,8,32,0.9)",
                  }}>
                    {(p.coverUrlMobilePromo || p.coverUrl) ? (
                      <>
                        {p.promoLink ? (
                          <a href={p.promoLink} target="_blank" rel="noopener noreferrer" style={{ display: "block", height: "100%" }}>
                            <FallbackImage src={p.coverUrlMobilePromo || p.coverUrl} alt={p.title} className="h-full w-full object-cover" />
                          </a>
                        ) : (
                          <FallbackImage src={p.coverUrlMobilePromo || p.coverUrl} alt={p.title} className="h-full w-full object-cover" />
                        )}
                        {/* Depth overlay */}
                        <div style={{
                          position: "absolute", inset: 0, pointerEvents: "none",
                          background: "linear-gradient(to bottom, transparent 45%, rgba(14,9,36,0.65) 100%)",
                        }} />
                      </>
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 40, opacity: 0.35 }}>🎁</span>
                      </div>
                    )}
                    {/* Tag badge */}
                    {idx === 0 && (
                      <span style={{
                        position: "absolute", top: 8, left: 8, zIndex: 2,
                        fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                        padding: "2px 8px", borderRadius: 999, textTransform: "uppercase",
                        background: "linear-gradient(135deg,#ef4444,#dc2626)",
                        color: "#fff", boxShadow: "0 2px 10px rgba(239,68,68,0.5)",
                      }}>HOT</span>
                    )}
                    {idx === 1 && (
                      <span style={{
                        position: "absolute", top: 8, left: 8, zIndex: 2,
                        fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                        padding: "2px 8px", borderRadius: 999, textTransform: "uppercase",
                        background: "linear-gradient(135deg,#9333ea,#6366f1)",
                        color: "#fff", boxShadow: "0 2px 10px rgba(147,51,234,0.4)",
                      }}>NEW</span>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    <p style={{
                      margin: 0, fontSize: 13, fontWeight: 700, color: "#f0eeff",
                      lineHeight: 1.4, minHeight: 36,
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {p.title}
                    </p>
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
                        style={{
                          flexShrink: 0, height: 36, fontSize: 11, padding: "0 10px",
                          borderRadius: 12, cursor: "pointer", fontWeight: 600,
                          border: "1.5px solid rgba(245,158,11,0.35)",
                          background: "rgba(245,158,11,0.1)", color: "#fcd34d",
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

        {/* ── 6. LIVE TRANSACTIONS (animated ticker) ──────── */}
        <div>
          <SectionHeader title={txTitle} />
          <AnimatedLiveTicker
            items={liveTxItems}
            depositLabel={txDeposit}
            withdrawLabel={txWithdraw}
            liveLabel={txLive}
            titleText={txTitle}
            depositColor={theme.livetxDepositColor}
            withdrawColor={theme.livetxWithdrawColor}
          />
        </div>

        {/* ── 7. REFERRAL BLOCK ───────────────────────────── */}
        <div>
          <ReferralBlock
            registerPath={theme.registerUrl ?? "/register-wa"}
            loginPath={theme.loginUrl ?? "/login"}
            blockBg={theme.referralBlockBg}
            blockBorder={theme.referralBlockBorder}
          />
        </div>

        {/* ── 8. HOT GAMES ────────────────────────────────── */}
        <div>
          <SectionHeader title={t("public.vivid.section.games") as string || "热门游戏"} />

          {/* Category chips — horizontal scroll */}
          <div
            className="scroll-touch-horizontal"
            style={{ display: "flex", gap: 8, paddingBottom: 12, overflowX: "auto" }}
          >
            {categories.map(c => {
              const active = c === activeCat;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCat(c)}
                  style={{
                    flexShrink: 0, height: 36, padding: "0 16px", borderRadius: 9999,
                    border: active
                      ? "1.5px solid rgba(192,132,252,0.7)"
                      : "1.5px solid rgba(120,80,255,0.2)",
                    background: active
                      ? "linear-gradient(135deg,rgba(147,51,234,0.28),rgba(99,102,241,0.28))"
                      : "rgba(12,8,28,0.6)",
                    color: active ? "#e9d5ff" : "rgba(157,149,201,0.6)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    boxShadow: active ? "0 0 14px rgba(168,85,247,0.22)" : "none",
                    transition: "all .18s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t(`public.vivid.games.cat.${c}`) || c}
                </button>
              );
            })}
          </div>

          {/* Game grid — 3 columns */}
          {filteredGames.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {filteredGames.map(g => (
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
                  <div style={{
                    width: "100%", aspectRatio: "1/1", borderRadius: 12, overflow: "hidden",
                    background: "linear-gradient(135deg,rgba(100,55,200,0.22),rgba(48,28,120,0.4))",
                    border: "1px solid rgba(150,90,255,0.18)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {g.logoUrl
                      ? <FallbackImage src={g.logoUrl} alt={g.name} className="h-full w-full object-cover" />
                      : <span style={{ fontSize: 26, opacity: 0.4 }}>🎮</span>}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "rgba(210,200,255,0.8)",
                    textAlign: "center", lineHeight: 1.3, minHeight: 28, width: "100%",
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {g.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(157,149,201,0.45)", fontSize: 13 }}>
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

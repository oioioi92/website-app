"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
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

// ─── Mobile Live Tx List ─────────────────────────────────
function MobileLiveList({
  items,
  depositLabel,
  withdrawLabel,
  liveLabel,
  titleText,
}: {
  items: Array<{ id: string; userRefMasked: string; amountDisplay: string; kind: "deposit" | "withdraw" }>;
  depositLabel: string;
  withdrawLabel: string;
  liveLabel: string;
  titleText: string;
}) {
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
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)",
          borderRadius: 999, padding: "2px 10px", fontSize: 10, fontWeight: 700, color: "#f87171",
        }}>
          {liveLabel}
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
        </span>
      </div>
      {/* List */}
      <div style={{ padding: "8px 0" }}>
        {items.slice(0, 6).map((tx, i) => {
          const isDeposit = tx.kind === "deposit";
          return (
            <div key={tx.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 16px",
              borderBottom: i < Math.min(items.length, 6) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
                  background: isDeposit ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                  color: isDeposit ? "#4ade80" : "#fbbf24",
                  border: `1px solid ${isDeposit ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}>
                  {isDeposit ? depositLabel : withdrawLabel}
                </span>
                <span style={{ fontSize: 12, color: "rgba(220,210,255,0.7)", fontFamily: "monospace" }}>
                  {tx.userRefMasked}
                </span>
              </div>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: isDeposit ? "#4ade80" : "#fbbf24",
                fontFamily: "monospace",
              }}>
                {tx.amountDisplay}
              </span>
            </div>
          );
        })}
        {items.length === 0 && (
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
import { useEffect } from "react";

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
  const { t } = useLocale();
  const siteName = theme.siteName ?? "KINGDOM888";
  const loginUrl = theme.loginUrl ?? "/login";
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
        <span style={{
          fontSize: 17, fontWeight: 800,
          background: "linear-gradient(90deg,var(--vp-accent),var(--vp-accent2))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          {siteName}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
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
                  <FallbackImage src={a.iconUrl} alt="" className="w-full h-full object-cover" />
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

        {/* ══════════════ 5. PROMOTIONS ══════════════ */}
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
                  {/* Image — fixed 140px height */}
                  <div style={{ height: 140, overflow: "hidden", borderRadius: "16px 16px 0 0", background: "var(--vp-card)" }}>
                    {(p.coverUrlMobilePromo || p.coverUrl) ? (
                      p.promoLink ? (
                        <a href={p.promoLink} target="_blank" rel="noopener noreferrer" style={{ display: "block", height: "100%" }}>
                          <FallbackImage src={p.coverUrlMobilePromo || p.coverUrl} alt={p.title} className="h-full w-full object-cover" />
                        </a>
                      ) : (
                        <FallbackImage src={p.coverUrlMobilePromo || p.coverUrl} alt={p.title} className="h-full w-full object-cover" />
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

        {/* ══════════════ 6. LIVE TRANSACTIONS ══════════════ */}
        <div>
          <SectionHeader title={txTitle} />
          <MobileLiveList
            items={liveTxItems}
            depositLabel={txDeposit}
            withdrawLabel={txWithdraw}
            liveLabel={txLive}
            titleText={txTitle}
          />
        </div>

        {/* ══════════════ 7. REFERRAL BLOCK ══════════════ */}
        <div>
          <ReferralBlock
            registerPath={theme.registerUrl ?? "/register-wa"}
            loginPath={theme.loginUrl ?? "/login"}
            blockBg={theme.referralBlockBg}
            blockBorder={theme.referralBlockBorder}
          />
        </div>

        {/* ══════════════ 8. HOT GAMES ══════════════ */}
        <div>
          <SectionHeader title={t("public.vivid.section.games") as string || "热门游戏"} />

          {/* Category chips — horizontal scroll */}
          <div
            className="scroll-touch-horizontal"
            style={{ display: "flex", gap: 8, paddingBottom: 12, overflowX: "auto" }}
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
                    height: 36,
                    padding: "0 16px",
                    borderRadius: 9999,
                    border: active ? "1.5px solid var(--vp-accent)" : "1.5px solid rgba(120,80,255,0.25)",
                    background: active
                      ? "linear-gradient(135deg,rgba(168,85,247,0.3),rgba(99,102,241,0.3))"
                      : "transparent",
                    color: active ? "#e0d0ff" : "rgba(157,149,201,0.7)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    transition: "all .15s",
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
                      ? <FallbackImage src={g.logoUrl} alt={g.name} className="h-full w-full object-cover" />
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

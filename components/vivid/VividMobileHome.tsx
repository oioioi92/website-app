"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import "@/styles/vivid-portal.css";
import { FallbackImage } from "@/components/FallbackImage";
import { LiveTransactionTable } from "@/components/public/LiveTransactionTable";
import { ReferralBlock } from "@/components/public/ReferralBlock";
import { inferUiGameCategory, UI_GAME_CATEGORIES, type UiGameCategory } from "@/lib/public/uiGameCategories";
import type { ThemeConfig } from "@/lib/public/theme";
import type { PublicPromotion } from "@/components/public/PromotionCard";
import { PromotionModal } from "@/components/public/PromotionModal";
import { useLocale } from "@/lib/i18n/context";

type Game = { id: string; name: string; logoUrl: string | null; code?: string | null };
type Promo = PublicPromotion;

// These are defined inside the component to use t(), see below
const QUICK_ACTION_DEFS = [
  { key: "deposit",  href: "/deposit",    icon: "💰" },
  { key: "withdraw", href: "/withdraw",   icon: "📤" },
  { key: "bonus",    href: "/bonus",      icon: "🎁" },
  { key: "support",  href: "/chat",       icon: "💬" },
];

const BOTTOM_NAV_DEFS = [
  { key: "home",    href: "/",          icon: "🏠" },
  { key: "games",   href: "/games",     icon: "🎮" },
  { key: "promo",   href: "/promotion", icon: "🎁" },
  { key: "history", href: "/history",   icon: "📜" },
  { key: "liveChat", href: "/chat",     icon: "💬" },
  { key: "setting", href: "/settings",  icon: "⚙️" },
];

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
  const pathname = usePathname();
  const { t } = useLocale();
  const siteName = theme.siteName ?? "KINGDOM888";
  const loginUrl = theme.loginUrl ?? "/login";
  const registerUrl = theme.registerUrl ?? "/register-wa";

  const themeQuickActions = (theme.quickActions ?? []).filter((a) => a.label?.trim() && a.url?.trim());
  const QUICK_ACTIONS = themeQuickActions.length > 0
    ? themeQuickActions.slice(0, 6).map((a) => ({ label: a.label, href: a.url, iconUrl: a.iconUrl ?? null }))
    : QUICK_ACTION_DEFS.map((a) => ({
        key: a.key,
        href: a.href,
        icon: a.icon,
        label: t(`public.vivid.quickActions.${a.key}`),
      }));

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
  const topPromos = promotions.slice(0, 6);

  return (
    <div
      className="vp-shell lg:hidden"
      data-page-has-bottom-nav="true"
      style={{ paddingBottom: 80 }}
    >
      {/* ── Sticky Top Bar ── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(13,13,26,0.95)",
        borderBottom: "1px solid rgba(120,80,255,0.25)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        height: 52,
      }}>
        <span style={{
          fontSize: 17,
          fontWeight: 800,
          background: "linear-gradient(90deg,#a855f7,#6366f1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          {siteName}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href={loginUrl}
            style={{
              height: 34,
              padding: "0 16px",
              borderRadius: 10,
              border: "1.5px solid rgba(120,80,255,0.4)",
              color: "#f0eeff",
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {t("public.actions.login")}
          </Link>
          <Link
            href={registerUrl}
            style={{
              height: 34,
              padding: "0 16px",
              borderRadius: 10,
              background: "linear-gradient(135deg,#a855f7,#6366f1)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {t("public.actions.register")}
          </Link>
        </div>
      </header>

      <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── Hero ── */}
        <div style={{
          borderRadius: 18,
          background: "linear-gradient(135deg,#1e1040 0%,#2d1060 45%,#1a0d2e 100%)",
          border: "1px solid rgba(120,80,255,0.3)",
          padding: "24px 20px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* glow orbs */}
          <div style={{
            position: "absolute", top: -30, right: -20, width: 140, height: 140,
            borderRadius: "50%", background: "rgba(168,85,247,0.2)", filter: "blur(40px)", pointerEvents: "none",
          }} />
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)",
            borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 600, color: "#a855f7",
            marginBottom: 10,
          }}>
            {t("public.vivid.hero.badge")}
          </div>
          <h1 style={{
            margin: 0, fontSize: 20, fontWeight: 800, lineHeight: 1.3,
            background: "linear-gradient(90deg,#fff,rgba(255,255,255,.7))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            {t("public.vivid.hero.subtitle")} {siteName}<br />{t("public.vivid.hero.title")}
          </h1>
          <div style={{ display: "flex", gap: 10, marginTop: 16, position: "relative", zIndex: 1 }}>
            <Link
              href={registerUrl}
              className="vp-btn vp-btn-primary"
              style={{ height: 40, fontSize: 12, flex: 1, minWidth: 0, whiteSpace: "nowrap" }}
            >
              {t("public.actions.register")}
            </Link>
            <Link
              href={loginUrl}
              className="vp-btn vp-btn-outline"
              style={{ height: 40, fontSize: 12, flex: 1, minWidth: 0, whiteSpace: "nowrap" }}
            >
              {t("public.actions.login")}
            </Link>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              style={{
                background: "var(--vp-card)",
                border: "1px solid var(--vp-border)",
                borderRadius: 14,
                padding: "14px 8px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                textDecoration: "none",
                color: "var(--vp-text)",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <span>{a.label}</span>
            </Link>
          ))}
        </div>

        {/* ── Promotion Carousel ── */}
        {topPromos.length > 0 && (
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "var(--vp-text)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 3, height: 16, borderRadius: 2, background: "linear-gradient(#a855f7,#6366f1)", display: "inline-block" }} />
              {t("public.vivid.section.promos")}
            </p>
            <div className="scroll-touch-horizontal" style={{ display: "flex", gap: 10, paddingBottom: 4 }}>
              {topPromos.map((p) => (
                <div
                  key={p.id}
                  style={{
                    flexShrink: 0,
                    width: 260,
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "var(--vp-card)",
                    border: "1px solid var(--vp-border)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ width: 260, height: 175, flexShrink: 0, background: "var(--vp-card2)", overflow: "hidden" }}>
                    {(p.coverUrlMobilePromo || p.coverUrl) ? (
                      p.promoLink ? (
                        <a href={p.promoLink} target="_blank" rel="noopener noreferrer" style={{ display: "block", height: "100%" }}>
                          <FallbackImage src={p.coverUrlMobilePromo || p.coverUrl} alt={p.title} className="h-full w-full object-cover" style={{ cursor: "pointer" }} />
                        </a>
                      ) : (
                        <FallbackImage src={p.coverUrlMobilePromo || p.coverUrl} alt={p.title} className="h-full w-full object-cover" />
                      )
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🎁</div>
                    )}
                  </div>
                  <div style={{ padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--vp-text)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "4em" }}>{p.title}</p>
                    <div style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <Link
                        href="/deposit"
                        className="vp-btn vp-btn-primary"
                        style={{ flex: 1, height: 36, fontSize: 13, minWidth: 0 }}
                      >
                        {t("public.vivid.promo.claim")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedPromo(p)}
                        className="vp-btn vp-btn-outline"
                        style={{ flexShrink: 0, height: 36, fontSize: 11, background: "rgba(245,158,11,0.2)", borderColor: "rgba(245,158,11,0.5)", color: "#fcd34d" }}
                      >
                        {t("public.vivid.promo.tnc")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Live Transactions（标题与 LIVE 同一行，如参考图） ── */}
        <div style={{
          background: "var(--vp-card)",
          border: "1px solid var(--vp-border)",
          borderRadius: 16,
          overflow: "hidden",
          padding: "14px 14px 12px",
        }}>
          <LiveTransactionTable
            internalTestMode={internalTestMode}
            variant="v3"
            depositColor="#1e3a5f"
            withdrawColor="#e6b800"
            title={t("public.vivid.liveTable.title")}
            depositLabel={t("public.vivid.liveTable.deposit")}
            withdrawLabel={t("public.vivid.liveTable.withdraw")}
            liveLabel={t("public.vivid.liveTable.live")}
            demoLabel={t("public.vivid.liveTable.demo")}
            loadingText={t("public.vivid.liveTable.loading")}
          />
        </div>

        {/* ── 推荐：分享/复制链接/查看下线（Live Transaction 下方）── */}
        <ReferralBlock registerPath={theme.registerUrl ?? "/register-wa"} loginPath={theme.loginUrl ?? "/login"} />

        {/* ── Games Section ── */}
        <div>
          <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "var(--vp-text)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 3, height: 16, borderRadius: 2, background: "linear-gradient(#a855f7,#6366f1)", display: "inline-block" }} />
            {t("public.vivid.section.games")}
          </p>

          {/* Category tabs */}
          <div className="scroll-touch-horizontal" style={{ display: "flex", gap: 8, paddingBottom: 8 }}>
            {categories.map((c) => {
              const active = c === activeCat;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCat(c)}
                  style={{
                    flexShrink: 0,
                    padding: "6px 16px",
                    borderRadius: 999,
                    border: active ? "1.5px solid #a855f7" : "1.5px solid rgba(120,80,255,0.25)",
                    background: active ? "rgba(168,85,247,0.2)" : "transparent",
                    color: active ? "#a855f7" : "rgba(157,149,201,0.8)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  {t(`public.vivid.games.cat.${c}`) || c}
                </button>
              );
            })}
          </div>

          {/* Game Grid */}
          {filteredGames.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 8,
              marginTop: 4,
            }}>
              {filteredGames.map((g) => (
                <Link
                  key={g.id}
                  href={`/games/play/${encodeURIComponent(g.id)}`}
                  style={{
                    background: "linear-gradient(145deg, rgba(30,20,60,0.9), rgba(20,15,45,0.95))",
                    border: "1px solid rgba(120,80,255,0.25)",
                    borderRadius: 12,
                    overflow: "hidden",
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "8px 6px 8px",
                    gap: 5,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    transition: "transform .15s, box-shadow .15s",
                  }}
                >
                  <div style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "linear-gradient(135deg, rgba(100,60,200,0.25), rgba(60,40,140,0.4))",
                    border: "1px solid rgba(160,100,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}>
                    {g.logoUrl
                      ? <FallbackImage src={g.logoUrl} alt={g.name} className="h-full w-full object-cover" />
                      : <span style={{ opacity: 0.7 }}>🎮</span>}
                  </div>
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "rgba(220,210,255,0.85)",
                    textAlign: "center",
                    lineHeight: 1.25,
                    width: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.02em",
                  }}>
                    {g.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--vp-muted)", fontSize: 13 }}>
              {t("public.vivid.games.noGames")}
            </div>
          )}

        </div>

      </div>

      <PromotionModal
        promo={selectedPromo}
        onClose={() => setSelectedPromo(null)}
        routeBonus="/bonus"
      />

      {/* 本页内嵌底部栏：固定 6 项含 Live Chat，不依赖 layout */}
      <nav
        data-bottom-nav-items="6"
        data-has-live-chat="true"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(13,13,26,0.97)",
          borderTop: "1px solid rgba(120,80,255,0.3)",
          backdropFilter: "blur(12px)",
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          paddingBottom: "env(safe-area-inset-bottom, 4px)",
        }}
      >
        {BOTTOM_NAV_DEFS.map((n) => {
          const isActive = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
          const label = n.key === "liveChat" ? "Live Chat" : (t(`public.vivid.bottomNav.${n.key}`) || n.key);
          return (
            <Link
              key={n.href}
              href={n.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "10px 2px 8px",
                textDecoration: "none",
                color: isActive ? "#a855f7" : "rgba(157,149,201,0.75)",
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <span style={{ fontSize: 18 }}>{n.icon}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

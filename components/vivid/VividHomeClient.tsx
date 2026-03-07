"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import "@/styles/vivid-portal.css";
import { VividTopbar } from "./VividTopbar";
import { VividFooter } from "./VividFooter";
import { AnnouncementMarquee } from "@/components/public/AnnouncementMarquee";
import { LiveTransactionTable } from "@/components/public/LiveTransactionTable";
import { FallbackImage } from "@/components/FallbackImage";
import { HeroPromotionSlider } from "@/components/public/HeroPromotionSlider";
import { useLocale } from "@/lib/i18n/context";

// ─── Shared design tokens (mirrors mobile system) ────────
// container: max-w 1200px, margin auto, padding 0 20px
// card radius: 16px | hero/banner: 20px | chips: 9999px
// images: object-fit cover, object-position center (shared with mobile)
// ─────────────────────────────────────────────────────────

type Promo = { id: string; title: string; coverUrl: string | null; percentText?: string | null };
type Game  = { id: string; name: string; logoUrl: string | null };
type HeroBanner = { imageUrl: string; linkUrl?: string | null };

// ─── Shared card shell (same as mobile CARD token) ───────
const CARD: CSSProperties = {
  background: "var(--vp-card)",
  border: "1px solid rgba(120,80,255,0.2)",
  borderRadius: 16,
};

// ─── Section header (same as mobile SectionHeader) ───────
function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <span style={{
        width: 4, height: 20, borderRadius: 2, flexShrink: 0,
        background: "linear-gradient(180deg,var(--vp-accent),var(--vp-accent2))",
        display: "inline-block",
      }} />
      <span style={{ fontSize: 18, fontWeight: 700, color: "var(--vp-text)", lineHeight: 1 }}>
        {title}
      </span>
    </div>
  );
}

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
}) {
  const { t } = useLocale();
  const heroBadge    = (uiText.vividHeroBadge?.trim()    || t("public.vivid.hero.badge"))    as string;
  const heroSubtitle = (uiText.vividHeroSubtitle?.trim() || t("public.vivid.hero.subtitle")) as string;
  const heroTitle    = (uiText.vividHeroTitle?.trim()    || t("public.vivid.hero.title"))    as string;

  const topGames  = games.slice(0, 16);
  const topPromos = promotions.slice(0, 4);

  const heroSlides = heroBanners
    .filter((b) => b.imageUrl?.trim())
    .slice(0, 5)
    .map((b, i) => ({ id: `hero-${i}`, imageUrl: b.imageUrl, linkUrl: b.linkUrl ?? null }));
  const fallbackSlides = promotions
    .filter((p) => p.coverUrl?.trim())
    .slice(0, 5)
    .map((p) => ({ id: `promo-${p.id}`, imageUrl: p.coverUrl as string, linkUrl: "/promotion" }));
  const displayHeroSlides = heroSlides.length > 0 ? heroSlides : fallbackSlides;

  const QUICK_ACTIONS = [
    { label: t("public.actions.deposit"),      href: depositUrl,  icon: "💰" },
    { label: t("public.actions.withdraw"),     href: "/withdraw", icon: "📤" },
    { label: t("public.vivid.bottomNav.bonus"),href: "/bonus",    icon: "🎁" },
    { label: t("public.nav.support"),          href: "/chat",     icon: "💬" },
  ];

  return (
    <div className="vp-shell">
      <VividTopbar siteName={siteName} loginUrl={loginUrl} registerUrl={registerUrl} />

      {/* ══ Announcement marquee ══════════════════════════════ */}
      <AnnouncementMarquee
        text={announcementMarqueeText ?? (marqueeMessages.length > 0 ? undefined : (t("public.marquee.welcome") ?? "Welcome — Latest promotions and updates"))}
        messages={marqueeMessages.length > 0 ? marqueeMessages : undefined}
        variant="vivid"
        marqueeBg={marqueeBg}
        marqueeBorder={marqueeBorder}
        textColor={marqueeTextColor}
      />

      {/* ══ Page container (max-w 1200px, centered) ══════════ */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 80px", display: "flex", flexDirection: "column", gap: 32 }}>

        {/* ══ 1. HERO BANNER ══════════════════════════════════ */}
        {/* Desktop: centered container, max-width 1200px, border-radius 20px */}
        {displayHeroSlides.length > 0 ? (
          <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(120,80,255,0.2)" }}>
            <HeroPromotionSlider compact slides={displayHeroSlides} />
          </div>
        ) : (
          /* Fallback hero card when no banners uploaded */
          <div style={{
            borderRadius: 20, overflow: "hidden",
            background: "linear-gradient(135deg,#1e1040 0%,#2d1060 45%,#1a0d2e 100%)",
            border: "1px solid rgba(120,80,255,0.3)",
            padding: "48px 40px",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: -60, right: -40, width: 240, height: 240,
              borderRadius: "50%", background: "rgba(168,85,247,0.15)", filter: "blur(60px)", pointerEvents: "none",
            }} />
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)",
              borderRadius: 9999, padding: "4px 14px", fontSize: 12, fontWeight: 600,
              color: "var(--vp-accent)", marginBottom: 16,
            }}>
              {heroBadge}
            </div>
            <h1 style={{
              margin: "0 0 20px", fontSize: "clamp(24px,3vw,42px)", fontWeight: 900, lineHeight: 1.2,
              background: "linear-gradient(90deg,#fff,rgba(255,255,255,.75))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {heroSubtitle} {siteName}<br />{heroTitle}
            </h1>
            <div style={{ display: "flex", gap: 12 }}>
              <Link href={registerUrl} className="vp-btn vp-btn-primary" style={{ height: 44, fontSize: 14, padding: "0 28px" }}>
                {t("public.vivid.hero.register")}
              </Link>
              <Link href={depositUrl} className="vp-btn vp-btn-outline" style={{ height: 44, fontSize: 14, padding: "0 28px" }}>
                {t("public.vivid.hero.deposit")}
              </Link>
            </div>
          </div>
        )}

        {/* ══ 2. QUICK ACTIONS ════════════════════════════════ */}
        {/* Desktop: same 4-col grid, larger gap (20px) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              style={{
                ...CARD,
                height: 96,
                padding: "16px 10px 14px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 10, textDecoration: "none", color: "var(--vp-text)",
                transition: "border-color .15s, box-shadow .15s",
              }}
            >
              <span style={{ fontSize: 30, lineHeight: 1 }}>{a.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>
                {a.label}
              </span>
            </Link>
          ))}
        </div>

        {/* ══ 3. LIVE TX + PROMOTIONS (2-col) ═════════════════ */}
        {/* Desktop: left = live transaction, right = promotion cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

          {/* Left: Live Transaction */}
          <div>
            <SectionHeader title={t("public.vivid.section.live") as string || "实时交易"} />
            <div style={{ ...CARD, overflow: "hidden" }}>
              <LiveTransactionTable
                internalTestMode={internalTestMode}
                variant="v3"
                depositColor="var(--vp-green)"
                withdrawColor="var(--vp-gold)"
                title={t("public.vivid.liveTable.title") as string}
                depositLabel={t("public.vivid.liveTable.deposit") as string}
                withdrawLabel={t("public.vivid.liveTable.withdraw") as string}
                liveLabel={t("public.vivid.liveTable.live") as string}
                demoLabel={t("public.vivid.liveTable.demo") as string}
                loadingText={t("public.vivid.liveTable.loading") as string}
              />
            </div>
          </div>

          {/* Right: Promotion cards (1:1 images, same as mobile) */}
          <div>
            <SectionHeader title={t("public.vivid.section.promos") as string || "最新活动"} />
            {topPromos.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {topPromos.map((p) => (
                  <div key={p.id} style={{ ...CARD, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {/* 1:1 image — same ratio as mobile */}
                    <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", background: "var(--vp-card)" }}>
                      {p.coverUrl ? (
                        <FallbackImage
                          src={p.coverUrl}
                          alt={p.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                        />
                      ) : (
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🎁</div>
                      )}
                    </div>
                    {/* Card body */}
                    <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                      {p.percentText && (
                        <span style={{
                          alignSelf: "flex-start", fontSize: 11, fontWeight: 700,
                          background: "rgba(245,158,11,0.2)", color: "#fcd34d",
                          border: "1px solid rgba(245,158,11,0.4)",
                          borderRadius: 999, padding: "2px 8px",
                        }}>{p.percentText}</span>
                      )}
                      <p style={{
                        margin: 0, fontSize: 13, fontWeight: 700, color: "var(--vp-text)",
                        lineHeight: 1.4, minHeight: 36,
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {p.title}
                      </p>
                      <Link
                        href="/deposit"
                        className="vp-btn vp-btn-primary"
                        style={{ height: 34, fontSize: 12, marginTop: "auto" }}
                      >
                        {t("public.vivid.promo.claim") || "领取"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...CARD, padding: "32px 20px", textAlign: "center" }}>
                <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>🎁</span>
                <p style={{ margin: 0, color: "var(--vp-muted)", fontSize: 13 }}>暂无活动</p>
              </div>
            )}
          </div>
        </div>

        {/* ══ 4. HOT GAMES ════════════════════════════════════ */}
        {/* Desktop: 8-col grid (mobile uses 3-col) */}
        <div>
          <SectionHeader title={t("public.vivid.section.games") as string || "热门游戏"} />
          {topGames.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(8, 1fr)",
              gap: 14,
            }}>
              {topGames.map((g) => (
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
                >
                  {/* 1:1 icon — same as mobile */}
                  <div style={{
                    width: "100%", aspectRatio: "1/1",
                    borderRadius: 12, overflow: "hidden",
                    background: "linear-gradient(135deg,rgba(100,60,200,0.2),rgba(60,40,140,0.35))",
                    border: "1px solid rgba(160,100,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28,
                  }}>
                    {g.logoUrl
                      ? <FallbackImage src={g.logoUrl} alt={g.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
                      : <span style={{ opacity: 0.6 }}>🎮</span>}
                  </div>
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
            <div style={{ ...CARD, padding: "48px 20px", textAlign: "center" }}>
              <span style={{ fontSize: 48, display: "block", marginBottom: 12 }}>🎮</span>
              <p style={{ margin: 0, color: "var(--vp-muted)", fontSize: 13 }}>游戏即将上线</p>
              <Link href="/games" className="vp-btn vp-btn-primary" style={{ marginTop: 16, height: 36, fontSize: 13, display: "inline-flex", alignItems: "center", padding: "0 20px" }}>
                Browse Games
              </Link>
            </div>
          )}
        </div>

        {/* ══ 5. TRUST CARDS (3 columns) ══════════════════════ */}
        {/* Desktop: 3 columns, same icons and text as mobile */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { icon: "🔒", titleKey: "public.vivid.trust.secureTitle",  descKey: "public.vivid.trust.secureDesc" },
            { icon: "⚡", titleKey: "public.vivid.trust.payoutTitle",   descKey: "public.vivid.trust.payoutDesc" },
            { icon: "🎧", titleKey: "public.vivid.trust.supportTitle",  descKey: "public.vivid.trust.supportDesc" },
          ].map((item) => (
            <div key={item.titleKey} style={{ ...CARD, padding: "28px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
              <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 14, color: "var(--vp-text)" }}>{t(item.titleKey)}</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--vp-muted)", lineHeight: 1.5 }}>{t(item.descKey)}</p>
            </div>
          ))}
        </div>

      </div>

      <VividFooter siteName={siteName} />
    </div>
  );
}

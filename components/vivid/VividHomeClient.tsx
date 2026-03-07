"use client";

import Link from "next/link";
import "@/styles/vivid-portal.css";
import { VividTopbar } from "./VividTopbar";
import { VividFooter } from "./VividFooter";
import { AnnouncementMarquee } from "@/components/public/AnnouncementMarquee";
import { LiveTransactionTable } from "@/components/public/LiveTransactionTable";
import { FallbackImage } from "@/components/FallbackImage";
import { HeroPromotionSlider } from "@/components/public/HeroPromotionSlider";
import { useLocale } from "@/lib/i18n/context";

type Promo = { id: string; title: string; coverUrl: string | null; percentText?: string | null };
type Game  = { id: string; name: string; logoUrl: string | null };

type HeroBanner = { imageUrl: string; linkUrl?: string | null };

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
  const heroBadge = (uiText.vividHeroBadge?.trim() || t("public.vivid.hero.badge")) as string;
  const heroSubtitle = (uiText.vividHeroSubtitle?.trim() || t("public.vivid.hero.subtitle")) as string;
  const heroTitle = (uiText.vividHeroTitle?.trim() || t("public.vivid.hero.title")) as string;
  const topGames  = games.slice(0, 12);
  const topPromos = promotions.slice(0, 3);
  const heroSlides = heroBanners
    .filter((b) => b.imageUrl?.trim())
    .slice(0, 5)
    .map((b, i) => ({
      id: `hero-${i}`,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl ?? null,
    }));
  const fallbackSlides = topPromos
    .filter((p) => p.coverUrl?.trim())
    .slice(0, 5)
    .map((p) => ({
      id: `promo-${p.id}`,
      imageUrl: p.coverUrl as string,
      linkUrl: "/promotion",
    }));
  const displayHeroSlides = heroSlides.length > 0 ? heroSlides : fallbackSlides;

  const QUICK_ACTIONS_I18N = [
    { label: t("public.actions.deposit"),  href: depositUrl,    icon: "💰", color: "#7c3aed" },
    { label: t("public.actions.withdraw"), href: "/withdraw",   icon: "📤", color: "#6366f1" },
    { label: t("public.vivid.bottomNav.bonus"), href: "/bonus", icon: "🎁", color: "#a855f7" },
    { label: t("public.nav.support"),      href: "/chat",       icon: "💬", color: "#4f46e5" },
  ];

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

      <div className="vp-w vp-main">

        {/* ── 首页轮播图（后台 Theme 配置） ── */}
        {displayHeroSlides.length > 0 ? (
          <section className="vp-card mx-auto w-full max-w-[980px] overflow-hidden" style={{ borderRadius: 16 }}>
            <HeroPromotionSlider compact slides={displayHeroSlides} />
          </section>
        ) : null}

        {/* ── Hero ── */}
        <section className="vp-hero">
          <div className="vp-hero-badge">{heroBadge}</div>
          <h1>{heroSubtitle} {siteName}<br />{heroTitle}</h1>
          <div className="vp-hero-actions">
            <Link href={registerUrl} className="vp-btn vp-btn-primary">
              {t("public.vivid.hero.register")}
            </Link>
            <Link href={depositUrl} className="vp-btn vp-btn-outline">
              {t("public.vivid.hero.deposit")}
            </Link>
          </div>
        </section>

        {/* ── Quick Actions ── */}
        <section>
          <div className="vp-actions-grid">
            {QUICK_ACTIONS_I18N.map((a) => (
              <Link key={a.label} href={a.href} className="vp-action-item">
                <div className="icon" style={{ background: `${a.color}30`, border: `1px solid ${a.color}55` }}>
                  {a.icon}
                </div>
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Live Transaction + Featured Promos ── */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="vp-card flex flex-col gap-4">
            <p className="vp-card-title m-0">{t("public.vivid.section.live")}</p>
            <LiveTransactionTable
              internalTestMode={internalTestMode}
              variant="v3"
            />
          </div>
          <div className="flex flex-col gap-4">
            {topPromos.length > 0 ? (
              topPromos.map((p) => (
                <div key={p.id} className="vp-promo-card vp-promo-card-row overflow-hidden" style={{ borderRadius: 14 }}>
                  <div style={{ display: "flex", flex: 1, gap: 0, overflow: "hidden", borderRadius: "inherit" }}>
                    {p.coverUrl && (
                      <div className="vp-promo-row-img" style={{ flexShrink: 0 }}>
                        <FallbackImage src={p.coverUrl} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
                      </div>
                    )}
                    <div className="vp-promo-body">
                      {p.percentText && (
                        <span className="vp-badge vp-badge-gold">{p.percentText}</span>
                      )}
                      <p className="font-semibold text-sm m-0" style={{ color: "var(--vp-text)" }}>{p.title}</p>
                      <Link href="/promotion" className="vp-btn vp-btn-primary" style={{ height: 34, fontSize: 13, marginTop: "auto" }}>
                        Claim
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="vp-card flex flex-col items-center justify-center gap-3 py-10 text-center">
                <span className="text-4xl">🎁</span>
                <p className="text-sm m-0" style={{ color: "var(--vp-muted)" }}>No promotions yet — stay tuned!</p>
                <Link href="/promotion" className="vp-btn vp-btn-primary" style={{ height: 34, fontSize: 13 }}>View Promos</Link>
              </div>
            )}
          </div>
        </section>

        {/* ── Popular Games ── */}
        <section>
          <div className="vp-section-head">
            <h2 className="vp-section-title m-0">
              <span className="dot" />
              {t("public.vivid.section.games")}
            </h2>
          </div>
          {topGames.length > 0 ? (
            <div className="vp-tile-grid">
              {topGames.map((g) => (
                <Link key={g.id} href={`/games/play/${g.id}`} className="vp-tile">
                  <div className="thumb">
                    {g.logoUrl ? (
                      <FallbackImage src={g.logoUrl} alt={g.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>🎮</span>
                    )}
                  </div>
                  <div className="label">{g.name}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="vp-card flex items-center justify-center py-12 text-center">
              <div>
                <span className="text-5xl block mb-3">🎮</span>
                <p className="m-0 text-sm" style={{ color: "var(--vp-muted)" }}>Games coming soon!</p>
                <Link href="/games" className="vp-btn vp-btn-primary" style={{ marginTop: 16, height: 36, fontSize: 13 }}>Browse Games</Link>
              </div>
            </div>
          )}
        </section>

        {/* ── Trust Strip ── */}
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: "🔒", titleKey: "public.vivid.trust.secureTitle",  descKey: "public.vivid.trust.secureDesc" },
            { icon: "⚡", titleKey: "public.vivid.trust.payoutTitle",   descKey: "public.vivid.trust.payoutDesc" },
            { icon: "🎧", titleKey: "public.vivid.trust.supportTitle",  descKey: "public.vivid.trust.supportDesc" },
          ].map((item) => (
            <div key={item.titleKey} className="vp-card text-center" style={{ padding: "24px 20px" }}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <p className="font-bold text-sm m-0 mb-1" style={{ color: "var(--vp-text)" }}>{t(item.titleKey)}</p>
              <p className="text-xs m-0" style={{ color: "var(--vp-muted)" }}>{t(item.descKey)}</p>
            </div>
          ))}
        </section>

      </div>

      <VividFooter siteName={siteName} />
    </div>
  );
}

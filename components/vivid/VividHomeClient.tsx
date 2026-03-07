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
type Game = { id: string; name: string; logoUrl: string | null };

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
  livetxDepositColor = null,
  livetxWithdrawColor = null,
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
}) {
  const { t } = useLocale();
  const topGames = games.slice(0, 12);
  const topPromos = promotions.slice(0, 5);
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

  const QUICK_ACTIONS = [
    { label: t("public.actions.deposit"), href: depositUrl, icon: "💰" },
    { label: t("public.actions.withdraw"), href: "/withdraw", icon: "📤" },
    { label: t("public.vivid.bottomNav.bonus"), href: "/bonus", icon: "🎁" },
    { label: t("public.nav.support"), href: "/chat", icon: "💬" },
  ];

  const FEATURE_PROMPOS = topPromos.slice(0, 3);
  const LIVE_PROMOS = topPromos.slice(0, 2);

  return (
    <div className="vp-shell">
      {/* [1] TOP HEADER */}
      <VividTopbar siteName={siteName} loginUrl={loginUrl} registerUrl={registerUrl} />

      {/* [2] ANNOUNCEMENT BAR */}
      <AnnouncementMarquee
        text={announcementMarqueeText ?? (marqueeMessages.length > 0 ? undefined : (t("public.marquee.welcome") ?? "Welcome — Latest promotions and updates"))}
        messages={marqueeMessages.length > 0 ? marqueeMessages : undefined}
        variant="vivid"
        marqueeBg={marqueeBg}
        marqueeBorder={marqueeBorder}
        textColor={marqueeTextColor}
      />

      {/* [3] MAIN HERO — single main visual, no duplicate welcome card */}
      {displayHeroSlides.length > 0 && (
        <section className="desk-hero" aria-label="Main banner">
          <div className="desk-hero-inner">
            <HeroPromotionSlider compact slides={displayHeroSlides} />
          </div>
        </section>
      )}

      <div className="vp-w vp-main">
        {/* [4] QUICK ACTION STRIP — flat strip, not big boxes */}
        <section className="desk-quick-strip" aria-label="Quick actions">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.label} href={a.href} className="desk-quick-strip-item">
              <span className="desk-quick-strip-icon">{a.icon}</span>
              <span>{a.label}</span>
            </Link>
          ))}
        </section>

        {/* [5] FEATURE SECTION — 3 feature cards (activities) */}
        {FEATURE_PROMPOS.length > 0 && (
          <section className="desk-feature" aria-label="Featured promotions">
            <div className="desk-feature-grid">
              {FEATURE_PROMPOS.map((p, i) => (
                <Link key={p.id} href="/promotion" className="desk-feature-card">
                  <div className="desk-feature-card-img">
                    {p.coverUrl ? (
                      <FallbackImage src={p.coverUrl} alt={p.title} className="h-full w-full object-cover object-center" />
                    ) : (
                      <span>🎁</span>
                    )}
                  </div>
                  <div className="desk-feature-card-body">
                    {p.percentText && <span className="desk-feature-badge">{p.percentText}</span>}
                    <p className="desk-feature-title">{p.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* [6] LIVE + PROMOTION — 40% | 60% */}
        <section className="desk-live-promo">
          <div className="desk-live-panel">
            <div className="desk-live-panel-body">
              <LiveTransactionTable
                internalTestMode={internalTestMode}
                variant="v3"
                depositColor={livetxDepositColor}
                withdrawColor={livetxWithdrawColor}
                title={t("public.vivid.liveTable.title")}
                depositLabel={t("public.vivid.liveTable.deposit")}
                withdrawLabel={t("public.vivid.liveTable.withdraw")}
                liveLabel={t("public.vivid.liveTable.live")}
                demoLabel={t("public.vivid.liveTable.demo")}
                loadingText={t("public.vivid.liveTable.loading")}
              />
            </div>
          </div>
          <div className="desk-promo-stack">
            {LIVE_PROMOS.length > 0 ? (
              LIVE_PROMOS.map((p) => (
                <Link key={p.id} href="/promotion" className="desk-promo-card">
                  <div className="desk-promo-card-img">
                    {p.coverUrl ? (
                      <FallbackImage src={p.coverUrl} alt={p.title} className="h-full w-full object-cover object-center" />
                    ) : (
                      <span>🎁</span>
                    )}
                  </div>
                  <div className="desk-promo-card-body">
                    {p.percentText && <span className="desk-promo-badge">{p.percentText}</span>}
                    <p className="desk-promo-title">{p.title}</p>
                    <span className="desk-promo-cta">{t("public.vivid.promo.claim") ?? "Claim"}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="desk-promo-empty">
                <span>🎁</span>
                <p>{t("public.vivid.section.promos") ?? "Promotions"}</p>
                <Link href="/promotion" className="vp-btn vp-btn-primary" style={{ marginTop: 8, fontSize: 13 }}>
                  View all
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* [7] HOT GAMES */}
        <section className="desk-hot-games" aria-label="Hot games">
          <h2 className="vp-section-title m-0">
            <span className="dot" />
            {t("public.vivid.section.games")}
          </h2>
          {topGames.length > 0 ? (
            <div className="vp-tile-grid">
              {topGames.map((g) => (
                <Link key={g.id} href={`/games/play/${g.id}`} className="vp-tile">
                  <div className="thumb">
                    {g.logoUrl ? (
                      <FallbackImage src={g.logoUrl} alt={g.name} className="h-full w-full object-cover object-center" />
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
              <span className="text-5xl block mb-3">🎮</span>
              <p className="m-0 text-sm" style={{ color: "var(--vp-muted)" }}>Games coming soon!</p>
              <Link href="/games" className="vp-btn vp-btn-primary" style={{ marginTop: 16, height: 36, fontSize: 13 }}>Browse Games</Link>
            </div>
          )}
        </section>

        {/* [8] TRUST / SERVICE */}
        <section className="desk-trust grid gap-4 sm:grid-cols-3">
          {[
            { icon: "🔒", titleKey: "public.vivid.trust.secureTitle", descKey: "public.vivid.trust.secureDesc" },
            { icon: "⚡", titleKey: "public.vivid.trust.payoutTitle", descKey: "public.vivid.trust.payoutDesc" },
            { icon: "🎧", titleKey: "public.vivid.trust.supportTitle", descKey: "public.vivid.trust.supportDesc" },
          ].map((item) => (
            <div key={item.titleKey} className="vp-card text-center desk-trust-card">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="font-bold text-sm m-0 mb-1" style={{ color: "var(--vp-text)" }}>{t(item.titleKey)}</p>
              <p className="text-xs m-0" style={{ color: "var(--vp-muted)" }}>{t(item.descKey)}</p>
            </div>
          ))}
        </section>
      </div>

      {/* [9] FOOTER */}
      <VividFooter siteName={siteName} />
    </div>
  );
}

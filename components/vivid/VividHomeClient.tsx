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
import type { ThemeConfig } from "@/lib/public/theme";

type Promo = { id: string; title: string; coverUrl: string | null; percentText?: string | null; promoLink?: string | null };
type Game = { id: string; name: string; logoUrl: string | null };

type HeroBanner = { imageUrl: string; linkUrl?: string | null };

// ─── Desktop: same design language as mobile ─────────────────
const CARD_STYLE: React.CSSProperties = {
  background: "var(--vp-card)",
  border: "1px solid rgba(120,80,255,0.2)",
  borderRadius: 16,
};

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <span style={{
        width: 4, height: 18, borderRadius: 2, flexShrink: 0,
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
  theme,
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
  theme?: ThemeConfig;
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
  const topGames = games.slice(0, 12);
  const topPromos = promotions.slice(0, 6);
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
    { label: t("public.actions.deposit"),  href: depositUrl,    icon: "💰" },
    { label: t("public.actions.withdraw"), href: "/withdraw",   icon: "📤" },
    { label: t("public.vivid.quickActions.bonus"), href: "/bonus", icon: "🎁" },
    { label: t("public.nav.support"),      href: "/chat",       icon: "💬" },
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

        {/* ── Banner: same as mobile (max 980px, 16:7), same radius ── */}
        {displayHeroSlides.length > 0 ? (
          <section className="overflow-hidden mx-auto w-full max-w-[980px]" style={{ ...CARD_STYLE, borderRadius: 20 }}>
            <HeroPromotionSlider compact slides={displayHeroSlides} />
          </section>
        ) : null}

        {/* ── Hero: same tone as mobile (badge + title + CTA) ── */}
        <section className="vp-hero">
          <div className="vp-hero-badge">{heroBadge}</div>
          <h1>{heroSubtitle} {siteName}<br />{heroTitle}</h1>
          <div className="vp-hero-actions">
            <Link href={registerUrl} className="vp-btn vp-btn-primary">{t("public.vivid.hero.register")}</Link>
            <Link href={depositUrl} className="vp-btn vp-btn-outline">{t("public.vivid.hero.deposit")}</Link>
          </div>
        </section>

        {/* ── Quick Actions: same card shell as mobile, 4 columns ── */}
        <section>
          <div className="vp-actions-grid vp-actions-unified">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.label} href={a.href} className="vp-action-item vp-action-unified">
                <div className="icon">
                  <span style={{ fontSize: 26 }}>{a.icon}</span>
                </div>
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Live Transaction + Promotions: same design language ── */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Live: same card shell as mobile, theme colors, table has own title + live badge */}
          <div style={{ ...CARD_STYLE, overflow: "hidden", padding: "16px 16px 12px" }}>
            <LiveTransactionTable
                internalTestMode={internalTestMode}
                variant="v3"
                depositColor={theme?.livetxDepositColor ?? undefined}
                withdrawColor={theme?.livetxWithdrawColor ?? undefined}
                title={t("public.vivid.liveTable.title")}
                depositLabel={t("public.vivid.liveTable.deposit")}
                withdrawLabel={t("public.vivid.liveTable.withdraw")}
                liveLabel={t("public.vivid.liveTable.live")}
                demoLabel={t("public.vivid.liveTable.demo")}
                loadingText={t("public.vivid.liveTable.loading")}
              />
          </div>

          {/* Promotions: same card as mobile (1:1 image, title, buttons), 1 column in sidebar */}
          <div>
            <SectionHeader title={t("public.vivid.section.promos")} />
            {topPromos.length > 0 ? (
              <div className="flex flex-col gap-4">
                {topPromos.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      ...CARD_STYLE,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      padding: 0,
                    }}
                  >
                    <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", background: "var(--vp-card2)" }}>
                      {p.coverUrl ? (
                        p.promoLink ? (
                          <a href={p.promoLink} target="_blank" rel="noopener noreferrer" style={{ display: "block", height: "100%" }}>
                            <FallbackImage src={p.coverUrl} alt={p.title} className="h-full w-full object-cover object-center" />
                          </a>
                        ) : (
                          <Link href="/promotion" style={{ display: "block", height: "100%" }}>
                            <FallbackImage src={p.coverUrl} alt={p.title} className="h-full w-full object-cover object-center" />
                          </Link>
                        )
                      ) : (
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🎁</div>
                      )}
                    </div>
                    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {p.percentText && (
                        <span style={{
                          display: "inline-flex", width: "fit-content",
                          padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", color: "#fcd34d",
                        }}>
                          {p.percentText}
                        </span>
                      )}
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--vp-text)", lineHeight: 1.4, minHeight: 40 }}>
                        {p.title}
                      </p>
                      <div style={{ display: "flex", gap: 8, height: 36 }}>
                        <Link href="/deposit" className="vp-btn vp-btn-primary" style={{ flex: 1, height: 36, fontSize: 13, minWidth: 0 }}>
                          {t("public.vivid.promo.claim") || "Claim"}
                        </Link>
                        <Link href="/promotion" className="vp-btn vp-btn-outline" style={{ flexShrink: 0, height: 36, fontSize: 12, padding: "0 12px" }}>
                          {t("public.vivid.promo.tnc") || "Terms"}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...CARD_STYLE, padding: 32, textAlign: "center" }}>
                <span style={{ fontSize: 40 }}>🎁</span>
                <p style={{ margin: "12px 0 16px", fontSize: 14, color: "var(--vp-muted)" }}>{t("public.vivid.promo.empty") || "No promotions yet — stay tuned!"}</p>
                <Link href="/promotion" className="vp-btn vp-btn-primary" style={{ height: 36, fontSize: 13 }}>{t("public.vivid.promo.viewAll") || "View Promos"}</Link>
              </div>
            )}
          </div>
        </section>

        {/* ── Popular Games: same section header + same card shell as mobile ── */}
        <section>
          <SectionHeader title={t("public.vivid.section.games")} />
          {topGames.length > 0 ? (
            <div className="vp-tile-grid vp-tile-unified">
              {topGames.map((g) => (
                <Link key={g.id} href={`/games/play/${g.id}`} className="vp-tile vp-tile-unified">
                  <div className="thumb">
                    {g.logoUrl ? (
                      <FallbackImage src={g.logoUrl} alt={g.name} className="h-full w-full object-cover object-center" />
                    ) : (
                      <span style={{ opacity: 0.6 }}>🎮</span>
                    )}
                  </div>
                  <div className="label">{g.name}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ ...CARD_STYLE, padding: 48, textAlign: "center" }}>
              <span style={{ fontSize: 48 }}>🎮</span>
              <p style={{ margin: "16px 0", fontSize: 14, color: "var(--vp-muted)" }}>{t("public.vivid.games.noGames") || "Games coming soon!"}</p>
              <Link href="/games" className="vp-btn vp-btn-primary" style={{ height: 36, fontSize: 13 }}>{t("public.vivid.games.browse") || "Browse Games"}</Link>
            </div>
          )}
        </section>

        {/* ── Trust strip: same card style ── */}
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: "🔒", titleKey: "public.vivid.trust.secureTitle",  descKey: "public.vivid.trust.secureDesc" },
            { icon: "⚡", titleKey: "public.vivid.trust.payoutTitle",   descKey: "public.vivid.trust.payoutDesc" },
            { icon: "🎧", titleKey: "public.vivid.trust.supportTitle", descKey: "public.vivid.trust.supportDesc" },
          ].map((item) => (
            <div key={item.titleKey} style={{ ...CARD_STYLE, padding: "24px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "var(--vp-text)" }}>{t(item.titleKey)}</p>
              <p style={{ margin: 0, fontSize: 12, color: "var(--vp-muted)" }}>{t(item.descKey)}</p>
            </div>
          ))}
        </section>

      </div>

      <VividFooter siteName={siteName} />
    </div>
  );
}

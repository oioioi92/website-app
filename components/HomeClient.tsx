"use client";

import { useMemo, useState } from "react";
import { DesktopThreeColumnShell } from "@/components/public/DesktopThreeColumnShell";
import { FloatingSideActions } from "@/components/public/FloatingSideActions";
import { FallbackImage } from "@/components/FallbackImage";
import { HeroPromotionSlider } from "@/components/public/HeroPromotionSlider";
import { LiveTransactionTable } from "@/components/public/LiveTransactionTable";
import { QuickActionsGrid } from "@/components/public/QuickActionsGrid";
import { type PublicPromotion } from "@/components/public/PromotionCard";
import { SectionBar } from "@/components/public/ui/SectionBar";
import { SocialButtons } from "@/components/public/SocialButtons";
import { TrustFooter } from "@/components/public/TrustFooter";
import { GoldFrame } from "@/components/public/ui/GoldFrame";
import type { ThemeConfig } from "@/lib/public/theme";
import { useRouter } from "next/navigation";
import { ChunkedGameGrid } from "@/components/public/ChunkedGameGrid";
import { resolveUiAssetByName } from "@/lib/public/namedAssets";
import { PromotionModal } from "@/components/public/PromotionModal";

type Promotion = PublicPromotion;

type Game = { id: string; name: string; logoUrl: string | null };
type Social = { id: string; label: string; url: string; iconUrl: string | null };
const SOCIAL_DEFAULTS = [
  { key: "whatsapp", label: "WhatsApp" as const },
  { key: "telegram", label: "Telegram" as const },
  { key: "livechat", label: "LiveChat" as const },
  { key: "facebook", label: "Facebook" as const },
  { key: "robot", label: "Robot" as const }
];

export function HomeClient({
  promotions,
  games,
  social,
  internalTestMode,
  theme
}: {
  promotions: Promotion[];
  games: Game[];
  social: Social[];
  internalTestMode: boolean;
  theme: ThemeConfig;
}) {
  const router = useRouter();
  const t = theme.uiText ?? {};
  const [openPromoId, setOpenPromoId] = useState<string | null>(null);
  const socialButtons = useMemo(
    () => {
      const fromTheme = theme.socialLinks.map((s) => ({
        id: `theme-${s.type}`,
        label: s.label,
        url: s.url,
        iconUrl: s.iconUrl
      }));
      const source = fromTheme.length > 0 ? fromTheme : social;
      return SOCIAL_DEFAULTS.map((item) => {
        const match = source.find((x) => x.label.toLowerCase().includes(item.key));
        return match
          ? match
          : {
              id: `social-default-${item.key}`,
              label: item.label,
              url: "#",
              iconUrl: resolveUiAssetByName(item.label)
            };
      });
    },
    [social, theme.socialLinks]
  );
  const heroSlides = useMemo(() => {
    if (theme.heroBanners.length > 0) {
      return theme.heroBanners.map((item, idx) => ({
        id: `hero-${idx}`,
        imageUrl: item.imageUrl,
        title: item.title ?? "Hero Banner",
        linkUrl: item.linkUrl ?? null
      }));
    }
    return promotions.slice(0, 5).map((item) => ({
      id: item.id,
      imageUrl: item.coverUrl,
      title: item.title,
      promotionId: item.id
    }));
  }, [theme.heroBanners, promotions]);
  const openPromo = useMemo(() => (openPromoId ? promotions.find((p) => p.id === openPromoId) ?? null : null), [openPromoId, promotions]);

  return (
    <>
      <main className="px-4 py-5 lg:hidden">
        <div className="mx-auto max-w-[1200px] space-y-6">
          <div data-frontedit="hero">
            <HeroPromotionSlider
              slides={heroSlides}
              compact
              onOpen={(id) => setOpenPromoId(id)}
            />
          </div>
          {theme.secondaryBannerUrl ? (
            <GoldFrame className="overflow-hidden">
              <div className="aspect-[16/7]">
                <FallbackImage src={theme.secondaryBannerUrl} alt="secondary banner" className="h-full w-full object-cover" />
              </div>
            </GoldFrame>
          ) : null}
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-lg border border-[color:var(--front-gold)]/40 bg-[color:var(--front-gold)]/10 px-3 py-2 text-xs font-semibold text-[color:var(--rb-gold2)]"
              onClick={() => router.push(theme.routes.promotion)}
            >
              {theme.uiText?.promotionstext ?? "Promotions"}
            </button>
          </div>
          <QuickActionsGrid actions={theme.quickActions.slice(0, 6)} title={theme.sectionTitles.quickActions} />
          <LiveTransactionTable
            internalTestMode={internalTestMode}
            title={theme.sectionTitles.liveTransaction}
            loadingText={t.livetxloadingtext ?? undefined}
            depositLabel={t.depositlabel ?? undefined}
            withdrawLabel={t.withdrawlabel ?? undefined}
            liveLabel={t.livelabel ?? undefined}
            demoLabel={t.demolabel ?? undefined}
            internalTestLabel={t.internaltestlabel ?? undefined}
          />
          <GoldFrame innerClassName="px-4 py-4">
            <SectionBar title={theme.sectionTitles.gameZone} />
            <ChunkedGameGrid games={games} pageSize={12} />
          </GoldFrame>
          <GoldFrame innerClassName="px-4 py-4">
            <SectionBar title={theme.sectionTitles.social} />
            <div data-frontedit="social">
              <SocialButtons social={socialButtons} style={theme.socialStyle} />
            </div>
          </GoldFrame>
          <div data-frontedit="trust">
            <TrustFooter badges={theme.trustBadges} groups={theme.trustGroups} />
          </div>
          {internalTestMode ? (
            <section className="rounded-xl border border-[color:var(--front-accent)]/35 bg-[color:var(--front-accent)]/5 p-3 text-xs text-[color:var(--front-accent-light)]">
              <p className="font-semibold">{theme.uiText?.demodatatitle ?? "DEMO DATA / 测试数据"}</p>
              <p className="mt-1 text-[color:var(--front-accent-light)]/80">
                {theme.uiText?.demodatasubtitle ?? "Internal test feed only. No real customer activity."}
              </p>
            </section>
          ) : null}
        </div>
      </main>
      <DesktopThreeColumnShell
        games={games}
        social={socialButtons}
        theme={theme}
        internalTestMode={internalTestMode}
        heroSlides={heroSlides}
        quickActions={theme.quickActions}
      />
      <FloatingSideActions actions={theme.floatingActions} />
      <PromotionModal
        promo={openPromo}
        onClose={() => setOpenPromoId(null)}
        routeBonus={theme.routes.bonus}
        uiText={t}
      />
    </>
  );
}

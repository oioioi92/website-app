"use client";

import { useMemo, useState } from "react";
import { FallbackImage } from "@/components/FallbackImage";
import { HeroPromotionSlider } from "@/components/public/HeroPromotionSlider";
import { LiveTransactionTable } from "@/components/public/LiveTransactionTable";
import { QuickActionsGrid } from "@/components/public/QuickActionsGrid";
import { SocialButtons } from "@/components/public/SocialButtons";
import { TrustFooter } from "@/components/public/TrustFooter";
import { GoldButton } from "@/components/public/ui/GoldButton";
import { GoldFrame } from "@/components/public/ui/GoldFrame";
import { SectionBar } from "@/components/public/ui/SectionBar";
import type { ThemeConfig } from "@/lib/public/theme";
import { inferUiGameCategory, UI_GAME_CATEGORIES, type UiGameCategory } from "@/lib/public/uiGameCategories";
import { PagedGameGrid } from "@/components/public/PagedGameGrid";

type Game = { id: string; name: string; logoUrl: string | null; code?: string | null };
type Social = { id: string; label: string; url: string; iconUrl: string | null };

export function DesktopThreeColumnShell({
  games,
  social,
  theme,
  internalTestMode,
  heroSlides,
  quickActions
}: {
  games: Game[];
  social: Social[];
  theme: ThemeConfig;
  internalTestMode: boolean;
  heroSlides: Array<{ id: string; imageUrl: string | null; title?: string | null; promotionId?: string; linkUrl?: string | null }>;
  quickActions: ThemeConfig["quickActions"];
}) {
  const t = theme.uiText ?? {};
  const categories = useMemo<UiGameCategory[]>(() => {
    const allowed = new Set<UiGameCategory>(UI_GAME_CATEGORIES);
    const fromTheme = (theme.uiGameCategories ?? []).filter((c): c is UiGameCategory => allowed.has(c as UiGameCategory));
    return fromTheme.length > 0 ? fromTheme : [...UI_GAME_CATEGORIES];
  }, [theme.uiGameCategories]);
  const [activeCategory, setActiveCategory] = useState<UiGameCategory>(() => categories[0] ?? "Slots");

  const filteredGames = useMemo(() => {
    const list = games.filter((g) => inferUiGameCategory(g.name, g.code) === activeCategory);
    return list.length > 0 ? list : games;
  }, [games, activeCategory]);

  return (
    <section className="hidden lg:block">
      <div className="mx-auto grid max-w-[1320px] grid-cols-[290px_1fr_310px] gap-4 px-4 py-4">
        <aside className="space-y-4">
          <HeroPromotionSlider slides={heroSlides} />
          {theme.secondaryBannerUrl ? (
            <GoldFrame className="overflow-hidden rounded-2xl">
              <div className="aspect-[16/8]">
                <FallbackImage src={theme.secondaryBannerUrl} alt="secondary banner" className="h-full w-full object-cover" />
              </div>
            </GoldFrame>
          ) : null}
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
          <QuickActionsGrid actions={quickActions} title={theme.sectionTitles.quickActions} />
        </aside>

        <main className="space-y-4">
          <GoldFrame innerClassName="p-3">
            <div className="grid grid-cols-[176px_1fr] gap-3">
              {/* Sticky side categories: 不用回到顶部/横向拖动 */}
              <aside className="self-start">
                <div className="sticky top-4">
                  <SectionBar title={t.categoriestitle ?? "CATEGORIES"} />
                  <div className="mt-3 space-y-2">
                    {categories.map((cat) => {
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveCategory(cat)}
                          className={[
                            "w-full rounded-2xl border px-3 py-4 text-sm font-extrabold tracking-wide transition",
                            isActive
                              ? "border-[color:var(--front-success)]/70 bg-[color:var(--front-success)]/35 text-white"
                              : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                          ].join(" ")}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              <section className="min-w-0">
                <div data-testid="desktop-game-grid">
                  <PagedGameGrid games={filteredGames} pageSize={9} paginate={false} />
                </div>
              </section>
            </div>
          </GoldFrame>
          <div data-frontedit="trust">
            <TrustFooter badges={theme.trustBadges} groups={theme.trustGroups} />
          </div>
        </main>

        <aside className="space-y-4">
          <GoldFrame innerClassName="rounded-2xl p-4">
            <div className="mb-2">
              <SectionBar title={t.accountpaneltitle ?? "ACCOUNT PANEL"} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <GoldButton type="button">{t.logintext ?? "Login"}</GoldButton>
              <GoldButton type="button" className="border-white/20 bg-white/10 text-white/90 shadow-none">
                {t.registertext ?? "Register"}
              </GoldButton>
            </div>
            <div className="mt-3 rounded-lg border border-white/15 bg-black/35 p-3">
              <p className="text-[11px] text-white/70">{t.balancetext ?? "Balance"}</p>
              <p className="mt-1 text-lg font-extrabold text-[color:var(--front-gold-light)]">{internalTestMode ? "DEMO 0.00" : "--"}</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <a href={theme.depositUrl ?? "#"} target="_blank" rel="noreferrer">
                <GoldButton variant="success" className="w-full px-2 py-2 text-[11px]">
                  {t.deposittext ?? "Deposit"}
                </GoldButton>
              </a>
              <a href={theme.withdrawUrl ?? "#"} target="_blank" rel="noreferrer">
                <GoldButton className="w-full border-sky-400/40 bg-sky-500/15 px-2 py-2 text-[11px] text-sky-100 shadow-none">
                  {t.withdrawtext ?? "Withdraw"}
                </GoldButton>
              </a>
              <a href={theme.chatDefaultUrl ?? "#"} target="_blank" rel="noreferrer">
                <GoldButton className="w-full border-white/20 bg-white/10 px-2 py-2 text-[11px] text-white shadow-none">
                  {t.refreshtext ?? "Refresh"}
                </GoldButton>
              </a>
            </div>
          </GoldFrame>
          <GoldFrame innerClassName="p-3">
            <SectionBar title={t.socialtitle ?? "SOCIAL"} />
            <div className="mt-2" data-frontedit="social">
              <SocialButtons social={social} style={theme.socialStyle} />
            </div>
          </GoldFrame>
        </aside>
      </div>
    </section>
  );
}

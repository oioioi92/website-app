"use client";

import { useMemo, useState } from "react";
import { HeroPromotionSlider } from "@/components/public/HeroPromotionSlider";
import { LiveTransactionTable } from "@/components/public/LiveTransactionTable";
import { WalletActionBarV3 } from "@/components/home/WalletActionBarV3";
import { PagedGameGrid } from "@/components/public/PagedGameGrid";
import type { ThemeConfig } from "@/lib/public/theme";
import type { PublicPromotion } from "@/components/public/PromotionCard";
import { FallbackImage } from "@/components/FallbackImage";
import { inferUiGameCategory, UI_GAME_CATEGORIES, type UiGameCategory } from "@/lib/public/uiGameCategories";
import { PromotionModal } from "@/components/public/PromotionModal";

type Promotion = PublicPromotion;
type Game = { id: string; name: string; logoUrl: string | null; code?: string | null };

export function MobileHomeV3({
  theme,
  promotions,
  games,
  internalTestMode
}: {
  theme: ThemeConfig;
  promotions: Promotion[];
  games: Game[];
  internalTestMode: boolean;
}) {
  const t = theme.uiText ?? {};
  const [openPromoId, setOpenPromoId] = useState<string | null>(null);
  const categories = useMemo<UiGameCategory[]>(() => {
    const allowed = new Set<UiGameCategory>(UI_GAME_CATEGORIES);
    const fromTheme = (theme.uiGameCategories ?? []).filter((c): c is UiGameCategory => allowed.has(c as UiGameCategory));
    return fromTheme.length > 0 ? fromTheme : [...UI_GAME_CATEGORIES];
  }, [theme.uiGameCategories]);
  const [activeCat, setActiveCat] = useState<UiGameCategory>(() => categories[0] ?? "Slots");
  const heroSlides = useMemo(
    () =>
      promotions.slice(0, 5).map((item) => ({
        id: item.id,
        imageUrl: item.coverUrl,
        title: item.title,
        promotionId: item.id
      })),
    [promotions]
  );
  const openPromo = useMemo(
    () => (openPromoId ? promotions.find((p) => p.id === openPromoId) ?? null : null),
    [openPromoId, promotions]
  );

  return (
    <main className="px-4 py-5 lg:hidden">
      <div className="mx-auto max-w-[520px] space-y-3">
        {/* 1) Sliding promotion photos (reference-like) */}
        <div data-testid="v3-sliding-promo-mobile" data-frontedit="hero">
          <HeroPromotionSlider
            slides={heroSlides}
            compact
            onOpen={(id) => setOpenPromoId(id)}
          />
        </div>

        {/* 1.5 + 2) Slot 与 LiveTx “黏在一起”，但仍属于上下两个格子（共用外框 + 中间分割线） */}
        <section
          className="overflow-hidden rounded-xl border border-white/15 bg-white/5"
          data-testid="v3-slot-livetx-group-mobile"
        >
          <div className="p-2" data-testid="v3-middle-slot-mobile">
            <div className="flex h-[72px] w-full items-center justify-center overflow-hidden rounded-lg bg-black/20">
              {theme.centerSlotImageUrl ? (
                <FallbackImage src={theme.centerSlotImageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-white/45">{t.slottext ?? "Slot"}</span>
              )}
            </div>
          </div>
          <div className="h-px w-full bg-white/10" aria-hidden />
          <div className="p-2" data-testid="v3-live-tx-panel-mobile">
            <LiveTransactionTable
              internalTestMode={internalTestMode}
              variant="v3"
              depositColor={theme.actionBarDepositColor}
              withdrawColor={theme.actionBarWithdrawColor}
              title={theme.sectionTitles.liveTransaction}
              loadingText={t.livetxloadingtext ?? undefined}
              depositLabel={t.depositlabel ?? undefined}
              withdrawLabel={t.withdrawlabel ?? undefined}
              liveLabel={t.livelabel ?? undefined}
              demoLabel={t.demolabel ?? undefined}
              internalTestLabel={t.internaltestlabel ?? undefined}
            />
          </div>
        </section>

        {/* 3) Login/Register below LiveTx */}
        <section className="rounded-xl" data-testid="v3-action-bar-mobile">
          <WalletActionBarV3
            variant="reference"
            loginUrl={theme.loginUrl}
            registerUrl={theme.registerUrl}
            depositUrl={theme.depositUrl}
            withdrawUrl={theme.withdrawUrl}
            depositColor={theme.actionBarDepositColor}
            withdrawColor={theme.actionBarWithdrawColor}
            buttonImages={theme.actionBarButtonImages}
            limits={theme.actionBarLimits}
          />
        </section>

        {/* 4) 全部游戏区（底部 tab 的 /#games 会滚到这里） */}
        <section
          id="games"
          className="rounded-xl border border-white/10 bg-black/25 p-3"
          data-testid="v3-games-section-mobile"
        >
          {/* Side categories (避免横向滑动/回到顶部点分类) */}
          <div className="grid grid-cols-[104px_1fr] gap-3">
            <nav className="space-y-2">
              {categories.map((c) => {
                const isActive = c === activeCat;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCat(c)}
                    className={[
                      "w-full rounded-2xl border px-2 py-3 text-[12px] font-extrabold tracking-wide transition",
                      "flex items-center justify-center text-center",
                      isActive
                        ? "border-[color:var(--front-success)]/70 bg-[color:var(--front-success)]/35 text-white"
                        : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
                    ].join(" ")}
                  >
                    {c}
                  </button>
                );
              })}
            </nav>

            <div className="min-w-0">
              <PagedGameGrid
                games={games.filter((g) => inferUiGameCategory(g.name, g.code) === activeCat)}
                pageSize={9}
                paginate={false}
              />
            </div>
          </div>
        </section>
      </div>
      <PromotionModal promo={openPromo} onClose={() => setOpenPromoId(null)} routeBonus={theme.routes.bonus} uiText={t} />
    </main>
  );
}


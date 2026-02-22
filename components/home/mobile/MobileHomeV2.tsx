"use client";

import { useMemo, useState } from "react";
import { PromoBannerCard } from "./PromoBannerCard";
import { CategoryPills } from "./CategoryPills";
import { LiveTransactionTable } from "@/components/public/LiveTransactionTable";
import { PartnershipBadge } from "@/components/public/PartnershipBadge";
import { QuickActionsGrid } from "@/components/public/QuickActionsGrid";
import type { ThemeConfig } from "@/lib/public/theme";
import type { PublicPromotion } from "@/components/public/PromotionCard";
import { PromotionModal } from "@/components/public/PromotionModal";

type Promo = PublicPromotion;
type Game = { id: string; name: string; logoUrl: string | null; code?: string | null };

const V2_ACTIONS = [
  { label: "SHARE", url: "#share", iconKey: "share", style: "dark" },
  { label: "DOWNLINE", url: "#downline", iconKey: "downline", style: "dark" },
  { label: "REFERRAL LINK", url: "#referral", iconKey: "link", style: "dark" },
  { label: "FREE GAME TIPS", url: "#tips", iconKey: "tips", style: "primary" } // Orange
] as ThemeConfig["quickActions"];

export function MobileHomeV2({
  theme,
  promotions,
  games: _games,
  internalTestMode
}: {
  theme: ThemeConfig;
  promotions: Promo[];
  games: Game[];
  internalTestMode: boolean;
}) {
  void _games;
  const [activeCategory, setActiveCategory] = useState("all");
  const t = theme.uiText ?? {};
  const [openPromoId, setOpenPromoId] = useState<string | null>(null);

  const promo = promotions[0];
  const openPromo = useMemo(
    () => (openPromoId ? promotions.find((p) => p.id === openPromoId) ?? null : null),
    [openPromoId, promotions]
  );
  
  // Default keeps the reference layout; allow admin override when quickActions is configured.
  const actions = theme.quickActions && theme.quickActions.length > 0 ? theme.quickActions : V2_ACTIONS;

  return (
    <main className="px-4 py-5 lg:hidden">
      <div className="mx-auto max-w-[520px] space-y-4">
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

        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <PromoBannerCard
              imageUrl={promo?.coverUrl ?? null}
              title={promo?.title ?? null}
              linkUrl={theme.routes?.promotion ?? "/promotion"}
              fallbackUrl={theme.routes?.promotion ?? "/promotion"}
              onClick={promo?.id ? () => setOpenPromoId(promo.id) : undefined}
            />
          </div>
          <PartnershipBadge imageUrl={theme.partnershipBadgeUrl ?? null} />
        </div>

        <QuickActionsGrid actions={actions} title={theme.sectionTitles.quickActions} />

        <CategoryPills activeId={activeCategory} onChange={setActiveCategory} categories={theme.categoryPills} />
        <section className="rounded-xl border border-white/15 bg-white/5 py-8 text-center">
          <p className="text-sm text-white/50">{t.comingsoontext ?? "Coming soon"}</p>
        </section>

        {/* NOTE: bottom tab bar lives in MobileShell */}
      </div>
      <PromotionModal promo={openPromo} onClose={() => setOpenPromoId(null)} routeBonus={theme.routes.bonus} uiText={t} />
    </main>
  );
}

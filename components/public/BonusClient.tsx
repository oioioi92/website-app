"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FallbackImage } from "@/components/FallbackImage";
import { type PublicPromotion } from "@/components/public/PromotionCard";
import { PromotionModal } from "@/components/public/PromotionModal";
import { GoldFrame } from "@/components/public/ui/GoldFrame";
import { SectionBar } from "@/components/public/ui/SectionBar";

type Game = { id: string; name: string; logoUrl: string | null };

export function BonusClient({
  promotions,
  games,
  uiText,
  routeBonus,
  promotionPattern = "classic",
  promotionFontPreset = "default"
}: {
  promotions: PublicPromotion[];
  games: Game[];
  uiText?: Record<string, string>;
  routeBonus?: string;
  promotionPattern?: "classic" | "image_tiles" | "image_strips";
  promotionFontPreset?: "default" | "compact" | "bold";
}) {
  // Currently unused; kept for future "related games" UI without breaking callers.
  void games;
  const t = uiText ?? {};
  const bonusBase = routeBonus && routeBonus.trim().length > 0 ? routeBonus.trim() : "/bonus";
  const [openPromoId, setOpenPromoId] = useState<string | null>(null);
  const fontClass =
    promotionFontPreset === "compact"
      ? "text-[12px] leading-4"
      : promotionFontPreset === "bold"
      ? "text-[15px] leading-6 font-bold tracking-wide"
      : "text-[14px] leading-5";
  
  // Flatten all promos into a single list for grid display (like reference)
  // or keep grouped if strictly needed. Reference image shows "ALL OFFERS" tab style,
  // but for now we just show all grid.
  const allItems = useMemo(() => promotions, [promotions]);
  const openPromo = useMemo(() => (openPromoId ? allItems.find((p) => p.id === openPromoId) ?? null : null), [allItems, openPromoId]);

  const grouped = useMemo(() => {
    const byGroup = new Map<string, PublicPromotion[]>();
    for (const p of allItems) {
      const g = (p.groupLabel || "BONUS PACKAGE").trim() || "BONUS PACKAGE";
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g)!.push(p);
    }
    return Array.from(byGroup.entries());
  }, [allItems]);

  return (
    <main className="min-h-screen bg-[color:var(--p44-grey-bg)] px-4 py-5">
      <div className="mx-auto max-w-[1200px] space-y-8">
        <GoldFrame innerClassName="px-4 py-4 md:px-5 md:py-6 border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-grey-panel)]/60">
          <SectionBar title={t.bonusallofferstitle ?? "ALL OFFERS"} />
          
          {grouped.map(([groupName, groupPromos]) => (
            <div key={groupName} className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-[color:var(--p44-grey-bg)] px-3 py-2 border border-[color:var(--p44-grey-light)]/30">
                <span className="text-sm font-bold text-white uppercase tracking-wide">{groupName}</span>
              </div>
              <div
                className={
                  promotionPattern === "image_tiles"
                    ? "grid grid-cols-2 gap-3 md:grid-cols-3"
                    : promotionPattern === "image_strips"
                    ? "space-y-2"
                    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
                }
              >
            {groupPromos.map((promo) => (
              <div
                key={promo.id}
                id={promo.id}
                className="overflow-hidden rounded-xl border border-[color:var(--p44-silver-border)]/50 bg-[color:var(--p44-grey-panel)]/80"
              >
                <button
                  type="button"
                  className={promotionPattern === "image_strips" ? "hidden" : "ui-bonus-tile-cover block w-full text-left"}
                  onClick={() => setOpenPromoId(promo.id)}
                >
                  <FallbackImage 
                    src={promo.coverUrl} 
                    alt={promo.title} 
                    className={
                      promotionPattern === "image_tiles"
                        ? "ui-asset-img h-[140px] w-full object-cover md:h-[170px]"
                        : promotionPattern === "image_strips"
                        ? "ui-asset-img h-[120px] w-full object-cover md:h-[140px]"
                        : "ui-asset-img h-full w-full object-cover"
                    }
                  />
                  {/* Status Badge (optional, based on your existing data) */}
                  {promo.statusLabel !== "ACTIVE" && (
                    <div className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur">
                      {promo.statusLabel}
                    </div>
                  )}
                </button>
                
                <div
                  className={
                    promotionPattern === "image_tiles"
                      ? "cursor-pointer space-y-2 p-2.5"
                      : promotionPattern === "image_strips"
                      ? "cursor-pointer p-3 sm:p-3.5"
                      : "ui-bonus-tile-body cursor-pointer"
                  }
                  onClick={() => setOpenPromoId(promo.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setOpenPromoId(promo.id);
                  }}
                >
                  {promotionPattern === "image_strips" ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className={`truncate text-[color:var(--front-gold-light)] ${fontClass} font-semibold`}>
                          {promo.title || t.bonusallofferstitle || "Promotion"}
                        </h3>
                        <p className="mt-1 truncate text-[12px] text-white/70">
                          {promo.subtitle || promo.limitTag || (t.bonustermsapply ?? "点击查看活动详情与规则")}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-md border border-[color:var(--front-gold)]/30 bg-[color:var(--front-gold)]/10 px-2 py-1 text-[11px] font-semibold text-[color:var(--front-gold-light)]">
                        查看
                      </span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className={`line-clamp-2 text-[color:var(--front-gold-light)] ${fontClass} ${promotionPattern === "classic" ? "ui-bonus-tile-title" : "font-semibold"}`}>
                          {promo.title}
                        </h3>
                        <p className={`mt-1 text-white/75 ${promotionPattern === "classic" ? "ui-bonus-tile-desc" : "text-[12px]"}`}>
                          {promo.subtitle || promo.limitTag || (t.bonustermsapply ?? "Terms apply.")}
                        </p>
                      </div>
                      <div className="mt-2">
                        <ClaimTrigger
                          promo={promo}
                          claimNowText={t.bonusclaimnowtext ?? "CLAIM NOW"}
                          onOpenPromotion={(id) => setOpenPromoId(id)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
              </div>
            </div>
          ))}

          {allItems.length === 0 && (
            <p className="text-center text-sm text-white/50 py-8">{t.bonusnopromostext ?? "No promotions available."}</p>
          )}
        </GoldFrame>
        <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-grey-panel)] px-6 py-4">
          <p className="text-sm font-medium text-white">JOIN US FOR LATEST INFO / NEW BONUS / FREE CREDIT</p>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--p44-green)] px-4 py-2 text-sm font-bold text-white">✈ JOIN NOW</Link>
        </div>
      </div>
      <PromotionModal promo={openPromo} onClose={() => setOpenPromoId(null)} routeBonus={bonusBase} uiText={t} />
    </main>
  );
}

function ClaimTrigger({
  promo,
  claimNowText,
  onOpenPromotion
}: {
  promo: PublicPromotion;
  claimNowText: string;
  onOpenPromotion: (promotionId: string) => void;
}) {
  // Simple trigger wrapper. In a real scenario, clicking this might open a modal
  // or expand details. For visual match, it's a button.
  // We reuse the existing claim panel logic but styled as a single button first.
  
  return (
    <div className="w-full">
       {/* 
         NOTE: Real claiming logic is complex (forms, loading). 
         Here we just render the button that would trigger it.
         For full functionality, we'd need a modal.
         For now, we link to detail or just show the panel button style.
       */}
       <button 
         type="button"
         className="w-full rounded-lg border-2 border-[color:var(--p44-silver)] bg-[color:var(--p44-silver)]/20 py-2 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
         onClick={() => onOpenPromotion(promo.id)}
       >
         {claimNowText}
       </button>
    </div>
  );
}

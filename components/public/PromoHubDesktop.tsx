"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FallbackImage } from "@/components/FallbackImage";
import type { PublicPromotion } from "@/components/public/PromotionCard";
import { PromotionModal } from "@/components/public/PromotionModal";

const TABS = [
  { key: "Promotion", label: "Promotion" },
  { key: "Bonus", label: "Bonus" },
  { key: "Rebate", label: "Rebate" },
  { key: "VIP", label: "VIP" },
  { key: "Events", label: "Events" },
] as const;

/** V3: Tabs Bar col-span-12 h-72，3 列卡片固定 h-220，每卡 1 个金按钮 + mt-auto 贴底 */
export function PromoHubDesktop({
  promotions,
  defaultTab = "Promotion",
  routeBonus = "/bonus",
  uiText = {}
}: {
  promotions: PublicPromotion[];
  defaultTab?: "Promotion" | "Bonus" | "Rebate" | "VIP" | "Events";
  routeBonus?: string;
  uiText?: Record<string, string>;
}) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [openPromoId, setOpenPromoId] = useState<string | null>(null);

  const openPromo = useMemo(
    () => (openPromoId ? promotions.find((p) => p.id === openPromoId) ?? null : null),
    [openPromoId, promotions]
  );

  const filtered = useMemo(() => {
    const key = activeTab.toLowerCase();
    if (key === "promotion" || key === "bonus") return promotions;
    return promotions.filter((p) => (p.groupLabel ?? "").toLowerCase().includes(key));
  }, [activeTab, promotions]);

  return (
    <div className="public-desktop-shell hidden min-h-screen lg:block">
      <div data-desktop-header>
        <div className="desk-container flex h-full items-center justify-between">
          <Link href="/" className="text-base font-semibold text-[var(--desk-text)]">KINGDOM888</Link>
          <div className="flex gap-3">
            <Link href="/" className="desk-btn-secondary h-12">Home</Link>
            <Link href={routeBonus} className="desk-btn-primary h-12">Bonus</Link>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-[1560px] px-6 py-6" data-desktop-main>
        <div className="grid grid-cols-12 gap-6">
          {/* V3: Tabs Bar col-span-12 h-72 */}
          <div className="col-span-12 h-[72px] flex items-center">
            <div className="desk-card w-full h-full flex items-center gap-3">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`h-12 rounded-[18px] border-2 px-6 flex items-center text-sm font-medium transition ${
                    activeTab === tab.key
                      ? "border-[var(--desk-accent)] bg-[var(--desk-accent)]/20 text-[var(--desk-accent)]"
                      : "border-[var(--desk-border)] text-[var(--desk-text)] hover:border-[var(--desk-accent)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {/* V3: Grid col-span-12，3 列，每卡 h-220 */}
          <div className="col-span-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <div className="col-span-full desk-card h-[220px] flex items-center justify-center text-[var(--desk-text-muted)] text-sm">
                No offers in this tab.
              </div>
            ) : (
              filtered.map((promo) => (
                <div
                  key={promo.id}
                  className="promo-hub-premium-card flex flex-col overflow-hidden p-0 h-[220px] transition"
                >
                  <button
                    type="button"
                    className="flex flex-col flex-1 min-h-0 w-full text-left"
                    onClick={() => setOpenPromoId(promo.id)}
                  >
                    <div className="aspect-[16/10] bg-[var(--desk-panel-alt)] shrink-0 overflow-hidden">
                      <FallbackImage src={promo.coverUrl} alt={promo.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-6 flex flex-col flex-1 min-h-0">
                      <h3 className="promo-hub-premium-title text-[15px] font-semibold truncate">{promo.title}</h3>
                      <p className="text-[13px] text-[var(--desk-text-muted)] truncate mt-1">{promo.percentText}{promo.limitTag ? ` · ${promo.limitTag}` : ""}</p>
                      <div className="desk-card-foot mt-auto">
                        <span className="desk-btn-primary h-12 flex-1 flex items-center justify-center">{uiText.bonusclaimnowtext ?? "Claim"}</span>
                        <span className="desk-btn-secondary h-12 shrink-0 px-4 flex items-center justify-center">View T&C</span>
                      </div>
                    </div>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <footer data-desktop-footer>
        <div className="desk-container text-center">
          <div className="footer-links">
            <Link href="/responsible-gaming" className="hover:text-[var(--desk-text)]">Responsible Gaming</Link>
            <Link href="/security" className="hover:text-[var(--desk-text)]">Security</Link>
            <Link href="/privacy" className="hover:text-[var(--desk-text)]">Privacy</Link>
          </div>
          <p className="mt-3 mb-0 text-[13px] font-medium">18+ Only. Play responsibly.</p>
        </div>
      </footer>
      <PromotionModal promo={openPromo} onClose={() => setOpenPromoId(null)} routeBonus={routeBonus} uiText={uiText} />
    </div>
  );
}

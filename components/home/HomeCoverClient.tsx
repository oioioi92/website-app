"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DesktopHeader } from "@/components/home/DesktopHeader";
import { DesktopHeaderV3 } from "@/components/home/DesktopHeaderV3";
import { Hero } from "@/components/home/Hero";
import { PromotionShowcase } from "@/components/home/PromotionShowcase";
import { ModuleGrid } from "@/components/home/ModuleGrid";
import { ReportsAndPromos } from "@/components/home/ReportsAndPromos";
import { DesktopFooter } from "@/components/home/DesktopFooter";
import { LiveTransactionTable } from "@/components/public/LiveTransactionTable";
import { PartnershipBadge } from "@/components/public/PartnershipBadge";
import { WalletActionBarV3 } from "@/components/home/WalletActionBarV3";
import { HeroPromotionSlider } from "@/components/public/HeroPromotionSlider";
import type { PublicPromotion } from "@/components/public/PromotionCard";
import { PromotionModal } from "@/components/public/PromotionModal";

type Promo = PublicPromotion;
type Social = { id: string; label: string; url: string; iconUrl: string | null };
type Game = { id: string; name: string; logoUrl: string | null; code?: string | null };

export function HomeCoverClient({
  logoUrl,
  siteName,
  promotions,
  social,
  legalLinks,
  uiText,
  routes,
  centerSlotImageUrl = null,
  loginUrl = null,
  registerUrl = null,
  depositUrl = null,
  withdrawUrl = null,
  actionBarDepositColor = null,
  actionBarWithdrawColor = null,
  actionBarButtonImages,
  actionBarLimits,
  liveTxBgImageUrl = null,
  partnershipBadgeUrl = null,
  isAdmin = false,
  internalTestMode = false,
  useV3Layout = false,
  ..._compat
}: {
  logoUrl: string | null;
  siteName?: string;
  promotions: Promo[];
  games: Game[];
  social: Social[];
  legalLinks?: Array<{ label: string; href: string }>;
  uiText?: Record<string, string>;
  routes?: { bonus?: string; promotion?: string };
  announcementMarqueeText?: string | null;
  marqueeMessages?: string[];
  /** (Marquee shown in MobileShell only; these props kept for API compatibility.) */
  centerSlotImageUrl?: string | null;
  loginUrl?: string | null;
  registerUrl?: string | null;
  depositUrl?: string | null;
  withdrawUrl?: string | null;
  actionBarDepositColor?: string | null;
  actionBarWithdrawColor?: string | null;
  actionBarButtonImages?: {
    login: string | null;
    register: string | null;
    deposit: string | null;
    withdraw: string | null;
    refresh: string | null;
    signout: string | null;
  };
  actionBarLimits?: {
    minDeposit: string | null;
    maxDeposit: string | null;
    minWithdraw: string | null;
    maxWithdraw: string | null;
  };
  liveTxBgImageUrl?: string | null;
  partnershipBadgeUrl?: string | null;
  isAdmin?: boolean;
  internalTestMode?: boolean;
  useV3Layout?: boolean;
}) {
  // Keep backward-compatible props accepted by API without using them on desktop.
  void _compat;
  const t = uiText ?? {};
  const routeBonus = routes?.bonus && routes.bonus.trim().length > 0 ? routes.bonus.trim() : "/bonus";
  const [openPromoId, setOpenPromoId] = useState<string | null>(null);
  const heroSlides = useMemo(
    () =>
      promotions.slice(0, 5).map((p) => ({
        id: p.id,
        imageUrl: p.coverUrl,
        title: p.title,
        promotionId: p.id
      })),
    [promotions]
  );
  const openPromo = useMemo(
    () => (openPromoId ? promotions.find((p) => p.id === openPromoId) ?? null : null),
    [openPromoId, promotions]
  );

  return (
    <div className="hidden min-h-screen bg-[color:var(--p44-grey-bg)] lg:block">
      <div data-frontedit="header">
        {useV3Layout ? (
          <DesktopHeaderV3 logoUrl={logoUrl} siteName={siteName} />
        ) : (
          <DesktopHeader logoUrl={logoUrl} siteName={siteName} />
        )}
      </div>
      {/* Marquee shown once in MobileShell to avoid duplicate "Welcome — ..." */}
      <main className="mx-auto flex max-w-[1320px] w-full gap-6 px-6 py-8">
        <div className="min-w-0 flex-1">
        {useV3Layout ? (
          <>
            {/* A) Sliding Promotion 在 LiveTx 上方 */}
            <section
              className="relative mt-4 overflow-visible"
              data-testid="v3-sliding-promo"
            >
              <div className="flex flex-nowrap items-stretch gap-4">
                <div className="min-w-0 flex-1 rounded-xl border border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-grey-panel)]/50 p-2" data-frontedit="hero">
                  <HeroPromotionSlider slides={heroSlides} onOpen={(id) => setOpenPromoId(id)} />
                </div>
                <div
                  className="flex min-h-[280px] w-[280px] shrink-0 flex-col rounded-xl border border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-grey-panel)]/50 overflow-hidden"
                  data-testid="v3-center-slot"
                  data-frontedit="centerSlot"
                >
                  {centerSlotImageUrl ? (
                    <img src={centerSlotImageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/40 text-sm">
                      {t.centerslotplaceholder ?? "插图槽"}
                    </div>
                  )}
                </div>
              </div>
              {partnershipBadgeUrl ? (
                <div className="absolute right-4 top-4 z-10" data-frontedit="header">
                  <PartnershipBadge imageUrl={partnershipBadgeUrl} />
                </div>
              ) : null}
            </section>
            {/* B) LiveTx */}
            <section className="mt-6 w-full" data-testid="v3-livetx-section" data-frontedit="liveTx">
              <div
                className={`rounded-xl border border-[color:var(--p44-grey-light)]/30 overflow-hidden bg-cover bg-center ${liveTxBgImageUrl ? "relative" : "bg-[color:var(--p44-grey-panel)]/60"}`}
                data-testid="v3-live-tx-panel"
                style={liveTxBgImageUrl ? { backgroundImage: `url(${liveTxBgImageUrl})` } : undefined}
              >
                {liveTxBgImageUrl ? <div className="absolute inset-0 bg-black/20 pointer-events-none" aria-hidden /> : null}
                <div className={liveTxBgImageUrl ? "relative z-10" : ""}>
                <LiveTransactionTable
                  internalTestMode={internalTestMode}
                  variant="v3"
                  depositColor={actionBarDepositColor ?? "var(--p44-green)"}
                  withdrawColor={actionBarWithdrawColor ?? "var(--p44-red)"}
                  title={t.livetxtitle ?? undefined}
                  loadingText={t.livetxloadingtext ?? undefined}
                  depositLabel={t.depositlabel ?? undefined}
                  withdrawLabel={t.withdrawlabel ?? undefined}
                  liveLabel={t.livelabel ?? undefined}
                  demoLabel={t.demolabel ?? undefined}
                  internalTestLabel={t.internaltestlabel ?? undefined}
                />
                </div>
              </div>
            </section>
            {/* C) Wallet Action Bar */}
            <section
              className="mt-4 w-full rounded-xl border border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-grey-panel)]/60 py-4"
              data-testid="v3-wallet-bar-wrap"
              data-frontedit="wallet"
            >
              <WalletActionBarV3
                loginUrl={loginUrl}
                registerUrl={registerUrl}
                depositUrl={depositUrl}
                withdrawUrl={withdrawUrl}
                depositColor={actionBarDepositColor ?? "#22c55e"}
                withdrawColor={actionBarWithdrawColor ?? "#dc2626"}
                buttonImages={actionBarButtonImages}
                limits={actionBarLimits}
              />
            </section>
            {/* D) Referral / Join banner */}
            <section className="mt-6 rounded-xl border border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-grey-panel)] px-6 py-5 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-2xl font-black text-white">20%</p>
                <p className="text-sm font-bold text-white/90">REFERRAL COMMISSION</p>
                <p className="mt-1 text-xs text-white/70">JOIN US FOR LATEST INFO / NEW BONUS / FREE CREDIT</p>
              </div>
              <Link href="/bonus" className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--p44-grey-bg)] px-4 py-2.5 text-sm font-semibold text-white border border-[color:var(--p44-silver-border)]">
                <span>✈</span> JOIN NOW
              </Link>
            </section>
          </>
        ) : (
          <>
            <Hero />
            <div className="mt-6 flex flex-wrap items-start gap-4">
              <div className="min-w-0 flex-1">
                <PromotionShowcase promotions={promotions} routeBonus={routeBonus} uiText={t} />
              </div>
              <PartnershipBadge imageUrl={partnershipBadgeUrl} />
            </div>
            <div className="mt-6">
              <LiveTransactionTable
                internalTestMode={internalTestMode}
                title={t.livetxtitle ?? undefined}
                loadingText={t.livetxloadingtext ?? undefined}
                depositLabel={t.depositlabel ?? undefined}
                withdrawLabel={t.withdrawlabel ?? undefined}
                liveLabel={t.livelabel ?? undefined}
                demoLabel={t.demolabel ?? undefined}
                internalTestLabel={t.internaltestlabel ?? undefined}
              />
            </div>
          </>
        )}

        <div className="mt-14 space-y-12">
          <ModuleGrid isAdmin={isAdmin} />
          <ReportsAndPromos promotions={promotions.slice(0, 3)} routeBonus={routeBonus} uiText={t} />
          <section>
            <h2 className="mb-3 text-xl font-bold text-white">{uiText?.gamespreviewtitle ?? "Games Preview"}</h2>
            <div className="rounded-xl border border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-grey-panel)]/50 py-12 text-center">
              <p className="text-sm text-white/50">{uiText?.comingsoontext ?? "Coming soon"}</p>
            </div>
          </section>
        </div>
        </div>
        {/* Right column: Account panel + Hotline (PERODUA44 style) */}
        <aside className="hidden w-[300px] shrink-0 flex-col gap-4 lg:flex">
          <div className="rounded-xl border border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-grey-panel)] p-4 space-y-3">
            <div className="flex gap-2">
              <Link href={loginUrl || "/login"} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-bold text-white bg-[color:var(--p44-green)]">👤 LOGIN</Link>
              <Link href={registerUrl || "/register"} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-bold text-white bg-[color:var(--p44-red)]">📄 REGISTER</Link>
            </div>
            <div className="text-sm text-white/90">
              <p className="font-semibold">Balance: RM 0.00</p>
              <p className="font-semibold">Winover: RM 0.00</p>
              <a href="#" className="text-[color:var(--p44-red)] text-xs">Surrender</a>
            </div>
            <div className="flex flex-col gap-2">
              <Link href={depositUrl || "/deposit"} className="flex items-center justify-center gap-2 rounded-lg border border-[color:var(--p44-silver-border)] bg-white/10 py-2 text-sm font-medium text-white">DEPOSIT</Link>
              <Link href={withdrawUrl || "/withdraw"} className="flex items-center justify-center gap-2 rounded-lg border border-[color:var(--p44-silver-border)] bg-white/10 py-2 text-sm font-medium text-white">WITHDRAW</Link>
              <Link href="/me" className="flex items-center justify-center gap-2 rounded-lg border border-[color:var(--p44-silver-border)] bg-white/10 py-2 text-sm font-medium text-white">TRANSFER</Link>
              <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-[color:var(--p44-silver-border)] bg-white/10 py-2 text-sm font-medium text-white">REFRESH</button>
            </div>
          </div>
          <a href="/chat" className="flex flex-col items-center gap-1 rounded-xl border border-[color:var(--p44-red)]/50 bg-[color:var(--p44-red)]/20 p-3 text-[color:var(--p44-red)] font-bold text-sm">
            <span className="text-xl">🎧</span> HOTLINE
          </a>
          <div className="rounded border border-black/80 bg-black/90 py-2 px-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white vertical-rl" style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>TRUSTED SITE</p>
            <p className="text-[10px] text-[color:var(--p44-green)] mt-1">★★★★★</p>
          </div>
        </aside>
      </main>
      <DesktopFooter social={social} legalLinks={legalLinks} />
      <PromotionModal promo={openPromo} onClose={() => setOpenPromoId(null)} routeBonus={routeBonus} uiText={t} />
    </div>
  );
}

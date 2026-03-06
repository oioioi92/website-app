"use client";

import Link from "next/link";
import { useState } from "react";
import "@/styles/vivid-portal.css";
import { VividTopbar } from "./VividTopbar";
import { VividFooter } from "./VividFooter";
import { LiveTransactionTable } from "@/components/public/LiveTransactionTable";
import { ReferralBlock } from "@/components/public/ReferralBlock";
import { FallbackImage } from "@/components/FallbackImage";
import { PromotionModal } from "@/components/public/PromotionModal";
import type { PublicPromotion } from "@/components/public/PromotionCard";
import { useLocale } from "@/lib/i18n/context";

type Promo = PublicPromotion;
type Game  = { id: string; name: string; logoUrl: string | null };
type Social = { id: string; label: string; url: string };

const QUICK_ACTIONS = [
  { label: "Deposit",  href: "/deposit",     icon: "💰", color: "#7c3aed" },
  { label: "Withdraw", href: "/withdraw",    icon: "📤", color: "#6366f1" },
  { label: "Bonus",    href: "/bonus",       icon: "🎁", color: "#a855f7" },
  { label: "Support",  href: "/live-chat",   icon: "💬", color: "#4f46e5" },
];

export function VividHomeClient({
  siteName = "KINGDOM888",
  promotions = [],
  games = [],
  loginUrl = "/login",
  registerUrl = "/register-wa",
  depositUrl = "/deposit",
  internalTestMode = false,
}: {
  siteName?: string;
  promotions?: Promo[];
  games?: Game[];
  loginUrl?: string;
  registerUrl?: string;
  depositUrl?: string;
  internalTestMode?: boolean;
}) {
  const { t } = useLocale();
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const topGames  = games.slice(0, 12);
  const topPromos = promotions.slice(0, 3);

  const QUICK_ACTIONS_I18N = [
    { label: t("public.actions.deposit"),  href: depositUrl,    icon: "💰", color: "#7c3aed" },
    { label: t("public.actions.withdraw"), href: "/withdraw",   icon: "📤", color: "#6366f1" },
    { label: t("public.vivid.bottomNav.bonus"), href: "/bonus", icon: "🎁", color: "#a855f7" },
    { label: t("public.nav.support"),      href: "/chat",       icon: "💬", color: "#4f46e5" },
  ];

  return (
    <div className="vp-shell">
      <VividTopbar siteName={siteName} loginUrl={loginUrl} registerUrl={registerUrl} />

      <div className="vp-w vp-main">

        {/* ── Announcement ── */}
        <div className="vp-announce">
          <div className="vp-announce-dot" />
          <p className="text-sm m-0" style={{ color: "var(--vp-muted)", flex: 1 }}>
            {t("public.vivid.announce")}
          </p>
          <Link href="/promotion" className="vp-btn vp-btn-outline" style={{ height: 30, padding: "0 14px", fontSize: 13 }}>
            {t("public.nav.promotion")}
          </Link>
        </div>

        {/* ── Hero ── */}
        <section className="vp-hero">
          <div className="vp-hero-badge">{t("public.vivid.hero.badge")}</div>
          <h1>{t("public.vivid.hero.subtitle")} {siteName}<br />{t("public.vivid.hero.title")}</h1>
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
            <LiveTransactionTable
              internalTestMode={internalTestMode}
              variant="v3"
              title={t("public.vivid.liveTable.title")}
              depositLabel={t("public.vivid.liveTable.deposit")}
              withdrawLabel={t("public.vivid.liveTable.withdraw")}
              liveLabel={t("public.vivid.liveTable.live")}
              demoLabel={t("public.vivid.liveTable.demo")}
              loadingText={t("public.vivid.liveTable.loading")}
            />

            {/* ── 推荐：分享/复制链接/查看下线，Login 点击跳转登录页 ── */}
            <ReferralBlock registerPath={registerUrl ?? "/register-wa"} loginPath={loginUrl ?? "/login"} />
          </div>
          <div className="flex flex-col gap-4">
            {topPromos.length > 0 ? (
              topPromos.map((p) => (
                <div key={p.id} className="vp-promo-card flex-row overflow-hidden" style={{ borderRadius: 14, height: 140 }}>
                  <div style={{ display: "flex", flex: 1, gap: 0, overflow: "hidden", borderRadius: "inherit", height: "100%" }}>
                    {/* 照片：通用缩图，有 promoLink 则可点击跳转 */}
                    <div style={{ width: 210, height: "100%", flexShrink: 0, background: "var(--vp-card2)", overflow: "hidden", position: "relative", borderRadius: "14px 0 0 14px" }}>
                      {(p.coverUrlMobilePromo || p.coverUrl)
                        ? p.promoLink
                          ? <a href={p.promoLink} target="_blank" rel="noopener noreferrer" style={{ display: "block", position: "absolute", inset: 0 }}>
                              <img
                                src={p.coverUrlMobilePromo || p.coverUrl || "/placeholder.svg"}
                                alt={p.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block", transform: "scale(1.08)" }}
                                onError={e => { e.currentTarget.src = "/placeholder.svg"; }}
                              />
                            </a>
                          : <img
                              src={p.coverUrlMobilePromo || p.coverUrl || "/placeholder.svg"}
                              alt={p.title}
                              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block", transform: "scale(1.08)" }}
                              onError={e => { e.currentTarget.src = "/placeholder.svg"; }}
                            />
                        : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🎁</div>
                      }
                    </div>
                    {/* 右侧内容 */}
                    <div className="vp-promo-body" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      {/* 标题：最多 2 行 */}
                      <p className="font-semibold text-sm m-0" style={{
                        color: "var(--vp-text)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.4,
                      }}>{p.title}</p>
                      {/* 按钮行 */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
                        <Link href="/deposit" className="vp-btn vp-btn-primary" style={{ flex: 1, height: 30, fontSize: 12, minWidth: 0 }}>
                          {t("public.vivid.promo.claim")}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedPromo(p)}
                          className="vp-btn vp-btn-outline"
                          style={{ flexShrink: 0, height: 30, fontSize: 10, padding: "0 10px", background: "rgba(245,158,11,0.2)", borderColor: "rgba(245,158,11,0.5)", color: "#fcd34d" }}
                        >
                          {t("public.vivid.promo.tnc")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="vp-card flex flex-col items-center justify-center gap-3 py-10 text-center">
                <span className="text-4xl">🎁</span>
                <p className="text-sm m-0" style={{ color: "var(--vp-muted)" }}>{t("public.vivid.promo.noPromosYet")}</p>
                <Link href="/promotion" className="vp-btn vp-btn-primary" style={{ height: 34, fontSize: 13 }}>{t("public.vivid.promo.viewPromos")}</Link>
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
                <p className="m-0 text-sm" style={{ color: "var(--vp-muted)" }}>{t("public.vivid.games.comingSoon")}</p>
                <Link href="/games" className="vp-btn vp-btn-primary" style={{ marginTop: 16, height: 36, fontSize: 13 }}>{t("public.vivid.games.browseGames")}</Link>
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

      <PromotionModal
        promo={selectedPromo}
        onClose={() => setSelectedPromo(null)}
        routeBonus="/bonus"
      />
    </div>
  );
}

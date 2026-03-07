"use client";

import Link from "next/link";
import { useState } from "react";
import "@/styles/vivid-portal.css";
import { VividTopbar } from "./VividTopbar";
import { VividFooter } from "./VividFooter";
import { FallbackImage } from "@/components/FallbackImage";
import { PromotionModal } from "@/components/public/PromotionModal";
import type { PublicPromotion } from "@/components/public/PromotionCard";
import { useLocale } from "@/lib/i18n/context";

type CardConfig = {
  imgHeight?: number;
  showPercent?: boolean;
  showSubtitle?: boolean;
  showTnc?: boolean;
  columns?: number;
};

const TAB_KEYS = [
  { key: "All",       labelKey: "public.vivid.promo.tabAll" },
  { key: "Promotion", labelKey: "public.vivid.promo.tabPromotion" },
  { key: "Bonus",     labelKey: "public.vivid.promo.tabBonus" },
  { key: "Rebate",    labelKey: "public.vivid.promo.tabRebate" },
  { key: "VIP",       labelKey: "public.vivid.promo.tabVip" },
  { key: "Events",    labelKey: "public.vivid.promo.tabEvents" },
];

export function VividPromoClient({
  siteName = "KINGDOM888",
  logoUrl = null,
  promotions = [],
  defaultTab = "All",
  loginUrl = "/login",
  registerUrl = "/register-wa",
  cardConfig = {},
  routeBonus = "/bonus",
  uiText,
}: {
  siteName?: string;
  logoUrl?: string | null;
  promotions?: PublicPromotion[];
  defaultTab?: string;
  loginUrl?: string;
  registerUrl?: string;
  cardConfig?: CardConfig;
  routeBonus?: string;
  uiText?: Record<string, string>;
}) {
  const { t } = useLocale();
  const imgHeight   = cardConfig.imgHeight   ?? 180;
  const showPercent = cardConfig.showPercent  !== false;
  const showSubtitle= cardConfig.showSubtitle !== false;
  const showTnc     = cardConfig.showTnc      !== false;
  const columns     = cardConfig.columns      === 2 ? 2 : 3;

  // Bonus 页预设 Bonus tab，Promotion 页预设 Promotion tab
  const [tab, setTab] = useState(defaultTab === "Bonus" ? "Bonus" : "All");
  const [selectedPromo, setSelectedPromo] = useState<PublicPromotion | null>(null);

  const filtered =
    tab === "All"
      ? promotions
      : promotions.filter(
          (p) => (p.groupLabel ?? "").toLowerCase() === tab.toLowerCase()
        );

  return (
    <div className="vp-shell">
      <VividTopbar siteName={siteName} logoUrl={logoUrl} loginUrl={loginUrl} registerUrl={registerUrl} />

      <div className="vp-w vp-main">
        {/* Breadcrumb + Page title */}
        <nav className="text-sm" style={{ color: "var(--vp-muted)" }}>
          <Link href="/" style={{ color: "var(--vp-muted)", textDecoration: "none" }}>{t("public.vivid.promo.breadcrumbHome")}</Link>
          <span className="mx-2">›</span>
          <span style={{ color: "var(--vp-text)" }}>
            {defaultTab === "Bonus" ? t("public.vivid.promo.breadcrumbBonus") : t("public.vivid.promo.breadcrumbPromo")}
          </span>
        </nav>

        <div>
          <h1 className="vp-section-title" style={{ fontSize: 22, marginBottom: 4 }}>
            <span className="dot" />
            {defaultTab === "Bonus" ? `🎁 ${t("public.vivid.promo.bonusPageTitle")}` : `🎉 ${t("public.vivid.promo.pageTitle")}`}
          </h1>
          <p style={{ color: "var(--vp-muted)", fontSize: 14, margin: 0 }}>
            {defaultTab === "Bonus"
              ? t("public.vivid.promo.bonusPageSubtitle")
              : t("public.vivid.promo.pageSubtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="vp-tabs" style={{ overflowX: "auto", scrollbarWidth: "none" }}>
          {TAB_KEYS.map(({ key, labelKey }) => (
            <button
              key={key}
              type="button"
              className="vp-tab"
              {...(tab === key ? { "data-active": "" } : {})}
              onClick={() => setTab(key)}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        {/* 桌面：2列 tile；手机：1列横排 */}
        {filtered.length > 0 ? (
          <div className="vp-promo-2col">
            {filtered.map((p) => (
              <div key={p.id} className="vp-promo-tile-card">
                {/* 照片：有 promoLink 则新窗口打开，否则开弹窗 */}
                {p.promoLink ? (
                  <a
                    href={p.promoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vp-promo-tile-img"
                    aria-label={p.title}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={p.coverUrl ?? "/placeholder.svg"}
                      alt={p.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                      onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                    />
                  </a>
                ) : (
                  <button
                    type="button"
                    className="vp-promo-tile-img"
                    onClick={() => setSelectedPromo(p)}
                    aria-label={p.title}
                  >
                    <img
                      src={p.coverUrl ?? "/placeholder.svg"}
                      alt={p.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                      onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                    />
                  </button>
                )}

                {/* 内容 */}
                <div className="vp-promo-tile-body">
                  <button
                    type="button"
                    className="vp-promo-card-title-btn"
                    onClick={() => setSelectedPromo(p)}
                  >
                    {p.title}
                  </button>
                  {showSubtitle && p.subtitle && (
                    <p
                      className="vp-promo-card-subtitle"
                      style={{ WebkitLineClamp: 3 as unknown as number }}
                    >
                      {p.subtitle}
                    </p>
                  )}
                  <div className="vp-promo-card-actions">
                    <Link
                      href="/deposit"
                      className="vp-btn vp-btn-primary vp-promo-claim-btn"
                    >
                      {t("public.vivid.promo.claim")}
                    </Link>
                    {showTnc && (
                      <button
                        type="button"
                        className="vp-btn vp-btn-outline vp-promo-tnc-btn"
                        onClick={() => setSelectedPromo(p)}
                      >
                        {t("public.vivid.promo.tnc")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="vp-card flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl block mb-4">🎁</span>
            <p className="font-semibold m-0 mb-2" style={{ color: "var(--vp-text)" }}>{t("public.vivid.promo.noPromos")}</p>
            <p className="text-sm m-0" style={{ color: "var(--vp-muted)" }}>{t("public.vivid.promo.checkBackLater")}</p>
            <button type="button" className="vp-btn vp-btn-outline" style={{ marginTop: 16 }} onClick={() => setTab("All")}>
              {t("public.vivid.promo.viewAll")}
            </button>
          </div>
        )}
      </div>

      <VividFooter siteName={siteName} />

      <PromotionModal
        promo={selectedPromo}
        onClose={() => setSelectedPromo(null)}
        routeBonus={routeBonus}
        uiText={uiText}
      />
    </div>
  );
}

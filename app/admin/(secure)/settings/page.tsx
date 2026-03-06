"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

const SECTIONS_CONFIG = [
  { key: "theme", titleKey: null, titleLiteral: "THEME", subtitleKey: "admin.settingsSection.themeSubtitle", href: "/admin/settings/theme" },
  { key: "promotion-center", titleKey: null, titleLiteral: "Promotion Center", subtitleKey: "admin.settingsSection.promotionSubtitle", href: "/admin/settings/promotions/list" },
  { key: "promotion", titleKey: null, titleLiteral: "Promotion / 优惠设置", subtitleKey: "admin.settingsSection.promotionSubtitle", href: "/admin/settings/promotion" },
  { key: "referral", titleKey: null, titleLiteral: "Referral / 推荐设置", subtitleKey: "admin.settingsSection.referralSubtitle", href: "/admin/settings/referral" },
  { key: "bank", titleKey: null, titleLiteral: "Bank", subtitleKey: "admin.settingsSection.bankSubtitle", href: "/admin/settings/bank" },
  { key: "deposit-topup-rules", titleKey: null, titleLiteral: "Deposit / Topup Rules", subtitleKey: "admin.settingsSection.depositTopupRulesSubtitle", href: "/admin/settings/deposit-topup-rules" },
  { key: "games", titleKey: null, titleLiteral: "游戏管理 / Games", subtitleKey: "admin.settingsSection.gamesSubtitle", href: "/admin/settings/games" },
  { key: "payment-gateway", titleKey: null, titleLiteral: "Payment Gateway", subtitleKey: "admin.settingsSection.paymentGatewaySubtitle", href: "/admin/settings/payment-gateway" },
  { key: "whatsapp", titleKey: null, titleLiteral: "WhatsApp", subtitleKey: "admin.settingsSection.whatsappSubtitle", href: "/admin/settings/whatsapp" },
  { key: "profile", titleKey: null, titleLiteral: "Personal Detail", subtitleKey: "admin.settingsSection.profileSubtitle", href: "/admin/settings/profile" }
];

export default function AdminSettingsPage() {
  const { t } = useLocale();
  const sections = SECTIONS_CONFIG.map((s) => ({
    key: s.key,
    href: s.href,
    title: s.titleKey ? t(s.titleKey) : s.titleLiteral!,
    subtitle: t(s.subtitleKey),
  }));
  return (
    <div className="admin-page-content">
      <header className="admin-page-title">
        <h1>{t("admin.settingsSection.pageTitle")}</h1>
        <p>{t("admin.settingsSection.pageSubtitle")}</p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link
            key={s.key}
            href={s.href}
            className="admin-card flex flex-col gap-2 p-6 rounded-xl transition-all duration-200 hover:border-[var(--compact-primary)] hover:shadow-lg hover:-translate-y-0.5"
          >
            <span className="font-semibold text-[15px] text-[var(--compact-text)]">{s.title}</span>
            <span className="text-[13px] leading-relaxed text-[var(--compact-muted)]">{s.subtitle}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { PromotionSettingsClient } from "@/components/admin/PromotionSettingsClient";
import { useLocale } from "@/lib/i18n/context";

export default function AdminSettingsPromotionPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">{t("admin.settingsSection.pageTitle")}</Link>
        <span>/</span>
        <span>Promotion / 优惠设置</span>
      </div>
      <h1 className="mt-1 text-base font-semibold text-[var(--compact-text)]">Promotion / 优惠设置</h1>
      <p className="mt-0.5 text-[12px] text-[var(--compact-muted)] leading-snug max-w-2xl">
        {t("admin.settingsSection.promotionSubtitle")}
      </p>
      <div className="mt-3">
        <PromotionSettingsClient />
      </div>
    </div>
  );
}

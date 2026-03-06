"use client";

import { useLocale } from "@/lib/i18n/context";
import { PromotionsPageClient } from "@/components/admin/PromotionsPageClient";

export default function AdminPromotionsPage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="text-lg font-semibold text-[var(--admin-text)]">{t("admin.promotionsList.pageTitle")}</h1>
      <p className="mt-1 text-[13px] text-[var(--admin-muted)]">{t("admin.promotionsList.pageDesc")}</p>
      <PromotionsPageClient />
    </div>
  );
}

"use client";

import { TransfersPageClient } from "@/components/admin/TransfersPageClient";
import { useLocale } from "@/lib/i18n/context";

export default function AdminTransfersPage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="text-lg font-semibold text-[var(--compact-text)]">{t("admin.transfers.pageTitle")}</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">{t("admin.transfers.pageDesc")}</p>
      <TransfersPageClient />
    </div>
  );
}

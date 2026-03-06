"use client";

import { useLocale } from "@/lib/i18n/context";
import { AdminReferralListClient } from "@/components/admin/AdminReferralListClient";

export default function AdminReferralsPage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="text-lg font-semibold text-[var(--compact-text)]">{t("admin.referrals.pageTitle")}</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">{t("admin.referrals.pageDesc")}</p>
      <AdminReferralListClient />
    </div>
  );
}

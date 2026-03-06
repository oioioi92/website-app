"use client";

import Link from "next/link";
import { AdminReferralSettingsClient } from "@/components/admin/AdminReferralSettingsClient";
import { useLocale } from "@/lib/i18n/context";

export default function SettingsReferralGeneralPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">{t("admin.settingsSection.pageTitle")}</Link>
        <span>/</span>
        <span>Referral</span>
        <span>/</span>
        <span>General</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">Referral — General</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">推荐系统：下线代数、分享渠道等</p>
      <div className="mt-6">
        <AdminReferralSettingsClient />
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { AdminReferralSettingsClient } from "@/components/admin/AdminReferralSettingsClient";
import { useLocale } from "@/lib/i18n/context";

export default function SettingsReferralDisplayPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">{t("admin.settingsSection.pageTitle")}</Link>
        <span>/</span>
        <span>Referral</span>
        <span>/</span>
        <span>Display</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">Referral — Display</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">推荐模块前台展示样式与文案（与 General/Sharing 同源，保存至推荐设置 API）</p>
      <div className="mt-6">
        <AdminReferralSettingsClient />
      </div>
    </div>
  );
}

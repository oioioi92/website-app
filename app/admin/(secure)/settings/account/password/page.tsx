"use client";

import Link from "next/link";
import { AdminPasswordSettingsClient } from "@/components/admin/AdminPasswordSettingsClient";
import { useLocale } from "@/lib/i18n/context";

export default function SettingsAccountPasswordPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">{t("admin.settingsSection.pageTitle")}</Link>
        <span>/</span>
        <span>{t("admin.settingsPassword.breadcrumb")}</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">{t("admin.settingsPassword.title")}</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">{t("admin.settingsPassword.desc")}</p>
      <div className="mt-6">
        <AdminPasswordSettingsClient />
      </div>
    </div>
  );
}

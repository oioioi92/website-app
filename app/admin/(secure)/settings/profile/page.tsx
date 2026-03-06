"use client";

import Link from "next/link";
import { AdminProfileClient } from "@/components/admin/AdminProfileClient";
import { useLocale } from "@/lib/i18n/context";

export default function AdminSettingsProfilePage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">{t("admin.settingsSection.pageTitle")}</Link>
        <span>/</span>
        <span>{t("admin.settingsProfile.breadcrumb")}</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">{t("admin.settingsProfile.title")}</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">{t("admin.settingsProfile.desc")}</p>
      <div className="mt-6">
        <AdminProfileClient />
      </div>
    </div>
  );
}

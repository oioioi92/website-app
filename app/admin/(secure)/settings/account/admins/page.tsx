"use client";

import Link from "next/link";
import { AdminAccountsClient } from "@/components/admin/AdminAccountsClient";
import { useLocale } from "@/lib/i18n/context";

export default function SettingsAccountAdminsPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">{t("admin.settingsSection.pageTitle")}</Link>
        <span>/</span>
        <span>Account & Security</span>
        <span>/</span>
        <span>Admin Accounts</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">Admin Accounts</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">Create and manage admin, editor, viewer accounts.</p>
      <div className="mt-6">
        <AdminAccountsClient />
      </div>
    </div>
  );
}

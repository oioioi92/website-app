"use client";

import Link from "next/link";
import { LoginHistoryClient } from "@/components/admin/LoginHistoryClient";
import { useLocale } from "@/lib/i18n/context";

export default function SettingsAccountLoginHistoryPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">{t("admin.settingsSection.pageTitle")}</Link>
        <span>/</span>
        <span>Account & Security</span>
        <span>/</span>
        <span>Login History</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">Login History</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">Recent admin session logins (time, staff, session expiry).</p>
      <div className="mt-6">
        <LoginHistoryClient />
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { DepositTopupRulesSettingsClient } from "@/components/admin/DepositTopupRulesSettingsClient";

export default function AdminSettingsDepositTopupRulesPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">
          Settings
        </Link>
        <span>/</span>
        <span>Deposit / Topup Rules</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">Deposit / Topup Rules</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">{t("admin.settingsSection.depositTopupRulesSubtitle")}</p>
      <div className="mt-6">
        <DepositTopupRulesSettingsClient />
      </div>
    </div>
  );
}

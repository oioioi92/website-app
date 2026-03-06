"use client";

import { TransactionManagementClient } from "@/components/admin/TransactionManagementClient";
import { useLocale } from "@/lib/i18n/context";

export default function AdminTransactionsPage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="text-lg font-semibold text-[var(--compact-text)]">Transactions</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">{t("admin.transactions.pageSubtitle")}</p>
      <TransactionManagementClient />
    </div>
  );
}

"use client";

import { AdminPendingWithdrawalsClient } from "@/components/admin/AdminPendingWithdrawalsClient";
import { useLocale } from "@/lib/i18n/context";

export default function PendingWithdrawalsPage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">{t("admin.pendingWith.pageTitle")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("admin.pendingWith.pageDesc")}</p>
      <AdminPendingWithdrawalsClient />
    </div>
  );
}

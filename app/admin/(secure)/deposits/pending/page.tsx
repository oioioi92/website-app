"use client";

import { AdminPendingDepositsClient } from "@/components/admin/AdminPendingDepositsClient";
import { useLocale } from "@/lib/i18n/context";

export default function PendingDepositsPage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">{t("admin.pendingDepo.pageTitle")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("admin.pendingDepo.pageDesc")}</p>
      <AdminPendingDepositsClient />
    </div>
  );
}

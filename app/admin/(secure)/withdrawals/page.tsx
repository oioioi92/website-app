"use client";

import { useLocale } from "@/lib/i18n/context";
import { AdminWithdrawalListClient } from "@/components/admin/AdminWithdrawalListClient";

export default function WithdrawalListPage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">{t("admin.withdrawalsList.pageTitle")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("admin.withdrawalsList.pageDesc")}</p>
      <AdminWithdrawalListClient />
    </div>
  );
}

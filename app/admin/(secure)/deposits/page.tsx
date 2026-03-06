"use client";

import { useLocale } from "@/lib/i18n/context";
import { AdminDepositListClient } from "@/components/admin/AdminDepositListClient";

export default function DepositListPage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">{t("admin.depositsList.pageTitle")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("admin.depositsList.pageDesc")}</p>
      <AdminDepositListClient />
    </div>
  );
}

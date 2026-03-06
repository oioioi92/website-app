"use client";

import Link from "next/link";
import { AdminManualDepositClient } from "@/components/admin/AdminManualDepositClient";
import { useLocale } from "@/lib/i18n/context";

export default function ManualCreateDepositPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="mb-1">
        <Link href="/admin/deposits/pending" className="text-sky-600 hover:underline font-medium">{t("admin.pendingDepo.backLink")}</Link>
      </div>
      <h1 className="text-xl font-semibold text-slate-800">{t("admin.pendingDepo.createTitle")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("admin.pendingDepo.createDesc")}</p>
      <AdminManualDepositClient />
    </div>
  );
}

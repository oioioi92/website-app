"use client";

import { AdminRegisterPendingClient } from "@/components/admin/AdminRegisterPendingClient";
import { useLocale } from "@/lib/i18n/context";

export default function AdminRegisterPendingPage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">{t("admin.registerPending.pageTitle")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("admin.registerPending.pageDesc")}</p>
      <AdminRegisterPendingClient />
    </div>
  );
}

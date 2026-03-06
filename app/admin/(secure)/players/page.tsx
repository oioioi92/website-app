"use client";

import { AdminPlayerListClient } from "@/components/admin/AdminPlayerListClient";
import { useLocale } from "@/lib/i18n/context";

export default function PlayersPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-xl font-semibold text-slate-800">{t("admin.players.pageTitle")}</h1>
        <span className="text-sm text-slate-500">{t("admin.players.pageDesc")}</span>
      </div>
      <AdminPlayerListClient />
    </div>
  );
}

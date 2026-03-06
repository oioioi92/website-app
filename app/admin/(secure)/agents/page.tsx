"use client";

import { AdminAgentListClient } from "@/components/admin/AdminAgentListClient";
import { useLocale } from "@/lib/i18n/context";

export default function AgentsPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-xl font-semibold text-slate-800">{t("admin.agents.pageTitle")}</h1>
        <span className="text-sm text-slate-500">{t("admin.agents.pageDesc")}</span>
      </div>
      <AdminAgentListClient />
    </div>
  );
}

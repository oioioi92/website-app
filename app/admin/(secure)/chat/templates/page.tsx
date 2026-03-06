"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { AdminTemplateListClient } from "@/components/admin/AdminTemplateListClient";

export default function AdminChatTemplatesPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/chat" className="font-medium text-sky-600 hover:underline">{t("admin.chatTemplates.backLink")}</Link>
      </div>
      <h1 className="text-xl font-semibold text-slate-800">{t("admin.chatTemplates.title")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("admin.chatTemplates.pageDesc")}</p>
      <AdminTemplateListClient />
    </div>
  );
}

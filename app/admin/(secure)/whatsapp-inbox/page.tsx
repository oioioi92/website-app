"use client";

import { AdminWhatsappInboxClient } from "@/components/admin/AdminWhatsappInboxClient";
import { useLocale } from "@/lib/i18n/context";

export default function WhatsappInboxPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-xl font-semibold text-slate-800">{t("admin.whatsappInbox.pageTitle")}</h1>
        <span className="text-sm text-slate-500">{t("admin.whatsappInbox.pageDesc")}</span>
      </div>
      <AdminWhatsappInboxClient />
    </div>
  );
}

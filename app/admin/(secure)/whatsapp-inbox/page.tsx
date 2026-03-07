"use client";

import { AdminWhatsappInboxClient } from "@/components/admin/AdminWhatsappInboxClient";
import { useLocale } from "@/lib/i18n/context";

export default function WhatsappInboxPage() {
  const { t } = useLocale();
  return (
    <div className="admin-wa-inbox-root flex flex-col min-h-0 overflow-hidden px-4 md:px-6 pt-4">
      <div className="shrink-0 flex flex-wrap items-baseline gap-2 mb-2">
        <h1 className="text-xl font-semibold text-slate-800">{t("admin.whatsappInbox.pageTitle")}</h1>
        <span className="text-sm text-slate-500 hidden sm:inline">{t("admin.whatsappInbox.pageDesc")}</span>
      </div>
      <AdminWhatsappInboxClient />
    </div>
  );
}

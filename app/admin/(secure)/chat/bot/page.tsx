"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

export default function AdminChatBotPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/chat" className="font-medium text-sky-600 hover:underline">{t("admin.chatBot.backLink")}</Link>
      </div>
      <h1 className="text-xl font-semibold text-slate-800">{t("admin.chatBot.title")}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("admin.chatBot.pageDesc")}</p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-700">{t("admin.chatBot.configIntro")}</p>
        <p className="mt-3 text-sm text-slate-500">{t("admin.chatBot.configItems")}</p>
        <p className="mt-2 text-sm text-sky-700">{t("admin.chatBot.quickRepliesNote")}</p>
      </div>
    </div>
  );
}

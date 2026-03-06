"use client";

import Link from "next/link";
import { WhatsappSettingsClient } from "@/components/admin/WhatsappSettingsClient";
import { useLocale } from "@/lib/i18n/context";

export default function AdminSettingsWhatsappPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">{t("admin.settingsSection.pageTitle")}</Link>
        <span>/</span>
        <span>{t("admin.settingsWhatsapp.title")}</span>
      </div>
      <h1 className="mt-1 text-base font-semibold text-[var(--compact-text)]">{t("admin.settingsWhatsapp.title")}</h1>
      <p className="mt-0.5 text-[12px] text-[var(--compact-muted)] leading-snug max-w-2xl">{t("admin.settingsWhatsapp.desc")}</p>
      <div className="mt-3">
        <WhatsappSettingsClient />
      </div>
    </div>
  );
}

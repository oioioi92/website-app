"use client";

import Link from "next/link";
import { GameApiSettingsClient } from "@/components/admin/GameApiSettingsClient";
import { GameProviderLogosClient } from "@/components/admin/GameProviderLogosClient";
import { useLocale } from "@/lib/i18n/context";

export default function AdminSettingsGameProvidersPage() {
  const { t } = useLocale();
  return (
    <div className="admin-page-content">
      <div className="flex items-center gap-2 text-[13px] text-[var(--admin-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--admin-primary)]">{t("admin.settingsSection.backToSettings")}</Link>
        <span>/</span>
        <span>{t("admin.gameProviderLogos.pageTitle")}</span>
      </div>
      <header className="admin-page-title mt-2">
        <h1>{t("admin.gameProviderLogos.pageTitle")}</h1>
        <p>{t("admin.gameProviderLogos.pageSubtitle")}</p>
      </header>

      <div className="mt-6 space-y-8">
        <section className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel2)] p-6">
          <h2 className="mb-4 text-sm font-semibold text-[var(--admin-text)]">{t("admin.settingsGameApi.sectionTitle")}</h2>
          <GameApiSettingsClient compact inlineSave />
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--admin-text)]">{t("admin.gameProviders.pageTitle")}</h2>
          <GameProviderLogosClient fullManagement />
        </section>
      </div>
    </div>
  );
}

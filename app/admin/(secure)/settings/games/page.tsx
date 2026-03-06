"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { GameProviderLogosClient } from "@/components/admin/GameProviderLogosClient";

export default function AdminSettingsGamesPage() {
  const { t } = useLocale();
  return (
    <div className="admin-page-content">
      <div className="flex items-center gap-2 text-[13px] text-[var(--admin-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--admin-primary)]">
          {t("admin.settingsNav.backToSettings")}
        </Link>
        <span>/</span>
        <span>{t("admin.gamesManagement.pageTitle")}</span>
      </div>
      <header className="admin-page-title mt-2">
        <h1>{t("admin.gamesManagement.pageTitle")}</h1>
        <p>{t("admin.gamesManagement.pageSubtitle")}</p>
      </header>

      <div className="mt-6">
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel2)] p-6">
          <GameProviderLogosClient fullManagement />
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { GameProviderLogosClient } from "@/components/admin/GameProviderLogosClient";
import { useLocale } from "@/lib/i18n/context";

/** 一个页面合并：Create 游戏 + 每个游戏一行（Provider name / API Base URL / API Key / Secret / 分类 / Logo） */
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

      <div className="mt-6">
        <GameProviderLogosClient fullManagement />
      </div>
    </div>
  );
}

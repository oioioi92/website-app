"use client";

import { ThemeSettingsClient } from "@/components/admin/ThemeSettingsClient";
import { useLocale } from "@/lib/i18n/context";

export default function AdminSitePage() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="text-lg font-semibold text-[var(--compact-text)]">{t("admin.site.pageTitle")}</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">
        {t("admin.site.pageDesc")}
      </p>
      <div className="mt-6">
        <ThemeSettingsClient />
      </div>
    </div>
  );
}

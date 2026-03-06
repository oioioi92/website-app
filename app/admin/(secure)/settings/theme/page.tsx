"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { ThemeSettingsClient } from "@/components/admin/ThemeSettingsClient";

export default function AdminSettingsThemePage() {
  const { t } = useLocale();
  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-[13px] text-slate-500">
        <Link href="/admin/settings" className="hover:text-indigo-600 transition-colors">
          Settings
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-700">THEME</span>
      </div>
      <div className="mt-4 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 to-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
            🎨
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">THEME</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {t("admin.settingsSection.themeSubtitle")}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <ThemeSettingsClient />
      </div>
    </div>
  );
}

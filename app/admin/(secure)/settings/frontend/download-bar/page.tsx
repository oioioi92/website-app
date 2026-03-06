"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

export default function SettingsFrontendDownloadBarPage() {
  const { t } = useLocale();
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-[13px] text-slate-500">
        <Link href="/admin/settings" className="hover:text-indigo-600">Settings</Link>
        <span>/</span>
        <Link href="/admin/settings/frontend/general" className="hover:text-indigo-600">Frontend</Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Download Bar</span>
      </div>
      <h1 className="mt-4 text-lg font-semibold text-slate-800">Download Bar</h1>
      <p className="mt-1 text-sm text-slate-500">App 下载条文案与链接</p>
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
        {t("admin.settingsPlaceholder.comingSoon")}
      </div>
      <p className="mt-4 text-sm text-slate-500">
        请在 <Link href="/admin/settings/theme" className="text-indigo-600 hover:underline">THEME</Link> 或 <Link href="/admin/site" className="text-indigo-600 hover:underline">Site</Link> 中配置 Download Bar。
      </p>
    </div>
  );
}

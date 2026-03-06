"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

export default function SettingsFrontendGeneralPage() {
  const { t } = useLocale();
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-[13px] text-slate-500">
        <Link href="/admin/settings" className="hover:text-indigo-600">Settings</Link>
        <span>/</span>
        <Link href="/admin/settings/frontend/general" className="hover:text-indigo-600">Frontend</Link>
        <span>/</span>
        <span className="font-medium text-slate-700">General</span>
      </div>
      <h1 className="mt-4 text-lg font-semibold text-slate-800">General</h1>
      <p className="mt-1 text-sm text-slate-500">站点名称、Logo、入口链接等</p>
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
        {t("admin.settingsPlaceholder.comingSoon")}
      </div>
      <p className="mt-4 text-sm text-slate-500">
        完整配置请前往 <Link href="/admin/site" className="text-indigo-600 hover:underline">Site / 前台封面</Link> 或 <Link href="/admin/settings/theme" className="text-indigo-600 hover:underline">THEME</Link>。
      </p>
    </div>
  );
}

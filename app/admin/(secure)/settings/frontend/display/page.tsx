"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

export default function SettingsFrontendDisplayPage() {
  const { t } = useLocale();
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-[13px] text-slate-500">
        <Link href="/admin/settings" className="hover:text-indigo-600">Settings</Link>
        <span>/</span>
        <Link href="/admin/settings/frontend/general" className="hover:text-indigo-600">Frontend</Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Display</span>
      </div>
      <h1 className="mt-4 text-lg font-semibold text-slate-800">Display</h1>
      <p className="mt-1 text-sm text-slate-500">促销样式、社交样式、字体等</p>
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
        {t("admin.settingsPlaceholder.comingSoon")}
      </div>
      <p className="mt-4 text-sm text-slate-500">
        请在 <Link href="/admin/settings/theme" className="text-indigo-600 hover:underline">THEME</Link> 的 Display 区块配置 promotionPattern、socialStyle 等。
      </p>
    </div>
  );
}

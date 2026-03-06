"use client";

import Link from "next/link";
import { ThemeSettingsClient } from "@/components/admin/ThemeSettingsClient";

export default function SettingsFrontendDownloadBarPage() {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-[13px] text-slate-500">
        <Link href="/admin/settings" className="hover:text-indigo-600">Settings</Link>
        <span>/</span>
        <Link href="/admin/settings/frontend/general" className="hover:text-indigo-600">Frontend</Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Download Bar</span>
      </div>
      <h1 className="mt-4 text-lg font-semibold text-slate-800">Download Bar</h1>
      <p className="mt-1 text-sm text-slate-500">App 下载条开关、图片、文案与链接（保存至主题）</p>
      <div className="mt-6">
        <ThemeSettingsClient />
      </div>
    </div>
  );
}

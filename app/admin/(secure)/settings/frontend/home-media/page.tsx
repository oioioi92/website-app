"use client";

import Link from "next/link";
import { ThemeSettingsClient } from "@/components/admin/ThemeSettingsClient";

export default function SettingsFrontendHomeMediaPage() {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-[13px] text-slate-500">
        <Link href="/admin/settings" className="hover:text-indigo-600">Settings</Link>
        <span>/</span>
        <Link href="/admin/settings/frontend/general" className="hover:text-indigo-600">Frontend</Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Home Media</span>
      </div>
      <h1 className="mt-4 text-lg font-semibold text-slate-800">Home Media</h1>
      <p className="mt-1 text-sm text-slate-500">首页轮播、Banner、合作伙伴图等前台照片，可直接上传或粘贴图片 URL。</p>
      <div className="mt-6">
        <ThemeSettingsClient />
      </div>
    </div>
  );
}

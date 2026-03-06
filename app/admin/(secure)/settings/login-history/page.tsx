"use client";

import Link from "next/link";
import { LoginHistoryClient } from "@/components/admin/LoginHistoryClient";

export default function SettingsLoginHistoryPage() {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 text-[13px] text-slate-500">
        <Link href="/admin/settings" className="hover:text-indigo-600">Settings</Link>
        <span>/</span>
        <Link href="/admin/settings/profile" className="hover:text-indigo-600">Account & Security</Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Login History</span>
      </div>
      <h1 className="mt-4 text-xl font-bold text-slate-800">Login History</h1>
      <p className="mt-1 text-sm text-slate-500">管理员登录记录（Session 创建时间）</p>
      <div className="mt-6">
        <LoginHistoryClient />
      </div>
    </div>
  );
}

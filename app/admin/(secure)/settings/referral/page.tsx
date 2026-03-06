"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

export default function SettingsReferralPage() {
  const { t } = useLocale();
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-[13px] text-slate-500">
        <Link href="/admin/settings" className="hover:text-indigo-600">Settings</Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Referral</span>
      </div>
      <h1 className="mt-4 text-lg font-semibold text-slate-800">Referral</h1>
      <p className="mt-1 text-sm text-slate-500">推荐/下线规则与展示</p>
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
        {t("admin.settingsPlaceholder.comingSoon")}
      </div>
      <p className="mt-4 text-sm text-slate-500">
        推荐设置与树状结构请前往 <Link href="/admin/referrals" className="text-indigo-600 hover:underline">Referral Tree</Link>。
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

export default function SettingsReferralDisplayPage() {
  const { t } = useLocale();
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">{t("admin.settingsSection.pageTitle")}</Link>
        <span>/</span>
        <span>Referral</span>
        <span>/</span>
        <span>Display</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">Referral — Display</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">推荐模块前台展示样式与文案</p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-sm text-slate-600">
        <p>展示相关配置可在 <Link href="/admin/settings/referral/general" className="text-indigo-600 hover:underline">General</Link> 中一并设置。</p>
      </div>
    </div>
  );
}

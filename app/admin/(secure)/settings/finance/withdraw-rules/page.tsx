"use client";

import Link from "next/link";

export default function SettingsFinanceWithdrawRulesPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">Settings</Link>
        <span>/</span>
        <span>Finance</span>
        <span>/</span>
        <span>Withdraw Rules</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">Withdraw Rules</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">提现规则配置（限额、风控等）</p>
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-sm text-slate-600">
        <p>此页面功能开发中。当前可在 <Link href="/admin/settings/bank" className="text-indigo-600 hover:underline">Bank</Link> 中配置出款相关设置。</p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { AdminAgentDownlineTable } from "@/components/admin/AdminAgentDownlineTable";

type L1Row = {
  id: string;
  userRef: string;
  displayName: string | null;
  register_at: string;
  last_deposit_at: string | null;
  free_credit: number;
  deposit_count: number;
  withdraw_count: number;
};

type AgentSnapshot = {
  userRef: string;
  displayName: string | null;
  referralCode: string | null;
};

export function AdminAgentDetailClient({
  agent,
  l1Rows,
  totalDepositCount,
  totalWithdrawCount,
}: {
  agent: AgentSnapshot;
  l1Rows: L1Row[];
  totalDepositCount: number;
  totalWithdrawCount: number;
}) {
  const { t } = useLocale();
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <Link href="/admin/agents" className="text-sky-600 hover:underline font-medium">{t("admin.agentDetail.backLink")}</Link>
      </div>
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-xl font-semibold text-slate-800">{t("admin.agentDetail.title")}</h1>
        <span className="text-xs text-amber-700">{t("admin.agentDetail.commissionNote")}</span>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <dt className="text-slate-500 text-xs font-medium">{t("admin.agentDetail.userId")}</dt>
        <dd className="font-mono text-sm font-medium text-slate-900">{agent.userRef}</dd>
        <dt className="text-slate-500 text-xs font-medium">{t("admin.agentDetail.name")}</dt>
        <dd className="text-sm font-medium text-slate-900">{agent.displayName ?? "—"}</dd>
        <dt className="text-slate-500 text-xs font-medium">{t("admin.agentDetail.referralCode")}</dt>
        <dd className="text-sm font-medium text-slate-900">{agent.referralCode ?? "—"}</dd>
        <dt className="text-slate-500 text-xs font-medium">{t("admin.agentDetail.l1Count")}</dt>
        <dd className="text-sm font-medium text-slate-900">{l1Rows.length}</dd>
        <dt className="text-slate-500 text-xs font-medium">{t("admin.agentDetail.totalDepositCount")}</dt>
        <dd className="text-sm font-medium text-slate-900">{totalDepositCount}</dd>
        <dt className="text-slate-500 text-xs font-medium">{t("admin.agentDetail.totalWithdrawCount")}</dt>
        <dd className="text-sm font-medium text-slate-900">{totalWithdrawCount}</dd>
      </dl>
      <AdminAgentDownlineTable title={t("admin.agentDetail.l1DownlineTitle")} rows={l1Rows} />
    </div>
  );
}

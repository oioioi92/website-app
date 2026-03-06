"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

type Deposit = {
  txId: string;
  amount: unknown;
  channel: string;
  referenceNo: string | null;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  processingDurationSec: number | null;
  rejectReason: string | null;
  burnReason: string | null;
  member: { userRef: string };
};

export function AdminDepositDetailClient({ deposit }: { deposit: Deposit }) {
  const { t } = useLocale();
  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/deposits" className="font-medium text-sky-600 hover:underline">{t("admin.depositDetail.backLink")}</Link>
        {deposit.status === "PENDING" && (
          <Link href="/admin/deposits/pending" className="ml-4 font-medium text-sky-600 hover:underline">{t("admin.depositDetail.pendingLink")}</Link>
        )}
      </div>
      <h1 className="text-xl font-semibold text-slate-800">{t("admin.depositDetail.pageTitle")}</h1>
      <dl className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <dt className="text-sm font-medium text-slate-500">Tx ID</dt>
        <dd className="font-mono font-medium text-slate-900">{deposit.txId}</dd>
        <dt className="text-sm font-medium text-slate-500">User ID</dt>
        <dd className="font-medium text-slate-900">{deposit.member.userRef}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.depositDetail.amount")}</dt>
        <dd className="font-medium text-slate-900">{Number(deposit.amount).toFixed(2)}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.depositDetail.channel")}</dt>
        <dd className="font-medium text-slate-900">{deposit.channel}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.depositDetail.voucherNo")}</dt>
        <dd className="font-medium text-slate-900">{deposit.referenceNo ?? "—"}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.depositDetail.status")}</dt>
        <dd className="font-medium text-slate-900">{deposit.status}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.depositDetail.createdAt")}</dt>
        <dd className="font-medium text-slate-900">{deposit.createdAt.toLocaleString()}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.depositDetail.completedAt")}</dt>
        <dd className="font-medium text-slate-900">{deposit.completedAt?.toLocaleString() ?? "—"}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.depositDetail.processSeconds")}</dt>
        <dd className="font-medium text-slate-900">{deposit.processingDurationSec ?? "—"}</dd>
        {deposit.rejectReason && (
          <>
            <dt className="text-sm font-medium text-slate-500">{t("admin.depositDetail.rejectReason")}</dt>
            <dd className="font-medium text-slate-900">{deposit.rejectReason}</dd>
          </>
        )}
        {deposit.burnReason && (
          <>
            <dt className="text-sm font-medium text-slate-500">{t("admin.depositDetail.burnReason")}</dt>
            <dd className="font-medium text-slate-900">{deposit.burnReason}</dd>
          </>
        )}
      </dl>
    </div>
  );
}

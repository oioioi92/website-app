"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

type Withdrawal = {
  wdId: string;
  amount: unknown;
  bankName: string | null;
  bankAccount: string | null;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  processingDurationSec: number | null;
  paymentReferenceNo: string | null;
  rejectReason: string | null;
  burnReason: string | null;
  member: { userRef: string };
};

export function AdminWithdrawalDetailClient({ withdrawal }: { withdrawal: Withdrawal }) {
  const { t } = useLocale();
  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/withdrawals" className="font-medium text-sky-600 hover:underline">{t("admin.withdrawalDetail.backLink")}</Link>
        {(withdrawal.status === "PENDING" || withdrawal.status === "PROCESSING") && (
          <Link href="/admin/withdrawals/pending" className="ml-4 font-medium text-sky-600 hover:underline">{t("admin.withdrawalDetail.pendingLink")}</Link>
        )}
      </div>
      <h1 className="text-xl font-semibold text-slate-800">{t("admin.withdrawalDetail.pageTitle")}</h1>
      <dl className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <dt className="text-sm font-medium text-slate-500">Wd ID</dt>
        <dd className="font-mono font-medium text-slate-900">{withdrawal.wdId}</dd>
        <dt className="text-sm font-medium text-slate-500">User ID</dt>
        <dd className="font-medium text-slate-900">{withdrawal.member.userRef}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.withdrawalDetail.amount")}</dt>
        <dd className="font-medium text-slate-900">{Number(withdrawal.amount).toFixed(2)}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.withdrawalDetail.bankAccount")}</dt>
        <dd className="font-medium text-slate-900">{[withdrawal.bankName, withdrawal.bankAccount].filter(Boolean).join(" / ") || "—"}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.withdrawalDetail.status")}</dt>
        <dd className="font-medium text-slate-900">{withdrawal.status}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.withdrawalDetail.createdAt")}</dt>
        <dd className="font-medium text-slate-900">{withdrawal.createdAt.toLocaleString()}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.withdrawalDetail.completedAt")}</dt>
        <dd className="font-medium text-slate-900">{withdrawal.completedAt?.toLocaleString() ?? "—"}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.withdrawalDetail.processSeconds")}</dt>
        <dd className="font-medium text-slate-900">{withdrawal.processingDurationSec ?? "—"}</dd>
        {withdrawal.paymentReferenceNo && (
          <>
            <dt className="text-sm font-medium text-slate-500">{t("admin.withdrawalDetail.bankRef")}</dt>
            <dd className="font-medium text-slate-900">{withdrawal.paymentReferenceNo}</dd>
          </>
        )}
        {withdrawal.rejectReason && (
          <>
            <dt className="text-sm font-medium text-slate-500">{t("admin.withdrawalDetail.rejectReason")}</dt>
            <dd className="font-medium text-slate-900">{withdrawal.rejectReason}</dd>
          </>
        )}
        {withdrawal.burnReason && (
          <>
            <dt className="text-sm font-medium text-slate-500">{t("admin.withdrawalDetail.burnReason")}</dt>
            <dd className="font-medium text-slate-900">{withdrawal.burnReason}</dd>
          </>
        )}
      </dl>
    </div>
  );
}

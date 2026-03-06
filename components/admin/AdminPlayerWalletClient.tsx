"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

type WalletTxRow = {
  id: string;
  type: string;
  amountSigned: number;
  channel: string | null;
  refNo: string | null;
  happenedAt: string;
};

type MemberSnapshot = {
  userRef: string;
  walletTx: WalletTxRow[];
};

export function AdminPlayerWalletClient({
  member,
  balance,
}: {
  member: MemberSnapshot;
  balance: number;
}) {
  const { t } = useLocale();
  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/players" className="font-medium text-sky-600 hover:underline">{t("admin.playerWallet.backLink")}</Link>
      </div>
      <h1 className="text-xl font-semibold text-slate-800">{t("admin.playerWallet.title")}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {t("admin.playerWallet.pageDesc")}
      </p>
      <dl className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <dt className="text-sm font-medium text-slate-500">User ID</dt>
        <dd className="font-mono font-medium text-slate-900">{member.userRef}</dd>
        <dt className="text-sm font-medium text-slate-500">{t("admin.playerWallet.mainWallet")}</dt>
        <dd className="font-semibold text-slate-900">{balance.toFixed(2)}</dd>
      </dl>
      <h2 className="mt-4 text-lg font-semibold text-slate-800">{t("admin.playerWallet.recentTxTitle")}</h2>
      <div className="mt-2 overflow-hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-[15px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/90">
              <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">{t("admin.playerWallet.colTime")}</th>
              <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">{t("admin.playerWallet.colType")}</th>
              <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">{t("admin.playerWallet.colAmount")}</th>
              <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">{t("admin.playerWallet.colChannelRef")}</th>
            </tr>
          </thead>
          <tbody>
            {member.walletTx.map((tx) => (
              <tr key={tx.id} className="border-b border-slate-100">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{new Date(tx.happenedAt).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{tx.type}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">{Number(tx.amountSigned).toFixed(2)}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{[tx.channel, tx.refNo].filter(Boolean).join(" / ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

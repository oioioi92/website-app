"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type WalletTx = {
  id: string;
  type: string;
  amountSigned: number;
  currency: string;
  channel: string | null;
  refNo: string | null;
  note: string | null;
  happenedAt: string;
  status: string;
};

type MemberDetail = {
  id: string;
  userRef: string;
  displayName: string | null;
  mobile: string | null;
  bankName: string | null;
  bankAccount: string | null;
  referralCode: string | null;
  referrerId: string | null;
  agentId: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  depositCount: number;
  withdrawCount: number;
  lastDepositAt: string | null;
  mainWalletBalance: number;
  walletTx: WalletTx[];
};

const TABS = [
  { id: "transaction", label: "TRANSACTION" },
  { id: "wallet", label: "WALLET" },
  { id: "chat", label: "CHAT" },
  { id: "details", label: "DETAILS" },
  { id: "bet", label: "BET HISTORY" },
  { id: "commission", label: "COMMISSION" },
  { id: "credit", label: "CREDIT" },
  { id: "setting", label: "SETTING" },
  { id: "problem", label: "PROBLEM" },
  { id: "game", label: "GAME" },
  { id: "ip", label: "IP" },
  { id: "similarity", label: "SIMILARITY" },
  { id: "usertag", label: "USER TAG" },
  { id: "log", label: "LOG" }
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminPlayerDetailPanel({
  memberId,
  initialRow,
  onClose
}: {
  memberId: string;
  initialRow: { userRef: string; displayName: string | null };
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("transaction");

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/players/" + encodeURIComponent(memberId))
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setDetail(null);
        else setDetail(d);
      })
      .finally(() => setLoading(false));
  }, [memberId]);

  const displayName = detail?.displayName ?? initialRow.displayName ?? "—";
  const userRef = detail?.userRef ?? initialRow.userRef;
  const createdAt = detail?.createdAt ? new Date(detail.createdAt).toLocaleString() : "—";

  const totalTxCount = detail?.walletTx?.length ?? 0;
  const totalTxAmount = detail?.walletTx?.reduce((s, t) => s + t.amountSigned, 0) ?? 0;
  const lifeTimeDeposit = detail?.mainWalletBalance ?? 0;
  const lifeTimeNet = detail?.mainWalletBalance ?? 0;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col border-l border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex flex-wrap items-baseline gap-2 text-sm">
            <span className="font-semibold text-slate-900">{displayName}</span>
            <span className="text-slate-500">({userRef})</span>
            <span className="text-slate-400">{memberId}</span>
            <span className="text-slate-400">{createdAt}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-white px-2 py-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={
                "rounded px-2.5 py-1.5 text-xs font-medium " +
                (activeTab === tab.id
                  ? "bg-sky-100 text-sky-800 ring-1 ring-sky-300"
                  : "text-slate-600 hover:bg-slate-100")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-8 text-center text-slate-500">加载中…</div>
          ) : !detail ? (
            <div className="py-8 text-center text-slate-500">无法加载该顾客数据</div>
          ) : (
            <>
              {activeTab === "transaction" && (
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-slate-600">Total Count: <strong>{totalTxCount}</strong></span>
                    <span className="text-slate-600">Total Amount: <strong>{totalTxAmount.toFixed(2)}</strong></span>
                    <span className="text-slate-600">LifeTime Deposit: <strong>{lifeTimeDeposit.toFixed(2)}</strong></span>
                    <span className="text-slate-600">LifeTime Net: <strong>{lifeTimeNet.toFixed(2)}</strong></span>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100">
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-800">DATE</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-800">ID</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-800">TYPE</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-800">DESCRIPTION</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-slate-800">AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.walletTx.length === 0 ? (
                          <tr><td colSpan={5} className="px-3 py-4 text-center text-slate-500">暂无流水</td></tr>
                        ) : (
                          detail.walletTx.map((t) => (
                            <tr key={t.id} className="border-b border-slate-100 bg-sky-50/30">
                              <td className="whitespace-nowrap px-3 py-2 text-slate-800">{new Date(t.happenedAt).toLocaleString()}</td>
                              <td className="whitespace-nowrap px-3 py-2 font-mono text-slate-800">{t.refNo ?? "#" + t.id.slice(-8)}</td>
                              <td className="whitespace-nowrap px-3 py-2 text-slate-800">{t.type}</td>
                              <td className="px-3 py-2 text-slate-800">{t.note ?? t.type}</td>
                              <td className="whitespace-nowrap px-3 py-2 text-right font-medium text-slate-800">{t.amountSigned >= 0 ? "+" : ""}{t.amountSigned.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "wallet" && (
                <div className="space-y-4">
                  <dl className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                    <dt className="text-slate-600">Main Wallet (RM)</dt>
                    <dd className="font-semibold text-slate-900">{detail.mainWalletBalance.toFixed(2)}</dd>
                  </dl>
                  <Link
                    href={"/admin/players/" + detail.id + "/wallet"}
                    className="inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                  >
                    进入该顾客前台代操作
                  </Link>
                </div>
              )}

              {activeTab === "chat" && (
                <div>
                  <a
                    href={"/chat?user=" + encodeURIComponent(detail.userRef)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                  >
                    打开聊天
                  </a>
                </div>
              )}

              {activeTab === "details" && (
                <dl className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                  <dt className="text-slate-600">User ID</dt>
                  <dd className="font-mono text-slate-900">{detail.userRef}</dd>
                  <dt className="text-slate-600">Name</dt>
                  <dd className="text-slate-900">{detail.displayName ?? "—"}</dd>
                  <dt className="text-slate-600">Mobile</dt>
                  <dd className="text-slate-900">{detail.mobile ?? "—"}</dd>
                  <dt className="text-slate-600">Bank / Account</dt>
                  <dd className="text-slate-900">{[detail.bankName, detail.bankAccount].filter(Boolean).join(" / ") || "—"}</dd>
                  <dt className="text-slate-600">Register</dt>
                  <dd className="text-slate-900">{new Date(detail.createdAt).toLocaleString()}</dd>
                  <dt className="text-slate-600">Last Login</dt>
                  <dd className="text-slate-900">{detail.lastLoginAt ? new Date(detail.lastLoginAt).toLocaleString() : "—"}</dd>
                  <dt className="text-slate-600">Last Login IP</dt>
                  <dd className="text-slate-900">{detail.lastLoginIp ?? "—"}</dd>
                  <dt className="text-slate-600">Deposit Count</dt>
                  <dd className="text-slate-900">{detail.depositCount}</dd>
                  <dt className="text-slate-600">Withdraw Count</dt>
                  <dd className="text-slate-900">{detail.withdrawCount}</dd>
                </dl>
              )}

              {["bet", "commission", "credit", "setting", "problem", "game", "ip", "similarity", "usertag", "log"].includes(activeTab) && (
                <div className="py-8 text-center text-slate-500">该功能后续开放</div>
              )}
            </>
          )}
        </div>

        {/* Close */}
        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600"
          >
            CLOSE
          </button>
        </div>
      </div>
    </>
  );
}

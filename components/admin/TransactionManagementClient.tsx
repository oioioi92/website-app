"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { ReportTableFromApi } from "@/components/admin/ReportTableFromApi";
import { TX_PRESETS } from "@/config/transactions.presets";
import type { TxPreset } from "@/config/transactions.presets";

type PendingDeposit = {
  id: string;
  txId: string;
  userId: string;
  memberId: string;
  displayName: string | null;
  mobile: string | null;
  amount: number;
  channel: string;
  referenceNo: string | null;
  status: string;
  createdAt: string;
  elapsedSec: number;
};

type PendingWithdraw = {
  id: string;
  wdId: string;
  userId: string;
  memberId: string;
  displayName: string | null;
  mobile: string | null;
  amount: number;
  bankName: string | null;
  bankAccount: string | null;
  status: string;
  createdAt: string;
  elapsedSec: number;
  assignedTo: string | null;
};

type UnifiedPendingItem = {
  kind: "DEPOSIT" | "WITHDRAW";
  id: string;
  txId: string;
  userId: string;
  memberId: string;
  displayName: string | null;
  mobile: string | null;
  amount: number;
  createdAt: string;
  elapsedSec: number;
  channel?: string;
  referenceNo?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  assignedTo?: string | null;
};

const STATUS_OPTIONS = [
  { value: "ANY", labelKey: "admin.txMgmt.statusAny" },
  { value: "PENDING_OLD_NEW", labelKey: "admin.txMgmt.statusPendingOldNew" },
  { value: "COMPLETED", labelKey: "admin.txMgmt.statusCompleted" },
  { value: "REJECTED", labelKey: "admin.txMgmt.statusRejected" },
];

const TYPE_OPTIONS = [
  { value: "ACTIVE", labelKey: "admin.txMgmt.typeActive" },
  { value: "DEPOSIT", labelKey: "admin.txMgmt.typeDeposit" },
  { value: "WITHDRAW", labelKey: "admin.txMgmt.typeWithdraw" },
];

function copyTxId(txId: string) {
  navigator.clipboard.writeText(txId).catch(() => {});
}

function customerLabel(item: UnifiedPendingItem) {
  const name = (item.displayName ?? "").trim();
  const ref = (item.userId ?? "").trim();
  if (name && ref) return `${name} (${ref})`;
  return name || ref || "—";
}

export function TransactionManagementClient() {
  const { t } = useLocale();
  const [statusFilter, setStatusFilter] = useState("PENDING_OLD_NEW");
  const [typeFilter, setTypeFilter] = useState("ACTIVE");
  const [txIdSearch, setTxIdSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [pendingItems, setPendingItems] = useState<UnifiedPendingItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  function loadPending() {
    setLoading(true);
    setSearched(true);
    const depPromise = fetch("/api/admin/deposits/pending?page=1&pageSize=500&sortBy=createdAt&sortOrder=asc", { credentials: "include" }).then((r) => r.json());
    const wdPromise = fetch("/api/admin/withdrawals/pending?page=1&pageSize=500&sortBy=createdAt&sortOrder=asc", { credentials: "include" }).then((r) => r.json());
    Promise.all([depPromise, wdPromise])
      .then(([depRes, wdRes]) => {
        const depList = (depRes.items ?? []) as PendingDeposit[];
        const wdList = (wdRes.items ?? []) as PendingWithdraw[];
        const depUnified: UnifiedPendingItem[] = depList.map((d) => ({
          kind: "DEPOSIT",
          id: d.id,
          txId: d.txId,
          userId: d.userId,
          memberId: d.memberId,
          displayName: d.displayName,
          mobile: d.mobile,
          amount: d.amount,
          createdAt: d.createdAt,
          elapsedSec: d.elapsedSec,
          channel: d.channel,
          referenceNo: d.referenceNo,
        }));
        const wdUnified: UnifiedPendingItem[] = wdList.map((w) => ({
          kind: "WITHDRAW",
          id: w.id,
          txId: w.wdId,
          userId: w.userId,
          memberId: w.memberId,
          displayName: w.displayName,
          mobile: w.mobile,
          amount: w.amount,
          createdAt: w.createdAt,
          elapsedSec: w.elapsedSec,
          bankName: w.bankName,
          bankAccount: w.bankAccount,
          assignedTo: w.assignedTo,
        }));
        let merged = [...depUnified, ...wdUnified].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        if (typeFilter === "DEPOSIT") merged = merged.filter((x) => x.kind === "DEPOSIT");
        if (typeFilter === "WITHDRAW") merged = merged.filter((x) => x.kind === "WITHDRAW");
        if (txIdSearch.trim()) {
          const q = txIdSearch.trim().toLowerCase();
          merged = merged.filter((x) => x.txId.toLowerCase().includes(q));
        }
        if (customerSearch.trim()) {
          const q = customerSearch.trim().toLowerCase();
          merged = merged.filter(
            (x) =>
              (x.userId && x.userId.toLowerCase().includes(q)) ||
              (x.displayName && x.displayName.toLowerCase().includes(q)) ||
              (x.mobile && x.mobile.toLowerCase().includes(q))
          );
        }
        if (dateFrom) {
          const from = new Date(dateFrom).getTime();
          merged = merged.filter((x) => new Date(x.createdAt).getTime() >= from);
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          merged = merged.filter((x) => new Date(x.createdAt).getTime() <= to.getTime());
        }
        if (amountMin !== "" && !Number.isNaN(Number(amountMin))) {
          const min = Number(amountMin);
          merged = merged.filter((x) => x.amount >= min);
        }
        if (amountMax !== "" && !Number.isNaN(Number(amountMax))) {
          const max = Number(amountMax);
          merged = merged.filter((x) => x.amount <= max);
        }
        setPendingItems(merged);
        setTotalAmount(merged.reduce((s, x) => s + x.amount, 0));
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (statusFilter === "PENDING_OLD_NEW") loadPending();
    else setSearched(false);
  }, [statusFilter]);

  const showPendingList = statusFilter === "PENDING_OLD_NEW";

  return (
    <div className="mt-4 space-y-4">
      <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">ID</label>
            <input
              type="text"
              value={txIdSearch}
              onChange={(e) => setTxIdSearch(e.target.value)}
              placeholder={t("admin.txMgmt.searchByTxId")}
              className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 min-w-0"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Customer</label>
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder={t("admin.txMgmt.searchByCustomer")}
              className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 min-w-0"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 min-w-0"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{t(o.labelKey as "admin.txMgmt.typeActive")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-800 [color-scheme:light] min-w-0"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">{t("admin.txMgmt.endDate")}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-800 [color-scheme:light] min-w-0"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Amount</label>
            <div className="flex gap-1">
              <input
                type="text"
                value={amountMin}
                onChange={(e) => setAmountMin(e.target.value)}
                placeholder="Min"
                className="h-9 w-20 rounded border border-slate-200 bg-white px-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none min-w-0"
              />
              <input
                type="text"
                value={amountMax}
                onChange={(e) => setAmountMax(e.target.value)}
                placeholder="Max"
                className="h-9 w-20 rounded border border-slate-200 bg-white px-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none min-w-0"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 min-w-0"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{t(o.labelKey as "admin.txMgmt.statusAny")}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => (showPendingList ? loadPending() : undefined)}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            SEARCH
          </button>
          <span className="text-xs text-slate-500">ADVANCED</span>
        </div>
      </section>

      {showPendingList && (
        <div className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white">
          Found: {pendingItems.length}  Total: {totalAmount.toFixed(2)} MYR
        </div>
      )}

      {showPendingList && (
        <section className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Transaction · Action
          </div>
          {loading ? (
            <p className="py-8 text-center text-slate-500">{t("admin.common.loading")}</p>
          ) : pendingItems.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-amber-50/50 py-12 text-center text-slate-600">
              {searched ? t("admin.txMgmt.noPendingMatch") : t("admin.txMgmt.noPending")}
            </div>
          ) : (
            <ul className="space-y-3">
              {pendingItems.map((item) => (
                <li
                  key={item.kind + item.id}
                  className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1.5 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/players?search=${encodeURIComponent(item.userId)}`}
                          className="font-semibold text-sky-600 underline hover:text-sky-800"
                        >
                          {customerLabel(item)}
                        </Link>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            item.kind === "DEPOSIT" ? "bg-emerald-100 text-emerald-800" : "bg-amber-200 text-amber-900"
                          }`}
                        >
                          {item.kind}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                        <span className="font-mono text-xs">{item.txId}</span>
                        <button
                          type="button"
                          onClick={() => copyTxId(item.txId)}
                          className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                        >
                          COPY
                        </button>
                      </div>
                      <p className="text-slate-700">Amount: {item.amount.toFixed(2)}</p>
                      {item.kind === "DEPOSIT" && (item.channel || item.referenceNo) && (
                        <p className="text-xs text-slate-500">
                          Channel: {item.channel ?? "—"} {item.referenceNo ? `Ref: ${item.referenceNo}` : ""}
                        </p>
                      )}
                      {item.kind === "WITHDRAW" && (item.bankName || item.bankAccount) && (
                        <p className="text-xs text-slate-500">
                          Bank: {item.bankName ?? "—"} Account: {item.bankAccount ?? "—"}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400">
                        CREATED {new Date(item.createdAt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Link
                        href={item.kind === "DEPOSIT" ? `/admin/deposits/${item.id}` : `/admin/withdrawals/${item.id}`}
                        className="inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-600"
                      >
                        HANDLE
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {!showPendingList && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-4 text-sm text-slate-500">
            {t("admin.txMgmt.ledgerHint")}
          </p>
          <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-2">
            {TX_PRESETS.map((p) => (
              <Link
                key={p.key}
                href={"/admin/transactions?preset=" + p.key}
                className="admin-compact-btn admin-compact-btn-ghost rounded-md px-3 text-[13px]"
              >
                {p.key}
              </Link>
            ))}
          </div>
          <ReportTableFromApi reportKey="ledger-transactions" title="Ledger" extraParams={{}} />
        </div>
      )}
    </div>
  );
}

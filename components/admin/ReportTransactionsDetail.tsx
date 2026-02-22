"use client";

import { useEffect, useState } from "react";

const TYPE_OPTIONS = [
  { value: "", label: "全部" },
  { value: "DEPOSIT", label: "DEPOSIT" },
  { value: "STAFF DEPOSIT", label: "STAFF DEPOSIT" },
  { value: "STAFF MANUAL DEPOSIT", label: "STAFF MANUAL DEPOSIT" },
  { value: "AUTOPAY DEPOSIT", label: "AUTOPAY DEPOSIT" },
  { value: "WITHDRAW", label: "WITHDRAW" },
  { value: "STAFF WITHDRAW", label: "STAFF WITHDRAW" },
  { value: "AUTOPAY WITHDRAW", label: "AUTOPAY WITHDRAW" },
  { value: "BONUS", label: "BONUS" },
  { value: "MANUAL", label: "MANUAL" },
  { value: "ANGPAO", label: "ANGPAO" },
  { value: "REBATE", label: "REBATE" },
  { value: "FORFEITED", label: "FORFEITED" },
  { value: "COMMISSION", label: "COMMISSION" },
  { value: "LOSSCREDIT", label: "LOSSCREDIT" },
  { value: "DEPOSIT FEE", label: "DEPOSIT FEE" },
  { value: "TIP", label: "TIP" }
];

const STATUS_OPTIONS = [
  { value: "ANY", label: "任意" },
  { value: "CREATED", label: "CREATED" },
  { value: "PROCESSED", label: "PROCESSED" },
  { value: "APPROVED", label: "APPROVED" },
  { value: "REJECTED", label: "REJECTED" }
];

type TxRow = {
  id: string;
  customerName: string;
  customerId?: string;
  type: string;
  amount: number;
  bank: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  payId?: string;
  method: string;
  datetime: string;
  status: string;
  hasAttachment?: boolean;
  statusHistory?: { status: string; at: string; by?: string }[];
};

const MOCK_LIST: TxRow[] = [
  {
    id: "15353272015",
    customerName: "Alvin Wong",
    customerId: "U1001",
    type: "DEPOSIT",
    amount: 25,
    bank: "PAYID ANGPAO",
    bankAccountName: "Alvin Test",
    payId: "61447784154",
    method: "Manual",
    datetime: "2026-02-21 11:06",
    status: "APPROVED",
    hasAttachment: true,
    statusHistory: [
      { status: "CREATED", at: "2026-02-21 08:06" },
      { status: "PROCESSED", at: "2026-02-21 08:06" },
      { status: "APPROVED", at: "2026-02-21 08:06", by: "Admin_GoldPalace" }
    ]
  },
  {
    id: "15353251020",
    customerName: "Alvin Wong",
    type: "DEPOSIT",
    amount: 40,
    bank: "PAYID",
    method: "Manual",
    datetime: "2026-02-21 11:06",
    status: "APPROVED",
    hasAttachment: true
  },
  {
    id: "15353240838",
    customerName: "Alvin Wong",
    type: "DEPOSIT",
    amount: 10,
    bank: "PAYID",
    method: "Manual | Online",
    datetime: "2026-02-21 11:04",
    status: "REJECTED",
    hasAttachment: true,
    statusHistory: [
      { status: "CREATED", at: "2026-02-21 08:04" },
      { status: "PROCESSED", at: "2026-02-21 08:04" },
      { status: "REJECTED", at: "2026-02-21 08:04", by: "Admin_GoldPalace" }
    ]
  }
];

const inputClass =
  "h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 min-w-0";
const labelClass = "mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500";

export function ReportTransactionsDetail() {
  const [txId, setTxId] = useState("");
  const [customer, setCustomer] = useState("");
  const [type, setType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [status, setStatus] = useState("ANY");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [items, setItems] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(false);

  function search() {
    setLoading(true);
    setTimeout(() => {
      setItems(MOCK_LIST);
      setLoading(false);
    }, 300);
  }

  useEffect(() => {
    search();
  }, []);

  const totalAmount = items.reduce((s, t) => s + (t.type === "WITHDRAW" ? -t.amount : t.amount), 0);

  return (
    <div className="mt-6 space-y-6">
      {/* 筛选区 - 企业级：白底、灰边框、统一间距 */}
      <section className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">筛选条件</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <div className="sm:col-span-2">
            <label className={labelClass}>Transaction ID</label>
            <input
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder="Search by Transaction ID"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Customer</label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer ID / Phone"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
          </div>
          <div>
            <label className={labelClass}>End Date</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
          </div>
        </div>
        {showAdvanced && (
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
            <div>
              <label className={labelClass}>Amount Min</label>
              <input type="number" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} placeholder="Min" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Amount Max</label>
              <input type="number" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} placeholder="Max" className={inputClass} />
            </div>
          </div>
        )}
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={search}
            className="h-9 rounded border border-slate-300 bg-slate-700 px-4 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            SEARCH
          </button>
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 focus:outline-none"
          >
            {showAdvanced ? "收起高级" : "ADVANCED →"}
          </button>
        </div>
      </section>

      {/* 汇总条 - 中性深色 */}
      {!loading && items.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-800 px-5 py-3 text-white">
          <span className="text-sm font-medium">Record: {items.length}</span>
          <span className="text-sm font-medium tabular-nums">Total: {totalAmount >= 0 ? "" : "-"}{Math.abs(totalAmount).toFixed(2)}</span>
        </div>
      )}

      {/* 交易列表 - 白底、灰分隔、无彩色块 */}
      <section className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <span className="text-sm font-semibold text-slate-700">Transaction</span>
          <span className="text-xs text-slate-500">共 {items.length} 笔</span>
        </div>
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">加载中…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">无记录，请调整筛选条件后 SEARCH</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((tx) => (
              <li key={tx.id} className="transition-colors hover:bg-slate-50/80">
                <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                        {tx.customerName}
                      </span>
                      <span
                        className={`rounded border px-2 py-0.5 text-xs font-medium ${
                          tx.type === "DEPOSIT" || tx.type.includes("DEPOSIT")
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : tx.type === "WITHDRAW" || tx.type.includes("WITHDRAW")
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-mono">#{tx.id}</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(tx.id)}
                        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-300"
                      >
                        COPY
                      </button>
                    </div>
                    <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                      <div><dt className="inline font-medium text-slate-600">Amount:</dt><dd className="inline pl-1 text-slate-800">{tx.amount}</dd></div>
                      <div><dt className="inline font-medium text-slate-600">Bank:</dt><dd className="inline pl-1 text-slate-800">{tx.bank}</dd></div>
                      <div><dt className="inline font-medium text-slate-600">Method:</dt><dd className="inline pl-1 text-slate-800">{tx.method}</dd></div>
                      <div><dt className="inline font-medium text-slate-600">Datetime:</dt><dd className="inline pl-1 text-slate-800">{tx.datetime}</dd></div>
                      {tx.bankAccountName && <div><dt className="inline font-medium text-slate-600">BankAccountName:</dt><dd className="inline pl-1 text-slate-800">{tx.bankAccountName}</dd></div>}
                      {tx.bankAccountNumber && <div><dt className="inline font-medium text-slate-600">BankAccountNumber:</dt><dd className="inline pl-1 text-slate-800">{tx.bankAccountNumber}</dd></div>}
                      {tx.payId && <div><dt className="inline font-medium text-slate-600">PayID:</dt><dd className="inline pl-1 text-slate-800">{tx.payId}</dd></div>}
                    </dl>
                    {tx.hasAttachment && (
                      <a href="#" className="text-xs font-medium text-slate-600 underline hover:text-slate-800">ATTACHMENT</a>
                    )}
                  </div>
                  <div className="shrink-0 sm:w-52">
                    <div className="rounded border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs">
                      {tx.statusHistory && tx.statusHistory.length > 0 ? (
                        <ul className="space-y-1.5">
                          {tx.statusHistory.map((h, i) => (
                            <li key={i} className="text-slate-600">
                              <span className="font-medium text-slate-700">{h.status}</span> {h.at}
                              {h.by && <span className="text-slate-500"> ({h.by})</span>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400">—</p>
                      )}
                    </div>
                    <p className="mt-2 text-right">
                      <span
                        className={`inline-block rounded border px-2 py-1 text-xs font-medium ${
                          tx.status === "APPROVED"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : tx.status === "REJECTED"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  wdId: string;
  userId: string;
  amount: number;
  bankName: string | null;
  bankAccount: string | null;
  status: string;
  createdAt: string;
  completedAt: string | null;
  processingDurationSec: number | null;
};

export function AdminWithdrawalListClient() {
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("pageSize", "20");
    if (status !== "ALL") sp.set("status", status);
    if (dateFrom) sp.set("dateFrom", dateFrom);
    if (dateTo) sp.set("dateTo", dateTo);
    fetch(`/api/admin/withdrawals?${sp}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setTotal(d.total ?? 0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [page, status, dateFrom, dateTo]);

  return (
    <div className="mt-4">
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="min-w-[120px] rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] font-medium text-slate-800 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="ALL">全部</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="PAID">PAID</option>
              <option value="BURNED">BURNED</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] font-medium text-slate-800 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 [color-scheme:light]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] font-medium text-slate-800 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 [color-scheme:light]"
            />
          </div>
          <button type="button" onClick={() => load()} className="rounded-lg bg-sky-500 px-5 py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30">筛选</button>
        </div>
      </div>
      {loading ? (
        <p className="text-slate-500">加载中…</p>
      ) : items.length === 0 ? (
        <p className="text-slate-500">无记录</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/90">
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">时间</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">Wd ID</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">User ID</th>
                <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">Amount (RM)</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">银行/账户</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">状态</th>
                <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">处理时长(秒)</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-[15px] font-medium text-slate-900">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-[15px] font-medium text-slate-900">{r.wdId}</td>
                  <td className="px-4 py-3 text-[15px] font-medium text-slate-900">{r.userId}</td>
                  <td className="px-4 py-3 text-right text-[15px] font-medium text-slate-900">{r.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-[15px] font-medium text-slate-900">{[r.bankName, r.bankAccount].filter(Boolean).join(" / ") || "-"}</td>
                  <td className="px-4 py-3 text-[15px] font-medium text-slate-900">{r.status}</td>
                  <td className="px-4 py-3 text-right text-[15px] font-medium text-slate-900">{r.processingDurationSec ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/withdrawals/${r.id}`} className="text-sky-600 hover:underline">详情</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {total > 20 && (
        <div className="mt-2 flex justify-end gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border px-2 py-1 text-sm disabled:opacity-50">上一页</button>
          <span className="py-1 text-sm">第 {page} 页</span>
          <button type="button" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)} className="rounded border px-2 py-1 text-sm disabled:opacity-50">下一页</button>
        </div>
      )}
    </div>
  );
}

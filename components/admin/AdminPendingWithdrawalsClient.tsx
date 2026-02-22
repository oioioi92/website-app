"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  wdId: string;
  userId: string;
  amount: number;
  walletSnapshot: number | null;
  bankName: string | null;
  bankAccount: string | null;
  status: string;
  createdAt: string;
  elapsedSec: number;
  assignedTo: string | null;
};

export function AdminPendingWithdrawalsClient() {
  const [tab, setTab] = useState<"PENDING" | "PROCESSING">("PENDING");
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [burnId, setBurnId] = useState<string | null>(null);
  const [paidId, setPaidId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [paymentRef, setPaymentRef] = useState("");

  function load() {
    setLoading(true);
    const status = tab === "PROCESSING" ? "PROCESSING" : "PENDING";
    fetch(`/api/admin/withdrawals/pending?status=${status}&page=${page}&pageSize=20`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setTotal(d.total ?? 0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [tab, page]);

  async function approve(id: string) {
    const res = await fetch(`/api/admin/withdrawals/${id}/approve`, { method: "POST" });
    if (res.ok) load();
    else alert((await res.json()).error || "Failed");
  }

  async function reject(id: string) {
    if (!reason.trim()) return;
    const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason.trim() })
    });
    if (res.ok) {
      setRejectId(null);
      setReason("");
      load();
    } else alert((await res.json()).error || "Failed");
  }

  async function burn(id: string) {
    if (!reason.trim()) return;
    const res = await fetch(`/api/admin/withdrawals/${id}/burn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reason.trim() })
    });
    if (res.ok) {
      setBurnId(null);
      setReason("");
      load();
    } else alert((await res.json()).error || "Failed");
  }

  async function markPaid(id: string) {
    const res = await fetch(`/api/admin/withdrawals/${id}/mark-paid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentReferenceNo: paymentRef.trim() || undefined })
    });
    if (res.ok) {
      setPaidId(null);
      setPaymentRef("");
      load();
    } else alert((await res.json()).error || "Failed");
  }

  async function assign(id: string) {
    const res = await fetch(`/api/admin/withdrawals/${id}/assign`, { method: "POST" });
    if (res.ok) load();
    else alert((await res.json()).error || "Failed");
  }

  return (
    <div className="mt-4">
      <div className="mb-2 flex gap-2">
        <button
          type="button"
          onClick={() => { setTab("PENDING"); setPage(1); }}
          className={`rounded px-3 py-1.5 text-sm ${tab === "PENDING" ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-700"}`}
        >
          Queue (未分配)
        </button>
        <button
          type="button"
          onClick={() => { setTab("PROCESSING"); setPage(1); }}
          className={`rounded px-3 py-1.5 text-sm ${tab === "PROCESSING" ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-700"}`}
        >
          Processing (处理中)
        </button>
      </div>
      {loading ? (
        <p className="text-slate-500">加载中…</p>
      ) : items.length === 0 ? (
        <p className="text-slate-500">暂无待处理提款</p>
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
                <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">等待(秒)</th>
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
                  <td className="px-4 py-3 text-right text-[15px] font-medium text-slate-900">{r.elapsedSec}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/withdrawals/${r.id}`} className="mr-2 text-sky-600 hover:underline">详情</Link>
                    {r.status === "PENDING" && (
                      <button type="button" onClick={() => assign(r.id)} className="mr-2 text-slate-600 hover:underline">Assign</button>
                    )}
                    <button type="button" onClick={() => approve(r.id)} className="mr-2 text-green-600 hover:underline">Approve</button>
                    {rejectId === r.id ? (
                      <span className="inline-flex items-center gap-1">
                        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="必填原因" className="w-28 rounded border px-2 py-0.5 text-xs" />
                        <button type="button" onClick={() => reject(r.id)} className="text-red-600 hover:underline">确认</button>
                        <button type="button" onClick={() => { setRejectId(null); setReason(""); }}>取消</button>
                      </span>
                    ) : (
                      <button type="button" onClick={() => { setRejectId(r.id); setBurnId(null); setReason(""); }} className="mr-2 text-red-600 hover:underline">Reject</button>
                    )}
                    {burnId === r.id ? (
                      <span className="inline-flex items-center gap-1">
                        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="必填原因" className="w-28 rounded border px-2 py-0.5 text-xs" />
                        <button type="button" onClick={() => burn(r.id)} className="text-orange-600 hover:underline">确认</button>
                        <button type="button" onClick={() => { setBurnId(null); setRejectId(null); setReason(""); }}>取消</button>
                      </span>
                    ) : (
                      <button type="button" onClick={() => { setBurnId(r.id); setRejectId(null); setReason(""); }} className="mr-2 text-orange-600 hover:underline">Burn</button>
                    )}
                    {paidId === r.id ? (
                      <span className="inline-flex items-center gap-1">
                        <input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} placeholder="银行参考号" className="w-28 rounded border px-2 py-0.5 text-xs" />
                        <button type="button" onClick={() => markPaid(r.id)} className="text-sky-600 hover:underline">确认</button>
                        <button type="button" onClick={() => { setPaidId(null); setPaymentRef(""); }}>取消</button>
                      </span>
                    ) : (
                      <button type="button" onClick={() => { setPaidId(r.id); setPaymentRef(""); }} className="text-sky-600 hover:underline">Mark Paid</button>
                    )}
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  txId: string;
  userId: string;
  amount: number;
  channel: string;
  referenceNo: string | null;
  status: string;
  createdAt: string;
  elapsedSec: number;
};

export function AdminPendingDepositsClient() {
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [burnId, setBurnId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  function load() {
    setLoading(true);
    fetch(`/api/admin/deposits/pending?page=${page}&pageSize=20`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setTotal(d.total ?? 0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [page]);

  async function approve(id: string) {
    const res = await fetch(`/api/admin/deposits/${id}/approve`, { method: "POST" });
    if (res.ok) load();
    else alert((await res.json()).error || "Failed");
  }

  async function reject(id: string) {
    if (!reason.trim()) return;
    const res = await fetch(`/api/admin/deposits/${id}/reject`, {
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
    const res = await fetch(`/api/admin/deposits/${id}/burn`, {
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

  return (
    <div className="mt-4">
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/deposits/pending/create"
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600"
        >
          手动创建入款
        </Link>
      </div>
      {loading ? (
        <p className="text-slate-500">加载中…</p>
      ) : items.length === 0 ? (
        <p className="text-slate-500">暂无待审核入款</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-medium text-slate-700">时间</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Tx ID</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">User ID</th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">Amount (RM)</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">渠道</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">凭证号</th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">等待(秒)</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 text-slate-600">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-800">{r.txId}</td>
                  <td className="px-4 py-2.5 text-slate-800">{r.userId}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-800">{r.amount.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{r.channel}</td>
                  <td className="px-4 py-2.5 text-slate-600">{r.referenceNo ?? "-"}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">{r.elapsedSec}</td>
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/deposits/${r.id}`} className="mr-2 text-sky-600 hover:underline">详情</Link>
                    <button type="button" onClick={() => approve(r.id)} className="mr-2 text-emerald-600 hover:underline">Approve</button>
                    {rejectId === r.id ? (
                      <span className="inline-flex items-center gap-1">
                        <input
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="必填原因"
                          className="w-32 rounded border px-2 py-0.5 text-xs"
                        />
                        <button type="button" onClick={() => reject(r.id)} className="text-red-600 hover:underline">确认</button>
                        <button type="button" onClick={() => { setRejectId(null); setReason(""); }}>取消</button>
                      </span>
                    ) : (
                      <button type="button" onClick={() => { setRejectId(r.id); setBurnId(null); setReason(""); }} className="text-red-600 hover:underline mr-2">Reject</button>
                    )}
                    {burnId === r.id ? (
                      <span className="inline-flex items-center gap-1">
                        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="必填原因" className="w-32 rounded border px-2 py-0.5 text-xs" />
                        <button type="button" onClick={() => burn(r.id)} className="text-orange-600 hover:underline">确认</button>
                        <button type="button" onClick={() => { setBurnId(null); setRejectId(null); setReason(""); }}>取消</button>
                      </span>
                    ) : (
                      <button type="button" onClick={() => { setBurnId(r.id); setRejectId(null); setReason(""); }} className="text-orange-600 hover:underline">Burn</button>
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
          <span className="py-1 text-sm">第 {page} 页，共 {Math.ceil(total / 20)} 页</span>
          <button type="button" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)} className="rounded border px-2 py-1 text-sm disabled:opacity-50">下一页</button>
        </div>
      )}
    </div>
  );
}

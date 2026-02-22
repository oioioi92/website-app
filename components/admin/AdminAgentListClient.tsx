"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  userRef: string;
  displayName: string | null;
  referralCode: string | null;
  directCount: number;
  register_at: string;
};

export function AdminAgentListClient() {
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch(`/api/admin/agents?page=${page}&pageSize=20`)
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

  return (
    <div className="mt-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-slate-500">加载中…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500">暂无代理（无下线的成员不显示）</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-[15px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/90">
                    <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">注册时间</th>
                    <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">User ID</th>
                    <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">名称</th>
                    <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">推荐码</th>
                    <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">L1 人数</th>
                    <th className="px-4 py-3.5 text-left text-[13px] font-semibold tracking-wide text-slate-800">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r, idx) => (
                    <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{new Date(r.register_at).toLocaleString()}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-slate-900">{r.userRef}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{r.displayName ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{r.referralCode ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">{r.directCount}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Link href={`/admin/agents/${r.id}`} className="inline-block rounded-lg border border-sky-400 bg-sky-500 px-3 py-1.5 text-sm font-bold text-white hover:bg-sky-600">详情 / 层级</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > 20 && (
              <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-end gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50">上一页</button>
                <span className="rounded-lg bg-sky-100 px-3 py-1.5 text-sm font-bold text-sky-900">{page}</span>
                <button type="button" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50">下一页</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

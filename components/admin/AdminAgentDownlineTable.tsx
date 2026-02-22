"use client";

import { useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  userRef: string;
  displayName: string | null;
  register_at: string;
  last_deposit_at: string | null;
  free_credit: number;
  deposit_count: number;
  withdraw_count: number;
};

function maskUserRef(userRef: string): string {
  if (userRef.length <= 8) return userRef;
  return "*" + userRef.slice(1, 8) + " " + "*****" + userRef.slice(-6);
}

const PAGE_SIZE = 10;

export function AdminAgentDownlineTable({
  title,
  rows
}: {
  title: string;
  rows: Row[];
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paginatedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <h2 className="mt-4 text-xl font-semibold text-slate-800">{title}</h2>
      <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/90">
              <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">#</th>
              <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">Username</th>
              <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">Deposits</th>
              <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">Withdrawals</th>
              <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">Promotions</th>
              <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">Free Credits</th>
              <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">Joined Date</th>
              <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">Last Deposit</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((r, idx) => {
              const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
              return (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-[15px] font-medium text-slate-900">{rowNum}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/admin/players/${r.id}/wallet`} className="font-mono text-sky-600 hover:underline">{maskUserRef(r.userRef)}</Link>
                      <button type="button" className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600" title="编辑" aria-label="编辑">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button type="button" className="rounded p-0.5 text-red-400 hover:bg-red-50 hover:text-red-600" title="移除" aria-label="移除">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-[15px] font-medium text-slate-900">0.00</td>
                  <td className="px-4 py-3 text-right text-[15px] font-medium text-slate-900">0.00</td>
                  <td className="px-4 py-3 text-right text-[15px] font-medium text-slate-900">0.00</td>
                  <td className="px-4 py-3 text-right text-[15px] font-medium text-slate-900">{r.free_credit.toFixed(2)}</td>
                  <td className="px-4 py-3 text-[15px] font-medium text-slate-900">{new Date(r.register_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-[15px] font-medium text-slate-900">{r.last_deposit_at ? new Date(r.last_deposit_at).toLocaleString() : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
          <span className="text-sm text-slate-600">Page <span className="font-medium">{page}</span> of {totalPages} pages</span>
          <div className="flex items-center gap-1">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm disabled:opacity-50">Prev</button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </>
  );
}

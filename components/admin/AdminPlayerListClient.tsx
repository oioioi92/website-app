"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPlayerDetailPanel } from "./AdminPlayerDetailPanel";

type Row = {
  id: string;
  userRef: string;
  displayName: string | null;
  mobile: string | null;
  bankName: string | null;
  bankAccount: string | null;
  register_at: string;
  main_wallet_balance: number;
  deposit_count: number;
  withdraw_count: number;
  last_deposit_at: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
};

export function AdminPlayerListClient() {
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailMember, setDetailMember] = useState<{ id: string; userRef: string; displayName: string | null } | null>(null);

  function load() {
    setLoading(true);
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("pageSize", "20");
    if (search) sp.set("search", search);
    fetch(`/api/admin/players?${sp}`)
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
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
            placeholder="User ID / 名称 / 手机号"
            className="min-w-[220px] rounded-lg border border-slate-300 bg-slate-50/80 px-4 py-2.5 text-[15px] text-slate-800 placeholder-slate-500 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
          <button
            type="button"
            onClick={() => { setPage(1); load(); }}
            className="rounded-lg bg-sky-600 px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-sky-700"
          >
            搜索
          </button>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-slate-500">加载中…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No data available in table</div>
        ) : (
          <>
          <div className="overflow-x-auto">
          <table className="min-w-full text-[15px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/90">
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">Register Date</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">User ID</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">Name</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">Mobile</th>
                <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">Main Wallet (RM)</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">Bank / Account</th>
                <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">Deposit</th>
                <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">Withdraw</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">Last Login</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold tracking-wide text-slate-800">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r, idx) => (
                <tr
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetailMember({ id: r.id, userRef: r.userRef, displayName: r.displayName })}
                  onKeyDown={(e) => e.key === "Enter" && setDetailMember({ id: r.id, userRef: r.userRef, displayName: r.displayName })}
                  className={"cursor-pointer " + (idx % 2 === 0 ? "bg-white hover:bg-sky-50/50" : "bg-slate-50/50 hover:bg-sky-50/50")}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{new Date(r.register_at).toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-slate-900">{r.userRef}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{r.displayName ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{r.mobile ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-900">{r.main_wallet_balance.toFixed(2)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{[r.bankName, r.bankAccount].filter(Boolean).join(" / ") || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">{r.deposit_count}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">{r.withdraw_count}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{r.last_login_at ? new Date(r.last_login_at).toLocaleString() : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-2">
                      <a
                        href={"/chat?user=" + encodeURIComponent(r.userRef)}
                        target="_blank"
                        rel="noreferrer"
                        title="直接和该顾客聊天、发信息"
                        className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-bold text-white hover:bg-sky-600"
                      >
                        Chat
                      </a>
                      <span className="text-slate-300">|</span>
                      <Link
                        href={"/admin/players/" + r.id + "/wallet"}
                        title="进入该顾客前台，查看并代操作钱包"
                        className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-bold text-white hover:bg-sky-600"
                      >
                        Wallet
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          </>
        )}
        {total > 20 && (
          <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-end gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50">上一页</button>
            <span className="rounded-lg bg-sky-100 px-3 py-1.5 text-sm font-bold text-sky-900">{page}</span>
            <button type="button" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50">下一页</button>
          </div>
        )}
      </div>

      {detailMember && (
        <AdminPlayerDetailPanel
          memberId={detailMember.id}
          initialRow={{ userRef: detailMember.userRef, displayName: detailMember.displayName }}
          onClose={() => setDetailMember(null)}
        />
      )}
    </div>
  );
}

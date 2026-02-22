"use client";

import { useEffect, useState } from "react";

type DayRow = {
  date: string;
  depositCount: number;
  depositAmount: number;
  withdrawCount: number;
  withdrawAmount: number;
  net: number;
};

const MOCK_DAILY: DayRow[] = [
  { date: "2026-02-04", depositCount: 14, depositAmount: 693.11, withdrawCount: 14, withdrawAmount: 305.01, net: 388.1 },
  { date: "2026-02-05", depositCount: 19, depositAmount: 1160.81, withdrawCount: 19, withdrawAmount: 519.19, net: 641.62 },
  { date: "2026-02-06", depositCount: 7, depositAmount: 372, withdrawCount: 13, withdrawAmount: 280, net: 92 },
  { date: "2026-02-09", depositCount: 15, depositAmount: 823, withdrawCount: 9, withdrawAmount: 2078.08, net: -1255.08 },
  { date: "2026-02-21", depositCount: 0, depositAmount: 0, withdrawCount: 1, withdrawAmount: 20, net: -20 }
];

const INPUT_CLASS = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 [color-scheme:light]";
const LABEL_CLASS = "mb-1 block text-xs font-medium text-slate-500";

export function ReportDailySummary() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rows, setRows] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(false);

  function load() {
    setLoading(true);
    setTimeout(() => {
      setRows(MOCK_DAILY);
      setLoading(false);
    }, 200);
  }

  useEffect(() => {
    load();
  }, []);

  const totalDepositCount = rows.reduce((s, r) => s + r.depositCount, 0);
  const totalDepositAmount = rows.reduce((s, r) => s + r.depositAmount, 0);
  const totalWithdrawCount = rows.reduce((s, r) => s + r.withdrawCount, 0);
  const totalWithdrawAmount = rows.reduce((s, r) => s + r.withdrawAmount, 0);
  const totalNet = totalDepositAmount - totalWithdrawAmount;

  return (
    <div className="mt-4">
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className={LABEL_CLASS}>日期从</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>日期到</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={INPUT_CLASS} />
        </div>
        <button type="button" onClick={load} className="rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600">查询</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-700 text-white">
              <th className="px-4 py-3 text-left font-semibold">日期</th>
              <th className="px-4 py-3 text-right font-semibold">入款笔数</th>
              <th className="px-4 py-3 text-right font-semibold">入款金额</th>
              <th className="px-4 py-3 text-right font-semibold">提款笔数</th>
              <th className="px-4 py-3 text-right font-semibold">提款金额</th>
              <th className="px-4 py-3 text-right font-semibold">净额</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">加载中…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">无数据</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.date} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.date}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">{r.depositCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">{r.depositAmount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">{r.withdrawCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate-800">{r.withdrawAmount.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums font-medium ${r.net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{r.net >= 0 ? "" : "-"}{Math.abs(r.net).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-amber-500/90 text-white font-semibold">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right tabular-nums">{totalDepositCount}</td>
              <td className="px-4 py-3 text-right tabular-nums">{totalDepositAmount.toFixed(2)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{totalWithdrawCount}</td>
              <td className="px-4 py-3 text-right tabular-nums">{totalWithdrawAmount.toFixed(2)}</td>
              <td className={`px-4 py-3 text-right tabular-nums ${totalNet >= 0 ? "" : ""}`}>{totalNet >= 0 ? "" : "-"}{Math.abs(totalNet).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

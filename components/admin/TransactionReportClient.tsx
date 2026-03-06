"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/context";

type Summary = {
  total_periods?: number;
  deposit_count?: number;
  deposit_total?: number;
  withdraw_count?: number;
  withdraw_total?: number;
  net?: number;
};

type Row = {
  period_label: string;
  deposit_count: number;
  deposit_total: number;
  withdraw_count: number;
  withdraw_total: number;
  net: number;
};

const DISPLAY_OPTIONS = [
  { value: "daily", labelKey: "admin.txReport.displayDaily" },
  { value: "monthly", labelKey: "admin.txReport.displayMonthly" },
  { value: "yearly", labelKey: "admin.txReport.displayYearly" },
];

const defaultFrom = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};
const defaultTo = () => new Date().toISOString().slice(0, 10);

function quickPeriod(key: "thisMonth" | "lastMonth" | "last7"): { from: string; to: string } {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  if (key === "last7") {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from: from.toISOString().slice(0, 10), to };
  }
  if (key === "thisMonth") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: from.toISOString().slice(0, 10), to };
  }
  const from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
  return { from: from.toISOString().slice(0, 10), to: lastDay.toISOString().slice(0, 10) };
}

export function TransactionReportClient() {
  const { t } = useLocale();
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(defaultTo);
  const [groupBy, setGroupBy] = useState<"daily" | "monthly" | "yearly">("daily");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    const sp = new URLSearchParams();
    sp.set("dateFrom", dateFrom);
    sp.set("dateTo", dateTo);
    sp.set("groupBy", groupBy);
    if (typeFilter !== "All") sp.set("type", typeFilter);
    fetch(`/api/admin/reports/query/transaction-report?${sp}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: { rows?: Row[]; summary?: Summary }) => {
        setRows(Array.isArray(data.rows) ? data.rows : []);
        setSummary(data.summary ?? null);
      })
      .catch(() => {
        setRows([]);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [dateFrom, dateTo, groupBy, typeFilter]);

  const applyQuick = (key: "thisMonth" | "lastMonth" | "last7") => {
    const { from, to } = quickPeriod(key);
    setDateFrom(from);
    setDateTo(to);
    setTimeout(() => load(), 0);
  };

  function exportCsv() {
    setExporting(true);
    setExportError(null);
    const sp = new URLSearchParams();
    sp.set("dateFrom", dateFrom);
    sp.set("dateTo", dateTo);
    sp.set("groupBy", groupBy);
    if (typeFilter !== "All") sp.set("type", typeFilter);
    sp.set("format", "csv");
    fetch(`/api/admin/reports/query/transaction-report?${sp}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Export failed");
        return r.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transaction-report-${dateFrom}-${dateTo}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => setExportError(t("admin.reports.exportCsvFailed")))
      .finally(() => setExporting(false));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* 筛选区：Period + Display + Type + 快捷周期 + SEARCH */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
          {t("admin.txReport.filters")}
        </h2>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t("admin.txReport.periodFrom")}</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 [color-scheme:light] focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t("admin.txReport.periodTo")}</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 [color-scheme:light] focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{t("admin.txReport.display")}</label>
            <div className="grid grid-cols-3 rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 min-w-0">
              {DISPLAY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGroupBy(opt.value as "daily" | "monthly" | "yearly")}
                  className={`rounded-md px-2 sm:px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap min-w-0 ${
                    groupBy === opt.value
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t(opt.labelKey as "admin.txReport.displayDaily")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{t("admin.txReport.type")}</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 min-w-[100px]"
            >
              <option value="All">{t("admin.txReport.typeAll")}</option>
              <option value="Deposit">{t("admin.txReport.typeDeposit")}</option>
              <option value="Withdraw">{t("admin.txReport.typeWithdraw")}</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => applyQuick("last7")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
              {t("admin.txReport.quickLast7")}
            </button>
            <button type="button" onClick={() => applyQuick("thisMonth")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
              {t("admin.txReport.quickThisMonth")}
            </button>
            <button type="button" onClick={() => applyQuick("lastMonth")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
              {t("admin.txReport.quickLastMonth")}
            </button>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            SEARCH
          </button>
        </div>
      </section>

      {/* 摘要卡：三张并排，一目了然 */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700/80">
              {t("admin.txReport.totalDeposit")}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-800">
              {(summary.deposit_total ?? 0).toFixed(2)} <span className="text-sm font-normal text-emerald-600">MYR</span>
            </p>
            <p className="mt-0.5 text-sm text-emerald-600/90">
              {(summary.deposit_count ?? 0)} {t("admin.txReport.transactions")}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700/80">
              {t("admin.txReport.totalWithdraw")}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-800">
              {(summary.withdraw_total ?? 0).toFixed(2)} <span className="text-sm font-normal text-amber-600">MYR</span>
            </p>
            <p className="mt-0.5 text-sm text-amber-600/90">
              {(summary.withdraw_count ?? 0)} {t("admin.txReport.transactions")}
            </p>
          </div>
          <div
            className={`rounded-xl border p-4 shadow-sm ${
              (summary.net ?? 0) >= 0
                ? "border-slate-200/80 bg-gradient-to-br from-slate-50 to-white"
                : "border-red-200/80 bg-gradient-to-br from-red-50/80 to-white"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {t("admin.txReport.net")}
            </p>
            <p
              className={`mt-1 text-2xl font-bold tabular-nums ${
                (summary.net ?? 0) >= 0 ? "text-slate-800" : "text-red-700"
              }`}
            >
              {(summary.net ?? 0).toFixed(2)} <span className="text-sm font-normal text-slate-500">MYR</span>
            </p>
          </div>
        </div>
      )}

      {/* 主表格：表头 + 数据行 + Total 行 */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">{t("admin.txReport.tableTitle")}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{t("admin.txReport.tableDesc")}</p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={exporting}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {exporting ? "..." : t("admin.reports.exportCsv")}
          </button>
        </div>
        {exportError && <p className="bg-red-50 px-4 py-2 text-sm text-red-600">{exportError}</p>}
        {loading ? (
          <div className="py-16 text-center text-slate-500">{t("admin.common.loading")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-700 text-white">
                  <th className="px-4 py-3 text-left font-semibold">{t("admin.txReport.colDate")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("admin.txReport.colDepositCount")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("admin.txReport.colDepositAmount")} (MYR)</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("admin.txReport.colWithdrawCount")}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("admin.txReport.colWithdrawAmount")} (MYR)</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("admin.txReport.colNet")} (MYR)</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      {t("admin.common.noRecords")}
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr
                      key={i}
                      className={`border-b border-slate-100 hover:bg-slate-100/60 ${i % 2 === 1 ? "bg-slate-50/70" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">{r.period_label}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">{r.deposit_count}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-700">{r.deposit_total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">{r.withdraw_count}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-amber-700">{r.withdraw_total.toFixed(2)}</td>
                      <td className={`px-4 py-3 text-right tabular-nums font-medium ${r.net >= 0 ? "text-slate-800" : "text-red-600"}`}>
                        {r.net.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
                {summary && rows.length > 0 && (
                  <tr className="border-t-2 border-amber-400 bg-amber-500/95 text-white font-bold shadow-inner">
                    <td className="px-4 py-3">{t("admin.txReport.total")}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{summary.deposit_count ?? 0}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{(summary.deposit_total ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{summary.withdraw_count ?? 0}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{(summary.withdraw_total ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {(summary.net ?? 0).toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

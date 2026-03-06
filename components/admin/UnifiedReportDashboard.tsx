"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/lib/i18n/context";
import { useAdminApiContext } from "@/lib/admin-api-context";
import type { ReportApiResponse, ReportColumn } from "@/lib/backoffice/report-api-types";
import { isRecordsReport } from "@/lib/backoffice/report-filters-schema";
import {
  RECORDS_STATUS_OPTIONS,
  TX_TYPE_LEDGER_OPTIONS
} from "@/lib/backoffice/filter-options";

/* ========== Filter state (single source of truth) ========== */
export type DashboardFilters = {
  dateFrom: string;
  dateTo: string;
  userId: string;
  txType: string;
  status: string;
  externalRef: string;
  provider: string;
  gameCode: string;
  bankId: string;
};

const defaultFilters: DashboardFilters = {
  dateFrom: "",
  dateTo: "",
  userId: "",
  txType: "ALL",
  status: "ALL",
  externalRef: "",
  provider: "",
  gameCode: "",
  bankId: ""
};

function toQueryParams(f: DashboardFilters, reportKey: string, page = 1, pageSize = 20): URLSearchParams {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  sp.set("pageSize", String(pageSize));
  if (f.dateFrom) sp.set("dateFrom", f.dateFrom);
  if (f.dateTo) sp.set("dateTo", f.dateTo);
  if (f.userId) sp.set("userId", f.userId);
  if (f.txType && f.txType !== "ALL") sp.set("txType", f.txType);
  if (isRecordsReport(reportKey) && f.status !== "ALL") sp.set("status", f.status);
  if (f.externalRef) sp.set("externalRef", f.externalRef);
  if (reportKey === "winloss-by-game" || reportKey === "ledger-transactions") {
    if (f.dateFrom) sp.set("from", f.dateFrom);
    if (f.dateTo) sp.set("to", f.dateTo);
  }
  if (reportKey === "winloss-by-game") {
    if (f.provider) sp.set("provider", f.provider);
    if (f.gameCode) sp.set("gameCode", f.gameCode);
  }
  if (reportKey === "ledger-transactions" && f.provider) sp.set("provider", f.provider);
  if (reportKey === "ledger-transactions" && f.gameCode) sp.set("gameCode", f.gameCode);
  return sp;
}

function formatCell(value: unknown, key: string): string {
  if (value == null) return "—";
  if (typeof value === "number")
    return key === "amount" || key.endsWith("_total") || key.endsWith("_count") ? value.toFixed(2) : String(value);
  if (typeof value === "string") {
    const dateKeys = ["created_at", "effective_at", "hour_start", "report_date"];
    if (dateKeys.includes(key)) {
      try {
        const d = new Date(value);
        return key === "report_date" || key === "hour_start" ? value.slice(0, 10) : d.toLocaleString();
      } catch {
        return value;
      }
    }
  }
  return String(value);
}

/* ========== Report block: fetches one report with applied filters ========== */
type ReportBlockProps = {
  reportKey: string;
  title: string;
  filters: DashboardFilters;
  extraParams?: Record<string, string>;
  pageSize?: number;
};

function ReportBlock({ reportKey, title, filters, extraParams = {}, pageSize = 20 }: ReportBlockProps) {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [data, setData] = useState<ReportApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const sp = toQueryParams(filters, reportKey, page, pageSize);
    Object.entries(extraParams).forEach(([k, v]) => sp.set(k, v));
    fetch(`/api/admin/reports/query/${reportKey}?${sp}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        if (!r.ok) throw new Error("Request failed");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Request failed"))
      .finally(() => setLoading(false));
  }, [reportKey, filters, page, pageSize, extraParams, setForbidden]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = (data?.columns ?? []) as ReportColumn[];
  const totalCount = typeof data?.summary?.total_count === "number" ? data.summary.total_count : 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 tracking-tight">{title}</h3>
        {data?.summary && Object.keys(data.summary).length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 tabular-nums">
            {Object.entries(data.summary).map(([k, v]) => (
              <span key={k}>
                {k.replace(/_/g, " ")}: {typeof v === "number" ? v.toFixed(2) : v}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">{t("admin.common.loading")}</div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600">{error}</div>
        ) : !data ? (
          <div className="py-16 text-center text-sm text-slate-400">{t("admin.reports.clickSearch") ?? "Apply filters and load"}</div>
        ) : (
          <table className="w-full min-w-[640px] text-sm" style={{ tableLayout: "auto" }}>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap ${
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-10 text-center text-slate-400">
                    {t("admin.common.noRecords")}
                  </td>
                </tr>
              ) : (
                data.rows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-2.5 whitespace-nowrap ${
                          col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                        } ${col.key === "amount" && Number(row[col.key]) < 0 ? "text-red-600" : "text-slate-700"}`}
                      >
                        {formatCell(row[col.key], col.key)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {data && data.rows.length > 0 && totalPages > 1 && (
        <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span>
            Page {page} / {totalPages} · {totalCount} records
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 rounded border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2 py-1 rounded border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

const inputClass =
  "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 min-w-0 transition";
const labelClass = "mb-1 block text-xs font-medium text-slate-500";

export function UnifiedReportDashboard() {
  const { t } = useLocale();
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(true);
  const [banks, setBanks] = useState<Array<{ id: string; bankName: string; bankCode: string }>>([]);

  useEffect(() => {
    fetch("/api/admin/settings/bank", { credentials: "include" })
      .then((r) => r.ok ? r.json() : { items: [] })
      .then((d: { items?: Array<{ id: string; bankName: string; bankCode: string }> }) => setBanks(d.items ?? []))
      .catch(() => setBanks([]));
  }, []);

  const applyFilters = () => setAppliedFilters({ ...filters });
  const resetFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };
  const setToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setFilters((prev) => ({ ...prev, dateFrom: today, dateTo: today }));
    setAppliedFilters((prev) => ({ ...prev, dateFrom: today, dateTo: today }));
  };
  const clearAll = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t("admin.reportCenter.allReportsTitle") ?? "Reports Dashboard"}
        </h1>
        <p className="text-sm text-slate-500">
          {t("admin.reportCenter.searchOrOpen") ?? "One page for all reports. Use filters above, then view results below."}
        </p>
      </header>

      {/* Collapsible Filter Panel */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setFilterOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-left bg-slate-50/80 border-b border-slate-100 hover:bg-slate-50"
        >
          <span className="text-sm font-semibold text-slate-800">{t("admin.common.filterConditions") ?? "Filters"}</span>
          <svg
            className={`w-5 h-5 text-slate-500 transition-transform ${filterOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {filterOpen && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              <div>
                <label className={labelClass}>{t("admin.reports.dateFrom")}</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("admin.reports.dateTo")}</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={setToday}
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Today
                </button>
              </div>
              <div>
                <label className={labelClass}>{t("admin.reports.userId")} / Player</label>
                <input
                  type="text"
                  value={filters.userId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))}
                  placeholder={t("admin.reports.userId")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("admin.reports.type")}</label>
                <select
                  value={filters.txType}
                  onChange={(e) => setFilters((prev) => ({ ...prev, txType: e.target.value }))}
                  className={inputClass}
                >
                  {TX_TYPE_LEDGER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.value === "ALL" ? t("admin.common.all") : o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("admin.reports.status")}</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className={inputClass}
                >
                  {RECORDS_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.value === "ALL" ? t("admin.common.all") : o.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>{t("admin.reports.reference")}</label>
                <input
                  type="text"
                  value={filters.externalRef}
                  onChange={(e) => setFilters((prev) => ({ ...prev, externalRef: e.target.value }))}
                  placeholder={t("admin.reports.reference")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Bank</label>
                <select
                  value={filters.bankId}
                  onChange={(e) => setFilters((prev) => ({ ...prev, bankId: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">All</option>
                  {banks.map((b) => (
                    <option key={b.id} value={b.id}>{b.bankName || b.bankCode || b.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("admin.reports.providerRequired")}</label>
                <input
                  type="text"
                  value={filters.provider}
                  onChange={(e) => setFilters((prev) => ({ ...prev, provider: e.target.value }))}
                  placeholder="Provider"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("admin.reports.gameCodeOptional")}</label>
                <input
                  type="text"
                  value={filters.gameCode}
                  onChange={(e) => setFilters((prev) => ({ ...prev, gameCode: e.target.value }))}
                  placeholder="Game code"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={applyFilters}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {t("admin.common.search") ?? "Apply Filters"}
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report blocks: key from appliedFilters so changing filters resets pagination */}
      <div className="space-y-6">
        <ReportBlock
          key={`all-${JSON.stringify(appliedFilters)}`}
          reportKey="all-transactions"
          title={t("admin.reportTitle.all-transactions") ?? "All Transactions"}
          filters={appliedFilters}
          pageSize={20}
        />
        <ReportBlock
          key={`ledger-${JSON.stringify(appliedFilters)}`}
          reportKey="ledger-transactions"
          title="Ledger Transactions"
          filters={appliedFilters}
          pageSize={20}
        />
        <ReportBlock
          key={`winloss-${JSON.stringify(appliedFilters)}`}
          reportKey="winloss-by-game"
          title={t("admin.reportTitle.winloss-by-game") ?? "Win/Loss by Game"}
          filters={appliedFilters}
          pageSize={20}
        />
      </div>
    </div>
  );
}

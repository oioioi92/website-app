"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/context";
import { useAdminApiContext } from "@/lib/admin-api-context";
import type { ReportApiResponse, ReportColumn } from "@/lib/backoffice/report-api-types";
import { getReportFilterSchema, isRecordsReport } from "@/lib/backoffice/report-filters-schema";
import { RECORDS_STATUS_OPTIONS, TX_TYPE_ALL_OPTIONS, TX_TYPE_LEDGER_OPTIONS } from "@/lib/backoffice/filter-options";

const inputClass =
  "h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 min-w-0";
const labelClass = "mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500";

type ReportTableFromApiProps = {
  reportKey: string;
  title: string;
  description?: string;
  /** 可选：额外筛选参数，会拼到 API 请求 */
  extraParams?: Record<string, string>;
};

const SUPPORTED_KEYS = ["all-transactions", "ledger-transactions", "hourly-sales", "winloss-by-game", "winloss-by-player", "bonus-cost", "user-kpi", "gateway-search", "reconciliation", "top-referrer"];

export function ReportTableFromApi({ reportKey, title, description, extraParams = {} }: ReportTableFromApiProps) {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [data, setData] = useState<ReportApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [userId, setUserId] = useState("");
  const [txType, setTxType] = useState(extraParams.txType ?? "ALL");
  useEffect(() => {
    if (extraParams.txType !== undefined) {
      setTxType(extraParams.txType);
      load({ txType: extraParams.txType });
    }
  }, [extraParams.txType]);
  const [status, setStatus] = useState("ALL");
  const [externalRef, setExternalRef] = useState("");
  const [provider, setProvider] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle");

  function buildQueryParams(overrides?: { txType?: string; forCsv?: boolean; page?: number }) {
    const sp = new URLSearchParams(extraParams);
    const currentPage = overrides?.page ?? page;
    sp.set("page", overrides?.forCsv ? "1" : String(currentPage));
    sp.set("pageSize", overrides?.forCsv ? "5000" : String(pageSize));
    if (dateFrom) sp.set("dateFrom", dateFrom);
    if (dateTo) sp.set("dateTo", dateTo);
    if (date && reportKey === "hourly-sales") sp.set("date", date);
    if (userId) sp.set("userId", userId);
    const effectiveTxType = overrides?.txType ?? txType;
    if (effectiveTxType && effectiveTxType !== "ALL") sp.set("txType", effectiveTxType);
    if (isRecordsReport(reportKey) && status !== "ALL") sp.set("status", status);
    if (externalRef) sp.set("externalRef", externalRef);
    if (reportKey === "winloss-by-game" || reportKey === "winloss-by-player" || reportKey === "bonus-cost" || reportKey === "user-kpi" || reportKey === "reconciliation") {
      if (dateFrom) sp.set("from", dateFrom);
      if (dateTo) sp.set("to", dateTo);
    }
    if (reportKey === "gateway-search" && externalRef) sp.set("reference", externalRef);
    if (reportKey === "winloss-by-game") {
      if (provider) sp.set("provider", provider);
      if (gameCode) sp.set("gameCode", gameCode);
    }
    if (overrides?.forCsv) sp.set("format", "csv");
    return sp;
  }

  function load(overrides?: { txType?: string; page?: number }) {
    setLoading(true);
    setError(null);
    const sp = buildQueryParams(overrides);
    fetch(`/api/admin/reports/query/${reportKey}?${sp}`)
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        if (!r.ok) throw new Error(r.status === 404 ? t("admin.reports.reportNotFound") : t("admin.reports.requestFailed"));
        return r.json();
      })
      .then((d: ReportApiResponse) => setData(d))
      .catch((e) => setError(e.message ?? String(e)))
      .finally(() => setLoading(false));
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    load({ page: nextPage });
  }

  function exportCsv() {
    setExporting(true);
    setExportStatus("idle");
    const sp = buildQueryParams({ forCsv: true });
    fetch(`/api/admin/reports/query/${reportKey}?${sp}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        if (!r.ok) throw new Error("Export failed");
        return r.blob();
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportKey}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setExportStatus("success");
        setTimeout(() => setExportStatus("idle"), 3000);
      })
      .catch(() => {
        setExportStatus("error");
        setError(t("admin.reports.exportCsvFailed"));
        setTimeout(() => setExportStatus("idle"), 3000);
      })
      .finally(() => setExporting(false));
  }

  useEffect(() => {
    if (!SUPPORTED_KEYS.includes(reportKey)) return;
    if (extraParams.txType !== undefined) return;
    load();
  }, [reportKey]);

  if (!SUPPORTED_KEYS.includes(reportKey)) {
    return (
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
        <p>{t("admin.reports.reportNotSupported").replace("{reportKey}", reportKey)}</p>
      </div>
    );
  }

  const isLedgerOrAll = reportKey === "all-transactions" || reportKey === "ledger-transactions";
  const isHourly = reportKey === "hourly-sales";
  const isSimpleRange = reportKey === "winloss-by-game" || reportKey === "winloss-by-player" || reportKey === "bonus-cost" || reportKey === "user-kpi";
  const isGatewaySearch = reportKey === "gateway-search";
  const isReconciliation = reportKey === "reconciliation";

  return (
    <div className="mt-6 space-y-6">
      <section className="admin-card px-5 py-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--compact-muted)]">{t("admin.common.filterConditions")}</h2>
        {isLedgerOrAll && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-5">
            <div>
              <label className={labelClass}>{t("admin.reports.dateFrom")}</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
            </div>
            <div>
              <label className={labelClass}>{t("admin.reports.dateTo")}</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
            </div>
            <div>
              <label className={labelClass}>{t("admin.reports.userId")}</label>
              <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder={t("admin.reports.userId")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("admin.reports.type")}</label>
              <select value={txType} onChange={(e) => setTxType(e.target.value)} className={inputClass}>
                {(reportKey === "ledger-transactions" ? TX_TYPE_LEDGER_OPTIONS : TX_TYPE_ALL_OPTIONS).map((o) => (
                  <option key={o.value} value={o.value}>{o.value === "ALL" ? t("admin.common.all") : o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t("admin.reports.status")}</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                {RECORDS_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.value === "ALL" ? t("admin.common.all") : o.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>{t("admin.reports.reference")}</label>
              <input type="text" value={externalRef} onChange={(e) => setExternalRef(e.target.value)} placeholder={t("admin.reports.reference")} className={inputClass} />
            </div>
          </div>
        )}
        {isHourly && (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className={labelClass}>{t("admin.reports.date")}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
            </div>
            <button type="button" onClick={() => { setPage(1); load({ page: 1 }); }} className="admin-compact-btn admin-compact-btn-primary">{t("admin.common.search")}</button>
          </div>
        )}
        {isSimpleRange && (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className={labelClass}>{t("admin.reports.from")}</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
            </div>
            <div>
              <label className={labelClass}>{t("admin.reports.to")}</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
            </div>
            {reportKey === "winloss-by-game" && (
              <>
                <div>
                  <label className={labelClass}>{t("admin.reports.providerRequired")}</label>
                  <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder={t("admin.reports.providerRequired")} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("admin.reports.gameCodeOptional")}</label>
                  <input type="text" value={gameCode} onChange={(e) => setGameCode(e.target.value)} placeholder={t("admin.reports.gameCodeOptional")} className={inputClass} />
                </div>
              </>
            )}
            {reportKey === "user-kpi" && (
              <div>
                <label className={labelClass}>{t("admin.reports.userId")}</label>
                <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder={t("admin.reports.userId")} className={inputClass} />
              </div>
            )}
            <button type="button" onClick={() => { setPage(1); load({ page: 1 }); }} className="admin-compact-btn admin-compact-btn-primary">{t("admin.common.search")}</button>
          </div>
        )}
        {isGatewaySearch && (
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px]">
              <label className={labelClass}>{t("admin.reports.reference")}</label>
              <input type="text" value={externalRef} onChange={(e) => setExternalRef(e.target.value)} placeholder={t("admin.reports.reference")} className={inputClass} />
            </div>
            <button type="button" onClick={() => { setPage(1); load({ page: 1 }); }} className="admin-compact-btn admin-compact-btn-primary">{t("admin.common.search")}</button>
          </div>
        )}
        {isReconciliation && (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className={labelClass}>{t("admin.reports.from")}</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
            </div>
            <div>
              <label className={labelClass}>{t("admin.reports.to")}</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
            </div>
            <button type="button" onClick={() => { setPage(1); load({ page: 1 }); }} className="admin-compact-btn admin-compact-btn-primary">{t("admin.common.search")}</button>
          </div>
        )}
        {isLedgerOrAll && (
          <div className="mt-3">
            <button type="button" onClick={() => { setPage(1); load({ page: 1 }); }} className="admin-compact-btn admin-compact-btn-primary">{t("admin.common.search")}</button>
          </div>
        )}
      </section>

      {data && data.summary && Object.keys(data.summary).length > 0 && (
        <div className="admin-card flex flex-wrap items-center justify-between gap-4 px-5 py-3 bg-[var(--compact-table-header)]">
          {Object.entries(data.summary).map(([k, v]) => (
            <span key={k} className="text-[13px] font-medium tabular-nums text-[var(--compact-text)]">
              {k}: {typeof v === "number" ? v.toFixed(2) : v}
            </span>
          ))}
        </div>
      )}

      <section className="admin-card overflow-x-auto">
        <div className="border-b border-[var(--compact-table-border)] px-4 py-2 flex items-center justify-between bg-[var(--compact-table-header)]">
          <span className="text-[13px] font-semibold text-[var(--compact-text)]">{title}</span>
          <div className="flex items-center gap-2 flex-wrap">
            {data && data.rows.length > 0 && (
              <button type="button" onClick={exportCsv} disabled={exporting} className="admin-compact-btn admin-compact-btn-ghost text-xs disabled:opacity-60">
                {exporting ? (t("admin.reports.exporting") ?? "导出中…") : t("admin.reports.exportCsv")}
              </button>
            )}
            {exportStatus === "success" && <span className="text-xs text-emerald-600">{t("admin.reports.exportSuccess") ?? "导出成功"}</span>}
            {exportStatus === "error" && <span className="text-xs text-red-600">{t("admin.reports.exportCsvFailed")}</span>}
            {data && (
              <span className="text-xs text-[var(--compact-muted)]">
                {t("admin.transactions.totalCountPage").replace("{n}", String(data.rows.length))}
                {typeof data.summary?.total_count === "number" && ` / ${(t("admin.reports.totalRecords") ?? "共 {n} 条").replace("{n}", String(data.summary.total_count))}`}
              </span>
            )}
          </div>
        </div>
        {loading ? (
          <div className="py-12 text-center text-[13px] text-[var(--compact-muted)]">{t("admin.common.loading")}</div>
        ) : error ? (
          <div className="py-12 text-center text-[13px] text-[var(--compact-danger)]">{error}</div>
        ) : !data ? (
          <div className="py-12 text-center text-[13px] text-[var(--compact-muted)]">{t("admin.reports.clickSearch")}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {(data.columns as ReportColumn[]).map((col) => (
                  <th
                    key={col.key}
                    className={col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td colSpan={data.columns.length} className="py-8 text-center text-[var(--compact-muted)]">
                    {t("admin.common.noRecords")}
                  </td>
                </tr>
              ) : (
                data.rows.map((row, i) => (
                  <tr key={i}>
                    {(data.columns as ReportColumn[]).map((col) => (
                      <td
                        key={col.key}
                        className={`${col.align === "right" ? "num text-right" : col.align === "center" ? "text-center" : "text-left"} ${col.key === "amount" && Number(row[col.key]) < 0 ? "negative" : ""}`}
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
        {data && data.rows.length > 0 && typeof data.summary?.total_count === "number" && data.summary.total_count > pageSize && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-[var(--compact-table-border)] bg-[var(--compact-table-header)]">
            <span className="text-xs text-[var(--compact-muted)]">
              {t("admin.common.pageOfTotal")?.replace("{n}", String(page)).replace("{m}", String(Math.ceil((data.summary.total_count as number) / pageSize))) ?? `第 ${page} 页，共 ${Math.ceil((data.summary.total_count as number) / pageSize)} 页`}
            </span>
            <div className="flex gap-1">
              <button type="button" disabled={page <= 1} onClick={() => goToPage(page - 1)} className="admin-compact-btn admin-compact-btn-ghost text-xs disabled:opacity-50">
                {t("admin.common.prevPage")}
              </button>
              <button type="button" disabled={page >= Math.ceil((data.summary.total_count as number) / pageSize)} onClick={() => goToPage(page + 1)} className="admin-compact-btn admin-compact-btn-ghost text-xs disabled:opacity-50">
                {t("admin.common.nextPage")}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function formatCell(value: unknown, key: string): string {
  if (value == null) return "—";
  if (typeof value === "number") return key === "amount" || key.endsWith("_total") || key.endsWith("_count") ? value.toFixed(2) : String(value);
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

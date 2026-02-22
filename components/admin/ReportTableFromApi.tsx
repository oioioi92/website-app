"use client";

import { useEffect, useState } from "react";
import type { ReportApiResponse, ReportColumn } from "@/lib/backoffice/report-api-types";

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

const SUPPORTED_KEYS = ["all-transactions", "ledger-transactions", "hourly-sales", "winloss-by-game", "bonus-cost", "user-kpi"];

export function ReportTableFromApi({ reportKey, title, description, extraParams = {} }: ReportTableFromApiProps) {
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
  const [page, setPage] = useState(1);
  const pageSize = 20;

  function load(overrides?: { txType?: string }) {
    setLoading(true);
    setError(null);
    const sp = new URLSearchParams(extraParams);
    sp.set("page", String(page));
    sp.set("pageSize", String(pageSize));
    if (dateFrom) sp.set("dateFrom", dateFrom);
    if (dateTo) sp.set("dateTo", dateTo);
    if (date && (reportKey === "hourly-sales")) sp.set("date", date);
    if (userId) sp.set("userId", userId);
    const effectiveTxType = overrides?.txType ?? txType;
    if (effectiveTxType && effectiveTxType !== "ALL") sp.set("txType", effectiveTxType);
    if (status !== "ALL") sp.set("status", status);
    if (externalRef) sp.set("externalRef", externalRef);
    if (reportKey === "winloss-by-game" || reportKey === "bonus-cost" || reportKey === "user-kpi") {
      if (dateFrom) sp.set("from", dateFrom);
      if (dateTo) sp.set("to", dateTo);
    }
    fetch(`/api/admin/reports/query/${reportKey}?${sp}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "报表不存在" : "请求失败");
        return r.json();
      })
      .then((d: ReportApiResponse) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!SUPPORTED_KEYS.includes(reportKey)) return;
    if (extraParams.txType !== undefined) return;
    load();
  }, [reportKey]);

  if (!SUPPORTED_KEYS.includes(reportKey)) {
    return (
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
        <p>报表「{reportKey}」尚未接入。</p>
      </div>
    );
  }

  const isLedgerOrAll = reportKey === "all-transactions" || reportKey === "ledger-transactions";
  const isHourly = reportKey === "hourly-sales";
  const isSimpleRange = reportKey === "winloss-by-game" || reportKey === "bonus-cost" || reportKey === "user-kpi";

  return (
    <div className="mt-6 space-y-6">
      <section className="admin-card px-5 py-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--compact-muted)]">筛选条件</h2>
        {isLedgerOrAll && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-5">
            <div>
              <label className={labelClass}>Date From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
            </div>
            <div>
              <label className={labelClass}>Date To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
            </div>
            <div>
              <label className={labelClass}>User ID</label>
              <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select value={txType} onChange={(e) => setTxType(e.target.value)} className={inputClass}>
                <option value="ALL">全部</option>
                <option value="DEPOSIT">DEPOSIT</option>
                <option value="WITHDRAW">WITHDRAW</option>
                <option value="BONUS_GRANTED">BONUS_GRANTED</option>
                <option value="BONUS_USED">BONUS_USED</option>
                <option value="TRANSFER_INTERNAL">TRANSFER</option>
                <option value="GAME_BET">GAME_BET</option>
                <option value="MANUAL_ADJUST">ADJUST</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                <option value="ALL">全部</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="BURNED">BURNED</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Reference</label>
              <input type="text" value={externalRef} onChange={(e) => setExternalRef(e.target.value)} placeholder="External ref" className={inputClass} />
            </div>
          </div>
        )}
        {isHourly && (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
            </div>
            <button type="button" onClick={() => load()} className="admin-compact-btn admin-compact-btn-primary">SEARCH</button>
          </div>
        )}
        {isSimpleRange && (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className={labelClass}>From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
            </div>
            <div>
              <label className={labelClass}>To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={`${inputClass} [color-scheme:light]`} />
            </div>
            {reportKey === "user-kpi" && (
              <div>
                <label className={labelClass}>User ID</label>
                <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" className={inputClass} />
              </div>
            )}
            <button type="button" onClick={() => load()} className="admin-compact-btn admin-compact-btn-primary">SEARCH</button>
          </div>
        )}
        {isLedgerOrAll && (
          <div className="mt-3">
            <button type="button" onClick={() => load()} className="admin-compact-btn admin-compact-btn-primary">SEARCH</button>
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
          {data && <span className="text-xs text-[var(--compact-muted)]">共 {data.rows.length} 笔（本页）</span>}
        </div>
        {loading ? (
          <div className="py-12 text-center text-[13px] text-[var(--compact-muted)]">加载中…</div>
        ) : error ? (
          <div className="py-12 text-center text-[13px] text-[var(--compact-danger)]">{error}</div>
        ) : !data ? (
          <div className="py-12 text-center text-[13px] text-[var(--compact-muted)]">请点击 SEARCH 查询</div>
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
                    无记录
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

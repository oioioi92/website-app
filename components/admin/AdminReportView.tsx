"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { LEGACY_REPORT_STATUS_OPTIONS } from "@/lib/backoffice/filter-options";

type Col = { key: string; labelKey: string; align?: "left" | "right" };

const REPORT_COLUMNS: Record<string, Col[]> = {
  "win-lose": [
    { key: "agentId", labelKey: "admin.reportView.colAgent", align: "left" },
    { key: "stake", labelKey: "admin.reportView.colStake", align: "right" },
    { key: "validRollover", labelKey: "admin.reportView.colValidRollover", align: "right" },
    { key: "winLose", labelKey: "admin.reportView.colWinLose", align: "right" },
    { key: "count", labelKey: "admin.reportView.colCount", align: "right" }
  ],
  "win-lose-by-games": [
    { key: "game", labelKey: "admin.reportView.colGame", align: "left" },
    { key: "stake", labelKey: "admin.reportView.colStake", align: "right" },
    { key: "winLose", labelKey: "admin.reportView.colWinLose", align: "right" },
    { key: "count", labelKey: "admin.reportView.colCount", align: "right" }
  ],
  "wallet-transfer": [
    { key: "time", labelKey: "admin.reportView.colTime", align: "left" },
    { key: "userId", labelKey: "admin.reportView.colPlayer", align: "left" },
    { key: "type", labelKey: "admin.reportView.colType", align: "left" },
    { key: "amount", labelKey: "admin.reportView.colAmount", align: "right" },
    { key: "status", labelKey: "admin.reportView.colStatus", align: "left" }
  ],
  "game-logs": [
    { key: "time", labelKey: "admin.reportView.colTime", align: "left" },
    { key: "userId", labelKey: "admin.reportView.colPlayer", align: "left" },
    { key: "game", labelKey: "admin.reportView.colGame", align: "left" },
    { key: "action", labelKey: "admin.reportView.colAction", align: "left" },
    { key: "detail", labelKey: "admin.reportView.colDetail", align: "left" }
  ],
  sales: [
    { key: "date", labelKey: "admin.reportView.colDate", align: "left" },
    { key: "channel", labelKey: "admin.reportView.colChannel", align: "left" },
    { key: "amount", labelKey: "admin.reportView.colAmount", align: "right" },
    { key: "count", labelKey: "admin.reportView.colCount", align: "right" }
  ],
  "sales-cash-web": [
    { key: "date", labelKey: "admin.reportView.colDate", align: "left" },
    { key: "channel", labelKey: "admin.reportView.colChannel", align: "left" },
    { key: "amount", labelKey: "admin.reportView.colAmount", align: "right" },
    { key: "count", labelKey: "admin.reportView.colCount", align: "right" }
  ],
  "sales-graph": [
    { key: "date", labelKey: "admin.reportView.colDate", align: "left" },
    { key: "channel", labelKey: "admin.reportView.colChannel", align: "left" },
    { key: "amount", labelKey: "admin.reportView.colAmount", align: "right" },
    { key: "count", labelKey: "admin.reportView.colCount", align: "right" }
  ],
  transactions: [
    { key: "time", labelKey: "admin.reportView.colTime", align: "left" },
    { key: "userId", labelKey: "admin.reportView.colPlayer", align: "left" },
    { key: "type", labelKey: "admin.reportView.colType", align: "left" },
    { key: "amount", labelKey: "admin.reportView.colAmount", align: "right" },
    { key: "status", labelKey: "admin.reportView.colStatus", align: "left" }
  ],
  "promotion-claim": [
    { key: "time", labelKey: "admin.reportView.colTime", align: "left" },
    { key: "userId", labelKey: "admin.reportView.colPlayer", align: "left" },
    { key: "promo", labelKey: "admin.reportView.colPromo", align: "left" },
    { key: "amount", labelKey: "admin.reportView.colAmount", align: "right" },
    { key: "status", labelKey: "admin.reportView.colStatus", align: "left" }
  ]
};

const INPUT_CLASS =
  "rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] font-medium text-slate-800 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 min-w-0";
const LABEL_CLASS = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

type AdminReportViewProps = { reportKey: string; title: string };

type DetailTab = "bet" | "game" | "transaction" | "rollover";

export function AdminReportView({ reportKey, title }: AdminReportViewProps) {
  const { t } = useLocale();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [agentId, setAgentId] = useState("");
  const [gameId, setGameId] = useState("");
  const [status, setStatus] = useState("ALL");
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailUser, setDetailUser] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("bet");

  const columns = REPORT_COLUMNS[reportKey] ?? [];
  const isWinLose = reportKey === "win-lose";

  function load() {
    setLoading(true);
    const sp = new URLSearchParams();
    sp.set("page", "1");
    sp.set("pageSize", "20");
    if (dateFrom) sp.set("dateFrom", dateFrom);
    if (dateTo) sp.set("dateTo", dateTo);
    if (agentId) sp.set("agentId", agentId);
    if (gameId) sp.set("gameId", gameId);
    if (status !== "ALL") sp.set("status", status);
    fetch(`/api/admin/reports/${reportKey}?${sp}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [reportKey]);

  return (
    <div className="mt-4">
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className={LABEL_CLASS}>{t("admin.reports.dateFrom")}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`${INPUT_CLASS} [color-scheme:light]`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>{t("admin.reports.dateTo")}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`${INPUT_CLASS} [color-scheme:light]`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>{t("admin.reports.agent")}</label>
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder={t("admin.reports.agentIdPlaceholder")}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>{t("admin.reports.game")}</label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder={t("admin.reports.gameIdPlaceholder")}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>{t("admin.reports.status")}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`${INPUT_CLASS} min-w-[120px]`}
            >
              {LEGACY_REPORT_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.value === "ALL" ? t("admin.common.all") : o.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-lg bg-sky-500 px-5 py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          >
            {t("admin.reports.filterBtn")}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">{t("admin.common.loading")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/90">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3.5 text-[13px] font-semibold uppercase tracking-wide text-slate-800 ${
                      col.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {t(col.labelKey)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                    {t("admin.reports.noData")}
                  </td>
                </tr>
              ) : (
                items.map((row, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                    {columns.map((col) => {
                      const val = (row as Record<string, unknown>)[col.key];
                      const isAgentCol = isWinLose && col.key === "agentId";
                      return (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-[15px] font-medium text-slate-900 ${
                            col.align === "right" ? "text-right tabular-nums" : "text-left"
                          }`}
                        >
                          {isAgentCol ? (
                            <button
                              type="button"
                              onClick={() => {
                                setDetailUser(String(val ?? ""));
                                setDetailTab("bet");
                              }}
                              className="flex items-center gap-2 text-left text-sky-600 hover:text-sky-800 hover:underline"
                              title={t("admin.reportView.viewDetailTitle")}
                            >
                              <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              {String(val ?? "—")}
                            </button>
                          ) : (
                            String(val ?? "—")
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isWinLose && detailUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" aria-hidden onClick={() => setDetailUser(null)} />
          <div className="relative flex w-full max-w-lg flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-base font-semibold text-slate-800">{detailUser} — {t("admin.reportView.detailTitle")}</h3>
              <button type="button" onClick={() => setDetailUser(null)} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label={t("admin.reportView.close")}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex border-b border-slate-200 px-2 flex-wrap">
              {(["bet", "game", "transaction", "rollover"] as const).map((tab) => (
                <button key={tab} type="button" onClick={() => setDetailTab(tab)} className={`px-4 py-3 text-sm font-medium ${detailTab === tab ? "border-b-2 border-sky-500 text-sky-600" : "text-slate-500 hover:text-slate-700"}`}>
                  {tab === "bet" ? t("admin.reportView.tabBetHistory") : tab === "game" ? t("admin.reportView.tabGameLog") : tab === "transaction" ? t("admin.reportView.tabTransactionHistory") : t("admin.reportView.tabRolloverDetail")}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {detailTab === "bet" && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">{t("admin.reportView.betHistoryTitle")}</p>
                  <p className="text-sm text-slate-500">{t("admin.reportView.betHistoryPending")}</p>
                  <Link href="/admin/reports/winloss-by-game" className="mt-2 inline-block text-sm font-medium text-sky-600 hover:underline">{t("admin.reports.openWinlossByGame")}</Link>
                  <div className="mt-3 rounded-lg border border-slate-200 overflow-x-auto"><table className="min-w-full text-xs"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left font-medium text-slate-700">{t("admin.reportView.colTime")}</th><th className="px-3 py-2 text-left font-medium text-slate-700">{t("admin.reportView.colGame")}</th><th className="px-3 py-2 text-right font-medium text-slate-700">{t("admin.reportView.colStake")}</th><th className="px-3 py-2 text-right font-medium text-slate-700">{t("admin.reportView.colWinLose")}</th></tr></thead><tbody><tr><td colSpan={4} className="px-3 py-4 text-center text-slate-400">{t("admin.reportView.noData")}</td></tr></tbody></table></div>
                </div>
              )}
              {detailTab === "game" && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">{t("admin.reportView.gameLogTitle")}</p>
                  <p className="text-sm text-slate-500">{t("admin.reportView.gameLogPending")}</p>
                  <Link href="/admin/reports/winloss-by-game" className="mt-2 inline-block text-sm font-medium text-sky-600 hover:underline">{t("admin.reports.openWinlossByGame")}</Link>
                  <div className="mt-3 rounded-lg border border-slate-200 overflow-x-auto"><table className="min-w-full text-xs"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left font-medium text-slate-700">{t("admin.reportView.colTime")}</th><th className="px-3 py-2 text-left font-medium text-slate-700">{t("admin.reportView.colAction")}</th><th className="px-3 py-2 text-left font-medium text-slate-700">{t("admin.reportView.colDetail")}</th></tr></thead><tbody><tr><td colSpan={3} className="px-3 py-4 text-center text-slate-400">{t("admin.reportView.noData")}</td></tr></tbody></table></div>
                </div>
              )}
              {detailTab === "transaction" && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">{t("admin.reportView.transactionHistoryTitle")}</p>
                  <p className="text-sm text-slate-500">{t("admin.reportView.transactionHistoryPending")}</p>
                  <Link href="/admin/transactions" className="mt-2 inline-block text-sm font-medium text-sky-600 hover:underline">{t("admin.reports.openUnifiedLedger")}</Link>
                  <div className="mt-3 rounded-lg border border-slate-200 overflow-x-auto"><table className="min-w-full text-xs"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left font-medium text-slate-700">{t("admin.reportView.colTime")}</th><th className="px-3 py-2 text-left font-medium text-slate-700">{t("admin.reportView.colType")}</th><th className="px-3 py-2 text-right font-medium text-slate-700">{t("admin.reportView.colAmount")}</th><th className="px-3 py-2 text-left font-medium text-slate-700">{t("admin.reportView.colStatus")}</th></tr></thead><tbody><tr><td colSpan={4} className="px-3 py-4 text-center text-slate-400">{t("admin.reportView.noData")}</td></tr></tbody></table></div>
                </div>
              )}
              {detailTab === "rollover" && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">{t("admin.reportView.rolloverReportTitle")}</p>
                  <p className="text-sm text-slate-500 mb-3">{t("admin.reportView.rolloverSummaryDesc")}</p>
                  <Link href="/admin/reports/winloss-by-game" className="mb-3 inline-block text-sm font-medium text-sky-600 hover:underline">{t("admin.reports.openWinlossByGame")}</Link>
                  <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500 mb-2">{t("admin.reportView.rolloverSummary")}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-600">{t("admin.reportView.turnoverRequired")}</span><span className="text-right font-medium tabular-nums">—</span>
                      <span className="text-slate-600">{t("admin.reportView.completedTurnover")}</span><span className="text-right font-medium tabular-nums text-sky-600">—</span>
                      <span className="text-slate-600">{t("admin.reportView.progress")}</span><span className="text-right font-medium">—</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">{t("admin.reportView.turnoverByGamePromo")}</p>
                  <div className="rounded-lg border border-slate-200 overflow-x-auto"><table className="min-w-full text-xs"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left font-medium text-slate-700">{t("admin.reportView.colSource")}</th><th className="px-3 py-2 text-left font-medium text-slate-700">{t("admin.reportView.colType")}</th><th className="px-3 py-2 text-right font-medium text-slate-700">{t("admin.reportView.colStake")}</th><th className="px-3 py-2 text-right font-medium text-slate-700">{t("admin.reportView.colValidRollover")}</th><th className="px-3 py-2 text-left font-medium text-slate-700">{t("admin.reportView.colStatus")}</th></tr></thead><tbody><tr><td colSpan={5} className="px-3 py-4 text-center text-slate-400">{t("admin.reportView.noData")}</td></tr></tbody></table></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

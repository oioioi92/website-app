"use client";

import { useEffect, useState } from "react";

type Col = { key: string; label: string; align?: "left" | "right" };

const REPORT_COLUMNS: Record<string, Col[]> = {
  "win-lose": [
    { key: "agentId", label: "代理", align: "left" },
    { key: "stake", label: "投注额", align: "right" },
    { key: "validRollover", label: "有效流水", align: "right" },
    { key: "winLose", label: "输赢", align: "right" },
    { key: "count", label: "笔数", align: "right" }
  ],
  "win-lose-by-games": [
    { key: "game", label: "游戏", align: "left" },
    { key: "stake", label: "投注额", align: "right" },
    { key: "winLose", label: "输赢", align: "right" },
    { key: "count", label: "笔数", align: "right" }
  ],
  "wallet-transfer": [
    { key: "time", label: "时间", align: "left" },
    { key: "userId", label: "玩家", align: "left" },
    { key: "type", label: "类型", align: "left" },
    { key: "amount", label: "金额", align: "right" },
    { key: "status", label: "状态", align: "left" }
  ],
  "game-logs": [
    { key: "time", label: "时间", align: "left" },
    { key: "userId", label: "玩家", align: "left" },
    { key: "game", label: "游戏", align: "left" },
    { key: "action", label: "动作", align: "left" },
    { key: "detail", label: "详情", align: "left" }
  ],
  sales: [
    { key: "date", label: "日期", align: "left" },
    { key: "channel", label: "渠道", align: "left" },
    { key: "amount", label: "金额", align: "right" },
    { key: "count", label: "笔数", align: "right" }
  ],
  "sales-cash-web": [
    { key: "date", label: "日期", align: "left" },
    { key: "channel", label: "渠道", align: "left" },
    { key: "amount", label: "金额", align: "right" },
    { key: "count", label: "笔数", align: "right" }
  ],
  "sales-graph": [
    { key: "date", label: "日期", align: "left" },
    { key: "channel", label: "渠道", align: "left" },
    { key: "amount", label: "金额", align: "right" },
    { key: "count", label: "笔数", align: "right" }
  ],
  transactions: [
    { key: "time", label: "时间", align: "left" },
    { key: "userId", label: "玩家", align: "left" },
    { key: "type", label: "类型", align: "left" },
    { key: "amount", label: "金额", align: "right" },
    { key: "status", label: "状态", align: "left" }
  ],
  "promotion-claim": [
    { key: "time", label: "时间", align: "left" },
    { key: "userId", label: "玩家", align: "left" },
    { key: "promo", label: "优惠", align: "left" },
    { key: "amount", label: "金额", align: "right" },
    { key: "status", label: "状态", align: "left" }
  ]
};

const INPUT_CLASS =
  "rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[15px] font-medium text-slate-800 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 min-w-0";
const LABEL_CLASS = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

type AdminReportViewProps = { reportKey: string; title: string };

type DetailTab = "bet" | "game" | "transaction" | "rollover";

export function AdminReportView({ reportKey, title }: AdminReportViewProps) {
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
            <label className={LABEL_CLASS}>日期从</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`${INPUT_CLASS} [color-scheme:light]`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>日期到</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`${INPUT_CLASS} [color-scheme:light]`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>代理</label>
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="代理 ID"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>游戏</label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="游戏 ID"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>状态</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`${INPUT_CLASS} min-w-[120px]`}
            >
              <option value="ALL">全部</option>
              <option value="PENDING">PENDING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <button
            type="button"
            onClick={load}
            className="rounded-lg bg-sky-500 px-5 py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          >
            筛选
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">加载中…</p>
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
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                    暂无数据。对接官方游戏 API 后在此展示。
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
                              title="查看 Bet History / Game Log / Transaction History"
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
              <h3 className="text-base font-semibold text-slate-800">{detailUser} — 详情</h3>
              <button type="button" onClick={() => setDetailUser(null)} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700" aria-label="关闭">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex border-b border-slate-200 px-2 flex-wrap">
              {(["bet", "game", "transaction", "rollover"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setDetailTab(t)} className={`px-4 py-3 text-sm font-medium ${detailTab === t ? "border-b-2 border-sky-500 text-sky-600" : "text-slate-500 hover:text-slate-700"}`}>
                  {t === "bet" ? "Bet History" : t === "game" ? "Game Log" : t === "transaction" ? "Transaction History" : "Rollover 详细"}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {detailTab === "bet" && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Bet History（注单记录）</p>
                  <p className="text-sm text-slate-500">待对接 API 后在此展示该用户的注单列表。</p>
                  <div className="mt-3 rounded-lg border border-slate-200 overflow-x-auto"><table className="min-w-full text-xs"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left font-medium text-slate-700">时间</th><th className="px-3 py-2 text-left font-medium text-slate-700">游戏</th><th className="px-3 py-2 text-right font-medium text-slate-700">投注</th><th className="px-3 py-2 text-right font-medium text-slate-700">输赢</th></tr></thead><tbody><tr><td colSpan={4} className="px-3 py-4 text-center text-slate-400">暂无数据</td></tr></tbody></table></div>
                </div>
              )}
              {detailTab === "game" && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Game Log（游戏日志）</p>
                  <p className="text-sm text-slate-500">待对接 API 后在此展示该用户的游戏操作日志。</p>
                  <div className="mt-3 rounded-lg border border-slate-200 overflow-x-auto"><table className="min-w-full text-xs"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left font-medium text-slate-700">时间</th><th className="px-3 py-2 text-left font-medium text-slate-700">动作</th><th className="px-3 py-2 text-left font-medium text-slate-700">详情</th></tr></thead><tbody><tr><td colSpan={3} className="px-3 py-4 text-center text-slate-400">暂无数据</td></tr></tbody></table></div>
                </div>
              )}
              {detailTab === "transaction" && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Transaction History（交易记录）</p>
                  <p className="text-sm text-slate-500">待对接 API 后在此展示该用户的入款/提款等交易记录。</p>
                  <div className="mt-3 rounded-lg border border-slate-200 overflow-x-auto"><table className="min-w-full text-xs"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left font-medium text-slate-700">时间</th><th className="px-3 py-2 text-left font-medium text-slate-700">类型</th><th className="px-3 py-2 text-right font-medium text-slate-700">金额</th><th className="px-3 py-2 text-left font-medium text-slate-700">状态</th></tr></thead><tbody><tr><td colSpan={4} className="px-3 py-4 text-center text-slate-400">暂无数据</td></tr></tbody></table></div>
                </div>
              )}
              {detailTab === "rollover" && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Rollover 详细报告</p>
                  <p className="text-sm text-slate-500 mb-3">流水要求、已完成流水及按游戏/优惠的流水明细。待对接 API 后展示真实数据。</p>
                  <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                    <p className="text-xs font-semibold uppercase text-slate-500 mb-2">汇总</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-600">流水要求</span><span className="text-right font-medium tabular-nums">—</span>
                      <span className="text-slate-600">已完成流水</span><span className="text-right font-medium tabular-nums text-sky-600">—</span>
                      <span className="text-slate-600">进度</span><span className="text-right font-medium">—</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">按游戏 / 优惠的流水明细</p>
                  <div className="rounded-lg border border-slate-200 overflow-x-auto"><table className="min-w-full text-xs"><thead className="bg-slate-50"><tr><th className="px-3 py-2 text-left font-medium text-slate-700">来源</th><th className="px-3 py-2 text-left font-medium text-slate-700">类型</th><th className="px-3 py-2 text-right font-medium text-slate-700">投注额</th><th className="px-3 py-2 text-right font-medium text-slate-700">有效流水</th><th className="px-3 py-2 text-left font-medium text-slate-700">状态</th></tr></thead><tbody><tr><td colSpan={5} className="px-3 py-4 text-center text-slate-400">暂无数据</td></tr></tbody></table></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

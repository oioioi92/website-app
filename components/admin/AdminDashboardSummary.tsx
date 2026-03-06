"use client";

import { useEffect, useState } from "react";
import type { JSX } from "react";
import Link from "next/link";
import { useAdminApiContext } from "@/lib/admin-api-context";

type SummaryData = {
  newRegistration: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalSales: number;
  totalAngpao: number;
  totalBonus: number;
  rebates: number;
  rescue: number;
  gameSales: number;
  vipLevel: number;
  agentCommission: number;
  manualAdd: number;
  manualDeduct: number;
};

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function AdminDashboardSummary() {
  const { setForbidden } = useAdminApiContext();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    const from = dateFrom || toDateInputValue(new Date());
    const to = dateTo || toDateInputValue(new Date());
    setLoading(true);
    const sp = new URLSearchParams();
    sp.set("dateFrom", from);
    sp.set("dateTo", to);
    fetch(`/api/admin/summary?${sp}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }

  // 仅挂载时拉一次，避免依赖变化重复请求
  useEffect(() => {
    const today = toDateInputValue(new Date());
    setDateFrom(today);
    setDateTo(today);
    setLoading(true);
    const sp = new URLSearchParams();
    sp.set("dateFrom", today);
    sp.set("dateTo", today);
    fetch(`/api/admin/summary?${sp}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只跑一次
  }, []);

  const runSearch = () => load();

  const fmt = (n: number) => n.toFixed(2);
  const depParams = `?dateFrom=${dateFrom}&dateTo=${dateTo}`;

  return (
    <div className="admin-dashboard-summary mt-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="admin-dashboard-label">Summary From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="admin-dashboard-input"
          suppressHydrationWarning
        />
        <span className="text-sm text-slate-600">To</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          suppressHydrationWarning
        />
        <button
          type="button"
          onClick={runSearch}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard title="New Registration" value={`${data.newRegistration} ppl`} linkLabel="VIEW →" href="/admin/players" color="purple" icon="person" />
          <SummaryCard title="Total Deposit" value={`RM ${fmt(data.totalDeposit)}`} linkLabel="SUMMARY →" href={`/admin/deposits${depParams}`} color="green" icon="deposit" />
          <SummaryCard title="Total Withdraw" value={`RM ${fmt(data.totalWithdraw)}`} linkLabel="VIEW →" href="/admin/withdrawals" color="red" icon="withdraw" />
          <SummaryCard title="Total Sales" value={`RM ${fmt(data.totalSales)}`} color="blue" icon="chart" />
          <SummaryCard title="Total Angpao" value={`RM ${fmt(data.totalAngpao)}`} color="gold" icon="gift" />
          <SummaryCard title="Total Bonus" value={`RM ${fmt(data.totalBonus)}`} linkLabel="VIEW →" href="/admin/reports/bonus" color="amber" icon="gift" />
          <SummaryCard title="Rebates" value={`RM ${fmt(data.rebates)}`} color="teal" icon="rebate" />
          <SummaryCard title="Rescue" value={`RM ${fmt(data.rescue)}`} color="orange" icon="rescue" />
          <SummaryCard title="Game Sales" value={`RM ${fmt(data.gameSales)}`} linkLabel="VIEW →" href="/admin/reports/winloss-by-game" color="indigo" icon="game" />
          <SummaryCard title="VIP Level" value={`RM ${fmt(data.vipLevel)}`} color="pink" icon="vip" />
          <SummaryCard title="Agent Commission" value={`RM ${fmt(data.agentCommission)}`} color="cyan" icon="agent" />
          <SummaryCard title="Manual ADD" value={`RM ${fmt(data.manualAdd)}`} color="green" icon="plus" />
        </div>
      ) : (
        <p className="text-slate-500">无法加载汇总数据</p>
      )}
    </div>
  );
}

const COLOR_MAP: Record<string, { bg: string; icon: string; text: string; border: string }> = {
  green:  { bg: "bg-emerald-50",  icon: "bg-emerald-100 text-emerald-600", text: "text-emerald-700", border: "border-emerald-100" },
  red:    { bg: "bg-rose-50",     icon: "bg-rose-100 text-rose-600",       text: "text-rose-700",    border: "border-rose-100" },
  blue:   { bg: "bg-sky-50",      icon: "bg-sky-100 text-sky-600",         text: "text-sky-700",     border: "border-sky-100" },
  purple: { bg: "bg-violet-50",   icon: "bg-violet-100 text-violet-600",   text: "text-violet-700",  border: "border-violet-100" },
  amber:  { bg: "bg-amber-50",    icon: "bg-amber-100 text-amber-600",     text: "text-amber-700",   border: "border-amber-100" },
  gold:   { bg: "bg-yellow-50",   icon: "bg-yellow-100 text-yellow-600",   text: "text-yellow-700",  border: "border-yellow-100" },
  teal:   { bg: "bg-teal-50",     icon: "bg-teal-100 text-teal-600",       text: "text-teal-700",    border: "border-teal-100" },
  orange: { bg: "bg-orange-50",   icon: "bg-orange-100 text-orange-600",   text: "text-orange-700",  border: "border-orange-100" },
  indigo: { bg: "bg-indigo-50",   icon: "bg-indigo-100 text-indigo-600",   text: "text-indigo-700",  border: "border-indigo-100" },
  pink:   { bg: "bg-pink-50",     icon: "bg-pink-100 text-pink-600",       text: "text-pink-700",    border: "border-pink-100" },
  cyan:   { bg: "bg-cyan-50",     icon: "bg-cyan-100 text-cyan-600",       text: "text-cyan-700",    border: "border-cyan-100" },
};

const ICON_SVG: Record<string, JSX.Element> = {
  person:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  deposit:  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4M4 12H2m18 0h-2" />,
  withdraw: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V4m0 0l-4 4m4-4l4 4M4 12H2m18 0h-2" />,
  chart:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  gift:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />,
  game:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />,
  rebate:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
  rescue:   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
  vip:      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
  agent:    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  plus:     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
};

function SummaryCard({ title, value, linkLabel, href, color = "blue", icon = "chart" }: {
  title: string; value: string; linkLabel?: string; href?: string;
  color?: keyof typeof COLOR_MAP; icon?: keyof typeof ICON_SVG;
}) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.blue;
  return (
    <div className={`flex rounded-xl border ${c.border} ${c.bg} p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`mr-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.icon}`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {ICON_SVG[icon] ?? ICON_SVG.chart}
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <p className={`mt-0.5 text-lg font-bold ${c.text}`}>{value}</p>
        {linkLabel && href && (
          <Link href={href} className="mt-0.5 inline-block text-[11px] font-medium text-slate-400 hover:text-slate-600">
            {linkLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

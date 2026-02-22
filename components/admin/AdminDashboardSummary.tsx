"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const today = toDateInputValue(new Date());
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const sp = new URLSearchParams();
    sp.set("dateFrom", dateFrom);
    sp.set("dateTo", dateTo);
    fetch(`/api/admin/summary?${sp}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const runSearch = () => load();

  const fmt = (n: number) => n.toFixed(2);
  const depParams = `?dateFrom=${dateFrom}&dateTo=${dateTo}`;

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Summary From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
        <span className="text-sm text-slate-600">To</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
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
        <p className="text-slate-500">加载中…</p>
      ) : data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="New Registration"
            value={`${data.newRegistration} ppl`}
            linkLabel="(VIEW)"
            href="/admin/players"
            icon="person"
          />
          <SummaryCard
            title="Total Deposit"
            value={`RM ${fmt(data.totalDeposit)}`}
            linkLabel="(SUMMARY)"
            href={`/admin/deposits${depParams}`}
            icon="chart"
          />
          <SummaryCard
            title="Total Withdraw"
            value={`RM ${fmt(data.totalWithdraw)}`}
            linkLabel="(VIEW)"
            href="/admin/withdrawals"
            icon="chart"
          />
          <SummaryCard
            title="Total Sales"
            value={`RM ${fmt(data.totalSales)}`}
            icon="chart"
          />
          <SummaryCard
            title="Total Angpao"
            value={`RM ${fmt(data.totalAngpao)}`}
            linkLabel="(VIEW)"
            href="#"
            icon="chart"
          />
          <SummaryCard
            title="Total Bonus"
            value={`RM ${fmt(data.totalBonus)}`}
            linkLabel="(VIEW)"
            href="#"
            icon="chart"
          />
          <SummaryCard title="Rebates" value={`RM ${fmt(data.rebates)}`} icon="chart" />
          <SummaryCard title="Rescue" value={`RM ${fmt(data.rescue)}`} icon="chart" />
          <SummaryCard
            title="Game Sales"
            value={`RM ${fmt(data.gameSales)}`}
            linkLabel="(VIEW)"
            href="#"
            icon="chart"
          />
          <SummaryCard title="VIP Level" value={`RM ${fmt(data.vipLevel)}`} icon="chart" />
          <SummaryCard title="Agent Commission" value={`RM ${fmt(data.agentCommission)}`} icon="chart" />
          <SummaryCard title="Manual ADD" value={`RM ${fmt(data.manualAdd)}`} icon="chart" />
          <SummaryCard title="Manual DEDUCT" value={`RM ${fmt(data.manualDeduct)}`} icon="chart" />
        </div>
      ) : (
        <p className="text-slate-500">无法加载汇总数据</p>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  linkLabel,
  href,
  icon
}: {
  title: string;
  value: string;
  linkLabel?: string;
  href?: string;
  icon: "person" | "chart";
}) {
  return (
    <div className="flex rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
        {icon === "person" ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-1 text-xl font-bold text-sky-600">{value}</p>
        {linkLabel && href && (
          <p className="mt-1">
            <Link href={href} className="text-xs text-slate-400 hover:text-sky-600 hover:underline">
              {linkLabel}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

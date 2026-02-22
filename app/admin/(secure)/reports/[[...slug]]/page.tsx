import Link from "next/link";
import { AdminReportView } from "@/components/admin/AdminReportView";
import { ReportTransactionsDetail } from "@/components/admin/ReportTransactionsDetail";
import { ReportDailySummary } from "@/components/admin/ReportDailySummary";
import { ReportTableFromApi } from "@/components/admin/ReportTableFromApi";
import { ReportCenter } from "@/components/admin/ReportCenter";
import { SLUG_TO_TITLE, SLUG_TO_REPORT_KEY, SLUG_EXTRA_PARAMS } from "@/lib/backoffice/report-center-config";

export const dynamic = "force-dynamic";

/** 使用统一 API 格式（columns + rows + summary）的报表 */
const REPORT_CENTER_SLUGS = [
  "all-transactions",
  "deposit-report",
  "withdraw-report",
  "hourly-sales",
  "winloss-by-game",
  "winloss-by-player",
  "turnover-by-game",
  "bonus-transactions",
  "bonus-cost",
  "bonus-cost-summary",
  "transfer-report",
  "gateway-search",
  "reconciliation",
  "user-kpi"
];

export default async function AdminReportsPage({
  params
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const slugKey = slug?.[0] ?? "";
  const title = SLUG_TO_TITLE[slugKey] ?? "Reports";

  if (!slugKey) {
    return <ReportCenter />;
  }

  if (slugKey === "transactions-detail") {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">按 Transaction ID、客户、类型、日期、金额、状态筛选，方便员工操作</p>
        <ReportTransactionsDetail />
      </div>
    );
  }

  if (slugKey === "daily-summary") {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">按日查看入款笔数、入款金额、提款笔数、提款金额与净额</p>
        <ReportDailySummary />
      </div>
    );
  }

  if (slugKey === "reconciliation" || slugKey === "gateway-search") {
    return (
      <div>
        <h1 className="text-lg font-semibold text-[var(--compact-text)]">{title}</h1>
        <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">
          {slugKey === "reconciliation" ? "渠道/供应商/用户账务对账" : "按 external_ref 查询网关流水"}
        </p>
        <div className="admin-card mt-4 p-6">
          <p className="text-[13px] text-[var(--compact-text)] mb-4">
            {slugKey === "reconciliation"
              ? "对账数据可先在「统一流水」中按类型、日期、external_ref 筛选核对；对接对账 API 后此处可展示差异报表。"
              : "网关流水可在「统一流水」中按 Reference 筛选，或对接网关查询 API 后在此提供 external_ref 搜索。"}
          </p>
          <Link href="/admin/transactions" className="admin-compact-btn admin-compact-btn-primary">
            打开统一流水
          </Link>
        </div>
      </div>
    );
  }

  if (slugKey === "winloss-by-player" || slugKey === "turnover-by-game") {
    return (
      <div>
        <h1 className="text-lg font-semibold text-[var(--compact-text)]">{title}</h1>
        <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">按玩家输赢 / 按游戏流水</p>
        <div className="admin-card mt-4 p-6">
          <p className="text-[13px] text-[var(--compact-text)] mb-4">该报表待对接聚合 API，可先使用「按游戏输赢」查看游戏维度数据。</p>
          <Link href="/admin/reports/winloss-by-game" className="admin-compact-btn admin-compact-btn-primary">
            打开 Win/Loss by Game
          </Link>
        </div>
      </div>
    );
  }

  if (REPORT_CENTER_SLUGS.includes(slugKey)) {
    const reportKey = SLUG_TO_REPORT_KEY[slugKey] ?? slugKey;
    const extraParams = SLUG_EXTRA_PARAMS[slugKey] ?? {};
    return (
      <div>
        <h1 className="text-lg font-semibold text-[var(--compact-text)]">{title}</h1>
        <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">统一格式：columns + rows + summary</p>
        <ReportTableFromApi reportKey={reportKey} title={title} extraParams={extraParams} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">按日期、代理、游戏、状态筛选；数据待对接官方游戏 API</p>
      <AdminReportView reportKey={slugKey} title={title} />
    </div>
  );
}

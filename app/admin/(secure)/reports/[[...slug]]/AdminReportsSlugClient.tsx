"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { AdminReportView } from "@/components/admin/AdminReportView";
import { ReportTransactionsDetail } from "@/components/admin/ReportTransactionsDetail";
import { ReportDailySummary } from "@/components/admin/ReportDailySummary";
import { ReportTableFromApi } from "@/components/admin/ReportTableFromApi";
import { ReportCenter } from "@/components/admin/ReportCenter";
import { TransactionReportClient } from "@/components/admin/TransactionReportClient";
import { ReportPlaceholder } from "@/components/admin/ReportPlaceholder";
import { SLUG_TO_TITLE, SLUG_TO_REPORT_KEY, SLUG_EXTRA_PARAMS } from "@/lib/backoffice/report-center-config";

const REPORT_CENTER_SLUGS = [
  "transaction-report",
  "all-transactions",
  "deposit-report",
  "withdraw-report",
  "hourly-sales",
  "winloss-by-game",
  "winloss-by-player",
  "turnover-by-game",
  "bonus",
  "bonus-transactions",
  "bonus-cost",
  "bonus-cost-summary",
  "transfer-report",
  "gateway-search",
  "reconciliation",
  "bank",
  "user-kpi",
  "customer",
  "top-referrer",
  "promotion-report",
  "commission",
  "staff",
  "activity-log",
  "rebate-angpao",
  "manual",
  "feedback",
  "leaderboard",
  "referrer-click",
  "lucky-number",
  "lucky-draw-4d",
];

/** 报表中心中后端尚未实现的 slug，显示「即将推出」占位，避免 404 或报错（customer 映射 user-kpi 已实现，不占位） */
const PLACEHOLDER_REPORT_SLUGS: string[] = [
  "bank",
  "gateway-search",
  "winloss-by-player",
  "top-referrer",
  "promotion-report",
  "commission",
  "staff",
  "activity-log",
  "rebate-angpao",
  "manual",
  "feedback",
  "leaderboard",
  "referrer-click",
  "lucky-number",
  "lucky-draw-4d",
];

export function AdminReportsSlugClient() {
  const params = useParams<{ slug?: string[] }>();
  const slug = params?.slug;
  const slugKey = Array.isArray(slug) ? slug[0] ?? "" : "";
  const { t } = useLocale();
  const titleKey = `admin.reportTitle.${slugKey}`;
  const title = (t(titleKey) !== titleKey ? t(titleKey) : null) ?? SLUG_TO_TITLE[slugKey] ?? "Reports";

  if (!slugKey) {
    return <ReportCenter />;
  }

  if (slugKey === "transaction" || slugKey === "transaction-report") {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("admin.txReport.tableDesc")}</p>
        <TransactionReportClient />
      </div>
    );
  }

  if (PLACEHOLDER_REPORT_SLUGS.includes(slugKey)) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("admin.reportPlaceholder.comingSoon")}</p>
        <ReportPlaceholder title={title} />
      </div>
    );
  }

  if (slugKey === "transactions-detail") {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("admin.reports.transactionsDetailDesc")}</p>
        <ReportTransactionsDetail />
      </div>
    );
  }

  if (slugKey === "daily-summary") {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("admin.reports.dailySummaryDesc")}</p>
        <ReportDailySummary />
      </div>
    );
  }

  if (slugKey === "turnover-by-game") {
    return (
      <div>
        <h1 className="text-lg font-semibold text-[var(--compact-text)]">{title}</h1>
        <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">{t("admin.reports.winlossByPlayerDesc")}</p>
        <div className="admin-card mt-4 p-6">
          <p className="text-[13px] text-[var(--compact-text)] mb-4">{t("admin.reports.winlossByPlayerParagraph")}</p>
          <Link href="/admin/reports/winloss-by-game" className="admin-compact-btn admin-compact-btn-primary">
            {t("admin.reports.openWinlossByGame")}
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
        <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">{t("admin.reports.unifiedFormatSubtitle")}</p>
        <ReportTableFromApi reportKey={reportKey} title={title} extraParams={extraParams} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{t("admin.reports.filterByDesc")}</p>
      <AdminReportView reportKey={slugKey} title={title} />
    </div>
  );
}

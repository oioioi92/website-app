/**
 * Per-report filter schema.
 * Rules:
 * - Operations (workflow) => pending/approved/rejected + actions (not in this file; those are pages like deposits/pending).
 * - Records (raw lists) => status filter allowed read-only => all-transactions, ledger-transactions.
 * - Reports (aggregated analytics) => MUST NOT have pending/status; ONLY dimensions + time range.
 * Filter order: Time -> Provider -> Game -> Others.
 */

import { TX_TYPE_ALL_OPTIONS, TX_TYPE_LEDGER_OPTIONS, RECORDS_STATUS_OPTIONS } from "./filter-options";

export type FilterDef =
  | { key: string; type: "dateRange"; required: boolean }
  | { key: string; type: "date"; required: boolean }
  | { key: string; type: "select"; source?: string; required: boolean; options?: { value: string; label: string }[] }
  | { key: string; type: "text"; required: boolean; placeholder?: string };

export type ReportFilterSchema = {
  reportKey: string;
  category: "records" | "analytics" | "approval_analytics";
  filters: FilterDef[];
};

/** Records: raw transaction list. Status filter allowed (read-only). */
const RECORDS_ALL_TRANSACTIONS: ReportFilterSchema = {
  reportKey: "all-transactions",
  category: "records",
  filters: [
    { key: "dateRange", type: "dateRange", required: false },
    { key: "userId", type: "text", required: false, placeholder: "User ID" },
    { key: "txType", type: "select", required: false, options: TX_TYPE_ALL_OPTIONS },
    { key: "status", type: "select", required: false, options: RECORDS_STATUS_OPTIONS },
    { key: "externalRef", type: "text", required: false, placeholder: "Reference" }
  ]
};

/** Records: ledger list. Status filter allowed (read-only). */
const RECORDS_LEDGER: ReportFilterSchema = {
  reportKey: "ledger-transactions",
  category: "records",
  filters: [
    { key: "dateRange", type: "dateRange", required: false },
    { key: "userId", type: "text", required: false, placeholder: "User ID" },
    { key: "txType", type: "select", required: false, options: TX_TYPE_LEDGER_OPTIONS },
    { key: "status", type: "select", required: false, options: RECORDS_STATUS_OPTIONS },
    { key: "externalRef", type: "text", required: false, placeholder: "Reference" },
    { key: "provider", type: "text", required: false, placeholder: "Provider" },
    { key: "gameCode", type: "text", required: false, placeholder: "Game code" }
  ]
};

/** Analytics: hourly sales. NO status/pending. */
const ANALYTICS_HOURLY_SALES: ReportFilterSchema = {
  reportKey: "hourly-sales",
  category: "analytics",
  filters: [
    { key: "date", type: "date", required: true }
  ]
};

/** Analytics: Win/Loss by Game (Game Provider Report). dateRange + provider + game. NO status. */
const ANALYTICS_WINLOSS_BY_GAME: ReportFilterSchema = {
  reportKey: "winloss-by-game",
  category: "analytics",
  filters: [
    { key: "dateRange", type: "dateRange", required: true },
    { key: "provider", type: "text", required: true, placeholder: "Provider (required)" },
    { key: "gameCode", type: "text", required: false, placeholder: "Game code (optional, leave empty for all)" }
  ]
};

/** Analytics: Bonus cost. NO status. */
const ANALYTICS_BONUS_COST: ReportFilterSchema = {
  reportKey: "bonus-cost",
  category: "analytics",
  filters: [
    { key: "dateRange", type: "dateRange", required: true }
  ]
};

/** Analytics: User KPI. NO status. */
const ANALYTICS_USER_KPI: ReportFilterSchema = {
  reportKey: "user-kpi",
  category: "analytics",
  filters: [
    { key: "dateRange", type: "dateRange", required: true },
    { key: "userId", type: "text", required: false, placeholder: "User ID" }
  ]
};

export const REPORT_FILTER_SCHEMAS: ReportFilterSchema[] = [
  RECORDS_ALL_TRANSACTIONS,
  RECORDS_LEDGER,
  ANALYTICS_HOURLY_SALES,
  ANALYTICS_WINLOSS_BY_GAME,
  ANALYTICS_BONUS_COST,
  ANALYTICS_USER_KPI
];

const SCHEMA_BY_KEY = new Map(REPORT_FILTER_SCHEMAS.map((s) => [s.reportKey, s]));

export function getReportFilterSchema(reportKey: string): ReportFilterSchema | undefined {
  return SCHEMA_BY_KEY.get(reportKey);
}

/** True if this report is analytics (must NOT send status/pending to API). */
export function isAnalyticsReport(reportKey: string): boolean {
  const schema = SCHEMA_BY_KEY.get(reportKey);
  return schema?.category === "analytics" || schema?.category === "approval_analytics";
}

/** True if this report is records (may have status filter). */
export function isRecordsReport(reportKey: string): boolean {
  return SCHEMA_BY_KEY.get(reportKey)?.category === "records";
}

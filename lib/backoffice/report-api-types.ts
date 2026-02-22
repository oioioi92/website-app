/**
 * 报表 API 统一返回格式
 * 所有报表 API 返回 { report, columns, rows, summary }，前端用 columns 渲染表头，永不缺表头。
 */

export type ReportColumn = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
};

export type ReportSummary = {
  total_count?: number;
  deposit_total?: number;
  withdraw_total?: number;
  transfer_total?: number;
  bonus_total?: number;
  ggr_total?: number;
  ngr_total?: number;
  turnover_total?: number;
  [key: string]: number | string | undefined;
};

export type ReportApiResponse<TRow = Record<string, unknown>> = {
  report: string;
  columns: ReportColumn[];
  rows: TRow[];
  summary: ReportSummary;
};

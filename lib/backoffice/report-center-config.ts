/**
 * Report Center 菜单配置
 * 按模块分组：Funds / Game / Bonus / Wallet / Payment Gateway
 */

export type ReportItem = { label: string; slug: string };

export const REPORT_GROUPS: { title: string; items: ReportItem[] }[] = [
  {
    title: "Funds（资金进出）",
    items: [
      { label: "All Transactions（总流水查询）", slug: "all-transactions" },
      { label: "Deposit Report（入款）", slug: "deposit-report" },
      { label: "Withdraw Report（出款）", slug: "withdraw-report" }
    ]
  },
  {
    title: "Game（游戏业绩）",
    items: [
      { label: "Win/Loss by Game（按游戏输赢）", slug: "winloss-by-game" },
      { label: "Win/Loss by Player（按玩家输赢）", slug: "winloss-by-player" },
      { label: "Turnover by Game（按游戏流水）", slug: "turnover-by-game" }
    ]
  },
  {
    title: "Bonus（红利/赠送）",
    items: [
      { label: "Bonus Transactions（红利交易）", slug: "bonus-transactions" },
      { label: "Bonus Cost Summary（红利成本汇总）", slug: "bonus-cost-summary" }
    ]
  },
  {
    title: "Wallet / Transfer（转分）",
    items: [{ label: "Transfer Report（转分记录）", slug: "transfer-report" }]
  },
  {
    title: "Payment Gateway（渠道对账）",
    items: [
      { label: "Gateway Transaction Search（网关搜索）", slug: "gateway-search" },
      { label: "Reconciliation（对账）", slug: "reconciliation" }
    ]
  }
];

/** 员工操作 + 每日汇总（保留原有入口） */
export const LEGACY_REPORTS: ReportItem[] = [
  { label: "交易明细（员工操作）", slug: "transactions-detail" },
  { label: "每日汇总（进账/笔数）", slug: "daily-summary" }
];

export const SLUG_TO_TITLE: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const g of REPORT_GROUPS) for (const i of g.items) map[i.slug] = i.label;
  for (const i of LEGACY_REPORTS) map[i.slug] = i.label;
  Object.assign(map, {
    "hourly-sales": "Daily Sales",
    "bonus-cost": "Bonus Cost Summary",
    "user-kpi": "User KPI Daily"
  });
  return map;
})();

/** 前端 slug 到 API reportKey 的映射（不一致时使用） */
export const SLUG_TO_REPORT_KEY: Record<string, string> = {
  "bonus-cost-summary": "bonus-cost",
  "deposit-report": "ledger-transactions",
  "withdraw-report": "ledger-transactions",
  "bonus-transactions": "ledger-transactions",
  "transfer-report": "ledger-transactions"
};

/** 部分 slug 使用 ledger-transactions 时的默认筛选参数 */
export const SLUG_EXTRA_PARAMS: Record<string, Record<string, string>> = {
  "deposit-report": { txType: "DEPOSIT" },
  "withdraw-report": { txType: "WITHDRAW" },
  "bonus-transactions": { txType: "BONUS_GRANTED,BONUS_USED,BONUS_EXPIRED" },
  "transfer-report": { txType: "TRANSFER_INTERNAL,TRANSFER_TO_PROVIDER,TRANSFER_FROM_PROVIDER" }
};

/**
 * Report Center 目录：搜索关键字 + 卡片 + 分类
 */

export type ReportCard = {
  key: string;
  title: string;
  subtitle?: string;
  href: string;
  keywords: string[];
};

export type ReportCategory = {
  key: string;
  title: string;
  cards: ReportCard[];
};

export const REPORT_CATALOG: ReportCategory[] = [
  {
    key: "funds",
    title: "Funds",
    cards: [
      { key: "ledger-all", title: "All Transactions", subtitle: "总流水查询", href: "/admin/transactions?preset=all", keywords: ["transactions", "总流水", "ledger"] },
      { key: "depo", title: "Deposit Report", subtitle: "入款记录", href: "/admin/transactions?preset=deposit", keywords: ["deposit", "入款"] },
      { key: "with", title: "Withdraw Report", subtitle: "提款记录", href: "/admin/transactions?preset=withdraw", keywords: ["withdraw", "提款"] }
    ]
  },
  {
    key: "game",
    title: "Game",
    cards: [
      { key: "winloss-game", title: "Win/Loss by Game", subtitle: "按游戏输赢", href: "/admin/reports/winloss-by-game", keywords: ["winloss", "ggr", "按游戏", "输赢"] },
      { key: "user-kpi", title: "User KPI Daily", subtitle: "按用户日报", href: "/admin/reports/user-kpi", keywords: ["user", "kpi", "玩家", "日报"] }
    ]
  },
  {
    key: "bonus",
    title: "Bonus",
    cards: [
      { key: "bonus-tx", title: "Bonus Transactions", subtitle: "红利交易", href: "/admin/transactions?preset=bonus", keywords: ["bonus", "红利", "free credit"] },
      { key: "bonus-cost", title: "Bonus Cost Summary", subtitle: "红利成本汇总", href: "/admin/reports/bonus-cost", keywords: ["bonus cost", "成本", "汇总"] }
    ]
  },
  {
    key: "wallet",
    title: "Wallet / Transfer",
    cards: [
      { key: "transfer-report", title: "Transfer Report", subtitle: "转分记录", href: "/admin/transactions?preset=transfer", keywords: ["transfer", "转分"] },
      { key: "transfer-queue", title: "Transfer Queue", subtitle: "转分排队/卡单", href: "/admin/transfers", keywords: ["pending", "queue", "卡单"] }
    ]
  },
  {
    key: "gateway",
    title: "Payment Gateway",
    cards: [
      { key: "gateway-search", title: "Gateway Search", subtitle: "网关搜索", href: "/admin/reports/gateway-search", keywords: ["gateway", "external_ref", "网关"] },
      { key: "recon", title: "Reconciliation", subtitle: "对账", href: "/admin/reports/reconciliation", keywords: ["reconciliation", "对账", "差异"] }
    ]
  }
];

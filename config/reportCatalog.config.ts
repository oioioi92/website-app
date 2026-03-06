/**
 * 报表目录（已合并精简）
 * - Reconciliation 已在 Finance 中保留一项
 * - Customer 含 Top Customer；Promotion 含 Rebate；Finance 含 Bank + Gateway；Referral 合并；Lottery 合并；Engagement 合并
 */

export type ReportCard = {
  key: string;
  title: string;
  subtitle?: string;
  titleKey?: string;
  subtitleKey?: string;
  href: string;
  keywords: string[];
};

export type ReportCategory = {
  key: string;
  title: string;
  titleKey?: string;
  cards: ReportCard[];
};

export const REPORT_CATALOG: ReportCategory[] = [
  {
    key: "transaction",
    title: "Transaction",
    titleKey: "admin.reportCatalog.transaction",
    cards: [
      { key: "transaction-report", title: "Transaction Report", subtitle: "进出来源汇总", href: "/admin/reports/transaction", keywords: ["transaction", "report", "汇总"] },
      { key: "ledger-all", title: "All Transactions", subtitle: "总流水查询", titleKey: "admin.reportCatalog.ledgerAllTitle", subtitleKey: "admin.reportCatalog.ledgerAllSubtitle", href: "/admin/transactions?preset=all", keywords: ["transactions", "流水", "ledger"] },
      { key: "depo", title: "Deposit Report", subtitle: "入款记录", titleKey: "admin.reportCatalog.depoTitle", subtitleKey: "admin.reportCatalog.depoSubtitle", href: "/admin/transactions?preset=deposit", keywords: ["deposit", "入款"] },
      { key: "with", title: "Withdraw Report", subtitle: "提款记录", titleKey: "admin.reportCatalog.withTitle", subtitleKey: "admin.reportCatalog.withSubtitle", href: "/admin/transactions?preset=withdraw", keywords: ["withdraw", "提款"] },
    ],
  },
  {
    key: "customer",
    title: "Customer",
    titleKey: "admin.reportCatalog.customer",
    cards: [
      { key: "players", title: "Players", subtitle: "玩家列表", href: "/admin/players", keywords: ["customer", "player", "玩家"] },
      { key: "user-kpi", title: "User KPI", subtitle: "玩家日报 / 高价值客户", titleKey: "admin.reportCatalog.userKpiTitle", subtitleKey: "admin.reportCatalog.userKpiSubtitle", href: "/admin/reports/user-kpi", keywords: ["top", "customer", "kpi", "玩家"] },
    ],
  },
  {
    key: "promotion",
    title: "Promotion",
    titleKey: "admin.reportCatalog.promotion",
    cards: [
      { key: "promotions", title: "Promotions", subtitle: "优惠活动", href: "/admin/promotions", keywords: ["promotion", "优惠"] },
      { key: "bonus-tx", title: "Bonus Transactions", subtitle: "红利交易明细", titleKey: "admin.reportCatalog.bonusTxTitle", subtitleKey: "admin.reportCatalog.bonusTxSubtitle", href: "/admin/transactions?preset=bonus", keywords: ["bonus", "红利"] },
      { key: "bonus-cost", title: "Bonus Cost", subtitle: "红利成本汇总", titleKey: "admin.reportCatalog.bonusCostTitle", subtitleKey: "admin.reportCatalog.bonusCostSubtitle", href: "/admin/reports/bonus-cost", keywords: ["rebate", "bonus", "红利", "成本"] },
    ],
  },
  {
    key: "finance",
    title: "Finance",
    titleKey: "admin.reportCatalog.finance",
    cards: [
      { key: "bank-report", title: "Bank Report", subtitle: "银行汇总/对账", href: "/admin/reports/bank", keywords: ["bank", "银行"] },
      { key: "recon", title: "Reconciliation", subtitle: "对账差异", titleKey: "admin.reportCatalog.reconTitle", subtitleKey: "admin.reportCatalog.reconSubtitle", href: "/admin/reports/reconciliation", keywords: ["reconciliation", "对账"] },
      { key: "gateway-search", title: "Gateway Search", subtitle: "external_ref 搜索", titleKey: "admin.reportCatalog.gatewaySearchTitle", subtitleKey: "admin.reportCatalog.gatewaySearchSubtitle", href: "/admin/reports/gateway-search", keywords: ["gateway", "网关", "搜索"] },
    ],
  },
  {
    key: "referral",
    title: "Referral",
    titleKey: "admin.reportCatalog.commission",
    cards: [
      { key: "referrals", title: "Referrals", subtitle: "推荐人排行 / 下线", href: "/admin/referrals", keywords: ["referral", "推荐", "下线"] },
      { key: "referrer-click-placeholder", title: "Referrer Click", subtitle: "推荐链接点击", href: "/admin/reports/referrer-click", keywords: ["referrer", "click", "点击"] },
    ],
  },
  {
    key: "manual-other",
    title: "Manual / Other",
    titleKey: "admin.reportCatalog.manualOther",
    cards: [
      { key: "transfer-tx", title: "Transfer Report", subtitle: "转分记录", titleKey: "admin.reportCatalog.transferTxTitle", subtitleKey: "admin.reportCatalog.transferTxSubtitle", href: "/admin/transactions?preset=transfer", keywords: ["transfer", "转分", "manual"] },
      { key: "transfer-queue", title: "Transfer Queue", subtitle: "转分排队/卡单", titleKey: "admin.reportCatalog.transferQueueTitle", subtitleKey: "admin.reportCatalog.transferQueueSubtitle", href: "/admin/transfers", keywords: ["queue", "卡单"] },
    ],
  },
  {
    key: "lottery",
    title: "Lottery",
    titleKey: "admin.reportCatalog.lottery",
    cards: [
      { key: "lucky-number-placeholder", title: "Lucky Number", subtitle: "幸运号码报表", href: "/admin/reports/lucky-number", keywords: ["lucky", "number"] },
      { key: "lucky-draw-placeholder", title: "Lucky Draw 4D", subtitle: "4D 开奖报表", href: "/admin/reports/lucky-draw-4d", keywords: ["lucky", "draw", "4d"] },
    ],
  },
  {
    key: "staff",
    title: "Staff",
    titleKey: "admin.reportCatalog.staff",
    cards: [
      { key: "agents", title: "Agents", subtitle: "代理/员工列表", href: "/admin/agents", keywords: ["staff", "agent", "代理"] },
    ],
  },
  {
    key: "activity-log",
    title: "Activity Log",
    titleKey: "admin.reportCatalog.activityLog",
    cards: [
      { key: "activity-log-placeholder", title: "Activity Log", subtitle: "操作日志", href: "/admin/reports/activity-log", keywords: ["activity", "log", "日志"] },
    ],
  },
  {
    key: "game-winlose",
    title: "Game WinLose",
    titleKey: "admin.reportCatalog.gameWinLose",
    cards: [
      { key: "winloss-game", title: "Win/Loss by Game", subtitle: "按游戏输赢", titleKey: "admin.reportCatalog.winlossGameTitle", subtitleKey: "admin.reportCatalog.winlossGameSubtitle", href: "/admin/reports/winloss-by-game", keywords: ["winloss", "game", "输赢"] },
      { key: "turnover-game", title: "Turnover by Game", subtitle: "按游戏流水", titleKey: "admin.reportCatalog.turnoverGameTitle", subtitleKey: "admin.reportCatalog.turnoverGameSubtitle", href: "/admin/reports/turnover-by-game", keywords: ["turnover", "流水"] },
    ],
  },
  {
    key: "engagement",
    title: "Engagement",
    titleKey: "admin.reportCatalog.engagement",
    cards: [
      { key: "feedback-placeholder", title: "Feedback", subtitle: "用户反馈", href: "/admin/reports/feedback", keywords: ["feedback", "反馈"] },
      { key: "leaderboard-placeholder", title: "Leaderboard", subtitle: "排行榜", href: "/admin/reports/leaderboard", keywords: ["leaderboard", "排行"] },
    ],
  },
];

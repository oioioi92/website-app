export type NavItem = {
  key: string;
  label: string;     // sidebar 显示（短英文，不换行）
  tooltip?: string;  // 中文说明（hover）
  icon?: string;     // 你们自行映射 icon key
  href?: string;
  permission?: string;
};

export type NavGroup = {
  key: string;
  label: string;
  defaultOpen?: boolean;
  items: NavItem[];
};

export const ADMIN_NAV: NavGroup[] = [
  {
    key: "main",
    label: "MAIN",
    defaultOpen: true,
    items: [
      { key: "dashboard", label: "Dashboard", tooltip: "总览", href: "/admin" },
    ],
  },
  {
    key: "ops",
    label: "OPS",
    defaultOpen: true,
    items: [
      { key: "chat", label: "Live Chat", tooltip: "客服聊天队列", href: "/admin/chat" },
      { key: "pending-depo", label: "Pending Depo", tooltip: "待审核入款", href: "/admin/deposits/pending" },
      { key: "pending-with", label: "Pending With", tooltip: "待处理提款", href: "/admin/withdraws/pending" },
      { key: "transfer-queue", label: "Transfer Queue", tooltip: "转分排队/卡单", href: "/admin/transfers" },
    ],
  },
  {
    key: "report",
    label: "REPORT",
    defaultOpen: true,
    items: [
      { key: "daily-sales", label: "Daily Sales", tooltip: "小时/每日销量汇总", href: "/admin/reports/sales" },
      { key: "game-sales", label: "Game Sales", tooltip: "按游戏输赢（Win/Loss by Game）", href: "/admin/reports/winloss-by-game" },
      { key: "bonus", label: "Bonus", tooltip: "Bonus 明细/成本", href: "/admin/reports/bonus" },
      { key: "bank-tx", label: "Bank Tx", tooltip: "银行汇总/对账入口", href: "/admin/reports/bank" },
      { key: "all-reports", label: "All Reports…", tooltip: "报表中心（搜索/收藏）", href: "/admin/reports" },
    ],
  },
  {
    key: "history",
    label: "HISTORY",
    defaultOpen: false,
    items: [
      { key: "transactions", label: "Transactions", tooltip: "统一流水页（All/Depo/With/Bonus/Transfer/Game）", href: "/admin/transactions" },
      { key: "gateway-search", label: "Gateway Search", tooltip: "external_ref 一搜全出", href: "/admin/gateway/search" },
      { key: "recon", label: "Reconciliation", tooltip: "对账（差异列表）", href: "/admin/reports/reconciliation" },
    ],
  },
  {
    key: "users",
    label: "USERS",
    defaultOpen: false,
    items: [
      { key: "players", label: "Players", tooltip: "玩家列表", href: "/admin/players" },
      { key: "agents", label: "Agents", tooltip: "代理列表", href: "/admin/agents" },
      { key: "ref-tree", label: "Referral Tree", tooltip: "推荐/下线树", href: "/admin/referrals" },
    ],
  },
];

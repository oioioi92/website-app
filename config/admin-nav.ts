/**
 * Admin 侧栏导航（Porto 风格：短标签、单行、tooltip 中文）
 */

export type NavItem = {
  key: string;
  label: string;
  tooltip?: string;
  icon?: string;
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
    key: "top",
    label: "MAIN",
    defaultOpen: true,
    items: [{ key: "dashboard", label: "Dashboard", tooltip: "总览", icon: "layout-dashboard", href: "/admin" }]
  },
  {
    key: "ops",
    label: "OPS",
    defaultOpen: true,
    items: [
      { key: "chat", label: "Live Chat", tooltip: "客服聊天队列", icon: "message-circle", href: "/admin/chat" },
      { key: "pending-deposit", label: "Pending Depo", tooltip: "待审核入款", icon: "download", href: "/admin/deposits/pending" },
      { key: "pending-withdraw", label: "Pending With", tooltip: "待处理提款", icon: "upload", href: "/admin/withdrawals/pending" },
      { key: "transfer-queue", label: "Transfer Queue", tooltip: "转分队列", icon: "repeat", href: "/admin/transfers" }
    ]
  },
  {
    key: "report",
    label: "REPORT",
    defaultOpen: true,
    items: [
      { key: "daily-sales", label: "Daily Sales", tooltip: "小时/每日销量", icon: "bar-chart-3", href: "/admin/reports/hourly-sales" },
      { key: "game-sales", label: "Game Sales", tooltip: "按游戏输赢", icon: "dice-5", href: "/admin/reports/winloss-by-game" },
      { key: "bonus", label: "Bonus", tooltip: "Bonus 成本汇总", icon: "gift", href: "/admin/reports/bonus-cost" },
      { key: "bank-tx", label: "Bank Tx", tooltip: "银行/对账入口", icon: "building-2", href: "/admin/reports/reconciliation" },
      { key: "report-center", label: "All Reports…", tooltip: "报表中心（搜索/分类）", icon: "search", href: "/admin/reports" }
    ]
  },
  {
    key: "history",
    label: "HISTORY",
    defaultOpen: false,
    items: [
      { key: "transactions", label: "Transactions", tooltip: "统一流水", icon: "receipt", href: "/admin/transactions" },
      { key: "gateway-search", label: "Gateway Search", tooltip: "网关流水搜索", icon: "radar", href: "/admin/reports/gateway-search" },
      { key: "recon", label: "Reconciliation", tooltip: "对账", icon: "check-check", href: "/admin/reports/reconciliation" }
    ]
  },
  {
    key: "users",
    label: "USERS",
    defaultOpen: false,
    items: [
      { key: "players", label: "Players", tooltip: "玩家列表", icon: "users", href: "/admin/players" },
      { key: "agents", label: "Agents", tooltip: "代理列表", icon: "user-cog", href: "/admin/agents" },
      { key: "referrals", label: "Referral Tree", tooltip: "推荐/下线树", icon: "git-branch", href: "/admin/agents" }
    ]
  },
  {
    key: "settings",
    label: "SETTINGS",
    defaultOpen: false,
    items: [
      { key: "site", label: "Frontend", tooltip: "前台设置（整站可在此改）", icon: "globe", href: "/admin/site" },
      { key: "settings", label: "Settings", tooltip: "银行 / 游戏 API / 支付网关", icon: "settings", href: "/admin/settings" },
      { key: "promotions", label: "Promotions", tooltip: "优惠活动与红利规则", icon: "megaphone", href: "/admin/promotions" }
    ]
  }
];

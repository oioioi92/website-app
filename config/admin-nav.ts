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
  /** 仅当 user.role 匹配时显示该分组（不设则所有人可见） */
  permission?: string;
  items: NavItem[];
};

export const ADMIN_NAV: NavGroup[] = [
  {
    key: "ops",
    label: "OPS",
    defaultOpen: true,
    items: [
      { key: "chat", label: "Live Chat", tooltip: "客服聊天队列", href: "/admin/chat", icon: "chat" },
      { key: "whatsapp-inbox", label: "WhatsApp 收件箱", tooltip: "商业号会话、顾客信息、回复", href: "/admin/whatsapp-inbox", icon: "whatsapp" },
      { key: "register-pending", label: "待发送账号", tooltip: "新注册待发 ID+临时密码给用户", href: "/admin/register-pending", icon: "user-plus" },
      { key: "pending-depo", label: "Pending Deposit", tooltip: "待审核入款", href: "/admin/deposits/pending", icon: "deposit" },
      { key: "pending-with", label: "Pending Withdraw", tooltip: "待处理提款", href: "/admin/withdrawals/pending", icon: "withdraw" },
      { key: "transfer-queue", label: "Transfer Queue", tooltip: "转分排队/卡单", href: "/admin/transfers", icon: "transfer" },
    ],
  },
  {
    key: "report",
    label: "REPORT",
    defaultOpen: true,
    items: [
      { key: "reports", label: "Reports", tooltip: "报表中心：流水、客户、优惠、佣金等全部报表", href: "/admin/reports", icon: "bar-chart" },
    ],
  },
  {
    key: "history",
    label: "HISTORY",
    defaultOpen: false,
    items: [
      { key: "transactions", label: "Transactions", tooltip: "统一流水页（All/Depo/With/Bonus/Transfer/Game）", href: "/admin/transactions", icon: "list" },
      { key: "gateway-search", label: "Gateway Search", tooltip: "external_ref 一搜全出", href: "/admin/reports/gateway-search", icon: "search" },
      { key: "recon", label: "Reconciliation", tooltip: "对账（差异列表）", href: "/admin/reports/reconciliation", icon: "check-list" },
    ],
  },
  {
    key: "content",
    label: "CONTENT",
    defaultOpen: true,
    items: [
      { key: "promotions", label: "Promotions", tooltip: "优惠活动：新建/编辑/上下架", href: "/admin/promotions", icon: "promo" },
    ],
  },
  {
    key: "users",
    label: "USERS",
    defaultOpen: false,
    items: [
      { key: "players", label: "Players", tooltip: "玩家列表", href: "/admin/players", icon: "users" },
      { key: "agents", label: "Agents", tooltip: "代理列表", href: "/admin/agents", icon: "agent" },
      { key: "ref-tree", label: "Referral Tree", tooltip: "推荐/下线树", href: "/admin/referrals", icon: "tree" },
    ],
  },
  {
    key: "tools-security",
    label: "TOOLS & SECURITY",
    defaultOpen: true,
    permission: "admin",
    items: [
      { key: "tools", label: "Tools", tooltip: "图片转 URL 等小工具", href: "/admin/tools", icon: "tools" },
      { key: "security", label: "Security", tooltip: "安全提示、IP 白名单、登录日志", href: "/admin/security", icon: "security" },
      { key: "domain", label: "Domain", tooltip: "域名管理、主备域、DNS", href: "/admin/domain", icon: "domain" },
    ],
  },
  {
    key: "settings",
    label: "SETTINGS",
    defaultOpen: false,
    permission: "admin",
    items: [
      { key: "theme", label: "THEME", tooltip: "设置前台照片、Logo、轮播图、版面", href: "/admin/settings/theme", icon: "theme" },
      { key: "settings", label: "Settings", tooltip: "银行、游戏 API、支付网关、WhatsApp、个人资料等", href: "/admin/settings", icon: "settings" },
    ],
  },
];

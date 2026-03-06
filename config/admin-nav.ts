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
    key: "ops",
    label: "OPS",
    defaultOpen: true,
    items: [
      { key: "chat", label: "Live Chat", tooltip: "客服聊天队列", href: "/admin/chat", icon: "chat", permission: "view" },
      { key: "whatsapp-inbox", label: "WhatsApp 收件箱", tooltip: "商业号会话、顾客信息、回复", href: "/admin/whatsapp-inbox", icon: "whatsapp", permission: "view" },
      { key: "register-pending", label: "待发送账号", tooltip: "新注册待发 ID+临时密码给用户", href: "/admin/register-pending", icon: "user-plus", permission: "view" },
      { key: "pending-depo", label: "Pending Deposit", tooltip: "待审核入款", href: "/admin/deposits/pending", icon: "deposit", permission: "approve" },
      { key: "pending-with", label: "Pending Withdraw", tooltip: "待处理提款", href: "/admin/withdrawals/pending", icon: "withdraw", permission: "approve" },
      { key: "transfer-queue", label: "Transfer Queue", tooltip: "转分排队/卡单", href: "/admin/transfers", icon: "transfer", permission: "approve" },
    ],
  },
  {
    key: "report",
    label: "REPORT",
    defaultOpen: true,
    items: [
      { key: "dashboard", label: "Reports", tooltip: "统一报表：筛选、流水、游戏输赢、Bonus 等一页完成", href: "/admin/dashboard", icon: "report", permission: "view" },
    ],
  },
  {
    key: "history",
    label: "HISTORY",
    defaultOpen: false,
    items: [
      { key: "transactions", label: "Transactions", tooltip: "统一流水页（All/Depo/With/Bonus/Transfer/Game）", href: "/admin/transactions", icon: "list", permission: "view" },
      { key: "gateway-search", label: "Gateway Search", tooltip: "external_ref 一搜全出", href: "/admin/reports/gateway-search", icon: "search", permission: "approve" },
      { key: "recon", label: "Reconciliation", tooltip: "对账（差异列表）", href: "/admin/reports/reconciliation", icon: "check-list", permission: "approve" },
    ],
  },
  {
    key: "content",
    label: "CONTENT",
    defaultOpen: true,
    items: [
      { key: "promotions", label: "Promotions", tooltip: "优惠活动：新建/编辑/上下架", href: "/admin/promotions", icon: "promo", permission: "edit_content" },
      { key: "image-to-url", label: "图片转网址", tooltip: "上传图片获取链接，用于后台各处", href: "/admin/image-to-url", icon: "image", permission: "edit_content" },
    ],
  },
  {
    key: "users",
    label: "USERS",
    defaultOpen: false,
    items: [
      { key: "players", label: "Players", tooltip: "玩家列表", href: "/admin/players", icon: "users", permission: "view" },
      { key: "agents", label: "Agents", tooltip: "代理列表", href: "/admin/agents", icon: "agent", permission: "view" },
      { key: "ref-tree", label: "Referral Tree", tooltip: "推荐/下线树", href: "/admin/referrals", icon: "tree", permission: "view" },
      { key: "admin-accounts", label: "Admin Accounts", tooltip: "后台账户：创建 admin/editor/viewer", href: "/admin/settings/account/admins", icon: "users", permission: "manage_admins" },
    ],
  },
  {
    key: "system",
    label: "SYSTEM",
    defaultOpen: false,
    items: [
      { key: "settings", label: "Settings", tooltip: "主题、银行、支付、安全等", href: "/admin/settings", icon: "settings", permission: "settings" },
    ],
  },
];

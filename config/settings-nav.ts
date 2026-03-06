/**
 * 新版 Settings 信息架构：6 大块 + 子页
 * 用于 Settings 首页卡片与二级导航，旧入口需 redirect 到对应新路径。
 */
/** permission 与 lib/rbac-client 一致：settings | manage_admins | edit_content，缺省表示需 settings */
export type SettingsNavChild = {
  key: string;
  label: string;
  href: string;
  permission?: string;
};

export type SettingsNavGroup = {
  key: string;
  label: string;
  description: string;
  children: SettingsNavChild[];
};

export const SETTINGS_NAV: SettingsNavGroup[] = [
  {
    key: "theme",
    label: "Theme",
    description: "前台主题、配色、背景、入口与弹窗文案（站点名称、Logo、跑马灯、首页媒体等统一入口）",
    children: [
      { key: "theme", label: "Theme / 前台照片", href: "/admin/settings/theme", permission: "edit_content" },
    ],
  },
  {
    key: "promotions",
    label: "Promotion Center",
    description: "优惠活动列表，行内进入编辑/Media/Links/Preview",
    children: [
      { key: "list", label: "Promotion List", href: "/admin/settings/promotions/list", permission: "edit_content" },
    ],
  },
  {
    key: "referral",
    label: "Referral Center",
    description: "推荐系统、分享规则与展示（统一入口）",
    children: [
      { key: "referral", label: "Referral", href: "/admin/settings/referral/general", permission: "settings" },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    description: "银行、充值规则、提现规则、支付通道",
    children: [
      { key: "banks", label: "Bank Accounts", href: "/admin/settings/finance/banks", permission: "settings" },
      { key: "depositRules", label: "Deposit Rules", href: "/admin/settings/finance/deposit-rules", permission: "settings" },
      { key: "withdrawRules", label: "Withdraw Rules", href: "/admin/settings/finance/withdraw-rules", permission: "settings" },
      { key: "paymentGateways", label: "Payment Gateways", href: "/admin/settings/finance/payment-gateways", permission: "settings" },
    ],
  },
  {
    key: "integrations",
    label: "Integrations",
    description: "游戏管理（API+列表）、WhatsApp 及第三方接入",
    children: [
      { key: "games", label: "游戏管理 / Games", href: "/admin/settings/game-providers", permission: "edit_content" },
      { key: "whatsapp", label: "WhatsApp", href: "/admin/settings/integrations/whatsapp", permission: "settings" },
    ],
  },
  {
    key: "account",
    label: "Account & Security",
    description: "管理员资料、密码与安全设置",
    children: [
      { key: "profile", label: "Profile", href: "/admin/settings/account/profile", permission: "view" },
      { key: "password", label: "Password", href: "/admin/settings/account/password", permission: "view" },
      { key: "security", label: "Security", href: "/admin/settings/account/security", permission: "settings" },
      { key: "loginHistory", label: "Login History", href: "/admin/settings/account/login-history", permission: "manage_admins" },
      { key: "admins", label: "Admin Accounts", href: "/admin/settings/account/admins", permission: "manage_admins" },
    ],
  },
];

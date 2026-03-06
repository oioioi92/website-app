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
    description: "前台主题、配色、背景、入口与弹窗文案",
    children: [
      { key: "theme", label: "Theme / 前台照片", href: "/admin/settings/theme", permission: "edit_content" },
    ],
  },
  {
    key: "frontend",
    label: "Frontend",
    description: "站点基础信息、公告、弹窗、首页媒体、展示样式",
    children: [
      { key: "general", label: "General", href: "/admin/settings/frontend/general", permission: "edit_content" },
      { key: "notices", label: "Notices & Marquee", href: "/admin/settings/frontend/notices", permission: "edit_content" },
      { key: "popups", label: "Popups", href: "/admin/settings/frontend/popups", permission: "edit_content" },
      { key: "downloadBar", label: "Download Bar", href: "/admin/settings/frontend/download-bar", permission: "edit_content" },
      { key: "homeMedia", label: "Home Media", href: "/admin/settings/frontend/home-media", permission: "edit_content" },
      { key: "display", label: "Display", href: "/admin/settings/frontend/display", permission: "edit_content" },
    ],
  },
  {
    key: "promotions",
    label: "Promotion Center",
    description: "优惠内容、图片、跳转、布局、弹窗与预览",
    children: [
      { key: "list", label: "Promotion List", href: "/admin/settings/promotions/list", permission: "edit_content" },
      { key: "content", label: "Content", href: "/admin/settings/promotions/content", permission: "edit_content" },
      { key: "media", label: "Media", href: "/admin/settings/promotions/media", permission: "edit_content" },
      { key: "links", label: "Link & Route", href: "/admin/settings/promotions/links", permission: "edit_content" },
      { key: "layout", label: "Layout", href: "/admin/settings/promotions/layout", permission: "edit_content" },
      { key: "preview", label: "Preview", href: "/admin/settings/promotions/preview", permission: "edit_content" },
    ],
  },
  {
    key: "referral",
    label: "Referral Center",
    description: "推荐系统、分享规则、展示与参数",
    children: [
      { key: "general", label: "General", href: "/admin/settings/referral/general", permission: "settings" },
      { key: "sharing", label: "Sharing", href: "/admin/settings/referral/sharing", permission: "settings" },
      { key: "display", label: "Display", href: "/admin/settings/referral/display", permission: "settings" },
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

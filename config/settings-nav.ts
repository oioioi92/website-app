/**
 * 新版 Settings 信息架构：6 大块 + 子页
 * 用于 Settings 首页卡片与二级导航，旧入口需 redirect 到对应新路径。
 */
export type SettingsNavChild = {
  key: string;
  label: string;
  href: string;
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
      { key: "theme", label: "Theme / 前台照片", href: "/admin/settings/theme" },
    ],
  },
  {
    key: "frontend",
    label: "Frontend",
    description: "站点基础信息、公告、弹窗、首页媒体、展示样式",
    children: [
      { key: "general", label: "General", href: "/admin/settings/frontend/general" },
      { key: "notices", label: "Notices & Marquee", href: "/admin/settings/frontend/notices" },
      { key: "popups", label: "Popups", href: "/admin/settings/frontend/popups" },
      { key: "downloadBar", label: "Download Bar", href: "/admin/settings/frontend/download-bar" },
      { key: "homeMedia", label: "Home Media", href: "/admin/settings/frontend/home-media" },
      { key: "display", label: "Display", href: "/admin/settings/frontend/display" },
    ],
  },
  {
    key: "promotions",
    label: "Promotion Center",
    description: "优惠内容、图片、跳转、布局、弹窗与预览",
    children: [
      { key: "list", label: "Promotion List", href: "/admin/settings/promotions/list" },
      { key: "content", label: "Content", href: "/admin/settings/promotions/content" },
      { key: "media", label: "Media", href: "/admin/settings/promotions/media" },
      { key: "links", label: "Link & Route", href: "/admin/settings/promotions/links" },
      { key: "layout", label: "Layout", href: "/admin/settings/promotions/layout" },
      { key: "preview", label: "Preview", href: "/admin/settings/promotions/preview" },
    ],
  },
  {
    key: "referral",
    label: "Referral Center",
    description: "推荐系统、分享规则、展示与参数",
    children: [
      { key: "general", label: "General", href: "/admin/settings/referral/general" },
      { key: "sharing", label: "Sharing", href: "/admin/settings/referral/sharing" },
      { key: "display", label: "Display", href: "/admin/settings/referral/display" },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    description: "银行、充值规则、提现规则、支付通道",
    children: [
      { key: "banks", label: "Bank Accounts", href: "/admin/settings/finance/banks" },
      { key: "depositRules", label: "Deposit Rules", href: "/admin/settings/finance/deposit-rules" },
      { key: "withdrawRules", label: "Withdraw Rules", href: "/admin/settings/finance/withdraw-rules" },
      { key: "paymentGateways", label: "Payment Gateways", href: "/admin/settings/finance/payment-gateways" },
    ],
  },
  {
    key: "integrations",
    label: "Integrations",
    description: "游戏管理（API+列表）、WhatsApp 及第三方接入",
    children: [
      { key: "games", label: "游戏管理 / Games", href: "/admin/settings/game-providers" },
      { key: "whatsapp", label: "WhatsApp", href: "/admin/settings/integrations/whatsapp" },
    ],
  },
  {
    key: "account",
    label: "Account & Security",
    description: "管理员资料、密码与安全设置",
    children: [
      { key: "profile", label: "Profile", href: "/admin/settings/account/profile" },
      { key: "password", label: "Password", href: "/admin/settings/account/password" },
      { key: "security", label: "Security", href: "/admin/settings/account/security" },
      { key: "loginHistory", label: "Login History", href: "/admin/settings/account/login-history" },
    ],
  },
];

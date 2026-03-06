/**
 * Settings 二级导航：THEME / Promotion Center / Referral / Finance / Integrations / Account & Security
 * （原 FRONTEND 下 General、Notices、Popups、Download Bar、Home Media、Display 已移除，功能均在 THEME 中）
 */

export type SettingsNavItem = { key: string; label: string; href: string };

export type SettingsNavGroup = {
  key: string;
  label: string;
  titleKey?: string;
  items: SettingsNavItem[];
};

export const SETTINGS_NAV: SettingsNavGroup[] = [
  {
    key: "theme",
    label: "THEME",
    titleKey: "admin.settingsNav.theme",
    items: [{ key: "theme", label: "Theme / 前台照片", href: "/admin/settings/theme" }],
  },
  {
    key: "promotion",
    label: "Promotion Center",
    titleKey: "admin.settingsNav.promotionCenter",
    items: [
      { key: "list", label: "Promotion List", href: "/admin/settings/promotions/list" },
      { key: "promotion", label: "Promotion / 优惠设置", href: "/admin/settings/promotion" },
    ],
  },
  {
    key: "referral",
    label: "Referral",
    titleKey: "admin.settingsNav.referral",
    items: [{ key: "general", label: "General", href: "/admin/settings/referral" }],
  },
  {
    key: "finance",
    label: "Finance",
    titleKey: "admin.settingsNav.finance",
    items: [
      { key: "bank", label: "Bank", href: "/admin/settings/bank" },
      { key: "deposit-rules", label: "Deposit Rules", href: "/admin/settings/deposit-topup-rules" },
      { key: "payment-gateway", label: "Payment Gateway", href: "/admin/settings/payment-gateway" },
    ],
  },
  {
    key: "integrations",
    label: "Integrations",
    titleKey: "admin.settingsNav.integrations",
    items: [
      { key: "games", label: "游戏管理 / Games", href: "/admin/settings/games" },
      { key: "whatsapp", label: "WhatsApp", href: "/admin/settings/whatsapp" },
    ],
  },
  {
    key: "account",
    label: "Account & Security",
    titleKey: "admin.settingsNav.account",
    items: [
      { key: "profile", label: "Profile", href: "/admin/settings/profile" },
      { key: "password", label: "Password", href: "/admin/settings/password" },
      { key: "security", label: "Security", href: "/admin/settings/security" },
    ],
  },
];

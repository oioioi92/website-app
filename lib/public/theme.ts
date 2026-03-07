import type { Prisma } from "@prisma/client";

export type ThemeBanner = {
  imageUrl: string;
  linkUrl: string | null;
  title: string | null;
};

export type ThemeSocial = {
  type: "whatsapp" | "telegram" | "livechat" | "facebook" | "robot";
  label: string;
  url: string;
  iconUrl: string | null;
};

export type ThemeSectionTitles = {
  quickActions: string;
  liveTransaction: string;
  gameZone: string;
  social: string;
};

export type ThemeRoutes = {
  /** Promotions landing (e.g. "/promotion") */
  promotion: string;
  /** Bonus / promo detail aggregator (e.g. "/bonus") */
  bonus: string;
};

export type ThemeBottomNavItem = {
  href: string;
  label: string;
  /** Optional fallback text/emoji when no iconUrl */
  icon: string | null;
  /** 可选图片 URL，有则前台用照片代替 emoji/文字 */
  iconUrl: string | null;
  badge: string | null;
};

export type ThemeCategoryPill = { id: string; label: string };

export type ThemeLegalLink = { label: string; href: string };

export type ThemeConfig = {
  /** Used in headers/topbars (fallback: "Site") */
  siteName: string;
  logoUrl: string | null;
  announcementMarqueeText: string | null;
  /** V3: 多条跑马灯文案，后台可配；有则优先于 announcementMarqueeText */
  marqueeMessages: string[];
  heroBanners: ThemeBanner[];
  /** 子公司/合作伙伴列表页使用（logo + 跳转链接） */
  subsidiaries: ThemeBanner[];
  secondaryBannerUrl: string | null;
  socialLinks: ThemeSocial[];
  trustBadges: Array<{ group: string; imageUrl: string; title: string | null }>;
  /** Trust footer groups and ordering (optional). If omitted, UI falls back to built-in defaults. */
  trustGroups?: string[];
  /** Desktop footer legal/help links (optional). */
  legalLinks?: ThemeLegalLink[];
  /** Small UI text overrides for hardcoded labels (optional). */
  uiText?: Record<string, string>;
  chatDefaultUrl: string | null;
  socialStyle: "COIN" | "CUBE";
  quickActions: Array<{
    label: string;
    url: string;
    iconUrl: string | null;
    iconKey: string | null;
    style: "gold" | "dark";
  }>;
  downloadBar: {
    enabled: boolean;
    imageUrl: string | null;
    title: string | null;
    subtitle: string | null;
    ctaText: string | null;
    ctaUrl: string | null;
  };
  floatingActions: Array<{
    label: string;
    url: string;
    variant: "subscribe" | "complain";
    iconKey: string | null;
    iconUrl: string | null;
  }>;
  depositUrl: string | null;
  withdrawUrl: string | null;
  /** Action Bar / Header: external auth URLs (optional) */
  loginUrl: string | null;
  registerUrl: string | null;
  ageGate: {
    enabled: boolean;
    title: string;
    content: string;
  };
  partnershipBadgeUrl: string | null;
  /** V3: 主区中间插图槽大图 URL */
  centerSlotImageUrl: string | null;
  /** V3: Action Bar 按钮颜色（CSS 合法值），未设则用默认蓝/金 */
  actionBarDepositColor: string | null;
  actionBarWithdrawColor: string | null;
  /** V3.1: Action Bar 按钮图片（后台上传），有则替代文字按钮 */
  actionBarButtonImages: {
    login: string | null;
    register: string | null;
    deposit: string | null;
    withdraw: string | null;
    refresh: string | null;
    signout: string | null;
  };
  /** V3.1: Action Bar 金额限制文案（后台可配） */
  actionBarLimits: {
    minDeposit: string | null;
    maxDeposit: string | null;
    minWithdraw: string | null;
    maxWithdraw: string | null;
  };
  /** V3.1: LiveTx 区域背景图（可选） */
  liveTxBgImageUrl: string | null;
  /** 前台整页背景图（Header 及以下区域） */
  pageBackgroundUrl: string | null;
  /** 前台整页背景色（CSS 合法值，如 #0a0a0a） */
  pageBackgroundColor: string | null;
  /** 主题主色（如 #a855f7），用于按钮、高亮、底部导航等；不设则用默认紫 */
  themePrimaryColor: string | null;
  /** 主题强调色（如 #6366f1），用于渐变第二色；不设则用默认 */
  themeAccentColor: string | null;
  /** Vivid 背景/卡片/边框/文字（不设则用 CSS 默认） */
  vividBg: string | null;
  vividCard: string | null;
  vividCard2: string | null;
  vividBorder: string | null;
  vividText: string | null;
  vividMuted: string | null;
  vividGreen: string | null;
  vividRed: string | null;
  vividGold: string | null;
  /** Desktop 背景/面板/强调色 */
  deskBg: string | null;
  deskPanel: string | null;
  deskAccent: string | null;
  /** 流水表 Deposit/Withdraw 列颜色 */
  livetxDepositColor: string | null;
  livetxWithdrawColor: string | null;
  /** 字体（如 15px、1.5rem） */
  fontFamily: string | null;
  fontSize: string | null;
  /** Vivid 圆角/间距/最大宽度（如 16px、24px、1100px） */
  vpRadiusCard: string | null;
  vpRadiusBtn: string | null;
  vpGap: string | null;
  vpMaxWidth: string | null;
  /** Desktop 容器宽度/Banner 高度 */
  deskContainer: string | null;
  deskBannerH: string | null;
  /** 推荐区块背景/边框 */
  referralBlockBg: string | null;
  referralBlockBorder: string | null;
  /** 客服悬浮按钮背景 */
  chatFabBg: string | null;
  /** 前台通用语义色 */
  frontAccent: string | null;
  frontSuccess: string | null;
  frontDanger: string | null;
  frontGold: string | null;
  /** Vivid Topbar 背景/边框（不设则用默认） */
  vpTopbarBg: string | null;
  vpTopbarBorder: string | null;
  /** 跑马灯区域背景/边框/文字色 */
  marqueeBg: string | null;
  marqueeBorder: string | null;
  marqueeTextColor: string | null;
  /** P0: 首页模块标题（前台不再写死） */
  sectionTitles: ThemeSectionTitles;
  /** P0: 前台主要入口路由（/bonus、/promotion 等） */
  routes: ThemeRoutes;
  /** 整体设计风格预设：一键切换圆角、阴影、主色氛围等，不单靠颜色 */
  designStyle?: "default" | "minimal" | "luxury" | "gaming" | "soft";
  /** Bonus/Promotion list visual pattern */
  promotionPattern: "classic" | "image_tiles" | "image_strips";
  /** Bonus/Promotion font preset */
  promotionFontPreset: "default" | "compact" | "bold";
  /** P0: 底部导航（移动端） */
  bottomNav: ThemeBottomNavItem[];
  /** P0: V3 游戏区左侧分类列表（可配置） */
  uiGameCategories: string[];
  /** P0: V2 顶部 pills 分类（可配置） */
  categoryPills: ThemeCategoryPill[];
  /** Vivid Portal：促销卡片样式配置 */
  vividPromoCardConfig: {
    /** 图片区高度（px），默认 180 */
    imgHeight: number;
    /** 是否显示百分比/高亮标签 */
    showPercent: boolean;
    /** 是否显示副标题 */
    showSubtitle: boolean;
    /** 是否显示 T&C 按钮 */
    showTnc: boolean;
    /** 每行几列（2 或 3），默认 3 */
    columns: number;
  };
};

const defaults: ThemeConfig = {
  siteName: "Site",
  logoUrl: null,
  announcementMarqueeText: null,
  marqueeMessages: [],
  heroBanners: [],
  subsidiaries: [],
  secondaryBannerUrl: null,
  socialLinks: [],
  trustBadges: [],
  trustGroups: undefined,
  legalLinks: [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Contact", href: "/chat" }
  ],
  uiText: {},
  chatDefaultUrl: null,
  socialStyle: "COIN",
  quickActions: [],
  downloadBar: {
    enabled: false,
    imageUrl: null,
    title: null,
    subtitle: null,
    ctaText: null,
    ctaUrl: null
  },
  floatingActions: [],
  depositUrl: null,
  withdrawUrl: null,
  loginUrl: null,
  registerUrl: null,
  ageGate: {
    enabled: false,
    title: "Age Confirmation",
    content: "This website is for users aged 18 and above."
  },
  partnershipBadgeUrl: null,
  centerSlotImageUrl: null,
  actionBarDepositColor: null,
  actionBarWithdrawColor: null,
  actionBarButtonImages: {
    login: null,
    register: null,
    deposit: null,
    withdraw: null,
    refresh: null,
    signout: null
  },
  actionBarLimits: {
    minDeposit: null,
    maxDeposit: null,
    minWithdraw: null,
    maxWithdraw: null
  },
  liveTxBgImageUrl: null,
  pageBackgroundUrl: null,
  pageBackgroundColor: null,
  themePrimaryColor: null,
  themeAccentColor: null,
  vividBg: null,
  vividCard: null,
  vividCard2: null,
  vividBorder: null,
  vividText: null,
  vividMuted: null,
  vividGreen: null,
  vividRed: null,
  vividGold: null,
  deskBg: null,
  deskPanel: null,
  deskAccent: null,
  livetxDepositColor: null,
  livetxWithdrawColor: null,
  fontFamily: null,
  fontSize: null,
  vpRadiusCard: null,
  vpRadiusBtn: null,
  vpGap: null,
  vpMaxWidth: null,
  deskContainer: null,
  deskBannerH: null,
  referralBlockBg: null,
  referralBlockBorder: null,
  chatFabBg: null,
  frontAccent: null,
  frontSuccess: null,
  frontDanger: null,
  frontGold: null,
  vpTopbarBg: null,
  vpTopbarBorder: null,
  marqueeBg: null,
  marqueeBorder: null,
  marqueeTextColor: null,
  sectionTitles: {
    quickActions: "QUICK ACTIONS",
    liveTransaction: "LIVE TRANSACTION",
    gameZone: "GAME ZONE",
    social: "SOCIAL"
  },
  routes: {
    promotion: "/promotion",
    bonus: "/bonus"
  },
  promotionPattern: "classic",
  promotionFontPreset: "default",
  bottomNav: [
    { href: "/", label: "HOME", icon: "H", iconUrl: null, badge: null },
    { href: "/games", label: "GAMES", icon: "G", iconUrl: null, badge: null },
    { href: "/promotion", label: "PROMO", icon: "P", iconUrl: null, badge: null },
    { href: "/history", label: "HISTORY", icon: "H", iconUrl: null, badge: null },
    { href: "/chat", label: "LIVE CHAT", icon: "C", iconUrl: null, badge: null },
    { href: "/settings", label: "SETTINGS", icon: "S", iconUrl: null, badge: null }
  ],
  uiGameCategories: ["Casino", "Sportbook", "Slots", "E-Sports", "Poker", "Fishing"],
  categoryPills: [
    { id: "all", label: "ALL" },
    { id: "events", label: "EVENTS" },
    { id: "slots", label: "SLOTS" },
    { id: "fishing", label: "FISHING" },
    { id: "sports", label: "SPORTS" },
    { id: "live", label: "LIVE" }
  ],
  vividPromoCardConfig: {
    imgHeight: 180,
    showPercent: true,
    showSubtitle: true,
    showTnc: true,
    columns: 3,
  }
};

function asRecord(input: unknown): Record<string, unknown> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  return input as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeUrlForUi(raw: unknown): string | null {
  const s = asString(raw);
  if (!s) return null;
  // "#" is used as a placeholder in some UI inputs; treat it as "unset" for URL fields.
  // (Legal links use normalizeHrefForUi which explicitly allows "#".)
  if (s === "#") return null;
  // Reject scriptable / opaque schemes.
  if (/^javascript:/i.test(s)) return null;
  if (/^data:/i.test(s)) return null;
  if (/^blob:/i.test(s)) return null;
  // Keep special schemes untouched
  // Protocol-relative -> https
  if (s.startsWith("//")) return `https:${s}`;
  // Upgrade http to https (common cause of "logo disappears" on https sites due to mixed-content blocking)
  if (s.startsWith("http://")) return `https://${s.slice("http://".length)}`;
  // Absolute https
  if (s.startsWith("https://")) return s;
  // Site-absolute path
  if (s.startsWith("/")) return s;
  // Looks like a host/path without protocol (e.g. "cdn.example.com/a.png")
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(s) || s.startsWith("www.")) return `https://${s}`;
  // Otherwise treat as site-relative (e.g. "assets/x.png" -> "/assets/x.png")
  return `/${s.replace(/^\.?\//, "")}`;
}

function normalizeHrefForUi(raw: unknown): string | null {
  const s = asString(raw);
  if (!s) return null;
  if (s === "#") return "#";
  return normalizeUrlForUi(s);
}

function sanitizeText(raw: unknown, maxLen: number): string {
  const s = typeof raw === "string" ? raw : "";
  // Drop control chars + strip angle brackets to reduce XSS surface.
  const cleaned = s.replace(/[\u0000-\u001F\u007F]/g, "").replace(/[<>]/g, "").trim();
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned;
}

/** 仅允许合法 CSS 颜色值，避免注入 */
function sanitizeCssColor(s: string | null | undefined): string | null {
  if (!s || typeof s !== "string") return null;
  const t = s.trim().slice(0, 60);
  if (!t) return null;
  if (/^#[0-9a-fA-F]{3}$/.test(t) || /^#[0-9a-fA-F]{6}$/.test(t)) return t;
  if (/^rgb\s*\([^)]*\)$/.test(t) || /^rgba\s*\([^)]*\)$/.test(t)) return t;
  if (/^hsl\s*\([^)]*\)$/.test(t) || /^hsla\s*\([^)]*\)$/.test(t)) return t;
  if (/^[a-zA-Z][a-zA-Z0-9-]*$/.test(t)) return t;
  return null;
}

/**
 * Server-side sanitizer for theme_json writes.
 * - No <script>/<iframe> (we strip angle brackets and reject scriptable URL schemes)
 * - No javascript:/data:/blob:
 * - Normalize all URLs through normalizeUrlForUi
 */
export function sanitizeThemeJsonForWrite(raw: Prisma.JsonValue | unknown): Prisma.InputJsonValue {
  const t = parseThemeJson(raw);
  const out: ThemeConfig = {
    ...t,
    siteName: sanitizeText(t.siteName, 80) || "Site",
    announcementMarqueeText: t.announcementMarqueeText ? sanitizeText(t.announcementMarqueeText, 280) : null,
    marqueeMessages: Array.isArray(t.marqueeMessages)
      ? t.marqueeMessages.map((x) => sanitizeText(x, 280)).filter(Boolean).slice(0, 20)
      : [],
    logoUrl: normalizeUrlForUi(t.logoUrl),
    secondaryBannerUrl: normalizeUrlForUi(t.secondaryBannerUrl),
    chatDefaultUrl: normalizeUrlForUi(t.chatDefaultUrl),
    depositUrl: normalizeUrlForUi(t.depositUrl),
    withdrawUrl: normalizeUrlForUi(t.withdrawUrl),
    loginUrl: normalizeUrlForUi(t.loginUrl),
    registerUrl: normalizeUrlForUi(t.registerUrl),
    partnershipBadgeUrl: normalizeUrlForUi(t.partnershipBadgeUrl),
    centerSlotImageUrl: normalizeUrlForUi(t.centerSlotImageUrl),
    liveTxBgImageUrl: normalizeUrlForUi(t.liveTxBgImageUrl),
    pageBackgroundUrl: normalizeUrlForUi(t.pageBackgroundUrl),
    pageBackgroundColor: sanitizeText(t.pageBackgroundColor, 60) || null,
    themePrimaryColor: sanitizeCssColor(sanitizeText(t.themePrimaryColor, 60)),
    themeAccentColor: sanitizeCssColor(sanitizeText(t.themeAccentColor, 60)),
    vividBg: sanitizeCssColor(sanitizeText(t.vividBg, 60)),
    vividCard: sanitizeCssColor(sanitizeText(t.vividCard, 60)),
    vividCard2: sanitizeCssColor(sanitizeText(t.vividCard2, 60)),
    vividBorder: sanitizeCssColor(sanitizeText(t.vividBorder, 100)) || sanitizeText(t.vividBorder, 100) || null,
    vividText: sanitizeCssColor(sanitizeText(t.vividText, 60)),
    vividMuted: sanitizeCssColor(sanitizeText(t.vividMuted, 60)),
    vividGreen: sanitizeCssColor(sanitizeText(t.vividGreen, 60)),
    vividRed: sanitizeCssColor(sanitizeText(t.vividRed, 60)),
    vividGold: sanitizeCssColor(sanitizeText(t.vividGold, 60)),
    deskBg: sanitizeCssColor(sanitizeText(t.deskBg, 60)),
    deskPanel: sanitizeCssColor(sanitizeText(t.deskPanel, 60)),
    deskAccent: sanitizeCssColor(sanitizeText(t.deskAccent, 60)),
    livetxDepositColor: sanitizeCssColor(sanitizeText(t.livetxDepositColor, 60)),
    livetxWithdrawColor: sanitizeCssColor(sanitizeText(t.livetxWithdrawColor, 60)),
    fontFamily: sanitizeText(t.fontFamily, 80) || null,
    fontSize: sanitizeText(t.fontSize, 20) || null,
    vpRadiusCard: sanitizeText(t.vpRadiusCard, 20) || null,
    vpRadiusBtn: sanitizeText(t.vpRadiusBtn, 20) || null,
    vpGap: sanitizeText(t.vpGap, 20) || null,
    vpMaxWidth: sanitizeText(t.vpMaxWidth, 20) || null,
    deskContainer: sanitizeText(t.deskContainer, 20) || null,
    deskBannerH: sanitizeText(t.deskBannerH, 20) || null,
    referralBlockBg: sanitizeCssColor(sanitizeText(t.referralBlockBg, 100)) || sanitizeText(t.referralBlockBg, 100) || null,
    referralBlockBorder: sanitizeCssColor(sanitizeText(t.referralBlockBorder, 100)) || sanitizeText(t.referralBlockBorder, 100) || null,
    chatFabBg: sanitizeCssColor(sanitizeText(t.chatFabBg, 60)),
    frontAccent: sanitizeCssColor(sanitizeText(t.frontAccent, 60)),
    frontSuccess: sanitizeCssColor(sanitizeText(t.frontSuccess, 60)),
    frontDanger: sanitizeCssColor(sanitizeText(t.frontDanger, 60)),
    frontGold: sanitizeCssColor(sanitizeText(t.frontGold, 60)),
    vpTopbarBg: sanitizeCssColor(sanitizeText(t.vpTopbarBg, 100)) || sanitizeText(t.vpTopbarBg, 100) || null,
    vpTopbarBorder: sanitizeCssColor(sanitizeText(t.vpTopbarBorder, 100)) || sanitizeText(t.vpTopbarBorder, 100) || null,
    marqueeBg: sanitizeCssColor(sanitizeText(t.marqueeBg, 60)),
    marqueeBorder: sanitizeCssColor(sanitizeText(t.marqueeBorder, 100)) || sanitizeText(t.marqueeBorder, 100) || null,
    marqueeTextColor: sanitizeCssColor(sanitizeText(t.marqueeTextColor, 60)),
    actionBarDepositColor: sanitizeText(t.actionBarDepositColor, 60) || null,
    actionBarWithdrawColor: sanitizeText(t.actionBarWithdrawColor, 60) || null,
    actionBarButtonImages: {
      login: normalizeUrlForUi(t.actionBarButtonImages?.login),
      register: normalizeUrlForUi(t.actionBarButtonImages?.register),
      deposit: normalizeUrlForUi(t.actionBarButtonImages?.deposit),
      withdraw: normalizeUrlForUi(t.actionBarButtonImages?.withdraw),
      refresh: normalizeUrlForUi(t.actionBarButtonImages?.refresh),
      signout: normalizeUrlForUi(t.actionBarButtonImages?.signout)
    },
    actionBarLimits: {
      minDeposit: sanitizeText(t.actionBarLimits?.minDeposit, 60) || null,
      maxDeposit: sanitizeText(t.actionBarLimits?.maxDeposit, 60) || null,
      minWithdraw: sanitizeText(t.actionBarLimits?.minWithdraw, 60) || null,
      maxWithdraw: sanitizeText(t.actionBarLimits?.maxWithdraw, 60) || null
    },
    sectionTitles: {
      quickActions: sanitizeText(t.sectionTitles?.quickActions, 40) || "QUICK ACTIONS",
      liveTransaction: sanitizeText(t.sectionTitles?.liveTransaction, 40) || "LIVE TRANSACTION",
      gameZone: sanitizeText(t.sectionTitles?.gameZone, 40) || "GAME ZONE",
      social: sanitizeText(t.sectionTitles?.social, 40) || "SOCIAL"
    },
    routes: {
      promotion: sanitizeText(t.routes?.promotion, 120) || "/promotion",
      bonus: sanitizeText(t.routes?.bonus, 120) || "/bonus"
    },
    designStyle: (t.designStyle === "minimal" || t.designStyle === "luxury" || t.designStyle === "gaming" || t.designStyle === "soft" || t.designStyle === "default") ? t.designStyle : undefined,
    promotionPattern:
      t.promotionPattern === "image_tiles" || t.promotionPattern === "image_strips"
        ? t.promotionPattern
        : "classic",
    promotionFontPreset:
      t.promotionFontPreset === "compact" || t.promotionFontPreset === "bold"
        ? t.promotionFontPreset
        : "default",
    vividPromoCardConfig: {
      imgHeight: typeof t.vividPromoCardConfig?.imgHeight === "number"
        && t.vividPromoCardConfig.imgHeight >= 80
        && t.vividPromoCardConfig.imgHeight <= 600
        ? t.vividPromoCardConfig.imgHeight : 180,
      showPercent:  t.vividPromoCardConfig?.showPercent  !== false,
      showSubtitle: t.vividPromoCardConfig?.showSubtitle !== false,
      showTnc:      t.vividPromoCardConfig?.showTnc      !== false,
      columns:      t.vividPromoCardConfig?.columns === 2 ? 2 : 3,
    },
    heroBanners: Array.isArray(t.heroBanners)
      ? t.heroBanners
          .map((b) => {
            // Backward-compatible: accept multiple legacy keys.
            const imageUrl = normalizeUrlForUi(
              b.imageUrl
              ?? b.logoUrl
              ?? b.url
              ?? b.src
            ) ?? "";
            return {
              imageUrl,
              linkUrl: normalizeUrlForUi(b.linkUrl),
              title: b.title ? sanitizeText(b.title, 80) : null
            };
          })
          .filter((b) => Boolean(b.imageUrl))
          .slice(0, 12)
      : [],
    subsidiaries: Array.isArray(t.subsidiaries)
      ? t.subsidiaries
          .map((b) => ({
            imageUrl: normalizeUrlForUi(b.imageUrl) ?? "",
            linkUrl: normalizeUrlForUi(b.linkUrl),
            title: b.title ? sanitizeText(b.title, 80) : null
          }))
          .filter((b) => Boolean(b.imageUrl))
          .slice(0, 50)
      : [],
    socialLinks: Array.isArray(t.socialLinks)
      ? t.socialLinks
          .map((s) => ({
            type: s.type,
            label: sanitizeText(s.label, 60),
            url: normalizeUrlForUi(s.url) ?? "",
            iconUrl: normalizeUrlForUi(s.iconUrl)
          }))
          .filter((s) => Boolean(s.label) && Boolean(s.url))
          .slice(0, 10)
      : [],
    trustBadges: Array.isArray(t.trustBadges)
      ? t.trustBadges
          .map((b) => ({
            group: sanitizeText(b.group, 80) || "Game License",
            imageUrl: normalizeUrlForUi(b.imageUrl) ?? "",
            title: b.title ? sanitizeText(b.title, 80) : null
          }))
          .filter((b) => Boolean(b.imageUrl))
          .slice(0, 30)
      : [],
    trustGroups: Array.isArray((t as unknown as { trustGroups?: unknown }).trustGroups)
      ? ((t as unknown as { trustGroups?: unknown }).trustGroups as unknown[])
          .map((g) => sanitizeText(g, 80))
          .filter(Boolean)
          .slice(0, 12)
      : undefined,
    legalLinks: Array.isArray((t as unknown as { legalLinks?: unknown }).legalLinks)
      ? ((t as unknown as { legalLinks?: unknown }).legalLinks as unknown[])
          .map((x) => {
            const r = asRecord(x);
            if (!r) return null;
            const label = sanitizeText(r.label, 30);
            const href = normalizeHrefForUi(r.href);
            if (!label || !href) return null;
            return { label, href } satisfies ThemeLegalLink;
          })
          .filter((v): v is ThemeLegalLink => Boolean(v))
          .slice(0, 12)
      : defaults.legalLinks,
    uiText: (() => {
      const rawUi = (t as unknown as { uiText?: unknown }).uiText;
      const rec = rawUi && typeof rawUi === "object" && !Array.isArray(rawUi) ? (rawUi as Record<string, unknown>) : null;
      if (!rec) return {};
      const out: Record<string, string> = {};
      for (const [k0, v0] of Object.entries(rec)) {
        const k = k0.toLowerCase().replace(/[^a-z0-9_]/g, "");
        if (!k) continue;
        if (typeof v0 !== "string") continue;
        const v = sanitizeText(v0, 160);
        if (!v) continue;
        out[k] = v;
      }
      return out;
    })(),
    quickActions: Array.isArray(t.quickActions)
      ? t.quickActions
          .map((a) => ({
            label: sanitizeText(a.label, 60),
            url: normalizeUrlForUi(a.url) ?? "",
            iconUrl: normalizeUrlForUi(a.iconUrl),
            iconKey: a.iconKey ? sanitizeText(a.iconKey, 40) : null,
            style: (a.style === "dark" ? "dark" : "gold") as "dark" | "gold"
          }))
          .filter((a) => Boolean(a.label) && Boolean(a.url))
          .slice(0, 20)
      : [],
    floatingActions: Array.isArray(t.floatingActions)
      ? t.floatingActions
          .map((a) => ({
            label: sanitizeText(a.label, 60),
            url: normalizeUrlForUi(a.url) ?? "",
            variant: (a.variant === "complain" ? "complain" : "subscribe") as "complain" | "subscribe",
            iconKey: a.iconKey ? sanitizeText(a.iconKey, 40) : null,
            iconUrl: normalizeUrlForUi(a.iconUrl)
          }))
          .filter((a) => Boolean(a.label) && Boolean(a.url))
          .slice(0, 6)
      : [],
    bottomNav: Array.isArray(t.bottomNav)
      ? t.bottomNav
          .map((x) => ({
            href: sanitizeText(x.href, 200),
            label: sanitizeText(x.label, 30),
            icon: x.icon ? sanitizeText(x.icon, 10) : null,
            iconUrl: normalizeUrlForUi(x.iconUrl),
            badge: x.badge ? sanitizeText(x.badge, 20) : null
          }))
          .filter((x) => Boolean(x.href) && Boolean(x.label))
          .slice(0, 10)
      : defaults.bottomNav,
    uiGameCategories: Array.isArray(t.uiGameCategories)
      ? t.uiGameCategories.map((s) => sanitizeText(s, 30)).filter(Boolean).slice(0, 12)
      : defaults.uiGameCategories,
    categoryPills: Array.isArray(t.categoryPills)
      ? t.categoryPills
          .map((p) => ({ id: sanitizeText(p.id, 30), label: sanitizeText(p.label, 30) }))
          .filter((p) => Boolean(p.id) && Boolean(p.label))
          .slice(0, 20)
      : defaults.categoryPills,
    socialStyle: t.socialStyle === "CUBE" ? "CUBE" : "COIN",
    downloadBar: {
      enabled: Boolean(t.downloadBar?.enabled),
      imageUrl: normalizeUrlForUi(t.downloadBar?.imageUrl),
      title: t.downloadBar?.title ? sanitizeText(t.downloadBar.title, 60) : null,
      subtitle: t.downloadBar?.subtitle ? sanitizeText(t.downloadBar.subtitle, 120) : null,
      ctaText: t.downloadBar?.ctaText ? sanitizeText(t.downloadBar.ctaText, 40) : null,
      ctaUrl: normalizeUrlForUi(t.downloadBar?.ctaUrl)
    },
    ageGate: {
      enabled: Boolean(t.ageGate?.enabled),
      title: sanitizeText(t.ageGate?.title, 80) || defaults.ageGate.title,
      content: sanitizeText(t.ageGate?.content, 500) || defaults.ageGate.content
    }
  };

  return JSON.parse(JSON.stringify(out)) as Prisma.InputJsonValue;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

export function parseThemeJson(raw: Prisma.JsonValue | unknown): ThemeConfig {
  const obj = asRecord(raw);
  if (!obj) return defaults;
  const heroBanners = Array.isArray(obj.heroBanners)
    ? obj.heroBanners
        .map((item) => {
          const row = asRecord(item);
          if (!row) return null;
          // Backward-compatible: accept older field names from old theme versions.
          const imageUrl = normalizeUrlForUi(row.imageUrl ?? row.logoUrl ?? row.url ?? row.src);
          if (!imageUrl) return null;
          return {
            imageUrl,
            linkUrl: normalizeUrlForUi(row.linkUrl),
            title: asString(row.title)
          };
        })
        .filter((v): v is ThemeBanner => Boolean(v))
    : [];
  const subsidiaries = Array.isArray(obj.subsidiaries)
    ? obj.subsidiaries
        .map((item) => {
          const row = asRecord(item);
          if (!row) return null;
          // Backward-tolerant: accept either imageUrl or logoUrl for this slot.
          const imageUrl = normalizeUrlForUi(row.imageUrl ?? row.logoUrl);
          if (!imageUrl) return null;
          return {
            imageUrl,
            linkUrl: normalizeUrlForUi(row.linkUrl),
            title: asString(row.title)
          };
        })
        .filter((v): v is ThemeBanner => Boolean(v))
    : [];
  const socialLinks = Array.isArray(obj.socialLinks)
    ? obj.socialLinks
        .map((item) => {
          const row = asRecord(item);
          if (!row) return null;
          const type = asString(row.type)?.toLowerCase();
          const label = asString(row.label);
          const url = normalizeUrlForUi(row.url);
          if (!type || !label || !url) return null;
          if (!["whatsapp", "telegram", "livechat", "facebook", "robot"].includes(type)) return null;
          return { type: type as ThemeSocial["type"], label, url, iconUrl: normalizeUrlForUi(row.iconUrl) };
        })
        .filter((v): v is ThemeSocial => Boolean(v))
    : [];
  const trustBadges = Array.isArray(obj.trustBadges)
    ? obj.trustBadges
        .map((item) => {
          const row = asRecord(item);
          if (!row) return null;
          const imageUrl = normalizeUrlForUi(row.imageUrl);
          const group = asString(row.group) ?? "GENERAL";
          if (!imageUrl) return null;
          return { group, imageUrl, title: asString(row.title) };
        })
        .filter((v): v is ThemeConfig["trustBadges"][number] => Boolean(v))
    : [];
  const socialStyle = asString(obj.socialStyle)?.toUpperCase() === "CUBE" ? "CUBE" : "COIN";
  const quickActions = Array.isArray(obj.quickActions)
    ? obj.quickActions
        .map((item) => {
          const row = asRecord(item);
          if (!row) return null;
          const label = asString(row.label);
          const url = normalizeUrlForUi(row.url);
          if (!label || !url) return null;
          return {
            label,
            url,
            iconUrl: normalizeUrlForUi(row.iconUrl),
            iconKey: asString(row.iconKey),
            style: asString(row.style)?.toLowerCase() === "dark" ? "dark" : "gold"
          } satisfies ThemeConfig["quickActions"][number];
        })
        .filter((v): v is ThemeConfig["quickActions"][number] => Boolean(v))
    : [];
  const floatingActions = Array.isArray(obj.floatingActions)
    ? obj.floatingActions
        .map((item) => {
          const row = asRecord(item);
          if (!row) return null;
          const label = asString(row.label);
          const url = normalizeUrlForUi(row.url);
          if (!label || !url) return null;
          return {
            label,
            url,
            variant: asString(row.variant)?.toLowerCase() === "complain" ? "complain" : "subscribe",
            iconKey: asString(row.iconKey),
            iconUrl: normalizeUrlForUi(row.iconUrl)
          } satisfies ThemeConfig["floatingActions"][number];
        })
        .filter((v): v is ThemeConfig["floatingActions"][number] => Boolean(v))
    : [];
  const drow = asRecord(obj.downloadBar);
  const arow = asRecord(obj.ageGate);
  const marqueeMessages = Array.isArray(obj.marqueeMessages)
    ? obj.marqueeMessages.map((m) => asString(m)).filter((s): s is string => Boolean(s))
    : [];

  const sectionTitles = (() => {
    const k = asRecord(obj.sectionTitles);
    if (!k) return defaults.sectionTitles;
    return {
      quickActions: asString(k.quickActions) ?? defaults.sectionTitles.quickActions,
      liveTransaction: asString(k.liveTransaction) ?? defaults.sectionTitles.liveTransaction,
      gameZone: asString(k.gameZone) ?? defaults.sectionTitles.gameZone,
      social: asString(k.social) ?? defaults.sectionTitles.social
    } satisfies ThemeSectionTitles;
  })();

  const routes = (() => {
    const k = asRecord(obj.routes);
    if (!k) return defaults.routes;
    return {
      promotion: normalizeUrlForUi(k.promotion) ?? defaults.routes.promotion,
      bonus: normalizeUrlForUi(k.bonus) ?? defaults.routes.bonus
    } satisfies ThemeRoutes;
  })();
  const promotionPattern = (() => {
    const s = asString(obj.promotionPattern);
    if (s === "image_tiles" || s === "image_strips" || s === "classic") return s;
    return defaults.promotionPattern;
  })();
  const promotionFontPreset = (() => {
    const s = asString(obj.promotionFontPreset);
    if (s === "compact" || s === "bold" || s === "default") return s;
    return defaults.promotionFontPreset;
  })();
  const designStyle = (() => {
    const s = asString(obj.designStyle);
    if (s === "minimal" || s === "luxury" || s === "gaming" || s === "soft" || s === "default") return s;
    return undefined;
  })();

  const bottomNav = (() => {
    const list = Array.isArray(obj.bottomNav)
      ? obj.bottomNav
          .map((item) => {
            const row = asRecord(item);
            if (!row) return null;
            const href = normalizeUrlForUi(row.href);
            const label = asString(row.label);
            if (!href || !label) return null;
            return {
              href,
              label,
              icon: asString(row.icon),
              iconUrl: normalizeUrlForUi(row.iconUrl),
              badge: asString(row.badge)
            } satisfies ThemeBottomNavItem;
          })
          .filter((v): v is ThemeBottomNavItem => Boolean(v))
      : [];
    return list.length > 0 ? list : defaults.bottomNav;
  })();

  const uiGameCategories = (() => {
    const list = Array.isArray(obj.uiGameCategories)
      ? obj.uiGameCategories.map((x) => asString(x)).filter((s): s is string => Boolean(s))
      : [];
    return list.length > 0 ? list : defaults.uiGameCategories;
  })();

  const categoryPills = (() => {
    const list = Array.isArray(obj.categoryPills)
      ? obj.categoryPills
          .map((item) => {
            const row = asRecord(item);
            if (!row) return null;
            const id = asString(row.id);
            const label = asString(row.label);
            if (!id || !label) return null;
            return { id, label } satisfies ThemeCategoryPill;
          })
          .filter((v): v is ThemeCategoryPill => Boolean(v))
      : [];
    return list.length > 0 ? list : defaults.categoryPills;
  })();

  const trustGroups = (() => {
    const list = Array.isArray(obj.trustGroups) ? obj.trustGroups.map((x) => asString(x)).filter((s): s is string => Boolean(s)) : [];
    return list.length > 0 ? list : undefined;
  })();

  const legalLinks = (() => {
    const list = Array.isArray(obj.legalLinks)
      ? obj.legalLinks
          .map((item) => {
            const row = asRecord(item);
            if (!row) return null;
            const label = asString(row.label);
            const href = normalizeHrefForUi(row.href);
            if (!label || !href) return null;
            return { label, href } satisfies ThemeLegalLink;
          })
          .filter((v): v is ThemeLegalLink => Boolean(v))
      : [];
    return list.length > 0 ? list : defaults.legalLinks;
  })();

  const uiText = (() => {
    const rec = asRecord(obj.uiText);
    if (!rec) return defaults.uiText;
    const out: Record<string, string> = {};
    for (const [k0, v0] of Object.entries(rec)) {
      const k = k0.toLowerCase().replace(/[^a-z0-9_]/g, "");
      const v = asString(v0);
      if (!k || !v) continue;
      out[k] = v;
    }
    return out;
  })();

  return {
    siteName: asString(obj.siteName) ?? defaults.siteName,
    logoUrl: normalizeUrlForUi(obj.logoUrl),
    announcementMarqueeText: asString(obj.announcementMarqueeText),
    marqueeMessages,
    heroBanners,
    subsidiaries,
    secondaryBannerUrl: normalizeUrlForUi(obj.secondaryBannerUrl),
    socialLinks,
    trustBadges,
    trustGroups,
    legalLinks,
    uiText,
    chatDefaultUrl: normalizeUrlForUi(obj.chatDefaultUrl),
    socialStyle,
    quickActions,
    downloadBar: {
      enabled: asBoolean(drow?.enabled, false),
      imageUrl: normalizeUrlForUi(drow?.imageUrl),
      title: asString(drow?.title),
      subtitle: asString(drow?.subtitle),
      ctaText: asString(drow?.ctaText),
      ctaUrl: normalizeUrlForUi(drow?.ctaUrl)
    },
    floatingActions,
    depositUrl: normalizeUrlForUi(obj.depositUrl),
    withdrawUrl: normalizeUrlForUi(obj.withdrawUrl),
    loginUrl: normalizeUrlForUi(obj.loginUrl),
    registerUrl: normalizeUrlForUi(obj.registerUrl),
    ageGate: {
      enabled: asBoolean(arow?.enabled, false),
      title: asString(arow?.title) ?? defaults.ageGate.title,
      content: asString(arow?.content) ?? defaults.ageGate.content
    },
    partnershipBadgeUrl: normalizeUrlForUi(obj.partnershipBadgeUrl),
    centerSlotImageUrl: normalizeUrlForUi(obj.centerSlotImageUrl),
    actionBarDepositColor: asString(obj.actionBarDepositColor),
    actionBarWithdrawColor: asString(obj.actionBarWithdrawColor),
    actionBarButtonImages: (() => {
      const k = asRecord(obj.actionBarButtonImages);
      if (!k) return defaults.actionBarButtonImages;
      return {
        login: normalizeUrlForUi(k.login),
        register: normalizeUrlForUi(k.register),
        deposit: normalizeUrlForUi(k.deposit),
        withdraw: normalizeUrlForUi(k.withdraw),
        refresh: normalizeUrlForUi(k.refresh),
        signout: normalizeUrlForUi(k.signout)
      };
    })(),
    actionBarLimits: (() => {
      const k = asRecord(obj.actionBarLimits);
      if (!k) return defaults.actionBarLimits;
      return {
        minDeposit: asString(k.minDeposit),
        maxDeposit: asString(k.maxDeposit),
        minWithdraw: asString(k.minWithdraw),
        maxWithdraw: asString(k.maxWithdraw)
      };
    })(),
    liveTxBgImageUrl: normalizeUrlForUi(obj.liveTxBgImageUrl),
    pageBackgroundUrl: normalizeUrlForUi(obj.pageBackgroundUrl),
    pageBackgroundColor: asString(obj.pageBackgroundColor),
    themePrimaryColor: sanitizeCssColor(asString(obj.themePrimaryColor)),
    themeAccentColor: sanitizeCssColor(asString(obj.themeAccentColor)),
    vividBg: sanitizeCssColor(asString(obj.vividBg)),
    vividCard: sanitizeCssColor(asString(obj.vividCard)),
    vividCard2: sanitizeCssColor(asString(obj.vividCard2)),
    vividBorder: sanitizeCssColor(asString(obj.vividBorder)) || asString(obj.vividBorder),
    vividText: sanitizeCssColor(asString(obj.vividText)),
    vividMuted: sanitizeCssColor(asString(obj.vividMuted)),
    vividGreen: sanitizeCssColor(asString(obj.vividGreen)),
    vividRed: sanitizeCssColor(asString(obj.vividRed)),
    vividGold: sanitizeCssColor(asString(obj.vividGold)),
    deskBg: sanitizeCssColor(asString(obj.deskBg)),
    deskPanel: sanitizeCssColor(asString(obj.deskPanel)),
    deskAccent: sanitizeCssColor(asString(obj.deskAccent)),
    livetxDepositColor: sanitizeCssColor(asString(obj.livetxDepositColor)),
    livetxWithdrawColor: sanitizeCssColor(asString(obj.livetxWithdrawColor)),
    fontFamily: asString(obj.fontFamily),
    fontSize: asString(obj.fontSize),
    vpRadiusCard: asString(obj.vpRadiusCard),
    vpRadiusBtn: asString(obj.vpRadiusBtn),
    vpGap: asString(obj.vpGap),
    vpMaxWidth: asString(obj.vpMaxWidth),
    deskContainer: asString(obj.deskContainer),
    deskBannerH: asString(obj.deskBannerH),
    referralBlockBg: sanitizeCssColor(asString(obj.referralBlockBg)) || asString(obj.referralBlockBg),
    referralBlockBorder: sanitizeCssColor(asString(obj.referralBlockBorder)) || asString(obj.referralBlockBorder),
    chatFabBg: sanitizeCssColor(asString(obj.chatFabBg)),
    frontAccent: sanitizeCssColor(asString(obj.frontAccent)),
    frontSuccess: sanitizeCssColor(asString(obj.frontSuccess)),
    frontDanger: sanitizeCssColor(asString(obj.frontDanger)),
    frontGold: sanitizeCssColor(asString(obj.frontGold)),
    vpTopbarBg: sanitizeCssColor(asString(obj.vpTopbarBg)) || asString(obj.vpTopbarBg),
    vpTopbarBorder: sanitizeCssColor(asString(obj.vpTopbarBorder)) || asString(obj.vpTopbarBorder),
    marqueeBg: sanitizeCssColor(asString(obj.marqueeBg)),
    marqueeBorder: sanitizeCssColor(asString(obj.marqueeBorder)) || asString(obj.marqueeBorder),
    marqueeTextColor: sanitizeCssColor(asString(obj.marqueeTextColor)),
    sectionTitles,
    routes,
    designStyle,
    promotionPattern,
    promotionFontPreset,
    bottomNav,
    uiGameCategories,
    categoryPills,
    vividPromoCardConfig: (() => {
      const v = asRecord(obj.vividPromoCardConfig);
      const h = typeof v?.imgHeight === "number" && v.imgHeight >= 80 && v.imgHeight <= 600 ? v.imgHeight : 180;
      return {
        imgHeight: h,
        showPercent: v?.showPercent !== false,
        showSubtitle: v?.showSubtitle !== false,
        showTnc: v?.showTnc !== false,
        columns: v?.columns === 2 ? 2 : 3
      };
    })()
  };
}

export function resolveChatUrl(theme: ThemeConfig, fallbackSocial: Array<{ label: string; url: string }>) {
  void theme;
  void fallbackSocial;
  // Unified entry point: always go through our in-site "/chat" landing.
  // That page will auto-redirect to WhatsApp/Telegram or /chat/ proxy and provide a reliable fallback UI.
  return "/chat";
}

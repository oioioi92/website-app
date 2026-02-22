import { z } from "zod";

function stripControlAndTrim(s: string) {
  return s.replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

function safeText(maxLen: number) {
  return z
    .string()
    .transform((s) => stripControlAndTrim(s))
    .transform((s) => s.replace(/[<>]/g, "")) // extra hardening against HTML injection
    .refine((s) => s.length <= maxLen, `TEXT_TOO_LONG_${maxLen}`);
}

function optionalText(maxLen: number) {
  return z
    .string()
    .optional()
    .nullable()
    .transform((s) => (typeof s === "string" ? stripControlAndTrim(s) : ""))
    .transform((s) => s.replace(/[<>]/g, ""))
    .transform((s) => (s.length ? s.slice(0, maxLen) : null));
}

function isBadScheme(url: string) {
  return /^(javascript:|data:|blob:)/i.test(url);
}

function normalizeUrl(raw: string) {
  const s = stripControlAndTrim(raw);
  if (!s) return null;
  if (isBadScheme(s)) return null;

  // Allow site-absolute paths.
  if (s.startsWith("/")) return s;

  // Upgrade http -> https to make stored canonical form "https only".
  if (s.startsWith("http://")) return `https://${s.slice("http://".length)}`;

  // Allow https absolute.
  if (s.startsWith("https://")) return s;

  // Protocol-relative -> https.
  if (s.startsWith("//")) return `https:${s}`;

  // Looks like host/path without protocol.
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(s) || s.startsWith("www.")) return `https://${s}`;

  // Otherwise reject (avoid ambiguous inputs).
  return null;
}

function urlAllowRelativeOrHttps(opts?: { forbidSvg?: boolean }) {
  return z
    .string()
    .max(500)
    .transform((s) => normalizeUrl(s))
    .refine((s) => s === null || typeof s === "string", "INVALID_URL")
    .refine((s) => {
      if (!opts?.forbidSvg) return true;
      if (!s) return true;
      // disallow ".svg" (also blocks ".svg?x=1")
      return !/\.svg(\?|#|$)/i.test(s);
    }, "SVG_FORBIDDEN")
    .nullable()
    .optional()
    .transform((s) => (typeof s === "string" && s.length ? s : null));
}

const bannerSchema = z.object({
  imageUrl: z.string().max(500).transform((s) => normalizeUrl(s) ?? "").refine((s) => !!s, "IMAGE_URL_REQUIRED").refine((s) => !/\.svg(\?|#|$)/i.test(s), "SVG_FORBIDDEN"),
  linkUrl: urlAllowRelativeOrHttps(),
  title: optionalText(80)
});

const socialSchema = z.object({
  type: z.enum(["whatsapp", "telegram", "livechat", "facebook", "robot"]),
  label: safeText(60),
  url: z.string().max(500).transform((s) => normalizeUrl(s) ?? "").refine((s) => !!s, "URL_REQUIRED"),
  iconUrl: urlAllowRelativeOrHttps({ forbidSvg: true })
});

const trustSchema = z.object({
  group: safeText(80),
  imageUrl: z.string().max(500).transform((s) => normalizeUrl(s) ?? "").refine((s) => !!s, "IMAGE_URL_REQUIRED").refine((s) => !/\.svg(\?|#|$)/i.test(s), "SVG_FORBIDDEN"),
  title: optionalText(80)
});

const quickActionSchema = z.object({
  label: safeText(60),
  url: z.string().max(500).transform((s) => normalizeUrl(s) ?? "").refine((s) => !!s, "URL_REQUIRED"),
  iconUrl: urlAllowRelativeOrHttps({ forbidSvg: true }),
  iconKey: optionalText(40),
  style: z.enum(["gold", "dark"]).default("gold")
});

const floatingActionSchema = z.object({
  label: safeText(60),
  url: z.string().max(500).transform((s) => normalizeUrl(s) ?? "").refine((s) => !!s, "URL_REQUIRED"),
  variant: z.enum(["subscribe", "complain"]).default("subscribe"),
  iconKey: optionalText(40)
});

const sectionTitlesSchema = z.object({
  quickActions: safeText(40),
  liveTransaction: safeText(40),
  gameZone: safeText(40),
  social: safeText(40)
});

const routesSchema = z.object({
  promotion: z.string().max(120).transform((s) => (stripControlAndTrim(s).startsWith("/") ? stripControlAndTrim(s) : "/promotion")),
  bonus: z.string().max(120).transform((s) => (stripControlAndTrim(s).startsWith("/") ? stripControlAndTrim(s) : "/bonus"))
});

const bottomNavItemSchema = z.object({
  href: z.string().max(200).transform((s) => normalizeUrl(s) ?? ""),
  label: safeText(30),
  icon: optionalText(10),
  badge: optionalText(20)
});

const categoryPillSchema = z.object({
  id: safeText(30),
  label: safeText(30)
});

const ageGateSchema = z.object({
  enabled: z.boolean().default(false),
  title: safeText(80),
  content: safeText(500)
});

const downloadBarSchema = z.object({
  enabled: z.boolean().default(false),
  imageUrl: urlAllowRelativeOrHttps({ forbidSvg: true }),
  title: optionalText(60),
  subtitle: optionalText(120),
  ctaText: optionalText(40),
  ctaUrl: urlAllowRelativeOrHttps()
});

const actionBarButtonImagesSchema = z.object({
  login: urlAllowRelativeOrHttps({ forbidSvg: true }),
  register: urlAllowRelativeOrHttps({ forbidSvg: true }),
  deposit: urlAllowRelativeOrHttps({ forbidSvg: true }),
  withdraw: urlAllowRelativeOrHttps({ forbidSvg: true }),
  refresh: urlAllowRelativeOrHttps({ forbidSvg: true }),
  signout: urlAllowRelativeOrHttps({ forbidSvg: true })
});

const actionBarLimitsSchema = z.object({
  minDeposit: optionalText(60),
  maxDeposit: optionalText(60),
  minWithdraw: optionalText(60),
  maxWithdraw: optionalText(60)
});

export const themeSchema = z.object({
  siteName: safeText(80).default("Site"),
  logoUrl: urlAllowRelativeOrHttps({ forbidSvg: true }),
  announcementMarqueeText: optionalText(300),
  marqueeMessages: z.array(safeText(300)).max(30).default([]),

  heroBanners: z.array(bannerSchema).max(12).default([]),
  subsidiaries: z.array(bannerSchema).max(50).default([]),
  secondaryBannerUrl: urlAllowRelativeOrHttps({ forbidSvg: true }),

  socialLinks: z.array(socialSchema).max(12).default([]),
  trustBadges: z.array(trustSchema).max(20).default([]),
  chatDefaultUrl: urlAllowRelativeOrHttps(),
  socialStyle: z.enum(["COIN", "CUBE"]).default("COIN"),

  quickActions: z.array(quickActionSchema).max(12).default([]),
  floatingActions: z.array(floatingActionSchema).max(12).default([]),

  depositUrl: urlAllowRelativeOrHttps(),
  withdrawUrl: urlAllowRelativeOrHttps(),
  loginUrl: urlAllowRelativeOrHttps(),
  registerUrl: urlAllowRelativeOrHttps(),

  ageGate: ageGateSchema.default({ enabled: false, title: "Age Confirmation", content: "This website is for users aged 18 and above." }),
  downloadBar: downloadBarSchema.default({ enabled: false, imageUrl: null, title: null, subtitle: null, ctaText: null, ctaUrl: null }),

  partnershipBadgeUrl: urlAllowRelativeOrHttps({ forbidSvg: true }),
  centerSlotImageUrl: urlAllowRelativeOrHttps({ forbidSvg: true }),

  actionBarDepositColor: optionalText(60),
  actionBarWithdrawColor: optionalText(60),
  actionBarButtonImages: actionBarButtonImagesSchema.default({
    login: null,
    register: null,
    deposit: null,
    withdraw: null,
    refresh: null,
    signout: null
  }),
  actionBarLimits: actionBarLimitsSchema.default({
    minDeposit: null,
    maxDeposit: null,
    minWithdraw: null,
    maxWithdraw: null
  }),
  liveTxBgImageUrl: urlAllowRelativeOrHttps({ forbidSvg: true }),

  sectionTitles: sectionTitlesSchema.default({
    quickActions: "QUICK ACTIONS",
    liveTransaction: "LIVE TRANSACTION",
    gameZone: "GAME ZONE",
    social: "SOCIAL"
  }),
  routes: routesSchema.default({ promotion: "/promotion", bonus: "/bonus" }),

  bottomNav: z.array(bottomNavItemSchema).max(10).default([]),
  uiGameCategories: z.array(safeText(30)).max(12).default([]),
  categoryPills: z.array(categoryPillSchema).max(20).default([])
});

export type CanonicalTheme = z.infer<typeof themeSchema>;


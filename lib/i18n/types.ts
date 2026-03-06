/** 前台与后台支持的界面语言 */
export type Locale = "zh" | "en" | "ms";

export const LOCALE_LABELS: Record<Locale, string> = {
  zh: "华语",
  en: "English",
  ms: "Bahasa Melayu",
};

export const LOCALE_TO_HTML_LANG: Record<Locale, string> = {
  zh: "zh-CN",
  en: "en",
  ms: "ms",
};

export const DEFAULT_LOCALE: Locale = "en";

export const COOKIE_NAME = "NEXT_LOCALE";

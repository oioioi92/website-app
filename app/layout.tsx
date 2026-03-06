import { cookies } from "next/headers";
import type { Metadata, Viewport } from "next";
import { Montserrat, Inter, Noto_Sans_SC, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/context";
import { ClickEffect } from "@/components/ClickEffect";
import { COOKIE_NAME, DEFAULT_LOCALE, LOCALE_TO_HTML_LANG, type Locale } from "@/lib/i18n/types";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-promo-heading", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-promo-body", display: "swap" });
const notoSansSC = Noto_Sans_SC({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-promo-cjk", display: "swap" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-promo-elegant", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "KINGDOM888";
  try {
    const { getPublicTheme } = await import("@/lib/theme/getPublicTheme");
    const { theme } = await getPublicTheme();
    if (theme.siteName && theme.siteName !== "Site") siteName = theme.siteName;
  } catch {
    // fallback to default
  }
  return {
    title: siteName,
    description: `${siteName} — Online Gaming Portal`,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  // 键盘弹出时不改变视口大小，保持画面与未打字时一致（不放大/不缩小）
  interactiveWidget: "overlays-content",
};

function parseLocale(value: string | undefined): Locale {
  if (value === "zh" || value === "en" || value === "ms") return value;
  return DEFAULT_LOCALE;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(COOKIE_NAME)?.value;
  const initialLocale = parseLocale(localeCookie);
  const htmlLang = LOCALE_TO_HTML_LANG[initialLocale];

  return (
    <html lang={htmlLang} className={`w-full ${montserrat.variable} ${inter.variable} ${notoSansSC.variable} ${playfairDisplay.variable}`}>
      <body className="w-full min-w-0 overflow-x-hidden">
        <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
        <ClickEffect />
      </body>
    </html>
  );
}

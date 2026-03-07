import type { ReactNode } from "react";
import { MobileShell } from "@/components/public/MobileShell";
import { db } from "@/lib/db";
import { resolveChatUrl } from "@/lib/public/theme";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
export const dynamic = "force-dynamic";

function safeJsonForInlineScript(obj: unknown): string {
  // Prevent `</script>` breakouts.
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  let theme: Awaited<ReturnType<typeof getPublicTheme>>["theme"];
  try {
    const themeRes = await getPublicTheme();
    theme = themeRes.theme;
  } catch {
    const { parseThemeJson } = await import("@/lib/public/theme");
    theme = parseThemeJson(null);
  }
  let social: Array<{ label: string; url: string }> = [];
  const uiAssetOverrides: Record<string, string> = {};
  try {
    const socialRows = await db.socialLink.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      select: { label: true, url: true },
      take: 5
    });
    social = socialRows;
    const row = await db.siteSetting.findUnique({ where: { key: "ui_asset_overrides" }, select: { valueJson: true } });
    const obj =
      row?.valueJson && typeof row.valueJson === "object" && !Array.isArray(row.valueJson)
        ? (row.valueJson as Record<string, unknown>)
        : {};
    const byName =
      obj.byName && typeof obj.byName === "object" && !Array.isArray(obj.byName)
        ? (obj.byName as Record<string, unknown>)
        : {};
    for (const [k, v] of Object.entries(byName)) {
      if (typeof k === "string" && typeof v === "string") uiAssetOverrides[k] = v;
    }
  } catch {
    // DATABASE_URL 未配置或数据库不可用时使用默认值，网站仍可打开
  }
  const chatUrl = resolveChatUrl(theme, social);
  const primaryColor = theme?.themePrimaryColor ?? null;
  const accentColor = theme?.themeAccentColor ?? null;
  const vpVars: string[] = [];
  if (primaryColor) vpVars.push(`--vp-accent: ${primaryColor}`);
  if (accentColor) vpVars.push(`--vp-accent2: ${accentColor}`);
  if (theme?.vividBg) vpVars.push(`--vp-bg: ${theme.vividBg}`);
  if (theme?.vividCard) vpVars.push(`--vp-card: ${theme.vividCard}`);
  if (theme?.vividCard2) vpVars.push(`--vp-card2: ${theme.vividCard2}`);
  if (theme?.vividBorder) vpVars.push(`--vp-border: ${theme.vividBorder}`);
  if (theme?.vividText) vpVars.push(`--vp-text: ${theme.vividText}`);
  if (theme?.vividMuted) vpVars.push(`--vp-muted: ${theme.vividMuted}`);
  if (theme?.vividGreen) vpVars.push(`--vp-green: ${theme.vividGreen}`);
  if (theme?.vividRed) vpVars.push(`--vp-red: ${theme.vividRed}`);
  if (theme?.vividGold) vpVars.push(`--vp-gold: ${theme.vividGold}`);
  if (theme?.vpRadiusCard) vpVars.push(`--vp-r-card: ${theme.vpRadiusCard}`);
  if (theme?.vpRadiusBtn) vpVars.push(`--vp-r-btn: ${theme.vpRadiusBtn}`);
  if (theme?.vpGap) vpVars.push(`--vp-gap: ${theme.vpGap}`);
  if (theme?.vpMaxWidth) vpVars.push(`--vp-w: ${theme.vpMaxWidth}`);
  if (theme?.vpTopbarBg) vpVars.push(`--vp-topbar-bg: ${theme.vpTopbarBg}`);
  if (theme?.vpTopbarBorder) vpVars.push(`--vp-topbar-border: ${theme.vpTopbarBorder}`);
  if (theme?.marqueeBg) vpVars.push(`--vp-marquee-bg: ${theme.marqueeBg}`);
  if (theme?.marqueeBorder) vpVars.push(`--vp-marquee-border: ${theme.marqueeBorder}`);
  if (theme?.marqueeTextColor) vpVars.push(`--vp-marquee-text: ${theme.marqueeTextColor}`);
  const deskVars: string[] = [];
  if (theme?.deskBg) deskVars.push(`--desk-bg: ${theme.deskBg}`);
  if (theme?.deskPanel) deskVars.push(`--desk-panel: ${theme.deskPanel}`);
  if (theme?.deskAccent) deskVars.push(`--desk-accent: ${theme.deskAccent}`);
  if (theme?.deskContainer) deskVars.push(`--desk-container: ${theme.deskContainer}`);
  if (theme?.deskBannerH) deskVars.push(`--desk-banner-h: ${theme.deskBannerH}`);
  const rootVars: string[] = [];
  if (theme?.frontAccent) rootVars.push(`--front-accent: ${theme.frontAccent}`);
  if (theme?.frontSuccess) rootVars.push(`--front-success: ${theme.frontSuccess}`);
  if (theme?.frontDanger) rootVars.push(`--front-danger: ${theme.frontDanger}`);
  if (theme?.frontGold) rootVars.push(`--front-gold: ${theme.frontGold}`);
  const fontFamilyCss = theme?.fontFamily ? `font-family: ${theme.fontFamily.includes(" ") ? `"${theme.fontFamily.replace(/"/g, "")}"` : theme.fontFamily};` : "";
  const fontSizeCss = theme?.fontSize ? `font-size: ${theme.fontSize};` : "";
  const vpStyle = (vpVars.length || fontFamilyCss || fontSizeCss) ? `.vp-shell { ${vpVars.join("; ")}${vpVars.length ? "; " : ""}${fontFamilyCss} ${fontSizeCss} }` : "";
  const deskStyle = deskVars.length ? `.public-desktop-shell { ${deskVars.join("; ")} }` : "";
  const rootStyle = rootVars.length ? `:root { ${rootVars.join("; ")} }` : "";
  // 整页背景：直接覆盖 .vp-shell 的 background（vivid-portal.css 默认渐变会被此处 !important 替换）
  let pageBgStyle = "";
  if (theme?.pageBackgroundUrl || theme?.pageBackgroundColor) {
    const safeUrl = theme.pageBackgroundUrl?.replace(/\\/g, "\\\\").replace(/"/g, '\\"') ?? "";
    const colorLayer = theme.pageBackgroundColor ?? "#080810";
    // background-image 用多层：自定义图 在最上，保留紫色光晕渐变，最底是纯色
    const bgImage = safeUrl
      ? `url("${safeUrl}"), radial-gradient(ellipse 70% 50% at 80% -10%, rgba(140,60,255,0.14) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 20% 90%, rgba(100,80,255,0.09) 0%, transparent 60%)`
      : `radial-gradient(ellipse 70% 50% at 80% -10%, rgba(140,60,255,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 20% 90%, rgba(100,80,255,0.12) 0%, transparent 60%)`;
    pageBgStyle = [
      `.vp-shell { background-image: ${bgImage} !important; background-color: ${colorLayer} !important; background-size: cover, auto, auto !important; background-position: center, center, center !important; background-attachment: fixed !important; }`,
      // 同时覆盖 .min-h-screen 防止白边
      `body:has(.vp-shell) .min-h-screen { background: ${colorLayer} !important; }`,
    ].join("\n");
  }
  // 整体设计风格预设：圆角、主色、整页氛围（用 data-design-style 确保命中）
  const hasCustomPageBg = Boolean(theme?.pageBackgroundUrl || theme?.pageBackgroundColor);
  const designPresetsBg: Record<string, string> = hasCustomPageBg ? {} : {
    minimal: "[data-design-style=minimal].min-h-screen { background: #0f1115 !important; }",
    luxury: "[data-design-style=luxury].min-h-screen { background: linear-gradient(180deg, #1a1510 0%, #0f0d0a 50%, #0a0806 100%) !important; }",
    gaming: "[data-design-style=gaming].min-h-screen { background: linear-gradient(135deg, #0d0a14 0%, #0f0d1a 50%, #0a0812 100%) !important; }",
    soft: "[data-design-style=soft].min-h-screen { background: linear-gradient(180deg, #121118 0%, #0e0d12 100%) !important; }",
  };
  const designPresetsVars: Record<string, string> = {
    minimal: "[data-design-style=minimal] .vp-shell { --vp-r-card: 8px; --vp-r-btn: 6px; --vp-accent: #94a3b8; --vp-accent2: #64748b; --vp-border: rgba(255,255,255,0.08); --vp-topbar-bg: rgba(15,17,21,0.97); --vp-topbar-border: rgba(255,255,255,0.1); }",
    luxury: "[data-design-style=luxury] .vp-shell { --vp-r-card: 20px; --vp-r-btn: 14px; --vp-accent: #d4af37; --vp-accent2: #f4e4bc; --vp-gold: #d4af37; --vp-border: rgba(212,175,55,0.35); --vp-topbar-bg: rgba(26,21,16,0.97); --vp-topbar-border: rgba(212,175,55,0.4); }",
    gaming: "[data-design-style=gaming] .vp-shell { --vp-r-card: 12px; --vp-r-btn: 10px; --vp-accent: #a855f7; --vp-accent2: #06b6d4; --vp-border: rgba(168,85,247,0.45); --vp-topbar-bg: rgba(13,10,20,0.97); --vp-topbar-border: rgba(168,85,247,0.5); }",
    soft: "[data-design-style=soft] .vp-shell { --vp-r-card: 24px; --vp-r-btn: 16px; --vp-border: rgba(255,255,255,0.12); --vp-topbar-border: rgba(255,255,255,0.15); }",
  };
  const designStyleCss = theme?.designStyle && (designPresetsBg[theme.designStyle] ?? designPresetsVars[theme.designStyle])
    ? [designPresetsBg[theme.designStyle], designPresetsVars[theme.designStyle]].filter(Boolean).join(" ")
    : "";
  const themeOverrideCss = [rootStyle, vpStyle, deskStyle, pageBgStyle, designStyleCss].filter(Boolean).join("\n");
  return (
    <MobileShell theme={theme} chatUrl={chatUrl} socialLinks={social} useVividPortal={true}>
      {themeOverrideCss && (
        <style dangerouslySetInnerHTML={{ __html: themeOverrideCss }} />
      )}
      <script
        // Make overrides available to client components (namedAssets.ts reads globalThis.__UI_ASSET_OVERRIDES__).
        dangerouslySetInnerHTML={{
          __html: `globalThis.__UI_ASSET_OVERRIDES__=${safeJsonForInlineScript(uiAssetOverrides)};`
        }}
      />
      {children}
    </MobileShell>
  );
}

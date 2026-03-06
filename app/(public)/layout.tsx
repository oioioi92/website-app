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
  const themeOverrideCss = [rootStyle, vpStyle, deskStyle].filter(Boolean).join("\n");
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

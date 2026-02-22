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
  const theme = (await getPublicTheme()).theme;
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
  return (
    <MobileShell theme={theme} chatUrl={chatUrl} socialLinks={social}>
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

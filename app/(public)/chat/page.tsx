import { EmbeddedChatClient } from "@/components/public/EmbeddedChatClient";
import { db } from "@/lib/db";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import type { ThemeConfig } from "@/lib/public/theme";

export const dynamic = "force-dynamic";

export default async function PublicChatPage() {
  let dbSocial: Array<{ label: string; url: string }> = [];
  try {
    dbSocial = await db.socialLink.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      select: { url: true, label: true },
      take: 50
    });
  } catch {
    // 数据库不可用时仅渲染站内聊天
  }
  let theme: ThemeConfig | null = null;
  try {
    theme = (await getPublicTheme()).theme;
  } catch {
    theme = null;
  }

  const quickLinks: Array<{ href: string; label: string }> = [];
  const addQuick = (href: string | null | undefined, label: string) => {
    const s = (href ?? "").trim();
    if (!s || s === "#") return;
    quickLinks.push({ href: s, label });
  };

  for (const s of theme?.socialLinks ?? []) {
    if (s.type === "whatsapp") addQuick(s.url, s.label || "WhatsApp");
    if (s.type === "telegram") addQuick(s.url, s.label || "Telegram");
  }
  for (const row of dbSocial) {
    const label = row.label.toLowerCase();
    if (label.includes("whatsapp")) addQuick(row.url, row.label);
    else if (label.includes("telegram")) addQuick(row.url, row.label);
  }

  const seen = new Set<string>();
  const deduped = quickLinks.filter((x) => {
    const k = `${x.label}::${x.href}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return <EmbeddedChatClient uiText={theme?.uiText ?? {}} quickLinks={deduped} />;
}

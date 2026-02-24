import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canEditSiteTheme } from "@/lib/rbac";
import { getThemeJsonCached } from "@/lib/theme/themeCache";
import { invalidateThemeCache } from "@/lib/theme/themeCache";
import { invalidateHomeCache } from "@/lib/public-home-cache";
import { parseThemeJson, sanitizeThemeJsonForWrite } from "@/lib/public/theme";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const THEME_KEY = "default";

/** GET: 返回当前前台主题配置（供后台编辑） */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canEditSiteTheme(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  try {
    const { themeJson } = await getThemeJsonCached();
    const theme = parseThemeJson(themeJson ?? null);
    return NextResponse.json({ theme });
  } catch (e) {
    return NextResponse.json({ error: "THEME_READ_FAIL" }, { status: 500 });
  }
}

/** PUT: 保存前台主题配置（整站生效） */
export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canEditSiteTheme(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const sanitized = sanitizeThemeJsonForWrite(body);

  try {
    const existing = await db.theme.findUnique({ where: { key: THEME_KEY }, select: { id: true, version: true, themeJson: true } });
    if (existing) {
      await db.themeHistory.create({
        data: {
          themeId: existing.id,
          version: existing.version,
          themeJson: existing.themeJson as object,
          updatedByAdminId: user.id
        }
      });
      await db.theme.update({
        where: { key: THEME_KEY },
        data: {
          themeJson: sanitized as object,
          version: existing.version + 1,
          updatedByAdminId: user.id
        }
      });
    } else {
      await db.theme.create({
        data: {
          key: THEME_KEY,
          themeJson: sanitized as object,
          updatedByAdminId: user.id
        }
      });
    }
    await invalidateThemeCache();
    invalidateHomeCache();
    return NextResponse.json({ ok: true });
  } catch (e) {
    try {
      await db.siteSetting.upsert({
        where: { key: "theme_json" },
        create: { key: "theme_json", valueJson: sanitized as object },
        update: { valueJson: sanitized as object }
      });
      await invalidateThemeCache();
      invalidateHomeCache();
      return NextResponse.json({ ok: true });
    } catch (fallbackErr) {
      return NextResponse.json({ error: "THEME_SAVE_FAIL" }, { status: 500 });
    }
  }
}

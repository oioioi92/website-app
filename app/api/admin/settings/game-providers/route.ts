import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PROVIDER_API_KEY = "game_provider_api";

type ProviderApiEntry = { providerName?: string; apiBaseUrl?: string; apiKey?: string; secret?: string; enabled?: boolean };

/** GET: 列出所有游戏供应商（含 logoUrl、sortOrder、每游戏 API 配置） */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const [list, setting] = await Promise.all([
    db.gameProvider.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, logoUrl: true, sortOrder: true, isActive: true },
    }),
    db.siteSetting.findUnique({ where: { key: PROVIDER_API_KEY }, select: { valueJson: true } }),
  ]);
  const apiMap = (setting?.valueJson as Record<string, ProviderApiEntry> | null) ?? {};

  return NextResponse.json(
    list.map((p) => {
      const api = apiMap[p.id] ?? {};
      return {
        id: p.id,
        name: p.name,
        code: (p as { code?: string | null }).code ?? p.name,
        logoUrl: p.logoUrl ?? null,
        sortOrder: p.sortOrder,
        isActive: p.isActive,
        api: {
          providerName: api.providerName ?? "",
          apiBaseUrl: api.apiBaseUrl ?? "",
          apiKey: api.apiKey ?? "",
          secret: api.secret ?? "",
          enabled: api.enabled ?? true,
        },
      };
    }),
    { headers: { "Cache-Control": "no-store" } }
  );
}

/** POST: 新建游戏供应商 */
export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: { name?: string; code?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });

  const maxOrder = await db.gameProvider.aggregate({ _max: { sortOrder: true } }).then((r) => r._max.sortOrder ?? -1);
  const created = await db.gameProvider.create({
    data: { name, sortOrder: maxOrder + 1 },
    select: { id: true, name: true, logoUrl: true, sortOrder: true, isActive: true },
  }).catch((e: { code?: string }) => {
    if (e?.code === "P2002") return null;
    throw e;
  });
  if (!created) return NextResponse.json({ error: "NAME_EXISTS" }, { status: 409 });

  return NextResponse.json({ ok: true, provider: { id: created.id, name: created.name, code: created.name, logoUrl: created.logoUrl, sortOrder: created.sortOrder, isActive: created.isActive } });
}

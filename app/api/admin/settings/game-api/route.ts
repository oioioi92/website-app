import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY = "settings_game_api";

type GameApiPayload = {
  providerName?: string;
  apiBaseUrl?: string;
  apiKey?: string;
  secret?: string;
  enabled?: boolean;
};

/** GET: 读取游戏 API 配置 */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const row = await db.siteSetting.findUnique({ where: { key: KEY }, select: { valueJson: true } });
  const value = (row?.valueJson as GameApiPayload | null) ?? {};
  return NextResponse.json(
    {
      providerName: value.providerName ?? "",
      apiBaseUrl: value.apiBaseUrl ?? "",
      apiKey: value.apiKey ?? "",
      secret: value.secret ?? "",
      enabled: value.enabled ?? true
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

/** PUT: 保存游戏 API 配置 */
export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: GameApiPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const valueJson = {
    providerName: String(body.providerName ?? ""),
    apiBaseUrl: String(body.apiBaseUrl ?? ""),
    apiKey: String(body.apiKey ?? ""),
    secret: String(body.secret ?? ""),
    enabled: Boolean(body.enabled)
  };

  await db.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, valueJson: valueJson as object },
    update: { valueJson: valueJson as object }
  });
  return NextResponse.json({ ok: true });
}

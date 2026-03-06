import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PROVIDER_API_KEY = "game_provider_api";

/** PATCH: 更新单个游戏供应商 logoUrl/name/isActive + 该游戏的 API 配置 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID_REQUIRED" }, { status: 400 });

  let body: {
    logoUrl?: string | null;
    name?: string;
    isActive?: boolean;
    apiProviderName?: string;
    apiBaseUrl?: string;
    apiKey?: string;
    secret?: string;
    apiEnabled?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const data: { logoUrl?: string | null; name?: string; isActive?: boolean } = {};
  if (body.logoUrl !== undefined) {
    data.logoUrl = body.logoUrl === null || body.logoUrl === "" ? null : (typeof body.logoUrl === "string" ? body.logoUrl.trim() : null) || null;
  }
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  const updated = await db.gameProvider.update({
    where: { id },
    data,
    select: { id: true, name: true, logoUrl: true, sortOrder: true, isActive: true },
  }).catch(() => null);
  if (!updated) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const hasApi = body.apiProviderName !== undefined || body.apiBaseUrl !== undefined || body.apiKey !== undefined || body.secret !== undefined || body.apiEnabled !== undefined;
  if (hasApi) {
    const row = await db.siteSetting.findUnique({ where: { key: PROVIDER_API_KEY }, select: { valueJson: true } });
    const apiMap = (row?.valueJson as Record<string, unknown> | null) ?? {};
    const prev = (apiMap[id] as Record<string, unknown>) ?? {};
    apiMap[id] = {
      ...prev,
      providerName: body.apiProviderName !== undefined ? String(body.apiProviderName) : prev.providerName,
      apiBaseUrl: body.apiBaseUrl !== undefined ? String(body.apiBaseUrl) : prev.apiBaseUrl,
      apiKey: body.apiKey !== undefined ? String(body.apiKey) : prev.apiKey,
      secret: body.secret !== undefined ? String(body.secret) : prev.secret,
      enabled: body.apiEnabled !== undefined ? Boolean(body.apiEnabled) : prev.enabled,
    };
    await db.siteSetting.upsert({
      where: { key: PROVIDER_API_KEY },
      create: { key: PROVIDER_API_KEY, valueJson: apiMap as object },
      update: { valueJson: apiMap as object },
    });
  }

  return NextResponse.json({ ok: true, provider: updated });
}

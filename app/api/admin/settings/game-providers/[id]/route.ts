import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID_REQUIRED" }, { status: 400 });

  const VALID_CATEGORIES = ["slots", "live", "sports", "fishing", "lottery", "new"];
  const body = (await req.json().catch(() => null)) as {
    name?: string;
    code?: string | null;
    logoUrl?: string | null;
    category?: string | null;
    apiBaseUrl?: string | null;
    apiKey?: string | null;
    secret?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  } | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) updateData.name = body.name.trim();
  if (body.code !== undefined) updateData.code = body.code === "" || body.code == null ? null : String(body.code).trim();
  if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl === "" || body.logoUrl == null ? null : String(body.logoUrl).trim();
  if (body.category !== undefined) {
    const raw = body.category === "" || body.category == null ? null : String(body.category).trim().toLowerCase();
    updateData.category = raw && VALID_CATEGORIES.includes(raw) ? raw : null;
  }
  if (body.apiBaseUrl !== undefined) updateData.apiBaseUrl = body.apiBaseUrl === "" || body.apiBaseUrl == null ? null : String(body.apiBaseUrl).trim();
  if (body.apiKey !== undefined) updateData.apiKey = body.apiKey === "" || body.apiKey == null ? null : String(body.apiKey).trim();
  if (body.secret !== undefined) updateData.secret = body.secret === "" || body.secret == null ? null : String(body.secret).trim();
  if (typeof body.isActive === "boolean") updateData.isActive = body.isActive;
  if (typeof body.sortOrder === "number") updateData.sortOrder = body.sortOrder;

  const updated = await db.gameProvider.update({
    where: { id },
    data: updateData,
  }).catch(() => null);
  if (!updated) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(updated);
}

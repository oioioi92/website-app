import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const list = await db.gameProvider.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, code: true, logoUrl: true, isActive: true, sortOrder: true },
  });
  return NextResponse.json(list, { headers: { "Cache-Control": "no-store" } });
}

/** POST: 新建游戏供应商 */
export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });

  const existing = await db.gameProvider.findUnique({ where: { name }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "NAME_EXISTS" }, { status: 409 });

  const maxOrder = await db.gameProvider.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
  const created = await db.gameProvider.create({
    data: { name, sortOrder },
    select: { id: true, name: true, code: true, logoUrl: true, isActive: true, sortOrder: true },
  });
  return NextResponse.json(created, { status: 201 });
}

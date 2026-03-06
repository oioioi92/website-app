import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { invalidateHomeCache } from "@/lib/public-home-cache";

export const dynamic = "force-dynamic";

/** PATCH: 上移/下移 promotion 顺序 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID_REQUIRED" }, { status: 400 });

  let body: { direction?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const direction = body.direction === "up" || body.direction === "down" ? body.direction : null;
  if (!direction) return NextResponse.json({ error: "DIRECTION_REQUIRED" }, { status: 400 });

  const list = await db.promotion.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true, sortOrder: true },
  });
  const idx = list.findIndex((p) => p.id === id);
  if (idx < 0) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= list.length) {
    return NextResponse.json({ error: "CANNOT_MOVE" }, { status: 400 });
  }

  const current = list[idx];
  const other = list[swapIdx];
  await db.$transaction([
    db.promotion.update({ where: { id: current.id }, data: { sortOrder: other.sortOrder } }),
    db.promotion.update({ where: { id: other.id }, data: { sortOrder: current.sortOrder } }),
  ]);
  invalidateHomeCache();
  return NextResponse.json({ ok: true });
}

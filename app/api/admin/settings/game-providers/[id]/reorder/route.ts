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

  let body: { direction?: "up" | "down" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const direction = body?.direction === "up" || body?.direction === "down" ? body.direction : null;
  if (!direction) return NextResponse.json({ error: "DIRECTION_REQUIRED" }, { status: 400 });

  const providers = await db.gameProvider.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, sortOrder: true },
  });
  const idx = providers.findIndex((p) => p.id === id);
  if (idx < 0) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= providers.length) {
    return NextResponse.json({ ok: true });
  }

  const current = providers[idx];
  const swap = providers[swapIdx];
  await db.$transaction([
    db.gameProvider.update({ where: { id: current.id }, data: { sortOrder: swap.sortOrder } }),
    db.gameProvider.update({ where: { id: swap.id }, data: { sortOrder: current.sortOrder } }),
  ]);
  return NextResponse.json({ ok: true });
}

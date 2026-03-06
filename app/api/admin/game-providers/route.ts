import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: 后台用，列出所有 Game Provider（供 Promotion Only Pay Game 等多选） */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const list = await db.gameProvider.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, code: true },
  });
  return NextResponse.json(
    list.map((p) => ({ id: p.id, name: p.name, code: p.code ?? p.name })),
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

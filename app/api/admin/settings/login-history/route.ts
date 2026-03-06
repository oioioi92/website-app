import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canAccessSecuritySettings } from "@/lib/rbac";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: 最近管理员登录记录（基于 Session 创建时间），仅 admin */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canAccessSecuritySettings(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const list = await db.session.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true } } },
  });

  const rows = list.map((s) => ({
    id: s.id,
    email: s.user.email,
    createdAt: s.createdAt.toISOString(),
    expiresAt: s.expiresAt.toISOString(),
  }));

  return NextResponse.json({ rows }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

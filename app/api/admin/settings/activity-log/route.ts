import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canManageAdmins } from "@/lib/rbac";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: 管理员登录活动日志（含 IP、User Agent），来自 AuditLog action=LOGIN */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canManageAdmins(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const list = await db.auditLog.findMany({
    where: { action: "LOGIN" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { email: true } } },
  });

  const rows = list.map((l) => ({
    id: l.id,
    time: l.createdAt.toISOString(),
    staff: l.actor.email,
    ip: l.ip ?? "",
    userAgent: l.userAgent ?? "",
  }));

  return NextResponse.json({ rows }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canManageAdmins } from "@/lib/rbac";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET: 列出最近 admin 角色变更审计（仅 owner/admin） */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canManageAdmins(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const take = Math.min(50, Math.max(10, parseInt(req.nextUrl.searchParams.get("limit") ?? "20", 10)));

  const list = await db.auditLog.findMany({
    where: { action: "admin.role.update" },
    orderBy: { createdAt: "desc" },
    take,
    include: { actor: { select: { email: true } } },
  });

  const rows = list.map((l) => {
    const diff = (l.diffJson as Record<string, unknown>) ?? {};
    return {
      id: l.id,
      at: l.createdAt.toISOString(),
      actorEmail: l.actor.email,
      targetEmail: String(diff.targetEmail ?? ""),
      fromRole: String(diff.fromRole ?? ""),
      toRole: String(diff.toRole ?? ""),
      remark: String((l.diffJson as Record<string, unknown>)?.remark ?? ""),
    };
  });

  return NextResponse.json({ rows }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

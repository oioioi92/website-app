import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canManageAdmins } from "@/lib/rbac";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ROLES = ["admin", "editor", "viewer"] as const;

/** PATCH: 仅允许修改后台账户角色（仅 owner/admin），不可改为 owner */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canManageAdmins(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID_REQUIRED" }, { status: 400 });

  let body: { role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const role = typeof body.role === "string" && ROLES.includes(body.role as typeof ROLES[number])
    ? body.role
    : null;
  if (!role) return NextResponse.json({ error: "ROLE_REQUIRED" }, { status: 400 });

  const target = await db.adminUser.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  await db.adminUser.update({
    where: { id },
    data: { role },
  });
  return NextResponse.json({ ok: true, role });
}

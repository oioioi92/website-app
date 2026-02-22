import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canAssignWithdrawal } from "@/lib/rbac";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canAssignWithdrawal(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json().catch(() => null) as { assignedTo?: string } | null;
  const assignedTo = typeof body?.assignedTo === "string" ? body.assignedTo.trim() || null : null;

  const { id } = await params;
  const w = await db.withdrawalRequest.findUnique({ where: { id } });
  if (!w) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (w.status !== "PENDING") return NextResponse.json({ error: "STATUS_NOT_PENDING" }, { status: 400 });

  const now = new Date();

  await db.withdrawalRequest.update({
    where: { id },
    data: {
      status: "PROCESSING",
      assignedTo: assignedTo ?? user.id,
      assignedAt: now
    }
  });

  return NextResponse.json({ ok: true });
}

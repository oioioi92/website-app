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
  const body = await req.json().catch(() => null) as { sent?: boolean } | null;
  if (body?.sent !== true) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  await db.registerPendingSend.update({
    where: { id },
    data: { sentAt: new Date() }
  });
  return NextResponse.json({ ok: true });
}

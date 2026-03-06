import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** PUT: 修改当前管理员密码。body: { currentPassword, newPassword } */
export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const current = body.currentPassword?.trim();
  const nextPassword = body.newPassword?.trim();
  if (!current || !nextPassword) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }
  if (nextPassword.length < 6) {
    return NextResponse.json({ error: "PASSWORD_TOO_SHORT" }, { status: 400 });
  }

  const full = await db.adminUser.findUnique({
    where: { id: user.id },
    select: { passwordHash: true }
  });
  if (!full) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });

  const ok = await bcrypt.compare(current, full.passwordHash);
  if (!ok) return NextResponse.json({ error: "CURRENT_PASSWORD_WRONG" }, { status: 400 });

  const passwordHash = await bcrypt.hash(nextPassword, 10);
  await db.adminUser.update({
    where: { id: user.id },
    data: { passwordHash }
  });
  return NextResponse.json({ ok: true });
}

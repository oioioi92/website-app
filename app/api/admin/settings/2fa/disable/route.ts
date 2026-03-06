import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!password) {
    return NextResponse.json({ error: "PASSWORD_REQUIRED" }, { status: 400 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "INVALID_PASSWORD" }, { status: 401 });
  }

  await db.adminUser.update({
    where: { id: user.id },
    data: {
      totpEnabled: false,
      totpSecretEnc: null,
      totpVerifiedAt: null,
      totpBackupCodesHash: Prisma.JsonNull,
      totpLastUsedStep: null,
    },
  });

  return NextResponse.json({ ok: true });
}

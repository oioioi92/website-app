import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "EMAIL_AND_PASSWORD_REQUIRED" }, { status: 400 });
  }

  const user = await db.adminUser.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  const { rawToken, expiresAt } = await createSession(user.id, { totpOk: true });

  const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
  res.cookies.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
  return res;
}

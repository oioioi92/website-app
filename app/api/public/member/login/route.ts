import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/net/clientIp";
import { normalizePhone, isE164 } from "@/lib/phone";
import { rateLimit } from "@/lib/rate-limit";

const SESSION_COOKIE = "member_ref";

const loginSchema = z.object({
  phone: z.string().min(1).max(32),
  password: z.string().min(1).max(128)
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const bucket = rateLimit(`public-member-login:${ip}`, 15, 60 * 1000);
  if (!bucket.ok) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone.trim());
  if (!phone || !isE164(phone)) {
    return NextResponse.json({ error: "INVALID_PHONE" }, { status: 400 });
  }

  const member = await db.member.findUnique({
    where: { userRef: phone },
    select: { id: true, userRef: true, displayName: true, isActive: true, passwordHash: true, mustChangePassword: true }
  });

  if (!member || !member.passwordHash) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  }
  if (!member.isActive) {
    return NextResponse.json({ error: "ACCOUNT_DISABLED" }, { status: 403 });
  }

  const ok = await bcrypt.compare(parsed.data.password, member.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  await db.member.update({
    where: { id: member.id },
    data: { lastLoginAt: new Date(), lastLoginIp: ip }
  });

  const res = NextResponse.json({
    ok: true,
    member: { id: member.id, userRef: member.userRef, displayName: member.displayName, mustChangePassword: member.mustChangePassword }
  });
  res.cookies.set(SESSION_COOKIE, member.userRef, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 7 天
  });
  return res;
}

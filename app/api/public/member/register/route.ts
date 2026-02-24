import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/net/clientIp";
import { normalizePhone, isE164 } from "@/lib/phone";
import { rateLimit } from "@/lib/rate-limit";

const SESSION_COOKIE = "member_ref";

const registerSchema = z.object({
  phone: z.string().min(1).max(32),
  password: z.string().min(6).max(128),
  displayName: z.string().max(120).optional().nullable()
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const bucket = rateLimit(`public-member-register:${ip}`, 10, 60 * 1000);
  if (!bucket.ok) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone.trim());
  if (!phone || !isE164(phone)) {
    return NextResponse.json({ error: "INVALID_PHONE" }, { status: 400 });
  }

  const existing = await db.member.findUnique({
    where: { userRef: phone },
    select: { id: true }
  });
  if (existing) {
    return NextResponse.json({ error: "PHONE_ALREADY_REGISTERED" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const member = await db.member.create({
    data: {
      userRef: phone,
      displayName: parsed.data.displayName?.trim() || null,
      isActive: true,
      passwordHash,
      mustChangePassword: false
    },
    select: { id: true, userRef: true, displayName: true }
  });

  const res = NextResponse.json({
    ok: true,
    member: { id: member.id, userRef: member.userRef, displayName: member.displayName }
  });
  res.cookies.set(SESSION_COOKIE, member.userRef, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}

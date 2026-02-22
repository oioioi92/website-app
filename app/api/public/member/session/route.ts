import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ensureInternalTestMode } from "@/lib/internal-test";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/net/clientIp";

const SESSION_COOKIE = "member_ref";

const sessionSchema = z.object({
  userRef: z.string().min(1).max(80),
  displayName: z.string().max(120).optional().nullable()
});

export async function GET(req: NextRequest) {
  const gate = ensureInternalTestMode();
  if (gate) return gate;

  const userRef = req.cookies.get(SESSION_COOKIE)?.value;
  if (!userRef) return NextResponse.json({ member: null });

  const member = await db.member.findUnique({
    where: { userRef },
    select: { id: true, userRef: true, displayName: true, isActive: true }
  });
  return NextResponse.json({ member: member ?? null });
}

export async function POST(req: NextRequest) {
  const gate = ensureInternalTestMode();
  if (gate) return gate;

  const ip = getClientIp(req.headers);
  const bucket = rateLimit(`public-member-session:${ip}`, 10, 60 * 1000);
  if (!bucket.ok) return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = sessionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const member = await db.member.upsert({
    where: { userRef: parsed.data.userRef },
    create: {
      userRef: parsed.data.userRef,
      displayName: parsed.data.displayName ?? null,
      isActive: true
    },
    update: {
      displayName: parsed.data.displayName ?? null,
      isActive: true
    }
  });

  const res = NextResponse.json({
    ok: true,
    member: { id: member.id, userRef: member.userRef, displayName: member.displayName }
  });
  res.cookies.set(SESSION_COOKIE, member.userRef, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  return res;
}

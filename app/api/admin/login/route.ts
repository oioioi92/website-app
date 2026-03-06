import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, SESSION_COOKIE } from "@/lib/auth";
import { getClientIp } from "@/lib/net/clientIp";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

const IP_WHITELIST_KEY = "settings_ip_whitelist";

function parseWhitelist(value: unknown): string[] {
  if (typeof value === "string") return value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);
  return [];
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const bucket = rateLimit(`admin-login:${ip}`, 10, 60 * 1000);
  if (!bucket.ok) {
    return NextResponse.json({ error: "TOO_MANY_ATTEMPTS" }, { status: 429 });
  }

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

  const whitelistRow = await db.siteSetting.findUnique({
    where: { key: IP_WHITELIST_KEY },
    select: { valueJson: true },
  });
  const allowedIps = parseWhitelist(whitelistRow?.valueJson);
  if (allowedIps.length > 0) {
    const normalized = ip.trim().toLowerCase();
    const allowed = allowedIps.some((a) => a.toLowerCase() === normalized);
    if (!allowed) {
      return NextResponse.json({ error: "IP_DENIED", message: "admin.security.ipDenied" }, { status: 403 });
    }
  }

  const totpRequired = user.totpEnabled === true;
  const { rawToken, expiresAt } = await createSession(user.id, { totpOk: !totpRequired });

  if (totpRequired) {
    const res = NextResponse.json({ requiresTotp: true, email: user.email });
    res.cookies.set(SESSION_COOKIE, rawToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt
    });
    return res;
  }

  await writeAuditLog({
    actorId: user.id,
    action: "LOGIN",
    entityType: "Session",
    entityId: user.id,
    diffJson: {},
    ip: getClientIp(req.headers),
    userAgent: req.headers.get("user-agent") ?? null,
  }).catch(() => undefined);

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

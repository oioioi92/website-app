import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest, markSessionTotpOk } from "@/lib/auth";
import { totpVerify } from "@/lib/totp";
import { decryptTotpSecret } from "@/lib/crypto";
import { writeAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/net/clientIp";

export async function POST(req: NextRequest) {
  const sessionData = await getAdminSessionFromRequest(req);
  if (!sessionData) {
    return NextResponse.json({ error: "SESSION_REQUIRED" }, { status: 401 });
  }
  const { session, user, rawToken } = sessionData;
  if (session.totpOk) {
    return NextResponse.json({ ok: true });
  }
  if (!user.totpEnabled || !user.totpSecretEnc) {
    return NextResponse.json({ error: "TOTP_NOT_ENABLED" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as { code?: string } | null;
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!code) {
    return NextResponse.json({ error: "CODE_REQUIRED" }, { status: 400 });
  }

  let secret: string;
  try {
    secret = decryptTotpSecret(user.totpSecretEnc);
  } catch {
    return NextResponse.json({ error: "TOTP_INVALID" }, { status: 500 });
  }

  const valid = await totpVerify(secret, code);
  if (!valid) {
    return NextResponse.json({ error: "INVALID_CODE" }, { status: 401 });
  }

  const verifiedAt = new Date();
  await markSessionTotpOk(rawToken, verifiedAt);

  await writeAuditLog({
    actorId: user.id,
    action: "TOTP_VERIFIED",
    entityType: "Session",
    entityId: session.id,
    diffJson: {},
    ip: getClientIp(req.headers),
    userAgent: req.headers.get("user-agent") ?? null,
  }).catch(() => undefined);

  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
}

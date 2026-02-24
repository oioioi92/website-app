import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/crypto";

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_DAYS = 30;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "dev-session-secret-change-in-production";
  }
  throw new Error("SESSION_SECRET is required");
}

export async function createSession(userId: string, opts?: { totpOk?: boolean }) {
  const rawToken = randomToken(32);
  const tokenHash = sha256(`${rawToken}${getSessionSecret()}`);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: { userId, tokenHash, expiresAt, totpOk: opts?.totpOk ?? false }
  });

  return { rawToken, expiresAt };
}

export async function getAdminSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = sha256(`${token}${getSessionSecret()}`);
  const session = await db.session.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await db.session.delete({ where: { tokenHash } }).catch(() => undefined);
    return null;
  }
  return { session, user: session.user, rawToken: token };
}

export async function getAdminUserFromRequest(req: NextRequest) {
  const s = await getAdminSessionFromRequest(req);
  return s?.user ?? null;
}

export async function getAdminSessionFromCookieStore() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = sha256(`${token}${getSessionSecret()}`);
  const session = await db.session.findUnique({
    where: { tokenHash },
    include: { user: true }
  });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  return { session, user: session.user, rawToken: token };
}

export async function getAdminUserFromCookieStore() {
  const s = await getAdminSessionFromCookieStore();
  return s?.user ?? null;
}

export async function clearSessionByToken(rawToken: string | undefined) {
  if (!rawToken) return;
  const tokenHash = sha256(`${rawToken}${getSessionSecret()}`);
  await db.session.delete({ where: { tokenHash } }).catch(() => undefined);
}

export async function markSessionTotpOk(rawToken: string, verifiedAt: Date) {
  const tokenHash = sha256(`${rawToken}${getSessionSecret()}`);
  await db.session
    .update({
      where: { tokenHash },
      data: { totpOk: true, totpVerifiedAt: verifiedAt }
    })
    .catch(() => undefined);
}

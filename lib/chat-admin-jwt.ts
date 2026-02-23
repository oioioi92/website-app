import { createHmac } from "node:crypto";

const ALG = "HS256";

function base64UrlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function signChatAdminJwt(payload: { sub: string; role?: string | null }, ttlSeconds = 900): string {
  const secret = process.env["CHAT_ADMIN_JWT_SECRET"];
  if (!secret) throw new Error("CHAT_ADMIN_JWT_SECRET not set");

  const header = { alg: ALG, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { sub: payload.sub, role: payload.role ?? undefined, iat: now, exp: now + ttlSeconds };

  const headerB64 = base64UrlEncode(Buffer.from(JSON.stringify(header), "utf8"));
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(body), "utf8"));
  const signingInput = `${headerB64}.${payloadB64}`;
  const sig = createHmac("sha256", secret).update(signingInput).digest();
  const sigB64 = base64UrlEncode(sig);

  return `${signingInput}.${sigB64}`;
}

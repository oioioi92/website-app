import crypto from "node:crypto";

function base64UrlEncode(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlEncodeJson(value: unknown) {
  return base64UrlEncode(Buffer.from(JSON.stringify(value), "utf8"));
}

function hmacSha256(data: string, secret: string) {
  return base64UrlEncode(crypto.createHmac("sha256", secret).update(data).digest());
}

export function signChatAdminJwt(
  input: { sub: string; email: string; role: string },
  secret: string,
  ttlSeconds = 15 * 60
) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" } as const;
  const payload = {
    sub: input.sub,
    email: input.email,
    role: input.role,
    iat: now,
    exp: now + ttlSeconds,
    jti: crypto.randomBytes(16).toString("hex")
  };

  const head = base64UrlEncodeJson(header);
  const body = base64UrlEncodeJson(payload);
  const msg = `${head}.${body}`;
  const sig = hmacSha256(msg, secret);
  return { token: `${msg}.${sig}`, expiresAt: payload.exp };
}


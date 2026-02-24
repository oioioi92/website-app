import { NextRequest } from "next/server";
import { hmac, randomToken } from "@/lib/crypto";

export const CSRF_COOKIE = "admin_csrf";

function getCsrfSecret(): string {
  const secret = process.env.CSRF_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "dev-csrf-secret-change-in-production";
  }
  throw new Error("CSRF_SECRET is required");
}

export function generateCsrfToken(): string {
  const nonce = randomToken(16);
  const signature = hmac(nonce, getCsrfSecret());
  return `${nonce}.${signature}`;
}

export function verifyCsrfToken(req: NextRequest): boolean {
  const headerToken = req.headers.get("x-csrf-token");
  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;
  if (!headerToken || !cookieToken || headerToken !== cookieToken) return false;

  const [nonce, signature] = headerToken.split(".");
  if (!nonce || !signature) return false;
  return hmac(nonce, getCsrfSecret()) === signature;
}

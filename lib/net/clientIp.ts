// Edge-safe client IP extraction. Trust as little as possible.
// - Prefer Cloudflare CF-Connecting-IP only when TRUST_CF_CONNECTING_IP=1
// - Prefer X-Real-IP (should be set by Nginx)
// - Fallback to the last hop in X-Forwarded-For (Nginx appends $remote_addr)
export function getClientIp(headers: Headers): string {
  const trustCf = (process.env.TRUST_CF_CONNECTING_IP ?? "0") === "1";
  if (trustCf) {
    const cf = (headers.get("cf-connecting-ip") ?? "").trim();
    if (cf) return cf;
  }

  const real = (headers.get("x-real-ip") ?? "").trim();
  if (real) return real;

  const xff = (headers.get("x-forwarded-for") ?? "").trim();
  if (xff) {
    const parts = xff
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }

  return "local";
}


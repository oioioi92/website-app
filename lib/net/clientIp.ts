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
    if (last) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c61c53b9-4e86-47a3-ab7a-2e00967a7a09',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'sec-audit-pre',hypothesisId:'H2',location:'lib/net/clientIp.ts:23',message:'getClientIp used x-forwarded-for',data:{trustCf,hasXRealIp:false,xffHops:parts.length},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return last;
    }
  }

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c61c53b9-4e86-47a3-ab7a-2e00967a7a09',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'sec-audit-pre',hypothesisId:'H2',location:'lib/net/clientIp.ts:33',message:'getClientIp fell back to local',data:{trustCf,hasXRealIp:!!real,hasXff:!!xff},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  return "local";
}


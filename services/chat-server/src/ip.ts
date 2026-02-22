export function getIpFromHeaders(headers: Record<string, string | string[] | undefined>) {
  const xr = headers["x-real-ip"];
  const vv = Array.isArray(xr) ? xr[0] : xr;
  if (typeof vv === "string" && vv.trim()) return vv.trim();

  const xf = headers["x-forwarded-for"];
  const v = Array.isArray(xf) ? xf[0] : xf;
  if (typeof v === "string" && v.trim()) {
    // XFF can be a list: client, proxy1, proxy2. Use last hop to reduce spoofing risk.
    const parts = v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }
  return "0.0.0.0";
}


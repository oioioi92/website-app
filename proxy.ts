import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getClientIp } from "@/lib/net/clientIp";

const FRONTEND_DOMAIN = (process.env.FRONTEND_DOMAIN ?? "admin1167.com").toLowerCase();
const ADMIN_DOMAIN = (process.env.ADMIN_DOMAIN ?? "admin1167.net").toLowerCase();

function stripPort(host: string) {
  return host.split(":")[0].toLowerCase();
}

function env(name: string) {
  return (process.env[name] ?? "").trim();
}

function parseAllowlist(raw: string): string[] {
  return raw
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    const v = Number(part);
    if (!Number.isInteger(v) || v < 0 || v > 255) return null;
    n = (n << 8) | v;
  }
  return n >>> 0;
}

function isAllowedByEntry(ip: string, entry: string): boolean {
  if (ip === entry) return true;

  const m = entry.match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);
  if (!m) return false;
  const base = ipv4ToInt(m[1]);
  const bits = Number(m[2]);
  const val = ipv4ToInt(ip);
  if (base == null || val == null) return false;
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) return false;

  const mask = bits === 0 ? 0 : ((0xffffffff << (32 - bits)) >>> 0);
  return (base & mask) === (val & mask);
}

function isAllowedIp(ip: string, allow: string[]): boolean {
  if (!ip) return false;
  for (const entry of allow) {
    if (isAllowedByEntry(ip, entry)) return true;
  }
  return false;
}

function isStaticPath(pathname: string) {
  return pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname.startsWith("/assets/");
}

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = stripPort(req.headers.get("host") ?? "");
  const pathname = url.pathname;
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isProd = process.env.NODE_ENV === "production";
  const forwardedProto = (req.headers.get("x-forwarded-proto") ?? "").toLowerCase();
  const proto = forwardedProto === "https" ? "https:" : url.protocol;

  // Phase 6: IP allowlist (application-layer guard). Prefer Nginx/Cloudflare as the primary gate.
  const allowEnabled = env("ADMIN_IP_ALLOWLIST_ENABLED") === "1";
  if (allowEnabled && !isStaticPath(pathname)) {
    // Protect all admin surface:
    // - /admin/* and /api/admin/*
    // - the entire admin domain (so "/" redirect can't be used to probe)
    const protectWholeHost = host === ADMIN_DOMAIN;
    const shouldProtect = protectWholeHost || isAdminPath;
    if (shouldProtect) {
      const allow = parseAllowlist(env("ADMIN_IP_ALLOWLIST"));
      const ip = getClientIp(req.headers);
      if (!isAllowedIp(ip, allow)) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c61c53b9-4e86-47a3-ab7a-2e00967a7a09',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'sec-audit-pre',hypothesisId:'H2',location:'proxy.ts:102',message:'admin ip allowlist blocked',data:{isProd,host,pathname,protectWholeHost,isAdminPath,allowEnabled,allowCount:allow.length,ipKind:ip==="local"?"local":"nonlocal"},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (pathname.startsWith("/api/")) return NextResponse.json({ error: "IP_FORBIDDEN" }, { status: 403 });
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  if (isProd && !isStaticPath(pathname)) {
    if (host === FRONTEND_DOMAIN && isAdminPath) {
      url.protocol = proto;
      url.host = ADMIN_DOMAIN;
      return NextResponse.redirect(url, 307);
    }

    if (host === ADMIN_DOMAIN && pathname === "/") {
      url.pathname = "/";
      url.protocol = proto;
      url.host = FRONTEND_DOMAIN;
      return NextResponse.redirect(url, 307);
    }

    if (host === ADMIN_DOMAIN && !isAdminPath) {
      url.protocol = proto;
      url.host = FRONTEND_DOMAIN;
      return NextResponse.redirect(url, 307);
    }
  }

  const res = NextResponse.next();
  if (isAdminPath) {
    res.headers.set("Cache-Control", "no-store");
    // Basic hardening headers for admin surface
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.headers.set("X-Permitted-Cross-Domain-Policies", "none");

    const isDev = process.env.NODE_ENV !== "production";
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "object-src 'none'",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      `connect-src 'self' https: ${isDev ? "http: ws: wss:" : ""}`.trim()
    ].join("; ");
    res.headers.set("Content-Security-Policy", csp);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

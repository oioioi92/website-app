import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST: 测试支付网关连接，body 可传 { apiBaseUrl } */
export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let apiBaseUrl: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    apiBaseUrl = (body?.apiBaseUrl ?? "").trim() || undefined;
  } catch {
    apiBaseUrl = undefined;
  }

  if (!apiBaseUrl) {
    return NextResponse.json({ ok: false, message: "API Base URL is required" });
  }

  const base = apiBaseUrl.replace(/\/+$/, "");
  const healthUrl = `${base}/health`;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(healthUrl, { method: "GET", signal: ctrl.signal, cache: "no-store" });
    clearTimeout(t);
    if (res.ok) {
      return NextResponse.json({ ok: true, message: "Connection successful" });
    }
    return NextResponse.json({ ok: false, message: `HTTP ${res.status}` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Connection failed";
    return NextResponse.json({ ok: false, message: msg });
  }
}

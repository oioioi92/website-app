import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET ?ip=xxx 返回 IP 对应地理位置（供后台 Live Chat 展示），使用免费 ip-api.com */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const ip = req.nextUrl.searchParams.get("ip")?.trim() ?? "";
  if (!ip || ip === "0.0.0.0" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return NextResponse.json({ location: null, message: "本地或内网 IP 无法解析位置" });
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=country,regionName,city`, {
      next: { revalidate: 0 }
    });
    if (!res.ok) return NextResponse.json({ location: null });
    const data = (await res.json()) as { country?: string; regionName?: string; city?: string; status?: string };
    if (data.status === "fail") return NextResponse.json({ location: null });
    const parts = [data.city, data.regionName, data.country].filter(Boolean);
    const location = parts.length > 0 ? parts.join(", ") : null;
    return NextResponse.json({ location });
  } catch {
    return NextResponse.json({ location: null });
  }
}

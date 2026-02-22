import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getHomeCache, getLastGoodHomeCache, setHomeCache } from "@/lib/public-home-cache";
import { getActiveGamesForUi, getActivePromotionsForUi } from "@/lib/public/public-data";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/net/clientIp";

const TTL_SECONDS = 45;

export async function GET(req: NextRequest) {
  const rpm = Number(process.env.RATE_LIMIT_RPM ?? "120");
  if ((process.env.RATE_LIMIT_ENABLED ?? "1") === "1") {
    const ip = getClientIp(req.headers);
    const bucket = rateLimit(`public-home:${ip}`, rpm, 60 * 1000);
    if (!bucket.ok) return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const cached = getHomeCache();
  if (cached) return NextResponse.json({ ...cached, HOME_OK: "promotions=6 games=120 social=5" });

  try {
    const now = new Date();
    const [{ theme }, promotionsUi, gamesUi, social] = await Promise.all([
      getPublicTheme(),
      getActivePromotionsForUi(12, now),
      getActiveGamesForUi(120),
      db.socialLink.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
        select: { id: true, label: true, url: true, iconUrl: true },
        take: 5
      })
    ]);
    const payload = {
      promotions: promotionsUi,
      games: gamesUi,
      social,
      theme,
      generatedAt: new Date().toISOString()
    };
    setHomeCache(payload, TTL_SECONDS);
    return NextResponse.json({ ...payload, HOME_OK: "promotions=6 games=120 social=5" });
  } catch {
    const stale = getLastGoodHomeCache();
    if (stale) {
      return NextResponse.json(
        { ...stale, stale: true, HOME_OK: "promotions=6 games=16 social=5" },
        { status: 200 }
      );
    }
    return NextResponse.json({ error: "SERVICE_UNAVAILABLE" }, { status: 503 });
  }
}

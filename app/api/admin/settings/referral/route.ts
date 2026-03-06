import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canAccessSettings } from "@/lib/rbac";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY = "referral_config";

export type ReferralConfig = {
  maxGenerations: number;
  sharePlatforms: string[];
};

const DEFAULT: ReferralConfig = {
  maxGenerations: 3,
  sharePlatforms: ["whatsapp", "telegram", "copy"],
};

const SHARE_PLATFORMS = ["whatsapp", "telegram", "facebook", "twitter", "copy"] as const;

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canAccessSettings(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  try {
    const row = await db.siteSetting.findUnique({
      where: { key: KEY },
      select: { valueJson: true },
    });
    const raw = row?.valueJson as ReferralConfig | null | undefined;
    const maxGenerations = typeof raw?.maxGenerations === "number" && raw.maxGenerations >= 1 && raw.maxGenerations <= 10
      ? raw.maxGenerations
      : DEFAULT.maxGenerations;
    const sharePlatforms = Array.isArray(raw?.sharePlatforms)
      ? raw.sharePlatforms.filter((s) => SHARE_PLATFORMS.includes(s as (typeof SHARE_PLATFORMS)[number]))
      : DEFAULT.sharePlatforms;
    return NextResponse.json({ config: { maxGenerations, sharePlatforms } });
  } catch {
    return NextResponse.json({ config: DEFAULT });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canAccessSettings(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const maxGenerations = typeof o?.maxGenerations === "number" && o.maxGenerations >= 1 && o.maxGenerations <= 10
    ? Math.round(o.maxGenerations)
    : DEFAULT.maxGenerations;
  const sharePlatforms = Array.isArray(o?.sharePlatforms)
    ? o.sharePlatforms.filter((s) => typeof s === "string" && SHARE_PLATFORMS.includes(s as (typeof SHARE_PLATFORMS)[number]))
    : DEFAULT.sharePlatforms;

  try {
    await db.siteSetting.upsert({
      where: { key: KEY },
      create: { key: KEY, valueJson: { maxGenerations, sharePlatforms } as object },
      update: { valueJson: { maxGenerations, sharePlatforms } as object },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "SAVE_FAIL" }, { status: 500 });
  }
}

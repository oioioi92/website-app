import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { resolveProviderLogo } from "@/lib/public/namedAssets";

function isDemoLogoUrl(input: string | null | undefined) {
  const s = (input ?? "").trim().toLowerCase();
  return s.includes("picsum.photos/");
}

function norm(s: string | null | undefined) {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function main() {
  const db = new PrismaClient();
  const limit = Number(process.argv[2] ?? 300) || 300;
  const rows = await db.gameProvider.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    take: limit,
    select: { id: true, name: true, code: true, logoUrl: true }
  });

  const missing: Array<{ name: string; code: string | null; logoUrl: string | null; suggestedFile: string }> = [];
  const ok: Array<{ name: string; code: string | null; logoUrl: string }> = [];

  for (const r of rows) {
    const resolved = resolveProviderLogo(r.name, r.code);
    const direct = typeof r.logoUrl === "string" && r.logoUrl.trim().length > 0 && !isDemoLogoUrl(r.logoUrl) ? r.logoUrl : null;
    const final = resolved ?? direct;
    if (final) ok.push({ name: r.name, code: r.code, logoUrl: final });
    else missing.push({ name: r.name, code: r.code, logoUrl: r.logoUrl, suggestedFile: `${norm(r.code) || norm(r.name) || "unknown"}.png` });
  }

  console.log(
    JSON.stringify(
      {
        activeProviders: rows.length,
        ok: ok.length,
        missing: missing.length,
        missingSamples: missing.slice(0, 40)
      },
      null,
      2
    )
  );

  await db.$disconnect();
}

main().catch((e) => {
  console.error("REPORT_ERROR", e instanceof Error ? e.message : String(e));
  process.exit(1);
});


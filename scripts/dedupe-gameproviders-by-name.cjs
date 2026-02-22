// Dedupe GameProvider rows by exact same name.
//
// Why:
// - Production may contain duplicate GameProvider.name rows from early imports.
// - Prisma schema requires `name @unique`. Adding the unique constraint will fail with duplicates.
//
// Behavior:
// - Default is DRY RUN (prints plan).
// - Pass --apply to execute:
//   - Pick canonical provider (oldest createdAt) for each duplicated name
//   - Re-point foreign keys:
//       ProviderTransaction.providerId
//       ReconcileLine.providerId
//       BalanceSnapshot.providerId (handles sheetId conflicts by keeping latest takenAt)
//   - Delete duplicate GameProvider rows
//
// Usage (on VPS):
//   cd /root/website
//   node scripts/dedupe-gameproviders-by-name.cjs
//   node scripts/dedupe-gameproviders-by-name.cjs --apply

require("dotenv/config");

const { PrismaClient } = require("@prisma/client");

const APPLY = process.argv.includes("--apply");

function stableDate(d) {
  if (!d) return 0;
  const t = d instanceof Date ? d.getTime() : new Date(d).getTime();
  return Number.isFinite(t) ? t : 0;
}

function pickSnapshotWinner(a, b) {
  // Keep the latest takenAt, then latest createdAt.
  const at = stableDate(a.takenAt);
  const bt = stableDate(b.takenAt);
  if (at !== bt) return at > bt ? a : b;
  const ac = stableDate(a.createdAt);
  const bc = stableDate(b.createdAt);
  return ac >= bc ? a : b;
}

async function main() {
  const db = new PrismaClient();
  try {
    // Find duplicate names. Raw SQL is simplest here.
    const rows = await db.$queryRawUnsafe(
      `select name, count(*)::int as cnt from "GameProvider" group by name having count(*) > 1 order by cnt desc, name asc`
    );

    const dups = Array.isArray(rows) ? rows : [];
    if (dups.length === 0) {
      console.log(JSON.stringify({ ok: true, duplicates: 0 }, null, 2));
      return;
    }

    console.log(JSON.stringify({ ok: true, duplicates: dups.length, mode: APPLY ? "apply" : "dry-run" }, null, 2));

    for (const r of dups) {
      const name = String(r.name);
      const providers = await db.gameProvider.findMany({
        where: { name },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, createdAt: true, isActive: true, sortOrder: true, logoUrl: true }
      });
      if (providers.length <= 1) continue;

      const keep = providers[0];
      const drop = providers.slice(1);
      const dropIds = drop.map((p) => p.id);

      console.log(`\n== DUPLICATE name="${name}" count=${providers.length}`);
      console.log(`KEEP  id=${keep.id} createdAt=${keep.createdAt?.toISOString?.() ?? keep.createdAt}`);
      for (const p of drop) {
        console.log(`DROP  id=${p.id} createdAt=${p.createdAt?.toISOString?.() ?? p.createdAt}`);
      }

      if (!APPLY) continue;

      await db.$transaction(async (tx) => {
        // ProviderTransaction
        await tx.providerTransaction.updateMany({
          where: { providerId: { in: dropIds } },
          data: { providerId: keep.id }
        });

        // ReconcileLine
        await tx.reconcileLine.updateMany({
          where: { providerId: { in: dropIds } },
          data: { providerId: keep.id }
        });

        // BalanceSnapshot: avoid unique conflicts on (providerId, sheetId)
        const snaps = await tx.balanceSnapshot.findMany({
          where: { providerId: { in: [keep.id, ...dropIds] } },
          select: { id: true, providerId: true, sheetId: true, takenAt: true, createdAt: true }
        });

        const bySheet = new Map();
        for (const s of snaps) {
          const key = String(s.sheetId);
          const existing = bySheet.get(key);
          if (!existing) bySheet.set(key, s);
          else bySheet.set(key, pickSnapshotWinner(existing, s));
        }

        const keepSnapIds = new Set(Array.from(bySheet.values()).map((s) => s.id));
        const deleteSnapIds = snaps.filter((s) => !keepSnapIds.has(s.id)).map((s) => s.id);
        if (deleteSnapIds.length) {
          await tx.balanceSnapshot.deleteMany({ where: { id: { in: deleteSnapIds } } });
        }

        await tx.balanceSnapshot.updateMany({
          where: { providerId: { in: dropIds } },
          data: { providerId: keep.id }
        });

        // Finally delete duplicate providers.
        await tx.gameProvider.deleteMany({ where: { id: { in: dropIds } } });
      });
    }

    console.log("\nDONE");
  } finally {
    await db.$disconnect().catch(() => undefined);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});


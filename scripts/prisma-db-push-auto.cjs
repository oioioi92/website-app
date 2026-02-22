// Auto-run "prisma db push" based on DATABASE_URL.
// - Postgres: prisma/schema.postgres.prisma
// - SQLite:   prisma/schema.sqlite.prisma
//
// We use db push in deployment to avoid "missing column" runtime failures
// when Prisma schema evolves but migrations haven't been applied yet.
require("dotenv/config");

const { execSync } = require("node:child_process");

function pickSchema(databaseUrl) {
  const url = (databaseUrl || "").trim().replace(/^"|"$/g, "");
  if (url.startsWith("file:")) return "prisma/schema.sqlite.prisma";
  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) return "prisma/schema.postgres.prisma";
  return null;
}

const schema = pickSchema(process.env.DATABASE_URL);
if (!schema) {
  console.error("prisma-db-push-auto: Unsupported DATABASE_URL. Expected file: or postgresql://");
  process.exit(1);
}

console.log(`prisma-db-push-auto: using ${schema}`);

async function hasDuplicateProviderNames() {
  try {
    const { PrismaClient } = require("@prisma/client");
    const db = new PrismaClient();
    try {
      // If table doesn't exist yet, this query will throw; treat as "no duplicates" for bootstrap DBs.
      const rows = await db.$queryRawUnsafe(`select name from "GameProvider" group by name having count(*) > 1 limit 1`);
      return Array.isArray(rows) && rows.length > 0;
    } finally {
      await db.$disconnect().catch(() => undefined);
    }
  } catch {
    return false;
  }
}

async function main() {
  // If Prisma only blocks on the warning gate, we can proceed safely
  // ONLY when no duplicates exist for the unique constraint we are about to add.
  const hasDup = await hasDuplicateProviderNames().catch(() => true);
  if (hasDup) {
    console.error("\nprisma-db-push-auto: ABORT (duplicate GameProvider.name detected)");
    console.error("Fix duplicates first (dry-run):  node scripts/dedupe-gameproviders-by-name.cjs");
    console.error("Apply fix (writes DB):           node scripts/dedupe-gameproviders-by-name.cjs --apply");
    process.exit(1);
  }

  const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";
  const accept =
    (process.env.PRISMA_DB_PUSH_ACCEPT_DATA_LOSS || "").trim() === "1" ||
    isProd;

  const cmd = accept
    ? `npx prisma db push --accept-data-loss --schema ${schema}`
    : `npx prisma db push --schema ${schema}`;

  console.log(`\nprisma-db-push-auto: running ${accept ? "with" : "without"} --accept-data-loss`);
  execSync(cmd, { stdio: "inherit" });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


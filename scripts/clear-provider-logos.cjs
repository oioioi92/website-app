/**
 * Clear all GameProvider.logoUrl in the database.
 * Use when you want to re-upload provider logos one-by-one in the admin panel.
 */

const { PrismaClient } = require("@prisma/client");

async function main() {
  const db = new PrismaClient();
  try {
    const res = await db.gameProvider.updateMany({
      where: { logoUrl: { not: null } },
      data: { logoUrl: null }
    });
    console.log(JSON.stringify({ ok: true, cleared: res.count }, null, 2));
  } finally {
    await db.$disconnect().catch(() => {});
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


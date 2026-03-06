/**
 * Clear all Promotion CTA fields in database.
 * - ctaLabel -> null
 * - ctaUrl   -> null
 */

const { PrismaClient } = require("@prisma/client");

async function main() {
  const db = new PrismaClient();
  try {
    const res = await db.promotion.updateMany({
      where: {
        OR: [
          { ctaLabel: { not: null } },
          { ctaUrl: { not: null } },
        ],
      },
      data: {
        ctaLabel: null,
        ctaUrl: null,
      },
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


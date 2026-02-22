import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function main() {
  const db = new PrismaClient();
  try {
    const gameProviders = await db.gameProvider.count();
    const gameProvidersActive = await db.gameProvider.count({ where: { isActive: true } });
    const promotions = await db.promotion.count();
    const members = await db.member.count();
    const sampleProviders = await db.gameProvider.findMany({
      take: 8,
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, code: true, logoUrl: true, isActive: true, sortOrder: true, updatedAt: true }
    });

    console.log(
      JSON.stringify(
        { gameProviders, gameProvidersActive, promotions, members, sampleProviders },
        null,
        2
      )
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.log("DB_CHECK_ERROR", message);
  } finally {
    await db.$disconnect();
  }
}

void main();


require("dotenv/config");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf8");
  if (!raw.trim()) return [];
  return JSON.parse(raw);
}

async function main() {
  const base = process.argv[2] || path.join(process.cwd(), "mvp-export");
  const promotions = await loadJson(path.join(base, "promotions.json"));
  const games = await loadJson(path.join(base, "games.json"));
  const social = await loadJson(path.join(base, "social.json"));
  const site = await loadJson(path.join(base, "site.json"));

  for (const item of promotions) {
    const payload = {
      title: item.title ?? "Untitled",
      subtitle: item.subtitle ?? null,
      coverUrl: item.coverUrl ?? null,
      detailJson: item.detailJson ?? { blocks: [] },
      ctaLabel: item.ctaLabel ?? null,
      ctaUrl: item.ctaUrl ?? null,
      isActive: item.isActive ?? true,
      sortOrder: item.sortOrder ?? 0
    };
    if (item.id) {
      await prisma.promotion.upsert({
        where: { id: item.id },
        create: payload,
        update: payload
      });
    } else {
      await prisma.promotion.create({ data: payload });
    }
  }

  for (const item of games) {
    await prisma.gameProvider.create({
      data: {
        name: item.name ?? "Unknown",
        logoUrl: item.logoUrl ?? null,
        isActive: item.isActive ?? true,
        sortOrder: item.sortOrder ?? 0
      }
    });
  }

  for (const item of social) {
    await prisma.socialLink.create({
      data: {
        label: item.label ?? "Social",
        url: item.url ?? "https://example.com",
        iconUrl: item.iconUrl ?? null,
        isActive: item.isActive ?? true,
        sortOrder: item.sortOrder ?? 0
      }
    });
  }

  for (const item of site) {
    await prisma.siteSetting.upsert({
      where: { key: item.key },
      create: { key: item.key, valueJson: item.valueJson ?? {} },
      update: { valueJson: item.valueJson ?? {} }
    });
  }

  console.log("MVP import done", {
    promotions: promotions.length,
    games: games.length,
    social: social.length,
    site: site.length
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function promo(index: number) {
  return {
    title: `Promotion ${index + 1}`,
    subtitle: `Limited offer ${index + 1} - claim today`,
    coverUrl: `https://picsum.photos/seed/promo-${index + 1}/900/600`,
    detailJson: {
      blocks: [
        { id: `h1-${index + 1}`, type: "h1", text: `Promotion ${index + 1}` },
        { id: `p-${index + 1}`, type: "p", text: "Top up and get extra rewards instantly. Terms apply." },
        {
          id: `list-${index + 1}`,
          type: "list",
          items: ["Create account", "Top up amount", "Claim reward in wallet"]
        },
        {
          id: `btn-${index + 1}`,
          type: "button",
          label: "Claim Now",
          url: "https://example.com/claim"
        },
        {
          id: `img-${index + 1}`,
          type: "image",
          url: `https://picsum.photos/seed/promo-detail-${index + 1}/1200/700`
        }
      ]
    },
    isActive: true,
    sortOrder: index
  };
}

function game(index: number) {
  return {
    name: `Game ${index + 1}`,
    logoUrl: `https://picsum.photos/seed/game-${index + 1}/260/120`,
    isActive: true,
    sortOrder: index
  };
}

const socialSeed = [
  { label: "WhatsApp", url: "https://wa.me/60123456789", iconUrl: null, sortOrder: 0 },
  { label: "Telegram", url: "https://t.me/example", iconUrl: null, sortOrder: 1 },
  { label: "Chat", url: "https://example.com/chat", iconUrl: null, sortOrder: 2 },
  { label: "Facebook", url: "https://facebook.com/example", iconUrl: null, sortOrder: 3 },
  { label: "Bot", url: "https://example.com/bot", iconUrl: null, sortOrder: 4 }
];

async function ensureAdmin() {
  const email = process.env.ADMIN_SEED_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "change_me_123";
  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) return existing;
  const passwordHash = await bcrypt.hash(password, 12);
  return db.adminUser.create({
    data: {
      email,
      passwordHash,
      role: "admin"
    }
  });
}

async function main() {
  const admin = await ensureAdmin();

  await db.promotion.deleteMany();
  await db.gameProvider.deleteMany();
  await db.socialLink.deleteMany();

  await db.promotion.createMany({ data: Array.from({ length: 6 }, (_, i) => promo(i)) });
  await db.gameProvider.createMany({ data: Array.from({ length: 12 }, (_, i) => game(i)) });
  await db.socialLink.createMany({
    data: socialSeed.map((s) => ({ ...s, isActive: true }))
  });

  const site = await db.siteSetting.upsert({
    where: { key: "demo_seed_status" },
    create: { key: "demo_seed_status", valueJson: { seededAt: new Date().toISOString() } },
    update: { valueJson: { seededAt: new Date().toISOString() } }
  });

  await Promise.all([
    db.riskRule.upsert({
      where: { key: "DIFF_THRESHOLD" },
      create: { key: "DIFF_THRESHOLD", isActive: true, valueJson: { enabled: true, threshold: 100 } },
      update: { isActive: true, valueJson: { enabled: true, threshold: 100 } }
    }),
    db.riskRule.upsert({
      where: { key: "FORCE_CLOSE_CONFIRM" },
      create: { key: "FORCE_CLOSE_CONFIRM", isActive: true, valueJson: { enabled: true } },
      update: { isActive: true, valueJson: { enabled: true } }
    }),
    db.riskRule.upsert({
      where: { key: "CLOSE_BLOCK_IF_UNMATCHED" },
      create: { key: "CLOSE_BLOCK_IF_UNMATCHED", isActive: true, valueJson: { enabled: true } },
      update: { isActive: true, valueJson: { enabled: true } }
    }),
    db.riskRule.upsert({
      where: { key: "HIGHLIGHT_UNMATCHED" },
      create: { key: "HIGHLIGHT_UNMATCHED", isActive: true, valueJson: { enabled: true } },
      update: { isActive: true, valueJson: { enabled: true } }
    })
  ]);

  await db.auditLog.create({
    data: {
      actorId: admin.id,
      action: "DEMO_SEED",
      entityType: "SiteSetting",
      entityId: site.id,
      diffJson: {
        info: "Demo content seeded",
        modules: { promotions: 6, games: 12, social: 5 },
        riskRules: 4
      }
    }
  });

  console.log("DEMO_SEED_OK: promotions=6 games=12 social=5");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

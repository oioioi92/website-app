import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedRiskRules(p: PrismaClient) {
  await Promise.all([
    p.riskRule.upsert({
      where: { key: "DIFF_THRESHOLD" },
      create: { key: "DIFF_THRESHOLD", isActive: true, valueJson: { enabled: true, threshold: 100 } },
      update: { isActive: true, valueJson: { enabled: true, threshold: 100 } }
    }),
    p.riskRule.upsert({
      where: { key: "FORCE_CLOSE_CONFIRM" },
      create: { key: "FORCE_CLOSE_CONFIRM", isActive: true, valueJson: { enabled: true } },
      update: { isActive: true, valueJson: { enabled: true } }
    }),
    p.riskRule.upsert({
      where: { key: "CLOSE_BLOCK_IF_UNMATCHED" },
      create: { key: "CLOSE_BLOCK_IF_UNMATCHED", isActive: true, valueJson: { enabled: true } },
      update: { isActive: true, valueJson: { enabled: true } }
    }),
    p.riskRule.upsert({
      where: { key: "HIGHLIGHT_UNMATCHED" },
      create: { key: "HIGHLIGHT_UNMATCHED", isActive: true, valueJson: { enabled: true } },
      update: { isActive: true, valueJson: { enabled: true } }
    })
  ]);
  console.log("Risk rules seeded: 4");
}

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required");
  }
  const exists = await prisma.adminUser.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 12);
  if (exists) {
    await prisma.adminUser.update({
      where: { email },
      data: { passwordHash }
    });
    console.log("Admin password updated:", email);
    await seedRiskRules(prisma);
    return;
  }
  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      role: "admin"
    }
  });
  console.log("Admin seeded:", email);
  await seedRiskRules(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

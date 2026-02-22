import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required");
  }
  const exists = await prisma.adminUser.findUnique({ where: { email } });
  if (exists) {
    console.log("Admin already exists:", email);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      role: "admin"
    }
  });
  console.log("Admin seeded:", email);

  await Promise.all([
    prisma.riskRule.upsert({
      where: { key: "DIFF_THRESHOLD" },
      create: { key: "DIFF_THRESHOLD", isActive: true, valueJson: { enabled: true, threshold: 100 } },
      update: { isActive: true, valueJson: { enabled: true, threshold: 100 } }
    }),
    prisma.riskRule.upsert({
      where: { key: "FORCE_CLOSE_CONFIRM" },
      create: { key: "FORCE_CLOSE_CONFIRM", isActive: true, valueJson: { enabled: true } },
      update: { isActive: true, valueJson: { enabled: true } }
    }),
    prisma.riskRule.upsert({
      where: { key: "CLOSE_BLOCK_IF_UNMATCHED" },
      create: { key: "CLOSE_BLOCK_IF_UNMATCHED", isActive: true, valueJson: { enabled: true } },
      update: { isActive: true, valueJson: { enabled: true } }
    }),
    prisma.riskRule.upsert({
      where: { key: "HIGHLIGHT_UNMATCHED" },
      create: { key: "HIGHLIGHT_UNMATCHED", isActive: true, valueJson: { enabled: true } },
      update: { isActive: true, valueJson: { enabled: true } }
    })
  ]);
  console.log("Risk rules seeded: 4");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

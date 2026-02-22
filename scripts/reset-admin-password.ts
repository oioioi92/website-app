import "dotenv/config";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_RESET_EMAIL ?? process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_RESET_PASSWORD;
  if (!email) throw new Error("ADMIN_RESET_EMAIL (or ADMIN_SEED_EMAIL) is required");
  if (!password) throw new Error("ADMIN_RESET_PASSWORD is required");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash, role: "admin" },
    update: {
      passwordHash,
      // Reset TOTP so you don't get locked out in local/dev.
      totpEnabled: false,
      totpSecretEnc: null,
      totpVerifiedAt: null,
      totpBackupCodesHash: Prisma.JsonNull,
      totpLastUsedStep: null,
    },
  });

  // Drop existing sessions to force re-login with the new password.
  await prisma.session.deleteMany({ where: { userId: user.id } });

  console.log("Admin password reset:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


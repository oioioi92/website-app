import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { chatPrisma?: PrismaClient };

export const chatDb =
  globalForPrisma.chatPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.chatPrisma = chatDb;
}


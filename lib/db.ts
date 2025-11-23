// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Always set global to prevent multiple PrismaClient instances
// This is critical for both development and production (especially serverless)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

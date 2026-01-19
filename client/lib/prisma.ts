import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Get the database connection URL.
 *
 * Priority (same as prisma.config.ts for consistency):
 * 1. SESSION_POOLER_URL - Session pooler (recommended for Supabase)
 * 2. DIRECT_URL - Direct connection (often blocked on free tier)
 * 3. DATABASE_URL - Transaction pooler (fallback)
 *
 * This ensures the runtime uses the same database as schema migrations.
 */
const getDatabaseUrl = () => {
  return process.env.SESSION_POOLER_URL || process.env.DIRECT_URL || process.env.DATABASE_URL || "";
};

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl(),
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

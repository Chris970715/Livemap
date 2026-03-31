import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma Configuration for Supabase
 *
 * Connection priority:
 * 1. SESSION_POOLER_URL - Session pooler (port 5432 on pooler) - works for migrations
 * 2. DIRECT_URL - Direct connection (port 5432 on db.*.supabase.co) - often blocked on free tier
 * 3. DATABASE_URL - Transaction pooler (port 6543) - fallback, may hang on migrations
 *
 * For Supabase free tier, direct connections are usually blocked.
 * Use Session Pooler URL from: Dashboard → Settings → Database → Connection string → Session pooler
 */
const databaseUrl =
  process.env.SESSION_POOLER_URL || process.env.DIRECT_URL || process.env.DATABASE_URL || "";

export default defineConfig({
  schema: "prisma/schema.prisma",

  // For db push/migrate, Session Pooler (port 5432) is required when direct connection is blocked
  datasource: {
    url: databaseUrl,
  },
});

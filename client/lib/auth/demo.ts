import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

/**
 * Demo account for the public portfolio deployment.
 * Visitors sign in with one click; registration is disabled.
 * Override with DEMO_USER_EMAIL / DEMO_USER_PASSWORD.
 */
export const DEMO_USER = {
  name: "Demo User",
  email: process.env.DEMO_USER_EMAIL || "demo@huginn.app",
  password: process.env.DEMO_USER_PASSWORD || "huginn-demo",
};

/**
 * Creates the demo user on first use, so a fresh database needs no seed step.
 */
export async function ensureDemoUser(): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_USER.email },
    select: { id: true },
  });
  if (existing) return;

  const hashedPassword = await bcrypt.hash(DEMO_USER.password, 12);
  await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: {},
    create: { name: DEMO_USER.name, email: DEMO_USER.email, hashedPassword },
  });
}

import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

/**
 * Default account for the public portfolio deployment, prefilled on the
 * sign-in form so visitors can log in without registering.
 * Override with DEMO_USER_EMAIL / DEMO_USER_PASSWORD.
 */
export const DEMO_USER = {
  name: "Demo User",
  email: (process.env.DEMO_USER_EMAIL || "abc@gmail.com").trim().toLowerCase(),
  password: process.env.DEMO_USER_PASSWORD || "password1234",
};

/**
 * Creates the demo user on first use, so a fresh database needs no seed step.
 * Also sets the password if the account exists without one (e.g. created via OAuth).
 */
export async function ensureDemoUser(): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { email: DEMO_USER.email },
    select: { hashedPassword: true },
  });
  if (existing?.hashedPassword) return;

  const hashedPassword = await bcrypt.hash(DEMO_USER.password, 12);
  await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: { hashedPassword },
    create: { name: DEMO_USER.name, email: DEMO_USER.email, hashedPassword },
  });
}

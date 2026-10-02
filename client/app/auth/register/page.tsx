import type { Metadata } from "next";

import { enabledOAuthProviders } from "@/lib/auth/config";
import { RegisterForm } from "./_components/register-form";

export const metadata: Metadata = {
  title: "Sign up",
};

interface RegisterPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { callbackUrl } = await searchParams;

  return <RegisterForm callbackUrl={callbackUrl} oauthProviders={enabledOAuthProviders} />;
}

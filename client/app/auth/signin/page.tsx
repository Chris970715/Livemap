import type { Metadata } from "next";

import { DEMO_USER } from "@/lib/auth/demo";
import { SignInForm } from "./_components/sign-in-form";

export const metadata: Metadata = {
  title: "로그인 | LiveMap",
};

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <SignInForm
      callbackUrl={callbackUrl}
      demoEmail={DEMO_USER.email}
      demoPassword={DEMO_USER.password}
    />
  );
}

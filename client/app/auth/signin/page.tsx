import type { Metadata } from "next";

import { enabledOAuthProviders } from "@/lib/auth/config";
import { DEMO_USER } from "@/lib/auth/demo";
import { SignInForm } from "./_components/sign-in-form";

export const metadata: Metadata = {
  title: "Log in",
};

// Auth.js가 OAuth 실패 시 ?error=<type>로 돌려보냄 (pages.error)
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: "This email is already registered with a different sign-in method.",
  AccessDenied: "Sign-in was cancelled or denied.",
  Configuration: "Sign-in is temporarily unavailable. Please try again later.",
};
const DEFAULT_OAUTH_ERROR = "Sign-in failed. Please try again.";

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl, error } = await searchParams;

  return (
    <SignInForm
      callbackUrl={callbackUrl}
      errorMessage={error ? (OAUTH_ERROR_MESSAGES[error] ?? DEFAULT_OAUTH_ERROR) : undefined}
      defaultEmail={DEMO_USER.email}
      defaultPassword={DEMO_USER.password}
      oauthProviders={enabledOAuthProviders}
    />
  );
}

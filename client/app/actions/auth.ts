"use server";

import * as Sentry from "@sentry/nextjs";
import { signIn as nextAuthSignIn } from "@/lib/auth";
import { DEMO_USER, ensureDemoUser } from "@/lib/auth/demo";
import { ERROR_MESSAGES } from "@/lib/constants/messages";
import type { ActionResult } from "@/lib/types/actions";
import { signInSchema } from "@/lib/validations/auth";

const DEFAULT_REDIRECT = "/security";

/**
 * 오픈 리다이렉트 방지: 같은 사이트 내 경로만 허용
 *
 * 브라우저는 백슬래시를 "/"로 취급하고 탭/개행을 제거하므로 ("/\evil.com" → "//evil.com"),
 * 문자열 검사 대신 URL로 해석해 origin이 바뀌는지 확인
 */
function safeRedirect(url: unknown): string {
  if (typeof url !== "string" || !url.startsWith("/")) return DEFAULT_REDIRECT;

  const base = "http://localhost";
  try {
    const resolved = new URL(url, base);
    if (resolved.origin !== base) return DEFAULT_REDIRECT;
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return DEFAULT_REDIRECT;
  }
}

type SignInResult = ActionResult<{ redirectTo: string }>;

/**
 * 이메일/비밀번호 로그인
 *
 * 세션 쿠키만 설정하고 이동 경로를 반환 — 클라이언트가 전체 페이지 이동으로
 * SessionProvider(useSession)까지 새 세션을 읽도록 함
 */
export async function signInWithCredentials(formData: FormData): Promise<SignInResult> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 이메일 또는 비밀번호가 필요합니다.
    const validation = signInSchema.safeParse({ email, password });
    if (!validation.success) {
      return { error: validation.error.issues[0]?.message ?? ERROR_MESSAGES.INVALID_INPUT };
    }

    await nextAuthSignIn("credentials", { email, password, redirect: false });

    return { data: { redirectTo: safeRedirect(formData.get("callbackUrl")) } };
  } catch (error) {
    Sentry.captureException(error, { tags: { action: "signInWithCredentials" } });
    return { error: ERROR_MESSAGES.INVALID_CREDENTIALS };
  }
}

/**
 * 데모 계정 로그인 (포트폴리오 배포용 — 회원가입 없이 바로 체험)
 */
export async function signInAsDemo(callbackUrl?: string): Promise<SignInResult> {
  try {
    await ensureDemoUser();

    await nextAuthSignIn("credentials", {
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      redirect: false,
    });

    return { data: { redirectTo: safeRedirect(callbackUrl) } };
  } catch (error) {
    Sentry.captureException(error, { tags: { action: "signInAsDemo" } });
    return { error: ERROR_MESSAGES.SIGNIN_ERROR };
  }
}

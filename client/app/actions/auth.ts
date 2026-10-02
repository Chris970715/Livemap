"use server";

import bcrypt from "bcryptjs";
import * as Sentry from "@sentry/nextjs";
import { signIn as nextAuthSignIn } from "@/lib/auth";
import { enabledOAuthProviders, type OAuthProviderId } from "@/lib/auth/config";
import { DEMO_USER, ensureDemoUser } from "@/lib/auth/demo";
import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/messages";
import type { ActionResult } from "@/lib/types/actions";
import { signInSchema, registerSchema } from "@/lib/validations/auth";

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
    // 이메일 또는 비밀번호가 필요합니다. (이메일은 소문자로 정규화)
    const validation = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!validation.success) {
      return { error: validation.error.issues[0]?.message ?? ERROR_MESSAGES.INVALID_INPUT };
    }
    const { email, password } = validation.data;

    // 기본 계정은 첫 로그인 시 생성 (새 DB에서도 별도 시드 없이 동작)
    if (email === DEMO_USER.email) {
      await ensureDemoUser();
    }

    await nextAuthSignIn("credentials", { email, password, redirect: false });

    return { data: { redirectTo: safeRedirect(formData.get("callbackUrl")) } };
  } catch (error) {
    Sentry.captureException(error, { tags: { action: "signInWithCredentials" } });
    return { error: ERROR_MESSAGES.INVALID_CREDENTIALS };
  }
}

/**
 * OAuth 로그인 (Google, Discord) — 키가 설정된 공급자만 허용
 */
export async function signInWithOAuth(
  provider: OAuthProviderId,
  callbackUrl?: string
): Promise<void> {
  // Server Action은 공개 엔드포인트이므로 런타임에도 공급자를 검증
  if (!enabledOAuthProviders.includes(provider)) return;

  await nextAuthSignIn(provider, { redirectTo: safeRedirect(callbackUrl) });
}

/**
 * 회원가입 후 자동 로그인
 */
export async function register(formData: FormData): Promise<SignInResult> {
  try {
    const validation = registerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!validation.success) {
      return { error: validation.error.issues[0]?.message ?? ERROR_MESSAGES.INVALID_INPUT };
    }
    const { name, email, password } = validation.data;

    // 이메일 중복 확인 (기본 계정 이메일은 예약)
    if (email === DEMO_USER.email) {
      return { error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS };
    }
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      return { error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS };
    }

    // 비밀번호 해싱 후 사용자 생성 (동시 가입으로 인한 unique 위반도 중복으로 처리)
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
      await prisma.user.create({
        data: {
          name,
          email,
          hashedPassword,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return { error: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS };
      }
      throw error;
    }

    // 자동 로그인 — 실패해도 계정은 생성됐으므로 로그인 페이지로 안내
    try {
      await nextAuthSignIn("credentials", { email, password, redirect: false });
    } catch (error) {
      Sentry.captureException(error, { tags: { action: "register.autoSignIn" } });
      return { data: { redirectTo: "/auth/signin" } };
    }

    return { data: { redirectTo: safeRedirect(formData.get("callbackUrl")) } };
  } catch (error) {
    Sentry.captureException(error, { tags: { action: "register" } });
    return { error: ERROR_MESSAGES.REQUEST_ERROR };
  }
}

/**
 * Server Action 결과 타입
 *
 * 모든 Server Actions는 이 타입을 반환해야 합니다.
 *
 * @example
 * // 성공
 * return { data: item };
 *
 * // 실패
 * return { error: "아이템 생성에 실패했습니다." };
 */
export type ActionResult<T = null> = { data: T; error?: never } | { data?: never; error: string };

/**
 * 인증된 사용자 정보
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

/**
 * 인증 컨텍스트 (withAuth HOF에서 전달)
 */
export interface AuthContext {
  user: AuthenticatedUser;
}

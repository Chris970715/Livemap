import * as Sentry from "@sentry/nextjs";

import { auth } from "./config";
import { ERROR_MESSAGES } from "@/lib/constants/messages";
import type { ActionResult, AuthContext, AuthenticatedUser } from "@/lib/types/actions";

/**
 * 인증이 필요한 Server Action을 래핑하는 HOF (Higher-Order Function)
 *
 * @example
 * export const createItem = withAuth(
 *   async (ctx, title: string): Promise<ActionResult<Item>> => {
 *     // ctx.user.id로 현재 사용자 접근 가능
 *     const item = await prisma.item.create({
 *       data: { title, userId: ctx.user.id }
 *     });
 *     return { data: item };
 *   }
 * );
 */
export function withAuth<TArgs extends unknown[], TResult>(
  action: (ctx: AuthContext, ...args: TArgs) => Promise<ActionResult<TResult>>
): (...args: TArgs) => Promise<ActionResult<TResult>> {
  return async (...args: TArgs): Promise<ActionResult<TResult>> => {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: ERROR_MESSAGES.UNAUTHORIZED };
    }

    const ctx: AuthContext = {
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name,
        image: session.user.image,
      } as AuthenticatedUser,
    };

    try {
      return await action(ctx, ...args);
    } catch (error) {
      Sentry.captureException(error, { tags: { action: "withAuth" } });
      return { error: ERROR_MESSAGES.REQUEST_ERROR };
    }
  };
}

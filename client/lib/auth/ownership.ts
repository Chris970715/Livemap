import prisma from "@/lib/prisma";
import { ERROR_MESSAGES } from "@/lib/constants/messages";

/**
 * 소유권 검증 결과 타입
 */
export interface OwnershipResult<T> {
  data: T | null;
  error?: string;
}

/**
 * 아이템 소유권 검증용 타입 (필요한 필드만 포함)
 */
type ItemOwnershipData = {
  id: string;
  userId: string;
};

/**
 * 아이템 존재 및 소유권 검증
 * 최적화: 필요한 필드만 조회 (id, userId)
 *
 * @param itemId - 검증할 아이템 ID
 * @param userId - 소유자 ID
 * @returns OwnershipResult - 검증 결과
 *
 * @example
 * const { data, error } = await verifyItemOwnership(itemId, ctx.user.id);
 * if (error) return { error };
 */
export async function verifyItemOwnership(
  itemId: string,
  userId: string
): Promise<OwnershipResult<ItemOwnershipData>> {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { id: true, userId: true },
  });

  if (!item) {
    return { data: null, error: ERROR_MESSAGES.ITEM_NOT_FOUND };
  }

  if (item.userId !== userId) {
    return { data: null, error: ERROR_MESSAGES.ITEM_OWNER_ONLY };
  }

  return { data: item };
}

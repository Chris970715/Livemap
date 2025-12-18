"use server";

import { revalidatePath, updateTag } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { ERROR_MESSAGES } from "@/lib/constants/messages";
import { createItemSchema, updateItemSchema } from "@/lib/validations/item";
import type { ActionResult } from "@/lib/types/actions";
import type { Item } from "@/lib/generated/prisma/client";

/**
 * 아이템 생성
 */
export const createItem = withAuth(
  async (ctx, dto: { title: string; description?: string }): Promise<ActionResult<Item>> => {
    try {
      const validation = createItemSchema.safeParse(dto);
      if (!validation.success) {
        return { error: validation.error.issues[0]?.message ?? ERROR_MESSAGES.INVALID_INPUT };
      }

      const item = await prisma.item.create({
        data: {
          title: dto.title,
          description: dto.description,
          userId: ctx.user.id,
        },
      });

      updateTag(CACHE_TAGS.ITEMS);
      updateTag(CACHE_TAGS.USER_ITEMS(ctx.user.id));
      revalidatePath("/items");

      return { data: item };
    } catch (error) {
      Sentry.captureException(error, { tags: { action: "createItem" } });
      return { error: ERROR_MESSAGES.REQUEST_ERROR };
    }
  }
);

/**
 * 아이템 수정
 */
export const updateItem = withAuth(
  async (
    ctx,
    id: string,
    dto: { title?: string; description?: string; status?: string }
  ): Promise<ActionResult<Item>> => {
    try {
      const validation = updateItemSchema.safeParse(dto);
      if (!validation.success) {
        return { error: validation.error.issues[0]?.message ?? ERROR_MESSAGES.INVALID_INPUT };
      }

      // 소유권 확인
      const existingItem = await prisma.item.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existingItem) {
        return { error: ERROR_MESSAGES.ITEM_NOT_FOUND };
      }

      if (existingItem.userId !== ctx.user.id) {
        return { error: ERROR_MESSAGES.ITEM_OWNER_ONLY };
      }

      const item = await prisma.item.update({
        where: { id },
        data: dto,
      });

      updateTag(CACHE_TAGS.ITEMS);
      updateTag(CACHE_TAGS.ITEM(id));
      updateTag(CACHE_TAGS.USER_ITEMS(ctx.user.id));
      revalidatePath("/items");
      revalidatePath(`/items/${id}`);

      return { data: item };
    } catch (error) {
      Sentry.captureException(error, { tags: { action: "updateItem" } });
      return { error: ERROR_MESSAGES.REQUEST_ERROR };
    }
  }
);

/**
 * 아이템 삭제
 */
export const deleteItem = withAuth(async (ctx, id: string): Promise<ActionResult> => {
  try {
    // 소유권 확인
    const existingItem = await prisma.item.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingItem) {
      return { error: ERROR_MESSAGES.ITEM_NOT_FOUND };
    }

    if (existingItem.userId !== ctx.user.id) {
      return { error: ERROR_MESSAGES.ITEM_OWNER_ONLY };
    }

    await prisma.item.delete({
      where: { id },
    });

    updateTag(CACHE_TAGS.ITEMS);
    updateTag(CACHE_TAGS.ITEM(id));
    updateTag(CACHE_TAGS.USER_ITEMS(ctx.user.id));
    revalidatePath("/items");

    return { data: null };
  } catch (error) {
    Sentry.captureException(error, { tags: { action: "deleteItem" } });
    return { error: ERROR_MESSAGES.REQUEST_ERROR };
  }
});

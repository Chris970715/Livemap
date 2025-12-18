"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Item } from "@/lib/generated/prisma/client";

/**
 * 현재 사용자의 아이템 목록 조회
 */
export async function getItems(): Promise<Item[]> {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const items = await prisma.item.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return items;
}

/**
 * 아이템 상세 조회
 */
export async function getItemById(id: string): Promise<Item | null> {
  const item = await prisma.item.findUnique({
    where: { id },
  });

  return item;
}

import { z } from "zod";

/**
 * 아이템 생성 스키마
 */
export const createItemSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100, "제목은 100자 이내로 입력해주세요"),
  description: z.string().max(1000, "설명은 1000자 이내로 입력해주세요").optional(),
});

export type CreateItemFormValues = z.infer<typeof createItemSchema>;

/**
 * 아이템 수정 스키마
 */
export const updateItemSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(100, "제목은 100자 이내로 입력해주세요")
    .optional(),
  description: z.string().max(1000, "설명은 1000자 이내로 입력해주세요").optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
});

export type UpdateItemFormValues = z.infer<typeof updateItemSchema>;

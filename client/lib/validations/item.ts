import { z } from "zod";

/**
 * 아이템 생성 스키마
 */
export const createItemSchema = z.object({
  title: z
    .string()
    .min(1, "Please enter a title")
    .max(100, "Title must be 100 characters or fewer"),
  description: z.string().max(1000, "Description must be 1000 characters or fewer").optional(),
});

export type CreateItemFormValues = z.infer<typeof createItemSchema>;

/**
 * 아이템 수정 스키마
 */
export const updateItemSchema = z.object({
  title: z
    .string()
    .min(1, "Please enter a title")
    .max(100, "Title must be 100 characters or fewer")
    .optional(),
  description: z.string().max(1000, "Description must be 1000 characters or fewer").optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
});

export type UpdateItemFormValues = z.infer<typeof updateItemSchema>;

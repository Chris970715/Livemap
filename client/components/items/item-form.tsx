"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createItem, updateItem } from "@/app/actions/items";
import { createItemSchema, type CreateItemFormValues } from "@/lib/validations/item";
import type { Item } from "@/lib/generated/prisma/client";

interface ItemFormProps {
  item?: Item;
}

export function ItemForm({ item }: ItemFormProps) {
  const router = useRouter();
  const isEditing = !!item;

  const form = useForm<CreateItemFormValues>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      title: item?.title ?? "",
      description: item?.description ?? "",
    },
  });

  const onSubmit = async (data: CreateItemFormValues) => {
    const result = isEditing ? await updateItem(item.id, data) : await createItem(data);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isEditing ? "아이템이 수정되었습니다" : "아이템이 생성되었습니다");
      router.push("/items");
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{isEditing ? "아이템 수정" : "새 아이템"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input id="title" placeholder="아이템 제목" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택)</Label>
            <Input id="description" placeholder="아이템 설명" {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? isEditing
                  ? "수정 중..."
                  : "생성 중..."
                : isEditing
                  ? "수정"
                  : "생성"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

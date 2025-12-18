"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteItem } from "@/app/actions/items";
import type { Item } from "@/lib/generated/prisma/client";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const result = await deleteItem(item.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("아이템이 삭제되었습니다");
      router.refresh();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
            {item.status}
          </span>
        </div>
        {item.description && <CardDescription>{item.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/items/${item.id}`}>상세보기</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/items/${item.id}/edit`}>수정</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getItems } from "@/app/actions/items";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/items/item-card";

export default async function ItemsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const items = await getItems();

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">내 아이템</h1>
          <p className="text-muted-foreground">아이템을 관리하세요</p>
        </div>
        <Button asChild>
          <Link href="/items/new">새 아이템</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">아직 아이템이 없습니다</p>
          <Button asChild>
            <Link href="/items/new">첫 아이템 만들기</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}

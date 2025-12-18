import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getItemById } from "@/app/actions/items";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ItemDetailPageProps {
  params: Promise<{ itemId: string }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { itemId } = await params;
  const item = await getItemById(itemId);

  if (!item) {
    notFound();
  }

  // 소유권 확인
  if (item.userId !== session.user.id) {
    redirect("/items");
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{item.title}</CardTitle>
              <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full">
                {item.status}
              </span>
            </div>
            {item.description && <CardDescription>{item.description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>생성일: {new Date(item.createdAt).toLocaleDateString("ko-KR")}</p>
              <p>수정일: {new Date(item.updatedAt).toLocaleDateString("ko-KR")}</p>
            </div>

            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/items/${item.id}/edit`}>수정</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/items">목록으로</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

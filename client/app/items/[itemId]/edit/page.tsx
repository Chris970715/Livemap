import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getItemById } from "@/app/actions/items";
import { ItemForm } from "@/components/items/item-form";

interface EditItemPageProps {
  params: Promise<{ itemId: string }>;
}

export default async function EditItemPage({ params }: EditItemPageProps) {
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
    <main className="container mx-auto py-8 px-4 flex justify-center">
      <ItemForm item={item} />
    </main>
  );
}

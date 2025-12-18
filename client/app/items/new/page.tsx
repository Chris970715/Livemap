import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ItemForm } from "@/components/items/item-form";

export default async function NewItemPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <main className="container mx-auto py-8 px-4 flex justify-center">
      <ItemForm />
    </main>
  );
}

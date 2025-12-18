import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Next.js Full-Stack Boilerplate</h1>
        <p className="text-muted-foreground">NextAuth + Prisma + shadcn/ui + Sentry</p>

        <div className="flex gap-4 justify-center">
          {session ? (
            <>
              <Button asChild>
                <Link href="/items">내 아이템</Link>
              </Button>
              <form action="/api/auth/signout" method="POST">
                <Button variant="outline" type="submit">
                  로그아웃
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/auth/signin">로그인</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/register">회원가입</Link>
              </Button>
            </>
          )}
        </div>

        {session && (
          <p className="text-sm text-muted-foreground">
            {session.user?.name || session.user?.email}님 환영합니다
          </p>
        )}
      </div>
    </main>
  );
}

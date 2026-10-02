"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="px-4 py-2 text-gray-400 text-sm">Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">{session.user?.name || session.user?.email}</span>
        {session.user?.image && (
          <img src={session.user.image} alt="User avatar" className="w-8 h-8 rounded-full" />
        )}
        <button
          onClick={() => signOut()}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth/signin"
      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Log in
    </Link>
  );
}

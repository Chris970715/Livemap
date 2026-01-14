"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthButton } from "./auth-button";

const NAV_ITEMS = [
  { name: "홈", path: "/" },
  { name: "정치", path: "/politics" },
  { name: "경제", path: "/economy" },
  { name: "안보", path: "/security" },
  { name: "기술/IT", path: "/tech" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          <nav className="flex space-x-8 md:space-x-12">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    relative px-3 py-2 text-sm md:text-base font-medium transition-all duration-200
                    ${isActive ? "text-white font-bold" : "text-gray-300 hover:text-gray-200"}
                  `}
                >
                  {item.name}
                  {isActive && (
                    <div className="absolute inset-0 bg-white/10 rounded-md animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="absolute right-4 sm:right-6 lg:right-8">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}

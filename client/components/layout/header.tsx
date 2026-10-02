"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAtom } from "jotai";

import { languageAtom } from "@/lib/store";
import { AuthButton } from "./auth-button";

const NAV_ITEMS = [
  { name: "Politics", path: "/politics" },
  { name: "Economy", path: "/economy" },
  { name: "Security", path: "/security" },
  { name: "Tech", path: "/tech" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [lang, setLang] = useAtom(languageAtom);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="text-white relative">
      <div className="max-w-[1800px] mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-bold tracking-widest text-white mr-4">
              HUGINN
            </Link>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right side: language toggle + auth */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "ko" ? "en" : "ko")}
              title="Article language"
              className="px-2.5 py-1 text-xs font-mono rounded border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-colors"
            >
              {lang === "ko" ? "EN" : "KO"}
            </button>
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="absolute top-14 left-0 right-0 bg-[#17171c] border-b border-gray-800 md:hidden z-50">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-6 py-3 text-sm ${
                pathname === item.path ? "text-white bg-white/5" : "text-gray-400 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

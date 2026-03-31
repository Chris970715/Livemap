"use client";

import { useAtomValue } from "jotai";

import { feedsListAtom, languageAtom } from "@/lib/store";

export function BreakingNewsTicker() {
  const feeds = useAtomValue(feedsListAtom);
  const lang = useAtomValue(languageAtom);

  const breaking = feeds.filter((f) => f.isBreaking);
  if (breaking.length === 0) return null;

  return (
    <div className="relative bg-gradient-to-r from-red-950/80 to-red-900/40 border-b border-red-800/30 overflow-hidden h-10 rounded-lg mb-3">
      <div className="absolute left-0 top-0 bottom-0 flex items-center px-3 bg-red-600 text-white text-xs font-bold z-10 gap-1.5">
        <span className="w-1.5 h-1.5 bg-red-300 rounded-full animate-ping" />
        BREAKING
      </div>
      <div className="ml-24 flex items-center h-full animate-ticker whitespace-nowrap">
        {breaking.map((feed) => {
          const headline =
            lang === "en" && feed.articleEn?.headline
              ? feed.articleEn.headline
              : feed.article?.headline || feed.title;
          return (
            <span key={feed.id} className="text-red-200 text-sm mr-12">
              {headline}
            </span>
          );
        })}
        {/* Duplicate for seamless loop */}
        {breaking.map((feed) => {
          const headline =
            lang === "en" && feed.articleEn?.headline
              ? feed.articleEn.headline
              : feed.article?.headline || feed.title;
          return (
            <span key={`${feed.id}-loop`} className="text-red-200 text-sm mr-12">
              {headline}
            </span>
          );
        })}
      </div>
    </div>
  );
}

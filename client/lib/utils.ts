import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { FeedItem } from "@/lib/types/feed";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Relative time (e.g. "just now", "3h ago")
 */
export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return d.toLocaleDateString("en-US");
}

/**
 * Headline in the selected article language
 * (falls back to the Korean article, then the raw title)
 */
export function getFeedHeadline(feed: FeedItem, lang: "ko" | "en"): string {
  if (lang === "en" && feed.articleEn?.headline) return feed.articleEn.headline;
  return feed.article?.headline || feed.title;
}

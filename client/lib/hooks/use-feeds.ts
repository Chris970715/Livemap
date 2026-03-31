"use client";

import { useQuery } from "@tanstack/react-query";

import type { FeedItem, FeedFilters } from "@/lib/types/feed";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * 피드 목록 조회 hook
 */
export function useFeedsQuery(filters: FeedFilters) {
  return useQuery({
    queryKey: ["feeds", filters],
    queryFn: async (): Promise<FeedItem[]> => {
      if (!API_BASE) {
        // API가 없으면 mock 데이터 사용
        const { securityFeedData } = await import("@/app/security/_data/feed-data");
        return securityFeedData.filter(
          (f) =>
            f.category === filters.category &&
            (!filters.subCategory || f.subCategory === filters.subCategory)
        );
      }

      const params = new URLSearchParams({
        category: filters.category,
        ...(filters.subCategory && { subCategory: filters.subCategory }),
      });

      const res = await fetch(`${API_BASE}/feeds?${params}`);
      if (!res.ok) throw new Error("Failed to fetch feeds");

      return res.json();
    },
    staleTime: 30_000,
  });
}

"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
        ...(filters.q && { q: filters.q }),
      });

      const res = await fetch(`${API_BASE}/feeds?${params}`);
      if (!res.ok) throw new Error("Failed to fetch feeds");

      return res.json();
    },
    staleTime: 30_000,
  });
}

/**
 * SSE 실시간 피드 업데이트 hook
 * 새 기사 도착 시 feeds 쿼리를 invalidate하고 breaking 기사면 toast 알림
 */
export function useFeedSSE() {
  const queryClient = useQueryClient();
  const retryRef = useRef(0);

  useEffect(() => {
    if (!API_BASE) return;

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      es = new EventSource(`${API_BASE}/feeds/stream`);

      es.onopen = () => {
        retryRef.current = 0;
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "new_article") {
            queryClient.invalidateQueries({ queryKey: ["feeds"] });

            if (data.isBreaking) {
              toast.info(data.title || "New breaking news", {
                description: `${data.category} — Breaking News`,
              });
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        es?.close();
        es = null;
        const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
        retryRef.current++;
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [queryClient]);
}

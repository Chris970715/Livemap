"use client";

import dynamic from "next/dynamic";

import type { FeedItem } from "@/lib/types/feed";

// Leaflet은 SSR을 지원하지 않으므로 dynamic import 사용
const SecurityMapClient = dynamic(
  () => import("./security-map-client").then((mod) => mod.SecurityMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-gray-400">Loading map...</div>
      </div>
    ),
  }
);

interface SecurityMapProps {
  feeds: FeedItem[];
}

export function SecurityMap({ feeds }: SecurityMapProps) {
  return <SecurityMapClient feeds={feeds} />;
}

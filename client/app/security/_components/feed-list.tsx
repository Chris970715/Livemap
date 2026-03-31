"use client";

import { useSetAtom } from "jotai";

import type { FeedItem } from "@/lib/types/feed";
import { formatTimeAgo } from "@/lib/utils";
import { selectedFeedAtom, isModalOpenAtom } from "@/lib/store";

interface FeedListProps {
  feeds: FeedItem[];
  isLoading?: boolean;
}

export function FeedList({ feeds, isLoading }: FeedListProps) {
  const setSelectedFeed = useSetAtom(selectedFeedAtom);
  const setIsModalOpen = useSetAtom(isModalOpenAtom);

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div>
        {isLoading && <div className="text-gray-400 text-sm mb-2">불러오는 중...</div>}
        {feeds.map((feed) => (
          <div
            key={feed.id}
            className="cursor-pointer hover:bg-gray-800/50 transition-colors duration-200 rounded mb-4"
            onClick={() => {
              setSelectedFeed(feed);
              setIsModalOpen(true);
            }}
          >
            {/* 제목과 썸네일을 나란히 배치 */}
            <div className="flex gap-3 mb-2">
              {/* 제목 */}
              <div className="flex-1">
                <h3 className="text-white font-semibold text-base line-clamp-2 mb-1">
                  {feed.title}
                </h3>
                {/* 메타데이터 */}
                <div className="flex items-center text-xs text-gray-500">
                  <span>{formatTimeAgo(feed.publishedAt)}</span>
                  <span className="mx-1">·</span>
                  <span>{feed.sourceName}</span>
                </div>
              </div>

              {/* 썸네일 */}
              {feed.thumbnail && (
                <div className="flex-shrink-0">
                  <img
                    src={feed.thumbnail}
                    alt={feed.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

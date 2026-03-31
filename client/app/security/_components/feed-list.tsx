"use client";

import { useSetAtom, useAtomValue } from "jotai";

import type { FeedItem } from "@/lib/types/feed";
import { formatTimeAgo } from "@/lib/utils";
import { selectedFeedAtom, isModalOpenAtom, languageAtom } from "@/lib/store";

interface FeedListProps {
  feeds: FeedItem[];
  isLoading?: boolean;
}

export function FeedList({ feeds, isLoading }: FeedListProps) {
  const setSelectedFeed = useSetAtom(selectedFeedAtom);
  const setIsModalOpen = useSetAtom(isModalOpenAtom);
  const lang = useAtomValue(languageAtom);

  const getHeadline = (feed: FeedItem) => {
    if (lang === "en" && feed.articleEn?.headline) return feed.articleEn.headline;
    return feed.article?.headline || feed.title;
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      {isLoading && <div className="text-gray-400 text-sm mb-2 px-2">불러오는 중...</div>}
      <div className="space-y-1">
        {feeds.map((feed) => (
          <div
            key={feed.id}
            className="relative cursor-pointer hover:bg-white/5 transition-all duration-200 rounded-lg p-3 border border-transparent hover:border-gray-700/50"
            onClick={() => {
              setSelectedFeed(feed);
              setIsModalOpen(true);
            }}
          >
            {/* Breaking indicator */}
            {feed.isBreaking && (
              <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-red-500 animate-pulse rounded-full" />
            )}

            <div className="flex gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1.5">
                  {getHeadline(feed)}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  {feed.isBreaking && <span className="text-red-400 font-bold">LIVE</span>}
                  <span>{formatTimeAgo(feed.publishedAt)}</span>
                  <span className="text-gray-700">|</span>
                  <span className="truncate">{feed.sourceName}</span>
                  {feed.sourceCount && feed.sourceCount > 1 && (
                    <span className="text-gray-600">{feed.sourceCount} sources</span>
                  )}
                </div>
                {feed.verificationStatus === "verified" && (
                  <span className="inline-flex items-center gap-0.5 mt-1 text-[10px] text-green-500/80">
                    &#x2713; verified
                  </span>
                )}
              </div>

              {feed.thumbnail && (
                <img
                  src={feed.thumbnail}
                  alt=""
                  className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

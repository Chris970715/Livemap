"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { useFeedsQuery, useFeedSSE } from "@/lib/hooks/use-feeds";
import {
  securityCategoryAtom,
  securitySubCategoryAtom,
  securityFeedFiltersAtom,
  mapCenterAtom,
  selectedFeedAtom,
  isModalOpenAtom,
  feedsListAtom,
} from "@/lib/store";
import { SecurityMap } from "./security-map";
import { SecurityCategoryFilter } from "./security-category-filter";
import { SecuritySubCategoryFilter } from "./security-sub-category-filter";
import { FeedList } from "./feed-list";
import { FeedModal } from "./feed-modal";
import { BreakingNewsTicker } from "./breaking-news-ticker";

export function SecurityInteractive() {
  const router = useRouter();
  const category = useAtomValue(securityCategoryAtom);
  const [, setSubCategory] = useAtom(securitySubCategoryAtom);
  const [, setMapCenter] = useAtom(mapCenterAtom);
  const selectedFeed = useAtomValue(selectedFeedAtom);
  const isModalOpen = useAtomValue(isModalOpenAtom);
  const setSelectedFeed = useSetAtom(selectedFeedAtom);
  const setIsModalOpen = useSetAtom(isModalOpenAtom);
  const setFeedsList = useSetAtom(feedsListAtom);
  const filters = useAtomValue(securityFeedFiltersAtom);

  const { data: feeds = [], isFetching } = useFeedsQuery(filters);
  const searchParams = useSearchParams();

  // SSE real-time updates
  useFeedSSE();

  // Sync feeds list for modal navigation
  useEffect(() => {
    setFeedsList(feeds);
  }, [feeds, setFeedsList]);

  // 카테고리 변경 시 기본 서브카테고리/센터 설정
  useEffect(() => {
    if (category === "전쟁") {
      setSubCategory("");
      setMapCenter([30.0, 40.0]);
    } else {
      setSubCategory("");
      setMapCenter([30.0, 100.0]);
    }
  }, [category, setMapCenter, setSubCategory]);

  // URL 동기화
  useEffect(() => {
    if (isModalOpen && selectedFeed) {
      router.replace(`/security?feed=${selectedFeed.id}`, { scroll: false });
    } else {
      router.replace(`/security`, { scroll: false });
    }
  }, [isModalOpen, selectedFeed, router]);

  // 초기 URL에 feed 파라미터가 있으면 모달 오픈
  useEffect(() => {
    const id = searchParams.get("feed");
    if (!id || feeds.length === 0) return;
    const match = feeds.find((f) => f.id.toString() === id);
    if (match) {
      setSelectedFeed(match);
      setIsModalOpen(true);
    }
  }, [searchParams, feeds, setSelectedFeed, setIsModalOpen]);

  return (
    <>
      <div className="py-4">
        <BreakingNewsTicker />
        <SecurityCategoryFilter />
        <SecuritySubCategoryFilter />

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden h-[300px] lg:h-[calc(100vh-200px)]">
            <SecurityMap feeds={feeds} />
          </div>

          <div className="w-full lg:w-96 h-[400px] lg:h-[calc(100vh-200px)]">
            <FeedList feeds={feeds} isLoading={isFetching} />
          </div>
        </div>
      </div>

      <FeedModal />
    </>
  );
}

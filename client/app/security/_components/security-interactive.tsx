"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { useFeedsQuery } from "@/lib/hooks/use-feeds";
import {
  securityCategoryAtom,
  securitySubCategoryAtom,
  securityFeedFiltersAtom,
  mapCenterAtom,
  selectedFeedAtom,
  isModalOpenAtom,
} from "@/lib/store";
import { SecurityMap } from "./security-map";
import { SecurityCategoryFilter } from "./security-category-filter";
import { SecuritySubCategoryFilter } from "./security-sub-category-filter";
import { FeedList } from "./feed-list";
import { FeedModal } from "./feed-modal";

export function SecurityInteractive() {
  const router = useRouter();
  const category = useAtomValue(securityCategoryAtom);
  const [, setSubCategory] = useAtom(securitySubCategoryAtom);
  const [, setMapCenter] = useAtom(mapCenterAtom);
  const selectedFeed = useAtomValue(selectedFeedAtom);
  const isModalOpen = useAtomValue(isModalOpenAtom);
  const setSelectedFeed = useSetAtom(selectedFeedAtom);
  const setIsModalOpen = useSetAtom(isModalOpenAtom);
  const filters = useAtomValue(securityFeedFiltersAtom);

  const { data: feeds = [], isFetching } = useFeedsQuery(filters);
  const searchParams = useSearchParams();

  // 카테고리 변경 시 기본 서브카테고리/센터 설정
  useEffect(() => {
    if (category === "전쟁") {
      setSubCategory("ru-uk");
      setMapCenter([50.0, 30.0]);
    } else {
      setSubCategory("KOREA");
      setMapCenter([36.5, 127.5]);
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
      <div className="py-8">
        <SecurityCategoryFilter />

        <h2 className="text-2xl font-bold mb-6 text-white">실시간 뉴스</h2>

        <SecuritySubCategoryFilter />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-gray-900 rounded-lg overflow-hidden h-[600px]">
            <SecurityMap feeds={feeds} />
          </div>

          <div className="h-[600px]">
            <FeedList feeds={feeds} isLoading={isFetching} />
          </div>
        </div>
      </div>

      <FeedModal />
    </>
  );
}

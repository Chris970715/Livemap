"use client";

import { useAtom } from "jotai";

import { selectedFeedAtom, isModalOpenAtom } from "@/lib/store";

// 날짜 형식 변환 함수
function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

export function FeedModal() {
  const [feed, setFeed] = useAtom(selectedFeedAtom);
  const [isOpen, setIsOpen] = useAtom(isModalOpenAtom);

  if (!isOpen || !feed) return null;

  const handleClose = () => {
    setIsOpen(false);
    setFeed(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />

      {/* 모달 컨테이너 */}
      <div
        className="relative w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-3xl shadow-2xl transform transition-all duration-300 ease-out animate-slide-up modal-scroll"
        style={{
          backgroundColor: "#17171c",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 모달 내용 */}
        <div className="p-10">
          {/* 제목 */}
          <h2 className="text-2xl font-bold text-white mb-8 leading-tight">{feed.title}</h2>

          {/* 메타 정보 */}
          <div className="flex items-center gap-4 mb-10 text-gray-400 text-sm">
            <span>{formatDate(feed.publishedAt)}</span>
            <span>•</span>
            <span>{feed.sourceName}</span>
            {feed.category && (
              <>
                <span>•</span>
                <span className="px-3 py-1 bg-gray-700 rounded-full text-xs">
                  {feed.category === "WAR" ? "전쟁" : "안보"}
                </span>
              </>
            )}
          </div>

          {/* 위치 정보 */}
          {feed.location && (
            <div className="mb-10 p-6 bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="font-medium text-lg">{feed.location.name}</span>
              </div>
            </div>
          )}

          {/* 썸네일 이미지 (있는 경우) */}
          {feed.thumbnail && (
            <div className="mb-10">
              <img
                src={feed.thumbnail}
                alt={feed.title}
                className="w-full h-64 object-cover rounded-xl"
              />
            </div>
          )}

          {/* 내용 */}
          <div className="prose prose-invert max-w-none mb-10">
            <p className="text-gray-300 leading-relaxed text-lg">{feed.content}</p>
          </div>

          {/* 추가 정보 */}
          <div className="pt-10 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
              <span>카테고리: {feed.category === "WAR" ? "전쟁" : "안보"}</span>
              <span>ID: {feed.id}</span>
            </div>
            {feed.author && (
              <div className="text-sm text-gray-400">
                <span>작성자: {feed.author}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

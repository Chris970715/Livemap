"use client";

import { useAtom } from "jotai";

import { selectedFeedAtom, isModalOpenAtom } from "@/lib/store";

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}

function VerificationBadge({
  status,
  score,
}: {
  status?: string;
  score?: number;
}) {
  const config = {
    verified: { label: "검증됨", bg: "bg-green-900/50", text: "text-green-400", icon: "✓" },
    partially_verified: { label: "부분 검증", bg: "bg-yellow-900/50", text: "text-yellow-400", icon: "◐" },
    unverified: { label: "미검증", bg: "bg-gray-800", text: "text-gray-400", icon: "?" },
    pending: { label: "검증 중", bg: "bg-gray-800", text: "text-gray-500", icon: "⋯" },
  }[status || "pending"] || { label: "검증 중", bg: "bg-gray-800", text: "text-gray-500", icon: "⋯" };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {score != null && <span className="opacity-70">· 신뢰도 {score}%</span>}
    </div>
  );
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
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />

      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{ backgroundColor: "#1a1a22", scrollbarWidth: "none" }}
      >
        {/* 닫기 */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 썸네일 */}
        {feed.thumbnail && (
          <div className="relative h-48 overflow-hidden rounded-t-3xl">
            <img src={feed.thumbnail} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a22] via-transparent to-transparent" />
          </div>
        )}

        <div className="p-10">
          {/* 검증 배지 + 카테고리 */}
          <div className="flex items-center gap-3 mb-4">
            <VerificationBadge status={feed.verificationStatus} score={feed.credibilityScore} />
            <span className="px-2.5 py-0.5 bg-gray-800 rounded-full text-xs text-gray-400">
              {feed.category === "WAR" ? "전쟁" : "안보"}
            </span>
          </div>

          {/* 제목 */}
          <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
            {feed.article?.headline || feed.title}
          </h2>

          {/* 메타 */}
          <div className="flex items-center gap-3 mb-8 text-gray-500 text-sm">
            <span>{formatDate(feed.publishedAt)}</span>
            <span>·</span>
            <span>{feed.sourceName}</span>
            {feed.location?.name && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {feed.location.name}
                </span>
              </>
            )}
          </div>

          {/* 구조화된 기사 콘텐츠 */}
          {feed.article ? (
            <div className="space-y-6 mb-8">
              <p className="text-white text-lg leading-relaxed font-medium">
                {feed.article.lead}
              </p>

              {feed.article.nutGraph && (
                <div className="border-l-2 border-blue-500/50 pl-4 py-1">
                  <p className="text-gray-300 leading-relaxed">{feed.article.nutGraph}</p>
                </div>
              )}

              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {feed.article.body}
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <p className="text-gray-300 leading-relaxed text-lg">{feed.content}</p>
            </div>
          )}

          {/* 원본 기사 링크 */}
          {feed.originalLink && (
            <div className="mb-8">
              <a
                href={feed.originalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                원본 기사 보기
              </a>
            </div>
          )}

          {/* 관련 출처 */}
          {feed.relatedSources && feed.relatedSources.length > 0 && (
            <div className="pt-6 border-t border-gray-800">
              <h3 className="text-white font-semibold text-sm mb-4">관련 출처</h3>
              <div className="space-y-2">
                {feed.relatedSources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white font-medium truncate">{source.title}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{source.sourceName}</span>
                    </div>
                    {source.snippet && (
                      <p className="text-xs text-gray-400 line-clamp-2">{source.snippet}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 하단 정보 */}
          <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>AI 자동 생성 기사 · Livemap</span>
            <span>ID: {feed.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useCallback } from "react";
import { useAtom, useAtomValue } from "jotai";

import { selectedFeedAtom, isModalOpenAtom, languageAtom, feedsListAtom } from "@/lib/store";
import type { ArticleStructure } from "@/lib/types/feed";

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, "0")}월 ${String(d.getDate()).padStart(2, "0")}일 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function VerificationBadge({ status, score }: { status?: string; score?: number }) {
  const config = {
    verified: { label: "검증됨", bg: "bg-green-900/50", text: "text-green-400", icon: "✓" },
    partially_verified: {
      label: "부분 검증",
      bg: "bg-yellow-900/50",
      text: "text-yellow-400",
      icon: "◐",
    },
    unverified: { label: "미검증", bg: "bg-gray-800", text: "text-gray-400", icon: "?" },
    pending: { label: "검증 중", bg: "bg-gray-800", text: "text-gray-500", icon: "⋯" },
  }[status || "pending"] || {
    label: "검증 중",
    bg: "bg-gray-800",
    text: "text-gray-500",
    icon: "⋯",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${config.bg} ${config.text}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {score != null && <span className="opacity-70">· {score}%</span>}
    </div>
  );
}

export function FeedModal() {
  const [feed, setFeed] = useAtom(selectedFeedAtom);
  const [isOpen, setIsOpen] = useAtom(isModalOpenAtom);
  const [lang, setLang] = useAtom(languageAtom);
  const feedsList = useAtomValue(feedsListAtom);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFeed(null);
  }, [setIsOpen, setFeed]);

  const navigateTo = useCallback(
    (direction: "prev" | "next") => {
      if (!feed || feedsList.length === 0) return;
      const idx = feedsList.findIndex((f) => f.id === feed.id);
      if (idx === -1) return;
      const newIdx = direction === "next" ? idx + 1 : idx - 1;
      if (newIdx >= 0 && newIdx < feedsList.length) {
        setFeed(feedsList[newIdx]);
      }
    },
    [feed, feedsList, setFeed]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") navigateTo("prev");
      if (e.key === "ArrowRight") navigateTo("next");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleClose, navigateTo]);

  if (!isOpen || !feed) return null;

  // Select article based on language
  const displayArticle: ArticleStructure | undefined =
    lang === "en" && feed.articleEn ? feed.articleEn : feed.article;
  const headline = displayArticle?.headline || feed.title;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 lg:p-6">
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />

      <div
        className="relative w-full h-full lg:h-auto lg:max-w-3xl lg:max-h-[85vh] overflow-y-auto lg:rounded-3xl shadow-2xl"
        style={{ backgroundColor: "#1a1a22", scrollbarWidth: "none" }}
      >
        {/* Top bar: close + language + nav */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-[#1a1a22]/95 backdrop-blur-sm border-b border-gray-800/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo("prev")}
              className="p-1.5 text-gray-500 hover:text-white transition-colors"
              title="Previous (←)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => navigateTo("next")}
              className="p-1.5 text-gray-500 hover:text-white transition-colors"
              title="Next (→)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "ko" ? "en" : "ko")}
              className="px-2 py-0.5 text-xs font-mono rounded border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors"
            >
              {lang === "ko" ? "EN" : "KO"}
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="p-1.5 text-gray-500 hover:text-white transition-colors"
              title="Share link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Thumbnail */}
        {feed.thumbnail && (
          <div className="relative h-48 overflow-hidden">
            <img src={feed.thumbnail} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a22] via-transparent to-transparent" />
          </div>
        )}

        <div className="p-6 lg:p-10">
          {/* Badges */}
          <div className="flex items-center gap-3 mb-4">
            <VerificationBadge status={feed.verificationStatus} score={feed.credibilityScore} />
            <span className="px-2.5 py-0.5 bg-gray-800 rounded-full text-xs text-gray-400">
              {feed.category === "WAR" ? "전쟁" : "안보"}
            </span>
            {feed.isBreaking && (
              <span className="px-2.5 py-0.5 bg-red-900/50 rounded-full text-xs text-red-400 animate-pulse">
                BREAKING
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{headline}</h2>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6 text-gray-500 text-sm">
            <span>{formatDate(feed.publishedAt)}</span>
            <span>·</span>
            <span>{feed.sourceName}</span>
            {feed.location?.name && (
              <>
                <span>·</span>
                <span>{feed.location.name}</span>
              </>
            )}
          </div>

          {/* Claims breakdown */}
          {(feed.claimsVerified != null || feed.claimsTotal != null) && (
            <div className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg mb-6 text-xs">
              <div className="text-gray-400">
                <span className="text-green-400 font-semibold">{feed.claimsVerified ?? 0}</span>
                <span> / {feed.claimsTotal ?? 0} claims verified</span>
              </div>
              {feed.sourceCount != null && feed.sourceCount > 0 && (
                <div className="text-gray-500">{feed.sourceCount} sources</div>
              )}
            </div>
          )}

          {/* Article content */}
          {displayArticle ? (
            <div className="space-y-6 mb-8">
              <p className="text-white text-lg leading-relaxed font-medium">
                {displayArticle.lead}
              </p>
              {displayArticle.nutGraph && (
                <div className="border-l-2 border-blue-500/50 pl-4 py-1">
                  <p className="text-gray-300 leading-relaxed">{displayArticle.nutGraph}</p>
                </div>
              )}
              <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                {displayArticle.body}
              </div>
            </div>
          ) : feed.content ? (
            <div className="mb-8">
              <p className="text-gray-300 leading-relaxed text-lg">{feed.content}</p>
            </div>
          ) : null}

          {/* Original link */}
          {feed.originalLink && (
            <div className="mb-8">
              <a
                href={feed.originalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                {lang === "en" ? "View original article" : "원본 기사 보기"}
              </a>
            </div>
          )}

          {/* Related sources */}
          {feed.relatedSources && feed.relatedSources.length > 0 && (
            <div className="pt-6 border-t border-gray-800">
              <h3 className="text-white font-semibold text-sm mb-4">
                {lang === "en" ? "Related Sources" : "관련 출처"}
              </h3>
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
                      <span className="text-sm text-white font-medium truncate">
                        {source.title}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {source.sourceName}
                      </span>
                    </div>
                    {source.snippet && (
                      <p className="text-xs text-gray-400 line-clamp-2">{source.snippet}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>AI Generated · Huginn</span>
            <span>ID: {feed.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

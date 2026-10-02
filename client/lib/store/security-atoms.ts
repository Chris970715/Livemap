"use client";

import { atom } from "jotai";

import type { FeedItem } from "@/lib/types/feed";

// Security 카테고리 상태
export const securityCategoryAtom = atom<"WAR" | "SECURITY">("WAR");

// 서브카테고리 상태
export const securitySubCategoryAtom = atom<string>("");

// 지도 중심 좌표
export const mapCenterAtom = atom<[number, number]>([50.0, 30.0]);

// 선택된 피드
export const selectedFeedAtom = atom<FeedItem | null>(null);

// 모달 열림 상태
export const isModalOpenAtom = atom<boolean>(false);

// 언어 설정
export const languageAtom = atom<"ko" | "en">("en");

// 검색 쿼리
export const searchQueryAtom = atom<string>("");

// 전체 피드 목록 (모달 prev/next 네비게이션용)
export const feedsListAtom = atom<FeedItem[]>([]);

// 파생 atom: API 필터
export const securityFeedFiltersAtom = atom((get) => ({
  category: get(securityCategoryAtom),
  subCategory: get(securitySubCategoryAtom),
  q: get(searchQueryAtom) || undefined,
}));

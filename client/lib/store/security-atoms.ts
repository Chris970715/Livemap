"use client";

import { atom } from "jotai";

import type { FeedItem } from "@/lib/types/feed";

// Security 카테고리 상태
export const securityCategoryAtom = atom<"전쟁" | "안보">("전쟁");

// 서브카테고리 상태
export const securitySubCategoryAtom = atom<string>("ru-uk");

// 지도 중심 좌표
export const mapCenterAtom = atom<[number, number]>([50.0, 30.0]);

// 선택된 피드
export const selectedFeedAtom = atom<FeedItem | null>(null);

// 모달 열림 상태
export const isModalOpenAtom = atom<boolean>(false);

// 파생 atom: API 필터
export const securityFeedFiltersAtom = atom((get) => ({
  category: get(securityCategoryAtom) === "전쟁" ? ("WAR" as const) : ("SECURITY" as const),
  subCategory: get(securitySubCategoryAtom),
}));

/**
 * Feed 관련 타입 정의
 */

export interface FeedItem {
  id: number;
  title: string;
  content: string;
  originalLink: string;
  sourceName: string;
  sourceType: string;
  publishedAt: Date;
  author?: string;
  thumbnail?: string;
  category: "WAR" | "SECURITY";
  subCategory: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

export interface FeedFilters {
  category: "WAR" | "SECURITY";
  subCategory?: string;
}

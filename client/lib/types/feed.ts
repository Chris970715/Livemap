/**
 * Feed 관련 타입 정의
 */

export interface ArticleStructure {
  headline: string;
  lead: string;
  nutGraph?: string;
  body: string;
}

export interface RelatedSource {
  url: string;
  title: string;
  sourceName: string;
  snippet: string;
  credibilityTier: string;
}

export interface FeedItem {
  id: number;
  title: string;
  content?: string;
  originalLink?: string;
  sourceName: string;
  sourceType: string;
  publishedAt: Date | string;
  author?: string;
  thumbnail?: string;
  category: "WAR" | "SECURITY";
  subCategory: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  // Verification
  credibilityScore?: number;
  verificationStatus?: "verified" | "partially_verified" | "unverified" | "pending";
  // Structured article (Korean primary)
  article?: ArticleStructure;
  // English article (for language toggle)
  articleEn?: ArticleStructure;
  // Related sources
  relatedSources?: RelatedSource[];
  // Claims metadata
  claimsVerified?: number;
  claimsTotal?: number;
  sourceCount?: number;
  // Breaking news flag
  isBreaking?: boolean;
}

export interface FeedFilters {
  category: "WAR" | "SECURITY";
  subCategory?: string;
  q?: string;
}

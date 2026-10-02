/**
 * Security 카테고리 상수
 */

export const SECURITY_CATEGORIES = {
  WAR: {
    label: "War",
    subCategories: {
      "ru-uk": { label: "Russia-Ukraine", center: [50.0, 30.0] as const },
      "is-ir": { label: "Israel-Iran", center: [31.5, 34.5] as const },
    },
  },
  SECURITY: {
    label: "Security",
    subCategories: {
      KOREA: { label: "Korea", center: [36.5, 127.5] as const },
      US: { label: "US", center: [38.0, -97.0] as const },
      CHINA: { label: "China", center: [35.0, 105.0] as const },
      JAPAN: { label: "Japan", center: [36.0, 138.0] as const },
    },
  },
} as const;

export type SecurityCategoryKey = keyof typeof SECURITY_CATEGORIES;
export type WarSubCategory = keyof typeof SECURITY_CATEGORIES.WAR.subCategories;
export type SecuritySubCategory = keyof typeof SECURITY_CATEGORIES.SECURITY.subCategories;

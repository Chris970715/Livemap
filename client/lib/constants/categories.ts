/**
 * Security 카테고리 상수
 */

export const SECURITY_CATEGORIES = {
  WAR: {
    label: "전쟁",
    subCategories: {
      "ru-uk": { label: "러시아-우크라이나", center: [50.0, 30.0] as const },
      "is-ir": { label: "이스라엘-팔레스타인", center: [31.5, 34.5] as const },
    },
  },
  SECURITY: {
    label: "안보",
    subCategories: {
      KOREA: { label: "한국", center: [36.5, 127.5] as const },
      US: { label: "미국", center: [38.0, -97.0] as const },
      CHINA: { label: "중국", center: [35.0, 105.0] as const },
      JAPAN: { label: "일본", center: [36.0, 138.0] as const },
    },
  },
} as const;

export type SecurityCategoryKey = keyof typeof SECURITY_CATEGORIES;
export type WarSubCategory = keyof typeof SECURITY_CATEGORIES.WAR.subCategories;
export type SecuritySubCategory = keyof typeof SECURITY_CATEGORIES.SECURITY.subCategories;

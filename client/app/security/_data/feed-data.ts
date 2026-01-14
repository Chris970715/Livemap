import type { FeedItem } from "@/lib/types/feed";

export const securityFeedData: FeedItem[] = [
  {
    id: 1,
    title: "북한 미사일 발사 감지, 동해상으로 추정",
    content:
      "오늘 새벽 북한에서 단거리 탄도미사일이 발사되었으며, 동해상으로 추정됩니다. 한국과 일본 정부가 즉시 대응 태세를 취했습니다.",
    originalLink: "https://example.com/news1",
    sourceName: "국방부",
    sourceType: "RSS",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    author: "국방부 대변인",
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    category: "SECURITY",
    subCategory: "KOREA",
    location: {
      lat: 38.5,
      lng: 127.5,
      name: "북한 평양",
    },
  },
  {
    id: 2,
    title: "중국 해군 함정, 남중국해에서 군사훈련 실시",
    content:
      "중국 해군이 남중국해에서 대규모 군사훈련을 실시하고 있습니다. 주변국들의 우려가 제기되고 있습니다.",
    originalLink: "https://example.com/news2",
    sourceName: "해양안보정보원",
    sourceType: "RSS",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    author: "해양안보정보원",
    thumbnail: "https://images.unsplash.com/photo-1569263979104-865ab6c4b7c8?w=400&h=300&fit=crop",
    category: "SECURITY",
    subCategory: "CHINA",
    location: {
      lat: 15.0,
      lng: 115.0,
      name: "남중국해",
    },
  },
  {
    id: 3,
    title: "러시아-우크라이나 전쟁 상황 업데이트",
    content:
      "우크라이나 동부 지역에서 격렬한 전투가 계속되고 있습니다. NATO 회원국들이 추가 군사지원을 검토하고 있습니다.",
    originalLink: "https://example.com/news3",
    sourceName: "NATO",
    sourceType: "RSS",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    author: "NATO 대변인",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    category: "WAR",
    subCategory: "ru-uk",
    location: {
      lat: 48.0,
      lng: 37.0,
      name: "우크라이나 동부",
    },
  },
  {
    id: 4,
    title: "미국 항공모함, 태평양에서 연합훈련 참가",
    content:
      "미국 항공모함 로널드 레이건이 일본 해상자위대와 연합훈련을 실시하고 있습니다. 지역 안보 강화를 위한 노력입니다.",
    originalLink: "https://example.com/news4",
    sourceName: "미국 해군",
    sourceType: "RSS",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    author: "미국 해군 대변인",
    thumbnail: "https://images.unsplash.com/photo-1569263979104-865ab6c4b7c8?w=400&h=300&fit=crop",
    category: "SECURITY",
    subCategory: "US",
    location: {
      lat: 35.0,
      lng: 140.0,
      name: "일본 근해",
    },
  },
  {
    id: 5,
    title: "이스라엘-팔레스타인 분쟁 상황",
    content:
      "가자지구에서 새로운 폭력 사태가 발생했습니다. 국제사회의 즉각적인 개입을 요구하는 목소리가 높아지고 있습니다.",
    originalLink: "https://example.com/news5",
    sourceName: "UN 안보리",
    sourceType: "RSS",
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    author: "UN 안보리",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    category: "WAR",
    subCategory: "is-ir",
    location: {
      lat: 31.5,
      lng: 34.5,
      name: "가자지구",
    },
  },
];

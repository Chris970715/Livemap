import type { FeedItem } from "@/lib/types/feed";

// Sample feed used when NEXT_PUBLIC_API_BASE_URL is not set
export const securityFeedData: FeedItem[] = [
  {
    id: 1,
    title: "North Korean missile launch detected, believed to have landed in the East Sea",
    content:
      "North Korea fired a short-range ballistic missile early this morning, believed to have landed in the East Sea. The governments of South Korea and Japan immediately raised their readiness posture.",
    originalLink: "https://example.com/news1",
    sourceName: "Ministry of National Defense",
    sourceType: "RSS",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    author: "MND Spokesperson",
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    category: "SECURITY",
    subCategory: "KOREA",
    location: {
      lat: 38.5,
      lng: 127.5,
      name: "Pyongyang, North Korea",
    },
  },
  {
    id: 2,
    title: "Chinese navy vessels conduct military drills in the South China Sea",
    content:
      "The Chinese navy is holding large-scale military exercises in the South China Sea, drawing concern from neighboring countries.",
    originalLink: "https://example.com/news2",
    sourceName: "Maritime Security Institute",
    sourceType: "RSS",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    author: "Maritime Security Institute",
    thumbnail: "https://images.unsplash.com/photo-1569263979104-865ab6c4b7c8?w=400&h=300&fit=crop",
    category: "SECURITY",
    subCategory: "CHINA",
    location: {
      lat: 15.0,
      lng: 115.0,
      name: "South China Sea",
    },
  },
  {
    id: 3,
    title: "Russia-Ukraine war: situation update",
    content:
      "Heavy fighting continues in eastern Ukraine. NATO members are weighing additional military aid.",
    originalLink: "https://example.com/news3",
    sourceName: "NATO",
    sourceType: "RSS",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    author: "NATO Spokesperson",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    category: "WAR",
    subCategory: "ru-uk",
    location: {
      lat: 48.0,
      lng: 37.0,
      name: "Eastern Ukraine",
    },
  },
  {
    id: 4,
    title: "US aircraft carrier joins combined exercise in the Pacific",
    content:
      "The USS Ronald Reagan is conducting a combined exercise with the Japan Maritime Self-Defense Force to strengthen regional security.",
    originalLink: "https://example.com/news4",
    sourceName: "US Navy",
    sourceType: "RSS",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    author: "US Navy Spokesperson",
    thumbnail: "https://images.unsplash.com/photo-1569263979104-865ab6c4b7c8?w=400&h=300&fit=crop",
    category: "SECURITY",
    subCategory: "US",
    location: {
      lat: 35.0,
      lng: 140.0,
      name: "Waters off Japan",
    },
  },
  {
    id: 5,
    title: "Israel-Palestine conflict: new violence in Gaza",
    content:
      "A new outbreak of violence has occurred in the Gaza Strip, with growing calls for immediate international intervention.",
    originalLink: "https://example.com/news5",
    sourceName: "UN Security Council",
    sourceType: "RSS",
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    author: "UN Security Council",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    category: "WAR",
    subCategory: "is-ir",
    location: {
      lat: 31.5,
      lng: 34.5,
      name: "Gaza Strip",
    },
  },
];

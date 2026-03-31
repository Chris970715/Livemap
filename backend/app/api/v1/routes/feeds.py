"""
Feed endpoints — serves articles from the agent pipeline as FeedItem format.

GET /api/v1/feeds - List articles with filters (mapped to FeedItem schema)
GET /api/v1/feeds/{id} - Get single article by ID
"""

import asyncio
import json as json_module
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.agent.geo_mapper import CLIENT_TO_CATEGORIES, get_client_category
from app.core.database import get_db
from app.models.article import Article
from app.models.event import Event
from app.schemas.feed import FeedItem

router = APIRouter()

# SSE pub/sub for real-time article updates
_sse_subscribers: list[asyncio.Queue] = []


def notify_new_article(data: dict):
    """Notify all SSE subscribers of a new article. Called from lifespan.py."""
    for q in _sse_subscribers:
        try:
            q.put_nowait(data)
        except asyncio.QueueFull:
            pass


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _get_mock_feeds() -> list[dict]:
    """Generate mock feeds with current timestamps."""
    now = _now()
    return [
        {
            "id": 1,
            "title": "우크라이나 동부 도네츠크 전선에서 러시아군 전술적 전진",
            "content": "러시아군이 도네츠크 지역에서 전술적 전진을 이루었다고 복수의 소식통이 전했다. 우크라이나군은 방어 진지를 강화하고 있으며, 포카로프스크 방향으로의 공세가 계속되고 있다. ACLED 데이터에 따르면 지난 24시간 동안 해당 지역에서 47건의 교전이 보고되었다.",
            "originalLink": "https://www.reuters.com/world/europe/",
            "sourceName": "Reuters",
            "sourceType": "RSS",
            "publishedAt": now - timedelta(hours=1, minutes=23),
            "author": "Reuters Staff",
            "thumbnail": "https://images.unsplash.com/photo-1569025743873-ea3a9ber4f79?w=400&h=300&fit=crop",
            "category": "WAR",
            "subCategory": "ru-uk",
            "location": {"lat": 48.0159, "lng": 37.8028, "name": "Donetsk, Ukraine"},
            "credibilityScore": 95,
            "verificationStatus": "verified",
        },
        {
            "id": 2,
            "title": "하르키우시에 미사일 공격, 민간인 피해 발생",
            "content": "하르키우시에 다수의 미사일 공격이 보고되었다. 긴급 구조대가 현장에 출동했으며, 주거 지역에 피해가 발생한 것으로 확인됐다. 우크라이나 공군은 S-300 미사일 2발이 발사되었다고 밝혔다.",
            "originalLink": "https://t.me/truexanewsua",
            "sourceName": "Telegram",
            "sourceType": "TELEGRAM",
            "publishedAt": now - timedelta(hours=2, minutes=45),
            "author": None,
            "thumbnail": None,
            "category": "WAR",
            "subCategory": "ru-uk",
            "location": {"lat": 49.9935, "lng": 36.2304, "name": "Kharkiv, Ukraine"},
            "credibilityScore": 75,
            "verificationStatus": "partially_verified",
        },
        {
            "id": 3,
            "title": "이스라엘군, 레바논 남부 헤즈볼라 거점 공습",
            "content": "이스라엘 방위군(IDF)이 레바논 남부의 헤즈볼라 거점을 대상으로 공습을 실시했다. IDF 대변인은 무기 저장소와 발사대를 목표로 한 정밀 타격이었다고 발표했다. 레바논 당국은 민간인 피해 여부를 조사 중이다.",
            "originalLink": "https://www.aljazeera.com/news/",
            "sourceName": "Al Jazeera",
            "sourceType": "RSS",
            "publishedAt": now - timedelta(hours=3, minutes=10),
            "author": "Al Jazeera Staff",
            "thumbnail": None,
            "category": "WAR",
            "subCategory": "is-ir",
            "location": {"lat": 33.2721, "lng": 35.2033, "name": "Southern Lebanon"},
            "credibilityScore": 90,
            "verificationStatus": "verified",
        },
        {
            "id": 4,
            "title": "북한, DMZ 인근에서 대규모 포병 훈련 실시",
            "content": "북한군이 비무장지대(DMZ) 인근에서 대규모 포병 훈련을 실시했다. 한국 합참은 북한의 군사 활동을 면밀히 감시하고 있다고 밝혔다. 훈련은 약 3시간 동안 진행된 것으로 파악된다.",
            "originalLink": "https://en.yna.co.kr/",
            "sourceName": "Yonhap",
            "sourceType": "RSS",
            "publishedAt": now - timedelta(hours=5, minutes=30),
            "author": None,
            "thumbnail": None,
            "category": "SECURITY",
            "subCategory": "KOREA",
            "location": {"lat": 38.3, "lng": 127.0, "name": "DMZ, Korean Peninsula"},
            "credibilityScore": 85,
            "verificationStatus": "verified",
        },
        {
            "id": 5,
            "title": "미 해군 구축함, 남중국해 항행의 자유 작전 실시",
            "content": "미 해군 알레이 버크급 구축함이 남중국해에서 항행의 자유 작전(FONOP)을 실시했다. 중국 외교부는 이를 '도발 행위'로 규정하며 강력히 항의했다. 미 태평양함대 사령부는 국제법에 따른 정상적인 작전이라고 밝혔다.",
            "originalLink": "https://www.navy.mil/",
            "sourceName": "US Navy",
            "sourceType": "RSS",
            "publishedAt": now - timedelta(hours=7),
            "author": None,
            "thumbnail": None,
            "category": "SECURITY",
            "subCategory": "CHINA",
            "location": {"lat": 15.0, "lng": 114.0, "name": "South China Sea"},
            "credibilityScore": 95,
            "verificationStatus": "verified",
        },
    ]


# Unsplash source images by sub-category (free, no auth needed)
_THUMBNAIL_MAP = {
    "ru-uk": "https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=400&h=250&fit=crop",
    "is-ir": "https://images.unsplash.com/photo-1590073844006-33379778ae09?w=400&h=250&fit=crop",
    "KOREA": "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=250&fit=crop",
    "CHINA": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=250&fit=crop",
    "US": "https://images.unsplash.com/photo-1461696114087-397271a7aedc?w=400&h=250&fit=crop",
    "JAPAN": "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400&h=250&fit=crop",
}
_DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=400&h=250&fit=crop"


def _article_to_feed_response(article: Article, event: Event) -> dict:
    """Convert Article+Event to FeedItem response dict."""
    import json

    # Extract first source URL from sources_json
    original_link = None
    if article.sources_json:
        sources = json.loads(article.sources_json)
        original_link = sources[0] if sources else None

    # Thumbnail based on sub-category
    thumbnail = _THUMBNAIL_MAP.get(event.sub_category, _DEFAULT_THUMBNAIL)

    # Map backend category to client category
    client_category = get_client_category(event.category)

    # Credibility score from verification (0.0-1.0 → 0-100)
    credibility = int(article.verification_score * 100) if article.verification_score else None

    # Verification status
    if article.claims_verified and article.claims_total:
        ratio = article.claims_verified / article.claims_total
        if ratio >= 0.8:
            status = "verified"
        elif ratio >= 0.5:
            status = "partially_verified"
        else:
            status = "unverified"
    else:
        status = "pending"

    # Structured article content (Korean primary)
    article_structure = None
    headline = article.headline_ko or article.headline_en
    if headline:
        article_structure = {
            "headline": headline,
            "lead": article.lead_ko or article.lead_en or "",
            "nutGraph": article.nut_graph_ko or article.nut_graph_en,
            "body": article.body_ko or article.body_en or "",
        }

    # English article structure (for language toggle)
    article_en_structure = None
    if article.headline_en:
        article_en_structure = {
            "headline": article.headline_en,
            "lead": article.lead_en or "",
            "nutGraph": article.nut_graph_en,
            "body": article.body_en or "",
        }

    # Related sources
    related_sources = []
    if article.related_sources_json:
        try:
            raw = json.loads(article.related_sources_json)
            related_sources = [
                {
                    "url": s.get("url", ""),
                    "title": s.get("title", ""),
                    "sourceName": s.get("source_name", s.get("sourceName", "")),
                    "snippet": s.get("snippet", ""),
                    "credibilityTier": s.get("credibility_tier", s.get("credibilityTier", "tier3")),
                }
                for s in raw
            ]
        except (json.JSONDecodeError, TypeError):
            pass

    # Derive source name from related sources
    source_name = "Livemap AI"
    if related_sources:
        first_source = related_sources[0].get("sourceName", "")
        if first_source:
            source_name = f"AI ({first_source})"

    # Breaking news flag (< 1 hour old)
    is_breaking = False
    if article.published_at:
        pub = article.published_at
        if pub.tzinfo is None:
            pub = pub.replace(tzinfo=timezone.utc)
        age = _now() - pub
        is_breaking = age < timedelta(hours=1)

    return {
        "id": article.id,
        "title": headline or "Untitled",
        "content": None,
        "originalLink": original_link,
        "sourceName": source_name,
        "sourceType": "AI",
        "publishedAt": article.published_at,
        "author": None,
        "thumbnail": thumbnail,
        "category": client_category,
        "subCategory": event.sub_category or "other",
        "location": {
            "lat": event.location_lat,
            "lng": event.location_lng,
            "name": event.location_name,
        },
        "credibilityScore": credibility,
        "verificationStatus": status,
        "article": article_structure,
        "articleEn": article_en_structure,
        "relatedSources": related_sources,
        "claimsVerified": article.claims_verified,
        "claimsTotal": article.claims_total,
        "sourceCount": article.source_count,
        "isBreaking": is_breaking,
    }


@router.get("", response_model=list[FeedItem])
async def get_feeds(
    category: str = Query(..., description="Category filter: WAR or SECURITY"),
    subCategory: Optional[str] = Query(
        None, description="Sub-category filter: ru-uk, is-ir, KOREA, etc."
    ),
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get list of verified news articles as feed items.

    Queries the events+articles tables (from the agent pipeline).
    Falls back to mock data when DB is empty.
    """
    try:
        # Map client category to backend categories
        backend_cats = CLIENT_TO_CATEGORIES.get(category, [category.lower()])

        # Query articles joined with events
        query = (
            select(Article, Event)
            .join(Event, Article.event_id == Event.id)
            .where(Event.category.in_(backend_cats))
            .where(Article.status == "published")
            .where(Event.location_lat.isnot(None))  # Only items with location
            .order_by(Article.published_at.desc())
        )

        if subCategory:
            query = query.where(Event.sub_category == subCategory)

        query = query.offset(offset).limit(limit)

        result = await db.execute(query)
        rows = result.all()

        if rows:
            return [_article_to_feed_response(article, event) for article, event in rows]

        # Fallback: try without location filter
        query_no_loc = (
            select(Article, Event)
            .join(Event, Article.event_id == Event.id)
            .where(Event.category.in_(backend_cats))
            .where(Article.status == "published")
            .order_by(Article.published_at.desc())
            .offset(offset)
            .limit(limit)
        )
        if subCategory:
            query_no_loc = query_no_loc.where(Event.sub_category == subCategory)

        result = await db.execute(query_no_loc)
        rows = result.all()

        if rows:
            return [_article_to_feed_response(article, event) for article, event in rows]

        # If DB is empty, return mock data
        filtered = [f for f in _get_mock_feeds() if f["category"] == category]
        if subCategory:
            filtered = [f for f in filtered if f["subCategory"] == subCategory]
        return filtered[offset : offset + limit]

    except Exception:
        # Fallback to mock data if DB error
        filtered = [f for f in _get_mock_feeds() if f["category"] == category]
        if subCategory:
            filtered = [f for f in filtered if f["subCategory"] == subCategory]
        return filtered[offset : offset + limit]


@router.get("/stream")
async def stream_feeds():
    """SSE endpoint for real-time article updates."""
    queue: asyncio.Queue = asyncio.Queue(maxsize=100)
    _sse_subscribers.append(queue)

    async def event_generator():
        try:
            while True:
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"data: {json_module.dumps(data, default=str)}\n\n"
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            if queue in _sse_subscribers:
                _sse_subscribers.remove(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/{feed_id}", response_model=FeedItem)
async def get_feed(
    feed_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a single article by ID."""
    try:
        result = await db.execute(
            select(Article, Event)
            .join(Event, Article.event_id == Event.id)
            .where(Article.id == feed_id)
        )
        row = result.first()

        if row:
            article, event = row
            return _article_to_feed_response(article, event)

        # Fallback to mock
        for mock in _get_mock_feeds():
            if mock["id"] == feed_id:
                return mock

        raise HTTPException(status_code=404, detail=f"Feed with id {feed_id} not found")

    except HTTPException:
        raise
    except Exception:
        for mock in _get_mock_feeds():
            if mock["id"] == feed_id:
                return mock
        raise HTTPException(status_code=404, detail=f"Feed with id {feed_id} not found")

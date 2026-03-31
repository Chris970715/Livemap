"""
Feed schemas matching frontend FeedItem interface.

Uses camelCase field names to match the frontend TypeScript types directly.
"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class LocationSchema(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    name: Optional[str] = None


class ArticleStructureSchema(BaseModel):
    headline: str
    lead: str
    nutGraph: Optional[str] = None
    body: str


class RelatedSourceSchema(BaseModel):
    url: str
    title: str
    sourceName: str
    snippet: str = ""
    credibilityTier: str = "tier3"


class FeedItem(BaseModel):
    id: int
    title: str = Field(..., max_length=500)
    content: Optional[str] = None
    originalLink: Optional[str] = None
    sourceName: str
    sourceType: str
    publishedAt: datetime
    author: Optional[str] = None
    thumbnail: Optional[str] = None
    category: Literal["WAR", "SECURITY"]
    subCategory: str
    location: LocationSchema
    credibilityScore: Optional[int] = Field(None, ge=0, le=100)
    verificationStatus: Optional[str] = None
    article: Optional[ArticleStructureSchema] = None
    articleEn: Optional[ArticleStructureSchema] = None
    relatedSources: list[RelatedSourceSchema] = Field(default_factory=list)
    claimsVerified: Optional[int] = None
    claimsTotal: Optional[int] = None
    sourceCount: Optional[int] = None
    isBreaking: bool = False

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class FeedResponse(BaseModel):
    items: list[FeedItem]
    total: int
    page: int = 1
    page_size: int = 20

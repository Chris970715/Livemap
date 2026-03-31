"""
Feed schemas matching frontend FeedItem interface.

Uses camelCase field names to match the frontend TypeScript types directly.
"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class LocationSchema(BaseModel):
    """Geographic location of the event."""

    lat: Optional[float] = Field(None, description="Latitude")
    lng: Optional[float] = Field(None, description="Longitude")
    name: Optional[str] = Field(None, description="Location name")


class FeedItem(BaseModel):
    """
    Feed item schema matching frontend FeedItem interface.

    All field names use camelCase to match the frontend TypeScript types.
    """

    id: int
    title: str = Field(..., max_length=500)
    content: str
    originalLink: Optional[str] = None
    sourceName: str
    sourceType: str  # RSS, TELEGRAM, API, AI
    publishedAt: datetime
    author: Optional[str] = None
    thumbnail: Optional[str] = None
    category: Literal["WAR", "SECURITY"]
    subCategory: str
    location: LocationSchema

    # Verification fields
    credibilityScore: Optional[int] = Field(None, ge=0, le=100)
    verificationStatus: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class FeedResponse(BaseModel):
    """Response wrapper for feed list."""

    items: list[FeedItem]
    total: int
    page: int = 1
    page_size: int = 20

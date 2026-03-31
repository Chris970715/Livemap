"""
Geographic mapping utilities for GDELT country codes → coordinates and category mapping.

GDELT uses FIPS 10-4 country codes. This module maps them to:
1. Lat/lng coordinates (capital or centroid) for map display
2. Client-facing categories (WAR/SECURITY) and subCategories (ru-uk, KOREA, etc.)
"""

from __future__ import annotations

import asyncio
import logging
import time

import httpx

logger = logging.getLogger(__name__)

# GDELT FIPS 10-4 country code → (lat, lng, name)
# Using capital/major city coordinates for map markers
COUNTRY_COORDS: dict[str, tuple[float, float, str]] = {
    # Eastern Europe / Russia-Ukraine
    "UP": (48.38, 31.17, "Ukraine"),
    "RS": (55.75, 37.62, "Russia"),
    "BO": (53.90, 27.57, "Belarus"),
    "MD": (47.01, 28.86, "Moldova"),
    "PL": (52.23, 21.01, "Poland"),
    # Middle East / Israel-Iran
    "IS": (31.77, 35.22, "Israel"),
    "LE": (33.87, 35.51, "Lebanon"),
    "IR": (35.69, 51.39, "Iran"),
    "SY": (33.51, 36.29, "Syria"),
    "IZ": (33.31, 44.37, "Iraq"),
    "YM": (15.35, 44.21, "Yemen"),
    "GZ": (31.50, 34.47, "Gaza"),
    "WE": (31.90, 35.20, "West Bank"),
    "JO": (31.95, 35.93, "Jordan"),
    "SA": (24.77, 46.74, "Saudi Arabia"),
    # East Asia / Korea
    "KS": (37.57, 126.98, "South Korea"),
    "KN": (39.02, 125.75, "North Korea"),
    "JA": (35.68, 139.69, "Japan"),
    "CH": (39.90, 116.41, "China"),
    "TW": (25.03, 121.57, "Taiwan"),
    # South/Southeast Asia
    "IN": (28.61, 77.21, "India"),
    "PK": (33.69, 73.04, "Pakistan"),
    "AF": (34.53, 69.17, "Afghanistan"),
    "BM": (16.87, 96.20, "Myanmar"),
    # Americas
    "US": (38.90, -77.04, "United States"),
    "MX": (19.43, -99.13, "Mexico"),
    "CA": (45.42, -75.70, "Canada"),
    "VE": (10.49, -66.88, "Venezuela"),
    "CO": (4.71, -74.07, "Colombia"),
    "BR": (-15.79, -47.88, "Brazil"),
    # Europe
    "UK": (51.51, -0.13, "United Kingdom"),
    "FR": (48.86, 2.35, "France"),
    "GM": (52.52, 13.41, "Germany"),
    "IT": (41.90, 12.50, "Italy"),
    "TU": (39.93, 32.86, "Turkey"),
    # Africa
    "SU": (15.59, 32.53, "Sudan"),
    "ET": (9.02, 38.75, "Ethiopia"),
    "NI": (9.06, 7.49, "Nigeria"),
    "SF": (-25.75, 28.19, "South Africa"),
    "CG": (-4.32, 15.31, "Congo"),
    "SO": (2.05, 45.32, "Somalia"),
    "LY": (32.90, 13.18, "Libya"),
    "EG": (30.04, 31.24, "Egypt"),
}

# Backend category → Client category mapping
# Backend uses: war, protest, terrorism, military, violence, civil_unrest, other
# Client uses: WAR, SECURITY
CATEGORY_TO_CLIENT: dict[str, str] = {
    "war": "WAR",
    "conflict": "WAR",
    "terrorism": "WAR",
    "violence": "WAR",
    "military": "SECURITY",
    "security": "SECURITY",
    "diplomacy": "SECURITY",
    "politics": "SECURITY",
    "protest": "SECURITY",
    "civil_unrest": "SECURITY",
    "other": "SECURITY",
}

# Client category → list of backend categories (reverse mapping)
CLIENT_TO_CATEGORIES: dict[str, list[str]] = {
    "WAR": ["war", "conflict", "terrorism", "violence"],
    "SECURITY": ["military", "security", "diplomacy", "politics", "protest", "civil_unrest", "other"],
}

# GDELT country code → client subCategory
COUNTRY_TO_SUBCATEGORY: dict[str, str] = {
    # Russia-Ukraine conflict
    "UP": "ru-uk", "RS": "ru-uk",
    # Israel-Iran/Middle East
    "IS": "is-ir", "LE": "is-ir", "IR": "is-ir",
    "SY": "is-ir", "GZ": "is-ir", "WE": "is-ir", "YM": "is-ir",
    # Korean peninsula
    "KS": "KOREA", "KN": "KOREA",
    # China / Taiwan
    "CH": "CHINA", "TW": "CHINA",
    # United States
    "US": "US",
    # Japan
    "JA": "JAPAN",
}


def get_location(country_code: str) -> tuple[float, float, str] | None:
    """Get (lat, lng, name) for a GDELT FIPS country code."""
    return COUNTRY_COORDS.get(country_code)


def get_client_category(backend_category: str) -> str:
    """Map backend category to client category (WAR/SECURITY)."""
    return CATEGORY_TO_CLIENT.get(backend_category, "SECURITY")


def get_subcategory(country_code: str) -> str | None:
    """Map GDELT country code to client subCategory."""
    return COUNTRY_TO_SUBCATEGORY.get(country_code)


# Keyword → (lat, lng, name) for text-based location fallback
LOCATION_KEYWORDS: dict[str, tuple[float, float, str]] = {
    # Ukraine/Russia
    "ukraine": (48.38, 31.17, "Ukraine"),
    "kyiv": (50.45, 30.52, "Kyiv, Ukraine"),
    "kharkiv": (49.99, 36.23, "Kharkiv, Ukraine"),
    "donetsk": (48.02, 37.80, "Donetsk, Ukraine"),
    "odesa": (46.48, 30.73, "Odesa, Ukraine"),
    "russia": (55.75, 37.62, "Russia"),
    "moscow": (55.75, 37.62, "Moscow, Russia"),
    "crimea": (44.95, 34.10, "Crimea"),
    # Middle East
    "israel": (31.77, 35.22, "Israel"),
    "gaza": (31.50, 34.47, "Gaza"),
    "iran": (35.69, 51.39, "Iran"),
    "tehran": (35.69, 51.39, "Tehran, Iran"),
    "isfahan": (32.65, 51.68, "Isfahan, Iran"),
    "hormuz": (26.57, 56.28, "Strait of Hormuz"),
    "lebanon": (33.87, 35.51, "Lebanon"),
    "hezbollah": (33.87, 35.51, "Lebanon"),
    "syria": (33.51, 36.29, "Syria"),
    "yemen": (15.35, 44.21, "Yemen"),
    "houthi": (15.35, 44.21, "Yemen"),
    "iraq": (33.31, 44.37, "Iraq"),
    "saudi": (24.77, 46.74, "Saudi Arabia"),
    "dubai": (25.20, 55.27, "Dubai, UAE"),
    "netanyahu": (31.77, 35.22, "Israel"),
    # Korea
    "north korea": (39.02, 125.75, "North Korea"),
    "south korea": (37.57, 126.98, "South Korea"),
    "kim jong": (39.02, 125.75, "North Korea"),
    "dmz": (38.30, 127.00, "DMZ, Korean Peninsula"),
    "pyongyang": (39.02, 125.75, "Pyongyang, North Korea"),
    # China/Taiwan
    "taiwan": (25.03, 121.57, "Taiwan"),
    "china": (39.90, 116.41, "China"),
    "beijing": (39.90, 116.41, "Beijing, China"),
    "south china sea": (15.00, 114.00, "South China Sea"),
    # Others
    "nato": (50.85, 4.35, "Brussels, Belgium"),
    "pentagon": (38.87, -77.06, "Pentagon, USA"),
    "trump": (38.90, -77.04, "Washington, USA"),
    "unifil": (33.27, 35.20, "Southern Lebanon"),
    "afghanistan": (34.53, 69.17, "Afghanistan"),
    "pakistan": (33.69, 73.04, "Pakistan"),
    "myanmar": (16.87, 96.20, "Myanmar"),
    "sudan": (15.59, 32.53, "Sudan"),
    "ethiopia": (9.02, 38.75, "Ethiopia"),
    "somalia": (2.05, 45.32, "Somalia"),
    "libya": (32.90, 13.18, "Libya"),
    "niger": (13.51, 2.11, "Niger"),
    "mali": (12.64, -8.00, "Mali"),
    # Korean (한국어)
    "우크라이나": (48.38, 31.17, "Ukraine"),
    "러시아": (55.75, 37.62, "Russia"),
    "이스라엘": (31.77, 35.22, "Israel"),
    "이란": (35.69, 51.39, "Iran"),
    "레바논": (33.87, 35.51, "Lebanon"),
    "시리아": (33.51, 36.29, "Syria"),
    "사우디": (24.77, 46.74, "Saudi Arabia"),
    "두바이": (25.20, 55.27, "Dubai, UAE"),
    "가자": (31.50, 34.47, "Gaza"),
    "예멘": (15.35, 44.21, "Yemen"),
    "북한": (39.02, 125.75, "North Korea"),
    "남한": (37.57, 126.98, "South Korea"),
    "한국": (37.57, 126.98, "South Korea"),
    "중국": (39.90, 116.41, "China"),
    "대만": (25.03, 121.57, "Taiwan"),
    "이스파한": (32.65, 51.68, "Isfahan, Iran"),
    "호르무즈": (26.57, 56.28, "Strait of Hormuz"),
    "네타냐후": (31.77, 35.22, "Israel"),
    "트럼프": (38.90, -77.04, "Washington, USA"),
    "스페인": (40.42, -3.70, "Spain"),
    # Cyrillic (Ukrainian/Russian/Bulgarian)
    "україн": (48.38, 31.17, "Ukraine"),
    "росій": (55.75, 37.62, "Russia"),
    "ізраїл": (31.77, 35.22, "Israel"),
    "іран": (35.69, 51.39, "Iran"),
    "нетаняху": (31.77, 35.22, "Israel"),
    "ппо": (48.38, 31.17, "Ukraine"),
    "дронів": (48.38, 31.17, "Ukraine"),
}


def extract_location_from_text(text: str) -> tuple[float, float, str] | None:
    """Extract location coordinates from article text using keyword matching.

    Checks text (title/description) for known location keywords and returns
    the first match's coordinates. Longer keywords are checked first for specificity.
    """
    text_lower = text.lower()
    # Sort by keyword length descending (more specific matches first)
    for keyword in sorted(LOCATION_KEYWORDS, key=len, reverse=True):
        if keyword in text_lower:
            return LOCATION_KEYWORDS[keyword]
    return None


# Location name → subcategory inference
_SUBCATEGORY_KEYWORDS: dict[str, str] = {
    "ukraine": "ru-uk", "russia": "ru-uk", "kyiv": "ru-uk", "moscow": "ru-uk",
    "crimea": "ru-uk", "donetsk": "ru-uk", "kharkiv": "ru-uk",
    "israel": "is-ir", "gaza": "is-ir", "iran": "is-ir", "lebanon": "is-ir",
    "syria": "is-ir", "yemen": "is-ir", "hormuz": "is-ir", "dubai": "is-ir",
    "saudi": "is-ir", "isfahan": "is-ir", "tehran": "is-ir",
    "korea": "KOREA", "pyongyang": "KOREA", "dmz": "KOREA",
    "china": "CHINA", "taiwan": "CHINA", "beijing": "CHINA",
    "usa": "US", "pentagon": "US", "washington": "US", "trump": "US",
    "japan": "JAPAN",
}


# Nominatim geocoding cache and rate limiter
_nominatim_cache: dict[str, tuple[float, float, str] | None] = {}
_nominatim_last_call: float = 0.0


async def geocode_nominatim(place_name: str) -> tuple[float, float, str] | None:
    """Geocode a place name using Nominatim (free, OSM-based).

    Rate limited to 1 request/second per Nominatim usage policy.
    Results are cached in memory.
    """
    global _nominatim_last_call

    if place_name in _nominatim_cache:
        return _nominatim_cache[place_name]

    # Rate limit: 1 req/sec
    elapsed = time.time() - _nominatim_last_call
    if elapsed < 1.1:
        await asyncio.sleep(1.1 - elapsed)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": place_name, "format": "json", "limit": 1},
                headers={"User-Agent": "Huginn/1.0 (war-security-news)"},
            )
            _nominatim_last_call = time.time()
            data = resp.json()
            if data:
                result = (float(data[0]["lat"]), float(data[0]["lon"]), data[0].get("display_name", place_name))
                _nominatim_cache[place_name] = result
                logger.info(f"[NOMINATIM] Geocoded '{place_name}' → {result[2]} ({result[0]:.2f}, {result[1]:.2f})")
                return result
    except Exception as e:
        logger.warning(f"[NOMINATIM] Failed for '{place_name}': {e}")

    _nominatim_cache[place_name] = None
    return None


def _infer_subcategory(location_name: str) -> str | None:
    """Infer subcategory from location name."""
    name_lower = location_name.lower()
    for keyword, subcat in _SUBCATEGORY_KEYWORDS.items():
        if keyword in name_lower:
            return subcat
    return None

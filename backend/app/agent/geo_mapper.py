"""
Geographic mapping utilities for GDELT country codes → coordinates and category mapping.

GDELT uses FIPS 10-4 country codes. This module maps them to:
1. Lat/lng coordinates (capital or centroid) for map display
2. Client-facing categories (WAR/SECURITY) and subCategories (ru-uk, KOREA, etc.)
"""

from __future__ import annotations

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
    "terrorism": "WAR",
    "violence": "WAR",
    "military": "SECURITY",
    "protest": "SECURITY",
    "civil_unrest": "SECURITY",
    "other": "SECURITY",
}

# Client category → list of backend categories (reverse mapping)
CLIENT_TO_CATEGORIES: dict[str, list[str]] = {
    "WAR": ["war", "terrorism", "violence"],
    "SECURITY": ["military", "protest", "civil_unrest", "other"],
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

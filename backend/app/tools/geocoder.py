"""
Geocoding & Location Resolution Tool
Resolves coastal place names, landing centers, and coordinates.
"""

from typing import Dict, List, Optional, Tuple
from app.models.ocean import GeoLocation

COASTAL_LOCATIONS: Dict[str, Dict[str, float]] = {
    "chennai": {"lat": 13.0827, "lon": 80.2707, "district": "Chennai", "state": "Tamil Nadu"},
    "kasimedu": {"lat": 13.1258, "lon": 80.2974, "district": "Chennai", "state": "Tamil Nadu"},
    "mahabalipuram": {"lat": 12.6269, "lon": 80.1927, "district": "Chengalpattu", "state": "Tamil Nadu"},
    "cuddalore": {"lat": 11.7478, "lon": 79.7744, "district": "Cuddalore", "state": "Tamil Nadu"},
    "kochi": {"lat": 9.9312, "lon": 76.2673, "district": "Ernakulam", "state": "Kerala"},
    "munambam": {"lat": 10.1812, "lon": 76.1683, "district": "Ernakulam", "state": "Kerala"},
    "mangalore": {"lat": 12.8550, "lon": 74.8320, "district": "Dakshina Kannada", "state": "Karnataka"},
    "vizag": {"lat": 17.6974, "lon": 83.3032, "district": "Visakhapatnam", "state": "Andhra Pradesh"},
    "visakhapatnam": {"lat": 17.6974, "lon": 83.3032, "district": "Visakhapatnam", "state": "Andhra Pradesh"}
}


def geocode_location(place_name: str) -> GeoLocation:
    """
    Geocode a coastal location name into canonical latitude/longitude coordinates.
    """
    clean_name = place_name.strip().lower()
    for key, data in COASTAL_LOCATIONS.items():
        if key in clean_name or clean_name in key:
            return GeoLocation(
                latitude=data["lat"],
                longitude=data["lon"],
                name=place_name.title(),
                district=data["district"],
                state=data["state"]
            )
    
    # Default fallback to Chennai if unrecognized
    return GeoLocation(
        latitude=13.0827,
        longitude=80.2707,
        name=place_name.title(),
        district="Chennai",
        state="Tamil Nadu"
    )


def get_bounding_box(lat: float, lon: float, radius_km: float = 50.0) -> List[float]:
    """
    Calculate bounding box [min_lat, min_lon, max_lat, max_lon] for a given radius in km.
    1 degree latitude ~ 111 km
    1 degree longitude ~ 111 * cos(lat) km
    """
    import math
    lat_delta = radius_km / 111.0
    lon_delta = radius_km / (111.0 * math.cos(math.radians(lat)))
    return [
        round(lat - lat_delta, 4),
        round(lon - lon_delta, 4),
        round(lat + lat_delta, 4),
        round(lon + lon_delta, 4)
    ]

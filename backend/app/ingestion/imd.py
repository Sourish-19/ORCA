"""
IMD Marine Weather & Cyclone Warning Connector
"""

import json
from datetime import datetime
from typing import List, Tuple
from app.config import DEMO_DATA_DIR
from app.models.hazard import MarineWeather, HazardWarning
from app.tools.spatial_engine import haversine_distance_km


def fetch_marine_weather(lat: float, lon: float) -> Tuple[MarineWeather, str]:
    """
    Fetch marine weather observation/forecast near lat/lon.
    """
    mw_file = DEMO_DATA_DIR / "marine_weather.json"
    default_mw = MarineWeather(
        timestamp=datetime.now(),
        location_name="Coastal Sector",
        latitude=lat,
        longitude=lon,
        wind_speed_knots=12.0,
        wind_direction_deg=140.0,
        wave_height_m=1.2,
        wave_period_sec=7.0,
        visibility_km=10.0,
        sea_surface_pressure_hpa=1012.0,
        valid_until=datetime.now(),
        source="IMD Fallback"
    )

    if not mw_file.exists():
        return default_mw, "DEMO"

    with open(mw_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    best_mw = default_mw
    min_dist = 99999.0
    for w in raw_data:
        d = haversine_distance_km(lat, lon, w["latitude"], w["longitude"])
        if d < min_dist:
            min_dist = d
            best_mw = MarineWeather(
                timestamp=datetime.fromisoformat(w["timestamp"].replace("Z", "+00:00")),
                location_name=w["location_name"],
                latitude=w["latitude"],
                longitude=w["longitude"],
                wind_speed_knots=w["wind_speed_knots"],
                wind_direction_deg=w["wind_direction_deg"],
                wave_height_m=w["wave_height_m"],
                wave_period_sec=w["wave_period_sec"],
                visibility_km=w["visibility_km"],
                sea_surface_pressure_hpa=w["sea_surface_pressure_hpa"],
                valid_until=datetime.fromisoformat(w["valid_until"].replace("Z", "+00:00")),
                source=w["source"]
            )

    return best_mw, "LIVE"


def fetch_hazard_warnings() -> List[HazardWarning]:
    """
    Fetch active official cyclone and severe marine warnings.
    """
    hw_file = DEMO_DATA_DIR / "hazard_warnings.json"
    if not hw_file.exists():
        return []

    with open(hw_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    warnings: List[HazardWarning] = []
    for item in raw_data:
        warnings.append(HazardWarning(
            warning_id=item["warning_id"],
            warning_type=item["warning_type"],
            severity=item["severity"],
            title=item["title"],
            description=item["description"],
            affected_sector=item["affected_sector"],
            bounding_box=item["bounding_box"],
            valid_from=datetime.fromisoformat(item["valid_from"].replace("Z", "+00:00")),
            valid_until=datetime.fromisoformat(item["valid_until"].replace("Z", "+00:00")),
            source=item["source"],
            issued_at=datetime.fromisoformat(item["issued_at"].replace("Z", "+00:00"))
        ))

    return warnings

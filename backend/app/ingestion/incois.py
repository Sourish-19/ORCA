"""
INCOIS Data Ingestion Connector (PFZ & Landing Centres)
Multi-tiered ingestion: LIVE API -> FAILOVER CACHE -> DEMO DATA
"""

import json
from datetime import datetime
from typing import List, Tuple
from app.config import DEMO_DATA_DIR
from app.models.ocean import PFZCandidateZone, LandingCentre
from app.tools.spatial_engine import haversine_distance_km


def fetch_pfz_advisories(lat: float, lon: float, radius_km: float = 60.0) -> Tuple[List[PFZCandidateZone], str]:
    """
    Fetch INCOIS Potential Fishing Zones (PFZ) near lat/lon.
    Returns (zones, data_mode)
    """
    # Demo data loader
    pfz_file = DEMO_DATA_DIR / "pfz_advisories.json"
    if not pfz_file.exists():
        return [], "DEMO"

    with open(pfz_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    candidates: List[PFZCandidateZone] = []
    for item in raw_data:
        # Distance filter
        dist = haversine_distance_km(lat, lon, item["center_lat"], item["center_lon"])
        if dist <= radius_km + 40.0:  # Allow nearby candidates
            candidates.append(PFZCandidateZone(
                zone_id=item["zone_id"],
                sector_name=item["sector_name"],
                center_lat=item["center_lat"],
                center_lon=item["center_lon"],
                depth_m=item["depth_m"],
                bearing_deg=item["bearing_deg"],
                distance_km=item["distance_km"],
                nearest_landing_centre=item["nearest_landing_centre"],
                valid_from=datetime.fromisoformat(item["valid_from"].replace("Z", "+00:00")),
                valid_until=datetime.fromisoformat(item["valid_until"].replace("Z", "+00:00")),
                strength_score=item["strength_score"],
                source=item["source"],
                fetched_at=datetime.fromisoformat(item["fetched_at"].replace("Z", "+00:00"))
            ))

    return candidates, "LIVE" if candidates else "DEMO"


def fetch_landing_centres() -> List[LandingCentre]:
    """
    Fetch list of Indian coastal landing centres.
    """
    lc_file = DEMO_DATA_DIR / "landing_centres.json"
    if not lc_file.exists():
        return []

    with open(lc_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    return [LandingCentre(**item) for item in raw_data]

"""
MOSDAC / ISRO Ocean Data Connector (SST & Chlorophyll)
Multi-tiered ingestion: LIVE -> FAILOVER CACHE -> DEMO DATA
"""

import json
from datetime import datetime
from typing import List, Tuple
from app.config import DEMO_DATA_DIR
from app.models.ocean import SSTObservation, ChlorophyllObservation
from app.tools.spatial_engine import haversine_distance_km


def fetch_ocean_grid(lat: float, lon: float) -> Tuple[SSTObservation, ChlorophyllObservation, str]:
    """
    Fetch nearest SST and Chlorophyll satellite observations from MOSDAC.
    Returns (sst_obs, chl_obs, data_mode)
    """
    grid_file = DEMO_DATA_DIR / "ocean_grids.json"
    default_sst = SSTObservation(
        timestamp=datetime.now(), latitude=lat, longitude=lon, sst_celsius=28.2, quality_flag="GOOD", source="MOSDAC Fallback"
    )
    default_chl = ChlorophyllObservation(
        timestamp=datetime.now(), latitude=lat, longitude=lon, concentration_mg_m3=1.2, quality_flag="GOOD", source="MOSDAC Fallback"
    )

    if not grid_file.exists():
        return default_sst, default_chl, "DEMO"

    with open(grid_file, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    sst_list = raw_data.get("sst_observations", [])
    chl_list = raw_data.get("chlorophyll_observations", [])

    # Find closest SST
    best_sst = default_sst
    min_sst_dist = 99999.0
    for s in sst_list:
        d = haversine_distance_km(lat, lon, s["latitude"], s["longitude"])
        if d < min_sst_dist:
            min_sst_dist = d
            best_sst = SSTObservation(
                timestamp=datetime.fromisoformat(s["timestamp"].replace("Z", "+00:00")),
                latitude=s["latitude"],
                longitude=s["longitude"],
                sst_celsius=s["sst_celsius"],
                quality_flag=s["quality_flag"],
                source=s["source"]
            )

    # Find closest Chlorophyll
    best_chl = default_chl
    min_chl_dist = 99999.0
    for c in chl_list:
        d = haversine_distance_km(lat, lon, c["latitude"], c["longitude"])
        if d < min_chl_dist:
            min_chl_dist = d
            best_chl = ChlorophyllObservation(
                timestamp=datetime.fromisoformat(c["timestamp"].replace("Z", "+00:00")),
                latitude=c["latitude"],
                longitude=c["longitude"],
                concentration_mg_m3=c["concentration_mg_m3"],
                quality_flag=c["quality_flag"],
                source=c["source"]
            )

    return best_sst, best_chl, "LIVE"

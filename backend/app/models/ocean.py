"""
Canonical Data Model - Oceanography & Fisheries
PFZ Advisories, SST, Chlorophyll, Landing Centres.
"""

from datetime import datetime
from typing import List, Optional, Tuple
from pydantic import BaseModel, Field


class GeoLocation(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in decimal degrees")
    name: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None


class PFZCandidateZone(BaseModel):
    zone_id: str
    sector_name: str
    center_lat: float
    center_lon: float
    depth_m: float
    bearing_deg: float
    distance_km: float
    nearest_landing_centre: str
    valid_from: datetime
    valid_until: datetime
    strength_score: float = Field(..., ge=0.0, le=100.0, description="INCOIS PFZ strength (0-100)")
    source: str = "INCOIS"
    fetched_at: datetime


class SSTObservation(BaseModel):
    timestamp: datetime
    latitude: float
    longitude: float
    sst_celsius: float
    quality_flag: str = "GOOD"
    source: str = "MOSDAC/ISRO"


class ChlorophyllObservation(BaseModel):
    timestamp: datetime
    latitude: float
    longitude: float
    concentration_mg_m3: float
    quality_flag: str = "GOOD"
    source: str = "MOSDAC/ISRO"


class LandingCentre(BaseModel):
    id: str
    name: str
    district: str
    state: str
    latitude: float
    longitude: float
    facilities: List[str] = []
    max_boat_capacity: Optional[int] = None

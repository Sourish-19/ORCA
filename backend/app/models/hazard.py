"""
Canonical Data Model - Marine Weather & Hazard Warnings
Marine weather, Wind, Waves, Cyclones, Official Warnings.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class MarineWeather(BaseModel):
    timestamp: datetime
    location_name: str
    latitude: float
    longitude: float
    wind_speed_knots: float
    wind_direction_deg: float
    wave_height_m: float
    wave_period_sec: float
    visibility_km: float
    sea_surface_pressure_hpa: float
    valid_until: datetime
    source: str = "IMD"


class CyclonePoint(BaseModel):
    timestamp: datetime
    latitude: float
    longitude: float
    max_sustained_wind_knots: float
    pressure_hpa: float
    category: str  # e.g., "Depression", "Deep Depression", "Cyclonic Storm", "Severe Cyclonic Storm"


class CycloneTrack(BaseModel):
    cyclone_id: str
    name: str
    basin: str = "Bay of Bengal"  # or Arabian Sea
    status: str  # e.g. ACTIVE, DISSIPATED, FORECAST
    points: List[CyclonePoint]
    warning_issued_at: datetime
    source: str = "IMD Cyclone Warning Centre"


class HazardWarning(BaseModel):
    warning_id: str
    warning_type: str  # "HIGH_WAVE", "CYCLONE", "GALE_WIND", "HEAVY_RAIN", "ROUGH_SEA"
    severity: str      # "GREEN", "YELLOW", "ORANGE", "RED"
    title: str
    description: str
    affected_sector: str
    bounding_box: List[float]  # [min_lat, min_lon, max_lat, max_lon]
    valid_from: datetime
    valid_until: datetime
    source: str = "IMD / INCOIS Joint Advisory"
    issued_at: datetime

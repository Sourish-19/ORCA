"""
Canonical Data Model - Marine Weather & Hazard Warnings
Normalized schemas for IMD Coastal Bulletins, Fishermen Warnings, and RSMC Cyclone Advisories.
"""

from datetime import datetime, date
from typing import List, Optional, Tuple, Dict, Any
from pydantic import BaseModel, Field

from app.models.ocean import (
    CommonMetadata,
    NormalizedPFZRecord,
    NormalizedSSTRecord,
    NormalizedChlorophyllRecord
)


# =====================================================================
# 1. Normalized Marine & Coastal Weather
# =====================================================================

class NormalizedMarineWeather(BaseModel):
    """Canonical normalized record for IMD Coastal Weather Bulletin."""
    coastal_sector: str = Field("North Tamil Nadu Coast", description="Coastal sector name")
    wind_direction: str = Field(..., description="e.g. 'Southwesterly / Southerly'")
    wind_speed_knots_min: float = Field(..., description="Lower baseline wind speed in knots")
    wind_speed_knots_max: float = Field(..., description="Upper baseline wind speed in knots")
    gust_speed_knots: float = Field(..., description="Peak gust speed in knots")
    sea_condition: str = Field(..., description="e.g. 'Generally Moderate, becoming Rough in gust'")
    weather_condition: str = Field(..., description="e.g. 'Isolated rain/thundershowers'")
    visibility: str = Field(..., description="e.g. 'Good, becoming poor in rain/thundershowers'")
    port_warning: str = Field("NIL", description="Port signals hoisted at Chennai/Ennore/Kattupalli ports")
    ocean_current_speed_m_s: Optional[Tuple[float, float]] = Field(None, description="Surface current speed range [min_m_s, max_m_s]")
    metadata: CommonMetadata


# =====================================================================
# 2. Normalized Hazard, Fishermen & Cyclone Warning
# =====================================================================

class NormalizedHazardWarning(BaseModel):
    """Canonical normalized record for IMD Fishermen Warnings and RSMC Cyclone Bulletins."""
    warning_type: str = Field(..., description="'FISHERMEN_WARNING' | 'CYCLONE_OUTLOOK' | 'SWELL_SURGE' | 'OCEAN_CURRENT'")
    warning_level: str = Field(..., description="'NO_WARNING' | 'ADVISORY_CAUTION' | 'STRICT_PROHIBITION' | 'RED_ALERT'")
    affected_area: str = Field(..., description="e.g. 'South Tamil Nadu Coast', 'Southwest Bay of Bengal', 'Royapuram to Pulicat'")
    fishermen_advised_not_to_venture: bool = Field(False, description="True if official prohibition issued for sector")
    
    # Cyclone / Disturbance specifics
    cyclone_active: bool = Field(False, description="True if cyclonic storm/depression active in marine basin")
    cyclone_stage: Optional[str] = Field(None, description="'NIL' | 'WML' | 'Depression' | 'Cyclonic Storm'")
    cyclone_coordinates: Optional[Dict[str, float]] = Field(None, description="Center coordinates if system active")
    cyclone_warning_active: bool = Field(False, description="True if cyclone warning active for target coast")
    seven_day_cyclogenesis_probability: str = Field("NIL", description="Probability of depression formation (e.g. 'NIL')")
    
    description: str = Field(..., description="Verbatim advisory text from official bulletin")
    metadata: CommonMetadata


# =====================================================================
# 3. Derived / Fusion Container (Normalized Environmental Snapshot)
# =====================================================================

class NormalizedEnvironmentalSnapshot(BaseModel):
    """
    Derived / Multi-Source Environmental Fusion Container.
    Constructed during downstream spatial-temporal aggregation, not during raw ingestion.
    """
    snapshot_id: str
    target_date: date
    center_latitude: float
    center_longitude: float
    nearest_landing_centre: str
    
    # Optional fused components
    pfz_record: Optional[NormalizedPFZRecord] = None
    sst_record: Optional[NormalizedSSTRecord] = None
    chlorophyll_record: Optional[NormalizedChlorophyllRecord] = None
    marine_weather: Optional[NormalizedMarineWeather] = None
    active_warnings: List[NormalizedHazardWarning] = []
    
    is_synthetic: bool = False
    data_freshness_summary: Dict[str, str] = Field(default_factory=dict)


# =====================================================================
# 4. Legacy / Compatibility Wrappers
# =====================================================================

class MarineWeather(BaseModel):
    """Legacy wrapper for marine weather points."""
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
    """Legacy wrapper for cyclone track points."""
    timestamp: datetime
    latitude: float
    longitude: float
    max_sustained_wind_knots: float
    pressure_hpa: float
    category: str


class CycloneTrack(BaseModel):
    """Legacy wrapper for cyclone tracks."""
    cyclone_id: str
    name: str
    basin: str = "Bay of Bengal"
    status: str
    points: List[CyclonePoint]
    warning_issued_at: datetime
    source: str = "IMD Cyclone Warning Centre"


class HazardWarning(BaseModel):
    """Legacy wrapper for hazard warnings."""
    warning_id: str
    warning_type: str
    severity: str
    title: str
    description: str
    affected_sector: str
    bounding_box: List[float]
    valid_from: datetime
    valid_until: datetime
    source: str = "IMD / INCOIS Joint Advisory"
    issued_at: datetime

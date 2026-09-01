"""
Canonical Data Model - Oceanography, Fisheries, & Environment
Normalized schemas for INCOIS PFZ, Copernicus SST, and Copernicus Chlorophyll-a.
"""

from datetime import datetime, date
from typing import List, Optional, Tuple, Dict, Any
from pydantic import BaseModel, Field


# =====================================================================
# 1. Common Metadata Header
# =====================================================================

class CommonMetadata(BaseModel):
    """Standardized metadata header for all authentic empirical datasets."""
    source: str = Field(..., description="Official agency (e.g., 'INCOIS', 'Copernicus Marine', 'IMD', 'RSMC')")
    source_product: str = Field(..., description="Official product title/identifier (e.g., 'SST_GLO_PHY_L4_NRT_010_005')")
    dataset_id: Optional[str] = Field(None, description="Granular dataset ID if applicable")
    observation_time: Optional[datetime] = Field(None, description="Exact observation or satellite pass timestamp")
    validity_start: Optional[datetime] = Field(None, description="Start of advisory or forecast validity")
    validity_end: Optional[datetime] = Field(None, description="End of advisory or forecast validity")
    geographic_area: str = Field(..., description="Region name (e.g. 'North Tamil Nadu Coast', 'Southwest Bay of Bengal')")
    synthetic: bool = Field(False, description="Strictly False for all real empirical datasets")
    data_freshness_note: Optional[str] = Field(None, description="Notes on temporal lag relative to target query date")


# =====================================================================
# 2. Normalized INCOIS PFZ Record
# =====================================================================

class NormalizedPFZRecord(BaseModel):
    """Canonical normalized record for INCOIS Potential Fishing Zone advisory."""
    landing_centre: str = Field(..., description="Name of coastal landing centre (e.g. 'Chennai', 'Ennore')")
    district: str = Field(..., description="Coastal district (e.g. 'Chennai', 'Thiruvallur')")
    state: str = Field("Tamil Nadu", description="Maritime state")
    sector_id: str = Field("SEC007", description="INCOIS sector code")
    direction: str = Field(..., description="Compass direction from coast (e.g. 'ENE', 'NE', 'E')")
    bearing_deg: float = Field(..., ge=0, le=360, description="Bearing angle in degrees")
    distance_range_km: Tuple[float, float] = Field(..., description="Distance range [min_km, max_km]")
    depth_range_m: Tuple[float, float] = Field(..., description="Depth range [min_m, max_m]")
    latitude_dd: float = Field(..., ge=-90, le=90, description="Converted decimal degrees latitude")
    longitude_dd: float = Field(..., ge=-180, le=180, description="Converted decimal degrees longitude")
    raw_latitude_dms: str = Field(..., description="Original INCOIS DMS string (e.g. '13 01 03 N')")
    raw_longitude_dms: str = Field(..., description="Original INCOIS DMS string (e.g. '80 38 00 E')")
    metadata: CommonMetadata


# =====================================================================
# 3. Normalized Copernicus SST Record
# =====================================================================

class NormalizedSSTRecord(BaseModel):
    """Canonical normalized observation for Sea Surface Temperature."""
    latitude: float = Field(..., ge=-90, le=90, description="Grid latitude in decimal degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Grid longitude in decimal degrees")
    sst_kelvin: Optional[float] = Field(None, description="Original temperature measurement in Kelvin")
    sst_celsius: Optional[float] = Field(None, description="Temperature in degrees Celsius (K - 273.15)")
    temperature_units: str = Field("degC", description="Processed temperature unit")
    is_land_masked: bool = Field(False, description="True if point is on land and masked as null")
    metadata: CommonMetadata


# =====================================================================
# 4. Normalized Copernicus Chlorophyll-a Record
# =====================================================================

class NormalizedChlorophyllRecord(BaseModel):
    """Canonical normalized observation for Chlorophyll-a concentration."""
    latitude: float = Field(..., ge=-90, le=90, description="Grid latitude in decimal degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Grid longitude in decimal degrees")
    chlorophyll_value: Optional[float] = Field(None, description="Chlorophyll-a mass concentration")
    chlorophyll_units: str = Field("milligram m-3", description="Official unit from satellite NetCDF")
    is_land_masked: bool = Field(False, description="True if point is on land and masked as null")
    metadata: CommonMetadata


# =====================================================================
# 5. Geographic & Landing Centre Models
# =====================================================================

class GeoLocation(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in decimal degrees")
    name: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None


class LandingCentre(BaseModel):
    id: str
    name: str
    district: str
    state: str
    latitude: float
    longitude: float
    facilities: List[str] = []
    max_boat_capacity: Optional[int] = None


# =====================================================================
# 6. Legacy / Compatibility Wrappers
# =====================================================================

class PFZCandidateZone(BaseModel):
    """Legacy wrapper for pipeline components expecting candidate zone structure."""
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
    strength_score: Optional[float] = Field(None, description="Optional legacy score (None for authentic INCOIS data)")
    source: str = "INCOIS"
    fetched_at: datetime


class SSTObservation(BaseModel):
    """Legacy wrapper for SST observations."""
    timestamp: datetime
    latitude: float
    longitude: float
    sst_celsius: float
    quality_flag: str = "GOOD"
    source: str = "Copernicus Marine"


class ChlorophyllObservation(BaseModel):
    """Legacy wrapper for Chlorophyll observations."""
    timestamp: datetime
    latitude: float
    longitude: float
    concentration_mg_m3: float
    quality_flag: str = "GOOD"
    source: str = "Copernicus Marine"

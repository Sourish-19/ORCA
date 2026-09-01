"""
Evidence Models - Canonical data structures for fused multi-source evidence bundles.
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
from app.models.hazard import (
    NormalizedMarineWeather,
    NormalizedHazardWarning
)


class SpatialMatchMetadata(BaseModel):
    """Metadata describing the deterministic spatial matching of a grid observation to an anchor location."""
    source_coordinate: Tuple[float, float] = Field(..., description="[Latitude, Longitude] of matched grid observation")
    pfz_coordinate: Tuple[float, float] = Field(..., description="[Latitude, Longitude] of anchor PFZ location")
    distance_km: float = Field(..., ge=0.0, description="Haversine distance in kilometers between anchor and matched grid point")
    matching_method: str = Field("nearest_valid_grid_point", description="Deterministic matching algorithm")
    valid_observation: bool = Field(True, description="True if matched point contains a valid ocean measurement (not land-masked)")


class MatchedSST(BaseModel):
    """SST observation matched to a PFZ anchor with spatial provenance."""
    record: Optional[NormalizedSSTRecord] = None
    spatial_match: Optional[SpatialMatchMetadata] = None


class MatchedChlorophyll(BaseModel):
    """Chlorophyll observation matched to a PFZ anchor with spatial provenance."""
    record: Optional[NormalizedChlorophyllRecord] = None
    spatial_match: Optional[SpatialMatchMetadata] = None


class EvidenceBundle(BaseModel):
    """
    Deterministic Evidence Bundle constructed around an INCOIS PFZ anchor location.
    Combines authentic satellite observations, coastal weather, and geographically filtered hazard warnings.
    """
    bundle_id: str = Field(..., description="Unique deterministic identifier (e.g. 'evidence_chennai_01')")
    target_date: date = Field(..., description="Query target date")
    
    # Anchor Location
    pfz: NormalizedPFZRecord = Field(..., description="Primary anchor PFZ advisory record")
    
    # Fused Environmental Observations (with spatial provenance)
    sst: MatchedSST = Field(..., description="Nearest valid Copernicus SST observation")
    chlorophyll: MatchedChlorophyll = Field(..., description="Nearest valid Copernicus Chlorophyll observation")
    
    # Applicable Marine Weather & Hazards
    marine_weather: Optional[NormalizedMarineWeather] = Field(None, description="Applicable IMD Coastal Weather Bulletin")
    applicable_warnings: List[NormalizedHazardWarning] = Field(default_factory=list, description="Geographically relevant hazard warnings")
    
    # Data Integrity & Provenance Tracking
    freshness_summary: Dict[str, str] = Field(default_factory=dict, description="Human-readable provenance and date/lag breakdown")
    is_synthetic: bool = Field(False, description="Strictly False for all real empirical evidence")

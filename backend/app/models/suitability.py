"""
Suitability Models - Strongly-typed schemas for ORCA Suitability Index (OSI) and component breakdowns.
"""

from datetime import datetime, date
from typing import List, Optional, Tuple, Dict, Any
from pydantic import BaseModel, Field


# =====================================================================
# 1. Configurable Heuristics & Weights
# =====================================================================

class SuitabilityConfig(BaseModel):
    """
    Configuration parameters for ORCA Suitability Index (OSI).
    All thresholds are explicitly categorized as 'ORCA Prototype Environmental Heuristic v1'.
    """
    methodology_name: str = "ORCA Prototype Environmental Heuristic v1"
    methodology_version: str = "v1.0-deterministic-empirical"
    
    # Base PFZ Anchor credit
    pfz_base_score: float = Field(50.0, description="Base score for authentic INCOIS PFZ advisory")
    
    # Chlorophyll-a thresholds (mg/m3) and credit
    chl_optimal_min: float = 0.30
    chl_optimal_max: float = 2.00
    chl_optimal_score: float = 25.0
    chl_moderate_low_min: float = 0.15
    chl_moderate_high_max: float = 3.50
    chl_moderate_score: float = 15.0
    chl_marginal_score: float = 5.0
    chl_max_distance_km: float = 30.0
    chl_penalty_distance_threshold_km: float = 5.0
    
    # Sea Surface Temperature thresholds (deg C) and credit
    sst_optimal_min: float = 28.5
    sst_optimal_max: float = 29.4
    sst_optimal_score: float = 15.0
    sst_acceptable_min: float = 28.0
    sst_acceptable_max: float = 29.8
    sst_acceptable_score: float = 10.0
    sst_marginal_score: float = 3.0
    sst_max_distance_km: float = 60.0
    sst_penalty_distance_threshold_km: float = 15.0
    
    # Operational Accessibility thresholds (distance from landing centre in km)
    access_near_max_km: float = 20.0
    access_near_score: float = 10.0
    access_mid_max_km: float = 35.0
    access_mid_score: float = 7.0
    access_far_score: float = 4.0


# =====================================================================
# 2. Component Breakdown
# =====================================================================

class ComponentEvidence(BaseModel):
    """Detailed numeric breakdown of the 4 independent components of the OSI."""
    pfz_base_score: float = Field(..., description="Base PFZ anchor credit (50.0 pts)")
    chlorophyll_score: float = Field(..., description="Chlorophyll contribution after distance scaling (0-25 pts)")
    chlorophyll_raw_score: float = Field(..., description="Unscaled chlorophyll score based on concentration band")
    chlorophyll_value: Optional[float] = Field(None, description="Observed Chlorophyll-a in mg/m3")
    chlorophyll_distance_km: Optional[float] = Field(None, description="Distance to matched Chlorophyll grid point in km")
    
    sst_score: float = Field(..., description="SST contribution after distance scaling (0-15 pts)")
    sst_raw_score: float = Field(..., description="Unscaled SST score based on temperature band")
    sst_value_celsius: Optional[float] = Field(None, description="Observed SST in degC")
    sst_distance_km: Optional[float] = Field(None, description="Distance to matched SST grid point in km")
    
    accessibility_score: float = Field(..., description="Operational accessibility contribution (0-10 pts)")
    distance_km: float = Field(..., description="Midpoint distance from landing centre in km")


# =====================================================================
# 3. Comprehensive Suitability Assessment
# =====================================================================

class SuitabilityAssessment(BaseModel):
    """
    Deterministic evaluation of a candidate PFZ location.
    The ORCA Suitability Index (OSI) represents environmental corroboration + operational accessibility.
    It does NOT represent fish abundance, catch probability, or biomass prediction.
    """
    candidate_id: str = Field(..., description="Unique identifier for the PFZ candidate")
    landing_centre: str = Field(..., description="Associated landing centre name")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    bearing_deg: float = Field(..., ge=0, le=360)
    distance_km_range: Tuple[float, float]
    depth_m_range: Tuple[float, float]
    
    # ORCA Suitability Index (OSI)
    orca_suitability_index: float = Field(..., ge=0.0, le=100.0, description="Total OSI score (0-100)")
    suitability_level: str = Field(..., description="'HIGH' | 'MODERATE' | 'BASELINE_PFZ' | 'LOW'")
    
    # Component Evidence & Explainability
    component_evidence: ComponentEvidence
    supporting_factors: List[str] = Field(default_factory=list)
    limiting_factors: List[str] = Field(default_factory=list)
    explanation_facts: List[str] = Field(default_factory=list)
    
    # Provenance & Limitations
    methodology_name: str = "ORCA Prototype Environmental Heuristic v1"
    methodology_version: str = "v1.0-deterministic-empirical"
    data_freshness: Dict[str, str] = Field(default_factory=dict)
    limitations: List[str] = Field(default_factory=list)
    is_synthetic: bool = False

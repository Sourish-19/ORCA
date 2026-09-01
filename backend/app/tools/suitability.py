"""
Fishing Suitability Model - Transparent Weighted Scoring
Formula:
Suitability = 0.35 * PFZ + 0.25 * CHL + 0.15 * SST + 0.10 * Wind + 0.10 * Wave + 0.05 * Accessibility
"""

from typing import Dict
from app.config import (
    WEIGHT_PFZ, WEIGHT_CHL, WEIGHT_SST,
    WEIGHT_WIND, WEIGHT_WAVE, WEIGHT_ACCESSIBILITY
)
from app.models.ocean import PFZCandidateZone, SSTObservation, ChlorophyllObservation
from app.models.hazard import MarineWeather
from app.models.request import SuitabilityBreakdown


def calculate_suitability(
    zone: PFZCandidateZone,
    sst: SSTObservation,
    chl: ChlorophyllObservation,
    weather: MarineWeather
) -> SuitabilityBreakdown:
    """
    Calculate transparent fishing suitability score (0-100) for a candidate zone based on multi-factor ocean data.
    """
    # 1. PFZ Strength Score (0-100)
    pfz_score = zone.strength_score

    # 2. Chlorophyll Score (Optimal range 1.0 - 3.0 mg/m3 -> 100)
    # Concentration < 0.2 is low (30), > 1.5 is high productivity (90-100)
    chl_val = chl.concentration_mg_m3
    if chl_val >= 1.5:
        chl_score = 95.0
    elif chl_val >= 0.8:
        chl_score = 80.0
    elif chl_val >= 0.4:
        chl_score = 60.0
    else:
        chl_score = 35.0

    # 3. Sea Surface Temp Score (Optimal Indian waters 27-29.5 deg C)
    sst_val = sst.sst_celsius
    if 27.0 <= sst_val <= 29.5:
        sst_score = 95.0
    elif 26.0 <= sst_val <= 30.5:
        sst_score = 75.0
    else:
        sst_score = 50.0

    # 4. Wind Operating Condition Score (12 knots is ideal, > 20 knots drops score)
    wind_knots = weather.wind_speed_knots
    if wind_knots <= 12.0:
        wind_score = 95.0
    elif wind_knots <= 18.0:
        wind_score = 80.0
    elif wind_knots <= 24.0:
        wind_score = 50.0
    else:
        wind_score = 15.0

    # 5. Wave Operating Condition Score (< 1.5m is safe/ideal)
    wave_m = weather.wave_height_m
    if wave_m <= 1.2:
        wave_score = 95.0
    elif wave_m <= 1.8:
        wave_score = 80.0
    elif wave_m <= 2.4:
        wave_score = 50.0
    else:
        wave_score = 10.0

    # 6. Accessibility Score (Distance from landing centre: < 20km is 95, 20-40km is 85, >40km is 65)
    dist_km = zone.distance_km
    if dist_km <= 20.0:
        acc_score = 95.0
    elif dist_km <= 40.0:
        acc_score = 85.0
    else:
        acc_score = 65.0

    # Calculate weighted contributions
    c_pfz = WEIGHT_PFZ * pfz_score
    c_chl = WEIGHT_CHL * chl_score
    c_sst = WEIGHT_SST * sst_score
    c_wind = WEIGHT_WIND * wind_score
    c_wave = WEIGHT_WAVE * wave_score
    c_acc = WEIGHT_ACCESSIBILITY * acc_score

    total_score = round(c_pfz + c_chl + c_sst + c_wind + c_wave + c_acc, 2)

    formula_str = (
        f"Suitability ({total_score}%) = "
        f"0.35·PFZ({pfz_score:.1f}) + 0.25·CHL({chl_score:.1f}) + 0.15·SST({sst_score:.1f}) + "
        f"0.10·Wind({wind_score:.1f}) + 0.10·Wave({wave_score:.1f}) + 0.05·Access({acc_score:.1f})"
    )

    return SuitabilityBreakdown(
        zone_id=zone.zone_id,
        total_score=total_score,
        pfz_contribution=round(c_pfz, 2),
        chlorophyll_contribution=round(c_chl, 2),
        sst_contribution=round(c_sst, 2),
        wind_contribution=round(c_wind, 2),
        wave_contribution=round(c_wave, 2),
        accessibility_contribution=round(c_acc, 2),
        formula_explanation=formula_str
    )

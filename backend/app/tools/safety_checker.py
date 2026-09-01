"""
Safety Architecture & Deterministic Veto Engine
Validates active official warnings, cyclone intersections, marine weather thresholds, and data freshness.
"""

from datetime import datetime, timezone
from typing import List, Tuple
from app.config import MAX_SAFE_WIND_KNOTS, MAX_SAFE_WAVE_M, DATA_FRESHNESS_MAX_HOURS
from app.models.ocean import PFZCandidateZone
from app.models.hazard import MarineWeather, HazardWarning
from app.models.request import SafetyEvaluation
from app.tools.spatial_engine import is_point_in_bbox


def check_safety(
    candidate: PFZCandidateZone,
    weather: MarineWeather,
    active_warnings: List[HazardWarning]
) -> SafetyEvaluation:
    """
    Perform deterministic safety verification against candidate fishing zones.
    If a safety veto triggers, suppress positive fishing recommendations and explain why.
    """
    veto_triggered = False
    veto_reasons: List[str] = []
    matched_warnings: List[HazardWarning] = []
    risk_level = "LOW"

    # 1. Check official hazard warning bounding box intersections
    for warning in active_warnings:
        if is_point_in_bbox(candidate.center_lat, candidate.center_lon, warning.bounding_box):
            matched_warnings.append(warning)
            if warning.severity in ["RED", "ORANGE"] or warning.warning_type in ["CYCLONE", "GALE_WIND"]:
                veto_triggered = True
                risk_level = "SEVERE" if warning.severity == "RED" else "HIGH"
                veto_reasons.append(
                    f"Official {warning.severity} Advisory ({warning.warning_type}): {warning.title} active in sector."
                )
            elif warning.severity == "YELLOW":
                if risk_level == "LOW":
                    risk_level = "MODERATE"

    # 2. Check marine weather operating thresholds
    if weather.wind_speed_knots > MAX_SAFE_WIND_KNOTS:
        veto_triggered = True
        risk_level = "HIGH" if risk_level != "SEVERE" else "SEVERE"
        veto_reasons.append(
            f"Wind speed threshold exceeded: {weather.wind_speed_knots:.1f} knots (Maximum safe threshold: {MAX_SAFE_WIND_KNOTS} knots)."
        )

    if weather.wave_height_m > MAX_SAFE_WAVE_M:
        veto_triggered = True
        risk_level = "HIGH" if risk_level != "SEVERE" else "SEVERE"
        veto_reasons.append(
            f"Wave height threshold exceeded: {weather.wave_height_m:.1f} meters (Maximum safe threshold: {MAX_SAFE_WAVE_M} meters)."
        )

    # 3. Check critical data freshness
    # For demo/mock handling, compare fetched_at with now or valid_until
    freshness_acceptable = True
    # If valid_until is past, mark stale
    now_utc = datetime.now(timezone.utc)
    if candidate.valid_until.tzinfo is None:
        valid_until_utc = candidate.valid_until.replace(tzinfo=timezone.utc)
    else:
        valid_until_utc = candidate.valid_until

    if now_utc > valid_until_utc:
        freshness_acceptable = False
        veto_reasons.append("Candidate advisory dataset has expired past its valid time window.")

    # Determine final safe state
    is_safe = not veto_triggered

    if is_safe:
        if risk_level == "LOW":
            summary = "Marine conditions are safe for navigation and fishing operations."
        else:
            summary = "Marine conditions are acceptable with moderate sea surge; proceed with caution."
    else:
        summary = f"SAFETY VETO ACTIVE: Marine operations prohibited due to {len(veto_reasons)} critical risk factors."

    return SafetyEvaluation(
        is_safe=is_safe,
        veto_triggered=veto_triggered,
        risk_level=risk_level,
        veto_reasons=veto_reasons,
        warnings_found=matched_warnings,
        freshness_acceptable=freshness_acceptable,
        safety_summary=summary
    )

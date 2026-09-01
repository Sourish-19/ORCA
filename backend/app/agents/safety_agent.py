"""
Safety Specialist Agent
Deterministic Veto Authority.
Evaluates active hazard warnings, cyclone tracks, weather thresholds, and data freshness.
Can suppress positive fishing recommendations if safety check fails.
"""

from typing import List
from app.models.ocean import PFZCandidateZone
from app.models.hazard import MarineWeather, HazardWarning
from app.models.request import SafetyEvaluation
from app.tools.safety_checker import check_safety


def run_safety_agent(
    candidate: PFZCandidateZone,
    weather: MarineWeather,
    active_warnings: List[HazardWarning]
) -> SafetyEvaluation:
    """
    Independently verify safety and trigger veto if unsafe.
    """
    return check_safety(candidate, weather, active_warnings)

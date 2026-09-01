"""
Reasoning Specialist Agent
Performs spatial joins, temporal alignment, and multi-factor suitability scoring.
"""

from typing import List, Optional, Tuple
from app.models.ocean import PFZCandidateZone, SSTObservation, ChlorophyllObservation
from app.models.hazard import MarineWeather
from app.models.request import SuitabilityBreakdown
from app.tools.suitability import calculate_suitability


def run_reasoning_agent(
    candidate_zones: List[PFZCandidateZone],
    sst: SSTObservation,
    chl: ChlorophyllObservation,
    weather: MarineWeather
) -> Tuple[Optional[PFZCandidateZone], Optional[SuitabilityBreakdown], List[PFZCandidateZone]]:
    """
    Evaluate candidate fishing zones and select top recommendation based on transparent suitability score.
    """
    if not candidate_zones:
        return None, None, []

    scored_candidates = []
    for zone in candidate_zones:
        breakdown = calculate_suitability(zone, sst, chl, weather)
        scored_candidates.append((zone, breakdown))

    # Sort by total suitability score descending
    scored_candidates.sort(key=lambda item: item[1].total_score, reverse=True)

    top_zone, top_breakdown = scored_candidates[0]
    all_zones = [item[0] for item in scored_candidates]

    return top_zone, top_breakdown, all_zones

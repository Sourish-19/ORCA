"""
Hazard Specialist Agent
Retrieves IMD marine weather, wave height forecasts, cyclone tracks, and active official warnings.
"""

from typing import List, Tuple
from app.models.ocean import GeoLocation
from app.models.hazard import MarineWeather, HazardWarning
from app.models.trace import EvidenceRecord
from app.ingestion.imd import fetch_marine_weather, fetch_hazard_warnings


def run_hazard_agent(location: GeoLocation) -> Tuple[MarineWeather, List[HazardWarning], List[EvidenceRecord]]:
    """
    Fetch weather and active hazard warnings for location.
    """
    weather, weather_mode = fetch_marine_weather(location.latitude, location.longitude)
    warnings = fetch_hazard_warnings()

    evidence_list: List[EvidenceRecord] = []

    # Weather Evidence
    evidence_list.append(EvidenceRecord(
        id="ev_weather_01",
        agent_name="Hazard Agent",
        source_name="IMD Marine Weather",
        record_type="Weather Observation",
        claim=f"IMD forecast: Wind speed {weather.wind_speed_knots:.1f} knots, Significant Wave Height {weather.wave_height_m:.1f} meters.",
        timestamp=weather.timestamp,
        freshness_hours=2.0,
        data_mode=weather_mode,
        confidence_score=0.95
    ))

    # Warnings Evidence
    if warnings:
        for idx, w in enumerate(warnings):
            evidence_list.append(EvidenceRecord(
                id=f"ev_warn_{idx+1}",
                agent_name="Hazard Agent",
                source_name=w.source,
                record_type=f"Official Advisory ({w.severity})",
                claim=f"{w.title}: {w.description}",
                timestamp=w.issued_at,
                freshness_hours=1.5,
                data_mode="LIVE",
                confidence_score=0.98
            ))

    return weather, warnings, evidence_list

"""
Unit Test - Fishing Suitability Formula
"""

from datetime import datetime, timezone
import pytest
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.models.ocean import PFZCandidateZone, SSTObservation, ChlorophyllObservation
from app.models.hazard import MarineWeather
from app.tools.suitability import calculate_suitability


def test_suitability_calculation():
    zone = PFZCandidateZone(
        zone_id="test_01",
        sector_name="Test Sector",
        center_lat=13.185,
        center_lon=80.621,
        depth_m=45.0,
        bearing_deg=85.0,
        distance_km=25.0,
        nearest_landing_centre="Kasimedu",
        valid_from=datetime.now(timezone.utc),
        valid_until=datetime.now(timezone.utc),
        strength_score=85.0,
        source="INCOIS",
        fetched_at=datetime.now(timezone.utc)
    )

    sst = SSTObservation(
        timestamp=datetime.now(timezone.utc), latitude=13.185, longitude=80.621, sst_celsius=28.4, source="MOSDAC"
    )

    chl = ChlorophyllObservation(
        timestamp=datetime.now(timezone.utc), latitude=13.185, longitude=80.621, concentration_mg_m3=1.8, source="MOSDAC"
    )

    weather = MarineWeather(
        timestamp=datetime.now(timezone.utc),
        location_name="Test Sector",
        latitude=13.185,
        longitude=80.621,
        wind_speed_knots=10.0,
        wind_direction_deg=120.0,
        wave_height_m=1.0,
        wave_period_sec=7.0,
        visibility_km=10.0,
        sea_surface_pressure_hpa=1012.0,
        valid_until=datetime.now(timezone.utc),
        source="IMD"
    )

    breakdown = calculate_suitability(zone, sst, chl, weather)

    assert breakdown.total_score > 75.0
    assert breakdown.pfz_contribution == pytest.approx(0.35 * 85.0, 0.1)
    assert breakdown.zone_id == "test_01"

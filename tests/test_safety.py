"""
Unit Test - Deterministic Safety Engine & Veto Triggers
"""

from datetime import datetime, timedelta, timezone
import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.models.ocean import PFZCandidateZone
from app.models.hazard import MarineWeather, HazardWarning
from app.tools.safety_checker import check_safety


def test_safety_pass_clear_weather():
    zone = PFZCandidateZone(
        zone_id="safe_z1", sector_name="Safe Zone", center_lat=13.0, center_lon=80.3,
        depth_m=30.0, bearing_deg=90.0, distance_km=15.0, nearest_landing_centre="Harbour",
        valid_from=datetime.now(timezone.utc), valid_until=datetime.now(timezone.utc) + timedelta(hours=24),
        strength_score=80.0, fetched_at=datetime.now(timezone.utc)
    )

    weather = MarineWeather(
        timestamp=datetime.now(timezone.utc), location_name="Safe Zone", latitude=13.0, longitude=80.3,
        wind_speed_knots=12.0, wind_direction_deg=100.0, wave_height_m=1.1, wave_period_sec=6.0,
        visibility_km=10.0, sea_surface_pressure_hpa=1012.0, valid_until=datetime.now(timezone.utc) + timedelta(hours=24),
        source="IMD"
    )

    result = check_safety(zone, weather, [])
    assert result.is_safe is True
    assert result.veto_triggered is False
    assert result.risk_level == "LOW"


def test_safety_veto_high_wind():
    zone = PFZCandidateZone(
        zone_id="unsafe_z1", sector_name="High Wind Zone", center_lat=13.0, center_lon=80.3,
        depth_m=30.0, bearing_deg=90.0, distance_km=15.0, nearest_landing_centre="Harbour",
        valid_from=datetime.now(timezone.utc), valid_until=datetime.now(timezone.utc) + timedelta(hours=24),
        strength_score=80.0, fetched_at=datetime.now(timezone.utc)
    )

    weather = MarineWeather(
        timestamp=datetime.now(timezone.utc), location_name="High Wind Zone", latitude=13.0, longitude=80.3,
        wind_speed_knots=30.0,  # > 25 knots threshold
        wind_direction_deg=100.0, wave_height_m=1.5, wave_period_sec=6.0,
        visibility_km=6.0, sea_surface_pressure_hpa=1005.0, valid_until=datetime.now(timezone.utc) + timedelta(hours=24),
        source="IMD"
    )

    result = check_safety(zone, weather, [])
    assert result.is_safe is False
    assert result.veto_triggered is True
    assert "Wind speed threshold exceeded" in result.veto_reasons[0]


def test_safety_veto_cyclone_warning_intersection():
    zone = PFZCandidateZone(
        zone_id="cyclone_z1", sector_name="Vizag Zone", center_lat=17.5, center_lon=83.5,
        depth_m=40.0, bearing_deg=120.0, distance_km=25.0, nearest_landing_centre="Vizag Harbour",
        valid_from=datetime.now(timezone.utc), valid_until=datetime.now(timezone.utc) + timedelta(hours=24),
        strength_score=90.0, fetched_at=datetime.now(timezone.utc)
    )

    weather = MarineWeather(
        timestamp=datetime.now(timezone.utc), location_name="Vizag Zone", latitude=17.5, longitude=83.5,
        wind_speed_knots=15.0, wind_direction_deg=100.0, wave_height_m=1.2, wave_period_sec=6.0,
        visibility_km=8.0, sea_surface_pressure_hpa=1008.0, valid_until=datetime.now(timezone.utc) + timedelta(hours=24),
        source="IMD"
    )

    cyclone_warning = HazardWarning(
        warning_id="warn_01", warning_type="CYCLONE", severity="RED",
        title="Severe Cyclone Warning", description="Gale winds approaching",
        affected_sector="Vizag Coast", bounding_box=[16.5, 82.5, 18.5, 84.5],
        valid_from=datetime.now(timezone.utc), valid_until=datetime.now(timezone.utc) + timedelta(hours=48),
        source="IMD", issued_at=datetime.now(timezone.utc)
    )

    result = check_safety(zone, weather, [cyclone_warning])
    assert result.is_safe is False
    assert result.veto_triggered is True
    assert result.risk_level == "SEVERE"

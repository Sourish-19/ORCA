"""
Unit Tests for ORCA Normalized Data Models
Validates instantiation, typing, missing value representation, and zero-synthetic enforcement
across all 5 authentic data sources.
"""

from datetime import datetime, date, timezone
import pytest
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.models.ocean import (
    CommonMetadata,
    NormalizedPFZRecord,
    NormalizedSSTRecord,
    NormalizedChlorophyllRecord,
    LandingCentre
)
from app.models.hazard import (
    NormalizedMarineWeather,
    NormalizedHazardWarning,
    NormalizedEnvironmentalSnapshot
)


def test_normalized_pfz_instantiation():
    """Test authentic INCOIS PFZ record without synthetic score fields."""
    meta = CommonMetadata(
        source="INCOIS",
        source_product="Potential Fishing Zone Advisory (SEC007)",
        dataset_id="SEC007_North_Tamil_Nadu",
        observation_time=datetime(2026, 9, 1, 0, 0, tzinfo=timezone.utc),
        validity_start=datetime(2026, 9, 1, 6, 0, tzinfo=timezone.utc),
        validity_end=datetime(2026, 9, 2, 18, 30, tzinfo=timezone.utc),
        geographic_area="North Tamil Nadu Coast",
        synthetic=False
    )

    record = NormalizedPFZRecord(
        landing_centre="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        sector_id="SEC007",
        direction="ENE",
        bearing_deg=67.0,
        distance_range_km=(35.0, 45.0),
        depth_range_m=(40.0, 50.0),
        latitude_dd=13.0175,
        longitude_dd=80.6331,
        raw_latitude_dms="13 01 03 N",
        raw_longitude_dms="80 38 00 E",
        metadata=meta
    )

    assert record.landing_centre == "Chennai"
    assert record.bearing_deg == 67.0
    assert record.latitude_dd == 13.0175
    assert record.longitude_dd == 80.6331
    assert record.metadata.synthetic is False
    # Verify no strength_score is required on NormalizedPFZRecord
    assert not hasattr(record, "strength_score")


def test_normalized_sst_valid_and_masked():
    """Test Copernicus SST for both valid ocean and land-masked points."""
    meta = CommonMetadata(
        source="Copernicus Marine",
        source_product="SST_GLO_PHY_L4_NRT_010_005",
        dataset_id="cmems_obs-sst_glo_phy-temp_nrt_P1D-m",
        observation_time=datetime(2026, 8, 31, 0, 0, tzinfo=timezone.utc),
        geographic_area="Chennai / Southwest Bay of Bengal",
        synthetic=False,
        data_freshness_note="Latest available SST observation is one day older than the INCOIS PFZ advisory."
    )

    # Valid ocean point
    ocean_point = NormalizedSSTRecord(
        latitude=13.125,
        longitude=80.375,
        sst_kelvin=302.09,
        sst_celsius=28.94,
        temperature_units="degC",
        is_land_masked=False,
        metadata=meta
    )
    assert ocean_point.sst_celsius == 28.94
    assert ocean_point.is_land_masked is False

    # Land-masked coastal point (None values must be preserved without default 0)
    land_point = NormalizedSSTRecord(
        latitude=13.125,
        longitude=80.125,
        sst_kelvin=None,
        sst_celsius=None,
        temperature_units="degC",
        is_land_masked=True,
        metadata=meta
    )
    assert land_point.sst_celsius is None
    assert land_point.is_land_masked is True


def test_normalized_chlorophyll_valid_and_masked():
    """Test Copernicus Chlorophyll-a for valid values and land mask."""
    meta = CommonMetadata(
        source="Copernicus Marine",
        source_product="OCEANCOLOUR_GLO_BGC_L4_NRT_009_102",
        dataset_id="cmems_obs-oc_glo_bgc-plankton_nrt_l4-gapfree-multi-4km_P1D",
        observation_time=datetime(2026, 8, 31, 0, 0, tzinfo=timezone.utc),
        geographic_area="Chennai / Southwest Bay of Bengal",
        synthetic=False
    )

    chl_point = NormalizedChlorophyllRecord(
        latitude=13.0208,
        longitude=80.3542,
        chlorophyll_value=0.3809,
        chlorophyll_units="milligram m-3",
        is_land_masked=False,
        metadata=meta
    )
    assert chl_point.chlorophyll_value == 0.3809
    assert chl_point.chlorophyll_units == "milligram m-3"
    assert chl_point.is_land_masked is False

    masked_point = NormalizedChlorophyllRecord(
        latitude=13.0208,
        longitude=80.0208,
        chlorophyll_value=None,
        chlorophyll_units="milligram m-3",
        is_land_masked=True,
        metadata=meta
    )
    assert masked_point.chlorophyll_value is None
    assert masked_point.is_land_masked is True


def test_normalized_marine_weather_instantiation():
    """Test IMD Coastal Weather Bulletin parameters."""
    meta = CommonMetadata(
        source="IMD RMC Chennai (ACWC)",
        source_product="Coastal Weather Bulletin for North Tamil Nadu Coast",
        observation_time=datetime(2026, 9, 1, 8, 0, tzinfo=timezone.utc),
        validity_start=datetime(2026, 9, 1, 10, 0, tzinfo=timezone.utc),
        validity_end=datetime(2026, 9, 1, 22, 0, tzinfo=timezone.utc),
        geographic_area="North Tamil Nadu Coast",
        synthetic=False
    )

    weather = NormalizedMarineWeather(
        coastal_sector="North Tamil Nadu Coast",
        wind_direction="Southwesterly / Southerly",
        wind_speed_knots_min=15.0,
        wind_speed_knots_max=20.0,
        gust_speed_knots=25.0,
        sea_condition="Generally Moderate, becoming Rough in gust",
        weather_condition="Isolated rain/thundershowers",
        visibility="Good, becoming poor in rain/thundershowers",
        port_warning="NIL",
        ocean_current_speed_m_s=(1.1, 1.4),
        metadata=meta
    )

    assert weather.wind_speed_knots_min == 15.0
    assert weather.wind_speed_knots_max == 20.0
    assert weather.gust_speed_knots == 25.0
    assert weather.port_warning == "NIL"
    assert weather.ocean_current_speed_m_s == (1.1, 1.4)


def test_normalized_hazard_and_cyclone_warning():
    """Test IMD Fishermen and Cyclone Warning representation."""
    meta = CommonMetadata(
        source="RSMC New Delhi / IMD",
        source_product="Tropical Weather Outlook & Cyclone Warning",
        observation_time=datetime(2026, 9, 1, 6, 0, tzinfo=timezone.utc),
        validity_start=datetime(2026, 9, 1, 6, 0, tzinfo=timezone.utc),
        validity_end=datetime(2026, 9, 8, 6, 0, tzinfo=timezone.utc),
        geographic_area="Southwest Bay of Bengal / Chennai",
        synthetic=False
    )

    cyclone_outlook = NormalizedHazardWarning(
        warning_type="CYCLONE_OUTLOOK",
        warning_level="NO_WARNING",
        affected_area="Southwest Bay of Bengal",
        fishermen_advised_not_to_venture=False,
        cyclone_active=False,
        cyclone_stage="WML",  # Well Marked Low inland over Bengal/Odisha
        cyclone_coordinates=None,
        cyclone_warning_active=False,
        seven_day_cyclogenesis_probability="NIL",
        description="No active cyclone in Southwest Bay of Bengal. Cyclogenesis probability is NIL.",
        metadata=meta
    )

    assert cyclone_outlook.cyclone_active is False
    assert cyclone_outlook.cyclone_warning_active is False
    assert cyclone_outlook.seven_day_cyclogenesis_probability == "NIL"
    assert cyclone_outlook.fishermen_advised_not_to_venture is False


def test_derived_environmental_snapshot():
    """Test the derived fusion snapshot container."""
    snapshot = NormalizedEnvironmentalSnapshot(
        snapshot_id="snap_chennai_01",
        target_date=date(2026, 9, 1),
        center_latitude=13.0175,
        center_longitude=80.6331,
        nearest_landing_centre="Chennai",
        is_synthetic=False,
        data_freshness_summary={
            "pfz": "Valid for 2026-09-01 -> 2026-09-02",
            "sst": "2026-08-31 observation",
            "chlorophyll": "2026-08-31 observation",
            "weather": "2026-09-01 08:00 UTC bulletin"
        }
    )

    assert snapshot.snapshot_id == "snap_chennai_01"
    assert snapshot.target_date == date(2026, 9, 1)
    assert snapshot.is_synthetic is False
    assert snapshot.data_freshness_summary["sst"] == "2026-08-31 observation"

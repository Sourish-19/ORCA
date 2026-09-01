"""
Unit Tests for Evidence Builder Service
Verifies deterministic spatial matching, land-mask rejection, geographic warning filtering,
temporal preservation, and zero-synthetic enforcement.
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
    NormalizedChlorophyllRecord
)
from app.models.hazard import (
    NormalizedMarineWeather,
    NormalizedHazardWarning
)
from app.models.evidence import (
    SpatialMatchMetadata,
    MatchedSST,
    MatchedChlorophyll,
    EvidenceBundle
)
from app.services.evidence_builder import (
    haversine_distance,
    find_nearest_valid_sst,
    find_nearest_valid_chlorophyll,
    is_warning_geographically_relevant,
    build_evidence_bundle
)


@pytest.fixture
def sample_pfz_anchor() -> NormalizedPFZRecord:
    meta = CommonMetadata(
        source="INCOIS",
        source_product="PFZ Advisory SEC007",
        dataset_id="SEC007",
        observation_time=datetime(2026, 9, 1, 0, 0, tzinfo=timezone.utc),
        validity_start=datetime(2026, 9, 1, 6, 0, tzinfo=timezone.utc),
        validity_end=datetime(2026, 9, 2, 18, 30, tzinfo=timezone.utc),
        geographic_area="North Tamil Nadu Coast",
        synthetic=False
    )
    return NormalizedPFZRecord(
        landing_centre="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        sector_id="SEC007",
        direction="SE",
        bearing_deg=107.0,
        distance_range_km=(36.0, 41.0),
        depth_range_m=(214.0, 219.0),
        latitude_dd=13.0175,
        longitude_dd=80.6331,
        raw_latitude_dms="13 1 3 N",
        raw_longitude_dms="80 37 59 E",
        metadata=meta
    )


@pytest.fixture
def sample_sst_records() -> list[NormalizedSSTRecord]:
    meta = CommonMetadata(
        source="Copernicus Marine",
        source_product="SST_GLO_PHY_L4_NRT_010_005",
        observation_time=datetime(2026, 8, 31, 0, 0, tzinfo=timezone.utc),
        geographic_area="Chennai / Southwest Bay of Bengal",
        synthetic=False
    )
    return [
        # Land masked point closer to coast
        NormalizedSSTRecord(
            latitude=13.0,
            longitude=80.3,
            sst_kelvin=None,
            sst_celsius=None,
            temperature_units="degC",
            is_land_masked=True,
            metadata=meta
        ),
        # Valid ocean point nearby
        NormalizedSSTRecord(
            latitude=13.125,
            longitude=80.625,
            sst_kelvin=302.31,
            sst_celsius=29.16,
            temperature_units="degC",
            is_land_masked=False,
            metadata=meta
        ),
        # Distant valid point
        NormalizedSSTRecord(
            latitude=14.125,
            longitude=81.125,
            sst_kelvin=302.50,
            sst_celsius=29.35,
            temperature_units="degC",
            is_land_masked=False,
            metadata=meta
        )
    ]


@pytest.fixture
def sample_chl_records() -> list[NormalizedChlorophyllRecord]:
    meta = CommonMetadata(
        source="Copernicus Marine",
        source_product="OCEANCOLOUR_GLO_BGC_L4_NRT_009_102",
        observation_time=datetime(2026, 8, 31, 0, 0, tzinfo=timezone.utc),
        geographic_area="Chennai / Southwest Bay of Bengal",
        synthetic=False
    )
    return [
        # Land masked coastal point
        NormalizedChlorophyllRecord(
            latitude=13.0208,
            longitude=80.2500,
            chlorophyll_value=None,
            chlorophyll_units="milligram m-3",
            is_land_masked=True,
            metadata=meta
        ),
        # Valid close ocean point
        NormalizedChlorophyllRecord(
            latitude=13.0208,
            longitude=80.6458,
            chlorophyll_value=0.2293,
            chlorophyll_units="milligram m-3",
            is_land_masked=False,
            metadata=meta
        )
    ]


# 1. Test PFZ -> Nearest valid SST match
def test_nearest_valid_sst_match(sample_pfz_anchor, sample_sst_records):
    matched = find_nearest_valid_sst(
        sample_pfz_anchor.latitude_dd,
        sample_pfz_anchor.longitude_dd,
        sample_sst_records,
        max_distance_km=60.0
    )
    assert matched.record is not None
    assert matched.record.sst_celsius == 29.16
    assert matched.spatial_match is not None
    assert matched.spatial_match.distance_km < 15.0
    assert matched.spatial_match.matching_method == "nearest_valid_grid_point"


# 2. Test PFZ -> Nearest valid CHL match
def test_nearest_valid_chl_match(sample_pfz_anchor, sample_chl_records):
    matched = find_nearest_valid_chlorophyll(
        sample_pfz_anchor.latitude_dd,
        sample_pfz_anchor.longitude_dd,
        sample_chl_records,
        max_distance_km=30.0
    )
    assert matched.record is not None
    assert matched.record.chlorophyll_value == 0.2293
    assert matched.spatial_match is not None
    assert matched.spatial_match.distance_km < 5.0


# 3. Test Land-masked SST is strictly rejected
def test_land_masked_sst_is_rejected(sample_pfz_anchor):
    meta = CommonMetadata(
        source="Copernicus Marine",
        source_product="SST",
        observation_time=datetime(2026, 8, 31, tzinfo=timezone.utc),
        geographic_area="Chennai",
        synthetic=False
    )
    # Only land-masked points available right at the coordinate
    only_masked = [
        NormalizedSSTRecord(
            latitude=sample_pfz_anchor.latitude_dd,
            longitude=sample_pfz_anchor.longitude_dd,
            sst_kelvin=None,
            sst_celsius=None,
            temperature_units="degC",
            is_land_masked=True,
            metadata=meta
        )
    ]
    matched = find_nearest_valid_sst(
        sample_pfz_anchor.latitude_dd,
        sample_pfz_anchor.longitude_dd,
        only_masked
    )
    assert matched.record is None
    assert matched.spatial_match is None


# 4. Test Land-masked Chlorophyll is strictly rejected
def test_land_masked_chl_is_rejected(sample_pfz_anchor):
    meta = CommonMetadata(
        source="Copernicus Marine",
        source_product="CHL",
        observation_time=datetime(2026, 8, 31, tzinfo=timezone.utc),
        geographic_area="Chennai",
        synthetic=False
    )
    only_masked = [
        NormalizedChlorophyllRecord(
            latitude=sample_pfz_anchor.latitude_dd,
            longitude=sample_pfz_anchor.longitude_dd,
            chlorophyll_value=None,
            chlorophyll_units="milligram m-3",
            is_land_masked=True,
            metadata=meta
        )
    ]
    matched = find_nearest_valid_chlorophyll(
        sample_pfz_anchor.latitude_dd,
        sample_pfz_anchor.longitude_dd,
        only_masked
    )
    assert matched.record is None
    assert matched.spatial_match is None


# 5. Test No valid nearby observation returns NULL / None
def test_no_valid_nearby_observation_returns_null(sample_pfz_anchor):
    meta = CommonMetadata(
        source="Copernicus Marine",
        source_product="SST",
        observation_time=datetime(2026, 8, 31, tzinfo=timezone.utc),
        geographic_area="Arabian Sea",
        synthetic=False
    )
    # Far away point in Arabian Sea (lat 15.0, lon 72.0)
    distant_records = [
        NormalizedSSTRecord(
            latitude=15.0,
            longitude=72.0,
            sst_kelvin=301.0,
            sst_celsius=27.85,
            temperature_units="degC",
            is_land_masked=False,
            metadata=meta
        )
    ]
    matched = find_nearest_valid_sst(
        sample_pfz_anchor.latitude_dd,
        sample_pfz_anchor.longitude_dd,
        distant_records,
        max_distance_km=60.0  # Max distance limit
    )
    assert matched.record is None
    assert matched.spatial_match is None


# 6. Test Correct IMD weather is attached to North Tamil Nadu
def test_correct_imd_weather_attached(sample_pfz_anchor, sample_sst_records, sample_chl_records):
    meta = CommonMetadata(
        source="IMD ACWC Chennai",
        source_product="Coastal Bulletin North TN",
        observation_time=datetime(2026, 9, 1, 8, 0, tzinfo=timezone.utc),
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
        visibility="Good",
        port_warning="NIL",
        metadata=meta
    )

    bundle = build_evidence_bundle(
        pfz_record=sample_pfz_anchor,
        sst_records=sample_sst_records,
        chl_records=sample_chl_records,
        marine_weather=weather,
        all_warnings=[]
    )

    assert bundle.marine_weather is not None
    assert bundle.marine_weather.coastal_sector == "North Tamil Nadu Coast"
    assert bundle.marine_weather.wind_speed_knots_min == 15.0
    assert bundle.marine_weather.wind_speed_knots_max == 20.0


# 7. Test Irrelevant geographic warning is not attached
def test_irrelevant_geographic_warning_is_filtered_out(sample_pfz_anchor, sample_sst_records, sample_chl_records):
    south_tn_meta = CommonMetadata(
        source="IMD RMC Chennai",
        source_product="South TN Fishermen Warning",
        observation_time=datetime(2026, 9, 1, 20, 30, tzinfo=timezone.utc),
        geographic_area="South Tamil Nadu Coast",
        synthetic=False
    )
    south_warning = NormalizedHazardWarning(
        warning_type="FISHERMEN_WARNING",
        warning_level="STRICT_PROHIBITION",
        affected_area="South Tamil Nadu Coast, Gulf of Mannar and Comorin Area",
        fishermen_advised_not_to_venture=True,
        description="Squally wind 45-55 kmph gusting to 65 kmph",
        metadata=south_tn_meta
    )

    chennai_meta = CommonMetadata(
        source="IMD / INCOIS",
        source_product="Currents Alert",
        observation_time=datetime(2026, 9, 1, 8, 0, tzinfo=timezone.utc),
        geographic_area="North Tamil Nadu",
        synthetic=False
    )
    chennai_warning = NormalizedHazardWarning(
        warning_type="OCEAN_CURRENT",
        warning_level="ADVISORY_CAUTION",
        affected_area="Royapuram to Pulicat (Thiruvallur / Chennai Coast)",
        fishermen_advised_not_to_venture=False,
        description="Surface current 1.1-1.4 m/s",
        metadata=chennai_meta
    )

    bundle = build_evidence_bundle(
        pfz_record=sample_pfz_anchor,
        sst_records=sample_sst_records,
        chl_records=sample_chl_records,
        marine_weather=None,
        all_warnings=[south_warning, chennai_warning]
    )

    # South TN warning must be filtered out, Chennai warning must remain
    assert len(bundle.applicable_warnings) == 1
    assert bundle.applicable_warnings[0].warning_type == "OCEAN_CURRENT"
    assert "Royapuram to Pulicat" in bundle.applicable_warnings[0].affected_area


# 8. Test Evidence timestamps remain intact
def test_evidence_timestamps_intact(sample_pfz_anchor, sample_sst_records, sample_chl_records):
    bundle = build_evidence_bundle(
        pfz_record=sample_pfz_anchor,
        sst_records=sample_sst_records,
        chl_records=sample_chl_records,
        marine_weather=None,
        all_warnings=[]
    )

    assert bundle.pfz.metadata.validity_start == datetime(2026, 9, 1, 6, 0, tzinfo=timezone.utc)
    assert bundle.pfz.metadata.validity_end == datetime(2026, 9, 2, 18, 30, tzinfo=timezone.utc)
    assert bundle.sst.record.metadata.observation_time == datetime(2026, 8, 31, 0, 0, tzinfo=timezone.utc)
    assert bundle.chlorophyll.record.metadata.observation_time == datetime(2026, 8, 31, 0, 0, tzinfo=timezone.utc)
    assert "2026-08-31" in bundle.freshness_summary["temporal_lag_note"]


# 9. Test PFZ remains the anchor location
def test_pfz_remains_anchor_location(sample_pfz_anchor, sample_sst_records, sample_chl_records):
    bundle = build_evidence_bundle(
        pfz_record=sample_pfz_anchor,
        sst_records=sample_sst_records,
        chl_records=sample_chl_records,
        marine_weather=None,
        all_warnings=[]
    )

    assert bundle.pfz.latitude_dd == 13.0175
    assert bundle.pfz.longitude_dd == 80.6331
    assert bundle.sst.spatial_match.pfz_coordinate == (13.0175, 80.6331)
    assert bundle.chlorophyll.spatial_match.pfz_coordinate == (13.0175, 80.6331)


# 10. Test No synthetic values are generated
def test_no_synthetic_values_generated(sample_pfz_anchor, sample_sst_records, sample_chl_records):
    bundle = build_evidence_bundle(
        pfz_record=sample_pfz_anchor,
        sst_records=sample_sst_records,
        chl_records=sample_chl_records,
        marine_weather=None,
        all_warnings=[]
    )

    assert bundle.is_synthetic is False
    assert not hasattr(bundle, "suitability_score")
    assert not hasattr(bundle, "safety_score")
    assert not hasattr(bundle, "confidence_score")
    assert not hasattr(bundle, "fishing_probability")

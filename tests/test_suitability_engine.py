"""
Unit Tests for ORCA Suitability Engine Service
Validates deterministic ORCA Suitability Index (OSI) calculation, threshold configuration,
spatial scaling, missing data handling, safety isolation, and multi-candidate ranking.
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
from app.models.suitability import (
    SuitabilityConfig,
    ComponentEvidence,
    SuitabilityAssessment
)
from app.services.suitability_engine import (
    evaluate_evidence_bundle,
    rank_suitability_assessments,
    evaluate_and_rank_all
)
from app.services.evidence_builder import (
    build_evidence_bundle,
    load_processed_pfz_records,
    load_processed_sst_records,
    load_processed_chlorophyll_records,
    get_default_chennai_marine_weather,
    get_default_chennai_hazard_warnings
)


@pytest.fixture
def base_evidence_bundle() -> EvidenceBundle:
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
    pfz = NormalizedPFZRecord(
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
    sst_meta = CommonMetadata(
        source="Copernicus Marine",
        source_product="SST_GLO_PHY_L4_NRT_010_005",
        observation_time=datetime(2026, 8, 31, tzinfo=timezone.utc),
        geographic_area="Chennai",
        synthetic=False
    )
    sst_rec = NormalizedSSTRecord(
        latitude=13.125,
        longitude=80.625,
        sst_kelvin=302.31,
        sst_celsius=29.16,
        temperature_units="degC",
        is_land_masked=False,
        metadata=sst_meta
    )
    sst_match = SpatialMatchMetadata(
        source_coordinate=(13.125, 80.625),
        pfz_coordinate=(13.0175, 80.6331),
        distance_km=11.986,
        matching_method="nearest_valid_grid_point",
        valid_observation=True
    )
    chl_meta = CommonMetadata(
        source="Copernicus Marine",
        source_product="OCEANCOLOUR_GLO_BGC_L4_NRT_009_102",
        observation_time=datetime(2026, 8, 31, tzinfo=timezone.utc),
        geographic_area="Chennai",
        synthetic=False
    )
    chl_rec = NormalizedChlorophyllRecord(
        latitude=13.0208,
        longitude=80.6458,
        chlorophyll_value=0.2293,
        chlorophyll_units="milligram m-3",
        is_land_masked=False,
        metadata=chl_meta
    )
    chl_match = SpatialMatchMetadata(
        source_coordinate=(13.0208, 80.6458),
        pfz_coordinate=(13.0175, 80.6331),
        distance_km=1.424,
        matching_method="nearest_valid_grid_point",
        valid_observation=True
    )

    return EvidenceBundle(
        bundle_id="evidence_chennai_107deg",
        target_date=date(2026, 9, 1),
        pfz=pfz,
        sst=MatchedSST(record=sst_rec, spatial_match=sst_match),
        chlorophyll=MatchedChlorophyll(record=chl_rec, spatial_match=chl_match),
        marine_weather=None,
        applicable_warnings=[],
        freshness_summary={"pfz": "Valid 2026-09-01 -> 2026-09-02"},
        is_synthetic=False
    )


# 1. Test official PFZ receives baseline score
def test_pfz_baseline_score(base_evidence_bundle):
    assessment = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment.component_evidence.pfz_base_score == 50.0
    assert assessment.orca_suitability_index >= 50.0


# 2. Test CHL scoring follows configured thresholds
def test_chl_threshold_scoring(base_evidence_bundle):
    # Optimal band (0.30 - 2.00) -> 25 pts
    base_evidence_bundle.chlorophyll.record.chlorophyll_value = 0.85
    assessment = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment.component_evidence.chlorophyll_raw_score == 25.0

    # Moderate low band (0.15 - 0.30) -> 15 pts
    base_evidence_bundle.chlorophyll.record.chlorophyll_value = 0.22
    assessment = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment.component_evidence.chlorophyll_raw_score == 15.0

    # Marginal band (< 0.15) -> 5 pts
    base_evidence_bundle.chlorophyll.record.chlorophyll_value = 0.08
    assessment = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment.component_evidence.chlorophyll_raw_score == 5.0


# 3. Test SST scoring follows configured thresholds
def test_sst_threshold_scoring(base_evidence_bundle):
    # Optimal band (28.5 - 29.4) -> 15 pts
    base_evidence_bundle.sst.record.sst_celsius = 29.16
    assessment = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment.component_evidence.sst_raw_score == 15.0

    # Acceptable band (28.0 - 28.5) -> 10 pts
    base_evidence_bundle.sst.record.sst_celsius = 28.25
    assessment = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment.component_evidence.sst_raw_score == 10.0

    # Marginal band (> 29.8) -> 3 pts
    base_evidence_bundle.sst.record.sst_celsius = 30.50
    assessment = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment.component_evidence.sst_raw_score == 3.0


# 4. Test spatial proximity multiplier works
def test_spatial_proximity_multiplier(base_evidence_bundle):
    # Chlorophyll within 5 km -> full 1.0 multiplier
    base_evidence_bundle.chlorophyll.record.chlorophyll_value = 0.85  # 25 raw
    base_evidence_bundle.chlorophyll.spatial_match.distance_km = 3.0
    assessment1 = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment1.component_evidence.chlorophyll_score == 25.0

    # Chlorophyll at 20 km -> penalty applied (excess = 15 km -> mult = max(0.5, 1.0 - 15/25) = 0.5 -> 25.0 * 0.5 = 12.5)
    base_evidence_bundle.chlorophyll.spatial_match.distance_km = 20.0
    assessment2 = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment2.component_evidence.chlorophyll_score < 25.0
    assert assessment2.component_evidence.chlorophyll_score == pytest.approx(12.5, 0.1)


# 5. Test accessibility scoring works
def test_accessibility_scoring(base_evidence_bundle):
    # Inshore: distance 10-15 km (avg 12.5 km <= 20) -> 10 pts
    base_evidence_bundle.pfz.distance_range_km = (10.0, 15.0)
    assessment1 = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment1.component_evidence.accessibility_score == 10.0

    # Mid-range: distance 25-30 km (avg 27.5 km <= 35) -> 7 pts
    base_evidence_bundle.pfz.distance_range_km = (25.0, 30.0)
    assessment2 = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment2.component_evidence.accessibility_score == 7.0

    # Offshore: distance 36-41 km (avg 38.5 km > 35) -> 4 pts
    base_evidence_bundle.pfz.distance_range_km = (36.0, 41.0)
    assessment3 = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment3.component_evidence.accessibility_score == 4.0


# 6. Test missing CHL does not become zero-valued data
def test_missing_chl_preserves_none(base_evidence_bundle):
    base_evidence_bundle.chlorophyll = MatchedChlorophyll(record=None, spatial_match=None)
    assessment = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment.component_evidence.chlorophyll_score == 0.0
    assert assessment.component_evidence.chlorophyll_value is None
    assert any("Chlorophyll-a observation unavailable" in f for f in assessment.limiting_factors)


# 7. Test missing SST does not become zero-valued data
def test_missing_sst_preserves_none(base_evidence_bundle):
    base_evidence_bundle.sst = MatchedSST(record=None, spatial_match=None)
    assessment = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment.component_evidence.sst_score == 0.0
    assert assessment.component_evidence.sst_value_celsius is None
    assert any("SST observation unavailable" in f for f in assessment.limiting_factors)


# 8. Test deterministic reproducibility
def test_deterministic_reproducibility(base_evidence_bundle):
    res1 = evaluate_evidence_bundle(base_evidence_bundle)
    res2 = evaluate_evidence_bundle(base_evidence_bundle)
    assert res1.orca_suitability_index == res2.orca_suitability_index
    assert res1.component_evidence.model_dump() == res2.component_evidence.model_dump()


# 9. Test multiple candidates rank deterministically
def test_multi_candidate_ranking(base_evidence_bundle):
    import copy
    bundle1 = copy.deepcopy(base_evidence_bundle)
    bundle1.pfz.landing_centre = "Chennai-High"
    bundle1.chlorophyll.record.chlorophyll_value = 0.85  # 25 pts -> OSI ~ 94

    bundle2 = copy.deepcopy(base_evidence_bundle)
    bundle2.pfz.landing_centre = "Chennai-Mid"
    bundle2.chlorophyll.record.chlorophyll_value = 0.22  # 15 pts -> OSI ~ 84

    bundle3 = copy.deepcopy(base_evidence_bundle)
    bundle3.pfz.landing_centre = "Chennai-Baseline"
    bundle3.chlorophyll = MatchedChlorophyll(record=None, spatial_match=None)  # 0 pts -> OSI ~ 69

    ranked = evaluate_and_rank_all([bundle2, bundle3, bundle1])
    assert len(ranked) == 3
    assert ranked[0].landing_centre == "Chennai-High"
    assert ranked[1].landing_centre == "Chennai-Mid"
    assert ranked[2].landing_centre == "Chennai-Baseline"
    assert ranked[0].orca_suitability_index > ranked[1].orca_suitability_index > ranked[2].orca_suitability_index


# 10. Test no safety information changes suitability
def test_safety_isolation(base_evidence_bundle):
    # Assessment without warnings
    res_clean = evaluate_evidence_bundle(base_evidence_bundle)

    # Attach severe cyclone warning into bundle
    cyclone_meta = CommonMetadata(
        source="IMD",
        source_product="Cyclone Warning",
        geographic_area="Bay of Bengal",
        synthetic=False
    )
    severe_warning = NormalizedHazardWarning(
        warning_type="CYCLONE_WARNING",
        warning_level="RED_ALERT",
        affected_area="Chennai Coast",
        fishermen_advised_not_to_venture=True,
        cyclone_active=True,
        cyclone_stage="Cyclonic Storm",
        description="Severe cyclonic storm approaching",
        metadata=cyclone_meta
    )
    base_evidence_bundle.applicable_warnings.append(severe_warning)

    res_with_warning = evaluate_evidence_bundle(base_evidence_bundle)
    # Suitability score and level must remain 100% identical
    assert res_clean.orca_suitability_index == res_with_warning.orca_suitability_index
    assert res_clean.suitability_level == res_with_warning.suitability_level


# 11. Test no LLM is called and is_synthetic is False
def test_no_synthetic_or_llm_flags(base_evidence_bundle):
    assessment = evaluate_evidence_bundle(base_evidence_bundle)
    assert assessment.is_synthetic is False
    assert assessment.methodology_name == "ORCA Prototype Environmental Heuristic v1"


# 12. Integration test on actual Chennai EvidenceBundle
def test_real_chennai_example_integration():
    pfz_path = str(Path(__file__).resolve().parent.parent / "data" / "processed" / "chennai" / "pfz.json")
    sst_path = str(Path(__file__).resolve().parent.parent / "data" / "processed" / "chennai" / "sst.json")
    chl_path = str(Path(__file__).resolve().parent.parent / "data" / "processed" / "chennai" / "chlorophyll.json")

    pfz_records = load_processed_pfz_records(pfz_path)
    sst_records = load_processed_sst_records(sst_path)
    chl_records = load_processed_chlorophyll_records(chl_path)
    marine_weather = get_default_chennai_marine_weather()
    all_warnings = get_default_chennai_hazard_warnings()

    chennai_records = [r for r in pfz_records if r.landing_centre.lower() == "chennai"]
    primary_pfz = chennai_records[0]

    bundle = build_evidence_bundle(
        pfz_record=primary_pfz,
        sst_records=sst_records,
        chl_records=chl_records,
        marine_weather=marine_weather,
        all_warnings=all_warnings
    )

    assessment = evaluate_evidence_bundle(bundle)

    # Verify exact values from approved methodology
    assert assessment.component_evidence.pfz_base_score == 50.0
    assert assessment.component_evidence.chlorophyll_score == 15.0
    assert assessment.component_evidence.sst_score == 15.0
    assert assessment.component_evidence.accessibility_score == 4.0
    assert assessment.orca_suitability_index == 84.0
    assert assessment.suitability_level == "HIGH"

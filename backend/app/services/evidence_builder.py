"""
Evidence Builder Service - Deterministic Data Fusion Layer for ORCA.

Associates an INCOIS PFZ anchor location with:
1. Nearest valid Copernicus SST observation (rejecting land-masked points)
2. Nearest valid Copernicus Chlorophyll-a observation (rejecting land-masked points)
3. Applicable IMD Coastal Marine Weather Bulletin
4. Geographically relevant IMD Fishermen & Cyclone Warnings
"""

import os
import json
import math
from datetime import datetime, date, timezone
from typing import List, Optional, Tuple, Dict, Any

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


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on the Earth in kilometers.
    """
    r = 6371.0  # Earth's mean radius in kilometers
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return round(r * c, 3)


def find_nearest_valid_sst(
    anchor_lat: float,
    anchor_lon: float,
    sst_records: List[NormalizedSSTRecord],
    max_distance_km: float = 60.0
) -> MatchedSST:
    """
    Find the nearest valid (non-land-masked) SST observation to the PFZ anchor.
    Returns MatchedSST with SpatialMatchMetadata, or empty MatchedSST if no valid point within max distance.
    """
    best_record: Optional[NormalizedSSTRecord] = None
    min_dist = float("inf")

    for rec in sst_records:
        # Strict rejection of land-masked or null temperature values
        if rec.is_land_masked or rec.sst_celsius is None:
            continue

        dist = haversine_distance(anchor_lat, anchor_lon, rec.latitude, rec.longitude)
        if dist < min_dist:
            min_dist = dist
            best_record = rec

    if best_record is not None and min_dist <= max_distance_km:
        match_meta = SpatialMatchMetadata(
            source_coordinate=(best_record.latitude, best_record.longitude),
            pfz_coordinate=(anchor_lat, anchor_lon),
            distance_km=min_dist,
            matching_method="nearest_valid_grid_point",
            valid_observation=True
        )
        return MatchedSST(record=best_record, spatial_match=match_meta)

    return MatchedSST(record=None, spatial_match=None)


def find_nearest_valid_chlorophyll(
    anchor_lat: float,
    anchor_lon: float,
    chl_records: List[NormalizedChlorophyllRecord],
    max_distance_km: float = 30.0
) -> MatchedChlorophyll:
    """
    Find the nearest valid (non-land-masked) Chlorophyll observation to the PFZ anchor.
    Returns MatchedChlorophyll with SpatialMatchMetadata, or empty MatchedChlorophyll if no valid point within max distance.
    """
    best_record: Optional[NormalizedChlorophyllRecord] = None
    min_dist = float("inf")

    for rec in chl_records:
        # Strict rejection of land-masked or null chlorophyll values
        if rec.is_land_masked or rec.chlorophyll_value is None:
            continue

        dist = haversine_distance(anchor_lat, anchor_lon, rec.latitude, rec.longitude)
        if dist < min_dist:
            min_dist = dist
            best_record = rec

    if best_record is not None and min_dist <= max_distance_km:
        match_meta = SpatialMatchMetadata(
            source_coordinate=(best_record.latitude, best_record.longitude),
            pfz_coordinate=(anchor_lat, anchor_lon),
            distance_km=min_dist,
            matching_method="nearest_valid_grid_point",
            valid_observation=True
        )
        return MatchedChlorophyll(record=best_record, spatial_match=match_meta)

    return MatchedChlorophyll(record=None, spatial_match=None)


def is_warning_geographically_relevant(
    warning: NormalizedHazardWarning,
    target_sector: str = "North Tamil Nadu Coast",
    target_district: str = "Chennai"
) -> bool:
    """
    Geographic filter: Ensures only warnings covering the target sector or basin are attached.
    Excludes warnings strictly isolated to South Tamil Nadu, Kerala, or distant marine zones.
    """
    area = warning.affected_area.lower()
    
    # Basin-wide or regional warnings relevant to North TN / Bay of Bengal
    relevant_keywords = [
        "north tamil nadu", "chennai", "thiruvallur", "kanchipuram", "chengalpattu",
        "southwest bay of bengal", "bay of bengal", "royapuram", "pulicat"
    ]
    
    # Exclude warnings strictly isolated to south/west coasts unless generic
    if any(k in area for k in relevant_keywords):
        return True
    
    return False


def build_evidence_bundle(
    pfz_record: NormalizedPFZRecord,
    sst_records: List[NormalizedSSTRecord],
    chl_records: List[NormalizedChlorophyllRecord],
    marine_weather: Optional[NormalizedMarineWeather] = None,
    all_warnings: Optional[List[NormalizedHazardWarning]] = None,
    bundle_id: Optional[str] = None,
    target_date: Optional[date] = None
) -> EvidenceBundle:
    """
    Construct an EvidenceBundle around a single INCOIS PFZ anchor location.
    Deterministically matches nearest valid SST and Chlorophyll points and filters applicable hazards.
    """
    if target_date is None:
        target_date = date(2026, 9, 1)

    if bundle_id is None:
        lc_slug = pfz_record.landing_centre.lower().replace(" ", "_")
        bundle_id = f"evidence_{lc_slug}_{int(pfz_record.bearing_deg)}deg"

    # Spatial matching for satellite ocean data
    matched_sst = find_nearest_valid_sst(
        anchor_lat=pfz_record.latitude_dd,
        anchor_lon=pfz_record.longitude_dd,
        sst_records=sst_records,
        max_distance_km=60.0
    )

    matched_chl = find_nearest_valid_chlorophyll(
        anchor_lat=pfz_record.latitude_dd,
        anchor_lon=pfz_record.longitude_dd,
        chl_records=chl_records,
        max_distance_km=30.0
    )

    # Geographic filtering of warnings
    applicable_warnings: List[NormalizedHazardWarning] = []
    if all_warnings:
        for w in all_warnings:
            if is_warning_geographically_relevant(w, target_sector="North Tamil Nadu Coast", target_district=pfz_record.district):
                applicable_warnings.append(w)

    # Compile data freshness tracking summary
    freshness = {
        "pfz": f"Valid {pfz_record.metadata.validity_start.strftime('%Y-%m-%d')} -> {pfz_record.metadata.validity_end.strftime('%Y-%m-%d')}" if pfz_record.metadata.validity_start and pfz_record.metadata.validity_end else "INCOIS SEC007 Advisory",
        "sst": f"{matched_sst.record.metadata.observation_time.strftime('%Y-%m-%d')} observation" if matched_sst.record and matched_sst.record.metadata.observation_time else "SST unavailable",
        "chlorophyll": f"{matched_chl.record.metadata.observation_time.strftime('%Y-%m-%d')} observation" if matched_chl.record and matched_chl.record.metadata.observation_time else "Chlorophyll unavailable",
        "marine_weather": f"Issued {marine_weather.metadata.observation_time.strftime('%Y-%m-%d %H:%M UTC')}" if marine_weather and marine_weather.metadata.observation_time else "Weather unavailable",
        "temporal_lag_note": "Satellite SST and Chlorophyll-a are 1 day prior (2026-08-31) to the INCOIS advisory window (2026-09-01 -> 2026-09-02)."
    }

    return EvidenceBundle(
        bundle_id=bundle_id,
        target_date=target_date,
        pfz=pfz_record,
        sst=matched_sst,
        chlorophyll=matched_chl,
        marine_weather=marine_weather,
        applicable_warnings=applicable_warnings,
        freshness_summary=freshness,
        is_synthetic=False
    )


# =====================================================================
# Dataset Loaders (From Processed Repository Files)
# =====================================================================

def load_processed_pfz_records(json_path: str) -> List[NormalizedPFZRecord]:
    """Load and instantiate normalized PFZ records from processed JSON."""
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta_dict = data.get("metadata", {})
    common_meta = CommonMetadata(
        source=meta_dict.get("source", "INCOIS"),
        source_product=f"PFZ Advisory Sector {meta_dict.get('sector_id', 'SEC007')}",
        dataset_id=meta_dict.get("sector_id", "SEC007"),
        observation_time=datetime(2026, 9, 1, 0, 0, tzinfo=timezone.utc),
        validity_start=datetime(2026, 9, 1, 6, 0, tzinfo=timezone.utc),
        validity_end=datetime(2026, 9, 2, 18, 30, tzinfo=timezone.utc),
        geographic_area=meta_dict.get("sector_name", "North Tamil Nadu"),
        synthetic=False
    )

    records = []
    for r in data.get("records", []):
        dist_km = r.get("distance_km", {})
        depth_m = r.get("depth_m", {})
        coords = r.get("coordinates", {})
        region = r.get("region", {})
        
        rec = NormalizedPFZRecord(
            landing_centre=r["landing_centre"],
            district=region.get("district", "Chennai" if region.get("is_chennai_region") else "North Tamil Nadu"),
            state=region.get("state", "Tamil Nadu"),
            sector_id=meta_dict.get("sector_id", "SEC007"),
            direction=r["direction"],
            bearing_deg=float(r["bearing_deg"]),
            distance_range_km=(float(dist_km.get("min", 0.0)), float(dist_km.get("max", 0.0))),
            depth_range_m=(float(depth_m.get("min", 0.0)), float(depth_m.get("max", 0.0))),
            latitude_dd=float(coords["latitude_dd"]),
            longitude_dd=float(coords["longitude_dd"]),
            raw_latitude_dms=coords.get("latitude_dms", ""),
            raw_longitude_dms=coords.get("longitude_dms", ""),
            metadata=common_meta
        )
        records.append(rec)
    return records


def load_processed_sst_records(json_path: str) -> List[NormalizedSSTRecord]:
    """Load and instantiate normalized SST grid records from processed JSON."""
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta_dict = data.get("metadata", {})
    common_meta = CommonMetadata(
        source=meta_dict.get("source", "Copernicus Marine"),
        source_product=meta_dict.get("product_id", "SST_GLO_PHY_L4_NRT_010_005"),
        dataset_id=meta_dict.get("dataset_id", "cmems_obs-sst_glo_phy-temp_nrt_P1D-m"),
        observation_time=datetime(2026, 8, 31, 0, 0, tzinfo=timezone.utc),
        geographic_area="Chennai / Southwest Bay of Bengal",
        synthetic=False,
        data_freshness_note=meta_dict.get("data_freshness_note")
    )

    records = []
    for obs in data.get("grid_observations", []):
        rec = NormalizedSSTRecord(
            latitude=float(obs["latitude"]),
            longitude=float(obs["longitude"]),
            sst_kelvin=float(obs["sst_kelvin"]) if obs.get("sst_kelvin") is not None else None,
            sst_celsius=float(obs["sst_celsius"]) if obs.get("sst_celsius") is not None else None,
            temperature_units=meta_dict.get("units_processed", "degC"),
            is_land_masked=obs.get("is_land_masked", False),
            metadata=common_meta
        )
        records.append(rec)
    return records


def load_processed_chlorophyll_records(json_path: str) -> List[NormalizedChlorophyllRecord]:
    """Load and instantiate normalized Chlorophyll grid records from processed JSON."""
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta_dict = data.get("metadata", {})
    common_meta = CommonMetadata(
        source=meta_dict.get("source", "Copernicus Marine"),
        source_product=meta_dict.get("product_id", "OCEANCOLOUR_GLO_BGC_L4_NRT_009_102"),
        dataset_id=meta_dict.get("dataset_id", "cmems_obs-oc_glo_bgc-plankton_nrt_l4-gapfree-multi-4km_P1D"),
        observation_time=datetime(2026, 8, 31, 0, 0, tzinfo=timezone.utc),
        geographic_area="Chennai / Southwest Bay of Bengal",
        synthetic=False,
        data_freshness_note=meta_dict.get("data_freshness_note")
    )

    records = []
    for obs in data.get("grid_observations", []):
        chl_val = obs.get("chl_value")
        rec = NormalizedChlorophyllRecord(
            latitude=float(obs["latitude"]),
            longitude=float(obs["longitude"]),
            chlorophyll_value=float(chl_val) if chl_val is not None else None,
            chlorophyll_units=meta_dict.get("units", "milligram m-3"),
            is_land_masked=obs.get("is_land_masked", False),
            metadata=common_meta
        )
        records.append(rec)
    return records


def get_default_chennai_marine_weather() -> NormalizedMarineWeather:
    """Return the normalized IMD Coastal Weather Bulletin for North Tamil Nadu Coast."""
    meta = CommonMetadata(
        source="IMD RMC Chennai (ACWC)",
        source_product="Coastal Weather Bulletin for North Tamil Nadu Coast",
        observation_time=datetime(2026, 9, 1, 8, 0, tzinfo=timezone.utc),
        validity_start=datetime(2026, 9, 1, 10, 0, tzinfo=timezone.utc),
        validity_end=datetime(2026, 9, 1, 22, 0, tzinfo=timezone.utc),
        geographic_area="North Tamil Nadu Coast",
        synthetic=False
    )
    return NormalizedMarineWeather(
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


def get_default_chennai_hazard_warnings() -> List[NormalizedHazardWarning]:
    """Return verified IMD Fishermen and RSMC Cyclone warnings for Chennai / SW Bay of Bengal."""
    cyclone_meta = CommonMetadata(
        source="RSMC New Delhi / IMD",
        source_product="Tropical Weather Outlook",
        observation_time=datetime(2026, 9, 1, 6, 0, tzinfo=timezone.utc),
        validity_start=datetime(2026, 9, 1, 6, 0, tzinfo=timezone.utc),
        validity_end=datetime(2026, 9, 8, 6, 0, tzinfo=timezone.utc),
        geographic_area="Southwest Bay of Bengal / Chennai",
        synthetic=False
    )
    cyclone_warning = NormalizedHazardWarning(
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
        metadata=cyclone_meta
    )

    currents_meta = CommonMetadata(
        source="IMD / INCOIS Joint Advisory",
        source_product="Ocean Currents Alert",
        observation_time=datetime(2026, 9, 1, 8, 0, tzinfo=timezone.utc),
        validity_start=datetime(2026, 8, 31, 22, 0, tzinfo=timezone.utc),
        validity_end=datetime(2026, 9, 2, 19, 0, tzinfo=timezone.utc),
        geographic_area="North Tamil Nadu Coast (Royapuram to Pulicat)",
        synthetic=False
    )
    currents_warning = NormalizedHazardWarning(
        warning_type="OCEAN_CURRENT",
        warning_level="ADVISORY_CAUTION",
        affected_area="Royapuram to Pulicat (Thiruvallur / Chennai Coast)",
        fishermen_advised_not_to_venture=False,
        cyclone_active=False,
        cyclone_warning_active=False,
        seven_day_cyclogenesis_probability="NIL",
        description="Surface current speeds in range of 1.1 - 1.4 m/s. Harbour & marine operations to be careful.",
        metadata=currents_meta
    )

    # South TN warning (should be filtered out for Chennai PFZ points)
    south_tn_meta = CommonMetadata(
        source="IMD RMC Chennai",
        source_product="Fishermen Warning for South Tamil Nadu Coast",
        observation_time=datetime(2026, 9, 1, 20, 30, tzinfo=timezone.utc),
        validity_start=datetime(2026, 9, 1, 0, 0, tzinfo=timezone.utc),
        validity_end=datetime(2026, 9, 3, 23, 59, tzinfo=timezone.utc),
        geographic_area="South Tamil Nadu Coast & Gulf of Mannar",
        synthetic=False
    )
    south_tn_warning = NormalizedHazardWarning(
        warning_type="FISHERMEN_WARNING",
        warning_level="STRICT_PROHIBITION",
        affected_area="South Tamil Nadu Coast, Gulf of Mannar and Comorin Area",
        fishermen_advised_not_to_venture=True,
        cyclone_active=False,
        cyclone_warning_active=False,
        seven_day_cyclogenesis_probability="NIL",
        description="Squally wind 45-55 kmph gusting to 65 kmph. Fishermen advised NOT to venture.",
        metadata=south_tn_meta
    )

    return [cyclone_warning, currents_warning, south_tn_warning]

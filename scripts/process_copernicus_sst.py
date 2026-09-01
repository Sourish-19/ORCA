#!/usr/bin/env python3
"""
process_copernicus_sst.py - Process raw Copernicus Marine NetCDF SST dataset into structured JSON.

This script extracts the latest available Sea Surface Temperature observation (2026-08-31)
from the Copernicus Marine Global SST Ensemble (SST_GLO_PHY_L4_NRT_010_005 / cmems_obs-sst_glo_phy-temp_nrt_P1D-m),
converts temperature values from Kelvin to Celsius, calculates authentic grid statistics,
and generates data/processed/chennai/sst.json.
"""

import os
import json
import numpy as np
import xarray as xr
from typing import Dict, Any


def process_copernicus_sst_file(nc_file_path: str, output_json_path: str) -> Dict[str, Any]:
    """Process NetCDF SST file and generate structured JSON dataset."""
    if not os.path.exists(nc_file_path):
        raise FileNotFoundError(f"Source NetCDF file not found at: {nc_file_path}")

    # Open NetCDF dataset with xarray
    ds = xr.open_dataset(nc_file_path)

    # Extract time coordinates and target latest date (2026-08-31)
    time_values = ds.time.values
    latest_time = time_values[-1]
    latest_date_str = str(latest_time)[:10]

    lat_values = [round(float(lat), 4) for lat in ds.latitude.values]
    lon_values = [round(float(lon), 4) for lon in ds.longitude.values]

    # Extract slice for latest available observation
    sst_slice = ds['analysed_sst'].sel(time=latest_time)
    sst_k_array = sst_slice.values
    sst_c_array = sst_k_array - 273.15

    # Compute valid ocean statistics (ignoring NaN land points)
    valid_mask = ~np.isnan(sst_c_array)
    ocean_points_count = int(np.sum(valid_mask))
    land_points_count = int(np.sum(~valid_mask))

    min_sst_c = round(float(np.nanmin(sst_c_array)), 2) if ocean_points_count > 0 else None
    max_sst_c = round(float(np.nanmax(sst_c_array)), 2) if ocean_points_count > 0 else None
    mean_sst_c = round(float(np.nanmean(sst_c_array)), 2) if ocean_points_count > 0 else None

    # Construct individual grid observation points
    grid_points = []
    for i, lat in enumerate(lat_values):
        for j, lon in enumerate(lon_values):
            val_k = sst_k_array[i, j]
            if np.isnan(val_k):
                grid_points.append({
                    "latitude": lat,
                    "longitude": lon,
                    "sst_kelvin": None,
                    "sst_celsius": None,
                    "is_land_masked": True
                })
            else:
                val_c = round(float(val_k - 273.15), 2)
                grid_points.append({
                    "latitude": lat,
                    "longitude": lon,
                    "sst_kelvin": round(float(val_k), 2),
                    "sst_celsius": val_c,
                    "is_land_masked": False
                })

    ds.close()

    dataset_output = {
        "metadata": {
            "source": "Copernicus Marine",
            "product_id": "SST_GLO_PHY_L4_NRT_010_005",
            "dataset_id": "cmems_obs-sst_glo_phy-temp_nrt_P1D-m",
            "variable": "analysed_sst",
            "standard_name": "sea_surface_temperature",
            "units_original": "K",
            "units_processed": "degC",
            "synthetic": False,
            "observation_date": latest_date_str,
            "data_freshness_note": "Latest available SST observation is one day older than the INCOIS PFZ advisory.",
            "pfz_advisory_date": "2026-09-01 -> 2026-09-02",
            "grid_dimensions": {
                "latitude_points_count": len(lat_values),
                "longitude_points_count": len(lon_values),
                "total_grid_points": len(grid_points),
                "ocean_valid_points": ocean_points_count,
                "land_masked_points": land_points_count
            },
            "geographic_bounds": {
                "min_latitude": min(lat_values),
                "max_latitude": max(lat_values),
                "min_longitude": min(lon_values),
                "max_longitude": max(lon_values),
                "resolution_deg": 0.25
            },
            "statistics_celsius": {
                "min": min_sst_c,
                "max": max_sst_c,
                "mean": mean_sst_c
            }
        },
        "grid_observations": grid_points
    }

    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(dataset_output, f, indent=2, ensure_ascii=False)

    return dataset_output


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))

    nc_file = os.path.join(project_root, "data", "raw", "ocean", "sst", "copernicus_sst_chennai_20260901.nc")
    output_json = os.path.join(project_root, "data", "processed", "chennai", "sst.json")

    print(f"Processing raw NetCDF file from: {nc_file}")
    data = process_copernicus_sst_file(nc_file, output_json)
    print(f"Successfully processed {data['metadata']['grid_dimensions']['total_grid_points']} grid points.")
    print(f"Observation Date: {data['metadata']['observation_date']}")
    print(f"SST Celsius (Min/Max/Mean): {data['metadata']['statistics_celsius']['min']} / {data['metadata']['statistics_celsius']['max']} / {data['metadata']['statistics_celsius']['mean']} °C")
    print(f"Saved processed JSON to: {output_json}")

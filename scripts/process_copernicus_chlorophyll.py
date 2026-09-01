#!/usr/bin/env python3
"""
process_copernicus_chlorophyll.py - Process raw Copernicus Marine NetCDF Chlorophyll-a dataset into structured JSON.

This script extracts the latest available Chlorophyll-a observation (2026-08-31)
from the Copernicus Marine Global Ocean Colour L4 Gap-Free product
(OCEANCOLOUR_GLO_BGC_L4_NRT_009_102 / cmems_obs-oc_glo_bgc-plankton_nrt_l4-gapfree-multi-4km_P1D),
preserves authentic satellite measurements and units, calculates valid ocean statistics,
and generates data/processed/chennai/chlorophyll.json.
"""

import os
import json
import glob
import numpy as np
import xarray as xr
from typing import Dict, Any


def process_copernicus_chlorophyll_file(nc_file_path: str, output_json_path: str) -> Dict[str, Any]:
    """Process NetCDF Chlorophyll-a file and generate structured JSON dataset."""
    if not os.path.exists(nc_file_path):
        raise FileNotFoundError(f"Source NetCDF file not found at: {nc_file_path}")

    # Open NetCDF dataset with xarray
    ds = xr.open_dataset(nc_file_path)

    if "CHL" not in ds:
        raise ValueError("Variable 'CHL' not found in NetCDF dataset.")

    chl_var = ds["CHL"]
    units = chl_var.attrs.get("units", "milligram m-3")
    standard_name = chl_var.attrs.get("standard_name", "mass_concentration_of_chlorophyll_a_in_sea_water")
    long_name = chl_var.attrs.get("long_name", "Chlorophyll-a concentration - Mean of the binned pixels")

    # Extract time coordinates and target latest date (2026-08-31)
    time_values = ds.time.values
    latest_time = time_values[-1]
    latest_date_str = str(latest_time)[:10]

    lat_values = [round(float(lat), 4) for lat in ds.latitude.values]
    lon_values = [round(float(lon), 4) for lon in ds.longitude.values]

    # Extract slice for latest available observation
    chl_slice = chl_var.sel(time=latest_time)
    chl_array = chl_slice.values

    # Compute valid ocean statistics (ignoring NaN land points)
    valid_mask = ~np.isnan(chl_array)
    ocean_points_count = int(np.sum(valid_mask))
    land_points_count = int(np.sum(~valid_mask))

    min_chl = round(float(np.nanmin(chl_array)), 4) if ocean_points_count > 0 else None
    max_chl = round(float(np.nanmax(chl_array)), 4) if ocean_points_count > 0 else None
    mean_chl = round(float(np.nanmean(chl_array)), 4) if ocean_points_count > 0 else None

    # Construct individual grid observation points
    grid_points = []
    for i, lat in enumerate(lat_values):
        for j, lon in enumerate(lon_values):
            val = chl_array[i, j]
            if np.isnan(val):
                grid_points.append({
                    "latitude": lat,
                    "longitude": lon,
                    "chl_value": None,
                    "is_land_masked": True
                })
            else:
                grid_points.append({
                    "latitude": lat,
                    "longitude": lon,
                    "chl_value": round(float(val), 4),
                    "is_land_masked": False
                })

    ds.close()

    dataset_output = {
        "metadata": {
            "source": "Copernicus Marine",
            "product_id": "OCEANCOLOUR_GLO_BGC_L4_NRT_009_102",
            "dataset_id": "cmems_obs-oc_glo_bgc-plankton_nrt_l4-gapfree-multi-4km_P1D",
            "variable": "CHL",
            "standard_name": standard_name,
            "long_name": long_name,
            "units": units,
            "synthetic": False,
            "observation_date": latest_date_str,
            "pfz_advisory_date": "2026-09-01 -> 2026-09-02",
            "data_freshness_note": "Latest available chlorophyll observation is one day older than the INCOIS PFZ advisory.",
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
                "resolution_deg": 0.0417
            },
            "statistics": {
                "min": min_chl,
                "max": max_chl,
                "mean": mean_chl,
                "units": units
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

    # Search for candidate NetCDF files
    chl_dir = os.path.join(project_root, "data", "raw", "ocean", "chlorophyll")
    candidates = glob.glob(os.path.join(chl_dir, "copernicus_chl_chennai_*.nc"))
    if not candidates:
        candidates = glob.glob(os.path.join(chl_dir, "*.nc"))

    if not candidates:
        raise FileNotFoundError(f"No NetCDF files found in: {chl_dir}")

    nc_file = candidates[0]
    output_json = os.path.join(project_root, "data", "processed", "chennai", "chlorophyll.json")

    print(f"Processing raw NetCDF file from: {nc_file}")
    data = process_copernicus_chlorophyll_file(nc_file, output_json)
    print(f"Successfully processed {data['metadata']['grid_dimensions']['total_grid_points']} grid points.")
    print(f"Observation Date: {data['metadata']['observation_date']}")
    print(f"Valid Ocean Points: {data['metadata']['grid_dimensions']['ocean_valid_points']} / {data['metadata']['grid_dimensions']['total_grid_points']}")
    print(f"Chlorophyll (Min/Max/Mean): {data['metadata']['statistics']['min']} / {data['metadata']['statistics']['max']} / {data['metadata']['statistics']['mean']} {data['metadata']['units']}")
    print(f"Saved processed JSON to: {output_json}")

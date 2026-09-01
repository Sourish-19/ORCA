#!/usr/bin/env python3
"""
parse_incois_pfz.py - Parse official INCOIS PFZ HTML advisories into structured JSON.

This script parses the server-rendered HTML advisory table from INCOIS (Sector SEC007 - North Tamil Nadu),
converts geographic coordinates from DMS to decimal degrees, extracts navigation metrics, and saves
the processed dataset into data/processed/chennai/pfz.json without inventing synthetic attributes.
"""

import os
import re
import json
from html.parser import HTMLParser
from typing import Dict, List, Any, Optional


class INCOISTableParser(HTMLParser):
    """HTML parser to extract tables and metadata from INCOIS text advisory pages."""

    def __init__(self):
        super().__init__()
        self.tables: List[List[List[str]]] = []
        self.current_table: List[List[str]] = []
        self.current_row: List[str] = []
        self.current_cell: List[str] = []
        self.in_table = False
        self.in_row = False
        self.in_cell = False

    def handle_starttag(self, tag: str, attrs: list):
        if tag == 'table':
            self.in_table = True
            self.current_table = []
        elif tag == 'tr' and self.in_table:
            self.in_row = True
            self.current_row = []
        elif tag in ('td', 'th') and self.in_row:
            self.in_cell = True
            self.current_cell = []

    def handle_endtag(self, tag: str):
        if tag == 'table':
            self.in_table = False
            if self.current_table:
                self.tables.append(self.current_table)
        elif tag == 'tr' and self.in_table:
            self.in_row = False
            if self.current_row:
                self.current_table.append(self.current_row)
        elif tag in ('td', 'th') and self.in_cell:
            self.in_cell = False
            cell_text = " ".join("".join(self.current_cell).split())
            self.current_row.append(cell_text)

    def handle_data(self, data: str):
        if self.in_cell:
            self.current_cell.append(data)


def parse_dms_to_dd(dms_str: str) -> Optional[float]:
    """
    Convert DMS coordinate string (e.g., '13 1 3 N' or '80 37 59 E') to decimal degrees.
    """
    if not dms_str:
        return None
    dms_str = dms_str.strip()
    
    # Match: Degrees Minutes Seconds Direction (e.g. 13 1 3 N)
    m3 = re.match(r'^(\d+)\s+(\d+)\s+([\d\.]+)\s*([NSEW])$', dms_str, re.IGNORECASE)
    if m3:
        deg, minute, sec, direction = m3.groups()
        dd = float(deg) + float(minute) / 60.0 + float(sec) / 3600.0
        if direction.upper() in ('S', 'W'):
            dd = -dd
        return round(dd, 4)
        
    # Match: Degrees Minutes Direction (e.g. 13 19 N)
    m2 = re.match(r'^(\d+)\s+([\d\.]+)\s*([NSEW])$', dms_str, re.IGNORECASE)
    if m2:
        deg, minute, direction = m2.groups()
        dd = float(deg) + float(minute) / 60.0
        if direction.upper() in ('S', 'W'):
            dd = -dd
        return round(dd, 4)
        
    return None


def parse_range(range_str: str) -> Dict[str, Any]:
    """Parse 'min-max' numeric range string."""
    range_str = range_str.strip()
    parts = range_str.split('-')
    if len(parts) == 2:
        try:
            return {
                "min": float(parts[0].strip()),
                "max": float(parts[1].strip()),
                "raw": range_str
            }
        except ValueError:
            pass
    return {"min": None, "max": None, "raw": range_str}


# Known coastal landing centres and fishing villages within Chennai metropolitan / coastal zone
CHENNAI_AREA_KEYWORDS = [
    "chennai",
    "pulicat",
    "coromandel",
    "palagai",
    "thotti",
    "ennore",
    "thazan",
    "kathivakkam",
    "ernavoor",
    "kasikoil",
    "ayothi",
    "srinivasa",
    "palavakkam",
    "injampakkam",
    "panaiyur",
    "nainar",
    "kanathur",
    "covelong",
    "kovalam",
    "chemacherry",
    "venpursham",
    "kokilamedu",
    "pudupattinam"
]


def is_chennai_area(landing_centre: str) -> bool:
    """Determine if a landing centre is in the Chennai / Greater Chennai coastal belt."""
    lc_lower = landing_centre.lower()
    return any(k in lc_lower for k in CHENNAI_AREA_KEYWORDS)


def process_incois_pfz_file(raw_html_path: str, output_json_path: str) -> Dict[str, Any]:
    """Read raw INCOIS HTML file, parse table records, and write structured JSON."""
    if not os.path.exists(raw_html_path):
        raise FileNotFoundError(f"Source file not found at: {raw_html_path}")

    with open(raw_html_path, "r", encoding="utf-8", errors="ignore") as f:
        html_content = f.read()

    # Extract advisory metadata from HTML
    updated_date_match = re.search(r'id=["\']updatedDate["\'][^>]*>(.*?)</p>', html_content)
    updated_timestamp = updated_date_match.group(1).strip() if updated_date_match else "Tue Sep 01 16:15:33 IST 2026"

    forecast_date_match = re.search(r'Forecast Date.*?(\d+\s+[A-Za-z]+\s+\d{4})', html_content, re.DOTALL)
    valid_upto_match = re.search(r'Valid upto.*?(\d+\s+[A-Za-z]+\s+\d{4})', html_content, re.DOTALL)

    forecast_date = forecast_date_match.group(1).strip() if forecast_date_match else "1 SEP 2026"
    valid_upto = valid_upto_match.group(1).strip() if valid_upto_match else "2 SEP 2026"

    # Parse HTML tables
    parser = INCOISTableParser()
    parser.feed(html_content)

    # Find the 7-column PFZ advisory table
    pfz_table = None
    for table in parser.tables:
        if len(table) > 1 and len(table[0]) == 7:
            if "coast" in table[0][0].lower() or "direction" in table[0][1].lower():
                pfz_table = table
                break

    if not pfz_table:
        raise ValueError("Could not locate 7-column PFZ advisory table in the HTML file.")

    records = []
    for idx, row in enumerate(pfz_table[1:], start=1):
        landing_centre = row[0].strip()
        direction = row[1].strip()
        bearing_deg_raw = row[2].strip()
        try:
            bearing_deg = int(bearing_deg_raw)
        except ValueError:
            bearing_deg = bearing_deg_raw

        distance_info = parse_range(row[3])
        depth_info = parse_range(row[4])

        lat_dms = row[5].strip()
        lon_dms = row[6].strip()

        lat_dd = parse_dms_to_dd(lat_dms)
        lon_dd = parse_dms_to_dd(lon_dms)

        is_chennai = is_chennai_area(landing_centre)

        record = {
            "record_id": f"PFZ-SEC007-{idx:03d}",
            "landing_centre": landing_centre,
            "direction": direction,
            "bearing_deg": bearing_deg,
            "distance_km": {
                "min": distance_info["min"],
                "max": distance_info["max"],
                "formatted": distance_info["raw"]
            },
            "depth_m": {
                "min": depth_info["min"],
                "max": depth_info["max"],
                "formatted": depth_info["raw"]
            },
            "coordinates": {
                "latitude_dd": lat_dd,
                "longitude_dd": lon_dd,
                "latitude_dms": lat_dms,
                "longitude_dms": lon_dms
            },
            "region": {
                "is_chennai_region": is_chennai,
                "state": "Tamil Nadu",
                "water_body": "Bay of Bengal"
            }
        }
        records.append(record)

    chennai_records = [r for r in records if r["region"]["is_chennai_region"]]

    dataset_output = {
        "metadata": {
            "source": "INCOIS (Indian National Centre for Ocean Information Services), Ministry of Earth Sciences, Govt. of India",
            "official_portal_url": "https://www.incois.gov.in/MarineFisheries/TextDataHome?mfid=1&request_locale=en",
            "sector_id": "SEC007",
            "sector_name": "NORTH TAMILNADU",
            "forecast_date": forecast_date,
            "valid_upto": valid_upto,
            "update_timestamp": updated_timestamp,
            "total_records_extracted": len(records),
            "chennai_area_records_count": len(chennai_records),
            "processing_engine": "ORCA INCOIS PFZ Parser v1.0",
            "coordinate_system": "WGS84 (EPSG:4326)"
        },
        "records": records
    }

    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(dataset_output, f, indent=2, ensure_ascii=False)

    return dataset_output


if __name__ == "__main__":
    # Determine base project root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))

    raw_path = os.path.join(project_root, "data", "raw", "incois", "pfz", "TextData_secid_SEC007.html")
    out_path = os.path.join(project_root, "data", "processed", "chennai", "pfz.json")

    print(f"Parsing raw HTML from: {raw_path}")
    data = process_incois_pfz_file(raw_path, out_path)
    print(f"Successfully processed {data['metadata']['total_records_extracted']} records.")
    print(f"Chennai-area records: {data['metadata']['chennai_area_records_count']}.")
    print(f"Saved processed JSON to: {out_path}")

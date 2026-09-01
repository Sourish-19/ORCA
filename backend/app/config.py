"""
System Configuration & Environment Variables
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
DEMO_DATA_DIR = DATA_DIR / "demo"

# Server configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Data plane settings
DATA_MODE = os.getenv("ORCA_DATA_MODE", "DEMO")  # "LIVE", "FAILOVER", "DEMO"

# Safety Thresholds
MAX_SAFE_WIND_KNOTS = float(os.getenv("MAX_SAFE_WIND_KNOTS", "25.0"))
MAX_SAFE_WAVE_M = float(os.getenv("MAX_SAFE_WAVE_M", "2.5"))
DATA_FRESHNESS_MAX_HOURS = float(os.getenv("DATA_FRESHNESS_MAX_HOURS", "48.0"))

# Suitability Weights
WEIGHT_PFZ = 0.35
WEIGHT_CHL = 0.25
WEIGHT_SST = 0.15
WEIGHT_WIND = 0.10
WEIGHT_WAVE = 0.10
WEIGHT_ACCESSIBILITY = 0.05

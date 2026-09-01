"""
Context & Memory Agent
Resolves canonical location coordinates, time windows, and landing centre bindings.
"""

from typing import Tuple
from app.models.ocean import GeoLocation, LandingCentre
from app.models.request import StructuredIntent
from app.tools.geocoder import geocode_location
from app.ingestion.incois import fetch_landing_centres
from app.tools.spatial_engine import haversine_distance_km


def run_context_agent(intent: StructuredIntent) -> Tuple[GeoLocation, LandingCentre]:
    """
    Resolve geographical coordinates and bind to nearest landing center.
    """
    location = geocode_location(intent.location_name)
    all_landing_centres = fetch_landing_centres()

    # Find nearest landing centre
    nearest_lc = all_landing_centres[0] if all_landing_centres else LandingCentre(
        id="default_lc", name="Royapuram Harbour", district="Chennai", state="Tamil Nadu",
        latitude=13.1258, longitude=80.2974
    )

    min_dist = 99999.0
    for lc in all_landing_centres:
        d = haversine_distance_km(location.latitude, location.longitude, lc.latitude, lc.longitude)
        if d < min_dist:
            min_dist = d
            nearest_lc = lc

    return location, nearest_lc

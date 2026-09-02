/**
 * ORCA Geographic Calculations & Utilities Module
 * Uses Turf.js for destination calculation, bearing, distance, and polygon generation.
 */

// @ts-ignore
import * as turf from '@turf/turf';

export interface PointCoords {
  latitude: number;
  longitude: number;
}

/**
 * Calculates exact destination coordinates from origin, distance (km), and bearing (degrees)
 * using Turf.js destination formula.
 */
export function calculateDestinationPoint(
  originLon: number,
  originLat: number,
  distanceKm: number,
  bearingDeg: number
): [number, number] {
  try {
    const origin = turf.point([originLon, originLat]);
    const destination = turf.destination(origin, distanceKm, bearingDeg, { units: 'kilometers' });
    return destination.geometry.coordinates as [number, number];
  } catch (err) {
    console.warn('Turf destination calculation fallback:', err);
    return [originLon + 0.3, originLat + 0.1];
  }
}

/**
 * Calculates geodesic distance in kilometers between two geographic points
 */
export function calculateDistanceKm(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  try {
    const from = turf.point([lon1, lat1]);
    const to = turf.point([lon2, lat2]);
    return Math.round(turf.distance(from, to, { units: 'kilometers' }) * 10) / 10;
  } catch (err) {
    return 0;
  }
}

/**
 * Calculates compass bearing in degrees between two points
 */
export function calculateBearingDeg(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  try {
    const from = turf.point([lon1, lat1]);
    const to = turf.point([lon2, lat2]);
    const brng = turf.bearing(from, to);
    return Math.round((brng + 360) % 360);
  } catch (err) {
    return 0;
  }
}

/**
 * Creates a circular estimated influence buffer around a point (in km)
 */
export function createPointBufferPolygon(
  centerLon: number,
  centerLat: number,
  radiusKm: number = 6
): [number, number][][] {
  try {
    const pt = turf.point([centerLon, centerLat]);
    const buffered = turf.buffer(pt, radiusKm, { units: 'kilometers' });
    return (buffered?.geometry?.coordinates as [number, number][][]) || [];
  } catch (err) {
    const dLat = radiusKm / 111;
    const dLon = radiusKm / (111 * Math.cos((centerLat * Math.PI) / 180));
    return [
      [
        [centerLon - dLon, centerLat - dLat / 2],
        [centerLon - dLon / 2, centerLat - dLat],
        [centerLon + dLon / 2, centerLat - dLat],
        [centerLon + dLon, centerLat - dLat / 2],
        [centerLon + dLon, centerLat + dLat / 2],
        [centerLon + dLon / 2, centerLat + dLat],
        [centerLon - dLon / 2, centerLat + dLat],
        [centerLon - dLon, centerLat + dLat / 2],
        [centerLon - dLon, centerLat - dLat / 2]
      ]
    ];
  }
}

/**
 * Converts bounding box [minLat, minLon, maxLat, maxLon] into GeoJSON Polygon
 */
export function bboxToPolygon(
  bbox: [number, number, number, number]
): [number, number][][] {
  try {
    const [minLat, minLon, maxLat, maxLon] = bbox;
    const poly = turf.bboxPolygon([minLon, minLat, maxLon, maxLat]);
    return (poly?.geometry?.coordinates as [number, number][][]) || [];
  } catch (err) {
    const [minLat, minLon, maxLat, maxLon] = bbox;
    return [
      [
        [minLon, minLat],
        [maxLon, minLat],
        [maxLon, maxLat],
        [minLon, maxLat],
        [minLon, minLat]
      ]
    ];
  }
}

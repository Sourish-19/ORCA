/**
 * Official Turf.js Geospatial Service for ORCA Marine Intelligence
 * Integrates @turf/turf for along, distance, bearing, point-in-polygon, and geometry creation.
 */

// @ts-ignore
import * as turf from "@turf/turf";

/**
 * Calculates a point along a line at a specified distance using Turf.js `turf.along`
 */
export function alongPoint(
  lineCoordinates: [number, number][],
  distanceKm: number
) {
  try {
    const line = turf.lineString(lineCoordinates);
    const point = turf.along(line, distanceKm, { units: 'kilometers' });
    return point.geometry.coordinates as [number, number];
  } catch (err) {
    console.warn('Turf along calculation notice:', err);
    return lineCoordinates[lineCoordinates.length - 1] || [80.62, 13.06];
  }
}

/**
 * Calculates distance in kilometers between two geographic coordinates using Turf.js `turf.distance`
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  try {
    const from = turf.point([lon1, lat1]);
    const to = turf.point([lon2, lat2]);
    const dist = turf.distance(from, to, { units: 'kilometers' });
    return Math.round(dist * 10) / 10;
  } catch (err) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }
}

/**
 * Calculates compass bearing in degrees between two points using Turf.js `turf.bearing`
 */
export function calculateBearingDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  try {
    const from = turf.point([lon1, lat1]);
    const to = turf.point([lon2, lat2]);
    const brng = turf.bearing(from, to);
    return Math.round((brng + 360) % 360);
  } catch (err) {
    const radLat1 = (lat1 * Math.PI) / 180;
    const radLat2 = (lat2 * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos(radLat2);
    const x =
      Math.cos(radLat1) * Math.sin(radLat2) -
      Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(dLon);
    let brng = (Math.atan2(y, x) * 180) / Math.PI;
    return Math.round((brng + 360) % 360);
  }
}

/**
 * Checks if point is inside polygon using Turf.js `turf.booleanPointInPolygon`
 */
export function isPointInPolygon(
  pointCoords: [number, number],
  polygonCoords: [number, number][][]
): boolean {
  try {
    const pt = turf.point(pointCoords);
    const poly = turf.polygon(polygonCoords);
    return turf.booleanPointInPolygon(pt, poly);
  } catch (err) {
    return false;
  }
}

export { turf };

/**
 * Geospatial utility functions using Turf.js.
 */

import * as turf from '@turf/turf';

/** Calculate the area of a GeoJSON polygon in square meters. */
export function calculateArea(polygon: GeoJSON.Polygon): number {
	return turf.area(turf.polygon(polygon.coordinates));
}

/** Check if a point [lng, lat] is inside a polygon. */
export function pointInPolygon(point: GeoJSON.Position, polygon: GeoJSON.Polygon): boolean {
	return turf.booleanPointInPolygon(turf.point(point), turf.polygon(polygon.coordinates));
}

/** Calculate distance between two points [lng, lat] in meters. */
export function distanceBetween(a: GeoJSON.Position, b: GeoJSON.Position): number {
	return turf.distance(turf.point(a), turf.point(b), { units: 'meters' });
}

/** Calculate bearing from point a to point b in degrees (0-360, clockwise from north). */
export function bearing(from: GeoJSON.Position, to: GeoJSON.Position): number {
	const b = turf.bearing(turf.point(from), turf.point(to));
	// turf.bearing returns -180 to 180, normalize to 0-360
	return ((b % 360) + 360) % 360;
}

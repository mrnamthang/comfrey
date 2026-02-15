/**
 * Zone generation: creates permaculture zone polygons (0-4) from house position + boundary.
 *
 * Uses concentric Turf.js buffers around the house center, intersected with the
 * property boundary, to produce classic permaculture zones:
 *   Zone 0 – house footprint
 *   Zone 1 – daily use (herbs, salad greens, clothesline)
 *   Zone 2 – frequent use (orchard, main garden beds, chickens)
 *   Zone 3 – occasional (large crops, pasture, food forest)
 *   Zone 4 – minimal management (timber, foraging, windbreak)
 */

import * as turf from '@turf/turf';
import type { Zone } from '$lib/types';
import { createId } from '$lib/utils/id';

// ---------------------------------------------------------------------------
// Zone metadata
// ---------------------------------------------------------------------------

interface ZoneMeta {
	level: 0 | 1 | 2 | 3 | 4;
	color: string;
	opacity: number;
	description: string;
}

const ZONE_META: ZoneMeta[] = [
	{ level: 0, color: '#1a1a1a', opacity: 0.4, description: 'Home / center of activity' },
	{ level: 1, color: '#228B22', opacity: 0.2, description: 'Daily use — herbs, salad greens, clothesline' },
	{ level: 2, color: '#32CD32', opacity: 0.15, description: 'Frequent use — orchard, main garden beds, chickens' },
	{ level: 3, color: '#90EE90', opacity: 0.1, description: 'Occasional — large crops, pasture, food forest' },
	{ level: 4, color: '#D2B48C', opacity: 0.1, description: 'Minimal management — timber, foraging, windbreak' }
];

// ---------------------------------------------------------------------------
// Buffer radii lookup (meters) keyed by property-area thresholds
// ---------------------------------------------------------------------------

interface RadiiConfig {
	zone1: number;
	zone2: number;
	zone3: number | null; // null = use remaining boundary (extends to edge)
}

function getRadii(propertyArea: number): RadiiConfig {
	if (propertyArea < 2_000) {
		return { zone1: 8, zone2: 20, zone3: null };
	}
	if (propertyArea <= 10_000) {
		return { zone1: 15, zone2: 40, zone3: 80 };
	}
	if (propertyArea <= 50_000) {
		return { zone1: 20, zone2: 60, zone3: 150 };
	}
	return { zone1: 25, zone2: 80, zone3: 200 };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a hex color + opacity to an rgba() CSS string. */
function toRgba(hex: string, opacity: number): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r},${g},${b},${opacity})`;
}

/**
 * Build a small rectangle around `center` using geodetic offsets via
 * turf.destination so the result is accurate at any latitude.
 * Width = 12 m, Height = 10 m (matching ElementType defaultSize for a house).
 */
function houseFootprint(center: [number, number]): GeoJSON.Polygon {
	const halfW = 0.006; // 6 m  (half of 12 m)
	const halfH = 0.005; // 5 m  (half of 10 m)

	const pt = turf.point(center);

	// Cardinal offsets: bearing 0 = north, 90 = east, 180 = south, 270 = west
	const north = turf.destination(pt, halfH / 1000, 0, { units: 'kilometers' });
	const south = turf.destination(pt, halfH / 1000, 180, { units: 'kilometers' });

	const nLat = (north.geometry.coordinates as [number, number])[1];
	const sLat = (south.geometry.coordinates as [number, number])[1];

	const east = turf.destination(pt, halfW / 1000, 90, { units: 'kilometers' });
	const west = turf.destination(pt, halfW / 1000, 270, { units: 'kilometers' });

	const eLng = (east.geometry.coordinates as [number, number])[0];
	const wLng = (west.geometry.coordinates as [number, number])[0];

	// Construct a closed rectangle: SW -> SE -> NE -> NW -> SW
	const coords: [number, number][] = [
		[wLng, sLat],
		[eLng, sLat],
		[eLng, nLat],
		[wLng, nLat],
		[wLng, sLat]
	];

	return { type: 'Polygon', coordinates: [coords] };
}

/**
 * Safely compute the intersection of two polygons.
 * Returns null when the geometries do not overlap or turf throws.
 */
function safeIntersect(
	a: GeoJSON.Polygon,
	b: GeoJSON.Polygon
): GeoJSON.Polygon | null {
	try {
		const result = turf.intersect(
			turf.featureCollection([turf.polygon(a.coordinates), turf.polygon(b.coordinates)])
		);
		if (!result) return null;
		// turf.intersect may return a MultiPolygon if the overlap is disjoint.
		// Collapse to the largest single polygon for simplicity.
		if (result.geometry.type === 'Polygon') {
			return result.geometry as GeoJSON.Polygon;
		}
		if (result.geometry.type === 'MultiPolygon') {
			return largestPolygon(result.geometry as GeoJSON.MultiPolygon);
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Safely subtract polygon `b` from polygon `a`.
 * Returns `a` unchanged when the difference fails or is empty.
 */
function safeDifference(
	a: GeoJSON.Polygon,
	b: GeoJSON.Polygon
): GeoJSON.Polygon | null {
	try {
		const result = turf.difference(
			turf.featureCollection([turf.polygon(a.coordinates), turf.polygon(b.coordinates)])
		);
		if (!result) return null;
		if (result.geometry.type === 'Polygon') {
			return result.geometry as GeoJSON.Polygon;
		}
		if (result.geometry.type === 'MultiPolygon') {
			return largestPolygon(result.geometry as GeoJSON.MultiPolygon);
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Extract the largest polygon (by area) from a MultiPolygon.
 */
function largestPolygon(mp: GeoJSON.MultiPolygon): GeoJSON.Polygon {
	let best: GeoJSON.Polygon | null = null;
	let bestArea = 0;
	for (const coords of mp.coordinates) {
		const poly: GeoJSON.Polygon = { type: 'Polygon', coordinates: coords };
		const a = turf.area(turf.polygon(coords));
		if (a > bestArea) {
			bestArea = a;
			best = poly;
		}
	}
	return best!;
}

/**
 * Create a circular buffer around a point, returning the polygon.
 */
function bufferAround(
	center: [number, number],
	radiusMeters: number
): GeoJSON.Polygon {
	const pt = turf.point(center);
	const buffered = turf.buffer(pt, radiusMeters / 1000, {
		units: 'kilometers',
		steps: 64
	});
	return buffered!.geometry as GeoJSON.Polygon;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate permaculture zones 0-4 from a house position and property boundary.
 *
 * @param housePosition  [lng, lat] of the house center
 * @param boundary       Property boundary polygon (GeoJSON)
 * @param propertyArea   Property area in square meters
 * @returns              Array of Zone objects ordered 0 -> 4
 */
export function generateZones(
	housePosition: [number, number],
	boundary: GeoJSON.Polygon,
	propertyArea: number
): Zone[] {
	const radii = getRadii(propertyArea);
	const zones: Zone[] = [];

	// ------------------------------------------------------------------
	// Zone 0 — house footprint, intersected with boundary
	// ------------------------------------------------------------------
	const rawHouse = houseFootprint(housePosition);
	const zone0Geom = safeIntersect(rawHouse, boundary) ?? rawHouse;

	zones.push(makeZone(0, zone0Geom));

	// ------------------------------------------------------------------
	// Zone 1 — buffer at zone1 radius, intersected with boundary
	// ------------------------------------------------------------------
	const buf1 = bufferAround(housePosition, radii.zone1);
	const zone1Clipped = safeIntersect(buf1, boundary);

	if (zone1Clipped) {
		zones.push(makeZone(1, zone1Clipped));
	}

	// ------------------------------------------------------------------
	// Zone 2 — buffer at zone2 radius, minus zone1, intersected with boundary
	// ------------------------------------------------------------------
	const buf2 = bufferAround(housePosition, radii.zone2);
	const zone2Clipped = safeIntersect(buf2, boundary);

	if (zone2Clipped && zone1Clipped) {
		const zone2Ring = safeDifference(zone2Clipped, zone1Clipped);
		if (zone2Ring) {
			zones.push(makeZone(2, zone2Ring));
		}
	} else if (zone2Clipped) {
		zones.push(makeZone(2, zone2Clipped));
	}

	// ------------------------------------------------------------------
	// Zone 3 — buffer at zone3 radius (or full boundary), minus zone2, intersected with boundary
	// ------------------------------------------------------------------
	const outerZone2 = zone2Clipped ?? zone1Clipped ?? zone0Geom;

	let zone3Geom: GeoJSON.Polygon | null = null;
	if (radii.zone3 !== null) {
		const buf3 = bufferAround(housePosition, radii.zone3);
		const zone3Clipped = safeIntersect(buf3, boundary);
		if (zone3Clipped) {
			zone3Geom = safeDifference(zone3Clipped, outerZone2);
		}
	} else {
		// Small property: zone 3 extends to the boundary edge
		zone3Geom = safeDifference(boundary, outerZone2);
	}

	if (zone3Geom) {
		zones.push(makeZone(3, zone3Geom));
	}

	// ------------------------------------------------------------------
	// Zone 4 — remaining boundary area minus zone3 (and all inner zones)
	// ------------------------------------------------------------------
	const outerZone3 = zone3Geom
		? safeIntersect(
				radii.zone3 !== null
					? bufferAround(housePosition, radii.zone3)
					: boundary,
				boundary
			)
		: outerZone2;

	if (outerZone3) {
		const zone4Geom = safeDifference(boundary, outerZone3);
		if (zone4Geom) {
			// Only include zone 4 if it has meaningful area (> 1 sqm)
			const area4 = turf.area(turf.polygon(zone4Geom.coordinates));
			if (area4 > 1) {
				zones.push(makeZone(4, zone4Geom));
			}
		}
	}

	return zones;
}

// ---------------------------------------------------------------------------
// Internal factory
// ---------------------------------------------------------------------------

function makeZone(level: 0 | 1 | 2 | 3 | 4, geometry: GeoJSON.Polygon): Zone {
	const meta = ZONE_META[level];
	return {
		id: createId(),
		level: meta.level,
		geometry: geometry as unknown as Zone['geometry'],
		color: toRgba(meta.color, meta.opacity),
		description: meta.description
	};
}

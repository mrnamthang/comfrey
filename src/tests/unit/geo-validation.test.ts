/// <reference path="../../lib/types/index.ts" />

import { describe, it, expect } from 'vitest';
import * as turf from '@turf/turf';
import { calculateArea, pointInPolygon, distanceBetween, bearing } from '$lib/utils/geo';
import { validateBoundary } from '$lib/utils/validation';

// ---------------------------------------------------------------------------
// Helper: create a square polygon of a given side length (meters) centered at
// a given [lng, lat].  Uses turf to buffer a point then extract the bounding
// box, which gives us a geodetically-correct polygon whose area we can predict.
// ---------------------------------------------------------------------------

function makeSquare(centerLng: number, centerLat: number, sizeMeters: number): GeoJSON.Polygon {
	const center = turf.point([centerLng, centerLat]);
	// Half-diagonal of a square with side `sizeMeters`
	const halfDiag = (sizeMeters * Math.SQRT2) / 2;
	const bearings = [315, 45, 135, 225]; // NW, NE, SE, SW corners
	const coords: [number, number][] = bearings.map((b) => {
		const dest = turf.destination(center, halfDiag / 1000, b, { units: 'kilometers' });
		return dest.geometry.coordinates as [number, number];
	});
	// Close the ring
	coords.push(coords[0]);
	return { type: 'Polygon', coordinates: [coords] };
}

// ---------------------------------------------------------------------------
// geo.ts
// ---------------------------------------------------------------------------

describe('calculateArea', () => {
	it('returns roughly correct area for a ~100m x 100m square near the equator', () => {
		const poly = makeSquare(0, 0, 100);
		const area = calculateArea(poly);
		// 100m x 100m = 10 000 sqm; allow 5% tolerance for geodetic distortion
		expect(area).toBeGreaterThan(9_500);
		expect(area).toBeLessThan(10_500);
	});

	it('returns roughly correct area for a ~50m x 50m square at mid-latitude', () => {
		const poly = makeSquare(-73.9857, 40.7484, 50); // NYC
		const area = calculateArea(poly);
		// 50m x 50m = 2 500 sqm
		expect(area).toBeGreaterThan(2_300);
		expect(area).toBeLessThan(2_700);
	});
});

describe('pointInPolygon', () => {
	const poly = makeSquare(0, 0, 1000); // 1 km square at 0,0

	it('returns true for the center point', () => {
		expect(pointInPolygon([0, 0], poly)).toBe(true);
	});

	it('returns true for a point slightly off-center but inside', () => {
		expect(pointInPolygon([0.001, 0.001], poly)).toBe(true);
	});

	it('returns false for a point far outside', () => {
		expect(pointInPolygon([10, 10], poly)).toBe(false);
	});

	it('returns false for a point just beyond the boundary', () => {
		// The square is ~1 km across, so 1 degree away is well outside
		expect(pointInPolygon([1, 0], poly)).toBe(false);
	});
});

describe('distanceBetween', () => {
	it('returns roughly correct distance for two points ~111 km apart (1 degree lat)', () => {
		const d = distanceBetween([0, 0], [0, 1]);
		// 1 degree latitude ~ 111 320 m
		expect(d).toBeGreaterThan(110_000);
		expect(d).toBeLessThan(112_000);
	});

	it('returns 0 for the same point', () => {
		const d = distanceBetween([10, 20], [10, 20]);
		expect(d).toBe(0);
	});

	it('returns a short distance for nearby points', () => {
		// Two points ~100m apart along the equator
		// 0.001 degree longitude at equator ~ 111 m
		const d = distanceBetween([0, 0], [0.001, 0]);
		expect(d).toBeGreaterThan(90);
		expect(d).toBeLessThan(130);
	});
});

describe('bearing', () => {
	// Use a reference point and destinations displaced exactly north/east/south/west.
	const origin: [number, number] = [0, 0];

	it('returns ~0 (north) for a point due north', () => {
		const b = bearing(origin, [0, 1]);
		expect(b).toBeCloseTo(0, 0);
	});

	it('returns ~90 (east) for a point due east', () => {
		const b = bearing(origin, [1, 0]);
		expect(b).toBeCloseTo(90, 0);
	});

	it('returns ~180 (south) for a point due south', () => {
		const b = bearing(origin, [0, -1]);
		expect(b).toBeCloseTo(180, 0);
	});

	it('returns ~270 (west) for a point due west', () => {
		const b = bearing(origin, [-1, 0]);
		expect(b).toBeCloseTo(270, 0);
	});

	it('always returns a value in the 0-360 range', () => {
		// Southwest should be around 225
		const b = bearing(origin, [-1, -1]);
		expect(b).toBeGreaterThanOrEqual(0);
		expect(b).toBeLessThan(360);
		expect(b).toBeCloseTo(225, 0);
	});
});

// ---------------------------------------------------------------------------
// validation.ts
// ---------------------------------------------------------------------------

describe('validateBoundary', () => {
	it('returns error when coordinates array is empty', () => {
		const poly: GeoJSON.Polygon = { type: 'Polygon', coordinates: [] };
		const result = validateBoundary(poly);
		expect(result.valid).toBe(false);
		expect(result.error).toBe('Boundary has no coordinates.');
	});

	it('returns error when ring is empty', () => {
		const poly: GeoJSON.Polygon = { type: 'Polygon', coordinates: [[]] };
		const result = validateBoundary(poly);
		expect(result.valid).toBe(false);
		expect(result.error).toBe('Boundary must have at least 3 vertices.');
	});

	it('returns error when there are only 2 vertices plus closing point', () => {
		// Two distinct vertices + closing = 3 positions, but only 2 unique vertices
		const poly: GeoJSON.Polygon = {
			type: 'Polygon',
			coordinates: [
				[
					[0, 0],
					[1, 0],
					[0, 0] // closing point = first point
				]
			]
		};
		const result = validateBoundary(poly);
		expect(result.valid).toBe(false);
		expect(result.error).toBe('Boundary must have at least 3 vertices.');
	});

	it('accepts a valid triangle (exactly 3 vertices)', () => {
		// A small triangle with 3 vertices + closing point, normal area range
		const poly: GeoJSON.Polygon = {
			type: 'Polygon',
			coordinates: [
				[
					[0, 0],
					[0.01, 0],
					[0.005, 0.01],
					[0, 0] // closing
				]
			]
		};
		const result = validateBoundary(poly);
		expect(result.valid).toBe(true);
	});

	it('returns error for a self-intersecting (bowtie) polygon', () => {
		// A "bowtie" shape: lines cross in the middle
		const poly: GeoJSON.Polygon = {
			type: 'Polygon',
			coordinates: [
				[
					[0, 0],
					[0.01, 0.01],
					[0.01, 0],
					[0, 0.01],
					[0, 0] // closing
				]
			]
		};
		const result = validateBoundary(poly);
		expect(result.valid).toBe(false);
		expect(result.error).toContain('boundary lines cross');
	});

	it('returns warning for a very small polygon (area < 50 sqm)', () => {
		// ~3m x 3m square = ~9 sqm
		const poly = makeSquare(0, 0, 3);
		const result = validateBoundary(poly);
		expect(result.valid).toBe(true);
		expect(result.warning).toContain('very small');
	});

	it('returns warning for a very large polygon (area > 500,000 sqm)', () => {
		// ~800m x 800m square = ~640,000 sqm
		const poly = makeSquare(0, 0, 800);
		const result = validateBoundary(poly);
		expect(result.valid).toBe(true);
		expect(result.warning).toContain('very large');
	});

	it('returns valid with no warning or error for a normal-sized polygon', () => {
		// ~100m x 100m = ~10,000 sqm
		const poly = makeSquare(0, 0, 100);
		const result = validateBoundary(poly);
		expect(result.valid).toBe(true);
		expect(result.warning).toBeUndefined();
		expect(result.error).toBeUndefined();
	});

	it('returns valid with no warning at the 50 sqm boundary', () => {
		// A square with area ~50 sqm: side = sqrt(50) ~ 7.07m
		const side = Math.sqrt(50);
		const poly = makeSquare(0, 0, side);
		const area = calculateArea(poly);
		// The polygon should be right around 50 sqm.
		// If exactly >= 50 there should be no warning.
		// Due to geodetic effects the area may be slightly above or below,
		// so we test the result is valid and (if area >= 50) has no warning.
		expect(validateBoundary(poly).valid).toBe(true);
		if (area >= 50) {
			expect(validateBoundary(poly).warning).toBeUndefined();
		} else {
			// Just at the boundary, the small-area warning is acceptable
			expect(validateBoundary(poly).warning).toContain('very small');
		}
	});
});

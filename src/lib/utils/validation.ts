/**
 * Boundary polygon validation rules.
 */

import * as turf from '@turf/turf';
import { calculateArea } from './geo';

const MIN_AREA_SQM = 50;
const MAX_AREA_SQM = 500_000; // 50 hectares

export interface ValidationResult {
	valid: boolean;
	error?: string;
	warning?: string;
}

/**
 * Validate a boundary polygon.
 * Checks: minimum vertices, self-intersection, area bounds.
 * Returns error for hard failures, warning for soft out-of-range.
 */
export function validateBoundary(polygon: GeoJSON.Polygon): ValidationResult {
	const ring = polygon.coordinates[0];
	if (!ring) {
		return { valid: false, error: 'Boundary has no coordinates.' };
	}

	// GeoJSON polygons repeat the first vertex at the end, so a triangle has 4 positions
	const vertexCount = ring.length > 0 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
		? ring.length - 1
		: ring.length;

	if (vertexCount < 3) {
		return { valid: false, error: 'Boundary must have at least 3 vertices.' };
	}

	// Self-intersection detection
	const kinks = turf.kinks(turf.polygon(polygon.coordinates));
	if (kinks.features.length > 0) {
		return {
			valid: false,
			error: 'Your boundary lines cross each other. Please redraw without crossing lines.'
		};
	}

	// Area bounds
	const area = calculateArea(polygon);

	if (area < MIN_AREA_SQM) {
		return {
			valid: true,
			warning: 'This property is very small. Zone suggestions may not be meaningful.'
		};
	}

	if (area > MAX_AREA_SQM) {
		return {
			valid: true,
			warning:
				'This property is very large for detailed permaculture design. Results may be less useful.'
		};
	}

	return { valid: true };
}

/**
 * Tip matching engine: processes design events and returns matching advisor tips.
 *
 * The engine filters the tip catalog against incoming events, checking trigger
 * type, climate compatibility, hemisphere, dismissed state, and optional
 * spatial/elevation conditions. Results are sorted by priority (highest first).
 */

import type {
	AdvisorTip,
	AdvisorState,
	SiteAnalysis,
	Element,
	Zone,
	TipTrigger,
	TipCondition
} from '$lib/types';
import { advisorTips } from '$lib/catalog/tips';
import { distanceBetween } from '$lib/utils/geo';

// ============================================================
// Design Events
// ============================================================

export type DesignEvent =
	| { type: 'element_placed'; element: Element; analysis: SiteAnalysis }
	| {
			type: 'element_moved';
			element: Element;
			previousPosition: GeoJSON.Position;
			analysis: SiteAnalysis;
	  }
	| { type: 'element_deleted'; element: Element }
	| { type: 'zone_created'; zone: Zone }
	| { type: 'analysis_complete'; analysis: SiteAnalysis }
	| { type: 'wizard_step_entered'; step: string }
	| { type: 'design_review_requested' };

// ============================================================
// Public API
// ============================================================

/**
 * Process a design event and return all matching advisor tips, sorted by
 * priority (highest first). Dismissed tips are excluded.
 */
export function processEvent(
	event: DesignEvent,
	advisorState: AdvisorState,
	elements: Element[],
	zones: Zone[]
): AdvisorTip[] {
	const analysis = extractAnalysis(event);

	return advisorTips
		.filter((tip) => !advisorState.dismissedTips.includes(tip.id))
		.filter((tip) => triggerMatches(tip.trigger, event))
		.filter((tip) => climateMatches(tip, analysis))
		.filter((tip) => hemisphereMatches(tip, analysis))
		.filter((tip) => conditionMet(tip.condition, event, elements, zones, analysis))
		.sort((a, b) => b.priority - a.priority);
}

// ============================================================
// Trigger Matching
// ============================================================

/** Check whether a tip's trigger matches the incoming event. */
function triggerMatches(trigger: TipTrigger, event: DesignEvent): boolean {
	switch (trigger.type) {
		case 'element_placed':
			return (
				(event.type === 'element_placed' || event.type === 'element_moved') &&
				event.element.typeId === trigger.elementType
			);

		case 'element_near':
			// element_near triggers fire when an element is placed or moved and
			// another element of the paired type already exists within range.
			if (event.type !== 'element_placed' && event.type !== 'element_moved') return false;
			return true; // distance is verified in conditionMet via the proximity check

		case 'element_position':
			return (
				(event.type === 'element_placed' || event.type === 'element_moved') &&
				event.element.typeId === trigger.elementType
			);

		case 'zone_created':
			return event.type === 'zone_created' && event.zone.level === trigger.zoneLevel;

		case 'analysis_complete':
			return event.type === 'analysis_complete';

		case 'wizard_step':
			return event.type === 'wizard_step_entered' && event.step === trigger.step;

		case 'design_review':
			return event.type === 'design_review_requested';

		default:
			return false;
	}
}

// ============================================================
// Climate & Hemisphere Filtering
// ============================================================

/** A tip passes climate filtering if it targets 'all' or matches the site climate. */
function climateMatches(tip: AdvisorTip, analysis: SiteAnalysis | null): boolean {
	if (tip.climate === 'all') return true;
	if (!analysis) return true; // no analysis yet -- show the tip anyway
	return tip.climate === analysis.climate.type;
}

/** A tip passes hemisphere filtering if it has no hemisphere constraint or matches. */
function hemisphereMatches(tip: AdvisorTip, analysis: SiteAnalysis | null): boolean {
	if (!tip.hemisphere) return true;
	if (!analysis) return true;
	return tip.hemisphere === analysis.climate.hemisphere;
}

// ============================================================
// Condition Evaluation
// ============================================================

/** Evaluate the optional condition attached to a tip. Returns true when no condition exists. */
function conditionMet(
	condition: TipCondition | undefined,
	event: DesignEvent,
	elements: Element[],
	_zones: Zone[],
	analysis: SiteAnalysis | null
): boolean {
	if (!condition) {
		// For element_near triggers, we still need to verify proximity even
		// without an explicit condition, since the trigger carries maxDistance.
		return elementNearCheck(event, elements);
	}

	switch (condition.type) {
		case 'elevation_compare':
			return checkElevationCompare(condition, event, elements, analysis);

		case 'distance_from_house':
			return checkDistanceFromHouse(condition, event, elements);

		case 'sun_exposure':
			return checkSunExposure(condition, analysis);

		case 'climate_is':
			return analysis?.climate.type === condition.climate;

		case 'hemisphere_is':
			return analysis?.climate.hemisphere === condition.hemisphere;

		default:
			return true;
	}
}

// ============================================================
// Condition Helpers
// ============================================================

/**
 * For element_near triggers without an explicit condition, verify that the
 * placed/moved element is actually near an element of the paired type.
 * For all other trigger types, pass through.
 */
function elementNearCheck(event: DesignEvent, elements: Element[]): boolean {
	if (event.type !== 'element_placed' && event.type !== 'element_moved') return true;

	// Find the tip whose trigger is element_near and involves this element type.
	// We only need to verify proximity -- the trigger match already confirmed the
	// event type is compatible.
	const relevantTips = advisorTips.filter(
		(t) =>
			t.trigger.type === 'element_near' &&
			(t.trigger.elementA === event.element.typeId || t.trigger.elementB === event.element.typeId)
	);

	if (relevantTips.length === 0) return true;

	// For each relevant element_near tip, check if a paired element is within range.
	for (const tip of relevantTips) {
		if (tip.trigger.type !== 'element_near') continue;

		const pairedType =
			tip.trigger.elementA === event.element.typeId
				? tip.trigger.elementB
				: tip.trigger.elementA;

		const pairedElement = elements.find(
			(el) => el.typeId === pairedType && el.id !== event.element.id
		);
		if (!pairedElement) continue;

		const posA = getElementPosition(event.element);
		const posB = getElementPosition(pairedElement);
		if (!posA || !posB) continue;

		if (distanceBetween(posA, posB) <= tip.trigger.maxDistance) {
			return true;
		}
	}

	return false;
}

/**
 * Check whether elementA is at a higher or lower elevation than elementB
 * relative to the site's slope aspect. Uses elevation data from the analysis.
 */
function checkElevationCompare(
	condition: Extract<TipCondition, { type: 'elevation_compare' }>,
	event: DesignEvent,
	elements: Element[],
	analysis: SiteAnalysis | null
): boolean {
	if (!analysis) return false;

	const elementA = findElementByType(condition.elementA, event, elements);
	const elementB = findElementByType(condition.elementB, event, elements);
	if (!elementA || !elementB) return false;

	const posA = getElementPosition(elementA);
	const posB = getElementPosition(elementB);
	if (!posA || !posB) return false;

	// Estimate relative elevation using the slope aspect from analysis.
	// The aspect tells us which direction is downhill (aspect = direction the slope faces).
	// An element is "higher" if it is further from the aspect direction (uphill).
	const elevationA = estimateRelativeElevation(posA, analysis);
	const elevationB = estimateRelativeElevation(posB, analysis);

	if (condition.expected === 'higher') {
		return elevationA > elevationB;
	}
	return elevationA < elevationB;
}

/**
 * Check whether a placed element is within maxMeters of the house.
 */
function checkDistanceFromHouse(
	condition: Extract<TipCondition, { type: 'distance_from_house' }>,
	event: DesignEvent,
	elements: Element[]
): boolean {
	if (event.type !== 'element_placed' && event.type !== 'element_moved') return true;

	const house = elements.find((el) => el.typeId === 'house');
	if (!house) return true; // no house yet -- cannot check, so pass

	const housePos = getElementPosition(house);
	const elementPos = getElementPosition(event.element);
	if (!housePos || !elementPos) return true;

	return distanceBetween(housePos, elementPos) <= condition.maxMeters;
}

/**
 * Check whether the site's dominant aspect indicates sunny or shaded conditions.
 * A "sunny" aspect faces the equator (south in northern hemisphere, north in southern).
 */
function checkSunExposure(
	condition: Extract<TipCondition, { type: 'sun_exposure' }>,
	analysis: SiteAnalysis | null
): boolean {
	if (!analysis) return false;

	const aspect = analysis.elevation.aspect;
	const hemisphere = analysis.climate.hemisphere;

	// Equator-facing aspects are "sunny":
	//   Northern hemisphere: aspect 90-270 (south-facing)
	//   Southern hemisphere: aspect 270-360 or 0-90 (north-facing)
	const isSunny =
		hemisphere === 'northern' ? aspect >= 90 && aspect <= 270 : aspect >= 270 || aspect <= 90;

	return condition.aspect === 'sunny' ? isSunny : !isSunny;
}

// ============================================================
// Utility Helpers
// ============================================================

/** Extract the SiteAnalysis from an event, if available. */
function extractAnalysis(event: DesignEvent): SiteAnalysis | null {
	switch (event.type) {
		case 'element_placed':
		case 'element_moved':
		case 'analysis_complete':
			return event.analysis;
		default:
			return null;
	}
}

/** Get the [lng, lat] position from an element's geometry. */
function getElementPosition(element: Element): GeoJSON.Position | null {
	if (element.geometry.type === 'Point') {
		return element.geometry.coordinates;
	}
	if (element.geometry.type === 'Polygon') {
		// Use the centroid of the first ring as an approximation.
		const ring = element.geometry.coordinates[0];
		if (!ring || ring.length === 0) return null;
		const sumLng = ring.reduce((s, c) => s + c[0], 0);
		const sumLat = ring.reduce((s, c) => s + c[1], 0);
		return [sumLng / ring.length, sumLat / ring.length];
	}
	return null;
}

/**
 * Estimate relative elevation of a point based on the site's slope and aspect.
 * Uses a simple projection: elevation ~ -dot(position_offset, downhill_direction).
 * Higher values mean higher relative elevation (further uphill).
 */
function estimateRelativeElevation(
	position: GeoJSON.Position,
	analysis: SiteAnalysis
): number {
	const aspectRad = (analysis.elevation.aspect * Math.PI) / 180;
	const slopeRad = (analysis.elevation.slope * Math.PI) / 180;

	// Downhill direction unit vector (aspect points downhill)
	const downX = Math.sin(aspectRad);
	const downY = Math.cos(aspectRad);

	// Project position onto the downhill axis. A higher (more negative) projection
	// means the point is further uphill.
	const projection = position[0] * downX + position[1] * downY;

	return -projection * Math.tan(slopeRad);
}

/**
 * Find an element by typeId, preferring the event's element if it matches,
 * then falling back to the elements array.
 */
function findElementByType(
	typeId: string,
	event: DesignEvent,
	elements: Element[]
): Element | null {
	// If the current event involves an element of this type, use it.
	if (
		(event.type === 'element_placed' || event.type === 'element_moved') &&
		event.element.typeId === typeId
	) {
		return event.element;
	}
	return elements.find((el) => el.typeId === typeId) ?? null;
}

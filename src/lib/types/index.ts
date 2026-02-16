// src/lib/types/index.ts
// Core TypeScript interfaces for the Comfrey permaculture design tool.
// GeoJSON namespace declared here; will be replaced by @types/geojson later.

declare namespace GeoJSON {
	interface Point {
		type: 'Point';
		coordinates: [number, number];
	}
	interface Polygon {
		type: 'Polygon';
		coordinates: [number, number][][];
	}
}

// ============================================================
// Foundational Types
// ============================================================

/** Schema definition for element-specific metadata fields */
export interface FieldDef {
	type: 'string' | 'number' | 'boolean' | 'select';
	label: string;
	required: boolean;
	default?: string | number | boolean;
	options?: string[]; // for 'select' type only
	unit?: string; // e.g. "liters", "meters", "kg"
	min?: number; // for 'number' type
	max?: number; // for 'number' type
}

/** Sun position at a specific date/time */
export interface SunPosition {
	altitude: number; // degrees above horizon (0-90)
	azimuth: number; // degrees from north, clockwise (0-360)
	sunrise: string; // ISO time string "06:23"
	sunset: string; // ISO time string "18:45"
	daylength: number; // hours of daylight
}

export type ClimateType = 'tropical' | 'subtropical' | 'temperate' | 'arid';
export type Hemisphere = 'northern' | 'southern';
export type LayerType = 'infrastructure' | 'planting' | 'water' | 'paths';

/** Async operation status for loading states */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
	status: AsyncStatus;
	data: T | null;
	error: string | null; // user-friendly error message
}

// ============================================================
// Land & Design
// ============================================================

export interface Project {
	id: string;
	name: string;
	land: {
		boundary: GeoJSON.Polygon;
		location: [number, number]; // [lng, lat]
		area: number; // sq meters, computed from boundary
	};
	analysis: AsyncState<SiteAnalysis>;
	designs: Design[];
	advisorState: AdvisorState;
	createdAt: string;
	updatedAt: string;
	version: number; // schema version for data migrations
}

export interface SiteAnalysis {
	climate: {
		zone: string; // e.g. "11a" (USDA hardiness)
		type: ClimateType;
		hemisphere: Hemisphere; // derived from latitude
		avgRainfall: number; // mm/year
		avgTemp: { summer: number; winter: number }; // celsius
		frostFreeDays: number;
		monsoonMonths?: [number, number]; // [startMonth, endMonth] -- tropical only
	};
	sun: {
		summerSolstice: SunPosition;
		winterSolstice: SunPosition;
		equinox: SunPosition;
		daylength: { longest: number; shortest: number }; // hours
	};
	wind: {
		prevailing: number; // degrees (0-360, 0 = from north)
		avgSpeed: number; // km/h
		label: string; // human-readable: "North-west at 12 km/h"
	};
	elevation: {
		min: number; // meters above sea level
		max: number;
		slope: number; // degrees average
		aspect: number; // degrees (dominant facing direction, 0 = north)
		aspectLabel: string; // human-readable: "North-east facing"
		heightmap?: Float32Array; // grid for terrain rendering
	};
}

export interface Design {
	id: string;
	name: string;
	elements: Element[];
	zones: Zone[];
	layers: Layer[];
	camera: { center: [number, number]; zoom: number; bearing: number };
	createdAt: string;
	updatedAt: string;
}

export interface Element {
	id: string;
	typeId: string; // references ElementType catalog
	geometry: GeoJSON.Point | GeoJSON.Polygon;
	properties: {
		rotation: number; // degrees, 0-360
		scale: number; // multiplier, default 1.0
		zone?: number; // which permaculture zone (0-5), auto-assigned
		layer: LayerType;
		label?: string; // user-given name
		meta: Record<string, unknown>; // type-specific, validated by ElementType.metaSchema
	};
}

export interface ElementType {
	id: string;
	name: string;
	category: 'structure' | 'plant' | 'water' | 'animal' | 'path' | 'utility';
	icon: string; // SVG string for 2D view
	defaultSize: { width: number; height: number }; // meters
	canRotate: boolean;
	canResize: boolean;
	implementationPhase: 1 | 2 | 3; // which year to implement (for action plan)
	metaSchema: Record<string, FieldDef>;
}

export interface Zone {
	id: string;
	level: 0 | 1 | 2 | 3 | 4 | 5;
	geometry: GeoJSON.Polygon;
	color: string; // semi-transparent fill, e.g. "rgba(34,139,34,0.2)"
	description: string; // human-readable: "Daily use zone -- herbs, salad, clothesline"
}

export interface Layer {
	id: string;
	name: string;
	type: LayerType;
	visible: boolean;
}

// ============================================================
// Action Plan
// ============================================================

export interface ActionPlan {
	phases: ActionPhase[];
}

export interface ActionPhase {
	year: number; // 1, 2, or 3
	title: string; // "Foundation & Infrastructure"
	items: ActionItem[];
}

export interface ActionItem {
	elementId?: string; // reference to placed element (if applicable)
	description: string; // "Build water catchment tank on the north slope"
	category: LayerType;
	zone: number; // which permaculture zone
	priority: 'essential' | 'recommended' | 'optional';
}

// ============================================================
// Advisor System
// ============================================================

export interface AdvisorTip {
	id: string;
	trigger: TipTrigger;
	condition?: TipCondition;
	climate: ClimateType | 'all';
	hemisphere?: Hemisphere; // some tips are hemisphere-specific
	headline: string; // "Water flows downhill"
	explanation: string; // 2-3 sentences with site-specific context
	shortReminder: string; // abbreviated version for repeat views
	learnMore?: string; // expanded mini-lesson (shown on demand)
	action?: TipAction;
	priority: number; // higher = shown first (1-100)
}

export interface TipAction {
	label: string; // "Move it for me"
	type: TipActionType;
	payload?: Record<string, unknown>; // action-specific data
}

export type TipActionType =
	| 'move_element_uphill' // moves the triggering element to a higher elevation
	| 'rotate_element_to_sun' // rotates element to face the sun
	| 'suggest_position' // highlights a recommended position on the map
	| 'open_learn_more'; // opens the learn more panel

export type TipTrigger =
	| { type: 'element_placed'; elementType: string }
	| { type: 'element_near'; elementA: string; elementB: string; maxDistance: number }
	| {
			type: 'element_position';
			elementType: string;
			check: 'uphill' | 'downhill' | 'sunny' | 'shaded' | 'windward' | 'leeward';
	  }
	| { type: 'zone_created'; zoneLevel: number }
	| { type: 'analysis_complete' }
	| { type: 'wizard_step'; step: string }
	| { type: 'design_review' }; // fired when user clicks "Review my design"

export type TipCondition =
	| { type: 'elevation_compare'; elementA: string; elementB: string; expected: 'higher' | 'lower' }
	| { type: 'distance_from_house'; maxMeters: number }
	| { type: 'sun_exposure'; aspect: 'sunny' | 'shaded' }
	| { type: 'climate_is'; climate: ClimateType }
	| { type: 'hemisphere_is'; hemisphere: Hemisphere };

export interface AdvisorState {
	seenTips: string[]; // tip IDs the user has seen (for adaptive depth)
	dismissedTips: string[]; // tip IDs the user dismissed
	appliedTips: string[]; // tip IDs the user accepted
}

// ============================================================
// Learning Hub
// ============================================================

export type LessonCategory = 'principles' | 'plants' | 'tutorials';

export interface Lesson {
	id: string;
	category: LessonCategory;
	title: string;
	summary: string;
	readingTime: number;
	body: string;
	relevance: {
		tools: string[];
		climates: string[];
	};
	tryItAction?: {
		label: string;
		panel?: string;
		layer?: string;
	};
}

/**
 * Action plan generator.
 *
 * Derives an ActionPlan from the current design state at runtime (not stored).
 * Groups placed elements into implementation phases and produces site-specific
 * action items using the SiteAnalysis context.
 */

import type {
	ActionPlan,
	ActionPhase,
	ActionItem,
	Element,
	ElementType,
	SiteAnalysis
} from '$lib/types';
import { getElementType } from '$lib/catalog/elements';

const PHASE_TITLES: Record<number, string> = {
	1: 'Foundation & Infrastructure',
	2: 'Productive Systems',
	3: 'Fine-Tuning & Expansion'
};

const PRIORITY_ORDER: Record<ActionItem['priority'], number> = {
	essential: 0,
	recommended: 1,
	optional: 2
};

/**
 * Map an ElementType category to an action item priority.
 */
function priorityForCategory(
	category: ElementType['category']
): ActionItem['priority'] {
	switch (category) {
		case 'structure':
		case 'water':
			return 'essential';
		case 'plant':
			return 'recommended';
		case 'animal':
		case 'utility':
		case 'path':
		default:
			return 'optional';
	}
}

/**
 * Build a human-readable description for an action item, incorporating site
 * context from the analysis when available.
 */
function describeItem(
	elementType: ElementType,
	element: Element,
	analysis: SiteAnalysis | null
): string {
	const label = element.properties.label ?? elementType.name;
	const zone = element.properties.zone ?? 0;

	// Collect site-specific qualifiers
	const qualifiers: string[] = [];

	if (analysis?.elevation?.aspectLabel) {
		qualifiers.push(`on the ${analysis.elevation.aspectLabel.toLowerCase()} slope`);
	}

	if (analysis?.climate?.type) {
		// Only add climate qualifier when it meaningfully narrows the advice
		if (analysis.climate.type === 'arid' && elementType.category === 'water') {
			qualifiers.push('to maximize water harvesting in the arid climate');
		} else if (analysis.climate.type === 'tropical' && elementType.category === 'plant') {
			qualifiers.push('suited to the tropical climate');
		}
	}

	const locationSuffix = qualifiers.length > 0 ? ` ${qualifiers.join(', ')}` : '';

	// Verb depends on category
	let verb: string;
	switch (elementType.category) {
		case 'structure':
			verb = 'Build';
			break;
		case 'water':
			verb = 'Install';
			break;
		case 'plant':
			verb = 'Plant';
			break;
		case 'animal':
			verb = 'Set up';
			break;
		case 'path':
			verb = 'Lay out';
			break;
		case 'utility':
			verb = 'Establish';
			break;
		default:
			verb = 'Add';
	}

	const zoneNote = zone > 0 ? ` in zone ${zone}` : '';

	return `${verb} ${label}${zoneNote}${locationSuffix}`;
}

/**
 * Generate an ActionPlan from the current set of placed elements and the
 * optional site analysis. The plan is derived entirely at runtime and is
 * never persisted.
 */
export function generateActionPlan(
	elements: Element[],
	analysis: SiteAnalysis | null
): ActionPlan {
	if (elements.length === 0) {
		return { phases: [] };
	}

	// Group elements by implementation phase
	const phaseMap = new Map<number, ActionItem[]>();

	for (const element of elements) {
		const elementType = getElementType(element.typeId);
		if (!elementType) continue;

		const phase = elementType.implementationPhase;

		const item: ActionItem = {
			elementId: element.id,
			description: describeItem(elementType, element, analysis),
			category: element.properties.layer,
			zone: element.properties.zone ?? 0,
			priority: priorityForCategory(elementType.category)
		};

		if (!phaseMap.has(phase)) {
			phaseMap.set(phase, []);
		}
		phaseMap.get(phase)!.push(item);
	}

	// Sort items within each phase: zone ascending, then priority
	for (const items of phaseMap.values()) {
		items.sort((a, b) => {
			if (a.zone !== b.zone) return a.zone - b.zone;
			return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
		});
	}

	// Build phases array, only including phases that have items, sorted by year
	const phases: ActionPhase[] = Array.from(phaseMap.entries())
		.sort(([a], [b]) => a - b)
		.map(([year, items]) => ({
			year,
			title: PHASE_TITLES[year] ?? `Year ${year}`,
			items
		}));

	return { phases };
}

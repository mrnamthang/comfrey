/**
 * Companion planting analysis: checks placed plants for good/bad combos
 * and suggests guild compositions.
 */

import type { Element } from '$lib/types';
import { getPlant, plants, type Plant } from '$lib/catalog/plants';

export interface CompanionCheck {
	good: { plantA: Plant; plantB: Plant; reason: string }[];
	bad: { plantA: Plant; plantB: Plant; reason: string }[];
}

export interface GuildSuggestion {
	centerPlant: Plant;
	layers: { layer: Plant['layer']; suggestions: Plant[] }[];
}

/** Check all placed plants for companion/antagonist relationships. */
export function checkCompanions(elements: Element[]): CompanionCheck {
	const plantElements = elements.filter((el) => el.typeId.startsWith('plant:'));
	const result: CompanionCheck = { good: [], bad: [] };
	const seen = new Set<string>();

	for (let i = 0; i < plantElements.length; i++) {
		const idA = plantElements[i].typeId.slice(6);
		const plantA = getPlant(idA);
		if (!plantA) continue;

		for (let j = i + 1; j < plantElements.length; j++) {
			const idB = plantElements[j].typeId.slice(6);
			const plantB = getPlant(idB);
			if (!plantB) continue;

			const key = [idA, idB].sort().join(':');
			if (seen.has(key)) continue;
			seen.add(key);

			if (plantA.companions.includes(idB) || plantB.companions.includes(idA)) {
				result.good.push({
					plantA,
					plantB,
					reason: `${plantA.name} and ${plantB.name} grow well together`
				});
			}

			if (plantA.antagonists.includes(idB) || plantB.antagonists.includes(idA)) {
				result.bad.push({
					plantA,
					plantB,
					reason: `${plantA.name} and ${plantB.name} should be kept apart`
				});
			}
		}
	}

	return result;
}

/** Suggest a food forest guild around a given center plant. */
export function suggestGuild(centerId: string, climates?: string[]): GuildSuggestion | null {
	const center = getPlant(centerId);
	if (!center) return null;

	const layers: Plant['layer'][] = ['understory', 'shrub', 'herbaceous', 'groundcover', 'root', 'vine'];
	const suggestion: GuildSuggestion = { centerPlant: center, layers: [] };

	for (const layer of layers) {
		if (layer === center.layer) continue;
		const candidates = plants.filter((p) => {
			if (p.id === centerId) return false;
			if (p.layer !== layer) return false;
			if (climates && !p.climates.some((c) => climates.includes(c))) return false;
			// Prefer companions, exclude antagonists
			if (center.antagonists.includes(p.id)) return false;
			return true;
		});

		// Sort: companions first, then nitrogen fixers, then dynamic accumulators
		candidates.sort((a, b) => {
			const aComp = center.companions.includes(a.id) ? 2 : 0;
			const bComp = center.companions.includes(b.id) ? 2 : 0;
			const aNfix = a.nitrogenFixer ? 1 : 0;
			const bNfix = b.nitrogenFixer ? 1 : 0;
			return (bComp + bNfix) - (aComp + aNfix);
		});

		suggestion.layers.push({ layer, suggestions: candidates.slice(0, 3) });
	}

	return suggestion;
}

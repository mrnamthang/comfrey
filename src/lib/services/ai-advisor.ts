/**
 * AI-powered design advisor with optional LLM API integration.
 * Falls back to rule-based analysis when no API key is configured.
 */

import type { Element, SiteAnalysis, Zone } from '$lib/types';
import { processEvent, type DesignEvent } from './advisor';
import { checkCompanions } from './companions';
import { getPlant } from '$lib/catalog/plants';

export interface AISettings {
	provider: 'none' | 'openai' | 'anthropic' | 'ollama';
	apiKey: string;
	model: string;
	baseUrl?: string; // for Ollama
}

export interface DesignReview {
	score: number; // 0-100
	strengths: string[];
	suggestions: string[];
	warnings: string[];
}

const DEFAULT_SETTINGS: AISettings = {
	provider: 'none',
	apiKey: '',
	model: ''
};

let settings: AISettings = { ...DEFAULT_SETTINGS };

export function getAISettings(): AISettings {
	return { ...settings };
}

export function updateAISettings(newSettings: Partial<AISettings>): void {
	settings = { ...settings, ...newSettings };
}

/** Load settings from localStorage. */
export function loadAISettings(): void {
	try {
		const stored = localStorage.getItem('comfrey-ai-settings');
		if (stored) {
			settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
		}
	} catch { /* ignore */ }
}

/** Save settings to localStorage. */
export function saveAISettings(): void {
	try {
		localStorage.setItem('comfrey-ai-settings', JSON.stringify(settings));
	} catch { /* ignore */ }
}

/**
 * Generate a design review. Uses LLM if configured, otherwise rule-based.
 */
export async function generateDesignReview(
	elements: Element[],
	zones: Zone[],
	analysis: SiteAnalysis | null,
	advisorState: { seenTips: string[]; dismissedTips: string[]; appliedTips: string[] }
): Promise<DesignReview> {
	if (settings.provider !== 'none' && settings.apiKey) {
		return generateLLMReview(elements, zones, analysis);
	}
	return generateRuleBasedReview(elements, zones, analysis, advisorState);
}

/**
 * Rule-based design review — no API needed.
 */
function generateRuleBasedReview(
	elements: Element[],
	zones: Zone[],
	analysis: SiteAnalysis | null,
	advisorState: { seenTips: string[]; dismissedTips: string[]; appliedTips: string[] }
): DesignReview {
	const strengths: string[] = [];
	const suggestions: string[] = [];
	const warnings: string[] = [];
	let score = 50; // start at 50

	// Check element diversity
	const typeIds = new Set(elements.map((e) => e.typeId));
	if (typeIds.size >= 5) {
		strengths.push(`Good diversity: ${typeIds.size} different element types`);
		score += 5;
	} else if (elements.length > 0) {
		suggestions.push('Add more variety — aim for at least 5 different element types');
	}

	// Check for house
	if (elements.some((e) => e.typeId === 'house')) {
		strengths.push('House placed — Zone 0 anchor established');
		score += 5;
	} else {
		suggestions.push('Place a house to establish Zone 0 and anchor your design');
	}

	// Check for water infrastructure
	if (elements.some((e) => e.typeId === 'water-tank')) {
		strengths.push('Water storage in place');
		score += 5;
	} else {
		suggestions.push('Add a water tank — water storage is critical for any permaculture site');
	}

	// Check zones
	if (zones.length >= 3) {
		strengths.push(`${zones.length} zones defined — good spatial planning`);
		score += 10;
	} else if (zones.length > 0) {
		suggestions.push('Define more zones for better spatial organization');
		score += 3;
	} else {
		suggestions.push('Generate zones to organize your design by frequency of use');
	}

	// Check companion planting
	const plantElements = elements.filter((e) => e.typeId.startsWith('plant:'));
	if (plantElements.length >= 3) {
		const companions = checkCompanions(elements);
		if (companions.good.length > 0) {
			strengths.push(`${companions.good.length} good companion pairings found`);
			score += companions.good.length * 2;
		}
		if (companions.bad.length > 0) {
			warnings.push(`${companions.bad.length} antagonistic plant pairings — check Guilds panel`);
			score -= companions.bad.length * 3;
		}
	}

	// Check for nitrogen fixers
	const nFixers = plantElements.filter((e) => {
		const plant = getPlant(e.typeId.slice(6));
		return plant?.nitrogenFixer;
	});
	if (nFixers.length > 0) {
		strengths.push(`${nFixers.length} nitrogen-fixing plants — building soil fertility`);
		score += 5;
	} else if (plantElements.length > 0) {
		suggestions.push('Add nitrogen-fixing plants (clover, beans, pigeon pea) to build soil');
	}

	// Check for compost
	if (elements.some((e) => e.typeId === 'compost')) {
		strengths.push('Compost system included — nutrient cycling established');
		score += 5;
	} else {
		suggestions.push('Add a compost system to close the nutrient loop');
	}

	// Check for paths
	if (elements.some((e) => e.typeId === 'path')) {
		strengths.push('Path network started');
		score += 3;
	} else if (elements.length >= 3) {
		suggestions.push('Add paths to connect major elements for easy access');
	}

	// Check applied advisor tips
	if (advisorState.appliedTips.length >= 3) {
		strengths.push(`Applied ${advisorState.appliedTips.length} advisor suggestions`);
		score += advisorState.appliedTips.length;
	}

	// Design review event tips
	const reviewEvent: DesignEvent = { type: 'design_review_requested' };
	const reviewTips = processEvent(reviewEvent, advisorState, elements, zones);
	for (const tip of reviewTips.slice(0, 5)) {
		suggestions.push(tip.shortReminder);
	}

	score = Math.max(0, Math.min(100, score));

	return { score, strengths, suggestions, warnings };
}

/**
 * LLM-powered design review.
 */
async function generateLLMReview(
	elements: Element[],
	zones: Zone[],
	analysis: SiteAnalysis | null
): Promise<DesignReview> {
	const designSummary = buildDesignSummary(elements, zones, analysis);

	const systemPrompt = `You are a permaculture design advisor. Analyze the following land design and provide a review. Respond in JSON format with: { "score": number 0-100, "strengths": string[], "suggestions": string[], "warnings": string[] }. Be specific and actionable.`;

	try {
		let response: string;

		if (settings.provider === 'openai') {
			response = await callOpenAI(systemPrompt, designSummary);
		} else if (settings.provider === 'anthropic') {
			response = await callAnthropic(systemPrompt, designSummary);
		} else if (settings.provider === 'ollama') {
			response = await callOllama(systemPrompt, designSummary);
		} else {
			throw new Error('No provider configured');
		}

		// Parse JSON from response
		const jsonMatch = response.match(/\{[\s\S]*\}/);
		if (!jsonMatch) throw new Error('No JSON in response');
		return JSON.parse(jsonMatch[0]);
	} catch (err) {
		console.error('LLM review failed:', err);
		// Fall back to rule-based
		return generateRuleBasedReview(elements, zones, analysis, { seenTips: [], dismissedTips: [], appliedTips: [] });
	}
}

function buildDesignSummary(elements: Element[], zones: Zone[], analysis: SiteAnalysis | null): string {
	const lines: string[] = [];

	if (analysis) {
		lines.push(`Climate: ${analysis.climate.type}, Zone ${analysis.climate.zone}, ${analysis.climate.hemisphere} hemisphere`);
		lines.push(`Rainfall: ${analysis.climate.avgRainfall}mm/year, Frost-free days: ${analysis.climate.frostFreeDays}`);
		lines.push(`Slope: ${analysis.elevation.slope}° ${analysis.elevation.aspectLabel}`);
		lines.push(`Wind: ${analysis.wind.label}`);
	}

	lines.push(`\nElements (${elements.length}):`);
	for (const el of elements) {
		const name = el.properties.label ?? el.typeId;
		lines.push(`- ${name} (zone ${el.properties.zone ?? '?'})`);
	}

	lines.push(`\nZones (${zones.length}):`);
	for (const z of zones) {
		lines.push(`- Zone ${z.level}: ${z.description}`);
	}

	return lines.join('\n');
}

async function callOpenAI(system: string, user: string): Promise<string> {
	const res = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${settings.apiKey}`
		},
		body: JSON.stringify({
			model: settings.model || 'gpt-4o-mini',
			messages: [
				{ role: 'system', content: system },
				{ role: 'user', content: user }
			],
			temperature: 0.7
		})
	});
	if (!res.ok) throw new Error(`OpenAI: ${res.status}`);
	const data = await res.json();
	return data.choices[0].message.content;
}

async function callAnthropic(system: string, user: string): Promise<string> {
	const res = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': settings.apiKey,
			'anthropic-version': '2023-06-01',
			'anthropic-dangerous-direct-browser-access': 'true'
		},
		body: JSON.stringify({
			model: settings.model || 'claude-sonnet-4-5-20250929',
			max_tokens: 1024,
			system,
			messages: [{ role: 'user', content: user }]
		})
	});
	if (!res.ok) throw new Error(`Anthropic: ${res.status}`);
	const data = await res.json();
	return data.content[0].text;
}

async function callOllama(system: string, user: string): Promise<string> {
	const baseUrl = settings.baseUrl || 'http://localhost:11434';
	const res = await fetch(`${baseUrl}/api/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: settings.model || 'llama3',
			messages: [
				{ role: 'system', content: system },
				{ role: 'user', content: user }
			],
			stream: false
		})
	});
	if (!res.ok) throw new Error(`Ollama: ${res.status}`);
	const data = await res.json();
	return data.message.content;
}

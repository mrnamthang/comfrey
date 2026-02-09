/**
 * Unit conversion utilities.
 */

export function sqMetersToHectares(sqm: number): number {
	return sqm / 10000;
}

export function sqMetersToAcres(sqm: number): number {
	return sqm / 4046.86;
}

export function metersToFeet(m: number): number {
	return m * 3.28084;
}

export function feetToMeters(ft: number): number {
	return ft / 3.28084;
}

export function formatArea(sqm: number, system: 'metric' | 'imperial' = 'metric'): string {
	if (system === 'imperial') {
		const acres = sqMetersToAcres(sqm);
		return acres >= 1
			? `${acres.toFixed(2)} acres`
			: `${Math.round(sqm * 10.7639)} sq ft`;
	}
	const hectares = sqMetersToHectares(sqm);
	return hectares >= 1
		? `${hectares.toFixed(2)} ha`
		: `${Math.round(sqm)} sqm`;
}

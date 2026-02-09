/**
 * Zone presets, colors, and descriptions.
 */

export const zonePresets = [
	{ level: 0 as const, color: 'rgba(26, 26, 26, 0.4)', description: 'Home / center of activity' },
	{ level: 1 as const, color: 'rgba(34, 139, 34, 0.2)', description: 'Daily use — herbs, salad greens, clothesline' },
	{ level: 2 as const, color: 'rgba(50, 205, 50, 0.15)', description: 'Frequent use — orchard, main garden beds, chickens' },
	{ level: 3 as const, color: 'rgba(144, 238, 144, 0.1)', description: 'Occasional — large crops, pasture, food forest' },
	{ level: 4 as const, color: 'rgba(210, 180, 140, 0.1)', description: 'Minimal management — timber, foraging, windbreak' },
	{ level: 5 as const, color: 'rgba(128, 128, 128, 0.05)', description: 'Wild — unmanaged, wildlife habitat, conservation' }
] as const;

export const zoneBufferDistances = {
	tiny:   { maxArea: 2000,  zone1: 8,  zone2: 20, zone3: Infinity },
	small:  { maxArea: 10000, zone1: 15, zone2: 40, zone3: 80 },
	medium: { maxArea: 50000, zone1: 20, zone2: 60, zone3: 150 },
	large:  { maxArea: Infinity, zone1: 25, zone2: 80, zone3: 200 }
} as const;

export function getBufferDistances(propertyArea: number) {
	if (propertyArea < 2000) return zoneBufferDistances.tiny;
	if (propertyArea < 10000) return zoneBufferDistances.small;
	if (propertyArea < 50000) return zoneBufferDistances.medium;
	return zoneBufferDistances.large;
}

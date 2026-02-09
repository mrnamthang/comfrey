/**
 * MVP Element type definitions (8 items).
 */

import type { ElementType } from '$lib/types';

export const elementTypes: ElementType[] = [
	{
		id: 'house',
		name: 'House',
		category: 'structure',
		icon: '<svg viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h14v-8h3L12 3z" fill="currentColor"/></svg>',
		defaultSize: { width: 12, height: 10 },
		canRotate: true,
		canResize: false,
		implementationPhase: 1,
		metaSchema: {
			bedrooms: { type: 'number', label: 'Bedrooms', required: false, default: 3, min: 1, max: 10 },
			stories: { type: 'number', label: 'Stories', required: false, default: 1, min: 1, max: 3 }
		}
	},
	{
		id: 'shed',
		name: 'Shed',
		category: 'structure',
		icon: '<svg viewBox="0 0 24 24"><path d="M4 11l8-5 8 5v8H4v-8z" fill="currentColor"/><rect x="10" y="14" width="4" height="5" fill="white"/></svg>',
		defaultSize: { width: 4, height: 3 },
		canRotate: true,
		canResize: false,
		implementationPhase: 1,
		metaSchema: {
			purpose: {
				type: 'select',
				label: 'Purpose',
				required: false,
				default: 'tools',
				options: ['tools', 'storage', 'workshop']
			}
		}
	},
	{
		id: 'garden-bed',
		name: 'Garden Bed',
		category: 'plant',
		icon: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor"/><line x1="3" y1="9.5" x2="21" y2="9.5" stroke="white" stroke-width="1.2"/><line x1="3" y1="14" x2="21" y2="14" stroke="white" stroke-width="1.2"/></svg>',
		defaultSize: { width: 3, height: 1.2 },
		canRotate: true,
		canResize: false,
		implementationPhase: 2,
		metaSchema: {
			raised: { type: 'boolean', label: 'Raised bed', required: false, default: false },
			irrigated: { type: 'boolean', label: 'Irrigated', required: false, default: false }
		}
	},
	{
		id: 'fruit-tree',
		name: 'Fruit Tree',
		category: 'plant',
		icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="6" fill="currentColor"/><rect x="11" y="15" width="2" height="6" fill="currentColor"/></svg>',
		defaultSize: { width: 4, height: 4 },
		canRotate: false,
		canResize: false,
		implementationPhase: 2,
		metaSchema: {
			species: { type: 'string', label: 'Species', required: false },
			yearsToFruit: { type: 'number', label: 'Years to fruit', required: false, default: 3, min: 1, max: 20 }
		}
	},
	{
		id: 'water-tank',
		name: 'Water Tank',
		category: 'water',
		icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="currentColor"/><ellipse cx="12" cy="8" rx="8" ry="3" fill="currentColor" opacity="0.6"/></svg>',
		defaultSize: { width: 2.5, height: 2.5 },
		canRotate: false,
		canResize: false,
		implementationPhase: 1,
		metaSchema: {
			capacityLiters: {
				type: 'number',
				label: 'Capacity',
				required: false,
				default: 5000,
				min: 500,
				max: 100000,
				unit: 'liters'
			}
		}
	},
	{
		id: 'chicken-coop',
		name: 'Chicken Coop',
		category: 'animal',
		icon: '<svg viewBox="0 0 24 24"><path d="M4 12l5-4 5 4v6H4v-6z" fill="currentColor"/><line x1="16" y1="10" x2="16" y2="18" stroke="currentColor" stroke-width="1.5"/><line x1="19" y1="10" x2="19" y2="18" stroke="currentColor" stroke-width="1.5"/><line x1="14" y1="13" x2="21" y2="13" stroke="currentColor" stroke-width="1.5"/><line x1="14" y1="16" x2="21" y2="16" stroke="currentColor" stroke-width="1.5"/></svg>',
		defaultSize: { width: 3, height: 2 },
		canRotate: true,
		canResize: false,
		implementationPhase: 3,
		metaSchema: {
			maxChickens: { type: 'number', label: 'Max chickens', required: false, default: 6, min: 2, max: 50 }
		}
	},
	{
		id: 'compost',
		name: 'Compost',
		category: 'utility',
		icon: '<svg viewBox="0 0 24 24"><path d="M6 6h12l-2 14H8L6 6z" fill="currentColor"/><line x1="5" y1="6" x2="19" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
		defaultSize: { width: 1.5, height: 1.5 },
		canRotate: false,
		canResize: false,
		implementationPhase: 2,
		metaSchema: {
			compostType: {
				type: 'select',
				label: 'Type',
				required: false,
				default: 'bin',
				options: ['bin', 'tumbler', 'pile']
			}
		}
	},
	{
		id: 'path',
		name: 'Path',
		category: 'path',
		icon: '<svg viewBox="0 0 24 24"><path d="M4 20 Q8 14 12 12 Q16 10 20 4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none" stroke-dasharray="4 3"/></svg>',
		defaultSize: { width: 1, height: 1 },
		canRotate: false,
		canResize: false,
		implementationPhase: 1,
		metaSchema: {
			surface: {
				type: 'select',
				label: 'Surface',
				required: false,
				default: 'gravel',
				options: ['gravel', 'mulch', 'concrete', 'dirt']
			}
		}
	}
];

export function getElementType(id: string): ElementType | undefined {
	return elementTypes.find((t) => t.id === id);
}

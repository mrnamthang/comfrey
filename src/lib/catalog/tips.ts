/**
 * MVP Advisor tip definitions (15 tips).
 * See PRD Section 5.7 for the full catalog.
 *
 * Tips are matched by the advisor engine (src/lib/services/advisor.ts)
 * against design events. Each tip has a trigger, optional condition,
 * climate scope, and priority for display ordering.
 */

import type { AdvisorTip } from '$lib/types';

export const advisorTips: AdvisorTip[] = [
	// ----------------------------------------------------------------
	// 1. Analysis complete -- welcome to your land
	// ----------------------------------------------------------------
	{
		id: 'analysis-complete-summary',
		trigger: { type: 'analysis_complete' },
		climate: 'all',
		headline: 'Your land has character',
		explanation:
			'We analysed your site and found its climate zone, sun path, prevailing wind, and slope. These natural patterns are the foundation of a good permaculture design -- work with them, not against them.',
		shortReminder: 'Review your site analysis before placing elements.',
		learnMore:
			'In permaculture, we call these factors "sectors" -- external energies that flow through your land. Sun, wind, water runoff, and fire risk each come from a direction. Understanding sectors lets you place elements to capture helpful energy and deflect harmful energy.',
		priority: 95
	},

	// ----------------------------------------------------------------
	// 2. House placed -- Zone 0
	// ----------------------------------------------------------------
	{
		id: 'house-placed-zone0',
		trigger: { type: 'element_placed', elementType: 'house' },
		climate: 'all',
		headline: 'The house anchors everything',
		explanation:
			'In permaculture, the house is Zone 0 -- the centre of your design. Every other zone radiates outward from it. Place the elements you use most often closest to the house, and let less-visited areas sit further away.',
		shortReminder: 'House = Zone 0. Place daily-use elements nearby.',
		learnMore:
			'Zone planning is based on the frequency of human interaction. Zone 0 is the house itself, Zone 1 is visited multiple times a day (herbs, salad greens), and each subsequent zone sees less traffic. This saves energy by minimising unnecessary walking.',
		priority: 90
	},

	// ----------------------------------------------------------------
	// 3. Water tank placed -- elevation matters
	// ----------------------------------------------------------------
	{
		id: 'water-tank-placed',
		trigger: { type: 'element_placed', elementType: 'water-tank' },
		climate: 'all',
		headline: 'Water flows downhill',
		explanation:
			'Place your water tank at the highest practical point on your land. Gravity will push water to your gardens, orchard, and animals without a pump -- saving energy and money.',
		shortReminder: 'Tank uphill = free irrigation pressure.',
		learnMore:
			'A 1-metre height difference gives roughly 0.1 bar (1.5 psi) of water pressure. A tank 10 metres above your garden delivers enough pressure for drip irrigation without any electricity. This is the permaculture principle of "catch and store energy" at work.',
		action: {
			label: 'Move tank uphill',
			type: 'move_element_uphill'
		},
		priority: 85
	},

	// ----------------------------------------------------------------
	// 4. Zone 1 created -- daily orbit
	// ----------------------------------------------------------------
	{
		id: 'zone1-created',
		trigger: { type: 'zone_created', zoneLevel: 1 },
		climate: 'all',
		headline: 'Zone 1 is your daily orbit',
		explanation:
			'This is the area you walk through multiple times a day. Fill it with herbs, salad greens, a clothesline, and anything you harvest or check on daily. Keep it within a few steps of the back door.',
		shortReminder: 'Herbs, salad, and daily harvests go in Zone 1.',
		learnMore:
			'Zone 1 typically extends 5-15 metres from the house. Because you visit it so often, it gets the most attention and maintenance. High-yield, quick-harvest crops thrive here because you will notice pests early and water reliably.',
		priority: 80
	},

	// ----------------------------------------------------------------
	// 5. Zone 2 created -- family food
	// ----------------------------------------------------------------
	{
		id: 'zone2-created',
		trigger: { type: 'zone_created', zoneLevel: 2 },
		climate: 'all',
		headline: 'Zone 2 feeds the family',
		explanation:
			'Zone 2 is where the bulk of your food comes from -- fruit trees, larger vegetable beds, chicken runs, and berry bushes. It needs regular but not daily attention.',
		shortReminder: 'Orchard, poultry, and staple crops belong in Zone 2.',
		learnMore:
			'A well-planned Zone 2 can provide a household with most of its fruit, eggs, and seasonal vegetables. Group plants with similar water needs together and place the chicken coop where the birds can forage under fruit trees -- they eat fallen fruit and fertilise the soil.',
		priority: 75
	},

	// ----------------------------------------------------------------
	// 6. Garden bed placed -- sun orientation
	// ----------------------------------------------------------------
	{
		id: 'garden-bed-sun',
		trigger: { type: 'element_placed', elementType: 'garden-bed' },
		climate: 'all',
		headline: 'Sun chases your garden beds',
		explanation:
			'Orient your garden beds so the long axis runs east-west. This gives each row maximum exposure as the sun crosses the sky, and prevents taller plants from shading shorter ones.',
		shortReminder: 'Long axis east-west for maximum sun.',
		learnMore:
			'In the northern hemisphere the sun tracks across the southern sky, so beds running east-west let light reach every row from the south. In the southern hemisphere the sun is in the northern sky -- the same principle applies in reverse. Raised beds angled slightly toward the sun warm up faster in spring.',
		action: {
			label: 'Rotate to face the sun',
			type: 'rotate_element_to_sun'
		},
		priority: 70
	},

	// ----------------------------------------------------------------
	// 7. Fruit tree placed -- food forest layers
	// ----------------------------------------------------------------
	{
		id: 'fruit-tree-layers',
		trigger: { type: 'element_placed', elementType: 'fruit-tree' },
		climate: 'all',
		headline: 'Think in 3D layers',
		explanation:
			'A single fruit tree can anchor a whole food forest guild. Underneath the canopy you can plant shrubs, herbs, groundcovers, and root crops -- seven layers of food production in the space of one tree.',
		shortReminder: 'Plant guilds under fruit trees for stacked yields.',
		learnMore:
			'The seven layers of a food forest are: canopy (large trees), understorey (small trees), shrub, herbaceous, groundcover, root/tuber, and vine/climber. Each layer captures light that would otherwise be wasted. Start with the tree and add lower layers as it matures.',
		priority: 68
	},

	// ----------------------------------------------------------------
	// 8. Chicken coop placed -- integration
	// ----------------------------------------------------------------
	{
		id: 'chicken-coop-integration',
		trigger: { type: 'element_placed', elementType: 'chicken-coop' },
		climate: 'all',
		headline: 'Chickens are workers',
		explanation:
			'Place the chicken coop between the compost area and the garden beds. Chickens turn kitchen scraps into fertiliser, eat pest insects, and scratch mulch into the soil -- three jobs in one animal.',
		shortReminder: 'Coop near compost and garden for maximum benefit.',
		learnMore:
			'In a "chicken tractor" system the birds are rotated through garden beds after harvest. They clear crop residue, eat weed seeds, add manure, and scratch the surface -- preparing the bed for the next planting with almost no human labour.',
		priority: 65
	},

	// ----------------------------------------------------------------
	// 9. Shed placed -- access paths
	// ----------------------------------------------------------------
	{
		id: 'shed-access',
		trigger: { type: 'element_placed', elementType: 'shed' },
		climate: 'all',
		headline: 'Access matters',
		explanation:
			'A tool shed that is hard to reach gets ignored. Place it along a natural path between the house and your main work areas so you pass it every day and can grab tools without a detour.',
		shortReminder: 'Shed on a natural path between house and garden.',
		learnMore:
			'Observe your own movement patterns. After a week of living on the land, the "desire paths" -- where the grass is worn down -- reveal the routes you actually walk. Place the shed on one of those routes so it becomes a natural stop, not a chore to visit.',
		condition: { type: 'distance_from_house', maxMeters: 50 },
		priority: 55
	},

	// ----------------------------------------------------------------
	// 10. Compost placed -- close the nutrient loop
	// ----------------------------------------------------------------
	{
		id: 'compost-loop',
		trigger: { type: 'element_placed', elementType: 'compost' },
		climate: 'all',
		headline: 'Close the loop',
		explanation:
			'Place the compost between the kitchen door and your garden beds. Kitchen scraps go in on the way out, finished compost goes on the beds on the way back. Short distances make the habit stick.',
		shortReminder: 'Compost between kitchen and garden.',
		learnMore:
			'A well-managed compost system processes kitchen and garden waste in 8-12 weeks. The resulting humus feeds soil biology, retains moisture, and slowly releases nutrients. Placing it close to both source (kitchen) and destination (garden) removes the friction that makes people stop composting.',
		condition: { type: 'distance_from_house', maxMeters: 30 },
		priority: 60
	},

	// ----------------------------------------------------------------
	// 11. Water tank near garden bed -- gravity irrigation
	// ----------------------------------------------------------------
	{
		id: 'tank-near-garden',
		trigger: {
			type: 'element_near',
			elementA: 'water-tank',
			elementB: 'garden-bed',
			maxDistance: 30
		},
		condition: { type: 'elevation_compare', elementA: 'water-tank', elementB: 'garden-bed', expected: 'higher' },
		climate: 'all',
		headline: 'Gravity-fed irrigation',
		explanation:
			'Your water tank is close to a garden bed and positioned uphill -- perfect for gravity-fed drip irrigation. Connect a hose or pipe and let gravity do the work, no pump needed.',
		shortReminder: 'Tank above garden = free drip irrigation.',
		learnMore:
			'Gravity-fed drip systems are the most water-efficient irrigation method available to home growers. They deliver water directly to the root zone with minimal evaporation. Because there are no moving parts, maintenance is limited to occasional filter cleaning.',
		priority: 82
	},

	// ----------------------------------------------------------------
	// 12. Water tank at uphill position -- positive reinforcement
	// ----------------------------------------------------------------
	{
		id: 'tank-uphill-good',
		trigger: { type: 'element_position', elementType: 'water-tank', check: 'uphill' },
		climate: 'all',
		headline: 'Good water placement',
		explanation:
			'Well done -- your water tank is at a high point on the property. Water stored at elevation is potential energy you can tap with nothing more than a hose. This is one of the most valuable placements in a permaculture design.',
		shortReminder: 'Tank is well placed at a high point.',
		learnMore:
			'Bill Mollison, the co-founder of permaculture, called water stored at height "liquid gold." Every metre of elevation gives you free pressure. Combined with a rainwater catchment roof, a hilltop tank can supply a household and garden with zero energy input beyond rainfall.',
		priority: 50
	},

	// ----------------------------------------------------------------
	// 13. Design review -- sector check
	// ----------------------------------------------------------------
	{
		id: 'design-review-sectors',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Sector analysis',
		explanation:
			'Before finalising your layout, check that you have accounted for the major sectors: sun path, prevailing wind, water flow, and any fire or noise corridors. Each sector is an energy flowing through your site that your design should harness or buffer.',
		shortReminder: 'Check sun, wind, water, and fire sectors.',
		learnMore:
			'Draw lines on your map for each sector. The sun sector sweeps from east to west (via south in the northern hemisphere, via north in the southern). The wind sector shows your prevailing wind direction. Water runs downhill along the slope. Place windbreaks against cold winds, open views toward winter sun, and keep fire-prone vegetation away from structures.',
		priority: 88
	},

	// ----------------------------------------------------------------
	// 14. Wizard boundary step -- every boundary is unique
	// ----------------------------------------------------------------
	{
		id: 'wizard-boundary',
		trigger: { type: 'wizard_step', step: 'boundary' },
		climate: 'all',
		headline: 'Every boundary is unique',
		explanation:
			'The shape of your boundary affects where zones fall, how water runs, and how sunlight reaches different corners. Trace it carefully -- an accurate boundary means better analysis and more useful tips later.',
		shortReminder: 'Accurate boundary = better design recommendations.',
		learnMore:
			'An irregularly shaped block can be an advantage. Narrow corridors make great windbreaks, odd corners become micro-climates for tender plants, and longer boundaries mean more "edge" -- the most productive zone in any ecosystem.',
		priority: 92
	},

	// ----------------------------------------------------------------
	// 15. Path placed -- connectivity
	// ----------------------------------------------------------------
	{
		id: 'path-connectivity',
		trigger: { type: 'element_placed', elementType: 'path' },
		climate: 'all',
		headline: 'Connect the dots',
		explanation:
			'Paths link the places you visit most: house to garden, garden to compost, compost to chicken coop. Good paths reduce mud, save time, and make the property pleasant to walk through in any weather.',
		shortReminder: 'Link house, garden, compost, and coop with paths.',
		learnMore:
			'In permaculture, paths double as design elements. A gravel path acts as a firebreak, a mulched path suppresses weeds and slowly adds organic matter to adjacent beds, and a keyhole path maximises garden bed area while minimising walkway space.',
		priority: 45
	}
];

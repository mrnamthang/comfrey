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
	},

	// ----------------------------------------------------------------
	// 16-50: Expanded tips for Phase 2
	// ----------------------------------------------------------------
	{
		id: 'design-review-zones',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Zone efficiency check',
		explanation:
			'Review whether your most-visited elements are in the closest zones. Herbs and salads should be in Zone 1, orchard in Zone 2, and field crops in Zone 3.',
		shortReminder: 'Frequent-use items close to house.',
		priority: 87
	},
	{
		id: 'design-review-water',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Water strategy review',
		explanation:
			'Check that water flows from collection (tank) downhill through your productive zones. Every drop should be used at least twice before leaving the site.',
		shortReminder: 'Water should cascade through productive zones.',
		priority: 86
	},
	{
		id: 'design-review-access',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Access and circulation',
		explanation:
			'Ensure all major areas are connected by paths. Consider: can you get a wheelbarrow from the compost to every garden bed? Is there vehicle access for emergencies?',
		shortReminder: 'Wheelbarrow access to all beds.',
		priority: 84
	},
	{
		id: 'design-review-diversity',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Biological diversity',
		explanation:
			'A resilient design has many species. Aim for at least 3 canopy trees, 5 shrubs, and 10+ herbs/groundcovers. Diversity protects against pest outbreaks and provides year-round harvests.',
		shortReminder: 'More species = more resilience.',
		priority: 83
	},
	{
		id: 'design-review-windbreak',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Windbreak placement',
		explanation:
			'Your prevailing wind sector should have a windbreak. Deciduous trees let winter sun through while blocking cold wind. Place the windbreak 3-5x its height from the protected area.',
		shortReminder: 'Buffer wind before it hits productive zones.',
		priority: 81
	},
	{
		id: 'garden-bed-tropical-mulch',
		trigger: { type: 'element_placed', elementType: 'garden-bed' },
		climate: 'tropical',
		headline: 'Mulch is your best friend',
		explanation:
			'In tropical climates, heavy mulch (15-20 cm) keeps soil cool, retains moisture through dry spells, and suppresses aggressive weeds. Use banana leaves, palm fronds, or wood chips.',
		shortReminder: 'Heavy mulch for tropical beds.',
		priority: 69
	},
	{
		id: 'garden-bed-arid-shade',
		trigger: { type: 'element_placed', elementType: 'garden-bed' },
		climate: 'arid',
		headline: 'Shade your garden beds',
		explanation:
			'In arid climates, garden beds benefit from 30-50% shade cloth during the hottest months. Position beds on the shaded side of trees or structures to reduce water needs by up to 40%.',
		shortReminder: 'Shade reduces water use by 40%.',
		priority: 67
	},
	{
		id: 'water-tank-arid',
		trigger: { type: 'element_placed', elementType: 'water-tank' },
		climate: 'arid',
		headline: 'Every drop counts',
		explanation:
			'In arid climates, size your tank generously — aim for at least 20,000 litres per 100 sqm of garden. Connect all roof surfaces and consider a first-flush diverter to keep water clean.',
		shortReminder: 'Size tanks generously in dry climates.',
		priority: 84
	},
	{
		id: 'fruit-tree-guild',
		trigger: { type: 'element_placed', elementType: 'fruit-tree' },
		climate: 'all',
		headline: 'Build a fruit tree guild',
		explanation:
			'Under each fruit tree, plant a guild: nitrogen fixers (clover, lupin), dynamic accumulators (comfrey), pest repellents (garlic, chives), and groundcovers (strawberry). Check the Guilds panel for suggestions.',
		shortReminder: 'Add support plants under fruit trees.',
		priority: 66
	},
	{
		id: 'fruit-tree-temperate-spacing',
		trigger: { type: 'element_placed', elementType: 'fruit-tree' },
		climate: 'temperate',
		headline: 'Space for the future canopy',
		explanation:
			'Standard fruit trees need 5-8m spacing. Dwarf varieties can be as close as 2-3m. Under-plant with shade-tolerant crops while waiting for the canopy to fill in.',
		shortReminder: '5-8m spacing for standard trees.',
		priority: 64
	},
	{
		id: 'zone3-created',
		trigger: { type: 'zone_created', zoneLevel: 3 },
		climate: 'all',
		headline: 'Zone 3: The farm zone',
		explanation:
			'Zone 3 is for larger-scale production: main crop areas, orchards, pasture for livestock, and large water features. Visit it weekly but it should be largely self-maintaining.',
		shortReminder: 'Main crops and orchards in Zone 3.',
		priority: 72
	},
	{
		id: 'zone4-created',
		trigger: { type: 'zone_created', zoneLevel: 4 },
		climate: 'all',
		headline: 'Zone 4: Semi-wild',
		explanation:
			'Zone 4 is semi-managed: timber, forage, windbreak, and wildlife corridors. Minimal intervention — plant once and let nature do most of the work.',
		shortReminder: 'Timber and windbreaks in Zone 4.',
		priority: 70
	},
	{
		id: 'zone5-created',
		trigger: { type: 'zone_created', zoneLevel: 5 },
		climate: 'all',
		headline: 'Zone 5: Wild sanctuary',
		explanation:
			'Zone 5 is unmanaged wilderness. It is your reference point — observe what grows here naturally and you will understand what your land wants to become. It is also habitat for beneficial insects and wildlife.',
		shortReminder: 'Leave Zone 5 wild for observation.',
		priority: 68
	},
	{
		id: 'house-orientation-north',
		trigger: { type: 'element_placed', elementType: 'house' },
		hemisphere: 'northern',
		climate: 'all',
		headline: 'Orient for winter sun',
		explanation:
			'In the northern hemisphere, place the main living areas and garden beds on the south side of the house. The north side is cooler and better for storage, garages, and shade-tolerant plants.',
		shortReminder: 'Living areas face south in N. hemisphere.',
		priority: 89
	},
	{
		id: 'house-orientation-south',
		trigger: { type: 'element_placed', elementType: 'house' },
		hemisphere: 'southern',
		climate: 'all',
		headline: 'Orient for winter sun',
		explanation:
			'In the southern hemisphere, place the main living areas and garden beds on the north side of the house. The south side is cooler and better for storage and shade-tolerant plants.',
		shortReminder: 'Living areas face north in S. hemisphere.',
		priority: 89
	},
	{
		id: 'chicken-coop-tropical',
		trigger: { type: 'element_placed', elementType: 'chicken-coop' },
		climate: 'tropical',
		headline: 'Ventilation is critical',
		explanation:
			'In tropical climates, chicken coops need maximum ventilation. Use wire mesh walls instead of solid ones, and provide shade with a living roof or vine-covered trellis.',
		shortReminder: 'Open-sided coops for tropical heat.',
		priority: 63
	},
	{
		id: 'wizard-location',
		trigger: { type: 'wizard_step', step: 'location' },
		climate: 'all',
		headline: 'Observe before you design',
		explanation:
			'The best permaculture designs come from careful observation. Before placing anything, spend time understanding how sun, wind, and water move through your site across the seasons.',
		shortReminder: 'Observe first, design second.',
		priority: 94
	},
	{
		id: 'wizard-analysis',
		trigger: { type: 'wizard_step', step: 'analysis' },
		climate: 'all',
		headline: 'Data meets intuition',
		explanation:
			'The site analysis gives you the measurable facts — sun angles, wind speed, slope. Combine these with your own observations: where does frost linger? Where do birds gather? Where is it naturally damp?',
		shortReminder: 'Numbers plus observation equals good design.',
		priority: 93
	},
	{
		id: 'design-review-edge',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Maximise edge',
		explanation:
			'The edge between two ecosystems (pond/land, forest/meadow, garden/path) is the most productive zone. Design curving boundaries, keyhole beds, and herb spirals to increase the amount of edge in your design.',
		shortReminder: 'More edge = more productivity.',
		priority: 79
	},
	{
		id: 'design-review-stacking',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Stack functions',
		explanation:
			'Every element should serve at least 3 functions. A pond produces fish, stores water, creates a micro-climate, reflects light, and attracts wildlife. If an element only does one thing, see if you can redesign it.',
		shortReminder: 'Each element serves 3+ functions.',
		priority: 78
	},
	{
		id: 'design-review-energy',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Energy cycling',
		explanation:
			'Trace the path of nutrients through your design: kitchen waste → compost → garden → kitchen. Water: roof → tank → drip irrigation → mulch → soil → plants. Every output should become an input somewhere else.',
		shortReminder: 'Every output is an input somewhere.',
		priority: 77
	},
	{
		id: 'design-review-succession',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Plan for succession',
		explanation:
			'Your design will change over time. Pioneer species give way to climax species. Plan for 3 stages: Year 1 (annuals and pioneers), Year 3 (shrubs established), Year 7+ (canopy closes). The action plan shows this phasing.',
		shortReminder: 'Design evolves over 1-7+ years.',
		priority: 76
	},
	{
		id: 'compost-tropical',
		trigger: { type: 'element_placed', elementType: 'compost' },
		climate: 'tropical',
		headline: 'Hot composting in the tropics',
		explanation:
			'Tropical heat accelerates decomposition. Your compost can be ready in 4-6 weeks. Place it in shade to prevent drying out and turn it frequently. Add dry carbon material (straw, dried leaves) to balance green inputs.',
		shortReminder: 'Shade your compost pile in the tropics.',
		priority: 58
	},
	{
		id: 'water-tank-subtropical-rainwater',
		trigger: { type: 'element_placed', elementType: 'water-tank' },
		climate: 'subtropical',
		headline: 'Monsoon harvesting',
		explanation:
			'Subtropical regions often have a wet season and a dry season. Size your tank to bridge the gap — calculate your dry-season water needs and ensure your roof catchment area can fill the tank during the wet months.',
		shortReminder: 'Size tanks for the dry season gap.',
		priority: 83
	},
	{
		id: 'shed-workshop',
		trigger: { type: 'element_placed', elementType: 'shed' },
		climate: 'all',
		headline: 'Multi-function shed',
		explanation:
			'Consider making your shed multi-functional: tool storage, potting bench, seed-starting area, and rain-water collection from its roof. A small overhang creates a dry workspace even in rain.',
		shortReminder: 'Shed = tools + potting + rainwater.',
		priority: 53
	},
	{
		id: 'design-review-fire',
		trigger: { type: 'design_review' },
		climate: 'arid',
		headline: 'Fire sector planning',
		explanation:
			'In fire-prone areas, create defensible space: 10m of low-fuel zone around structures, use fire-resistant species (succulents, stone fruit), and ensure gravel paths act as firebreaks.',
		shortReminder: 'Defensible space + fire-resistant plants.',
		priority: 85
	},
	{
		id: 'garden-bed-keyhole',
		trigger: { type: 'element_placed', elementType: 'garden-bed' },
		climate: 'all',
		headline: 'Consider keyhole beds',
		explanation:
			'Keyhole beds maximise growing area relative to path area. You can reach every part of the bed without stepping on the soil — this prevents compaction and keeps soil biology healthy.',
		shortReminder: 'Keyhole shape = more bed, less path.',
		priority: 62
	},
	{
		id: 'design-review-resilience',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Resilience audit',
		explanation:
			'Ask: what happens if the main water source fails? If a key tree dies? If the climate shifts? A resilient design has backups: multiple water sources, diverse species, and no single points of failure.',
		shortReminder: 'No single points of failure.',
		priority: 74
	},
	{
		id: 'companion-planting-tip',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Check companion planting',
		explanation:
			'Open the Guilds panel to see which of your plants grow well together and which should be separated. Good companions share nutrients, repel pests, and provide structural support for each other.',
		shortReminder: 'Check Guilds panel for combos.',
		priority: 73
	},
	{
		id: 'design-review-soil',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Soil building strategy',
		explanation:
			'Healthy soil is the foundation. Plan for: compost application, chop-and-drop mulching from dynamic accumulators (comfrey, banana leaves), nitrogen fixers (clover, pigeon pea), and minimal tillage.',
		shortReminder: 'Feed the soil, not just the plants.',
		priority: 72
	},
	{
		id: 'design-review-harvest',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Year-round harvest calendar',
		explanation:
			'Check that your plant selection provides food in every month. The Plants panel shows harvest months for each species. Aim for at least 2-3 crops harvestable in any given month.',
		shortReminder: 'Something to harvest every month.',
		priority: 71
	},
	{
		id: 'garden-bed-raised-temperate',
		trigger: { type: 'element_placed', elementType: 'garden-bed' },
		climate: 'temperate',
		headline: 'Raised beds warm faster',
		explanation:
			'In temperate climates, raised beds warm up 2-3 weeks earlier in spring, extending your growing season. Fill with a mix of logs (hugelkultur), compost, and topsoil for excellent drainage and fertility.',
		shortReminder: 'Raised beds extend the season.',
		priority: 61
	},
	{
		id: 'design-review-nitrogen',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Nitrogen budget',
		explanation:
			'Count your nitrogen fixers (clover, beans, peas, pigeon pea, lucerne). Aim for at least 30% of your planted area to include nitrogen-fixing species. They feed the soil without external fertiliser.',
		shortReminder: '30% nitrogen fixers target.',
		priority: 70
	},
	{
		id: 'fruit-tree-subtropical',
		trigger: { type: 'element_placed', elementType: 'fruit-tree' },
		climate: 'subtropical',
		headline: 'Tropical and temperate mix',
		explanation:
			'Subtropical climates can grow both tropical fruits (mango, avocado, citrus) and temperate fruits (apple, pear). Create micro-climates: warm frost-free spots for tropicals, cooler shaded areas for stone fruit that need chill hours.',
		shortReminder: 'Mix tropical and temperate species.',
		priority: 63
	},
	{
		id: 'design-review-pollinators',
		trigger: { type: 'design_review' },
		climate: 'all',
		headline: 'Pollinator highway',
		explanation:
			'Ensure flowers are blooming in every season to support pollinators. Herbs like borage, lavender, thyme, and rosemary are excellent bee plants. Plant them along pathways and borders for a "pollinator highway".',
		shortReminder: 'Flowers in every season for bees.',
		priority: 69
	}
];

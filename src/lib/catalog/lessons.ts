/**
 * Static lesson catalog: 14 permaculture lessons across 3 categories.
 * Each lesson contains rich HTML body content for the Learning Hub.
 */

import type { Lesson, LessonCategory } from '$lib/types';

export const lessons: Lesson[] = [
	// ============================================================
	// Permaculture Principles (5 lessons)
	// ============================================================
	{
		id: 'ethics',
		category: 'principles',
		title: 'The Three Ethics: Earth Care, People Care, Fair Share',
		summary:
			'The foundational ethics that guide every permaculture decision, from garden beds to whole-farm design.',
		readingTime: 4,
		body: `<h4>The Three Ethics of Permaculture</h4>
<p>Every permaculture design begins not with a technique, but with an ethical framework. Bill Mollison and David Holmgren established three core ethics that guide all decision-making in permaculture. These ethics are not abstract ideals — they are practical filters you apply every time you place an element on your land.</p>

<h5>1. Earth Care</h5>
<p>Earth Care means recognising that the Earth is the source of all life and that we have a responsibility to care for its living systems. In practice, this means:</p>
<ul>
<li>Building soil rather than depleting it — every design should increase organic matter over time</li>
<li>Protecting water sources and managing rainfall as a resource, not a nuisance</li>
<li>Creating habitat for wildlife, insects, and soil organisms</li>
<li>Reducing external inputs like synthetic fertilisers and pesticides</li>
<li>Working with natural patterns (wind, sun, water flow) rather than fighting them</li>
</ul>
<p>When you place a water tank uphill from your garden in Comfrey, you are practising Earth Care — gravity delivers water without energy inputs.</p>

<h5>2. People Care</h5>
<p>People Care recognises that if people's needs are met, they will not need to exploit the environment destructively. This ethic encompasses:</p>
<ul>
<li>Designing for human comfort — placing living spaces, kitchens, and gathering areas where they function best</li>
<li>Growing nutritious food close to the home (Zone 1) so it is accessible daily</li>
<li>Reducing the labour needed to maintain the system through smart design</li>
<li>Sharing knowledge and skills within communities</li>
<li>Creating beauty and spaces for rest alongside productive areas</li>
</ul>

<h5>3. Fair Share (Return of Surplus)</h5>
<p>The third ethic — sometimes called "Return of Surplus" — sets limits on consumption and redirects abundance. In a well-designed system, surplus is inevitable. The question is what you do with it:</p>
<ul>
<li>Share excess harvests with neighbours, food banks, or through seed swaps</li>
<li>Return organic matter to the soil via composting</li>
<li>Invest surplus energy (time, money, labour) into establishing new productive systems</li>
<li>Teach others what you have learned</li>
</ul>

<div class="tip">When reviewing your Comfrey design, ask three questions: Does this element improve the land over time? Does it serve the people who live here? Does the surplus flow back into the system or community?</div>`,
		relevance: { tools: [], climates: [] }
	},
	{
		id: 'twelve-principles',
		category: 'principles',
		title: "Holmgren's 12 Design Principles",
		summary:
			'David Holmgren\'s twelve principles provide a practical thinking toolkit for designing resilient, productive systems.',
		readingTime: 6,
		body: `<h4>David Holmgren's 12 Design Principles</h4>
<p>David Holmgren distilled decades of permaculture practice into twelve principles that serve as thinking tools. Each principle is both a guide for design and a lens for evaluating existing systems. Here they are, with practical applications for site design.</p>

<h5>1. Observe and Interact</h5>
<p>Before placing a single element, spend time on your land across seasons. Watch where water pools after rain, where frost settles, where the sun hits in winter versus summer. Comfrey's analysis tools give you a head start, but nothing replaces direct observation.</p>

<h5>2. Catch and Store Energy</h5>
<p>Energy comes in many forms: sunlight, rain, wind, organic matter, and human labour. Design to capture these when they are abundant. A water tank catches rain; a food forest catches sunlight; a well-placed windbreak captures calm air for tender plants.</p>

<h5>3. Obtain a Yield</h5>
<p>Every element in your design should produce something useful. A fence can also be a trellis for grapes. A pathway can double as a water-harvesting swale edge. Ensure you are getting tangible returns — food, fuel, fibre, or beauty — from your work.</p>

<h5>4. Apply Self-Regulation and Accept Feedback</h5>
<p>Design systems that correct themselves. If a plant struggles in a location, that is feedback — move it. If chickens overgraze an area, rotate them. Let the land tell you what works.</p>

<h5>5. Use and Value Renewable Resources</h5>
<p>Favour biological resources over fossil-fuel ones. Use mulch instead of plastic weed mat. Plant nitrogen-fixing trees instead of buying synthetic fertiliser. Compost instead of sending waste to landfill.</p>

<h5>6. Produce No Waste</h5>
<p>In a well-designed system, every output becomes an input. Kitchen scraps feed compost, which feeds soil, which feeds plants, which feed people. Prunings become mulch. Grey water irrigates trees.</p>

<h5>7. Design from Patterns to Details</h5>
<p>Start with the big picture — where is the sun, what direction does water flow, where are the prevailing winds? Then zoom in to details like plant spacing and path materials. Comfrey's sector analysis helps you see the big patterns first.</p>

<h5>8. Integrate Rather Than Segregate</h5>
<p>Place elements so that they support each other. A chicken coop near the compost and garden creates a loop: chickens eat scraps, produce manure for compost, which feeds the garden, which produces scraps.</p>

<h5>9. Use Small and Slow Solutions</h5>
<p>Start with a small, well-designed area rather than a large, poorly managed one. Small systems are easier to maintain, quicker to adapt, and less risky. Expand only when the first area is thriving.</p>

<h5>10. Use and Value Diversity</h5>
<p>Monocultures are fragile; polycultures are resilient. Mix plant species, heights, root depths, and flowering times. A food forest with seven layers is more productive per square metre than a single crop.</p>

<h5>11. Use Edges and Value the Marginal</h5>
<p>The edge between two ecosystems — forest and meadow, land and water, sun and shade — is where the most life and productivity occurs. Maximise edge in your designs with curved garden beds, keyhole paths, and herb spirals.</p>

<h5>12. Creatively Use and Respond to Change</h5>
<p>Succession is natural. A bare site becomes grassland, becomes shrubland, becomes forest. Work with this process — plant pioneer species first, then introduce longer-lived species as conditions improve.</p>

<div class="tip">These principles are not rules to follow mechanically. They are lenses to look through when making design decisions. When you are unsure where to place an element, run through the principles and see which ones apply.</div>`,
		relevance: { tools: [], climates: [] }
	},
	{
		id: 'zone-theory',
		category: 'principles',
		title: 'Zone Theory: Organising by Frequency of Use',
		summary:
			'Learn how permaculture zones 0 through 5 organise your site by how often you visit and maintain each area.',
		readingTime: 5,
		body: `<h4>Permaculture Zones: Design by Frequency of Use</h4>
<p>Zone planning is one of the most powerful tools in permaculture design. It organises your site into concentric areas based on how frequently you need to visit and maintain each area. The result is a design that minimises wasted effort — the things you use daily are closest to your door, and the things that need little attention are furthest away.</p>

<h5>Zone 0 — The Home</h5>
<p>Zone 0 is the house itself. This is where you conserve energy through insulation, passive solar design, and efficient layout. The orientation of your home affects everything else — which side gets winter sun, where the kitchen door opens (ideally toward the garden), and where water can be collected from the roof.</p>

<h5>Zone 1 — The Doorstep Garden</h5>
<p>Zone 1 is the area you visit multiple times daily. It extends roughly 5-10 metres from the house. This is where you place:</p>
<ul>
<li>Herb gardens and salad greens (you will pick these while cooking)</li>
<li>The clothesline and outdoor seating</li>
<li>Worm farms and small compost bins</li>
<li>Potted plants and seedling nurseries</li>
</ul>
<p>Zone 1 receives the most attention, the most water, and the most mulch. It is intensively managed.</p>

<h5>Zone 2 — The Maintained Garden</h5>
<p>Zone 2 is visited daily or every few days. It includes larger garden beds, fruit trees, the main compost system, chicken runs, and small water features. Paths are well-defined. Irrigation systems help reduce labour. This zone produces the bulk of your food.</p>

<h5>Zone 3 — The Farm Zone</h5>
<p>Zone 3 is visited weekly. It contains larger-scale crops, orchards, main water storage, and grazing paddocks for livestock rotation. Management is less intensive — you might mulch heavily and rely on natural pest control rather than daily inspection.</p>

<h5>Zone 4 — Semi-Managed</h5>
<p>Zone 4 is visited occasionally. It includes woodlots for fuel and timber, wild food foraging areas, and dams or large water bodies. You intervene minimally — perhaps pruning once a year or harvesting wild foods in season.</p>

<h5>Zone 5 — Wilderness</h5>
<p>Zone 5 is unmanaged. It exists as a reference ecosystem, wildlife habitat, and place of contemplation. You observe here but do not intervene. Not every property has a Zone 5, but even a small wild corner provides habitat and teaches you about natural succession.</p>

<h5>Zones Are Not Rigid Circles</h5>
<p>In practice, zones are shaped by terrain, access paths, and microclimates — not perfect concentric rings. A path to a barn might create a Zone 1 corridor extending deep into what would otherwise be Zone 3. Steep slopes might push zones aside. Use the zone concept as a guide, not a template.</p>

<div class="tip">Toggle the zones layer in Comfrey to see your current zone layout. If you notice a daily-use element (like herbs) placed in Zone 3, consider relocating it closer to the house. The best design puts the right thing in the right place.</div>`,
		relevance: { tools: ['library', 'zones'], climates: [] },
		tryItAction: { label: 'Show zones on map', layer: 'zones' }
	},
	{
		id: 'sector-analysis',
		category: 'principles',
		title: 'Sector Analysis: Sun, Wind, Water and Fire',
		summary:
			'Map the external energies that flow through your site — sun paths, prevailing winds, water flow, and fire risk — to inform element placement.',
		readingTime: 5,
		body: `<h4>Sector Analysis: Reading the Energies of Your Site</h4>
<p>While zones organise your site by how you use it, sectors map the external energies that flow through it. These are forces you cannot control — only channel, block, or harvest. Understanding sectors is essential before placing any element on your design.</p>

<h5>The Sun Sector</h5>
<p>The sun sector traces the arc of the sun across your site. In the Northern Hemisphere, the sun is in the southern sky; in the Southern Hemisphere, it is in the northern sky. Key considerations:</p>
<ul>
<li><strong>Summer sun:</strong> High arc, long days. The sun may reach areas that are shaded in winter.</li>
<li><strong>Winter sun:</strong> Low arc, short days. This is the sun you want to maximise for passive heating and winter food production.</li>
<li><strong>Sun traps:</strong> Create warm microclimates by placing thermal mass (stone walls, water) on the sun-facing side.</li>
<li><strong>Shade casting:</strong> Tall elements (buildings, tall trees) cast long shadows in winter. Place them where shade is desirable, not where it will rob your garden of light.</li>
</ul>

<h5>The Wind Sector</h5>
<p>Prevailing winds carry moisture, heat, cold, and sometimes salt or pollution. Mapping your wind sector reveals:</p>
<ul>
<li><strong>Cold winds:</strong> In temperate climates, winter winds often come from the north (Northern Hemisphere) or south (Southern Hemisphere). Windbreaks on this side protect tender plants and reduce heating costs.</li>
<li><strong>Hot dry winds:</strong> In arid and subtropical climates, hot winds desiccate plants and soil. Shelter belts of drought-tolerant trees reduce wind speed for a distance of 10-15 times the tree height.</li>
<li><strong>Beneficial winds:</strong> Sea breezes moderate coastal temperatures. Position living areas to catch cooling breezes in summer.</li>
</ul>

<h5>The Water Sector</h5>
<p>Water flows downhill — always. The water sector identifies:</p>
<ul>
<li>Where rainfall runs across your site (overland flow paths)</li>
<li>Where water naturally accumulates (potential dam sites, bog gardens)</li>
<li>Flood risk areas to avoid for structures</li>
<li>Opportunities for swales (contour trenches) that slow and infiltrate water</li>
</ul>
<p>A well-designed water sector strategy catches water high on the landscape and lets gravity do the distribution work.</p>

<h5>The Fire Sector</h5>
<p>In fire-prone regions, the fire sector is critical for safety. It identifies the direction from which fire is most likely to approach — typically the direction of hot, dry winds combined with uphill slopes. Design responses include:</p>
<ul>
<li>Fire-resistant plantings (succulents, deciduous trees) on the fire-risk side</li>
<li>Green, irrigated zones as firebreaks around the house</li>
<li>Keeping Zone 1 well-watered and free of dry fuel</li>
<li>Locating water storage where it can be accessed for firefighting</li>
</ul>

<div class="tip">Use Comfrey's sector analysis to visualise sun arcs and wind direction on your site. These overlays help you decide where to place windbreaks, which slopes to plant on, and where to locate water storage for gravity-fed irrigation.</div>`,
		relevance: { tools: ['analysis', 'sectors'], climates: [] },
		tryItAction: { label: 'Show sector analysis', panel: 'analysis' }
	},
	{
		id: 'succession-stacking',
		category: 'principles',
		title: 'Succession and Vertical Stacking',
		summary:
			'Design in three dimensions and through time: the seven layers of a food forest and the art of temporal succession.',
		readingTime: 5,
		body: `<h4>Designing in Three Dimensions and Through Time</h4>
<p>A mature ecosystem is not flat. A forest has layers from the canopy to the root zone, each occupied by different species that share light, nutrients, and space without competing destructively. Permaculture mimics this through vertical stacking and temporal succession.</p>

<h5>The Seven Layers of a Food Forest</h5>
<p>A food forest (or forest garden) stacks productive plants into seven distinct layers:</p>
<ol>
<li><strong>Canopy layer:</strong> Full-sized fruit and nut trees (apple, walnut, mango). These form the upper structure and create the microclimate below. Spaced 6-10 metres apart.</li>
<li><strong>Understory layer:</strong> Smaller trees that tolerate partial shade (banana, elderberry, papaya). They fill gaps below the canopy and produce fruit at a reachable height.</li>
<li><strong>Shrub layer:</strong> Berry bushes and woody herbs (blueberry, rosemary, pigeon pea). These produce at waist to shoulder height and create habitat structure.</li>
<li><strong>Herbaceous layer:</strong> Perennial and self-seeding herbs, vegetables, and ground-level plants (comfrey, mint, basil). This layer provides the most diversity.</li>
<li><strong>Groundcover layer:</strong> Low, spreading plants that protect soil (strawberry, clover, sweet potato). They suppress weeds, retain moisture, and prevent erosion.</li>
<li><strong>Root layer:</strong> Underground crops (carrot, taro, ginger). These occupy a dimension that above-ground plants leave unused.</li>
<li><strong>Vine layer:</strong> Climbing plants that use vertical structures (grape, passionfruit, kiwi). They add production without requiring additional ground space.</li>
</ol>

<h5>Why Stacking Works</h5>
<p>Stacking increases yield per square metre because each layer uses different resources. Canopy trees catch full sun. Understory trees thrive in dappled light. Groundcovers need minimal light but protect soil. Root crops access nutrients at different depths. The whole system produces more than any single-layer planting.</p>

<h5>Temporal Succession: Designing Through Time</h5>
<p>Succession is the natural process by which ecosystems change over time. A bare field becomes grassland, then shrubland, then forest. Permaculture accelerates this process by planting multiple successional stages at once:</p>
<ul>
<li><strong>Year 1 (Pioneers):</strong> Fast-growing nitrogen fixers (clover, beans, pigeon pea), annual vegetables, and groundcovers. These protect bare soil and begin building fertility.</li>
<li><strong>Years 2-3 (Establishment):</strong> Fruit trees and perennial herbs establish root systems. Pioneer species are "chopped and dropped" as mulch. The canopy begins to close.</li>
<li><strong>Years 4-7 (Productive maturity):</strong> Fruit trees bear heavily. Understory and shrub layers fill in. The system becomes largely self-mulching and self-fertilising.</li>
<li><strong>Year 8+ (Climax):</strong> The food forest becomes a largely self-maintaining ecosystem. Your role shifts from builder to harvester and light pruner.</li>
</ul>

<h5>Applying Stacking in Your Design</h5>
<p>When placing elements in Comfrey, think vertically. Under every fruit tree, there should be a guild of companion plants filling multiple layers. Group plants by their light needs and ensure tall elements do not shade out sun-loving ones unintentionally.</p>

<div class="tip">Browse the plant database in Comfrey to see which layer each plant occupies. When building a guild around a fruit tree, aim to fill at least four of the seven layers for a resilient, productive planting.</div>`,
		relevance: { tools: ['plants', 'guilds'], climates: [] },
		tryItAction: { label: 'Browse plant database', panel: 'plants' }
	},

	// ============================================================
	// Plant & Species Guides (4 lessons)
	// ============================================================
	{
		id: 'climate-planting',
		category: 'plants',
		title: 'Right Plant, Right Climate',
		summary:
			'Match plants to your climate type for resilient, low-maintenance food production. Covers tropical, subtropical, temperate, and arid strategies.',
		readingTime: 5,
		body: `<h4>Matching Plants to Your Climate</h4>
<p>The single most important factor in plant selection is climate. A plant in the wrong climate will struggle, demand constant attention, and often fail despite your best efforts. A plant in the right climate will thrive with minimal intervention. Comfrey analyses your site's climate automatically — your job is to choose plants that match.</p>

<h5>Tropical Climates</h5>
<p>Tropical regions have year-round warmth (average above 18°C in the coldest month), high rainfall, and no frost. Growth is continuous, and decomposition is rapid — meaning soil organic matter needs constant replenishment. Key strategies:</p>
<ul>
<li><strong>Multi-layer canopies</strong> are essential for managing intense sun. Tall trees like mango, jackfruit, and coconut provide shade for understory plants.</li>
<li><strong>Fast-cycling plants</strong> like banana, papaya, and moringa produce within months and can be replanted quickly.</li>
<li><strong>Ground covers</strong> like sweet potato and taro protect soil from heavy rain splash and suppress aggressive tropical weeds.</li>
<li><strong>Nitrogen fixers</strong> like pigeon pea are critical because nutrients leach quickly in high rainfall.</li>
</ul>

<h5>Subtropical Climates</h5>
<p>Subtropical zones have warm to hot summers and mild winters with occasional light frost. They support a wide diversity of both tropical and temperate species. Strategies include:</p>
<ul>
<li><strong>Mix temperate and tropical species:</strong> Avocado alongside apple, banana alongside elderberry. This gives you the widest harvest calendar.</li>
<li><strong>Manage summer heat:</strong> Use shade cloth or tall deciduous trees to protect cool-season crops from the intense summer sun.</li>
<li><strong>Water management:</strong> Many subtropical regions have wet summers and dry winters (or vice versa). Design water storage to bridge the dry season.</li>
</ul>

<h5>Temperate Climates</h5>
<p>Temperate regions have distinct seasons with cold winters and warm summers. The growing season is limited, so timing matters. Key approaches:</p>
<ul>
<li><strong>Chill-hour fruits:</strong> Apples, pears, plums, and cherries require winter cold to fruit properly. This is an advantage — they are adapted to your climate.</li>
<li><strong>Season extension:</strong> Use south-facing slopes (Northern Hemisphere) or north-facing slopes (Southern Hemisphere) to create warm microclimates. Cold frames and greenhouses extend the harvest.</li>
<li><strong>Soil building is paramount:</strong> Cold winters slow decomposition. Apply heavy mulch in autumn, compost in spring, and use cover crops (clover, lupin) over winter.</li>
<li><strong>Perennial staples:</strong> Fruit and nut trees, berry bushes, and perennial herbs provide reliable harvests year after year without annual replanting.</li>
</ul>

<h5>Arid Climates</h5>
<p>Arid regions receive less than 250mm of rainfall annually. Water is the primary design constraint. Every decision revolves around capturing, storing, and efficiently using water:</p>
<ul>
<li><strong>Drought-adapted species:</strong> Olive, pomegranate, date palm, prickly pear, mesquite, and jojoba are proven performers.</li>
<li><strong>Water harvesting earthworks:</strong> Swales, berms, and sunken beds capture every drop of rainfall and direct it to plant roots.</li>
<li><strong>Mulch heavily:</strong> Thick organic mulch or rock mulch reduces evaporation dramatically. Bare soil in arid climates loses moisture within hours.</li>
<li><strong>Shade structures:</strong> In extreme heat, shade cloth or nurse trees protect young plants from sunburn and reduce water demand.</li>
</ul>

<div class="tip">Open the Analysis panel in Comfrey to see your detected climate type. Then browse the plant database filtered by your climate — these are the species most likely to thrive on your site without excessive inputs.</div>`,
		relevance: {
			tools: ['plants', 'analysis'],
			climates: ['tropical', 'subtropical', 'temperate', 'arid']
		},
		tryItAction: { label: 'Open site analysis', panel: 'analysis' }
	},
	{
		id: 'companion-planting',
		category: 'plants',
		title: 'Companion Planting: Friends and Foes',
		summary:
			'Which plants help each other grow, and which should be kept apart? Learn the science behind companion planting and the famous Three Sisters guild.',
		readingTime: 5,
		body: `<h4>Companion Planting: The Science of Plant Relationships</h4>
<p>Companion planting is the practice of placing plants together that benefit each other — and keeping apart those that do not. While some companion planting advice is folklore, much of it is grounded in observable mechanisms: nutrient sharing, pest confusion, physical support, and microclimate creation.</p>

<h5>How Companions Help Each Other</h5>
<p>Plants interact through several mechanisms:</p>
<ul>
<li><strong>Nitrogen fixation:</strong> Legumes (beans, peas, clover) host Rhizobium bacteria in their root nodules, converting atmospheric nitrogen into plant-available forms. Neighbouring plants benefit when legume roots decompose or are chopped and dropped.</li>
<li><strong>Pest confusion:</strong> Monocultures are easy targets for pest insects — a field of cabbage is a beacon. Interplanting with strongly scented herbs (basil, rosemary, garlic) confuses pests that navigate by smell.</li>
<li><strong>Trap cropping:</strong> Nasturtiums attract aphids away from valuable crops. The aphids colonise the nasturtiums (which tolerate it) and leave your beans alone.</li>
<li><strong>Beneficial insect habitat:</strong> Dill, fennel, and borage attract hoverflies, lacewings, and parasitic wasps — predators of common garden pests.</li>
<li><strong>Physical support:</strong> Corn provides a living trellis for climbing beans. Squash shades the ground, suppressing weeds and retaining moisture.</li>
<li><strong>Dynamic accumulation:</strong> Deep-rooted plants like comfrey mine minerals from subsoil and make them available on the surface when their leaves are cut as mulch.</li>
</ul>

<h5>The Three Sisters: A Classic Guild</h5>
<p>The most famous companion planting system is the Three Sisters, developed by Indigenous peoples of the Americas over millennia:</p>
<ol>
<li><strong>Corn (Maize):</strong> Provides a tall structure for beans to climb. Its deep roots anchor the group.</li>
<li><strong>Beans:</strong> Fix nitrogen from the air, feeding the heavy-feeding corn. They climb the corn stalks, needing no separate trellis.</li>
<li><strong>Squash:</strong> Spreads across the ground, its large leaves shading the soil to suppress weeds and retain moisture. Prickly stems deter some pests.</li>
</ol>
<p>Together, the Three Sisters produce more food per square metre than any of them grown alone. The guild is nutritionally complete: carbohydrates (corn), protein (beans), and vitamins (squash).</p>

<h5>Plants to Keep Apart</h5>
<p>Some plants actively harm their neighbours:</p>
<ul>
<li><strong>Walnut (juglone):</strong> Black walnut roots exude juglone, a compound toxic to many plants including apple, tomato, and blueberry. Keep walnuts at least 15 metres from sensitive species.</li>
<li><strong>Fennel:</strong> Allelopathic to most garden plants — grow it at the edge of your garden, not among other crops.</li>
<li><strong>Garlic and onions</strong> can inhibit the growth of legumes (beans, peas). Keep alliums and legumes in separate beds.</li>
</ul>

<h5>Applying Companion Planting in Your Design</h5>
<p>When placing plants in Comfrey, the guild checker will flag incompatible pairings. Pay attention to these warnings — moving a plant 3 metres away from an antagonist can make the difference between thriving and struggling.</p>

<div class="tip">Use the companion planting checker in Comfrey after placing plants. Green connections indicate beneficial companions; red connections indicate antagonists that should be separated.</div>`,
		relevance: { tools: ['guilds', 'plants'], climates: [] },
		tryItAction: { label: 'Check guild companions', panel: 'guilds' }
	},
	{
		id: 'fruit-tree-guilds',
		category: 'plants',
		title: 'Fruit Tree Guilds: Building Plant Communities',
		summary:
			'Design productive plant communities around fruit trees using six functional roles. Includes a complete example apple guild.',
		readingTime: 5,
		body: `<h4>Fruit Tree Guilds: Communities, Not Specimens</h4>
<p>In nature, trees do not grow alone. They grow in communities where each species plays a role — fixing nitrogen, attracting pollinators, suppressing weeds, mining nutrients, or repelling pests. A fruit tree guild recreates this community deliberately, surrounding a central fruit tree with companion plants that fill six functional roles.</p>

<h5>The Six Guild Roles</h5>
<ol>
<li><strong>Central tree:</strong> The main productive tree (apple, pear, peach, citrus). This is the anchor of the guild and determines its size and shape.</li>
<li><strong>Nitrogen fixer:</strong> A plant that converts atmospheric nitrogen into soil-available forms. Examples: white clover (groundcover), lupin (herbaceous), or pigeon pea (shrub). Place these within the drip line of the tree where feeder roots can access the nitrogen.</li>
<li><strong>Dynamic accumulator:</strong> Deep-rooted plants that mine minerals from subsoil and bring them to the surface in their leaves. Comfrey is the classic example — its roots reach 2-3 metres deep, and its leaves contain high concentrations of potassium, calcium, and phosphorus. Chop and drop the leaves 4-5 times per year as mulch.</li>
<li><strong>Pest repellent:</strong> Strongly scented plants that confuse or repel pest insects. Garlic, chives, and tansy planted under fruit trees reduce codling moth, aphid, and borer activity. Garlic is particularly effective as a fungal disease suppressor when planted in a ring around the tree base.</li>
<li><strong>Pollinator attractor:</strong> Flowers that draw bees, hoverflies, and other pollinators to ensure good fruit set. Borage is exceptional — it flowers prolifically and is irresistible to bees. Nasturtium and dill also attract beneficial insects.</li>
<li><strong>Groundcover / mulch plant:</strong> Low-growing plants that cover bare soil, suppress weeds, and retain moisture. Strawberry, white clover, and creeping thyme are excellent choices. They reduce the need for imported mulch once established.</li>
</ol>

<h5>Example: An Apple Tree Guild</h5>
<p>Here is a complete guild for a standard apple tree in a temperate climate:</p>
<ul>
<li><strong>Central tree:</strong> Apple (semi-dwarf rootstock, 4-5m canopy at maturity)</li>
<li><strong>Nitrogen fixer:</strong> White clover — sown as a living mulch throughout the guild area</li>
<li><strong>Dynamic accumulator:</strong> Comfrey — 3 plants spaced evenly around the drip line</li>
<li><strong>Pest repellent:</strong> Chives — planted in a ring 0.5m from the trunk, plus garlic bulbs between the comfrey plants</li>
<li><strong>Pollinator attractor:</strong> Borage — 2 plants on the sunny side of the tree</li>
<li><strong>Groundcover:</strong> Strawberry — planted in patches between the other guild members</li>
</ul>
<p>This guild occupies perhaps 20 square metres but produces apples, strawberries, herbs, comfrey mulch, nitrogen, and pollinator habitat — all while suppressing weeds and building soil.</p>

<h5>Guild Design Tips</h5>
<ul>
<li>Keep a 30-50cm clear zone around the trunk to prevent crown rot.</li>
<li>Place the tallest guild members on the shaded side so they do not compete with the tree for light.</li>
<li>Consider the mature size of the tree — a guild designed for a newly planted tree will be shaded out in five years if you do not account for canopy growth.</li>
<li>Each guild should have at least one nitrogen fixer, one accumulator, and one pest repellent.</li>
</ul>

<div class="tip">When placing a fruit tree in Comfrey, use the guild panel to add companion plants around it. The system will suggest appropriate companions based on the tree species and your climate.</div>`,
		relevance: { tools: ['guilds', 'plants'], climates: [] },
		tryItAction: { label: 'Build a guild', panel: 'guilds' }
	},
	{
		id: 'soil-building',
		category: 'plants',
		title: 'Soil Building: N-Fixers, Accumulators and Ground Covers',
		summary:
			'Healthy soil is the foundation of every permaculture system. Learn to build it using nitrogen fixers, dynamic accumulators, and living ground covers.',
		readingTime: 5,
		body: `<h4>Building Living Soil</h4>
<p>Soil is not dirt — it is a living ecosystem containing billions of bacteria, fungi, protozoa, nematodes, and arthropods in every handful. Healthy soil grows healthy plants. Sick, compacted, or depleted soil produces struggling plants no matter how much fertiliser you apply. Permaculture builds soil through biological processes, not chemical inputs.</p>

<h5>Nitrogen Fixers: Your Free Fertiliser Factory</h5>
<p>Nitrogen is the nutrient plants need most, and it is the nutrient most often deficient in soils. Fortunately, the atmosphere is 78% nitrogen — and certain plants can harvest it for free. Legumes (the bean and pea family) host Rhizobium bacteria in root nodules that convert atmospheric N2 into ammonium that plants can absorb.</p>
<p>Key nitrogen fixers for permaculture:</p>
<ul>
<li><strong>Trees:</strong> Mesquite, honey locust, black locust, and Leucaena provide both nitrogen and timber/fuel.</li>
<li><strong>Shrubs:</strong> Pigeon pea is outstanding in tropical and subtropical climates — it fixes nitrogen, produces edible beans, and its woody stems make excellent chop-and-drop mulch.</li>
<li><strong>Ground covers:</strong> White clover is the workhorse of temperate food forests. Sow it as a living mulch under fruit trees. It fixes 100-200 kg of nitrogen per hectare per year.</li>
<li><strong>Green manures:</strong> Lupin, lucerne (alfalfa), and field peas can be grown as a cover crop and then slashed and incorporated into the soil before planting.</li>
</ul>
<p>For maximum benefit, chop nitrogen-fixing plants before they set seed and leave the biomass on the soil surface as mulch. The nitrogen stored in their roots and leaves will slowly release as they decompose.</p>

<h5>Dynamic Accumulators: Mining the Subsoil</h5>
<p>Dynamic accumulators are deep-rooted plants that draw minerals from well below the reach of most crop roots and concentrate them in their leaves. When the leaves are cut and left on the surface, these minerals become available to shallow-rooted neighbours.</p>
<p>The champion accumulator is comfrey (Symphytum officinale):</p>
<ul>
<li>Roots reach 2-3 metres deep, accessing potassium, calcium, magnesium, and phosphorus</li>
<li>Leaves contain 2-3 times the potassium of farmyard manure</li>
<li>Can be cut 4-5 times per growing season — it regrows rapidly</li>
<li>Makes excellent compost activator, liquid fertiliser (comfrey tea), and mulch</li>
</ul>
<p>Other dynamic accumulators include borage, dandelion, yarrow, chicory, tansy, and parsley. Plant them throughout your food forest as nutrient pumps.</p>

<h5>Ground Covers: Protecting the Soil Surface</h5>
<p>Bare soil is damaged soil. Rain compacts it, sun bakes it, wind erodes it, and weeds colonise it. Nature covers soil as quickly as possible — and so should you. Living ground covers provide:</p>
<ul>
<li><strong>Weed suppression:</strong> Dense ground covers outcompete weeds for light and space.</li>
<li><strong>Moisture retention:</strong> Shaded soil loses far less water to evaporation than bare soil.</li>
<li><strong>Temperature moderation:</strong> Covered soil stays cooler in summer and warmer in winter, protecting roots and soil organisms.</li>
<li><strong>Erosion control:</strong> Root networks hold soil in place during heavy rain.</li>
</ul>
<p>In temperate climates, white clover and strawberry are excellent edible ground covers. In tropical climates, sweet potato and perennial peanut (Arachis pintoi) spread vigorously and produce food. In arid climates, creeping thyme and oregano tolerate drought and provide culinary herbs.</p>

<h5>The Soil Building Recipe</h5>
<p>For any new planting area, follow this sequence:</p>
<ol>
<li>Plant nitrogen fixers first to build fertility (clover, beans, pigeon pea)</li>
<li>Add dynamic accumulators to mine minerals (comfrey, borage)</li>
<li>Establish ground covers to protect the surface (strawberry, sweet potato, clover)</li>
<li>Mulch any remaining bare patches with organic material (straw, wood chips, leaves)</li>
<li>Only then plant your main productive species into this prepared, living soil</li>
</ol>

<div class="tip">When browsing plants in Comfrey, look for the nitrogen fixer and dynamic accumulator tags. Include at least one of each in every fruit tree guild and garden bed for self-sustaining fertility.</div>`,
		relevance: { tools: ['plants'], climates: [] },
		tryItAction: { label: 'Browse plants', panel: 'plants' }
	},

	// ============================================================
	// Using Comfrey — Tutorials (5 lessons)
	// ============================================================
	{
		id: 'tutorial-site-setup',
		category: 'tutorials',
		title: 'Getting Started: Setting Up Your Site',
		summary:
			'Walk through creating a new project: finding your location, drawing your property boundary, running site analysis, and placing your house.',
		readingTime: 4,
		body: `<h4>Setting Up Your Site in Comfrey</h4>
<p>Every design in Comfrey begins with the New Project wizard. This four-step process establishes the foundation for all your design work: where your land is, what shape it is, what the climate and terrain are like, and where your house sits. Take your time with these steps — accuracy here saves redesign later.</p>

<h5>Step 1: Location</h5>
<p>Start by finding your property on the map. You can:</p>
<ul>
<li><strong>Search by address:</strong> Type your street address or town name in the search bar. The map will zoom to your area.</li>
<li><strong>Pan and zoom manually:</strong> If your property is rural or does not have a street address, navigate to it by zooming into the satellite view.</li>
<li><strong>Drop a pin:</strong> Click on the map to set your location pin. This pin determines the latitude and longitude used for sun calculations, climate data, and elevation queries.</li>
</ul>
<p>The satellite imagery helps you identify existing features — buildings, trees, roads, water bodies — that will inform your design.</p>

<h5>Step 2: Boundary</h5>
<p>Draw your property boundary by clicking points on the map to create a polygon. Tips for accurate boundaries:</p>
<ul>
<li>Follow your actual property lines as closely as possible. Use fences, roads, and other visible landmarks in the satellite imagery.</li>
<li>Click each corner of your property to place a vertex. The polygon closes automatically when you click near the starting point.</li>
<li>The area in square metres (and hectares/acres) is calculated automatically from the polygon. Check this against your known property size to verify accuracy.</li>
<li>If you make a mistake, you can adjust vertices by dragging them, or start over.</li>
</ul>

<h5>Step 3: Analysis</h5>
<p>Once your boundary is drawn, Comfrey fetches site data automatically:</p>
<ul>
<li><strong>Climate:</strong> Average temperatures, rainfall, frost-free days, and hardiness zone from Open-Meteo weather data. Your climate type (tropical, subtropical, temperate, or arid) determines which plants are recommended.</li>
<li><strong>Sun:</strong> Sun positions at the summer solstice, winter solstice, and equinox — calculated from your exact latitude. This data drives shadow analysis and helps you orient sun-loving elements.</li>
<li><strong>Wind:</strong> Prevailing wind direction and average speed. Useful for placing windbreaks and orienting structures.</li>
<li><strong>Elevation:</strong> Terrain height data across your property. This reveals slopes, high points (good for water tanks), and low points (good for dams or bog gardens).</li>
</ul>
<p>The analysis step takes a few seconds. If any data source fails, Comfrey continues with the available data — climate is the only required dataset.</p>

<h5>Step 4: House Placement</h5>
<p>Click on the map to place your house. If you already have a house, place the marker on its actual location. If you are designing for a new build, this is your chance to choose the optimal position considering sun orientation, wind shelter, and access. The house position becomes Zone 0 and determines how all other zones radiate outward.</p>

<div class="tip">After completing the wizard, Comfrey generates permaculture zones automatically based on your house position and property boundary. You will land in the Design Editor ready to start placing elements.</div>`,
		relevance: { tools: [], climates: [] }
	},
	{
		id: 'tutorial-analysis',
		category: 'tutorials',
		title: 'Reading Your Site Analysis',
		summary:
			'Understand the climate, sun, wind, and elevation data Comfrey provides and how to use it for design decisions.',
		readingTime: 4,
		body: `<h4>Understanding Your Site Analysis Data</h4>
<p>After the wizard completes, Comfrey's Analysis panel contains a wealth of information about your site. Understanding what each piece of data means — and how to act on it — is key to making good design decisions.</p>

<h5>Climate Data</h5>
<p>The climate section tells you what will grow on your site:</p>
<ul>
<li><strong>Climate type</strong> (tropical, subtropical, temperate, or arid) is derived from temperature and rainfall patterns. This is the primary filter for plant selection — a plant suited to your climate type will need less water, less protection, and less maintenance.</li>
<li><strong>Hardiness zone</strong> (e.g. "11a") tells you the average minimum winter temperature. Use this to check whether a specific variety can survive your winters.</li>
<li><strong>Average rainfall</strong> (mm/year) determines how much supplementary irrigation you need. Under 600mm/year, water harvesting and drought-tolerant species are essential. Over 1200mm/year, drainage and erosion control become priorities.</li>
<li><strong>Frost-free days</strong> define your growing season length. Short seasons (under 150 days) mean you need fast-maturing varieties and season extension techniques.</li>
<li><strong>Summer/winter temperatures</strong> indicate heat stress risk in summer and cold damage risk in winter.</li>
</ul>

<h5>Sun Data</h5>
<p>Sun data drives the placement of sun-loving and shade-tolerant elements:</p>
<ul>
<li><strong>Summer solstice:</strong> The longest day. The sun is at its highest altitude. Note the sunrise and sunset times — these show the full arc of summer sun across your site.</li>
<li><strong>Winter solstice:</strong> The shortest day. The sun is at its lowest altitude, casting the longest shadows. Shadows from buildings and trees at the winter solstice show you which areas will be in shade during the cold months.</li>
<li><strong>Equinox:</strong> The mid-point. This represents average conditions for spring and autumn.</li>
<li><strong>Day length range</strong> tells you the difference between your longest and shortest days. Near the equator, days are consistently around 12 hours. At higher latitudes, you might have 16-hour summer days and 8-hour winter days.</li>
</ul>

<h5>Wind Data</h5>
<p>Wind information helps you place shelter and orient structures:</p>
<ul>
<li><strong>Prevailing direction:</strong> The direction from which wind most commonly blows. Place windbreaks perpendicular to this direction, upwind of areas you want to protect.</li>
<li><strong>Average speed:</strong> Speeds over 15 km/h warrant windbreak plantings. Over 25 km/h, structural windbreaks (fences, earth berms) may be needed in addition to trees.</li>
</ul>

<h5>Elevation Data</h5>
<p>Elevation reveals the three-dimensional shape of your land:</p>
<ul>
<li><strong>Min/max elevation</strong> tells you the total vertical range. Even 2-3 metres of elevation change creates meaningful microclimates and affects water flow.</li>
<li><strong>Slope</strong> (in degrees) indicates how steep your land is. Flat land (under 3 degrees) is easy to work but may have drainage issues. Moderate slopes (3-10 degrees) are ideal — they drain well and create sun-facing aspects. Steep slopes (over 15 degrees) need terracing or contour planting to prevent erosion.</li>
<li><strong>Aspect</strong> (the direction the slope faces) determines sun exposure. In the Northern Hemisphere, south-facing slopes receive the most sun; north-facing slopes are cooler and shadier. The reverse applies in the Southern Hemisphere.</li>
</ul>

<div class="tip">Open the Analysis panel and review each section before placing any elements. The data here should directly inform your first design decisions: where to place water storage (high ground), where to plant sun-lovers (sun-facing slopes), and where to install windbreaks (upwind of gardens).</div>`,
		relevance: { tools: ['analysis'], climates: [] },
		tryItAction: { label: 'Open analysis panel', panel: 'analysis' }
	},
	{
		id: 'tutorial-elements',
		category: 'tutorials',
		title: 'Working with Design Elements',
		summary:
			'Learn to place, select, move, rotate, resize, and delete elements on your design canvas. Covers undo/redo and the properties panel.',
		readingTime: 4,
		body: `<h4>Placing and Managing Design Elements</h4>
<p>The design canvas is where your permaculture plan takes shape. You build it by placing elements — structures, plants, water features, paths, and more — and arranging them according to permaculture principles. Here is how to work with elements effectively.</p>

<h5>Placing Elements</h5>
<p>To place an element on your design:</p>
<ol>
<li>Open the <strong>Element Library</strong> from the sidebar. Elements are organised by category: structures, plants, water, animals, paths, and utilities.</li>
<li>Click the element you want to place. Your cursor changes to indicate placement mode.</li>
<li>Click on the map where you want the element. It appears at that location with default size and rotation.</li>
<li>The element is automatically assigned to the appropriate permaculture zone based on its distance from the house.</li>
</ol>
<p>For plants, you can also browse the plant database, which provides detailed information about each species including climate suitability, companions, and spacing.</p>

<h5>Selecting and Moving Elements</h5>
<p>Switch to the <strong>Select tool</strong> (the arrow icon in the toolbar) to interact with placed elements:</p>
<ul>
<li><strong>Click</strong> an element to select it. A highlight appears around it and its properties are shown in the sidebar.</li>
<li><strong>Drag</strong> a selected element to move it to a new position. The zone assignment updates automatically when you release.</li>
<li>Click on empty space to deselect.</li>
</ul>

<h5>Rotating and Resizing</h5>
<p>Selected elements that support rotation and resizing show controls in the Properties panel:</p>
<ul>
<li><strong>Rotation:</strong> Use the rotation slider or type a degree value (0-360). Useful for orienting structures to face the sun or aligning garden beds with contour lines.</li>
<li><strong>Resize:</strong> Use the scale slider to make elements larger or smaller. The scale is relative to the element's default size.</li>
</ul>
<p>Not all elements support these operations — a water tank is always circular, so rotation has no visual effect. The Properties panel only shows controls that are relevant to the selected element type.</p>

<h5>Element Properties</h5>
<p>Each element type has specific properties you can edit:</p>
<ul>
<li><strong>Label:</strong> Give the element a custom name (e.g. "Main water tank" or "Anna's apple tree").</li>
<li><strong>Type-specific fields:</strong> Garden beds have "raised bed" and "irrigated" options. Water tanks have a capacity field. Sheds have a purpose selector. These fields help generate accurate action plans.</li>
<li><strong>Layer:</strong> Elements are automatically assigned to a layer (infrastructure, planting, water, paths). You can toggle layer visibility from the layers panel.</li>
</ul>

<h5>Deleting Elements</h5>
<p>To remove an element, select it and click the <strong>Delete</strong> button in the Properties panel (or press the Delete key). The element is removed from the design immediately.</p>

<h5>Undo and Redo</h5>
<p>Made a mistake? Comfrey maintains a history of your changes:</p>
<ul>
<li><strong>Undo</strong> (Ctrl+Z / Cmd+Z): Reverts the last change — placement, move, rotation, resize, or deletion.</li>
<li><strong>Redo</strong> (Ctrl+Shift+Z / Cmd+Shift+Z): Re-applies an undone change.</li>
<li>Up to 50 levels of undo are available. The history is per design session.</li>
</ul>

<div class="tip">Open the Element Library to see all available elements. Start with your house (if not already placed), then add infrastructure (water tanks, sheds, compost), followed by plantings. Build from structure to detail — just like the permaculture design process.</div>`,
		relevance: { tools: ['library', 'properties'], climates: [] },
		tryItAction: { label: 'Open element library', panel: 'library' }
	},
	{
		id: 'tutorial-water',
		category: 'tutorials',
		title: 'Understanding Water Flow on Your Site',
		summary:
			'Use the water flow overlay and elevation profile to see where water moves on your land and design earthworks to capture it.',
		readingTime: 4,
		body: `<h4>Water Flow Analysis in Comfrey</h4>
<p>Water is the most critical resource on any site. Understanding where water flows — and where it accumulates, erodes, or is absent — is essential for both productive design and risk management. Comfrey provides two tools for water analysis: the D8 water flow overlay and the elevation profile.</p>

<h5>The D8 Water Flow Model</h5>
<p>Comfrey uses a D8 (deterministic eight-direction) algorithm to model how rainwater flows across your terrain. For each point on your site, the algorithm determines which of its eight neighbours is lowest, and directs water flow in that direction. The result is a network of flow paths showing where water concentrates.</p>
<p>The flow overlay displays:</p>
<ul>
<li><strong>Blue lines of varying thickness:</strong> Thicker lines represent higher flow accumulation — more water passes through these paths. These are your natural drainage lines, ephemeral creeks, and potential erosion gullies.</li>
<li><strong>Convergence points:</strong> Where multiple flow paths meet, water concentrates. These are natural locations for dams, ponds, or infiltration basins.</li>
<li><strong>Ridgelines:</strong> Areas where water flows away in all directions. These are the highest points between drainage lines and are ideal for paths, structures, and water tank placement.</li>
</ul>

<h5>Reading the Flow Map</h5>
<p>When you enable the water flow overlay, look for these patterns:</p>
<ul>
<li><strong>Flow crossing your garden:</strong> If a concentrated flow path runs through a planned garden bed, you either need to divert it (with a swale uphill) or design the bed to handle periodic wet conditions (raised beds, bog-tolerant species).</li>
<li><strong>Dry zones:</strong> Areas far from flow paths on hilltops or ridges receive only direct rainfall. These are the driest parts of your site and suit drought-tolerant species or need irrigation from stored water.</li>
<li><strong>Accumulation zones:</strong> Low points where water collects. These may stay wet long after rain. They suit water-loving plants (taro, banana, willows) or can be developed as ponds.</li>
</ul>

<h5>Using the Elevation Profile</h5>
<p>The elevation profile tool lets you draw a line across your site and see a cross-section of the terrain. This is valuable for:</p>
<ul>
<li><strong>Swale placement:</strong> Swales (contour trenches) must follow the contour — the line of equal elevation. The profile tool helps you identify true contour lines across your site.</li>
<li><strong>Gravity-fed irrigation:</strong> To irrigate a garden from a water tank, the tank must be higher. The profile tool shows you the exact elevation difference between two points.</li>
<li><strong>Slope assessment:</strong> A profile across a planting area reveals whether the slope is gentle enough for sheet mulching or steep enough to require terracing.</li>
</ul>

<h5>Design Responses to Water Flow</h5>
<p>Once you understand your water patterns, common design responses include:</p>
<ul>
<li><strong>Swales on contour:</strong> Dig trenches along contour lines to intercept overland flow, slow it down, and let it soak into the soil. Plant fruit trees on the downhill berm.</li>
<li><strong>Water tanks on high ground:</strong> Catch roof water and store it at elevation. Gravity delivers it to gardens below without a pump.</li>
<li><strong>Diversion drains:</strong> Redirect concentrated flow away from structures and into storage or productive areas.</li>
<li><strong>Rain gardens:</strong> Shallow, planted depressions that capture and filter runoff. Place them at the bottom of slopes or where downspouts discharge.</li>
</ul>

<div class="tip">Toggle the water flow overlay in Comfrey to see the D8 model on your site. Place your water storage elements on high ground (ridgelines) and your water-loving plants along the blue flow lines. Let gravity do the work.</div>`,
		relevance: { tools: ['analysis', 'waterFlow'], climates: ['arid'] },
		tryItAction: { label: 'Show water flow', layer: 'waterFlow' }
	},
	{
		id: 'tutorial-review',
		category: 'tutorials',
		title: 'Design Review: Advisor Tips and AI Review',
		summary:
			'Get feedback on your design from the built-in advisor system and optional AI-powered review. Learn to interpret and apply recommendations.',
		readingTime: 4,
		body: `<h4>Getting Feedback on Your Design</h4>
<p>A permaculture design is never finished on the first draft. Iteration — placing elements, reviewing, adjusting, and refining — is how good designs emerge. Comfrey provides two feedback mechanisms: the built-in Advisor and the optional AI Design Review.</p>

<h5>The Advisor System</h5>
<p>The Advisor is an event-driven system that watches your design actions and offers contextual tips. It activates when you:</p>
<ul>
<li><strong>Place an element:</strong> The advisor checks whether the placement follows permaculture principles. For example, placing a water tank downhill from a garden triggers a tip suggesting you move it uphill for gravity-fed irrigation.</li>
<li><strong>Place elements near each other:</strong> Proximity checks flag both opportunities (companion plants that should be close) and problems (a compost bin right next to a seating area).</li>
<li><strong>Complete site analysis:</strong> Once climate and terrain data are available, the advisor can offer climate-specific recommendations.</li>
<li><strong>Create zones:</strong> Zone creation triggers tips about what belongs in each zone.</li>
</ul>
<p>Tips appear in the Advisor panel with three levels of detail:</p>
<ul>
<li><strong>Headline:</strong> A brief statement of the recommendation (e.g. "Water flows downhill")</li>
<li><strong>Explanation:</strong> Two to three sentences providing site-specific context</li>
<li><strong>Learn More:</strong> An expanded mini-lesson for those who want to understand the reasoning (available on some tips)</li>
</ul>
<p>Some tips include an <strong>action button</strong> — such as "Move it for me" — that applies the recommendation automatically. You can also dismiss tips you disagree with.</p>

<h5>Adaptive Depth</h5>
<p>The advisor tracks which tips you have seen, dismissed, and applied. Over time, it adapts:</p>
<ul>
<li>Tips you have already seen are shown in abbreviated form (the "short reminder" version)</li>
<li>Dismissed tips are not repeated</li>
<li>New tips are prioritised over seen ones</li>
</ul>
<p>This means the advisor becomes less verbose as you gain experience, showing you the headlines rather than the full explanation.</p>

<h5>AI Design Review</h5>
<p>For a comprehensive review, Comfrey offers an AI-powered design analysis. This sends your complete design data — element positions, zones, climate data, and terrain — to an AI model that evaluates it holistically. The review covers:</p>
<ul>
<li><strong>Zone compliance:</strong> Are elements placed in appropriate zones? Is a daily-use herb garden too far from the house?</li>
<li><strong>Water logic:</strong> Does water storage sit above the areas it needs to serve? Are water-loving plants near water sources?</li>
<li><strong>Sun and wind:</strong> Are sun-loving plants in sunny locations? Are windbreaks positioned to protect vulnerable areas?</li>
<li><strong>Companion planting:</strong> Are there antagonistic plants placed too close together?</li>
<li><strong>Missing elements:</strong> Does the design lack compost, water storage, nitrogen fixers, or other essential components?</li>
</ul>
<p>The AI review provides a written summary with specific, actionable recommendations. It is not a replacement for your own judgement — but it catches things that are easy to miss when you are focused on individual elements.</p>

<h5>Interpreting Recommendations</h5>
<p>Whether from the Advisor or the AI Review, treat recommendations as suggestions to evaluate, not commands to follow blindly. Every site has unique constraints (budget, existing structures, personal preferences) that automated systems cannot fully account for. Use the feedback as a starting point for critical thinking about your design.</p>

<div class="tip">Open the Advisor panel to see any pending tips for your current design. If you have placed several elements, try the AI Design Review for a comprehensive assessment. Review feedback, apply what makes sense, and dismiss what does not fit your situation.</div>`,
		relevance: { tools: ['advisor', 'ai-settings'], climates: [] },
		tryItAction: { label: 'Open advisor', panel: 'advisor' }
	}
];

export function getLesson(id: string): Lesson | undefined {
	return lessons.find((l) => l.id === id);
}

export function getLessonsByCategory(category: LessonCategory): Lesson[] {
	return lessons.filter((l) => l.category === category);
}

# Learning Hub Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a context-aware learning hub as a slide-over panel in the design editor, with ~14 guided permaculture lessons, progress tracking, and contextual recommendations.

**Architecture:** A slide-over panel component (`LearnPanel`) renders over the map from the right edge. Lesson content lives in a static catalog (`lessons.ts`). Progress is stored per-user in IndexedDB via a `learning-progress` object store. The editor store tracks panel state (closed/minimized/open/maximized). A relevance scoring function ranks lessons based on active tool/panel and site climate.

**Tech Stack:** SvelteKit, Svelte 5 runes, Tailwind CSS v4, IndexedDB (idb), existing editor/project stores.

---

### Task 1: Lesson Type & Catalog

**Files:**
- Create: `src/lib/catalog/lessons.ts`
- Modify: `src/lib/types/index.ts`

**Step 1: Add Lesson types to types/index.ts**

Add at the end of the file, before the closing of the Advisor System section or after it:

```typescript
// ============================================================
// Learning Hub
// ============================================================

export type LessonCategory = 'principles' | 'plants' | 'tutorials';

export interface Lesson {
	id: string;
	category: LessonCategory;
	title: string;
	summary: string;
	readingTime: number; // minutes
	body: string; // HTML content
	relevance: {
		tools: string[]; // sidebar panel or layer names that make this lesson relevant
		climates: string[]; // climate types this lesson is especially relevant for, or empty for all
	};
	tryItAction?: {
		label: string;
		panel?: string; // switch to this sidebar panel
		layer?: string; // toggle this layer on
	};
}
```

**Step 2: Create the lesson catalog**

Create `src/lib/catalog/lessons.ts` with all 14 lessons. Each lesson has HTML body content (no markdown parser needed). Content should be educational, practical, and specific to permaculture. Each lesson body should be 300-600 words of HTML.

The file exports:
```typescript
import type { Lesson } from '$lib/types';

export const lessons: Lesson[] = [
	// --- Permaculture Principles ---
	{
		id: 'ethics',
		category: 'principles',
		title: 'Permaculture Ethics',
		summary: 'The three ethical foundations: Earth Care, People Care, and Fair Share.',
		readingTime: 3,
		body: `<h4>The Three Ethics</h4>
<p>Every permaculture design begins with three ethics...</p>
<h5>1. Earth Care</h5>
<p>Care for the earth means working to preserve soil, water, and biodiversity...</p>
<h5>2. People Care</h5>
<p>People care means designing systems that provide for human needs...</p>
<h5>3. Fair Share</h5>
<p>Fair share means setting limits on consumption and redistributing surplus...</p>
<div class="tip">In your design, earth care might look like placing water catchment uphill from gardens, or choosing nitrogen-fixing plants to build soil naturally.</div>`,
		relevance: { tools: [], climates: [] }
	},
	{
		id: 'twelve-principles',
		category: 'principles',
		title: 'The 12 Principles',
		summary: 'David Holmgren\'s 12 design principles that guide permaculture thinking.',
		readingTime: 5,
		body: `<h4>Design Principles</h4>
<p>David Holmgren articulated 12 principles...</p>
<ol>
<li><strong>Observe and Interact</strong> — Take time to study your site before making changes. Notice where water flows, where sun hits, where wind blows.</li>
<li><strong>Catch and Store Energy</strong> — Capture resources when abundant (rainwater, sunlight) for use in times of need.</li>
<li><strong>Obtain a Yield</strong> — Ensure your design produces useful outputs — food, materials, energy.</li>
<li><strong>Apply Self-Regulation and Accept Feedback</strong> — Monitor your design and adjust when things aren't working.</li>
<li><strong>Use and Value Renewable Resources</strong> — Prefer biological and renewable solutions over fossil-fuel dependent ones.</li>
<li><strong>Produce No Waste</strong> — Every output from one element becomes input for another. Compost, greywater, mulch.</li>
<li><strong>Design From Patterns to Details</strong> — Start with the big picture (zones, sectors) before placing individual elements.</li>
<li><strong>Integrate Rather Than Segregate</strong> — Place elements so they support each other. A chicken coop near the garden provides fertilizer and pest control.</li>
<li><strong>Use Small and Slow Solutions</strong> — Start small, learn, then expand. A single garden bed taught well beats ten neglected ones.</li>
<li><strong>Use and Value Diversity</strong> — Polycultures are more resilient than monocultures. Mix species, layers, and functions.</li>
<li><strong>Use Edges and Value the Marginal</strong> — Edges between ecosystems (pond edge, forest edge) are the most productive zones.</li>
<li><strong>Creatively Use and Respond to Change</strong> — Succession is natural. Design with change in mind, not against it.</li>
</ol>`,
		relevance: { tools: [], climates: [] }
	},
	{
		id: 'zone-theory',
		category: 'principles',
		title: 'Zone Theory',
		summary: 'How permaculture zones 0-5 organize your site by frequency of use.',
		readingTime: 4,
		body: `<h4>Zones: Organizing by Use Frequency</h4>
<p>Permaculture zones are numbered 0 to 5, radiating outward from the home. They organize your land based on how often you visit and interact with each area.</p>
<h5>Zone 0 — The Home</h5>
<p>The house itself. Energy efficiency, passive solar design, food preservation, and indoor growing spaces.</p>
<h5>Zone 1 — Daily Use</h5>
<p>The area you visit multiple times daily. Herb gardens, salad greens, compost, clothesline, and frequently used paths. Keep it within arm's reach of the kitchen door.</p>
<h5>Zone 2 — Intensive Cultivation</h5>
<p>Larger garden beds, small fruit trees, beehives, chicken runs. Visited daily or every few days. Still actively managed but slightly further out.</p>
<h5>Zone 3 — Farm Zone</h5>
<p>Larger-scale production: orchards, field crops, dams, larger animal systems. Visited weekly. Less intensive management.</p>
<h5>Zone 4 — Semi-Wild</h5>
<p>Managed woodland, foraging areas, timber, wild food harvesting. Minimal input, visited occasionally.</p>
<h5>Zone 5 — Wilderness</h5>
<p>Unmanaged natural area for observation and learning. Wildlife habitat, seed source, and inspiration. You observe here but don't intervene.</p>
<div class="tip">In Comfrey, zones are generated automatically around your house. Elements placed closer to the house are assigned to lower zones.</div>`,
		relevance: { tools: ['library', 'zones'], climates: [] },
		tryItAction: { label: 'Toggle zone overlay', layer: 'zones' }
	},
	{
		id: 'sector-analysis',
		category: 'principles',
		title: 'Sector Analysis',
		summary: 'Understanding sun, wind, water, and fire sectors that flow through your site.',
		readingTime: 4,
		body: `<h4>Reading Your Sectors</h4>
<p>Sectors are external energies that flow <em>through</em> your site. Unlike zones (which you control), sectors are natural forces you work with.</p>
<h5>Sun Sector</h5>
<p>The arc from sunrise to sunset changes with the seasons. In summer, the sun is high and the arc is wide. In winter, it's low and narrow. Place sun-loving plants and solar panels in the sun sector. Use shade structures or deciduous trees where you need summer shade but winter sun.</p>
<h5>Wind Sector</h5>
<p>Your prevailing wind direction determines where to place windbreaks, and which side of buildings gets battered. In the southern hemisphere, cold winds typically come from the south. Place sensitive plants on the lee side of windbreaks.</p>
<h5>Water Sector</h5>
<p>Water flows downhill. Your site's slope and aspect determine where water accumulates and where it drains away. Place water-hungry plants downhill and water catchment structures where runoff concentrates.</p>
<h5>Fire Sector</h5>
<p>If you're in a fire-prone area, identify the direction fires typically approach from. Create firebreaks, use fire-resistant plants, and keep Zone 1 clear of dense vegetation on the fire sector side.</p>
<div class="tip">Use the Sectors overlay in Comfrey to visualize your site's sun, wind, and slope sectors.</div>`,
		relevance: { tools: ['analysis', 'sectors'], climates: [] },
		tryItAction: { label: 'Show sector overlay', layer: 'sectors' }
	},
	{
		id: 'succession-stacking',
		category: 'principles',
		title: 'Succession & Stacking',
		summary: 'Using time and vertical space to maximize productivity.',
		readingTime: 3,
		body: `<h4>Working in Four Dimensions</h4>
<p>Permaculture uses both vertical space (stacking) and time (succession) to create productive, resilient systems.</p>
<h5>Vertical Stacking — The 7 Layers</h5>
<p>A food forest mimics natural woodland with seven functional layers:</p>
<ol>
<li><strong>Canopy</strong> — Tall fruit/nut trees (apple, walnut, chestnut)</li>
<li><strong>Understory</strong> — Smaller trees (fig, mulberry, citrus)</li>
<li><strong>Shrub</strong> — Berry bushes (blueberry, currant, gooseberry)</li>
<li><strong>Herbaceous</strong> — Herbs and perennials (comfrey, yarrow, mint)</li>
<li><strong>Groundcover</strong> — Low-spreading plants (strawberry, clover, thyme)</li>
<li><strong>Root</strong> — Root vegetables and tubers (potato, carrot, Jerusalem artichoke)</li>
<li><strong>Vine</strong> — Climbing plants (grape, kiwi, passionfruit)</li>
</ol>
<h5>Temporal Succession</h5>
<p>Your design evolves over years. Year 1 is infrastructure and fast-growing support species. Year 2-3 adds fruit trees and perennials. Year 5+ the food forest matures and becomes self-sustaining. Plan for this succession in your action plan.</p>
<div class="tip">When browsing the Plant Database, notice the layer tags. Try to include plants from multiple layers for a stacked design.</div>`,
		relevance: { tools: ['plants', 'guilds'], climates: [] },
		tryItAction: { label: 'Browse plant database', panel: 'plants' }
	},

	// --- Plant & Species Guides ---
	{
		id: 'climate-planting',
		category: 'plants',
		title: 'Climate-Matched Planting',
		summary: 'Choosing plants that thrive in your specific climate type.',
		readingTime: 4,
		body: `<h4>Right Plant, Right Place</h4>
<p>The most important factor in plant selection is matching plants to your climate. A plant that thrives in the tropics will struggle in a temperate winter, no matter how well you care for it.</p>
<h5>Tropical Climates</h5>
<p>Year-round warmth and moisture. Focus on: banana, papaya, mango, cassava, taro, moringa, pigeon pea. Canopy layers provide crucial shade. Succession planting is fast — trees establish in 2-3 years.</p>
<h5>Subtropical Climates</h5>
<p>Mild winters, warm summers. Ideal for: citrus, avocado, macadamia, loquat, guava. A mix of tropical and temperate species works. Frost protection may be needed for a few weeks per year.</p>
<h5>Temperate Climates</h5>
<p>Distinct seasons with cold winters. Focus on: apple, pear, plum, cherry, hazelnut, walnut. Many plants need winter chill hours to fruit properly. Plan for seasonal dormancy.</p>
<h5>Arid Climates</h5>
<p>Limited rainfall, often extreme heat. Focus on: olive, fig, pomegranate, date palm, prickly pear, jujube. Water harvesting is critical. Mulch heavily and design swales to capture every drop.</p>
<div class="tip">Comfrey automatically detects your climate type and highlights suitable plants in the Plant Database. Check the Analysis panel for your climate details.</div>`,
		relevance: { tools: ['plants', 'analysis'], climates: ['tropical', 'subtropical', 'temperate', 'arid'] },
		tryItAction: { label: 'Check your climate', panel: 'analysis' }
	},
	{
		id: 'companion-planting',
		category: 'plants',
		title: 'Companion Planting',
		summary: 'Plants that help each other grow — and combinations to avoid.',
		readingTime: 3,
		body: `<h4>Friends and Foes in the Garden</h4>
<p>Companion planting is the practice of placing plants together that benefit each other — through pest deterrence, nutrient sharing, shade provision, or pollinator attraction.</p>
<h5>The Three Sisters</h5>
<p>The classic example: corn, beans, and squash planted together. Corn provides a trellis for beans. Beans fix nitrogen for corn and squash. Squash shades the soil and deters pests with its prickly leaves.</p>
<h5>Common Good Companions</h5>
<ul>
<li><strong>Tomato + Basil</strong> — Basil repels aphids and whiteflies</li>
<li><strong>Apple + Comfrey</strong> — Comfrey mines nutrients and provides mulch</li>
<li><strong>Carrot + Onion</strong> — Each deters the other's pest flies</li>
<li><strong>Rose + Garlic</strong> — Garlic deters aphids from roses</li>
</ul>
<h5>Bad Companions</h5>
<ul>
<li><strong>Walnut + most plants</strong> — Walnuts release juglone, which inhibits many species</li>
<li><strong>Fennel + most vegetables</strong> — Fennel inhibits growth of nearby plants</li>
<li><strong>Potato + Tomato</strong> — Both are nightshades; share diseases</li>
</ul>
<div class="tip">Use the Guilds panel in Comfrey to check companion relationships between your placed plants and get guild suggestions.</div>`,
		relevance: { tools: ['guilds', 'plants'], climates: [] },
		tryItAction: { label: 'Check plant guilds', panel: 'guilds' }
	},
	{
		id: 'fruit-tree-guilds',
		category: 'plants',
		title: 'Fruit Tree Guilds',
		summary: 'Building a polyculture support system around each fruit tree.',
		readingTime: 4,
		body: `<h4>What is a Fruit Tree Guild?</h4>
<p>A guild is a group of plants arranged around a central element (usually a fruit tree) where each plant serves a specific function. Together, they create a self-maintaining mini-ecosystem.</p>
<h5>The 6 Guild Roles</h5>
<ol>
<li><strong>Central tree</strong> — The primary producer (apple, pear, cherry, etc.)</li>
<li><strong>Nitrogen fixer</strong> — Feeds the tree via root nodules (clover, lupin, pea shrub)</li>
<li><strong>Dynamic accumulator</strong> — Mines deep minerals, provides mulch when cut (comfrey, yarrow, chicory)</li>
<li><strong>Pest confuser</strong> — Aromatic plants that mask the tree's scent (garlic, chives, tansy, marigold)</li>
<li><strong>Pollinator attractor</strong> — Flowers that bring bees and beneficial insects (borage, lavender, calendula)</li>
<li><strong>Groundcover</strong> — Living mulch that suppresses weeds and retains moisture (strawberry, clover, thyme)</li>
</ol>
<h5>Example: Apple Tree Guild</h5>
<p>Apple tree (center) + white clover (N-fixer groundcover) + comfrey (accumulator) + garlic chives (pest confuser) + borage (pollinator) + strawberry (groundcover + yield).</p>
<div class="tip">Place a fruit tree, then use the Guilds panel to see suggested companion plants for that species.</div>`,
		relevance: { tools: ['guilds', 'plants'], climates: [] },
		tryItAction: { label: 'Open guilds panel', panel: 'guilds' }
	},
	{
		id: 'soil-building',
		category: 'plants',
		title: 'Soil Building Plants',
		summary: 'Nitrogen fixers, dynamic accumulators, and ground covers that build healthy soil.',
		readingTime: 3,
		body: `<h4>Plants That Build Soil</h4>
<p>Healthy soil is the foundation of any permaculture system. Certain plants actively improve soil quality through biological processes.</p>
<h5>Nitrogen Fixers</h5>
<p>These plants host rhizobium bacteria in their root nodules, converting atmospheric nitrogen into plant-available form. When they're cut or die back, that nitrogen is released into the soil.</p>
<ul>
<li><strong>Trees:</strong> Black locust, alder, Siberian pea shrub</li>
<li><strong>Shrubs:</strong> Lupin, broom, gorse</li>
<li><strong>Ground:</strong> Clover, vetch, field peas</li>
</ul>
<h5>Dynamic Accumulators</h5>
<p>Deep-rooted plants that mine minerals from subsoil and concentrate them in their leaves. When you "chop and drop" their leaves as mulch, those minerals become available to shallow-rooted plants.</p>
<ul>
<li><strong>Comfrey</strong> — The king of accumulators. Mines potassium, calcium, magnesium, iron. Cut 4-5 times per year.</li>
<li><strong>Yarrow</strong> — Accumulates potassium, phosphorus, copper</li>
<li><strong>Chicory</strong> — Deep taproot mines calcium and potassium</li>
</ul>
<h5>Ground Covers</h5>
<p>Living mulch that protects soil from erosion, compaction, and moisture loss. Keeps soil biology active year-round.</p>
<div class="tip">In the Plant Database, look for the "N-fixer" and "Accumulator" tags to find soil-building plants for your design.</div>`,
		relevance: { tools: ['plants'], climates: [] },
		tryItAction: { label: 'Browse soil builders', panel: 'plants' }
	},

	// --- Using Comfrey (Tutorials) ---
	{
		id: 'tutorial-site-setup',
		category: 'tutorials',
		title: 'Site Setup',
		summary: 'How to set your location, draw your boundary, and run site analysis.',
		readingTime: 3,
		body: `<h4>Setting Up Your Site</h4>
<p>The wizard walks you through four steps to get started.</p>
<h5>Step 1: Location</h5>
<p>Search for your address or click directly on the satellite map. This sets your geographic coordinates, which Comfrey uses to look up climate data, sun paths, and elevation.</p>
<h5>Step 2: Boundary</h5>
<p>Draw your property boundary by clicking points on the map. This polygon defines your design area and is used to calculate total area, generate zones, and clip analysis data.</p>
<h5>Step 3: Analysis</h5>
<p>Comfrey fetches data from the Open-Meteo weather API to determine your climate zone, average rainfall, temperature range, frost-free days, and prevailing wind. Sun positions are calculated locally using SunCalc. Elevation data is fetched to determine slope and aspect.</p>
<h5>Step 4: House Placement</h5>
<p>Click to place your house — this becomes Zone 0. Permaculture zones 1-5 are generated as concentric rings radiating outward from this point.</p>
<div class="tip">After setup, you can always view your analysis data in the Analysis panel of the editor.</div>`,
		relevance: { tools: [], climates: [] }
	},
	{
		id: 'tutorial-analysis',
		category: 'tutorials',
		title: 'Reading Your Analysis',
		summary: 'Understanding the climate, sun, wind, and elevation data for your site.',
		readingTime: 4,
		body: `<h4>Understanding Your Site Data</h4>
<p>The Analysis panel shows everything Comfrey learned about your site. Here's how to read it.</p>
<h5>Climate Data</h5>
<p><strong>Climate type</strong> (tropical/subtropical/temperate/arid) determines which plants will thrive. <strong>Average rainfall</strong> tells you if you need water harvesting. <strong>Frost-free days</strong> indicate your growing season length. <strong>USDA zone</strong> helps cross-reference with plant databases.</p>
<h5>Sun Data</h5>
<p>Shows sun positions at summer solstice, winter solstice, and equinox. <strong>Altitude</strong> is how high the sun gets — important for shadow calculations. <strong>Azimuth</strong> is the compass direction. <strong>Day length</strong> ranges show how much light varies through the year.</p>
<h5>Wind Data</h5>
<p><strong>Prevailing direction</strong> is where wind most often comes from. <strong>Average speed</strong> helps decide if you need windbreaks. Place sensitive plants on the sheltered side.</p>
<h5>Elevation</h5>
<p><strong>Slope</strong> affects water flow — steeper slopes need contour swales. <strong>Aspect</strong> (which direction the slope faces) determines sun exposure — south-facing (northern hemisphere) gets the most sun.</p>
<div class="tip">Toggle the Sun Path and Sectors overlays to see this data visualized on your map.</div>`,
		relevance: { tools: ['analysis'], climates: [] },
		tryItAction: { label: 'Open analysis panel', panel: 'analysis' }
	},
	{
		id: 'tutorial-elements',
		category: 'tutorials',
		title: 'Placing & Organizing Elements',
		summary: 'Using the element library, placing items, dragging, rotating, and resizing.',
		readingTime: 3,
		body: `<h4>Working with Elements</h4>
<p>Elements are the building blocks of your design — structures, plants, water features, and paths.</p>
<h5>Placing Elements</h5>
<p>Open the <strong>Elements</strong> panel, then click any element type. Your cursor switches to placement mode — click on the map to place it. Press <strong>Escape</strong> to cancel.</p>
<h5>Selecting & Moving</h5>
<p>Click any placed element to select it (shown by a blue ring). A drag handle appears — drag it to move the element. Click empty space to deselect.</p>
<h5>Properties</h5>
<p>When an element is selected, the Properties panel shows its details. You can adjust <strong>rotation</strong> (0-360°) and <strong>scale</strong> (0.5x to 3x). Each element type also has specific properties (e.g., a water tank's capacity, a shed's purpose).</p>
<h5>Deleting</h5>
<p>Select an element and press <strong>Delete</strong> or <strong>Backspace</strong>, or use the delete button in the Properties panel.</p>
<h5>Undo/Redo</h5>
<p>Press <strong>Ctrl+Z</strong> to undo and <strong>Ctrl+Shift+Z</strong> to redo. Up to 50 steps are saved.</p>
<div class="tip">Elements placed closer to the house are automatically assigned to lower permaculture zones.</div>`,
		relevance: { tools: ['library', 'properties'], climates: [] },
		tryItAction: { label: 'Open element library', panel: 'library' }
	},
	{
		id: 'tutorial-water',
		category: 'tutorials',
		title: 'Water Flow & Terrain',
		summary: 'Interpreting the D8 water flow overlay and elevation profile.',
		readingTime: 3,
		body: `<h4>Reading Water on Your Land</h4>
<p>Water is the most important resource in permaculture. Understanding how it moves across your site lets you capture, store, and distribute it effectively.</p>
<h5>Water Flow Overlay</h5>
<p>Toggle the <strong>Water</strong> layer to see flow arrows. These show the direction water runs based on the D8 (eight-direction) flow algorithm applied to elevation data. Arrows point downhill along the steepest path.</p>
<h5>What to Look For</h5>
<ul>
<li><strong>Convergence points</strong> — Where multiple arrows meet. These are natural water collection areas — ideal for dams, swales, or moisture-loving plants.</li>
<li><strong>Divergence points</strong> — Where water spreads out. These are ridges or high points — good for structures or dry-tolerant plants.</li>
<li><strong>Flow paths</strong> — Lines of consistent flow direction. These are drainage lines — don't build here unless you want wet feet.</li>
</ul>
<h5>Elevation Profile</h5>
<p>Use the <strong>Measure</strong> tool to draw a line across your site, then check the elevation profile in the Analysis panel. This shows the terrain cross-section along that line — useful for planning contour swales and terraces.</p>
<div class="tip">Place water tanks and dams at convergence points, and garden beds along contour lines (perpendicular to flow arrows).</div>`,
		relevance: { tools: ['analysis', 'waterFlow'], climates: ['arid'] },
		tryItAction: { label: 'Show water flow', layer: 'waterFlow' }
	},
	{
		id: 'tutorial-review',
		category: 'tutorials',
		title: 'Design Review',
		summary: 'Using the AI advisor and design review system to improve your design.',
		readingTime: 3,
		body: `<h4>Getting Feedback on Your Design</h4>
<p>Comfrey provides two levels of design feedback.</p>
<h5>Advisor Tips</h5>
<p>As you place elements, the Advisor automatically suggests improvements based on permaculture principles. Tips appear in the bottom-right corner and in the Advisor panel. Each tip explains <em>why</em> a suggestion matters and what to do about it.</p>
<p>Tips are triggered by your actions — placing a water tank uphill from a garden, putting a chicken coop far from the house, or creating zones. The system checks spatial relationships, climate conditions, and permaculture best practices.</p>
<h5>Design Review</h5>
<p>The <strong>Review</strong> panel provides a comprehensive score of your design across multiple criteria: zone usage, element diversity, companion relationships, water management, and more. Each category shows what's working and what could improve.</p>
<p>For deeper analysis, you can optionally connect an AI API (OpenAI, Anthropic, or Ollama) in the Review panel settings to get natural language feedback about your specific design.</p>
<div class="tip">Try placing a few elements, then check the Advisor panel for tips. Use the Review panel for a full design assessment.</div>`,
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
```

**Step 3: Commit**

```bash
git add src/lib/types/index.ts src/lib/catalog/lessons.ts
git commit -m "feat: add lesson types and catalog with 14 permaculture lessons"
```

---

### Task 2: Learning Progress Store & Storage

**Files:**
- Create: `src/lib/stores/learning.svelte.ts`
- Modify: `src/lib/services/storage.ts`

**Step 1: Upgrade IndexedDB schema for learning progress**

In `src/lib/services/storage.ts`, add a `learning` object store. Bump `DB_VERSION` to 2 and handle the upgrade:

```typescript
interface ComfreyDB extends DBSchema {
	projects: {
		key: string;
		value: Project;
		indexes: { 'by-updated': string };
	};
	learning: {
		key: string; // single record with key 'progress'
		value: { id: string; completedLessons: string[] };
	};
}

const DB_VERSION = 2;
```

In the `upgrade` callback, add version check:

```typescript
upgrade(db, oldVersion) {
	if (oldVersion < 1) {
		const store = db.createObjectStore('projects', { keyPath: 'id' });
		store.createIndex('by-updated', 'updatedAt');
	}
	if (oldVersion < 2) {
		db.createObjectStore('learning', { keyPath: 'id' });
	}
}
```

Add two new exported functions:

```typescript
export async function loadLearningProgress(): Promise<string[]> {
	const db = await getDB();
	const record = await db.get('learning', 'progress');
	return record?.completedLessons ?? [];
}

export async function saveLearningProgress(completedLessons: string[]): Promise<void> {
	const db = await getDB();
	await db.put('learning', { id: 'progress', completedLessons });
}
```

**Step 2: Create the learning store**

Create `src/lib/stores/learning.svelte.ts`:

```typescript
import { lessons } from '$lib/catalog/lessons';
import { loadLearningProgress, saveLearningProgress } from '$lib/services/storage';
import type { ClimateType } from '$lib/types';

class LearningStore {
	completedLessons = $state<Set<string>>(new Set());
	loaded = $state(false);

	async load() {
		if (this.loaded) return;
		const ids = await loadLearningProgress();
		this.completedLessons = new Set(ids);
		this.loaded = true;
	}

	async toggleLesson(id: string) {
		const next = new Set(this.completedLessons);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		this.completedLessons = next;
		await saveLearningProgress([...next]);
	}

	isCompleted(id: string): boolean {
		return this.completedLessons.has(id);
	}

	categoryProgress(category: string): { done: number; total: number } {
		const categoryLessons = lessons.filter((l) => l.category === category);
		const done = categoryLessons.filter((l) => this.completedLessons.has(l.id)).length;
		return { done, total: categoryLessons.length };
	}

	getSuggestedLessons(activePanel: string, activeLayers: Record<string, boolean>, climate?: ClimateType): typeof lessons {
		return lessons
			.map((lesson) => {
				let score = 0;
				// Tool/panel relevance
				if (lesson.relevance.tools.includes(activePanel)) score += 2;
				for (const [layer, active] of Object.entries(activeLayers)) {
					if (active && lesson.relevance.tools.includes(layer)) score += 2;
				}
				// Climate relevance
				if (climate && lesson.relevance.climates.includes(climate)) score += 1;
				// Incomplete lessons get a boost
				if (!this.completedLessons.has(lesson.id)) score += 1;
				return { lesson, score };
			})
			.filter(({ score }) => score > 1)
			.sort((a, b) => b.score - a.score)
			.map(({ lesson }) => lesson);
	}
}

export const learning = new LearningStore();
```

**Step 3: Commit**

```bash
git add src/lib/stores/learning.svelte.ts src/lib/services/storage.ts
git commit -m "feat: add learning progress store and IndexedDB persistence"
```

---

### Task 3: Editor Store — Panel State

**Files:**
- Modify: `src/lib/stores/editor.svelte.ts`

**Step 1: Add learn panel state**

Add to the `EditorStore` class:

```typescript
learnPanel = $state<'closed' | 'minimized' | 'open' | 'maximized'>('closed');

openLearnPanel(): void {
	this.learnPanel = 'open';
}

minimizeLearnPanel(): void {
	this.learnPanel = 'minimized';
}

maximizeLearnPanel(): void {
	this.learnPanel = 'maximized';
}

closeLearnPanel(): void {
	this.learnPanel = 'closed';
}

toggleLearnPanel(): void {
	this.learnPanel = this.learnPanel === 'closed' ? 'open' : 'closed';
}
```

**Step 2: Commit**

```bash
git add src/lib/stores/editor.svelte.ts
git commit -m "feat: add learn panel state to editor store"
```

---

### Task 4: LearnPanel Component

**Files:**
- Create: `src/lib/components/editor/LearnPanel.svelte`

**Step 1: Build the slide-over panel**

Create `src/lib/components/editor/LearnPanel.svelte`. This is the main panel with all four states (closed/minimized/open/maximized).

Key structure:
- Outer wrapper: `position: fixed`, right-aligned, full height, with transition
- Header: title, minimize/maximize/close buttons
- Body: two sections — "Suggested for you" (from `getSuggestedLessons`) and categorized list
- Each lesson card: title, summary, reading time, completion checkbox
- Clicking a lesson opens `LessonView` inline (replaces the list)
- Back button to return to the list from a lesson
- CSS transitions for slide-in/out and width changes

Panel widths:
- Minimized: `w-12` (48px)
- Open: `w-[420px]`
- Maximized: `w-[80vw]`

The component receives no props — it reads from `editor` and `learning` stores directly.

Use these Tailwind classes for the panel container:
```
fixed top-0 right-0 h-full bg-white shadow-xl z-50 transition-all duration-300 ease-in-out
```

The lesson list should show category headers with progress counts (e.g., "Principles 2/5"), and each lesson shows a checkmark if completed.

"Try it" actions on lessons should call `editor.sidebarPanel = panel` or `editor.showLayers[layer] = true` as appropriate.

**Step 2: Commit**

```bash
git add src/lib/components/editor/LearnPanel.svelte
git commit -m "feat: add LearnPanel slide-over component"
```

---

### Task 5: LessonView Component

**Files:**
- Create: `src/lib/components/editor/LessonView.svelte`

**Step 1: Build the lesson renderer**

Create `src/lib/components/editor/LessonView.svelte`. Props:

```typescript
interface Props {
	lessonId: string;
	onBack: () => void;
}
```

Features:
- Header with back arrow, lesson title, and reading time
- HTML body rendered via `{@html lesson.body}`
- Style the `.tip` divs inside body content with a green-tinted callout box
- "Mark as completed" toggle button at the bottom
- "Try it" button if lesson has `tryItAction`
- Scrollable content area

Add a scoped `<style>` block to style the HTML content:
```css
:global(.tip) {
	background: #f0fdf4;
	border-left: 3px solid #16a34a;
	padding: 0.75rem;
	margin: 0.75rem 0;
	border-radius: 0.375rem;
	font-size: 0.8125rem;
	color: #15803d;
}
```

**Step 2: Commit**

```bash
git add src/lib/components/editor/LessonView.svelte
git commit -m "feat: add LessonView component for rendering lesson content"
```

---

### Task 6: Integrate into Editor Page

**Files:**
- Modify: `src/routes/design/[id]/+page.svelte`

**Step 1: Add Learn button to toolbar**

In the toolbar section (around line 433, after the "Review" button), add:

```svelte
<button
	onclick={() => { editor.toggleLearnPanel(); }}
	class="rounded px-2 py-1 text-xs font-medium {editor.learnPanel !== 'closed'
		? 'bg-indigo-600 text-white'
		: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
>
	Learn
</button>
```

**Step 2: Mount LearnPanel in the map area**

Import LearnPanel at the top of the script:
```typescript
import { learning } from '$lib/stores/learning.svelte';
```

In the `onMount`, add:
```typescript
learning.load();
```

In the template, inside the `<main>` element (after AdvisorCard), add:

```svelte
{#await import('$lib/components/editor/LearnPanel.svelte') then { default: LearnPanel }}
	<LearnPanel />
{/await}
```

**Step 3: Commit**

```bash
git add src/routes/design/[id]/+page.svelte
git commit -m "feat: integrate learning hub into editor with Learn button and panel"
```

---

### Task 7: Test & Polish

**Step 1: Manual verification**

Run the dev server and verify:
- [ ] Learn button appears in toolbar
- [ ] Clicking Learn opens the panel from the right
- [ ] Panel shows "Suggested for you" section with context-relevant lessons
- [ ] Full categorized lesson list shows below suggestions
- [ ] Clicking a lesson shows its content
- [ ] "Mark as completed" toggles and persists after page reload
- [ ] Category progress counts update
- [ ] Minimize button collapses panel to thin strip
- [ ] Maximize button expands panel to 80% width
- [ ] Close button hides panel completely
- [ ] "Try it" buttons switch to the correct panel/layer
- [ ] Map remains interactive when panel is open
- [ ] Panel transitions are smooth

**Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete learning hub with slide-over panel, 14 lessons, and progress tracking"
```

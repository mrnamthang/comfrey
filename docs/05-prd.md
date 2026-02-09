# Comfrey — Product Requirements Document

*Consolidated technical architecture and implementation plan. This is the single source of truth for building Comfrey's MVP.*

*Version: 2.0 — Updated with non-functional requirements, error handling, testing strategy, use cases, and behavioral specifications.*

---

## 1. Overview

### Problem

People buy bare land and face overwhelming decisions: house placement, orientation, water management, planting zones, access roads. Existing tools are either too complex (QGIS, SketchUp) or too generic (garden planners that ignore whole-property design). No tool offers a guided, opinionated, beginner-friendly experience that applies permaculture principles automatically.

### Solution

Comfrey is a **guided land design tool that acts as a permaculture advisor**. It analyzes your site (sun, wind, climate, terrain), recommends where to place structures and plantings, teaches you permaculture principles along the way, and produces three outputs: a visual site plan, a phased action plan, and a genuine understanding of your land.

### What Comfrey Is NOT

- Not a professional GIS tool — it's for beginners
- Not a blank canvas — it's an advisor that produces a visual plan
- Not a garden planner — it handles whole-property design (house, water, zones, paths, everything)

### The Litmus Test

Before building any feature, ask: **"Does this make the tool smarter, or just more drawable?"** Prioritize intelligence over canvas features.

---

## 2. User Persona

> **Thang** is a developer based in Vietnam, actively shopping for bare land (up to ~10 hectares). He's watched YouTube videos about permaculture (Geoff Lawton, Morag Gamble, Happen Films) and read introductory material, but doesn't know how to translate principles into a real design for a specific piece of land. He's overwhelmed by decisions: Where should the house face? Where does water flow? What grows in this climate? He wants one tool that analyzes his site, recommends a starting layout, teaches him *why*, and lets him refine it over time.

### Key Traits

- **Beginner** permaculture knowledge
- **Motivated learner** — wants to understand, not just follow instructions
- **Non-technical user mindset** — even though he's a developer, the UX must work for non-developers
- **Multiple climates** — tool must handle tropical (Vietnam) and temperate contexts
- **5-10 hours/week** available for building

### Secondary Users (Post-MVP)

- People who already have land and want to add food production
- Permaculture students who want to practice design on real site data
- Dreamers evaluating properties before purchasing

---

## 3. Product Identity

### The Three Layers

| Layer | Role | Example |
|-------|------|---------|
| **Advisor** | Recommends where things should go based on site data | "Your slope faces north-east — place the house here for morning sun and afternoon shade" |
| **Teacher** | Explains why each recommendation matters | "In tropical climates, afternoon shade reduces cooling costs and protects heat-sensitive plants" |
| **Canvas** | Lets the user accept, modify, or override any recommendation | User drags the house to a different spot — advisor adapts suggestions accordingly |

### Core Outputs

| # | Output | Description | MVP Implementation |
|---|--------|-------------|-------------------|
| 1 | **Visual site plan** | A printable map showing where everything goes — elements, zones, boundary, labels | PNG export with all visible layers (F9) |
| 2 | **Action plan** | Phased implementation timeline: what to build/plant in Year 1, Year 2, Year 3 | Auto-generated from element priorities and zone order (F11) |
| 3 | **Understanding** | Knowledge of your land's sun, water, wind, soil — the "why" behind every decision | Site analysis summary + advisor tip history (F3, F7) |

---

## 4. Tech Stack

| Technology | Purpose | Why | Fallback |
|-----------|---------|-----|----------|
| **SvelteKit** | Frontend framework | Developer's primary stack, Svelte 5 runes for fine reactivity | — |
| **Mapbox GL JS** | 2D satellite base layer, geocoding, drawing | Best-in-class map SDK, free tier is generous | MapLibre GL JS (open-source fork) |
| **@mapbox/mapbox-gl-draw** | Boundary polygon drawing/editing | Out-of-the-box polygon tools | @mapbox/mapbox-gl-draw works with MapLibre |
| **@turf/turf** | Geospatial calculations | Area, buffers, point-in-polygon, distance | — (vendor-neutral) |
| **SunCalc.js** | Sun position/path calculations | Client-side, no API needed | — (vendor-neutral) |
| **Open-Meteo API** | Climate and weather data | Completely free, no API key | Visual Crossing (free tier) |
| **Mapbox Terrain RGB** | Elevation data | Decode RGB tiles → elevation values | OpenTopography API |
| **IndexedDB** (via idb) | Local persistence | No server needed for MVP | — |
| **Tailwind CSS** | Styling | Developer's preferred CSS approach | — |
| **Vitest** | Unit testing | Fast, Vite-native, TypeScript support | — |
| **Playwright** | E2E testing | Cross-browser, works with SvelteKit | — |

### Browser Compatibility

| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome / Edge | Latest 2 versions | Full support (primary development target) |
| Firefox | Latest 2 versions | Full support |
| Safari | 16+ | Full support (WebGL required for Mapbox) |
| Mobile browsers | — | **Not supported in MVP** (desktop-only) |

**Requirement**: WebGL 1.0 support (required by Mapbox GL JS). If WebGL is unavailable, show a clear error message: "Comfrey requires a browser with WebGL support. Please use Chrome, Firefox, or Safari."

### Cost

- Mapbox: 50k free geocoding/month, free satellite/terrain tiles
- Open-Meteo: completely free, no key
- SunCalc: client-side, no API
- **MVP total cost: $0** (beyond free Mapbox token)

---

## 5. Architecture

### 5.1 Data Model

#### Entity Graph

```
Project (top-level container)
├── Land
│   ├── boundary: GeoJSON Polygon
│   ├── location: [lng, lat]
│   └── SiteAnalysis (auto-fetched)
│       ├── climate: { zone, type, avgTemp, rainfall, frostDates, hemisphere }
│       ├── sun: { summerSolstice, winterSolstice, daylength }
│       ├── wind: { prevailing direction, speed }
│       ├── elevation: { min, max, slope, aspect }
│       └── soil: { type, pH, drainage } (Phase 3)
├── Design (user can have multiple per land)
│   ├── zones: Zone[]
│   ├── elements: Element[]
│   ├── layers: Layer[]
│   └── actionPlan: ActionPlan (auto-generated)
├── AdvisorState
│   ├── seenTips: string[]
│   ├── dismissedTips: string[]
│   └── appliedTips: string[]
└── metadata: { name, created, updated, version }
```

#### Core Interfaces

```typescript
// === FOUNDATIONAL TYPES ===

/** Schema definition for element-specific metadata fields */
interface FieldDef {
  type: 'string' | 'number' | 'boolean' | 'select';
  label: string;                      // human-readable label for the properties panel
  required: boolean;
  default?: string | number | boolean;
  options?: string[];                 // for 'select' type only
  unit?: string;                      // e.g. "liters", "meters", "kg"
  min?: number;                       // for 'number' type
  max?: number;                       // for 'number' type
}

/** Sun position at a specific date/time */
interface SunPosition {
  altitude: number;                   // degrees above horizon (0-90)
  azimuth: number;                    // degrees from north, clockwise (0-360)
  sunrise: string;                    // ISO time string "06:23"
  sunset: string;                     // ISO time string "18:45"
  daylength: number;                  // hours of daylight
}

type ClimateType = 'tropical' | 'subtropical' | 'temperate' | 'arid';
type Hemisphere = 'northern' | 'southern';
type LayerType = 'infrastructure' | 'planting' | 'water' | 'paths';

/** Async operation status for loading states */
type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;              // user-friendly error message
}

// === LAND & DESIGN ===

interface Project {
  id: string;
  name: string;
  land: {
    boundary: GeoJSON.Polygon;
    location: [number, number];       // [lng, lat]
    area: number;                     // sq meters, computed from boundary
  };
  analysis: AsyncState<SiteAnalysis>;
  designs: Design[];
  advisorState: AdvisorState;
  createdAt: string;
  updatedAt: string;
  version: number;                    // schema version for data migrations
}

interface SiteAnalysis {
  climate: {
    zone: string;                     // e.g. "11a" (USDA hardiness)
    type: ClimateType;
    hemisphere: Hemisphere;           // derived from latitude
    avgRainfall: number;              // mm/year
    avgTemp: { summer: number; winter: number }; // celsius
    frostFreeDays: number;
    monsoonMonths?: [number, number]; // [startMonth, endMonth] — tropical only
  };
  sun: {
    summerSolstice: SunPosition;
    winterSolstice: SunPosition;
    equinox: SunPosition;
    daylength: { longest: number; shortest: number };  // hours
  };
  wind: {
    prevailing: number;               // degrees (0-360, 0 = from north)
    avgSpeed: number;                 // km/h
    label: string;                    // human-readable: "North-west at 12 km/h"
  };
  elevation: {
    min: number;                      // meters above sea level
    max: number;
    slope: number;                    // degrees average
    aspect: number;                   // degrees (dominant facing direction, 0 = north)
    aspectLabel: string;              // human-readable: "North-east facing"
    heightmap?: Float32Array;         // grid for terrain rendering
  };
}

interface Design {
  id: string;
  name: string;
  elements: Element[];
  zones: Zone[];
  layers: Layer[];
  actionPlan: ActionPlan;
  camera: { center: [number, number]; zoom: number; bearing: number };
}

interface Element {
  id: string;
  typeId: string;                     // references ElementType catalog
  geometry: GeoJSON.Point | GeoJSON.Polygon;
  properties: {
    rotation: number;                 // degrees, 0-360
    scale: number;                    // multiplier, default 1.0
    zone?: number;                    // which permaculture zone (0-5), auto-assigned
    layer: LayerType;
    label?: string;                   // user-given name
    meta: Record<string, unknown>;    // type-specific, validated by ElementType.metaSchema
  };
}

interface ElementType {
  id: string;
  name: string;
  category: 'structure' | 'plant' | 'water' | 'animal' | 'path' | 'utility';
  icon: string;                       // SVG string for 2D view
  defaultSize: { width: number; height: number };  // meters
  canRotate: boolean;
  canResize: boolean;
  implementationPhase: 1 | 2 | 3;    // which year to implement (for action plan)
  metaSchema: Record<string, FieldDef>;
}

interface Zone {
  id: string;
  level: 0 | 1 | 2 | 3 | 4 | 5;
  geometry: GeoJSON.Polygon;
  color: string;                      // semi-transparent fill, e.g. "rgba(34,139,34,0.2)"
  description: string;                // human-readable: "Daily use zone — herbs, salad, clothesline"
}

interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
}

// === ACTION PLAN ===

interface ActionPlan {
  phases: ActionPhase[];
}

interface ActionPhase {
  year: number;                       // 1, 2, or 3
  title: string;                      // "Foundation & Infrastructure"
  items: ActionItem[];
}

interface ActionItem {
  elementId?: string;                 // reference to placed element (if applicable)
  description: string;                // "Build water catchment tank on the north slope"
  category: LayerType;
  zone: number;                       // which permaculture zone
  priority: 'essential' | 'recommended' | 'optional';
}

// === ADVISOR SYSTEM ===

interface AdvisorTip {
  id: string;
  trigger: TipTrigger;
  condition?: TipCondition;
  climate: ClimateType | 'all';
  hemisphere?: Hemisphere;            // some tips are hemisphere-specific
  headline: string;                   // "Water flows downhill"
  explanation: string;                // 2-3 sentences with site-specific context
  shortReminder: string;             // abbreviated version for repeat views
  learnMore?: string;                 // expanded mini-lesson (shown on demand)
  action?: TipAction;
  priority: number;                   // higher = shown first (1-100)
}

interface TipAction {
  label: string;                      // "Move it for me"
  type: TipActionType;
  payload?: Record<string, unknown>;  // action-specific data
}

type TipActionType =
  | 'move_element_uphill'             // moves the triggering element to a higher elevation
  | 'rotate_element_to_sun'           // rotates element to face the sun
  | 'suggest_position'               // highlights a recommended position on the map
  | 'open_learn_more';               // opens the learn more panel

type TipTrigger =
  | { type: 'element_placed'; elementType: string }
  | { type: 'element_near'; elementA: string; elementB: string; maxDistance: number }
  | { type: 'element_position'; elementType: string; check: 'uphill' | 'downhill' | 'sunny' | 'shaded' | 'windward' | 'leeward' }
  | { type: 'zone_created'; zoneLevel: number }
  | { type: 'analysis_complete' }
  | { type: 'wizard_step'; step: string }
  | { type: 'design_review' };        // fired when user clicks "Review my design"

type TipCondition =
  | { type: 'elevation_compare'; elementA: string; elementB: string; expected: 'higher' | 'lower' }
  | { type: 'distance_from_house'; maxMeters: number }
  | { type: 'sun_exposure'; aspect: 'sunny' | 'shaded' }
  | { type: 'climate_is'; climate: ClimateType }
  | { type: 'hemisphere_is'; hemisphere: Hemisphere };

interface AdvisorState {
  seenTips: string[];                 // tip IDs the user has seen (for adaptive depth)
  dismissedTips: string[];            // tip IDs the user dismissed
  appliedTips: string[];              // tip IDs the user accepted
}
```

#### Key Design Decisions

- **GeoJSON everywhere** — no coordinate conversion, Mapbox consumes it natively
- **Elements use `Point` for small items** (trees, tanks) **and `Polygon` for area items** (garden beds, buildings)
- **`ElementType` is a catalog**, `Element` is an instance — separation keeps design data lean
- **`AdvisorTip` is a catalog**, `AdvisorState` is per-project — tips are static content, state tracks user interaction
- **`ClimateType` + `Hemisphere` drive tip filtering** — derived from site analysis, used to show/hide context-specific advice
- **`AsyncState<T>` wraps all async data** — ensures every API-dependent value has explicit loading/error states
- **`version` field on Project** — enables forward-compatible data migrations when schema changes
- **`ActionPlan` is auto-generated** from placed elements — each `ElementType` has an `implementationPhase`, and the plan is rebuilt whenever elements change
- **Store as flat JSON** in IndexedDB — trivial to migrate to PostgreSQL + PostGIS later

### 5.2 Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── map/
│   │   │   ├── MapView.svelte            # Mapbox GL wrapper
│   │   │   ├── BoundaryDraw.svelte       # Draw/edit land boundary
│   │   │   ├── ElementLayer.svelte       # Renders all placed elements (GeoJSON layer)
│   │   │   ├── ZoneLayer.svelte          # Renders zone overlays
│   │   │   └── SunPathOverlay.svelte     # Sun arc visualization
│   │   ├── editor/
│   │   │   ├── Toolbar.svelte            # Tool selection (select, place, draw)
│   │   │   ├── ElementLibrary.svelte     # Draggable element palette
│   │   │   ├── PropertiesPanel.svelte    # Selected element properties
│   │   │   ├── LayerPanel.svelte         # Toggle layer visibility
│   │   │   ├── AnalysisSidebar.svelte    # Site analysis summary
│   │   │   └── ActionPlanPanel.svelte    # Phased implementation timeline
│   │   ├── advisor/
│   │   │   ├── AdvisorCard.svelte        # The Civ VI-style popup card
│   │   │   └── AdvisorPanel.svelte       # Sidebar panel: tip history & browse
│   │   ├── wizard/
│   │   │   ├── WizardShell.svelte        # Step container + progress
│   │   │   ├── StepLocation.svelte       # Enter address / pin on map
│   │   │   ├── StepBoundary.svelte       # Draw property boundary
│   │   │   ├── StepAnalysis.svelte       # Auto-fetch + show results
│   │   │   └── StepHouse.svelte          # Place house → trigger zone suggestions
│   │   └── ui/                           # Generic UI components
│   │       ├── LoadingSpinner.svelte     # Consistent loading indicator
│   │       ├── ErrorBanner.svelte        # Dismissable error messages
│   │       └── ...
│   ├── stores/
│   │   ├── project.svelte.ts             # Project & design state (Svelte 5 runes)
│   │   ├── editor.svelte.ts              # UI state: active tool, selection, mode
│   │   ├── advisor.svelte.ts             # Advisor state: seen/dismissed tips, queue
│   │   ├── history.svelte.ts             # Undo/redo command stack (deferred from MVP)
│   │   └── analysis.svelte.ts            # Site analysis async state
│   ├── services/
│   │   ├── geocoding.ts                  # Mapbox Geocoding API
│   │   ├── climate.ts                    # Open-Meteo API + deriveClimateType()
│   │   ├── elevation.ts                  # Mapbox Terrain RGB decoding
│   │   ├── sun.ts                        # SunCalc wrapper
│   │   ├── advisor.ts                    # Tip matching engine: event → matching tips
│   │   ├── zones.ts                      # Zone generation: house position → default zones
│   │   ├── action-plan.ts                # Action plan generator from design state
│   │   ├── storage.ts                    # IndexedDB save/load + JSON export/import
│   │   └── export.ts                     # PNG export
│   ├── catalog/
│   │   ├── elements.ts                   # ElementType definitions (8 MVP items)
│   │   ├── tips.ts                       # AdvisorTip definitions (15 MVP tips)
│   │   ├── zones.ts                      # Zone presets, colors, descriptions
│   │   └── icons/                        # SVG icons for elements
│   ├── types/
│   │   └── index.ts                      # All TypeScript interfaces
│   └── utils/
│       ├── geo.ts                        # Area calc, point-in-polygon, bearing, buffer
│       ├── units.ts                      # Meters ↔ feet, hectares ↔ acres
│       ├── id.ts                         # nanoid wrapper
│       └── validation.ts                 # Boundary polygon validation rules
├── routes/
│   ├── +page.svelte                      # Dashboard: project list
│   ├── +layout.svelte                    # App shell
│   ├── new/
│   │   └── +page.svelte                  # Wizard flow (create project)
│   └── design/
│       └── [id]/
│           └── +page.svelte              # Main editor (full-screen map + panels)
├── tests/
│   ├── unit/
│   │   ├── climate.test.ts               # deriveClimateType() tests
│   │   ├── advisor.test.ts               # tip matching engine tests
│   │   ├── zones.test.ts                 # zone generation tests
│   │   ├── action-plan.test.ts           # action plan generator tests
│   │   ├── geo.test.ts                   # geospatial utility tests
│   │   └── validation.test.ts            # boundary validation tests
│   └── e2e/
│       ├── wizard.test.ts                # full wizard flow
│       └── editor.test.ts                # element placement and editing
└── static/
    └── models/                           # Reserved for Phase 2 (3D assets)
```

### 5.3 Event System

The advisor system reacts to user actions. Events flow through a lightweight publish/subscribe pattern using Svelte 5 reactivity.

```typescript
// services/advisor.ts

type DesignEvent =
  | { type: 'element_placed'; element: Element; analysis: SiteAnalysis }
  | { type: 'element_moved'; element: Element; previousPosition: GeoJSON.Position; analysis: SiteAnalysis }
  | { type: 'element_deleted'; element: Element }
  | { type: 'zone_created'; zone: Zone }
  | { type: 'analysis_complete'; analysis: SiteAnalysis }
  | { type: 'wizard_step_entered'; step: string }
  | { type: 'design_review_requested' };

/**
 * Core tip matching engine. Called by store methods after state changes.
 *
 * Flow:
 * 1. User places element → project.addElement() is called
 * 2. addElement() updates state AND calls advisorService.processEvent()
 * 3. processEvent() finds matching tips → enqueues them in AdvisorStore
 *
 * This is a direct function call, not an event bus — keeps it simple for MVP.
 */
function processEvent(
  event: DesignEvent,
  design: Design,
  analysis: SiteAnalysis,
  advisorState: AdvisorState
): AdvisorTip[] {
  return allTips
    .filter(tip => matchesTrigger(tip.trigger, event))
    .filter(tip => matchesClimate(tip.climate, analysis.climate.type))
    .filter(tip => matchesHemisphere(tip.hemisphere, analysis.climate.hemisphere))
    .filter(tip => !advisorState.dismissedTips.includes(tip.id))
    .filter(tip => !advisorState.appliedTips.includes(tip.id))
    .filter(tip => meetsCondition(tip.condition, event, design, analysis))
    .sort((a, b) => b.priority - a.priority);
}
```

**Why direct function calls instead of an event bus**: For a solo-developer MVP with one consumer (the advisor), an event bus adds complexity without benefit. The project store calls `processEvent()` directly after mutations. If more consumers emerge (e.g., analytics, sound effects), introduce an event bus then.

### 5.4 State Management

#### Svelte 5 Runes

```typescript
// stores/project.svelte.ts
class ProjectStore {
  current = $state<Project | null>(null);
  activeDesignId = $state<string | null>(null);
  activeDesign = $derived(
    this.current?.designs.find(d => d.id === this.activeDesignId) ?? null
  );

  addElement(element: Element): void {
    if (!this.activeDesign) return;
    this.activeDesign.elements.push(element);

    // Notify advisor
    const tips = processEvent(
      { type: 'element_placed', element, analysis: this.current!.analysis.data! },
      this.activeDesign,
      this.current!.analysis.data!,
      this.current!.advisorState
    );
    tips.forEach(tip => advisor.enqueue(tip));

    // Regenerate action plan
    this.activeDesign.actionPlan = generateActionPlan(this.activeDesign);
  }

  moveElement(id: string, position: GeoJSON.Position): void { /* update geometry + re-check advisor */ }
  removeElement(id: string): void { /* splice from elements + regenerate action plan */ }
  updateZones(zones: Zone[]): void { /* replace zones array */ }
}

// stores/editor.svelte.ts
class EditorStore {
  tool = $state<'select' | 'place' | 'draw'>('select');
  selectedElementId = $state<string | null>(null);
  placingType = $state<string | null>(null);
  showLayers = $state({ zones: true, elements: true, sunPath: false });
  sidebarPanel = $state<'library' | 'properties' | 'analysis' | 'advisor' | 'action-plan'>('library');
}

// stores/advisor.svelte.ts
class AdvisorStore {
  queue = $state<AdvisorTip[]>([]);
  activeTip = $derived(this.queue[0] ?? null);
  state = $state<AdvisorState>({ seenTips: [], dismissedTips: [], appliedTips: [] });

  enqueue(tip: AdvisorTip): void {
    if (this.state.dismissedTips.includes(tip.id)) return;
    if (this.state.appliedTips.includes(tip.id)) return;
    if (this.queue.some(t => t.id === tip.id)) return;  // no duplicates
    this.queue.push(tip);
    if (!this.state.seenTips.includes(tip.id)) {
      this.state.seenTips.push(tip.id);
    }
  }

  dismiss(): void {
    const tip = this.queue.shift();
    if (tip) this.state.dismissedTips.push(tip.id);
  }

  apply(): void {
    const tip = this.queue.shift();
    if (tip) this.state.appliedTips.push(tip.id);
  }

  hasSeenTip(tipId: string): boolean {
    return this.state.seenTips.includes(tipId);
  }
}

// stores/analysis.svelte.ts
class AnalysisStore {
  state = $state<AsyncState<SiteAnalysis>>({ status: 'idle', data: null, error: null });

  async analyze(lat: number, lng: number): Promise<void> {
    this.state = { status: 'loading', data: null, error: null };
    try {
      const [climate, elevation, sun] = await Promise.all([
        fetchClimate(lat, lng),
        fetchElevation(lat, lng),
        computeSunPath(lat, lng),
      ]);
      const analysis = buildSiteAnalysis(climate, elevation, sun, lat);
      this.state = { status: 'success', data: analysis, error: null };
    } catch (err) {
      this.state = {
        status: 'error',
        data: null,
        error: getUserFriendlyError(err),
      };
    }
  }
}
```

#### Auto-Save

```typescript
$effect(() => {
  const data = $state.snapshot(project.current);
  debouncedSave(data, 1000);  // save after 1s of no changes
});
```

### 5.5 API Integration

```
User enters address
    │
    ▼
Mapbox Geocoding API ──→ [lng, lat]
    │  Error → "Could not find that address. Try a different search term or drop a pin on the map."
    │
    ├──→ Mapbox Satellite Tiles ──→ base layer imagery
    │       Error → gray basemap with message: "Satellite imagery unavailable. You can still design with the base map."
    │
    ├──→ Mapbox Terrain RGB ──→ elevation heightmap
    │       Error → elevation section shows "Elevation data unavailable for this location" + skip elevation-dependent tips
    │       height = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
    │
    ├──→ Open-Meteo API ──→ climate data
    │       GET /v1/forecast?latitude={lat}&longitude={lng}
    │           &daily=temperature_2m_max,temperature_2m_min,
    │             precipitation_sum,wind_speed_10m_max,
    │             wind_direction_10m_dominant
    │           &timezone=auto&past_days=365
    │       Also: archive-api.open-meteo.com for historical averages
    │       Error → "Climate data temporarily unavailable. Your design will work, but some advisor tips may be less specific."
    │       Timeout → 10 seconds, then show partial results with missing sections marked
    │
    ├──→ SunCalc.js (client-side) ──→ sun path
    │       No error possible (client-side computation)
    │       getPosition(date, lat, lng) → altitude, azimuth
    │       getTimes(date, lat, lng) → sunrise/sunset/noon
    │
    └──→ deriveClimateType(analysis) ──→ ClimateType
            See: "Climate Classification Algorithm" below
```

#### Climate Classification Algorithm (`deriveClimateType`)

```typescript
/**
 * Classifies a location into one of four climate types based on
 * temperature and rainfall data from Open-Meteo.
 *
 * Based on simplified Koppen climate classification:
 * - Tropical: coldest month avg > 18°C
 * - Subtropical: coldest month avg 10-18°C, warmest > 22°C
 * - Temperate: coldest month avg 0-10°C
 * - Arid: annual rainfall < 250mm OR annual rainfall < 500mm AND avg temp > 18°C
 *
 * Hemisphere is derived from latitude (positive = northern, negative = southern).
 * This affects sun path advice (equator-facing = north in southern hemisphere, south in northern).
 */
function deriveClimateType(
  avgTempColdestMonth: number,  // celsius
  avgTempWarmestMonth: number,  // celsius
  annualRainfall: number,       // mm
  latitude: number
): { type: ClimateType; hemisphere: Hemisphere } {
  const hemisphere: Hemisphere = latitude >= 0 ? 'northern' : 'southern';

  // Arid check first (overrides temperature-based classification)
  if (annualRainfall < 250) {
    return { type: 'arid', hemisphere };
  }
  if (annualRainfall < 500 && avgTempColdestMonth > 18) {
    return { type: 'arid', hemisphere };
  }

  // Temperature-based classification
  if (avgTempColdestMonth > 18) {
    return { type: 'tropical', hemisphere };
  }
  if (avgTempColdestMonth >= 10 && avgTempWarmestMonth > 22) {
    return { type: 'subtropical', hemisphere };
  }
  return { type: 'temperate', hemisphere };
}
```

**Test cases for `deriveClimateType()`:**

| Location | Coldest Month | Warmest Month | Rainfall | Expected |
|----------|--------------|---------------|----------|----------|
| Ho Chi Minh City, Vietnam | 25°C | 29°C | 1800mm | tropical, northern |
| Christchurch, New Zealand | 6°C | 17°C | 640mm | temperate, southern |
| Brisbane, Australia | 15°C | 25°C | 1150mm | subtropical, southern |
| Alice Springs, Australia | 12°C | 36°C | 280mm | arid, southern |
| Marrakech, Morocco | 11°C | 37°C | 240mm | arid, northern |
| Hanoi, Vietnam | 17°C | 29°C | 1700mm | subtropical, northern |

### 5.6 Core Interactions

#### Element Placement — Hybrid Rendering

- Render all elements as a **single GeoJSON source + layer** (fast, handles hundreds)
- When an element is **selected**, swap it to a **Svelte Marker overlay** with drag handles
- Deselect → back to GeoJSON layer

This gives map-native performance for rendering + rich Svelte-powered editing for the active element.

#### Drag from Library

Drag element type from sidebar → `dragover` shows ghost preview at cursor → `drop` creates Element at map coordinate via `map.unproject()`.

#### Zone Generation Algorithm (Manual with Smart Defaults)

When user places house, generate default zone polygons:

```typescript
/**
 * Generates permaculture zones as editable polygons based on house position.
 *
 * Algorithm:
 * 1. Zone 0: the house footprint polygon itself
 * 2. Zone 1: Turf.buffer(houseCenter, 15m) intersected with boundary
 * 3. Zone 2: Turf.buffer(houseCenter, 40m) - Zone1, intersected with boundary
 * 4. Zone 3: Turf.buffer(houseCenter, 80m) - Zone2, intersected with boundary
 * 5. Zone 4: remaining boundary area - Zone3
 * 6. Zone 5: not generated (user can manually designate wild areas)
 *
 * All zones are clipped to the property boundary via Turf.intersect().
 * Buffer distances scale with property size (below are for 1 hectare).
 */
function generateZones(
  housePosition: GeoJSON.Point,
  housePolygon: GeoJSON.Polygon,
  boundary: GeoJSON.Polygon,
  propertyArea: number              // sq meters
): Zone[] { /* ... */ }
```

**Scaling rules:**

| Property Size | Zone 1 Radius | Zone 2 Radius | Zone 3 Radius |
|--------------|---------------|---------------|---------------|
| < 2,000 sqm | 8m | 20m | boundary edge |
| 2,000 - 10,000 sqm | 15m | 40m | 80m |
| 10,000 - 50,000 sqm | 20m | 60m | 150m |
| > 50,000 sqm | 25m | 80m | 200m |

**Concrete example:**

> Given a rectangular 1-hectare (100m x 100m) property with house placed at position (30m, 50m) from the south-west corner:
>
> - Zone 0: 12m x 10m rectangle at house position
> - Zone 1: ~15m radius circle around house, clipped to boundary. Roughly 700 sqm.
> - Zone 2: Annular ring from 15m to 40m, clipped. Roughly 4,300 sqm.
> - Zone 3: Annular ring from 40m to 80m, clipped. Roughly 4,000 sqm.
> - Zone 4: Everything remaining within boundary. Roughly 1,000 sqm (corners).
> - Zone 5: Not auto-generated.

**Zone colors (conventional permaculture palette):**

| Zone | Color | Opacity | Description |
|------|-------|---------|-------------|
| 0 | `#1a1a1a` | 0.4 | Home / center of activity |
| 1 | `#228B22` | 0.2 | Daily use — herbs, salad greens, clothesline |
| 2 | `#32CD32` | 0.15 | Frequent use — orchard, main garden beds, chickens |
| 3 | `#90EE90` | 0.1 | Occasional — large crops, pasture, food forest |
| 4 | `#D2B48C` | 0.1 | Minimal management — timber, foraging, windbreak |
| 5 | `#808080` | 0.05 | Wild — unmanaged, wildlife habitat, conservation |

### 5.7 Advisor System

#### How It Works

```
User action (place element, create zone, complete analysis)
    │
    ▼
Store method (e.g. project.addElement())
    │ Updates state + calls advisorService.processEvent()
    │
    ▼
Tip matching engine (services/advisor.ts)
    │ Checks: trigger match? climate match? hemisphere match? condition met? not dismissed?
    │
    ▼
Matching tips enqueued in AdvisorStore
    │ Displayed after 500ms delay (feels natural, not jarring)
    │
    ▼
AdvisorCard.svelte renders the top tip
    ├── Headline: "Water flows downhill"
    ├── Body: full explanation (first time) OR short reminder (repeat)
    ├── [Apply suggestion]  [Dismiss]  [Learn more]
    └── Auto-dismisses after 30 seconds if user doesn't interact
```

#### Adaptive Depth

| User History | Display | Example |
|-------------|---------|---------|
| First time seeing tip | Headline + full explanation + "Learn more" | "**Water flows downhill.** Your water tank is 3m lower than your garden beds. If you move it uphill, you can gravity-feed irrigation without a pump. [Move it for me] [Dismiss] [Learn more]" |
| Seen before, not dismissed | Headline + short reminder | "**Water flows downhill.** Consider placing tanks above what they feed. [Dismiss]" |
| Previously dismissed | Don't show | — |
| Previously applied | Don't show | — |

#### Behavioral Specifications (Given/When/Then)

**Scenario 1: First-time tip display**
```
Given: User has never seen tip #6 ("Water flows downhill")
  And: Climate is "tropical"
  And: Tip #6 has climate = "all"
When:  User places a water tank
Then:  After 500ms, AdvisorCard appears with:
       - Headline: "Water flows downhill"
       - Full explanation (2-3 sentences)
       - Buttons: [Apply suggestion] [Dismiss] [Learn more]
  And: Tip #6 is added to advisorState.seenTips
```

**Scenario 2: Repeat tip (shortened)**
```
Given: User has seen tip #6 before (it's in seenTips)
  And: User has NOT dismissed tip #6
When:  User places a second water tank
Then:  AdvisorCard appears with:
       - Headline: "Water flows downhill"
       - Short reminder only (1 sentence)
       - Buttons: [Dismiss]
```

**Scenario 3: Dismissed tip stays hidden**
```
Given: User has dismissed tip #6 (it's in dismissedTips)
When:  User places a third water tank
Then:  No advisor card appears for tip #6
  But: Tip #13 ("Gravity is free energy") CAN still fire if a garden bed is nearby
       (it's a different tip with a different ID)
```

**Scenario 4: Climate filtering**
```
Given: Site analysis classified climate as "tropical"
When:  User places a garden bed
Then:  Tip #7 ("Shade is your friend" — tropical) fires
  And: Tip #8 ("Follow the sun" — temperate) does NOT fire
```

**Scenario 5: Hemisphere-aware advice**
```
Given: Property is in New Zealand (southern hemisphere)
When:  User places a house
Then:  Tip #2 fires with explanation referencing "north-facing" as the sunny side
  And: NOT "south-facing" (which would be correct for northern hemisphere)
```

**Scenario 6: Proximity trigger**
```
Given: User has placed a water tank at position A
  And: User has placed a garden bed at position B
  And: Distance between A and B is less than 30 meters
When:  The element_near trigger evaluates
Then:  Tip #13 ("Gravity is free energy") fires
  And: The explanation includes the actual elevation difference between A and B
```

**Scenario 7: Multiple tips queue**
```
Given: Site analysis just completed for a tropical location
When:  analysis_complete event fires
Then:  Tip #1 ("Meet your land") is enqueued with priority 100
  And: Tip #14 ("Monsoon planning") is enqueued with priority 80
  And: Tip #1 is shown first (higher priority)
  And: After user dismisses tip #1, tip #14 appears
```

**Scenario 8: Auto-dismiss**
```
Given: AdvisorCard is showing tip #4
  And: User has not interacted with it
When:  30 seconds pass
Then:  The card auto-dismisses (slides out)
  And: Tip #4 is added to seenTips but NOT dismissedTips
  And: Tip #4 can show again next time its trigger fires (in short form)
```

#### MVP Tip Catalog (15 tips)

| # | ID | Trigger | Climate | Hemisphere | Priority | Headline | Short Reminder |
|---|-----|---------|---------|------------|----------|----------|----------------|
| 1 | `meet-your-land` | `analysis_complete` | all | all | 100 | "Meet your land" | "Review your site analysis in the sidebar." |
| 2 | `house-sun-temperate` | `element_placed: house` | temperate | all | 90 | "Face the sun" | "Orient living areas toward the equator." |
| 3 | `house-sun-tropical` | `element_placed: house` | tropical | all | 90 | "Chase the breeze, dodge the heat" | "Orient for ventilation and afternoon shade." |
| 4 | `zone-1-intro` | `zone_created: 1` | all | all | 85 | "Zone 1 is your daily zone" | "Herbs, salad, clothesline near the house." |
| 5 | `zone-2-intro` | `zone_created: 2` | all | all | 80 | "Zone 2: visit often, maintain less" | "Orchard, main beds, chickens here." |
| 6 | `water-tank-placement` | `element_placed: water-tank` | all | all | 75 | "Water flows downhill" | "Place tanks uphill from what they feed." |
| 7 | `garden-shade-tropical` | `element_placed: garden-bed` | tropical | all | 70 | "Shade is your friend" | "Afternoon shade protects crops from heat." |
| 8 | `garden-sun-temperate` | `element_placed: garden-bed` | temperate | all | 70 | "Follow the sun" | "Maximize sun for the growing season." |
| 9 | `chicken-loop` | `element_placed: chicken-coop` | all | all | 65 | "Close the loop" | "Coop near compost and garden = nutrient cycle." |
| 10 | `compost-proximity` | `element_placed: compost` | all | all | 65 | "Kitchen → compost → garden" | "Short path from kitchen to compost to beds." |
| 11 | `tree-mature-size` | `element_placed: fruit-tree` | all | all | 60 | "Think about mature size" | "Plan for full canopy, not sapling size." |
| 12 | `shed-near-work` | `element_placed: shed` | all | all | 55 | "Store near where you work" | "Tools close to where you use them." |
| 13 | `gravity-feed` | `element_near: water-tank + garden-bed` | all | all | 75 | "Gravity is free energy" | "Tank uphill = free irrigation pressure." |
| 14 | `monsoon-planning` | `analysis_complete` | tropical | all | 80 | "Monsoon planning" | "Design drainage for wet season runoff." |
| 15 | `frost-dates` | `analysis_complete` | temperate | all | 80 | "Know your frost dates" | "Plan planting around last/first frost." |

### 5.8 Action Plan Generation

The action plan is the second core output. It is **auto-generated** from the design state — no manual input required.

```typescript
/**
 * Generates a phased action plan from the current design.
 *
 * Logic:
 * 1. Group elements by their ElementType.implementationPhase (1, 2, or 3)
 * 2. Within each phase, sort by zone (lower zones first — Zone 1 before Zone 3)
 * 3. Within each zone, sort by category priority: infrastructure > water > planting > paths > animal > utility
 * 4. Generate human-readable descriptions using element type + position context
 */
function generateActionPlan(design: Design): ActionPlan {
  // Phase 1 (Year 1): infrastructure + water — foundation
  // Phase 2 (Year 2): planting + animal — productive systems
  // Phase 3 (Year 3): utility + refinement — optimization
}
```

**Element implementation phases:**

| Element | Phase | Rationale |
|---------|-------|-----------|
| House | 1 | Must exist before anything else |
| Water tank | 1 | Water infrastructure is foundational |
| Path | 1 | Access routes enable all other work |
| Shed | 1 | Tool storage needed from day one |
| Garden bed | 2 | Plant after water and paths are in |
| Fruit tree | 2 | Plant early — trees take years to produce |
| Compost | 2 | Start composting when garden beds begin |
| Chicken coop | 3 | Animals come last — need established systems |

**Example output** (for a design with house, water tank, 3 garden beds, 2 fruit trees, compost, chicken coop):

```
Year 1: Foundation & Infrastructure
  ├── [Essential] Build house on the north-east slope (Zone 0)
  ├── [Essential] Install water tank on the upper north slope (Zone 2) — gravity feeds to garden
  └── [Recommended] Create main path from house to garden area (Zone 1-2)

Year 2: Productive Systems
  ├── [Essential] Establish garden bed near kitchen door (Zone 1)
  ├── [Essential] Establish 2 garden beds in the sunny clearing (Zone 2)
  ├── [Recommended] Plant 2 fruit trees on the north-east aspect (Zone 2)
  └── [Recommended] Set up compost system between kitchen and garden (Zone 1)

Year 3: Integration
  └── [Optional] Build chicken coop near compost area (Zone 2) — nutrient cycling
```

---

## 6. MVP Feature Requirements

### F1: Address Search → Satellite View

**What**: User enters an address or drops a pin → map centers on location with satellite imagery.

**Acceptance Criteria**:
- [ ] Text input with Mapbox Geocoding autocomplete
- [ ] Map flies to selected location with smooth animation (duration < 2s)
- [ ] Satellite tile layer renders at zoom level 16-18 (property-scale)
- [ ] Works for addresses in Vietnam and New Zealand (test both)
- [ ] User can alternatively click/long-press on the map to drop a pin manually
- [ ] **Error: no results** → inline message: "No results found. Try a different search or drop a pin on the map."
- [ ] **Error: geocoding API down** → inline message: "Address search is temporarily unavailable. You can drop a pin on the map instead."
- [ ] **Loading**: search input shows a spinner while geocoding request is in flight

**Input Validation**:
- Minimum 3 characters before triggering autocomplete
- Debounce autocomplete requests by 300ms

---

### F2: Boundary Drawing

**What**: User draws a polygon defining their property boundary.

**Acceptance Criteria**:
- [ ] Mapbox GL Draw polygon tool activated via a clear "Draw boundary" button
- [ ] User clicks to place vertices, double-clicks to close
- [ ] Boundary polygon saved as GeoJSON in project store
- [ ] Area calculated and displayed (sq meters + hectares for metric, sq feet + acres for imperial)
- [ ] Boundary editable after creation (drag vertices, add/remove vertices)
- [ ] "Reset boundary" button clears and allows redrawing
- [ ] Visual feedback: boundary polygon has a visible stroke (2px, blue) and semi-transparent fill

**Input Validation**:
- [ ] Minimum 3 vertices required (triangle is the simplest valid polygon)
- [ ] Self-intersecting polygons are rejected with message: "Your boundary lines cross each other. Please redraw without crossing lines."
- [ ] Property size limits: minimum 50 sqm, maximum 500,000 sqm (50 hectares). Outside range → warning: "This property size is [too small / very large] for detailed permaculture design. Results may be less useful."
- [ ] Polygon must be closed (automatically closed on double-click)

---

### F3: Site Analysis

**What**: Auto-fetch sun, climate, wind, and elevation data for the property location.

**Acceptance Criteria**:
- [ ] Open-Meteo API returns climate data (temperature, rainfall, wind)
- [ ] SunCalc computes sun path for summer solstice, winter solstice, and equinox
- [ ] Mapbox Terrain RGB returns elevation data
- [ ] `deriveClimateType()` correctly classifies all test cases (see Section 5.5)
- [ ] Hemisphere correctly derived from latitude
- [ ] Results displayed in AnalysisSidebar with beginner-friendly labels (see below)
- [ ] Advisor tip #1 ("Meet your land") fires on completion
- [ ] Climate-specific tips (#14 or #15) fire based on classification
- [ ] **Loading state**: AnalysisSidebar shows skeleton/spinner with message "Analyzing your site..." during API calls
- [ ] **Partial failure**: if one API fails, show available data with a note for missing sections: "Elevation data unavailable for this location."
- [ ] **Full failure**: "We couldn't analyze this site right now. Check your internet connection and try again. [Retry]"
- [ ] **Timeout**: 10 seconds per API call. On timeout, treat as partial failure.

**Beginner-friendly label requirements** — analysis summary must translate raw data into actionable language:

| Raw Data | Beginner Label | Example |
|----------|---------------|---------|
| avgTemp.summer: 29°C | "Hot summers" | "Your summers average 29°C — heat-tolerant crops like sweet potato and okra will thrive" |
| frostFreeDays: 365 | "Year-round growing" | "No frost risk — you can grow food all year" |
| frostFreeDays: 180 | "6-month growing season" | "Expect frost from November to March — protect tender plants" |
| prevailing wind: 315° at 18km/h | "Strong north-west wind" | "Your prevailing wind comes from the north-west. Consider a windbreak on that side." |
| slope: 12° | "Moderate slope" | "Your land has a moderate slope (12°). Good for drainage, may need terracing for garden beds." |
| aspect: 45° | "North-east facing" | "Your land primarily faces north-east — morning sun exposure, afternoon shade" |

---

### F4: Element Catalog & Placement

**What**: Library of 8 draggable element types. User places them on the map.

**MVP Element Catalog**:

| Element | Category | Default Size (m) | Phase | Meta Fields |
|---------|----------|-------------------|-------|-------------|
| House | structure | 12 x 10 | 1 | `{ bedrooms: number, stories: number }` |
| Shed | structure | 4 x 3 | 1 | `{ purpose: 'tools' \| 'storage' \| 'workshop' }` |
| Garden bed | plant | 3 x 1.2 | 2 | `{ raised: boolean, irrigated: boolean }` |
| Fruit tree | plant | 4 x 4 (canopy) | 2 | `{ species: string, yearsToFruit: number }` |
| Water tank | water | 2.5 x 2.5 | 1 | `{ capacityLiters: number }` |
| Chicken coop | animal | 3 x 2 | 3 | `{ maxChickens: number }` |
| Compost | utility | 1.5 x 1.5 | 2 | `{ type: 'bin' \| 'tumbler' \| 'pile' }` |
| Path | path | polyline, 1m wide | 1 | `{ surface: 'gravel' \| 'mulch' \| 'concrete' \| 'dirt' }` |

**Acceptance Criteria**:
- [ ] ElementLibrary sidebar shows all 8 types with icons and names
- [ ] Drag from library onto map places element at drop position
- [ ] Click on map in "place" mode places element at click position
- [ ] Elements render as icons on the GeoJSON layer at correct real-world scale
- [ ] Relevant advisor tip fires when each element type is first placed
- [ ] Path element uses polyline drawing (click points to define path, double-click to finish)
- [ ] Elements placed outside the property boundary → warning: "This element is outside your property boundary."
- [ ] Maximum 200 elements per design (performance guard)
- [ ] Each element auto-assigned to the nearest zone (based on distance from house)

---

### F5: Select, Move, Delete

**What**: Basic editing of placed elements.

**Acceptance Criteria**:
- [ ] Click element in "select" mode → element highlights (blue outline, 2px), PropertiesPanel shows details
- [ ] Drag selected element → element moves (updates GeoJSON coordinates) with smooth tracking (60fps target)
- [ ] Delete button/key (Delete or Backspace) → element removed from design
- [ ] Hybrid rendering: selected element swaps to Svelte Marker overlay with drag handle
- [ ] Deselect (click elsewhere or press Escape) → element returns to GeoJSON layer
- [ ] Proximity-based advisor tips re-evaluate when elements are moved
- [ ] Moving an element outside the boundary → same warning as F4
- [ ] Element label displayed on map when zoom level > 17

---

### F6: Zone Generation

**What**: After house placement, generate editable permaculture zone polygons.

**Acceptance Criteria**:
- [ ] User places house → system generates Zone 0-4 polygons (Zone 5 manual only)
- [ ] Zone buffer distances scale with property size (see Section 5.6 scaling table)
- [ ] Zones render as semi-transparent colored overlays (see Section 5.6 color table)
- [ ] Zone polygons are editable (drag vertices to reshape using mapbox-gl-draw)
- [ ] Advisor tips #4 and #5 fire explaining Zone 1 and Zone 2
- [ ] Each zone has a tooltip/label showing its level and description
- [ ] Zones are clipped to property boundary via `Turf.intersect()`
- [ ] Zones can be toggled on/off individually via LayerPanel
- [ ] Moving the house re-generates zones (with confirmation: "Regenerate zones around new house position? Your edits will be lost.")
- [ ] Zone polygons do not overlap (each zone ring is subtracted from the next)

---

### F7: Advisor System

**What**: Civ VI-style contextual advisor cards that pop up with permaculture guidance.

**Acceptance Criteria**:
- [ ] AdvisorCard component renders in bottom-right corner, above the map controls
- [ ] Card appears with a slide-in animation (300ms ease-out) after a 500ms delay from trigger
- [ ] Card shows: headline, explanation (or short reminder), action buttons
- [ ] "Dismiss" removes tip, records in advisorState.dismissedTips, shows next tip in queue
- [ ] "Apply suggestion" executes the tip's action, records in advisorState.appliedTips
- [ ] "Learn more" expands the card to show the detailed explanation
- [ ] Adaptive: previously seen tips show `shortReminder` instead of full `explanation`
- [ ] Tips filter by ClimateType — tropical tips don't show for temperate sites
- [ ] Tips filter by Hemisphere where applicable
- [ ] Multiple tips queue — shown one at a time, ordered by priority (descending)
- [ ] Auto-dismiss after 30 seconds of no interaction (moves to seenTips, not dismissedTips)
- [ ] All 15 MVP tips implemented and triggering correctly per behavioral specifications (Section 5.7)
- [ ] Card does not overlap the element library sidebar
- [ ] Card is keyboard-dismissable (Escape key)
- [ ] Maximum card width: 380px. Maximum card height: 280px (scrollable if content exceeds).

---

### F8: Save & Load

**What**: Persist projects to IndexedDB. Reload on return.

**Acceptance Criteria**:
- [ ] Auto-save (debounced, 1s after last change) with visual indicator ("Saved" / "Saving...")
- [ ] Dashboard page lists all saved projects with name, date, and property area
- [ ] Click project → loads into editor with full state restored (elements, zones, camera position, advisor state)
- [ ] AdvisorState persists (dismissed tips stay dismissed across sessions)
- [ ] Delete project option with confirmation dialog: "Delete [project name]? This cannot be undone."
- [ ] **JSON export**: "Download backup" button exports the full project as a `.json` file
- [ ] **JSON import**: "Import project" button on dashboard accepts a `.json` file and loads it
- [ ] **Storage error**: if IndexedDB is full or unavailable, show banner: "Auto-save failed. Download a backup of your project to avoid losing work. [Download backup]"
- [ ] **Data migration**: projects saved with older schema versions are automatically migrated to the current version on load (using the `version` field)

---

### F9: PNG Export

**What**: Export current map view as a downloadable image.

**Acceptance Criteria**:
- [ ] "Export" button captures the map canvas including all layers
- [ ] Elements, zones, boundary, and labels all visible in export
- [ ] Downloads as PNG with filename: `{project-name}-design.png`
- [ ] Resolution: 2x viewport (e.g., 2560x1440 for a 1280x720 viewport)
- [ ] Export includes a small legend in the corner showing zone colors and element icons
- [ ] **Loading**: show "Generating export..." spinner while canvas is being captured (can take 1-2s)
- [ ] Mapbox attribution is included in the export (required by Mapbox TOS)

---

### F10: Wizard Flow

**What**: Guided onboarding wizard that walks through project creation.

**Steps**:
1. **Location** — enter address or drop pin on map
2. **Boundary** — draw property boundary
3. **Analysis** — auto-fetch site data, display results
4. **House placement** — place house → auto-generate zones
5. **→ Editor** — transition to full editor with zones and house placed

**Acceptance Criteria**:
- [ ] `/new` route shows the wizard with a progress bar showing steps 1-4
- [ ] Each step validates before allowing "Next" (e.g., can't proceed past Boundary without a valid polygon)
- [ ] Step 3 shows analysis results in beginner-friendly summary (see F3 label requirements)
- [ ] Step 3 shows a loading state while APIs are fetching ("Analyzing your site...")
- [ ] Step 3 handles partial API failure gracefully (show what's available, note what's missing)
- [ ] Step 4 triggers zone generation after house is placed
- [ ] Advisor tips fire at appropriate steps (tip #1 at step 3 completion, tip #2/#3 at step 4)
- [ ] "Back" works without losing data (boundary persists when going back from Analysis)
- [ ] Completing wizard opens `/design/[id]` with the design populated (house + zones)
- [ ] **Abandonment**: if user navigates away mid-wizard, partial data is saved. Returning to `/new` offers "Continue where you left off?" or "Start fresh"

---

### F11: Action Plan

**What**: Auto-generated phased implementation timeline displayed in a sidebar panel.

**Acceptance Criteria**:
- [ ] ActionPlanPanel shows Year 1 / Year 2 / Year 3 sections
- [ ] Plan auto-regenerates whenever elements are added, moved, or deleted
- [ ] Each item shows: description, zone, priority badge (essential / recommended / optional)
- [ ] Items grouped by year, sorted by zone then category priority
- [ ] Empty states: "Add elements to your design to generate an action plan"
- [ ] Accessible via sidebar tab (alongside Library, Properties, Analysis, Advisor)
- [ ] Plan content is included in the PNG export (as a text overlay or separate export)
- [ ] Item descriptions use site-specific context: "Install water tank **on the north slope**" not just "Install water tank"

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Map initial load | < 3 seconds on 4G connection | Lighthouse performance audit |
| Map pan/zoom | 60fps with up to 50 elements visible | Chrome DevTools FPS counter |
| Element drag | < 16ms frame time (60fps) | Chrome DevTools Performance panel |
| Site analysis (API calls) | < 10 seconds total | Console timing in service layer |
| Auto-save | < 100ms (non-blocking) | IndexedDB write timing |
| PNG export | < 3 seconds | Console timing |
| Element rendering | Smooth with up to 200 elements | Manual testing with stress scenarios |

**Performance guard**: if user attempts to place element #201, show: "Maximum of 200 elements per design. Remove some elements to add more."

### 7.2 Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | All toolbar buttons, sidebar panels, and wizard steps navigable via Tab key |
| Keyboard shortcuts | Delete/Backspace = delete element, Escape = deselect/dismiss advisor card, Tab = cycle tools |
| Focus indicators | Visible focus ring (2px blue outline) on all interactive elements |
| Color contrast | All text meets WCAG 2.1 AA contrast ratio (4.5:1 for normal text, 3:1 for large text) |
| Screen reader basics | Toolbar buttons and sidebar tabs have `aria-label` attributes |
| Advisor card | Auto-dismiss pauses if card has keyboard focus |
| Zone colors | Zones use both color AND pattern (hatching) to distinguish levels (not color-only) |

**Note**: Full map accessibility (screen reader support for spatial elements) is out of scope for MVP. The map canvas is inherently visual. Focus accessibility efforts on the sidebar panels, toolbar, wizard, and advisor cards.

### 7.3 Data Resilience

| Scenario | Behavior |
|----------|----------|
| Browser tab closes mid-edit | Auto-save ensures latest state is in IndexedDB (max 1s data loss) |
| Browser data cleared | Data is lost. Mitigated by JSON export/import feature. Dashboard shows "No saved projects." |
| IndexedDB quota exceeded | Show banner with download backup option (see F8) |
| Schema version mismatch | Auto-migrate on load using `version` field. If migration fails, show: "This project was saved with a newer version of Comfrey. Please update." |
| Corrupted IndexedDB data | Try-catch on load. If JSON parse fails, show: "This project's data appears corrupted. [Download raw data] [Delete project]" |
| Concurrent tabs | Not supported in MVP. Show warning if same project is open in multiple tabs: "This project is open in another tab. Changes may conflict." |

### 7.4 Offline Behavior (MVP)

Comfrey requires an internet connection for:
- Mapbox satellite tiles and geocoding
- Open-Meteo climate data
- Mapbox Terrain RGB elevation data

**If offline**:
- Map shows tile loading errors (gray tiles). No custom handling needed — Mapbox shows its own error state.
- Site analysis fails → shows error with retry button (see F3 error handling)
- Editing existing designs (placing/moving elements, editing zones) works offline if tiles are already cached
- Auto-save to IndexedDB works offline

**Post-MVP**: Tauri desktop app with API response caching for true offline support.

---

## 8. Use Cases

### UC1: New User Creates First Design (Primary — Happy Path)

**Actor**: Beginner permaculture enthusiast
**Goal**: Create a property design from scratch

**Flow**:
1. User opens Comfrey → sees empty dashboard → clicks "New Design"
2. Wizard Step 1: enters address → map flies to location
3. Wizard Step 2: draws property boundary → area calculated
4. Wizard Step 3: site analysis runs → results displayed → advisor tip "Meet your land" fires
5. Wizard Step 4: places house → zones auto-generated → advisor tips for zones fire
6. Wizard transitions to full editor
7. User places elements from library → advisor tips fire contextually
8. User reviews action plan in sidebar
9. User exports design as PNG
10. Project auto-saved to IndexedDB

**Post-conditions**: Project persisted locally. User has a visual plan, action plan, and understanding of their site.

### UC2: Returning User Edits Existing Design

**Actor**: User with a saved project
**Goal**: Modify a previously created design

**Flow**:
1. User opens Comfrey → sees dashboard with saved projects
2. Clicks a project → editor loads with full state (elements, zones, camera, advisor state)
3. User moves elements, adds new ones, reshapes zones
4. Advisor tips fire only for new/unseen scenarios (previously dismissed tips stay hidden)
5. Action plan updates automatically as elements change
6. All changes auto-saved

### UC3: User Tries Alternative Layouts

**Actor**: User evaluating different design approaches
**Goal**: Compare two different house placements

**Flow**:
1. User has an existing design with house at position A
2. User moves house to position B
3. System prompts: "Regenerate zones around new house position? Your zone edits will be lost."
4. User confirms → zones regenerate around new position
5. Advisor tips re-fire for the new context (e.g., different sun orientation)
6. User compares the new layout, decides whether to keep it or undo (manual — undo deferred)

**Limitation (MVP)**: No side-by-side comparison. User must mentally compare or export PNGs of each layout. Multiple designs per project is deferred.

### UC4: Wizard Abandonment and Recovery

**Actor**: User who starts the wizard but navigates away
**Goal**: Resume where they left off

**Flow**:
1. User starts wizard, completes steps 1-2 (location + boundary)
2. User closes the tab or navigates to dashboard
3. Partial wizard state is saved to IndexedDB
4. User returns to `/new`
5. System detects saved wizard state → shows: "Continue where you left off?" [Continue] [Start fresh]
6. "Continue" restores the wizard at step 3 with location and boundary pre-filled
7. "Start fresh" clears the partial state

### UC5: User Disagrees with Advisor

**Actor**: User who has their own design preferences
**Goal**: Override advisor suggestions without friction

**Flow**:
1. Advisor card appears: "Water flows downhill — move your tank uphill"
2. User clicks "Dismiss" → tip disappears, recorded in dismissedTips
3. User continues with their preferred placement
4. Advisor does NOT nag about the same tip again
5. Other tips (e.g., proximity-based "Gravity is free energy") can still fire as they are different tips

### UC6: Data Backup and Restore

**Actor**: User concerned about data loss
**Goal**: Export and reimport project data

**Flow**:
1. User clicks "Download backup" on dashboard or in editor settings
2. Browser downloads `comfrey-{project-name}-{date}.json`
3. Later, user clears browser data or switches devices
4. User clicks "Import project" on dashboard
5. File picker opens → user selects the JSON file
6. Project loads into dashboard with all state restored

---

## 9. Edge Cases & Error Scenarios

### Boundary Edge Cases

| Scenario | Behavior |
|----------|----------|
| Self-intersecting polygon (bowtie shape) | Reject with message. Highlight the crossing point. |
| Very small property (< 50 sqm) | Allow with warning: "This property is very small. Zone suggestions may not be meaningful." |
| Very large property (> 50 hectares) | Allow with warning. Scale zone buffer distances per table. |
| Property on international date line | GeoJSON handles this natively. No special handling needed. |
| Property spans both hemispheres (on equator) | Use the hemisphere of the property centroid. |

### Element Edge Cases

| Scenario | Behavior |
|----------|----------|
| Element placed outside boundary | Yellow warning badge on element. Advisor tip: "This element is outside your property." |
| Two elements placed at exact same position | Allow it (user's choice). No special handling. |
| 200+ elements | Block placement with message. Suggest removing unused elements. |
| Element placed on the property boundary line | Treat as inside. No warning. |

### Analysis Edge Cases

| Scenario | Behavior |
|----------|----------|
| Location in the ocean | Geocoding works. Analysis proceeds. Results will be nonsensical but not crash. |
| Location at the poles | SunCalc handles polar coordinates. Results show extreme day/night cycles. |
| Location with no elevation data | Elevation section shows "unavailable". Zone generation uses flat-terrain defaults. Elevation-dependent advisor tips are suppressed. |
| Open-Meteo returns incomplete data | Show available data with placeholders for missing fields: "Data not available." |
| Mapbox token expired or invalid | Map shows gray tiles. Show error banner: "Map tiles could not load. Check your Mapbox token in settings." |

### Advisor Edge Cases

| Scenario | Behavior |
|----------|----------|
| All tips dismissed | No advisor cards appear. Advisor panel shows: "You've reviewed all tips. [Reset tips]" |
| 5+ tips fire simultaneously | Queue all, show one at a time by priority. Max queue size: 10 (drop lowest priority). |
| Tip fires during wizard | Show card in wizard context (not just editor). Card positioning adapts to wizard layout. |
| User rapidly places and deletes elements | Debounce advisor processing by 200ms to avoid flickering cards. |

---

## 10. Testing Strategy

### Unit Tests (Vitest)

**What to test**: Pure logic functions that are critical to correctness.

| Module | Test Coverage Target | Key Test Cases |
|--------|---------------------|----------------|
| `services/climate.ts` → `deriveClimateType()` | 100% | All 6 test locations (Section 5.5), boundary conditions (exactly 18°C, exactly 250mm), hemisphere derivation |
| `services/advisor.ts` → `processEvent()` | 100% | All 8 behavioral scenarios (Section 5.7), climate filtering, hemisphere filtering, dismissed tip suppression, priority ordering |
| `services/zones.ts` → `generateZones()` | 90% | All 4 property size tiers, boundary clipping, non-overlapping zones, house at edge of property |
| `services/action-plan.ts` → `generateActionPlan()` | 90% | Correct phasing, sorting by zone then category, empty design, single element |
| `utils/geo.ts` | 90% | Area calculation, point-in-polygon, distance between points, bearing calculation |
| `utils/validation.ts` | 100% | Self-intersection detection, minimum vertices, area bounds |

**Total**: ~60-80 unit tests covering the core logic layer.

### Integration Tests (Vitest)

| Test | What It Validates |
|------|------------------|
| `analyzeSite()` integration | Climate + sun + elevation services compose correctly, partial failure handling |
| Store → Advisor flow | `project.addElement()` triggers advisor `processEvent()` and enqueues correct tips |
| Auto-save roundtrip | Save to IndexedDB → load → all state matches |
| Data migration | Old schema version → load → auto-migrated to current version |

### E2E Tests (Playwright)

| Test | Flow |
|------|------|
| Happy path wizard | Enter address → draw boundary → analysis completes → place house → zones generated → transition to editor |
| Element placement | Select element from library → place on map → verify it appears → select → move → delete |
| Advisor interaction | Place water tank → advisor card appears → dismiss → place another → card shows short version |
| Save and restore | Complete wizard → close browser → reopen → dashboard shows project → click → state restored |
| Export | Complete a design → click export → PNG downloads → verify file size > 0 |

**Total**: ~10-15 E2E tests covering the critical user flows.

### Manual Testing Checklist (Per Checkpoint)

- [ ] Test with a real Vietnam address (tropical climate)
- [ ] Test with a real New Zealand address (temperate climate, southern hemisphere)
- [ ] Test with a real Morocco address (arid climate)
- [ ] Test with a property < 500 sqm
- [ ] Test with a property > 5 hectares
- [ ] Disconnect internet → verify graceful degradation
- [ ] Open in Chrome, Firefox, and Safari → verify consistent rendering
- [ ] Verify all zone colors are distinguishable (including for color-blind users via hatching)

---

## 11. Implementation Plan

### Estimated pace: 5-10 hours/week

| Step | What to Build | Duration | Depends On |
|------|--------------|----------|------------|
| 1 | Project scaffold + test setup | 1 week | — |
| 2 | Address search + satellite | 1 week | Step 1 |
| 3 | Boundary drawing + validation | 1 week | Step 2 |
| 4 | Site analysis + deriveClimateType | 2 weeks | Step 2 |
| — | **Checkpoint 1** | — | — |
| 5 | Element catalog + placement | 2 weeks | Step 3 |
| 6 | Select / move / delete | 2 weeks | Step 5 |
| 7 | Zone generation | 2 weeks | Step 5 |
| — | **Checkpoint 2** | — | — |
| 8 | Advisor system | 2-3 weeks | Steps 4, 5, 7 |
| 9 | Action plan generator | 1 week | Step 5 |
| 10 | Save / load + JSON backup | 1-2 weeks | Step 6 |
| 11 | PNG export | 1 week | Step 6 |
| 12 | Wizard flow | 2 weeks | Steps 2, 3, 4, 7 |
| — | **Checkpoint 3** | — | — |

**Total: ~19-22 weeks (~5 months)**

---

### Step 1: Project Scaffold + Test Setup (Week 1)

**Build:**
- `npx sv create comfrey` with SvelteKit + TypeScript
- Install dependencies: mapbox-gl, @mapbox/mapbox-gl-draw, @turf/turf, suncalc, tailwindcss, idb
- Install dev dependencies: vitest, @testing-library/svelte, playwright
- Set up Tailwind, base layout, routing structure
- Create `types/index.ts` with all interfaces
- Create empty store files with class structure
- Configure Vitest for unit tests
- Configure Playwright for E2E tests

**Done when:**
- [ ] `npm run dev` shows a page at localhost
- [ ] Routes exist for `/`, `/new`, `/design/[id]`
- [ ] TypeScript interfaces compile without errors
- [ ] `npm run test` runs Vitest (0 tests, no errors)
- [ ] `npm run test:e2e` runs Playwright (0 tests, no errors)
- [ ] Tailwind classes render correctly

---

### Step 2: Address Search + Satellite (Week 2)

**Build:**
- `MapView.svelte` — initialize Mapbox GL with satellite style
- Address search input with Mapbox Geocoding autocomplete (debounced 300ms)
- Map flies to selected location on search
- Drop-a-pin fallback (click on map to set location)
- Error handling for geocoding failures
- WebGL detection with fallback error message

**Done when:**
- [ ] Search "Ho Chi Minh City" → map flies to HCMC with satellite imagery
- [ ] Search "Christchurch, New Zealand" → map flies to Christchurch
- [ ] Map supports pan, zoom, rotate
- [ ] Clicking on map drops a pin and sets location
- [ ] Invalid search shows inline error message
- [ ] Browser without WebGL shows clear error message

---

### Step 3: Boundary Drawing + Validation (Week 3)

**Build:**
- `BoundaryDraw.svelte` — integrate mapbox-gl-draw in polygon mode
- Calculate area with `@turf/area` on polygon completion
- `utils/validation.ts` — self-intersection detection, area bounds checking
- Store boundary as GeoJSON in project store
- Display area in sidebar with unit toggle (metric/imperial)

**Done when:**
- [ ] User can draw a polygon on the map
- [ ] Area displays in square meters and hectares
- [ ] Polygon vertices are editable after creation
- [ ] Self-intersecting polygon is rejected with error message
- [ ] Very small / very large properties show warning
- [ ] Boundary stored in project store as GeoJSON
- [ ] Unit tests pass for all validation rules

---

### Step 4: Site Analysis + deriveClimateType (Weeks 4-5)

**Build:**
- `services/climate.ts` — Open-Meteo API integration + `deriveClimateType()`
- `services/sun.ts` — SunCalc wrapper for annual sun path (solstices + equinox)
- `services/elevation.ts` — Mapbox Terrain RGB tile decoding
- `stores/analysis.svelte.ts` — AsyncState for loading/error/success
- `AnalysisSidebar.svelte` — display results with beginner-friendly labels
- `SunPathOverlay.svelte` — visualize sun arc on map
- Loading spinner during API calls
- Error handling for each API independently (partial failure)

**Done when:**
- [ ] Entering a tropical location (Vietnam) returns climate data and classifies as `tropical`
- [ ] Entering a temperate location (New Zealand) classifies as `temperate`
- [ ] Entering an arid location (Morocco) classifies as `arid`
- [ ] Sun path shows correct azimuth for both hemispheres
- [ ] Hemisphere correctly derived from latitude
- [ ] Elevation data shows min/max/slope for the area
- [ ] AnalysisSidebar renders beginner-friendly labels (not raw numbers)
- [ ] Loading state shows "Analyzing your site..." during API calls
- [ ] One API failing still shows data from the other APIs
- [ ] All API failures handled with user-friendly messages + retry button
- [ ] All 6 `deriveClimateType()` test cases pass
- [ ] Unit tests: 100% coverage on `deriveClimateType()`

**Learn:**
- Test with 3 real property locations you're evaluating
- Is the analysis data accurate? Cross-check with known sources
- Is it useful? Does it help you understand the property?
- Show to 1-2 other people — do they understand the summary?

---

### Checkpoint 1: Site Analysis Validation

**Pause and evaluate:**
- [ ] The analysis data is accurate for tropical (Vietnam) locations
- [ ] The analysis data is accurate for temperate (New Zealand) locations
- [ ] The analysis data is accurate for arid (Morocco) locations
- [ ] Hemisphere is correct for all test locations
- [ ] The beginner-friendly labels are understandable to a non-expert
- [ ] Loading and error states work smoothly
- [ ] You find it genuinely useful for evaluating properties

**If the analysis feels inaccurate or useless** → re-evaluate API choices or data presentation before continuing.

---

### Step 5: Element Catalog + Placement (Weeks 6-7)

**Build:**
- `catalog/elements.ts` — define 8 ElementTypes with SVG icons, metaSchema, and implementationPhase
- `ElementLibrary.svelte` — sidebar palette showing all element types with icons
- `ElementLayer.svelte` — render elements as GeoJSON symbols on map
- Click-to-place interaction (select element type → click map → create)
- Drag-from-library interaction with ghost preview
- Path element as polyline (click to add points, double-click to finish)
- Outside-boundary warning

**Done when:**
- [ ] All 8 element types appear in library with icons and names
- [ ] Clicking map in "place" mode creates an element at that location
- [ ] Dragging from library onto map creates an element at drop position
- [ ] Elements render at correct real-world scale on the map
- [ ] Path element draws as a polyline
- [ ] Element outside boundary shows warning
- [ ] Multiple elements of the same type can be placed

---

### Step 6: Select / Move / Delete (Weeks 8-9)

**Build:**
- Click-to-select: clicking an element on the map selects it
- Hybrid rendering: selected element becomes a Svelte Marker overlay
- Drag-to-move: drag the Marker to reposition
- Delete: Delete/Backspace key or button removes element
- `PropertiesPanel.svelte` — shows selected element details and meta fields
- `editor.svelte.ts` — manages selection state and active tool
- Escape key to deselect

**Done when:**
- [ ] Clicking an element selects it (blue outline highlight)
- [ ] Selected element can be dragged to a new position at 60fps
- [ ] Delete key or button removes the element
- [ ] PropertiesPanel shows element type, label, and meta fields
- [ ] Clicking empty space or pressing Escape deselects
- [ ] Moving element outside boundary shows warning

---

### Step 7: Zone Generation (Weeks 10-11)

**Build:**
- `services/zones.ts` — generate zone polygons from house position + boundary
- `ZoneLayer.svelte` — render zones as colored GeoJSON overlays with hatching patterns
- Zone editing: integrate with mapbox-gl-draw for vertex dragging
- `LayerPanel.svelte` — toggle zone visibility individually
- `catalog/zones.ts` — zone colors, descriptions, and hatching patterns
- Re-generation on house move with confirmation dialog

**Done when:**
- [ ] Placing a house generates Zone 0-4 polygons within the boundary
- [ ] Zone buffer distances match the scaling table for the property size
- [ ] Zones render as semi-transparent colored overlays with hatching
- [ ] Zone vertices are draggable to reshape
- [ ] Zones can be toggled on/off individually
- [ ] Zone shapes clip to property boundary
- [ ] Moving house prompts re-generation confirmation
- [ ] Zones don't overlap (each ring subtracted from the next)
- [ ] Unit tests pass for all 4 property size tiers

**Learn:**
- Design a property with zones. Do the default shapes make sense?
- Are the buffer distances appropriate for your candidate properties?
- Does the zone visualization help you understand the design, or is it visual clutter?

---

### Checkpoint 2: Core Editor Validation

**Pause and evaluate:**
- [ ] You can place a house, get zones, and add elements to design a property
- [ ] The editing flow feels natural (select, move, delete works smoothly at 60fps)
- [ ] You've designed at least one real candidate property end-to-end
- [ ] The design feels like a *plan*, not just dots on a map
- [ ] Elements outside boundary are clearly flagged
- [ ] Zone colors and hatching are distinguishable

**If the editor feels clunky or the design doesn't feel useful** → refine UX before adding the advisor layer.

---

### Step 8: Advisor System (Weeks 12-14)

**Build:**
- `catalog/tips.ts` — define 15 MVP tips with triggers, conditions, climate/hemisphere variants
- `services/advisor.ts` — tip matching engine (`processEvent`)
- `stores/advisor.svelte.ts` — manages tip queue and user state
- `AdvisorCard.svelte` — the Civ VI-style popup card with slide-in animation
- Wire up all element placement and zone creation events to the advisor via store methods
- Implement adaptive depth (track seenTips, show shortReminder on repeat)
- 500ms delay before showing card, 30s auto-dismiss
- Debounce processing by 200ms for rapid element changes

**Done when:**
- [ ] All 8 behavioral specifications (Section 5.7) pass as unit tests
- [ ] All 15 tips fire correctly for their triggers and conditions
- [ ] Climate filtering works (tropical tips hidden for temperate sites, and vice versa)
- [ ] Hemisphere filtering works (sun direction advice flips correctly)
- [ ] Dismissing a tip prevents it from showing again
- [ ] Seeing a tip a second time shows the short version
- [ ] Card UI is non-blocking (doesn't cover sidebar or map controls)
- [ ] Card slides in with animation, auto-dismisses after 30s
- [ ] Escape key dismisses the card
- [ ] Unit tests: 100% coverage on `processEvent()`

**Learn:**
- Do the tips feel helpful or annoying?
- Is the 500ms delay right? Too fast? Too slow?
- Are 15 tips enough to feel "guided" through a full design session?
- Does the adaptive depth (full → short) work naturally?

---

### Step 9: Action Plan Generator (Week 15)

**Build:**
- `services/action-plan.ts` — generate ActionPlan from Design state
- `ActionPlanPanel.svelte` — sidebar panel showing Year 1 / Year 2 / Year 3
- Wire up auto-regeneration on element add/move/delete
- Site-specific descriptions (reference actual element positions and zone assignments)

**Done when:**
- [ ] Adding elements produces a phased action plan in the sidebar
- [ ] Elements are correctly grouped by their implementationPhase
- [ ] Items sorted by zone then category priority
- [ ] Descriptions include position context ("on the north slope", "near the kitchen")
- [ ] Plan updates when elements change
- [ ] Empty design shows empty state message
- [ ] Unit tests pass for phasing and sorting logic

---

### Step 10: Save / Load + JSON Backup (Weeks 16-17)

**Build:**
- `services/storage.ts` — IndexedDB wrapper using `idb` library
- Auto-save with debounced `$effect` + visual "Saved"/"Saving..." indicator
- Dashboard page (`/`) listing all saved projects
- Load project from IndexedDB into stores
- Delete project with confirmation dialog
- JSON export (download as file)
- JSON import (upload from file)
- Error handling for storage failures
- Schema version migration

**Done when:**
- [ ] Closing and reopening the browser preserves the design
- [ ] Dashboard shows all saved projects with name, date, and area
- [ ] Clicking a project opens it in the editor with full state
- [ ] AdvisorState persists (dismissed tips stay dismissed)
- [ ] Delete shows confirmation → removes project
- [ ] "Download backup" exports valid JSON
- [ ] "Import project" loads a JSON backup correctly
- [ ] Storage failure shows banner with backup download option
- [ ] Projects from older schema versions auto-migrate

---

### Step 11: PNG Export (Week 18)

**Build:**
- `services/export.ts` — capture map canvas as image
- Export button in toolbar
- Include all visible layers (elements, zones, boundary, labels)
- Add legend overlay (zone colors + element icons)
- Include Mapbox attribution

**Done when:**
- [ ] "Export" button downloads a PNG of the current map view
- [ ] All visible layers appear in the export
- [ ] Resolution is 2x viewport
- [ ] Legend shows zone colors and element icons
- [ ] Filename includes project name
- [ ] Mapbox attribution included
- [ ] "Generating export..." spinner shown during capture

---

### Step 12: Wizard Flow (Weeks 19-20)

**Build:**
- `WizardShell.svelte` — step container with progress bar
- `StepLocation.svelte` — address search (reuses MapView + geocoding)
- `StepBoundary.svelte` — boundary drawing (reuses BoundaryDraw + validation)
- `StepAnalysis.svelte` — auto-fetch + display results (reuses AnalysisSidebar)
- `StepHouse.svelte` — place house + generate zones
- Transition from wizard to editor
- Wizard abandonment recovery (save partial state, prompt on return)

**Done when:**
- [ ] `/new` route shows the wizard with progress bar
- [ ] Steps flow linearly with "Next" / "Back"
- [ ] Each step validates (can't skip boundary, analysis must complete)
- [ ] Analysis step shows beginner-friendly summary + loading state
- [ ] Analysis step handles partial API failure gracefully
- [ ] House placement triggers zone generation
- [ ] Completing wizard opens `/design/[id]` with populated design
- [ ] Advisor tips fire at appropriate wizard steps
- [ ] Abandoning and returning offers "Continue" or "Start fresh"
- [ ] E2E test passes for full wizard flow

---

### Checkpoint 3: MVP Validation

**Pause and evaluate:**
- [ ] Complete end-to-end flow works: wizard → editor → save → export
- [ ] You've designed at least 2 properties with the tool (tropical + temperate)
- [ ] The advisor tips feel genuinely helpful and non-annoying
- [ ] The action plan feels like a real implementation roadmap
- [ ] Exported PNG looks like a real property plan (with legend)
- [ ] JSON backup/restore roundtrips correctly
- [ ] You would actually use this output to make decisions about land
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Tested in Chrome, Firefox, and Safari

**If yes** → MVP is done. Consider sharing with 2-3 people in permaculture communities.

**If the tool feels more like a toy than a planning tool** → identify what's missing (usually: the intelligence layer needs more/better tips, or the export needs more context).

---

## 12. Deferred Features (Post-MVP)

| Feature | Phase | Notes |
|---------|-------|-------|
| Undo/redo | 2 | Command pattern architecture is ready in stores/history.svelte.ts |
| Element resize/rotate | 2 | Most elements are fine at default size for MVP |
| 3D preview (Threlte) | 2 | Keep `components/scene/` folder ready |
| Sun/shadow simulation | 2 | SunCalc data is already available |
| Sector analysis overlay | 2 | Sun/wind/water directional wedges on map |
| Measure tool | 2 | Click two points to see distance |
| Water flow visualization | 3 | Requires terrain heightmap processing |
| Plant database | 3 | Climate-appropriate recommendations |
| Companion planting / guilds | 3 | Relationship engine between plant types |
| AI-powered suggestions | 3 | Context-aware design feedback using LLM |
| User accounts / cloud save | 4 | PostgreSQL + PostGIS backend |
| Collaboration / sharing | 4 | Share designs with others |
| PDF export with full report | 4 | Materials list, plant list, timeline, advisor tips received |
| Mobile-responsive viewer | 4 | View (not edit) designs on phone |
| Template library | 4 | Pre-made designs by climate and property size |
| Property comparison view | 4 | Side-by-side analysis of multiple properties |
| Multiple designs per project | 2 | Compare alternative layouts for same property |

---

## 13. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Scope overwhelm** | High | High | Stick to MVP steps ruthlessly. Each step independently useful. Checkpoints enforce validation. |
| **Burnout** | Medium | High | 5-10 hrs/week is sustainable. Dogfooding sustains motivation. |
| **Mapbox pricing change** | Low | High | Keep architecture MapLibre-compatible. Avoid Mapbox-specific APIs beyond GL JS. |
| **Nobody else cares** | Medium | Low | "Can't fail — I'll learn either way." |
| **Building canvas, not advisor** | Medium | High | Litmus test: "smarter or more drawable?" Action plan + advisor are MVP scope, not deferred. |
| **Tropical permaculture gaps** | Medium | Medium | Test tips against real Vietnam properties. Consult "Tropical Permaculture" by Graham Burnett. |
| **Architecture lock-in** | Medium | Medium | Architecture is a draft. Permission to throw away and rebuild. |
| **IndexedDB data loss** | Medium | Medium | JSON export/import feature for backup. Prompt users to export before browser clearing. |
| **Open-Meteo downtime** | Low | Medium | Partial failure handling. Cache previous results in IndexedDB for same location. |
| **Mapbox token abuse** | Low | Medium | Environment variable, not committed to repo. Domain restriction on Mapbox dashboard. |
| **Performance with many elements** | Low | Medium | 200-element cap. Hybrid rendering keeps DOM nodes minimal. |
| **deriveClimateType misclassification** | Medium | Low | Unit tests for edge cases. Manual override in analysis sidebar (dropdown to correct classification). |

---

## 14. Resolved Questions

| Question | Resolution |
|----------|-----------|
| Hemisphere handling | `Hemisphere` derived from latitude. All sun-related tips include `hemisphere` field. Equator-facing is north in southern hemisphere, south in northern. |
| Path element type | Polyline. User clicks to add points, double-clicks to finish. Width is fixed at 1m. |
| Zone generation algorithm | Turf.js buffer operations with property-size-scaled radii. Zones clipped to boundary. Zone 5 not auto-generated. |
| Advisor personality | Neutral for MVP. No avatar, no name. Clean card UI with headlines and explanations. Personality can be added later. |
| "Learn more" content | In-app expanded text within the advisor card. Not external links. Keeps the user in the tool. External resources deferred to a "Resources" page post-MVP. |
| Event/communication model | Direct function calls from store methods to `advisorService.processEvent()`. No event bus for MVP. |
| Action plan output | Auto-generated from design state. Each ElementType has an `implementationPhase`. Plan displayed in `ActionPlanPanel.svelte`. |

## 15. Open Questions (Remaining)

- [ ] Offline capability — Tauri for offline use? Impacts API caching strategy. Deferred to post-MVP.
- [ ] Element sizing for tropical — default sizes calibrated for temperate. Test with real tropical properties to validate.
- [ ] Zone buffer distances — scaling table is a starting estimate. Validate with real properties at each size tier.
- [ ] Climate type manual override — should user be able to correct misclassification? (Proposed: yes, dropdown in analysis sidebar)
- [ ] Advisor tip debounce timing — 200ms for rapid changes, 500ms display delay. Validate feel during Step 8.

# Architecture & Data Model Brainstorm

## 1. Data Model

### Entity Graph

```
Project (top-level container)
├── Land
│   ├── boundary: GeoJSON Polygon
│   ├── location: [lng, lat]
│   └── SiteAnalysis (auto-fetched)
│       ├── climate: { zone, avgTemp, rainfall, frostDates }
│       ├── sun: { azimuth, altitude, daylength by month }
│       ├── wind: { prevailing direction, speed }
│       ├── elevation: Float32Array (heightmap grid)
│       └── soil: { type, pH, drainage }
├── Design (user can have multiple per land)
│   ├── zones: Zone[] (permaculture zones 0-5, GeoJSON polygons)
│   ├── elements: Element[] (placed items)
│   └── layers: Layer[] (grouping: infrastructure, planting, water, paths)
└── metadata: { name, created, updated }
```

### Core Types

```typescript
// Everything on the map is GeoJSON-native — plays well with Mapbox
interface Element {
  id: string;
  typeId: string;           // references ElementType catalog
  geometry: GeoJSON.Point | GeoJSON.Polygon;  // position/shape on map
  properties: {
    rotation: number;       // degrees
    scale: number;          // multiplier (default 1)
    zone?: number;          // which permaculture zone (0-5)
    layer: string;          // 'infrastructure' | 'planting' | 'water' | 'paths'
    label?: string;         // user-given name
    meta: Record<string, unknown>;  // type-specific (species, capacity, dimensions)
  };
}

interface ElementType {
  id: string;
  name: string;
  category: 'structure' | 'plant' | 'water' | 'animal' | 'path' | 'utility';
  icon: string;             // SVG for 2D view
  defaultSize: { width: number; height: number };  // meters
  canRotate: boolean;
  canResize: boolean;
  metaSchema: Record<string, FieldDef>;  // defines what properties panel shows
}

interface Zone {
  id: string;
  level: 0 | 1 | 2 | 3 | 4 | 5;
  geometry: GeoJSON.Polygon;
  color: string;            // semi-transparent fill
}

interface Design {
  id: string;
  name: string;
  elements: Element[];
  zones: Zone[];
  layers: Layer[];
  camera: { center: [number, number]; zoom: number; bearing: number };
}

interface Project {
  id: string;
  name: string;
  land: {
    boundary: GeoJSON.Polygon;
    location: [number, number];
    area: number;           // sq meters, computed from boundary
  };
  analysis: SiteAnalysis | null;
  designs: Design[];
  createdAt: string;
  updatedAt: string;
}
```

### Key Design Decisions

- **GeoJSON everywhere** — no coordinate conversion needed, Mapbox eats it natively
- **Elements use `Point` for small items** (trees, tanks) and **`Polygon` for area items** (garden beds, buildings)
- **`ElementType` is a catalog/registry**, `Element` is an instance on the map — separation keeps the design data lean
- **Store as flat JSON** — IndexedDB for Phase 1, trivial to migrate to PostgreSQL + PostGIS for Phase 4

---

## 2. Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── map/
│   │   │   ├── MapView.svelte          # Mapbox GL wrapper
│   │   │   ├── BoundaryDraw.svelte     # Draw/edit land boundary
│   │   │   ├── ElementLayer.svelte     # Renders all placed elements
│   │   │   ├── ZoneLayer.svelte        # Renders zone overlays
│   │   │   └── SunPathOverlay.svelte   # Sun arc visualization
│   │   ├── editor/
│   │   │   ├── Toolbar.svelte          # Tool selection (select, place, draw, measure)
│   │   │   ├── ElementLibrary.svelte   # Draggable element palette
│   │   │   ├── PropertiesPanel.svelte  # Selected element properties
│   │   │   ├── LayerPanel.svelte       # Toggle layers visibility
│   │   │   └── AnalysisSidebar.svelte  # Site analysis summary
│   │   ├── wizard/
│   │   │   ├── WizardShell.svelte      # Step container + progress
│   │   │   ├── StepLocation.svelte     # Enter address / pin on map
│   │   │   ├── StepBoundary.svelte     # Draw property boundary
│   │   │   ├── StepAnalysis.svelte     # Auto-fetch + show results
│   │   │   └── StepHouse.svelte        # Place house → trigger zone suggestions
│   │   └── ui/                         # Generic UI components
│   ├── stores/
│   │   ├── project.svelte.ts           # Project & design state (Svelte 5 runes)
│   │   ├── editor.svelte.ts            # UI state: active tool, selection, mode
│   │   ├── history.svelte.ts           # Undo/redo command stack
│   │   └── analysis.svelte.ts          # Site analysis cache
│   ├── services/
│   │   ├── geocoding.ts                # Mapbox Geocoding
│   │   ├── climate.ts                  # Open-Meteo API
│   │   ├── elevation.ts                # Mapbox Terrain RGB
│   │   ├── sun.ts                      # SunCalc wrapper
│   │   ├── storage.ts                  # IndexedDB save/load
│   │   └── export.ts                   # Screenshot/PNG export
│   ├── catalog/
│   │   ├── elements.ts                 # ElementType definitions
│   │   ├── zones.ts                    # Zone presets + colors
│   │   └── icons/                      # SVG icons for elements
│   ├── types/
│   │   └── index.ts                    # All TypeScript interfaces
│   └── utils/
│       ├── geo.ts                      # Area calc, point-in-polygon, bearing
│       ├── units.ts                    # Meters ↔ feet, hectares ↔ acres
│       └── id.ts                       # nanoid wrapper
├── routes/
│   ├── +page.svelte                    # Dashboard: project list
│   ├── +layout.svelte                  # App shell
│   ├── new/
│   │   └── +page.svelte               # Wizard flow (create project)
│   └── design/
│       └── [id]/
│           └── +page.svelte            # Main editor (full-screen map + panels)
└── static/
    └── models/                         # Reserved for Phase 2 (3D assets)
```

### Why This Structure

- `components/map/` isolates Mapbox-specific code — when Phase 2 adds Threlte, the 3D view gets its own `components/scene/` folder without touching map code
- `catalog/` is separate from `stores/` — it's static reference data, not reactive state
- Wizard and editor are separate routes — wizard is linear, editor is spatial. Different UX paradigms
- Svelte 5 runes (`$state`, `$derived`) over legacy stores — better TypeScript support, finer reactivity

---

## 3. Core Interactions

### Boundary Drawing

Use `@mapbox/mapbox-gl-draw` — polygon draw/edit out of the box. On completion, extract GeoJSON polygon, calculate area with `@turf/area`, store in project.

### Element Placement — Hybrid Approach

| Approach | Pros | Cons |
|----------|------|------|
| GeoJSON source + layer | Fast, handles 1000s of elements, map-native | Hard to make interactive (custom click handlers) |
| Custom Mapbox `Marker` with Svelte component | Rich interactivity, Svelte-powered | DOM elements = slower with 100+ items |
| **Hybrid (recommended)** | Best of both | Slightly more complex |

**Hybrid approach:**
- Render all elements as a single GeoJSON layer (fast, map-integrated)
- When an element is **selected**, swap it to a Svelte `Marker` overlay with handles for move/resize/rotate
- Deselect → back to GeoJSON layer

This gives performance for many elements + rich editing for the active one.

### Interaction Model

```
Tools (toolbar modes):
├── Select    → click to select, drag to move
├── Place     → click on map to place selected element type
├── Draw      → draw polygon (for zones, garden beds, buildings)
├── Measure   → click two points to see distance
└── Pan/Zoom  → default map behavior (always available with right-click/scroll)
```

### Drag from Library

User drags an element type from the sidebar onto the map → `dragover` sets a ghost preview at cursor position → `drop` creates a new Element at that map coordinate. Use `map.unproject()` to convert screen pixels → lng/lat.

### Snapping

Skip for MVP. If needed later, snap to a 1m grid aligned to the boundary's bounding box.

---

## 4. API Integration Plan

```
User enters address
    │
    ▼
Mapbox Geocoding API ──→ [lng, lat]
    │
    ├──→ Mapbox Satellite Tiles ──→ base layer imagery
    │
    ├──→ Mapbox Terrain RGB ──→ elevation heightmap
    │        └── fetch tile at location, decode RGB → elevation
    │            formula: height = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
    │
    ├──→ Open-Meteo API ──→ climate data
    │        GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}
    │            &daily=temperature_2m_max,temperature_2m_min,precipitation_sum,
    │              wind_speed_10m_max,wind_direction_10m_dominant
    │            &timezone=auto&past_days=365
    │        └── Also: https://archive-api.open-meteo.com for historical averages
    │
    ├──→ SunCalc.js (client-side, no API) ──→ sun path
    │        └── getPosition(date, lat, lng) for any time
    │        └── getTimes(date, lat, lng) for sunrise/sunset/noon
    │        └── Loop through year → build annual sun path diagram
    │
    └──→ ISRIC SoilGrids API (optional, Phase 3) ──→ soil type
             GET https://rest.isric.org/soilgrids/v2.0/properties/query?lon={lng}&lat={lat}
```

### Combined Site Analysis

```typescript
async function analyzeSite(lng: number, lat: number): Promise<SiteAnalysis> {
  const [climate, elevation, sun] = await Promise.all([
    fetchClimate(lat, lng),       // Open-Meteo
    fetchElevation(lat, lng),     // Mapbox Terrain RGB
    computeSunPath(lat, lng),     // SunCalc (instant, client-side)
  ]);

  return {
    climate: {
      zone: deriveHardinessZone(climate.minTemp),
      avgRainfall: climate.annualPrecipitation,
      avgTemp: { summer: climate.summerAvg, winter: climate.winterAvg },
      frostFreeDays: climate.frostFreeDays,
    },
    sun: {
      summerSolstice: sun.june21,
      winterSolstice: sun.dec21,
      daylength: { longest: sun.maxDaylight, shortest: sun.minDaylight },
    },
    wind: {
      prevailing: climate.dominantWindDir,
      avgSpeed: climate.avgWindSpeed,
    },
    elevation: {
      min: elevation.min,
      max: elevation.max,
      slope: elevation.avgSlope,
      aspect: elevation.dominantAspect,
    },
  };
}
```

### Cost Notes

- Mapbox: 50k free geocoding requests/month, free satellite/terrain tiles with base plan
- Open-Meteo: completely free, no API key needed
- SunCalc: client-side JavaScript, no API calls
- **MVP has zero API costs beyond a free Mapbox token**

---

## 5. State Management

### Svelte 5 Runes Approach

```typescript
// stores/project.svelte.ts
class ProjectStore {
  current = $state<Project | null>(null);
  activeDesign = $derived(
    this.current?.designs.find(d => d.id === this.activeDesignId) ?? null
  );
  activeDesignId = $state<string | null>(null);

  addElement(element: Element) {
    if (!this.activeDesign) return;
    history.execute({
      execute: () => this.activeDesign!.elements.push(element),
      undo: () => {
        const idx = this.activeDesign!.elements.findIndex(e => e.id === element.id);
        if (idx !== -1) this.activeDesign!.elements.splice(idx, 1);
      },
      description: `Place ${element.typeId}`,
    });
  }

  moveElement(id: string, newPosition: GeoJSON.Position) { /* similar pattern */ }
  removeElement(id: string) { /* similar pattern */ }
}

export const project = new ProjectStore();
```

### Undo/Redo — Command Pattern

```typescript
// stores/history.svelte.ts
interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

class HistoryStore {
  undoStack = $state<Command[]>([]);
  redoStack = $state<Command[]>([]);
  canUndo = $derived(this.undoStack.length > 0);
  canRedo = $derived(this.redoStack.length > 0);

  execute(cmd: Command) {
    cmd.execute();
    this.undoStack.push(cmd);
    this.redoStack = [];  // clear redo on new action
  }

  undo() {
    const cmd = this.undoStack.pop();
    if (!cmd) return;
    cmd.undo();
    this.redoStack.push(cmd);
  }

  redo() {
    const cmd = this.redoStack.pop();
    if (!cmd) return;
    cmd.execute();
    this.undoStack.push(cmd);
  }
}

export const history = new HistoryStore();
```

**Why command pattern over snapshots:** Design state includes GeoJSON geometries, potentially many elements. Full state snapshots would eat memory fast. Commands are lightweight — they only store the delta.

### Editor State (separate from project data)

```typescript
// stores/editor.svelte.ts
class EditorStore {
  tool = $state<'select' | 'place' | 'draw' | 'measure'>('select');
  selectedElementId = $state<string | null>(null);
  placingType = $state<string | null>(null);  // ElementType id being placed
  showLayers = $state({ zones: true, elements: true, sunPath: false, grid: false });
  sidebarPanel = $state<'library' | 'properties' | 'analysis' | 'layers'>('library');
}

export const editor = new EditorStore();
```

### Auto-Save

Debounced save to IndexedDB on every state change:

```typescript
// In the main editor page component
$effect(() => {
  const data = $state.snapshot(project.current);
  debouncedSave(data, 1000);  // save after 1s of no changes
});
```

---

## 6. MVP Scope

### Include

| Feature | Effort | Why it's MVP |
|---------|--------|-------------|
| Address → satellite view | Small | Entry point, instant "wow" moment |
| Draw boundary polygon | Small | Defines the property, everything depends on it |
| Auto site analysis (sun + climate) | Medium | Key differentiator — user learns something immediately |
| Guided house placement step | Medium | First wizard step, anchors the whole design |
| Zone overlay suggestions | Medium | The permaculture magic — auto-suggests zones after house placement |
| 8 element types to drag-and-drop | Medium | House, garden bed, fruit tree, water tank, chicken coop, compost, shed, path |
| Select/move/delete elements | Medium | Basic editing |
| Save to IndexedDB + reload | Small | Don't lose work |
| Export as PNG | Small | Shareable output |

### Defer

| Feature | Why defer |
|---------|-----------|
| Undo/redo | Nice but not blocking — test if people even want to iterate on designs |
| Element resize/rotate | Most elements are fine at default size initially |
| 3D anything | Phase 2 |
| User accounts | Local-first is fine for testing |
| Smart suggestions | Too much scope — zone suggestions after house placement is enough |
| Plant database | Build it when you know what people actually want to plant |
| Measure tool | Users can eyeball distances on satellite imagery |
| Mobile | Test on desktop first |

### MVP Element Catalog (8 items)

| Element | Category | Default Size (meters) |
|---------|----------|----------------------|
| House | structure | 12 x 10 |
| Shed | structure | 4 x 3 |
| Garden bed | plant | 3 x 1.2 |
| Fruit tree | plant | 4 x 4 |
| Water tank | water | 2.5 x 2.5 |
| Chicken coop | animal | 3 x 2 |
| Compost | utility | 1.5 x 1.5 |
| Path | path | 1 x 1 |

---

## 7. Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Route: /design/[id]                                    │
│  ┌──────────────┬──────────────────────────────────────┐ │
│  │  Sidebar     │  MapView (Mapbox GL)                 │ │
│  │  ┌────────┐  │  ┌────────────────────────────────┐  │ │
│  │  │Element │  │  │  Satellite Tiles                │  │ │
│  │  │Library │  │  │  ┌──────────────────────────┐   │  │ │
│  │  │        │  │  │  │  ZoneLayer (GeoJSON)     │   │  │ │
│  │  │        │──│──│──│  ┌──────────────────┐   │   │  │ │
│  │  │        │  │  │  │  │  ElementLayer     │   │   │  │ │
│  │  │        │  │  │  │  │  (GeoJSON + active│   │   │  │ │
│  │  │        │  │  │  │  │   Marker overlay) │   │   │  │ │
│  │  └────────┘  │  │  │  └──────────────────┘   │   │  │ │
│  │  ┌────────┐  │  │  │  SunPathOverlay          │   │  │ │
│  │  │Props   │  │  │  └──────────────────────────┘   │  │ │
│  │  │Panel   │  │  └────────────────────────────────┘  │ │
│  │  └────────┘  │  ┌────────────────────────────────┐  │ │
│  │  ┌────────┐  │  │  Toolbar (select|place|draw)   │  │ │
│  │  │Analysis│  │  └────────────────────────────────┘  │ │
│  │  │Summary │  │                                      │ │
│  │  └────────┘  │                                      │ │
│  └──────────────┴──────────────────────────────────────┘ │
│                                                          │
│  Stores: project ←→ history ←→ editor ←→ analysis       │
│  Services: geocoding | climate | elevation | sun | storage│
└─────────────────────────────────────────────────────────┘
```

---

## 8. Implementation Order

1. Scaffold SvelteKit project + Mapbox basic map rendering
2. Address search → center map on location with satellite tiles
3. Boundary draw with mapbox-gl-draw → store GeoJSON
4. Site analysis service → fetch climate + compute sun path → display in sidebar
5. Element catalog + GeoJSON layer → click to place elements on map
6. Select/move/delete with the hybrid Marker approach
7. Zone overlay → auto-generate from house position
8. IndexedDB persistence → save/load
9. PNG export → `map.getCanvas().toDataURL()`
10. Wizard flow wrapping steps 2-4 + house placement

Each step is testable independently. Step 4 alone could be shown to permaculture people for early feedback on whether the site analysis data is valuable.

---

## Open Questions

- Hybrid element rendering approach (GeoJSON layer + active Marker overlay) — validate with prototype
- Svelte 5 runes class pattern vs. traditional stores — team preference
- Zone auto-generation algorithm — concentric rings? Voronoi? Manual with suggestions?
- Offline-first (Tauri) vs. web-first — impacts storage and API caching strategy

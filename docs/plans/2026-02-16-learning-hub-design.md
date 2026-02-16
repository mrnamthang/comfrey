# Learning Hub Design

## Summary

A context-aware learning hub integrated into the design editor as a slide-over panel. Provides guided permaculture lessons, plant knowledge, and tool tutorials with progress tracking. Content surfaces contextually based on the user's active tool and site characteristics.

## Panel Behavior

The Learn Panel slides in from the right edge, overlaying the map. Four states:

- **Closed** — Hidden. A "Learn" button in the editor toolbar opens it.
- **Minimized** — 48px strip pinned to the right edge with "Learning Hub" label + expand button.
- **Open** — 420px wide panel with lesson content, header with minimize/close buttons.
- **Maximized** — ~80% viewport width for deep reading, header with restore/close buttons.

Panel has a drop shadow and floats over the map. Map remains interactive beside/behind it.

## Content Structure

### 3 Categories, ~14 Lessons

**Permaculture Principles (Theory)**
1. Ethics — Earth Care, People Care, Fair Share
2. The 12 Principles — Observe & Interact, Catch & Store Energy, etc.
3. Zone Theory — What zones 0-5 mean and how to use them
4. Sector Analysis — Understanding sun, wind, water, fire sectors
5. Succession & Stacking — Temporal and spatial layering

**Plant & Species Guides (Reference)**
6. Climate-matched planting — What grows in your climate type
7. Companion planting basics — Why companions matter, the 3 sisters, guilds
8. Fruit tree guilds — Building productive polycultures
9. Soil building plants — Nitrogen fixers, dynamic accumulators, ground covers

**Using Comfrey (Tool Tutorials)**
10. Site setup — How to set location, draw boundary, run analysis
11. Reading your analysis — Understanding climate data, sun paths, elevation
12. Placing & organizing elements — Using the element library, zones, drag/rotate
13. Water flow & terrain — Interpreting the D8 water flow overlay
14. Design review — Using the AI advisor and tip system

### Lesson Structure

Each lesson contains:
- `id` — Unique identifier
- `category` — One of: `principles`, `plants`, `tutorials`
- `title` — Lesson name
- `summary` — 1-2 sentence description (shown in list view)
- `readingTime` — Estimated minutes (e.g. "3 min")
- `body` — Markdown content with headings, bullets, inline tips
- `relevance` — `{ tools: string[], climates: string[] }` for context scoring
- `tryItAction` — Optional editor action (e.g. switch to a specific overlay)

## Context-Awareness

Lessons are ranked by two signals:

1. **Active tool/panel** — Lessons tagged with matching tools are promoted:
   - Sector overlay active → "Sector Analysis" lesson
   - Plants tab open → "Climate-matched planting", "Companion planting"
   - Analysis panel → "Reading your analysis"

2. **Site analysis data** — Lessons tagged with matching climate/conditions:
   - Arid site → water conservation, drought-tolerant planting
   - Tropical site → succession planting, canopy layering
   - Steep terrain → contour planting, erosion control

A scoring function ranks lessons. The panel shows "Suggested for you" at the top, followed by the full categorized list.

## Progress Tracking

- Per-user (shared across all projects) — permaculture knowledge is universal
- Stored in IndexedDB in a `learning-progress` object store
- Simple `Set<string>` of completed lesson IDs
- Lessons show completion checkmarks in the list
- Category headers show progress (e.g. "3/5 completed")

## Technical Approach

### New Files
- `src/lib/catalog/lessons.ts` — Lesson content catalog (~14 lessons)
- `src/lib/components/editor/LearnPanel.svelte` — Slide-over panel component
- `src/lib/components/editor/LessonView.svelte` — Single lesson renderer (markdown)
- `src/lib/stores/learning.svelte.ts` — Progress tracking store

### Modified Files
- `src/routes/design/[id]/+page.svelte` — Add Learn button to toolbar, mount LearnPanel
- `src/lib/services/storage.ts` — Add learning progress CRUD to IndexedDB
- `src/lib/stores/editor.svelte.ts` — Add `learnPanelState` (closed/minimized/open/maximized)

### No New Dependencies
- Markdown rendering via simple HTML (no markdown parser needed — content is authored as HTML strings or structured objects)
- All content bundled statically

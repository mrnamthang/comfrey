# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Comfrey?

Comfrey is a **guided land design tool** that acts as a permaculture advisor. It analyzes a site (sun, wind, climate, terrain), recommends where to place structures and plantings, and teaches permaculture principles. It produces: a visual site plan, a phased action plan, and site understanding. The litmus test for features: **"Does this make the tool smarter, or just more drawable?"** — prioritize intelligence over canvas features.

## Commands

```bash
npm run dev          # Start dev server on port 5174 (accessible via comfrey.local)
npm run build        # Production build
npm run preview      # Preview production build on port 4173
npm run check        # Type-check with svelte-check
npm run test         # Run unit tests (vitest)
npm run test:watch   # Run unit tests in watch mode
npm run test:e2e     # Run Playwright e2e tests (builds first)
```

## Tech Stack

- **SvelteKit** with Svelte 5 runes (`$state`, `$derived`, `$effect`)
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin, imported as `@import 'tailwindcss'` in app.css)
- **Mapbox GL JS** for satellite map with `@mapbox/mapbox-gl-draw` for boundary drawing
- **@turf/turf** for geospatial calculations (area, buffers, point-in-polygon)
- **SunCalc** for client-side sun position calculations
- **Open-Meteo API** for climate data (free, no API key)
- **IndexedDB** via `idb` for client-side project persistence (no backend)
- **TypeScript** with strict mode

## Environment

Requires `PUBLIC_MAPBOX_TOKEN` in `.env` (see `.env.example`).

## Architecture

### Routes

- `/` — Dashboard: lists saved projects from IndexedDB, import/export JSON
- `/new` — New project wizard (4-step guided flow)
- `/design/[id]` — Design editor with map canvas and sidebar panels

### Flow: Wizard → Editor

The `/new` wizard walks through 4 steps: **Location** (geocoding + map pin) → **Boundary** (draw polygon with mapbox-gl-draw) → **Analysis** (fetches climate/sun/elevation data) → **House** (place house marker). On finish, it creates a `Project` in the project store, generates permaculture zones around the house, saves to IndexedDB, and navigates to `/design/[id]`.

### Stores (`src/lib/stores/`) — Svelte 5 rune classes

All stores are class-based singletons using `$state` and `$derived`:

- **`project.svelte.ts`** — Current project + active design. Mutates elements/zones via immutable array updates. Central data authority.
- **`editor.svelte.ts`** — UI state: active tool (`select`/`place`/`draw`), selected element, sidebar panel, layer visibility.
- **`analysis.svelte.ts`** — Orchestrates site analysis by calling climate, sun, and elevation services via `Promise.allSettled`. Climate is required; elevation is optional.
- **`advisor.svelte.ts`** — Tip queue with priority sorting, dismiss/apply/seen tracking.

### Services (`src/lib/services/`)

- **`advisor.ts`** — Tip matching engine: processes `DesignEvent`s against the tip catalog, filtering by trigger type, climate, hemisphere, and spatial conditions (proximity, elevation, sun exposure).
- **`climate.ts`** — Fetches from Open-Meteo API, derives climate type (tropical/subtropical/temperate/arid).
- **`sun.ts`** — Computes sun positions at solstices and equinox using SunCalc.
- **`elevation.ts`** — Fetches elevation data, computes slope/aspect.
- **`zones.ts`** — Generates concentric permaculture zones (0-5) around the house position.
- **`action-plan.ts`** — Generates phased implementation plan from placed elements.
- **`storage.ts`** — IndexedDB CRUD via `idb` library.
- **`export.ts`** — PNG export from map canvas.
- **`geocoding.ts`** — Address search via Mapbox Geocoding API.

### Catalog (`src/lib/catalog/`)

Static data defining available element types, advisor tips, and zone descriptions. The element catalog defines each placeable item's category, icon, default size, implementation phase, and metadata schema.

### Types (`src/lib/types/index.ts`)

Single file with all TypeScript interfaces. Key types: `Project` (top-level), `Design` (elements + zones + layers), `Element` (placed item with geometry), `SiteAnalysis` (climate/sun/wind/elevation), `AdvisorTip` (with trigger/condition/action system).

### Design Editor (`/design/[id]`)

The editor page auto-loads the project from IndexedDB and auto-saves on changes (debounced 1s). The sidebar switches between panels: Element Library, Properties, Analysis, Action Plan, Advisor. The map supports click-to-place elements and drag-to-move selected elements via Mapbox markers.

### Advisor System

Event-driven: design actions (element placed/moved, zone created, etc.) are processed through a tip matching pipeline. Tips are filtered by trigger type → climate → hemisphere → spatial conditions, sorted by priority, and queued for display. Tips can have actions like "move element uphill" or "rotate to face sun".

## Testing

- **Unit tests** in `src/tests/unit/` — run with vitest, jsdom environment
- **E2E tests** in `src/tests/e2e/` — run with Playwright (builds the app first)
- Test config excludes e2e from vitest; Playwright has its own config

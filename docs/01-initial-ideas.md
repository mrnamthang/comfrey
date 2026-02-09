# Land Design Tool — Initial Ideas

## Context

I'm building a guided land design tool for people who buy bare land and have no idea where to start. Think "Canva meets permaculture design" — the user doesn't need to know permaculture principles. The tool walks them through designing their property step by step with smart suggestions based on their location, climate, terrain, and goals.

## The Problem

- People buy bare land and face overwhelming decisions: house placement, orientation, water management, planting zones, access roads, etc.
- Existing tools are either too complex (QGIS, SketchUp) or too generic (garden planners that ignore whole-property design)
- No tool offers a guided, opinionated, beginner-friendly experience that applies permaculture/land design principles automatically
- People currently stitch together 4-5 tools (Google Earth + SketchUp + spreadsheets + plant databases) to do what one app should do

## Core User Flow

1. **Input land details** — location (address/pin on map), boundary (draw or upload), size, existing features (trees, rocks, water sources, slopes)
2. **Auto-analyze** — fetch sun path, prevailing wind, rainfall, climate zone, elevation/terrain, soil type from public APIs
3. **Guided zoning** — walk user through permaculture zones (0-5) with drag-and-drop. "Where's your house?" → auto-suggest kitchen garden nearby, orchard further out, water catchment uphill, etc.
4. **Element library** — drag-and-drop: trees, garden beds, water tanks, chicken coops, compost, swales, paths, fences, sheds, ponds onto the map
5. **Smart suggestions** — contextual tips like "Fruit trees get more sun on the north side in your hemisphere" or "Place water tank uphill from garden for gravity feed"
6. **3D preview** — toggle from 2D planning view to 3D interactive view with real sun/shadow simulation
7. **Export** — PDF/image of design with plant lists, materials, phased implementation timeline

## Tech Stack (decided)

- **SvelteKit** — frontend framework
- **Threlte** — Three.js wrapper for Svelte (3D rendering)
- **Mapbox GL JS** — 2D satellite base layer and geocoding
- **Mapbox Terrain RGB** or **OpenTopography API** — elevation data for 3D terrain mesh
- **SunCalc.js** — sun position/path calculations
- **Open-Meteo API** — climate and weather data (free, no key)
- **Tauri** — potential desktop app later (offline capability)

## Phased Development Plan

### Phase 1: 2D MVP
- Mapbox satellite view with land boundary drawing
- Auto-fetch location data (sun path, climate, elevation)
- Basic element library (10-15 items) as 2D icons on map
- Guided wizard for house placement → zone suggestions
- Save/load designs
- Export as image

### Phase 2: 3D Preview
- Three.js terrain from elevation data
- Toggle between 2D planning and 3D preview
- 3D models for placed elements (low-poly trees, buildings, etc.)
- Animated sun path with real-time shadow casting
- Orbit/pan/zoom camera controls

### Phase 3: Smart Features
- Water flow visualization on terrain
- AI-powered suggestions based on design context
- Plant database with climate-appropriate recommendations
- Companion planting / guild suggestions
- Phased implementation timeline generator

### Phase 4: SaaS & Polish
- User accounts, save to cloud
- Freemium model (1 free design, pay for more)
- Collaboration / sharing
- PDF export with full design report
- Mobile-responsive viewer

## Constraints

- Start with Phase 1 (2D) — don't over-engineer for 3D yet but keep architecture flexible
- Performance is critical — will have map rendering + many interactive elements
- Target audience is non-technical — UX must be dead simple
- Keep it lean — solo developer, need to validate before going deep

## My Background

- 8 years full-stack dev (Laravel, Vue, SvelteKit, Tailwind)
- Currently building a Tauri desktop app (Flow) with SvelteKit + Rust
- Interested in permaculture, gardening, and minimalist design
- Based in Vietnam (relevant for testing with tropical climate data)

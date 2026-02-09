# Brainstorm Decisions

*Resolved tensions and design decisions from the brainstorming session.*

---

## Decision 1: MVP Scope — Design Tool First

**Question**: Should the MVP be a property comparison tool or a design tool?

**Decision**: Design tool first. Even when shopping for land, the user wants the full design experience applied to candidate properties one at a time. Comparison features can come later.

---

## Decision 2: Advisor System — Civ VI Style

**Question**: How should the "advisor" identity manifest in the UI?

**Decision**: Inspired by Civilization VI's advisor system — **non-blocking, contextual advisor cards** that pop up when relevant events happen.

### How It Works

1. User performs an action (places an element, draws a zone, etc.)
2. The system checks if any tips match the current context
3. An advisor card slides in from the corner with:
   - A short headline ("Water flows downhill")
   - A 2-3 sentence explanation with site-specific data
   - Action buttons: [Apply suggestion] [Dismiss] [Learn more]
4. Tips adapt over time — full explanation first time, short reminder on repeat

### Architecture Implication

The data model needs a **tip/recommendation system**:

```typescript
interface AdvisorTip {
  id: string;
  trigger: TipTrigger;          // what event activates this tip
  condition?: TipCondition;     // optional: only show if condition met
  climate?: 'tropical' | 'temperate' | 'arid' | 'all';
  headline: string;             // "Water flows downhill"
  explanation: string;          // 2-3 sentence explanation
  learnMore?: string;           // expanded mini-lesson (shown on demand)
  action?: TipAction;           // optional: "Move it for me" auto-action
  priority: number;             // higher = shown first if multiple tips fire
}

type TipTrigger =
  | { type: 'element_placed'; elementType: string }
  | { type: 'element_near'; elementA: string; elementB: string; distance: number }
  | { type: 'zone_created'; zoneLevel: number }
  | { type: 'analysis_complete' }
  | { type: 'design_review' };

type TipCondition =
  | { type: 'elevation_diff'; elementA: string; elementB: string; direction: 'uphill' | 'downhill' }
  | { type: 'sun_exposure'; position: 'sunny' | 'shaded' }
  | { type: 'climate_zone'; zone: string }
  | { type: 'wind_exposure'; exposed: boolean };

interface TipAction {
  label: string;                // "Move it for me"
  execute: () => void;          // auto-applies the suggestion
}
```

### User State Tracking

```typescript
interface AdvisorState {
  dismissedTips: Set<string>;   // tips the user has seen and dismissed
  appliedTips: Set<string>;     // tips the user accepted
  level: 'beginner' | 'intermediate' | 'advanced';  // adapts detail level
}
```

### MVP Scope

Start with **10-15 static tips** covering the most common scenarios:
- House orientation relative to sun
- Water tank placement (elevation)
- Garden beds in Zone 1
- Windbreak positioning
- Compost near kitchen/garden
- Chicken coop near compost
- Path from house to high-frequency areas
- Fruit trees on sunny aspect
- Shade considerations (tropical)
- Monsoon drainage (tropical)

No AI needed. Just well-written, climate-aware, context-triggered content.

---

## Decision 3: Teaching Depth — Adaptive

**Question**: How detailed should tip explanations be?

**Decision**: Adaptive — starts with full explanation, shortens as user gains experience.

### Implementation (Simple)

- First time a tip fires: show headline + full explanation + "learn more" link
- User dismisses → recorded in `dismissedTips`
- Next time same tip triggers: show headline only, with "remind me" to expand
- No complex algorithm — just track what's been seen

---

## Decision 4: Climate-Aware from Day 1

**Question**: Should permaculture advice adapt to tropical vs temperate climates?

**Decision**: Yes. The advisor tip system includes a `climate` field. Site analysis already determines climate zone, so tips can branch on it.

### Examples

| Tip | Temperate Version | Tropical Version |
|-----|-------------------|------------------|
| Sun orientation | "Face living areas north (southern hemisphere) for maximum winter sun" | "Orient living areas to catch morning sun but provide afternoon shade" |
| Wind | "Plant a windbreak on the prevailing wind side to protect from cold winds" | "Use wind corridors to cool living areas naturally" |
| Water | "Position water storage above gardens for gravity irrigation during dry months" | "Design drainage swales to manage monsoon runoff and recharge groundwater" |
| Frost | "Your area has 120 frost-free days — plan your growing season accordingly" | *(not shown — irrelevant in tropics)* |

### Data Source

Climate classification derived from site analysis:
- Open-Meteo provides temperature ranges and rainfall patterns
- `deriveClimateType()` function categorizes as tropical/subtropical/temperate/arid
- Tips filter based on this classification

---

## Decision 5: Zone Generation — Manual with Smart Defaults

**Question**: How should zone suggestions work after house placement?

**Decision**: Pre-generate reasonable zone shapes, let the user drag and reshape them.

### How It Works

1. User places house → system generates default zone polygons
2. Zones are **editable polygons**, not locked shapes
3. Generation logic (simple):
   - Zone 0: the house footprint itself
   - Zone 1: a buffer around the house (configurable, default ~10-15m radius)
   - Zone 2: extends from Zone 1 toward sunny aspects of the property
   - Zone 3: fills most of the remaining boundary area
   - Zone 4: edges/margins of the property
   - Zone 5: any remaining area (corners, steep slopes, riparian zones)
4. Advisor tip fires: "We've suggested zones based on distance from your house. In permaculture, Zone 1 is what you visit daily — herbs, salad greens, the clothesline..."

### Why Manual with Defaults

- No complex algorithm to debug
- User stays in control (important for learning)
- The advisor explains WHY the defaults are what they are
- Easy to implement: generate polygons from buffer/offset operations on the boundary

---

## Updated Architecture Additions

Based on these decisions, doc 02's architecture needs these additions:

### New Components
- `components/advisor/AdvisorCard.svelte` — the popup card UI
- `components/advisor/AdvisorPanel.svelte` — optional sidebar panel showing all available tips

### New Store
- `stores/advisor.svelte.ts` — manages tip state, dismissed/seen tracking

### New Catalog
- `catalog/tips.ts` — all advisor tips with triggers, conditions, and climate variants

### Updated Services
- `services/climate.ts` — add `deriveClimateType()` function

---

## What This Changes About the MVP

The MVP scope from doc 02 stays the same, with one addition:

| Feature | Effort | Why it's MVP |
|---------|--------|-------------|
| **Advisor tip system** | Medium | This IS the product differentiator. Without it, Comfrey is just another map drawing tool. |

The 10 implementation steps get a new step inserted:

**Step 7.5**: Advisor tip system — implement the card UI + 10-15 static tips triggered by element placement and zone creation.

---

## Open Questions (Remaining)

- Exact zone buffer distances — needs testing with real properties
- How many tips are enough for MVP? (Proposed: 10-15)
- Should the advisor have a character/personality? (e.g. a name, an avatar, a tone of voice)
- "Learn more" content — where does it link? In-app mini-lessons? External permaculture resources?

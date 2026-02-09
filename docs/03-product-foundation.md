# Product Foundation — Comfrey

*Answers to the strategic questions raised by the business panel analysis.*

---

## 1. Who Is This For?

### Primary User (You)

A **beginner-level permaculture enthusiast** who is shopping for (or has just bought) bare land in the **small to large range (up to ~10 hectares)**. Doesn't know permaculture principles deeply but is motivated to learn. Wants guidance on what to do with the land — not just a blank canvas to draw on.

### User Persona

> **Thang** is a developer based in Vietnam, actively looking to buy land. He's watched YouTube videos about permaculture (Geoff Lawton, Morag Gamble, Happen Films) and read introductory material, but doesn't know how to translate principles into a real design for a specific piece of land. He's overwhelmed by the number of decisions: Where should the house face? Where does water flow? What grows in this climate? He's currently stitching together Google Earth, YouTube advice, and mental notes. He wants one tool that analyzes his site, recommends a starting layout, teaches him *why*, and lets him refine it over time.

### Secondary Users (Later)

- People who already have land and want to add food production
- Permaculture students who want to practice design on real site data
- Dreamers evaluating properties before purchasing

---

## 2. Product Identity

### What Comfrey Is

**A permaculture advisor that produces a visual plan and teaches you along the way.**

It is NOT primarily a design canvas. The intelligence — site analysis, zone recommendations, contextual tips, climate-aware suggestions — is the core value. The map canvas is the *interface* for that intelligence, not the product itself.

### The Experience

1. **Advisor**: Input your land → it analyzes sun, wind, climate, slope → it *recommends* where things should go
2. **Teacher**: For each recommendation, it explains *why* — "Water tank placed uphill enables gravity-fed irrigation"
3. **Canvas**: You can accept, modify, or override any recommendation. You're in control, but you're guided.

### Core Outputs (All Three Matter Equally)

| Output | Description |
|--------|-------------|
| **Visual site plan** | A beautiful, printable map showing where everything goes |
| **Action plan** | Phased implementation: Year 1 → Year 2 → Year 3 |
| **Understanding** | Knowledge of your land's sun, water, wind, soil — the "why" behind every decision |

---

## 3. How Will People Find It?

### Primary Discovery Channel

**Search intent**: People will Google "permaculture design software", "land planning tool", "property design app", "where to put house on property."

### Content Strategy (When Ready)

- YouTube: "I designed my property using permaculture principles" (build-in-public content)
- Blog posts targeting search queries: "How to plan a 1-acre homestead", "Sun path analysis for property design"
- Share in communities: r/permaculture, permies.com, Facebook permaculture groups

### Timing

No rush to launch publicly. Build it, use it yourself, share when the MVP is solid and you've personally validated the flow.

---

## 4. What Brings People Back?

### Primary Retention Drivers

1. **Learning more** — Unlocking deeper permaculture concepts as you progress (water management, food forests, guilds, succession planting)
2. **Tracking progress** — Checking off what you've built, logging what's growing, seeing your land evolve from plan to reality

### Implication for Product

The tool should have a **progression system** — not gamification, but a natural deepening. First visit: site analysis + house placement + zones. Later visits: water systems, planting guilds, seasonal calendars. This also maps well to the phased development plan (ship simple, deepen over time).

---

## 5. Monetization

### Model: Free Core + Paid Add-Ons

| Tier | What's Included | Price |
|------|-----------------|-------|
| **Free** | 1 property design, site analysis, zone suggestions, basic element library, PNG export | $0 |
| **Pro** | Multiple designs, detailed PDF report, full plant database, advanced analysis (soil, water flow), progress tracking | ~$5-10/month or one-time ~$30-50 (TBD) |
| **Add-ons** | AI-powered suggestions, companion planting engine, professional PDF export with materials list | Pay per feature |

### What's NOT Part of the Model

- **No ads.** Ads cheapen a design tool and conflict with the learning-focused experience.
- **No aggressive upselling.** The free tier should be genuinely useful, not a crippled demo.

### Revenue Is Not the Goal (Yet)

Primary goal for first 6 months: **use it yourself.** Revenue model only matters once the tool is validated with real usage. Don't over-engineer monetization before then.

### Open Source Position

**Open core.** The core tool can be open source (builds community trust, aligns with permaculture ethics of sharing). Premium features and hosted services can be closed/paid. Decision can be made later — don't commit now.

---

## 6. Defensibility (Moat)

### What Makes Comfrey Hard to Copy?

| Moat Type | How Comfrey Builds It | Timeline |
|-----------|----------------------|----------|
| **Permaculture knowledge engine** | Zone logic, contextual tips, climate-aware recommendations — encoding expert knowledge into software | Phase 1-3 |
| **Template library** | Pre-made designs by climate zone and property size (start with your own designs) | Phase 2+ |
| **Community designs** | If shared, user-created designs become a library others can learn from | Phase 4+ |
| **Progress/outcome data** | Over time, "designs that actually worked" becomes proprietary insight | Long-term |

### Honest Assessment

In the early stages, there is no moat — and that's fine. You're building for yourself. The moat emerges from accumulated knowledge encoding and (eventually) community contributions. Don't optimize for defensibility now; optimize for usefulness.

---

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Scope overwhelm** | High | High | Stick to MVP scope ruthlessly. Each phase must be independently useful. |
| **Burnout / lost motivation** | Medium | High | 5-10 hrs/week is sustainable. Use it yourself — personal utility sustains motivation. |
| **Mapbox pricing change** | Low | High | MapLibre GL JS is the open-source fork. Keep architecture Mapbox-agnostic where possible. |
| **Nobody else cares** | Medium | Low | You said "can't fail — I'll learn either way." This is the right mindset. |
| **Architecture lock-in** | Medium | Medium | Label architecture doc as draft. Give yourself permission to throw it away if user testing suggests a different shape. |
| **Building a canvas, not an advisor** | Medium | High | Before each feature, ask: "Does this make the tool smarter, or just more drawable?" Prioritize intelligence. |

---

## 8. Learning Plan (Interleaved with Implementation)

| Step | Build | Learn |
|------|-------|-------|
| 1-3 | Scaffold + Mapbox + boundary drawing | Use it to draw boundaries on 3 properties you're considering buying |
| 4 | Site analysis (sun + climate + elevation) | **Validation checkpoint**: Is the analysis data accurate? Is it useful for comparing properties? Show to 1-2 people. |
| 5-6 | Element placement + editing | Design your own property (or a candidate). Does the flow feel natural? |
| 7 | Zone suggestions after house placement | **Key question**: Are the zone suggestions helpful or confusing for a beginner? |
| 8-9 | Save/load + export | Export your design. Print it. Pin it on a wall. Does it feel like a *plan* or just a drawing? |
| 10 | Wizard flow | Walk someone else through the wizard. Where do they get stuck? |

### Kill Criteria

This project **cannot fail** in the traditional sense — you're building it to learn, and you'll use it yourself regardless. But here's when to **pivot the approach**:

- If after using your own design on real land, you find you still need YouTube/forums for every decision → the intelligence layer isn't good enough
- If the site analysis data feels inaccurate or unhelpful → re-evaluate API choices
- If you avoid using your own tool → the UX is wrong

---

## 9. First 6-Month Goal

**Use Comfrey to evaluate and design a property you're considering buying.**

That's it. If the tool helps YOU make a better decision about land, everything else follows. Revenue, community, and polish are all Phase 2+ concerns.

---

## Summary: The One-Paragraph Pitch

Comfrey is a guided land design tool for permaculture beginners. You input your property location, it analyzes sun, wind, climate, and terrain, then recommends where to place your house, garden zones, water systems, and plantings — teaching you permaculture principles along the way. The output is a visual site plan, a phased action plan, and a genuine understanding of your land. Free to use for one property, with paid add-ons for deeper analysis and multiple designs.

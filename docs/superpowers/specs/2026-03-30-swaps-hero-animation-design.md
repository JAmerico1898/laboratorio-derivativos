# Swaps Hero Animation — Two-Stream Cash Flow Exchange with Remotion

## Overview

Add a Remotion-powered animated hero section to the Módulo 3 (Swaps) opening page at `/swaps`. The animation depicts the core concept of a swap: two counterparties exchanging cash flows in opposite directions — one leg paying DI/CDI (teal), the other paying USD/Pré (gold). The animation replaces the current plain header in `ModulePage` for the swaps route only.

## Layout

- Hero section: full viewport width, fixed height (`min-h-[600px] lg:min-h-[700px]`), `bg-[#0a1628]`.
- Text occupies the **left ≤35%**. Animation occupies the **right ≥65%**.
- A left-to-right gradient mask dims the animation under the text zone (opaque at 0–18%, fading at 28%, transparent by 42%).
- The core swap diagram is **anchored in the right 65%** so it is never obscured by the gradient.
- The animation must be understandable — the core flow diagram is always fully visible.

### Text Content

- Title: `"Swaps"` (from `theme.label`)
- Subtitle: `"Swaps de taxa de juros e câmbio: Troca de fluxos, DI vs dólar e swaps pré-fixados."` (from `theme.description`)
- Text fades in at ~7 seconds on desktop via React state + CSS opacity transition (same pattern as landing page).

### Mobile

- Remotion Player hidden (`hidden lg:block`).
- Text displays immediately on a dark gradient background.

## Animation Architecture

### Composition Config

- `compositionWidth`: 1920
- `compositionHeight`: 800
- `fps`: 30
- `durationInFrames`: 300 (10 seconds)
- `loop`: true, `autoPlay`: true, no controls

### 4 Depth Layers

All animations driven exclusively by `useCurrentFrame()` + `interpolate()`/`spring()`. No CSS transitions or Tailwind animate classes.

#### Layer 1: Background Grid (reused from landing page)

- Reuse existing `BackgroundGrid.tsx` component unchanged.
- Subtle teal grid lines, fade in over 1 second, slow upward drift.
- Provides depth and visual consistency across modules.

#### Layer 2: Core Swap Flow (frames 20–90 entrance, then continuous)

This is the visual anchor — always visible in the right 65% of the composition.

**Counterparty Nodes:**
- Two circles (radius ~45–50px in SVG viewBox coordinates).
- Left node: teal stroke (`#8df5e4`), labeled "Parte A" with sublabel "Paga DI".
- Right node: gold stroke (`#f5c842`), labeled "Parte B" with sublabel "Paga Pré".
- Entrance: spring fade-in + scale from 0→1, `{ damping: 20, stiffness: 180 }`, staggered (left at frame 20, right at frame 30).

**Flow Arcs:**
- Two curved paths (quadratic bezier) connecting the nodes:
  - Top arc: A→B direction, teal, dashed stroke at low opacity (~0.3). Label: "DI / CDI →".
  - Bottom arc: B→A direction, gold, dashed stroke at low opacity (~0.3). Label: "← USD / Pré".
- Arcs fade in with spring after nodes appear (frame 40).

**Flow Particles:**
- 3–4 small circles per arc, moving along the bezier path.
- Position calculated via `interpolate(frame % cycleDuration, [0, cycleDuration], [0, 1])` mapped to the bezier `getPointAtPercent(t)` function.
- Each particle offset by `1/numParticles` of the cycle for even spacing.
- Teal particles on top arc, gold particles on bottom arc.
- Particle opacity pulses slightly as they travel (0.5→0.9→0.5).
- `cycleDuration`: 90 frames (3 seconds per full traversal).
- Particles loop seamlessly — position wraps via modular arithmetic.

**Arc Labels:**
- "DI / CDI →" centered above top arc, teal, monospace, opacity 0.6.
- "← USD / Pré" centered below bottom arc, gold, monospace, opacity 0.6.
- Fade in with arcs.

#### Layer 3: Payment Timeline (frames 40–300, continuous)

- Horizontal line positioned below the core swap diagram, within the right 65%.
- 5 tick markers at even intervals labeled T1–T5 (representing semi-annual payment dates).
- Each tick is a small circle that "pulses" (scale 1→1.5→1, opacity boost) when a particle reaches a corresponding position on the arc above.
- Pulse timing: every `cycleDuration / 5` frames, sequential left-to-right.
- Base opacity: 0.15–0.4. Pulse peak opacity: 0.7.
- Fade in with spring after arcs appear (frame 50).

#### Layer 4: Floating Rate Labels (frames 30–300, continuous)

Same pattern as landing page's `FloatingElements` but with swap-specific data.

**Floating numbers (5–6 values):**
- `CDI 13.25%`, `Pré 12.80%`, `USDBRL 5.12`, `DI1F26`, `R$10M`, `Cupom 5.8%`
- Positioned across the composition (can extend into the left zone since they're ambient).
- Each fades in and out on its own cycle using `frame % cycleDuration`.
- Individual drift at 0.2–0.3 px/frame.
- Very low opacity (0.10–0.15), monospace font.
- No ticker tape scroll (unlike landing page) — just floating numbers.

### Loop Strategy

- Frames 270–300: counterparty nodes and arcs maintain position (they don't reset).
- Particles continue looping seamlessly (modular arithmetic, no reset needed).
- Payment timeline ticks continue pulsing.
- Floating labels continue their independent cycles.
- Background grid resets drift position smoothly (same as landing page).

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Background | `#0a1628` | Hero section and gradient mask base |
| Teal accent | `#8df5e4` | DI/CDI leg, grid lines, Parte A node, floating labels |
| Gold accent | `#f5c842` | USD/Pré leg, Parte B node |
| Text primary | `#e8eaed` | Hero title |
| Text secondary | `rgba(232, 234, 237, 0.55)` | Hero subtitle |

## Component Structure

```
src/components/remotion/
├── swaps/
│   ├── SwapsAnimation.tsx        # Main composition — AbsoluteFill with 4 Sequence layers
│   ├── SwapsPlayer.tsx           # "use client" wrapper with @remotion/player
│   ├── swaps-data.ts             # Swap-specific data: floating numbers, particle configs, colors
│   └── layers/
│       ├── SwapFlow.tsx           # Layer 2: counterparty nodes + arcs + particles
│       ├── PaymentTimeline.tsx    # Layer 3: horizontal timeline with pulsing ticks
│       └── SwapFloatingLabels.tsx # Layer 4: floating rate/notional labels
├── layers/
│   └── BackgroundGrid.tsx        # Layer 1: reused from landing page (no changes)
└── ... (existing landing page files unchanged)
```

## Integration with Swaps Page

The `/swaps` page (`src/app/swaps/page.tsx`) is restructured to include a hero section before the scenario cards:

1. `page.tsx` imports a new `SwapsModulePage` component instead of generic `ModulePage`.
2. `SwapsModulePage` renders:
   - A hero section (same structure as dashboard-page hero) with `SwapsPlayer` + gradient mask + text.
   - Below the hero: the existing scenario cards grid (extracted from `ModulePage` logic).
3. `SwapsPlayer` is dynamically imported with `{ ssr: false }`.

The existing `ModulePage` component is NOT modified — `SwapsModulePage` composes the hero + scenario cards independently.

## Bezier Path Utility

A small helper function for calculating points along a quadratic bezier curve:

```typescript
function getQuadraticPoint(t: number, p0: Point, p1: Point, p2: Point): Point {
  const x = (1-t)*(1-t)*p0.x + 2*(1-t)*t*p1.x + t*t*p2.x;
  const y = (1-t)*(1-t)*p0.y + 2*(1-t)*t*p1.y + t*t*p2.y;
  return { x, y };
}
```

This lives in `swaps-data.ts` alongside the arc path definitions.

## Dependencies

No new dependencies. Uses existing `remotion` and `@remotion/player` packages.

## Remotion Best Practices Enforced

- All animations driven by `useCurrentFrame()` — no CSS transitions or Tailwind animate classes.
- Spring configs for entrances, `interpolate()` for continuous motion.
- All `<Sequence>` elements use `premountFor` for preloading.
- Time values written as seconds × `fps` from `useVideoConfig()`.
- Particle positions via modular frame arithmetic for seamless looping.

## Out of Scope

- Real market data or API integration.
- Remotion server-side rendering or video export.
- Audio or sound effects.
- Interactive controls on the Player.
- Changes to other module pages (this is Swaps-only).
- Changes to the existing landing page hero animation.

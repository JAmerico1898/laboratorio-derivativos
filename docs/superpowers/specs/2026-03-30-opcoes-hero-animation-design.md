# Opções Hero Animation — Payoff Diagrams with Remotion

## Overview

Add a Remotion-powered animated hero section to the Módulo 4 (Opções) opening page at `/opcoes`. The animation depicts the core concept of options: Call and Put payoff diagrams (hockey-stick shapes), animated Greeks gauges (Δ, Γ, θ, ν), and floating financial labels. The animation replaces the current plain header in `ModulePage` for the opções route only.

## Layout

- Hero section: full viewport width, fixed height (`min-h-[600px] lg:min-h-[700px]`), `bg-[#0a1628]`.
- Text occupies the **left ≤35%**. Animation occupies the **right ≥65%**.
- A left-to-right gradient mask dims the animation under the text zone (opaque at 0–18%, fading at 28%, transparent by 42%).
- The payoff diagram is **anchored in the right 58%** so it is never obscured by the gradient.

### Text Content

- Title: `"Opções"` (from `theme.label`)
- Subtitle: `"Opções vanilla e estratégias: Calls, Puts, Black & Scholes e as Gregas aplicadas."` (from `theme.description`)
- Text fades in at ~7 seconds on desktop via React state + CSS opacity transition (same pattern as other modules).

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

- Reuse existing `BackgroundGrid.tsx` component unchanged with `patternId="opcoes-grid"`.
- Subtle teal grid lines, fade in over 1 second, slow upward drift.

#### Layer 2: Payoff Diagram (frames 20–90 entrance, then static)

SVG viewBox `0 0 600 350`, scaled 1.3x, positioned in right 58% of 1920×800.

**Axes:**
- Horizontal axis at y=175 (zero P&L line), vertical axis at x=50.
- Draw with spring at frame 20, `{ damping: 200 }`.
- Labels: "S" at right end, "P&L" at top, monospace, teal at 0.5 opacity.

**Strike Price K:**
- Vertical dashed line at x=300, fades in at frame 35, teal at 0.3 opacity.
- "K" label below.

**Call Payoff (teal `#8df5e4`):**
- Polyline: flat at -premium (y=245) from x=50 to x=300, then angled up to (550, 50).
- Draws L→R with `interpolate(frame, [40,80], [0,1])` controlling `strokeDashoffset`.
- "Call" label near the upward slope.

**Put Payoff (gold `#f5c842`):**
- Polyline: angled down from (50, 50) to (300, 245), then flat at -premium to (550, 245).
- Draws L→R with `interpolate(frame, [50,90], [0,1])`.
- "Put" label near the downward slope.

**Profit/Loss Zones:**
- Green fill (`#00c853` at 0.08 opacity) above zero line where payoff > 0.
- Red fill (`#ff1744` at 0.06 opacity) below zero line where payoff < 0.
- Fade in at frame 70.

**Break-Even Dots:**
- 2 small pulsing circles at break-even points (where curves cross zero).
- Spring entrance at frame 75, subtle 60-frame pulse cycle.

#### Layer 3: Greeks Gauges (frames 80–120 staggered entrance)

4 small gauge indicators arranged in a row below the payoff diagram, within the same SVG coordinate space.

**Δ (Delta):** Semi-circular arc gauge with needle sweeping 0→0.65 via spring. Teal arc stroke.

**Γ (Gamma):** Small bell curve path that pulses (scale 1→1.15→1 on 90-frame cycle). Teal stroke.

**θ (Theta):** Decaying exponential curve drawn with spring. Gold stroke (negative = cost).

**ν (Vega):** Horizontal bar that oscillates width (±15%) on 120-frame cycle. Teal fill at 0.3 opacity.

Staggered entrance: Δ at frame 80, Γ at 90, θ at 100, ν at 110. Spring `{ damping: 20, stiffness: 180 }`.

#### Layer 4: Floating Labels (frames 60–300, continuous)

Same pattern as Swaps module's `SwapFloatingLabels`.

**Floating values (6 labels):**
- `Call R$3.20`, `Put R$1.85`, `K = 52`, `σ = 28%`, `Δ = 0.65`, `θ = −0.04`
- Positioned across the composition (can extend into the left zone since they're ambient).
- Each fades in and out on its own cycle using `frame % cycleDuration`.
- Individual drift at 0.1–0.25 px/frame.
- Very low opacity (0.15 multiplier), monospace font.

### Loop Strategy

- Payoff lines and axes stay static (no reset needed).
- Greeks gauges continue their subtle pulse/oscillation cycles (modular arithmetic).
- Floating labels continue independent cycles.
- Background grid resets drift position smoothly in frames 270–300.

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Background | `#0a1628` | Hero section and gradient mask base |
| Teal accent | `#8df5e4` | Call payoff, axes, Delta/Gamma/Vega gauges, floating labels |
| Gold accent | `#f5c842` | Put payoff, Theta gauge |
| Profit zone | `#00c853` | Green fill above zero line (0.08 opacity) |
| Loss zone | `#ff1744` | Red fill below zero line (0.06 opacity) |
| Text primary | `#e8eaed` | Hero title |
| Text secondary | `rgba(232, 234, 237, 0.55)` | Hero subtitle |

## Component Structure

```
src/components/remotion/
├── opcoes/
│   ├── OpcoesAnimation.tsx        # Main composition — AbsoluteFill with 4 Sequence layers
│   ├── OpcoesPlayer.tsx           # "use client" wrapper with @remotion/player
│   ├── OpcoesPlayerLoader.tsx     # Dynamic import with ssr: false
│   ├── opcoes-data.ts             # Payoff coordinates, Greeks configs, floating labels, colors
│   └── layers/
│       ├── PayoffDiagram.tsx       # Layer 2: axes + call/put curves + zones + break-even dots
│       ├── GreeksGauges.tsx        # Layer 3: 4 animated gauge indicators
│       └── OpcoesFloatingLabels.tsx # Layer 4: floating financial labels
├── layers/
│   └── BackgroundGrid.tsx         # Layer 1: reused from landing page (no changes)
└── ... (existing files unchanged)
```

## Integration with Opções Page

`src/app/opcoes/page.tsx` imports `OpcoesPlayerLoader` and passes it as `heroPlayer` prop to `ModulePage`.

The existing `ModulePage` component handles the hero section rendering when `heroPlayer` is provided.

## Dependencies

No new dependencies. Uses existing `remotion` and `@remotion/player` packages.

## Remotion Best Practices Enforced

- All animations driven by `useCurrentFrame()` — no CSS transitions or Tailwind animate classes.
- Spring configs for entrances, `interpolate()` for continuous motion.
- All `<Sequence>` elements use `premountFor` for preloading.
- Time values written as seconds × `fps` from `useVideoConfig()`.

## Out of Scope

- Real market data or API integration.
- Remotion server-side rendering or video export.
- Audio or sound effects.
- Interactive controls on the Player.
- Changes to other module pages.

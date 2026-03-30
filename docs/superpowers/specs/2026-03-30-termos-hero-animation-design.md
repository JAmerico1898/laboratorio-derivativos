# Termos (NDF) Hero Animation — FX Trading Desk with Remotion Player

## Overview

Replace the minimal header in the Módulo 1 (Termos/NDF) page with a full-width animated hero section using a Remotion Player. The animation depicts an FX trading desk visualization with layered parallax depth: background grid, mid-ground blurred rate bars, foreground animated NDF forward curve, and floating FX ticker/price elements. Same architectural pattern as the landing page hero.

## Layout

- Hero section occupies **full viewport width** (`100vw`) and a fixed height (`min-h-[500px] lg:min-h-[600px]`).
- The Remotion Player fills the entire hero background.
- Text sits on the left ~35% of the screen width, z-indexed above the animation.
- A left-to-right gradient mask (`#0a1628 → transparent`) dims the animation under the text area for readability.
- The animation occupies ~80% of the visual space (right side fully visible, left fading under text).

### Text Content

- **Module label**: "MÓDULO 1" in small teal uppercase tracking
- **Title**: "Termos (NDF)" as h1
- **Subtitle**: "Contratos a termo e NDFs: Estruturação, precificação e estratégias de hedge cambial."
- **Back button**: "← Voltar" above the title, linking to home

### Text Reveal Sequence

- On page load, the animation plays immediately and fills the hero.
- At ~5 seconds after mount, text fades in on the left side (opacity 0→1).
- The text reveal is handled **outside Remotion** via React state + CSS opacity transition, triggered by a timer.

### Mobile

- Remotion Player is hidden (`hidden lg:block`).
- Text displays immediately on a dark gradient background.

## Animation Architecture

### Composition Config

- `compositionWidth`: 1920
- `compositionHeight`: 700
- `fps`: 30
- `durationInFrames`: 300 (10 seconds)
- `loop`: true, `autoPlay`: true, no controls

### 4 Depth Layers

All animations are driven exclusively by `useCurrentFrame()` + `interpolate()`/`spring()`. No CSS transitions or Tailwind animate classes.

#### Layer 1: Background Grid (frames 0–30 fade-in, then persistent)

- Reuse identical pattern from landing page hero animation.
- Subtle grid lines rendered as SVG pattern.
- Fade in over 1 second using `interpolate(frame, [0, 30], [0, 0.15])`.
- Slow upward drift at 0.2px/frame via `translateY`.
- Color: `rgba(141, 245, 228, 0.4)` at low opacity.
- **Unique SVG pattern ID** (`termos-grid`) to avoid conflicts if both compositions are mounted.
- Smooth loop reset in final 1 second.

#### Layer 2: Mid-ground Blurred Rate Bars (frames 20–60 entrance, then persistent)

- 5 large vertical bars representing NDF maturity rate levels (Spot, 1M, 3M, 6M, 12M).
- Bar heights correspond to forward rates in ascending term structure:
  - Spot: 5.12
  - 1M: 5.18
  - 3M: 5.25
  - 6M: 5.35
  - 12M: 5.48
- Gaussian blur 3px, opacity 0.35.
- Spring entrance with `{ damping: 200 }` and staggered delays (`20 + i * 10` frames).
- Slow leftward drift at 0.4px/frame.
- Color: `#8df5e4` (teal) — rate levels, not directional.
- Smooth loop reset in final 1 second.
- Positioned behind the foreground curve, offset to the right.

#### Layer 3: Foreground Forward Curve (frames 40–180 build phase)

- SVG line chart: X-axis = tenor, Y-axis = rate.
- **Spot reference line** (frames 40–60): dashed horizontal line at the spot rate (5.12), drawn via interpolating width from 0 to full.
- **Data points** (frames 60–180): 5 points pop in left-to-right:
  - Each point animated with spring `{ damping: 20, stiffness: 200 }` and stagger delay of `60 + i * 12` frames.
  - Small circle marker + rate label above (e.g., "5.25").
  - Tenor label below on X-axis ("Spot", "1M", "3M", "6M", "12M").
- **Curve path**: smooth SVG path connecting all points, drawn progressively via `strokeDashoffset` animation synchronized with point entrances.
- Colors:
  - Curve line: `#8df5e4`
  - Spot reference: `rgba(0, 200, 83, 0.4)` dashed
  - Data points: `#8df5e4`
  - Axis lines: `rgba(141, 245, 228, 0.15)`
  - Labels: `rgba(141, 245, 228, 0.5)` monospace
- Centered horizontally, offset right by 200px.
- Subtle axis lines (Y-axis on left, X-axis on bottom).
- This layer is the visual anchor — no drift.
- Fade to 0.3 opacity in final 1 second for loop reset.

#### Layer 4: Floating Elements (frames 30–300, continuous)

**Ticker tape:**
- Horizontal scrolling bar at the top of the composition.
- FX-specific tickers: `USDBRL 5.12 ▲0.4%`, `EURBRL 5.58 ▼0.2%`, `NDF 1M 5.18 ▲0.1%`, `NDF 3M 5.25 ▲0.2%`, `CUPOM CDI 11.75%`, `PTAX 5.11 ▼0.1%`, `CASADO 28.5 ▲0.3%`.
- Scroll via `interpolate(frame, [0, 300], [0, -1200])` on `translateX`.
- Font: monospace, color `rgba(141, 245, 228, 0.35)`, green/red accents for arrows.

**Floating numbers:**
- 6 FX-specific values at fixed positions:
  - `5.12`, `5.25`, `11.75%`, `5.48`, `▼ 0.2%`, `PTAX 5.11`
- Each fades in and out on its own cycle using modular frame arithmetic.
- Drift at varied rates per element.
- Very low opacity (0.1–0.15), monospace font.

### Loop Strategy

- Frames 270–300: all layers cross-fade to their initial state via interpolation.
- Drift-based layers (grid, mid bars, floating numbers) reset position smoothly.
- Forward curve fades slightly and restarts the build sequence.

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Background | `#0a1628` | Hero section and gradient mask base |
| Teal accent | `#8df5e4` | Grid lines, curve, ticker text, floating numbers |
| Spot reference | `rgba(0, 200, 83, 0.4)` | Dashed spot rate line |
| Text primary | `#e8eaed` | Hero title |
| Text secondary | `rgba(232, 234, 237, 0.55)` | Hero subtitle |
| Module label | `rgba(141, 245, 228, 0.6)` | "MÓDULO 1" label |

## Component Structure

```
src/components/remotion/termos/
├── TermosAnimation.tsx        # Main composition — AbsoluteFill with 4 Sequence layers
├── TermosPlayer.tsx           # "use client" wrapper with @remotion/player
├── data.ts                    # NDF rates, tickers, floating numbers
└── layers/
    ├── MidgroundBars.tsx      # Layer 2: blurred rate-level bars
    ├── ForwardCurve.tsx       # Layer 3: animated NDF forward curve line chart
    └── FloatingElements.tsx   # Layer 4: FX ticker tape + floating rate numbers
```

Layer 1 (BackgroundGrid) is imported from `src/components/remotion/layers/BackgroundGrid.tsx` — reused directly but with a `patternId` prop for unique SVG IDs.

## Integration with ModulePage

### ModulePage Changes

- `ModulePage` receives an optional `heroPlayer` React node prop.
- When `heroPlayer` is present, renders a full-width hero section above the existing scenario cards grid.
- Hero section structure mirrors the landing page:

```
<section> (full viewport width, relative, min-h-[500px] lg:min-h-[600px], bg-[#0a1628])
  ├── <div> (absolute inset-0, hidden lg:block — Remotion Player)
  │   └── {heroPlayer}
  │
  ├── <div> (absolute inset-0, z-5 — gradient mask, hidden lg:block)
  │   └── linear-gradient(to right, #0a1628 0%, #0a1628 20%, rgba(10,22,40,0.85) 30%, transparent 50%)
  │
  ├── <div> (absolute inset-0, lg:hidden — mobile gradient fallback)
  │   └── linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)
  │
  └── <div> (relative, z-10, w-[35%] — text content)
      ├── ← Voltar (back button)
      ├── <span> "MÓDULO 1" (teal label)
      ├── <h1> theme.label ("Termos (NDF)")
      └── <p> theme.description
      (opacity transitions from 0→1 at 5s via React state on desktop, immediate on mobile)
```

- When `heroPlayer` is absent, the existing header section renders as-is (backward compatible).

### Termos Page Changes

`src/app/termos/page.tsx` passes the TermosPlayer via dynamic import:

```tsx
const TermosPlayer = dynamic(
  () => import("@/components/remotion/termos/TermosPlayer").then(m => ({ default: m.TermosPlayer })),
  { ssr: false }
);

export default function TermosPage() {
  return <ModulePage themeId="ndf" heroPlayer={<TermosPlayer />} />;
}
```

## Dependencies

No new dependencies — `remotion` and `@remotion/player` are already installed.

## Remotion Best Practices Enforced

- All animations driven by `useCurrentFrame()` — no CSS transitions or Tailwind animate classes.
- Spring configs: `{ damping: 200 }` for smooth reveals, `{ damping: 20, stiffness: 200 }` for snappy data point pops.
- All `<Sequence>` elements use `premountFor` for preloading.
- Time values written in seconds multiplied by `fps` from `useVideoConfig()`.
- Unique SVG pattern/gradient IDs to avoid DOM conflicts.

## Out of Scope

- Real market data or API integration.
- Remotion server-side rendering or video export.
- Audio or sound effects.
- Interactive controls on the Player.
- Animations for other modules (Futuros, Swaps, etc.) — those follow separately.

# Futuros Hero Animation — Daily Settlement (Ajuste Diário) with Remotion Player

## Overview

Replace the plain header in the Módulo 2 (Futuros) opening page with a full hero section featuring a live animated Remotion composition. The animation depicts the daily settlement (ajuste diário) mechanics of B3 futures contracts: a price-level grid, a settlement price path, daily P&L adjustment bars, and floating futures tickers and margin values.

## Layout

- Hero section occupies **full viewport width** (`100vw`) and a fixed height (`min-h-[500px] lg:min-h-[600px]`).
- The Remotion Player fills the entire hero background.
- Text sits on the left ~40% of the screen width, z-indexed above the animation.
- A left-to-right gradient mask (`#0a1628 → transparent`) dims the animation under the text area for readability.
- The animation occupies ~80% of the visual space (right side fully visible, left fading under text).

### Text Content & Typography

Must match the landing page hero typography exactly:

- **Back button:** uppercase tracking-widest text-xs, primary color, with arrow_back icon.
- **Title:** `text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-[#e8eaed] leading-[1.1] tracking-tight`. The word "Futuros" is wrapped in `<span className="text-[#8df5e4]">` for the teal accent, matching how "Derivativos" is styled on the landing page.
- **Subtitle:** `text-lg text-[rgba(232,234,237,0.55)] leading-relaxed`. Content: "Contratos futuros e ajuste diário: Margens, liquidação e mecânica operacional da B3."

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

#### Layer 1: Price Grid (frames 0–30 fade-in, then persistent)

- Horizontal price-level lines representing DI interest rate levels.
- 5 lines with rate labels on the right: `12.50%`, `13.00%`, `13.50%`, `14.00%`, `14.50%`.
- Fade in over 1 second using `interpolate(frame, [0, 1 * fps], [0, 0.15])`.
- Slow upward drift at 0.15px/frame via `translateY`.
- Color: `rgba(141, 245, 228, 0.4)` at low opacity.
- Labels: monospace, `rgba(141, 245, 228, 0.3)`, font-size 11px.

#### Layer 2: Settlement Price Path (frames 20–ongoing, blurred)

- A dashed polyline tracing daily settlement prices (preço de ajuste) across ~10 settlement days.
- Settlement dots (circles, r=5) at each daily mark.
- Gaussian blur ~3px, opacity ~0.3.
- Fade in with spring `{ damping: 200 }` starting at frame 20.
- Slow leftward drift at 0.4px/frame.
- **Color: amber `#f5c842`** — the secondary accent for financial-specific elements.
- Data: 10–12 settlement price points normalized 0–1, trending generally upward with some pullbacks.

#### Layer 3: Daily Adjustment Bars (frames 40–180 build phase)

- 10 bars representing daily P&L adjustments (ajuste diário), labeled D+1 through D+10.
- Green (`#00c853`) bars = positive adjustment (credit to margin account).
- Red (`#ff1744`) bars = negative adjustment (debit from margin account).
- Each bar animated with spring `{ damping: 20, stiffness: 200 }` and stagger delay of `i * 6` frames.
- Animation per bar: height grows from 0 to target with spring, opacity fades in simultaneously.
- Bar width: 18px, gap: 14px, rounded top corners (rx: 3).
- Day labels below each bar: monospace, `rgba(232, 234, 237, 0.4)`, font-size 9px.
- This layer is the visual anchor — no drift, positioned center-right of the composition.
- Subtle axis lines (Y-axis left, X-axis bottom) in `rgba(141, 245, 228, 0.15)`.

#### Layer 4: Floating Elements (frames 30–300, continuous)

**Futures ticker tape:**
- Horizontal scrolling bar at the top of the composition.
- Tickers: `DI1F26 13.25% ▲0.10`, `DOL F26 5.120 ▼0.015`, `IND F26 128.450 ▲1.2%`, `DDI F26 13.10% ▲0.05`, `BGI F26 128.200 ▼0.3%`, `WDO F26 5.118 ▲0.008`.
- Scroll via `interpolate(frame, [0, durationInFrames], [0, -totalWidth])` on `translateX`.
- Font: monospace, color `rgba(141, 245, 228, 0.35)`, green/red accents for arrows.

**Floating settlement values:**
- 5–6 R$ values at fixed positions: `+R$ 4.250`, `−R$ 1.800`, `MG: R$ 15.000`, `+R$ 2.100`, `−R$ 3.400`, `R$ 12.500`.
- Each fades in and out on its own cycle using modular frame arithmetic: `frame % cycleDuration`.
- Drift at 0.3px/frame (varied per element).
- Very low opacity (`0.10–0.15`), monospace font.
- **Color: amber `rgba(245, 200, 66, opacity)`** — the secondary accent for financial values.

### Loop Strategy

- Frames 270–300: all layers cross-fade to their initial state via interpolation.
- The drift-based layers (grid, settlement path, floating values) reset position smoothly.
- Daily adjustment bars fade slightly and restart the build sequence.

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Background | `#0a1628` | Hero section and gradient mask base |
| Teal accent (primary) | `#8df5e4` | Grid lines, ticker text, "Futuros" title highlight |
| Amber accent (secondary) | `#f5c842` | Settlement path, floating R$ values |
| Positive adjustment | `#00c853` | Green bars (margin credit) |
| Negative adjustment | `#ff1744` | Red bars (margin debit) |
| Text primary | `#e8eaed` | Hero title |
| Text secondary | `rgba(232, 234, 237, 0.55)` | Hero subtitle |

## Component Structure

```
src/components/remotion/futuros/
├── FuturosAnimation.tsx        # Main composition — AbsoluteFill with 4 Sequence layers
├── FuturosPlayer.tsx           # "use client" wrapper with @remotion/player
├── data.ts                     # Settlement data, futures tickers, floating values
└── layers/
    ├── PriceGrid.tsx           # Layer 1: horizontal rate-level lines + labels
    ├── SettlementPath.tsx      # Layer 2: dashed amber price path + settlement dots
    ├── DailyAdjustmentBars.tsx # Layer 3: green/red P&L bars building left-to-right
    └── FuturosFloating.tsx     # Layer 4: futures ticker tape + floating R$ values
```

## Integration with ModulePage

The `ModulePage` component (`src/components/landing/module-page.tsx`) is restructured to support an optional hero animation. When `themeId === "futuros"`, the header section is replaced with a full hero section:

```
<section> (full viewport width, relative, min-h-[500px] lg:min-h-[600px], bg-[#0a1628])
  ├── <div> (absolute inset-0, hidden lg:block — Remotion Player)
  │   └── <FuturosPlayer />
  │
  ├── <div> (absolute inset-0, z-5 — gradient mask)
  │   └── linear-gradient(to right, #0a1628 0%, #0a1628 18%, rgba(10,22,40,0.85) 28%, transparent 48%)
  │
  └── <div> (relative, z-10, w-[40%] — text content)
      ├── <button> ← Voltar (back to landing page)
      ├── <h1> "Futuros" (text-[#8df5e4], same font-heading font-extrabold sizing as landing hero)
      └── <p> subtitle (same text-secondary style as landing hero)
      (opacity transitions from 0→1 at 5s via React state)
```

The scenario cards grid sits **below** the hero section with `pt-12` spacing.

Modules without a hero animation continue to use the existing plain header.

## Data

### Settlement Points (Layer 2)

```ts
export const SETTLEMENT_POINTS = [
  0.25, 0.30, 0.28, 0.35, 0.42, 0.40, 0.48, 0.55, 0.52, 0.60, 0.65, 0.70
];
```

### Daily Adjustments (Layer 3)

```ts
export type DailyAdjustment = {
  day: number;      // D+1, D+2, etc.
  value: number;    // normalized 0–1 for bar height
  positive: boolean; // green or red
};

export const DAILY_ADJUSTMENTS: DailyAdjustment[] = [
  { day: 1, value: 0.50, positive: true },
  { day: 2, value: 0.28, positive: false },
  { day: 3, value: 0.65, positive: true },
  { day: 4, value: 0.18, positive: true },
  { day: 5, value: 0.40, positive: false },
  { day: 6, value: 0.55, positive: true },
  { day: 7, value: 0.32, positive: false },
  { day: 8, value: 0.48, positive: true },
  { day: 9, value: 0.22, positive: false },
  { day: 10, value: 0.60, positive: true },
];
```

### Futures Tickers (Layer 4)

```ts
export const FUTURES_TICKERS: TickerEntry[] = [
  { symbol: "DI1F26", price: "13.25%", change: "0.10", positive: true },
  { symbol: "DOL F26", price: "5.120", change: "0.015", positive: false },
  { symbol: "IND F26", price: "128.450", change: "1.2%", positive: true },
  { symbol: "DDI F26", price: "13.10%", change: "0.05", positive: true },
  { symbol: "BGI F26", price: "128.200", change: "0.3%", positive: false },
  { symbol: "WDO F26", price: "5.118", change: "0.008", positive: true },
];
```

### Floating Values (Layer 4)

```ts
export type FloatingValue = {
  value: string;
  x: number;
  y: number;
  fontSize: number;
  cycleOffset: number;
  driftX: number;
  driftY: number;
};

export const FLOATING_VALUES: FloatingValue[] = [
  { value: "+R$ 4.250", x: 0.70, y: 0.15, fontSize: 22, cycleOffset: 0, driftX: 0, driftY: -0.3 },
  { value: "−R$ 1.800", x: 0.55, y: 0.35, fontSize: 18, cycleOffset: 40, driftX: 0.1, driftY: -0.2 },
  { value: "MG: R$ 15.000", x: 0.80, y: 0.55, fontSize: 16, cycleOffset: 80, driftX: -0.1, driftY: -0.25 },
  { value: "+R$ 2.100", x: 0.65, y: 0.70, fontSize: 20, cycleOffset: 120, driftX: 0.05, driftY: -0.3 },
  { value: "−R$ 3.400", x: 0.50, y: 0.50, fontSize: 15, cycleOffset: 160, driftX: -0.05, driftY: -0.15 },
  { value: "R$ 12.500", x: 0.75, y: 0.80, fontSize: 14, cycleOffset: 200, driftX: 0, driftY: -0.2 },
];
```

## Dependencies

Already installed (shared with landing page hero):
- `remotion` — core library (useCurrentFrame, interpolate, spring, Sequence, AbsoluteFill)
- `@remotion/player` — browser Player component

No additional dependencies needed.

## Remotion Best Practices Enforced

- All animations driven by `useCurrentFrame()` — no CSS transitions or Tailwind animate classes.
- Spring configs: `{ damping: 200 }` for smooth reveals, `{ damping: 20, stiffness: 200 }` for snappy bar pops.
- All `<Sequence>` elements use `premountFor` for preloading.
- Time values written in seconds multiplied by `fps` from `useVideoConfig()`.
- `durationInFrames` from `useVideoConfig()` used everywhere instead of hardcoded 300.

## Out of Scope

- Real market data or API integration.
- Remotion server-side rendering or video export.
- Audio or sound effects.
- Interactive controls on the Player.
- Animations for other modules (Swaps, Opções, etc.) — those will be separate specs.

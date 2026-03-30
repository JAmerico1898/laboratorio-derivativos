# Hero Animation — Layered Parallax Candlestick with Remotion Player

## Overview

Replace the static `hero-trading.jpg` image in the landing page hero section with a live animated Remotion composition. The animation depicts a Bloomberg-terminal-style market data visualization with layered parallax depth: background grid, mid-ground blurred candlesticks, foreground sharp candlestick chart, and floating ticker/price elements.

## Layout

- Hero section occupies **full viewport width** (`100vw`) and a fixed height (`min-h-[600px] lg:min-h-[700px]`).
- The Remotion Player fills the entire hero background.
- Text sits on the left ~35% of the screen width, z-indexed above the animation.
- A left-to-right gradient mask (`#0a1628 → transparent`) dims the animation under the text area for readability.
- The animation occupies ~80% of the visual space (right side fully visible, left fading under text).

### Text Reveal Sequence

- On page load, the animation plays immediately and fills the hero.
- At ~7 seconds after mount, text fades in on the left side (opacity 0→1).
- The text reveal is handled **outside Remotion** via React state + CSS opacity transition, triggered by a timer.

### Mobile

- Remotion Player is hidden (`hidden lg:block`).
- Text displays immediately on a dark gradient background.

## Animation Architecture

### Composition Config

- `compositionWidth`: 1920
- `compositionHeight`: 800
- `fps`: 30
- `durationInFrames`: 300 (10 seconds)
- `loop`: true, `autoPlay`: true, no controls

### 4 Depth Layers

All animations are driven exclusively by `useCurrentFrame()` + `interpolate()`/`spring()`. No CSS transitions or Tailwind animate classes.

#### Layer 1: Background Grid (frames 0–30 fade-in, then persistent)

- Subtle grid lines rendered as repeating linear gradients or thin SVG lines.
- Fade in over 1 second using `interpolate(frame, [0, 30], [0, 0.08])`.
- Slow upward drift at 0.2px/frame via `translateY`.
- Color: `rgba(141, 245, 228, 0.4)` at low opacity.

#### Layer 2: Mid-ground Candles (frames 20–60 entrance, then persistent)

- 4–5 large candlestick bars, Gaussian blur ~3px, opacity ~0.25.
- Fade in with spring `{ damping: 200 }` and staggered delays.
- Slow leftward drift at 0.5px/frame.
- Positioned behind the foreground candles, offset to the right.

#### Layer 3: Foreground Candles (frames 40–180 build phase)

- ~20 sharp, detailed candlestick bars building left-to-right.
- Each bar animated with spring `{ damping: 20, stiffness: 200 }` and stagger delay of `i * 5` frames.
- Animation per bar: wick extends first (interpolate height), then body fills (interpolate height + opacity).
- Green (`#00c853`) for bullish (close > open), red (`#ff1744`) for bearish.
- This layer is the visual anchor — no drift.

#### Layer 4: Floating Elements (frames 30–300, continuous)

**Ticker tape:**
- Horizontal scrolling bar at the top of the composition.
- Tickers: `PETR4 42.15 ▲2.3%`, `VALE3 58.90 ▼0.8%`, `USDBRL 5.12 ▲0.4%`, `DI1F26 13.25% ▲0.1%`, `IBOV 128,450 ▲1.2%`, `ITUB4 32.80 ▼0.3%`, `BBDC4 14.55 ▲0.6%`.
- Scroll via `interpolate(frame, [0, 300], [0, -totalWidth])` on `translateX`.
- Font: monospace, color `rgba(141, 245, 228, 0.35)`, green/red accents for arrows.

**Floating numbers:**
- 5–6 price/rate values (`42.15`, `5.12`, `13.25%`, `128,450`, `▼ 0.8%`) at fixed positions.
- Each fades in and out on its own cycle using modular frame arithmetic: `frame % cycleDuration`.
- Drift at 0.3px/frame (varied per element).
- Very low opacity (`0.1–0.15`), monospace font.

### Loop Strategy

- Frames 270–300: all layers cross-fade to their initial state via interpolation.
- The drift-based layers (grid, mid candles, floating numbers) reset position smoothly.
- Foreground candles fade slightly and restart the build sequence.

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Background | `#0a1628` | Hero section and gradient mask base |
| Teal accent | `#8df5e4` | Grid lines, ticker text, floating numbers, "Derivativos" highlight |
| Bullish candle | `#00c853` | Green candlestick bodies and wicks |
| Bearish candle | `#ff1744` | Red candlestick bodies and wicks |
| Text primary | `#e8eaed` | Hero title |
| Text secondary | `rgba(232, 234, 237, 0.55)` | Hero subtitle |

## Component Structure

```
src/components/remotion/
├── HeroAnimation.tsx         # Main composition — AbsoluteFill with 4 Sequence layers
├── layers/
│   ├── BackgroundGrid.tsx    # Layer 1: grid lines fade-in + upward drift
│   ├── MidgroundCandles.tsx  # Layer 2: blurred large candles with leftward drift
│   ├── ForegroundCandles.tsx # Layer 3: sharp candles building bar-by-bar
│   └── FloatingElements.tsx  # Layer 4: ticker tape + floating price numbers
├── data.ts                   # Hardcoded OHLC candle data + ticker entries
└── HeroPlayer.tsx            # "use client" wrapper with @remotion/player
```

## Integration with dashboard-page.tsx

The hero section in `src/components/landing/dashboard-page.tsx` is restructured:

```
<section> (full viewport width, relative, min-h-[600px] lg:min-h-[700px], bg-[#0a1628])
  ├── <div> (absolute inset-0, hidden lg:block — Remotion Player)
  │   └── <HeroPlayer />
  │
  ├── <div> (absolute inset-0, z-5 — gradient mask)
  │   └── linear-gradient(to right, #0a1628 0%, #0a1628 20%, rgba(10,22,40,0.85) 30%, transparent 50%)
  │
  └── <div> (relative, z-10, w-[35%] — text content)
      ├── <h1> "Laboratório de Simulação com Derivativos"
      └── <p> subtitle
      (opacity transitions from 0→1 at 7s via React state)
```

The current two-column grid layout and `hero-trading.jpg` image are fully replaced.

## Dependencies

Install:
- `remotion` — core library (useCurrentFrame, interpolate, spring, Sequence, AbsoluteFill)
- `@remotion/player` — browser Player component

No Remotion CLI or bundler needed — Player-only usage.

## Remotion Best Practices Enforced

- All animations driven by `useCurrentFrame()` — no CSS transitions or Tailwind animate classes.
- Spring configs: `{ damping: 200 }` for smooth reveals, `{ damping: 20, stiffness: 200 }` for snappy candle pops.
- All `<Sequence>` elements use `premountFor` for preloading.
- Time values written in seconds multiplied by `fps` from `useVideoConfig()`.

## Out of Scope

- Real market data or API integration.
- Remotion server-side rendering or video export.
- Audio or sound effects.
- Interactive controls on the Player.

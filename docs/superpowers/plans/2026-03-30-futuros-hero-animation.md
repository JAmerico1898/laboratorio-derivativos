# Futuros Hero Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Remotion-based hero animation to the Módulo 2 (Futuros) opening page, themed around daily settlement (ajuste diário) mechanics.

**Architecture:** 4-layer Remotion composition (PriceGrid, SettlementPath, DailyAdjustmentBars, FuturosFloating) wrapped in a Player component, integrated into the ModulePage as a full hero section. Follows the exact same pattern as the landing page hero (HeroPlayer → HeroAnimation → layers/).

**Tech Stack:** Remotion (already installed), @remotion/player (already installed), Next.js dynamic imports with SSR disabled.

**Spec:** `docs/superpowers/specs/2026-03-30-futuros-hero-animation-design.md`

---

## File Structure

```
src/components/remotion/futuros/     # NEW directory
├── data.ts                          # Types, settlement data, tickers, colors
├── layers/
│   ├── PriceGrid.tsx                # Layer 1: horizontal rate-level lines
│   ├── SettlementPath.tsx           # Layer 2: dashed amber price path
│   ├── DailyAdjustmentBars.tsx      # Layer 3: green/red P&L bars
│   └── FuturosFloating.tsx          # Layer 4: futures ticker + R$ values
├── FuturosAnimation.tsx             # Root composition (4 Sequences)
└── FuturosPlayer.tsx                # "use client" Player wrapper

src/components/landing/module-page.tsx  # MODIFY: add hero section for futuros
src/lib/strings.ts                      # MODIFY: add futuros hero strings
```

---

### Task 1: Create futuros data module

**Files:**
- Create: `src/components/remotion/futuros/data.ts`

- [ ] **Step 1: Create the data file with types, constants, and data arrays**

```ts
// src/components/remotion/futuros/data.ts

export type DailyAdjustment = {
  day: number;
  value: number;
  positive: boolean;
};

export type TickerEntry = {
  symbol: string;
  price: string;
  change: string;
  positive: boolean;
};

export type FloatingValue = {
  value: string;
  x: number;
  y: number;
  fontSize: number;
  cycleOffset: number;
  driftX: number;
  driftY: number;
};

// Settlement price points (normalized 0–1), trending upward with pullbacks
export const SETTLEMENT_POINTS = [
  0.25, 0.30, 0.28, 0.35, 0.42, 0.40, 0.48, 0.55, 0.52, 0.60, 0.65, 0.70,
];

// Daily P&L adjustments for Layer 3
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

// Futures tickers for Layer 4
export const FUTURES_TICKERS: TickerEntry[] = [
  { symbol: "DI1F26", price: "13.25%", change: "0.10", positive: true },
  { symbol: "DOL F26", price: "5.120", change: "0.015", positive: false },
  { symbol: "IND F26", price: "128.450", change: "1.2%", positive: true },
  { symbol: "DDI F26", price: "13.10%", change: "0.05", positive: true },
  { symbol: "BGI F26", price: "128.200", change: "0.3%", positive: false },
  { symbol: "WDO F26", price: "5.118", change: "0.008", positive: true },
];

// Floating R$ settlement values for Layer 4
export const FLOATING_VALUES: FloatingValue[] = [
  { value: "+R$ 4.250", x: 0.70, y: 0.15, fontSize: 22, cycleOffset: 0, driftX: 0, driftY: -0.3 },
  { value: "\u2212R$ 1.800", x: 0.55, y: 0.35, fontSize: 18, cycleOffset: 40, driftX: 0.1, driftY: -0.2 },
  { value: "MG: R$ 15.000", x: 0.80, y: 0.55, fontSize: 16, cycleOffset: 80, driftX: -0.1, driftY: -0.25 },
  { value: "+R$ 2.100", x: 0.65, y: 0.70, fontSize: 20, cycleOffset: 120, driftX: 0.05, driftY: -0.3 },
  { value: "\u2212R$ 3.400", x: 0.50, y: 0.50, fontSize: 15, cycleOffset: 160, driftX: -0.05, driftY: -0.15 },
  { value: "R$ 12.500", x: 0.75, y: 0.80, fontSize: 14, cycleOffset: 200, driftX: 0, driftY: -0.2 },
];

// Rate levels for the price grid (Layer 1)
export const RATE_LEVELS = ["12.50%", "13.00%", "13.50%", "14.00%", "14.50%"];

// Colors
export const COLOR_BG = "#0a1628";
export const COLOR_TEAL = "#8df5e4";
export const COLOR_AMBER = "#f5c842";
export const COLOR_BULLISH = "#00c853";
export const COLOR_BEARISH = "#ff1744";
```

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/futuros/data.ts
git commit -m "feat(futuros): add data module for hero animation"
```

---

### Task 2: Create PriceGrid layer (Layer 1)

**Files:**
- Create: `src/components/remotion/futuros/layers/PriceGrid.tsx`

- [ ] **Step 1: Create PriceGrid component**

Pattern: follows `BackgroundGrid.tsx` but uses horizontal price-level lines with DI rate labels instead of a square grid pattern.

```tsx
// src/components/remotion/futuros/layers/PriceGrid.tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { RATE_LEVELS, COLOR_TEAL } from "../data";

export const PriceGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in over 1 second
  const opacity = interpolate(frame, [0, 1 * fps], [0, 0.15], {
    extrapolateRight: "clamp",
  });

  // Slow upward drift with smooth loop reset
  const loopResetProgress = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rawDrift = frame * 0.15;
  const lineSpacing = 140; // px between rate levels
  const drift = rawDrift * (frame < durationInFrames - 1 * fps ? 1 : loopResetProgress);

  const gridColor = "rgba(141, 245, 228, 0.4)";
  const labelColor = "rgba(141, 245, 228, 0.3)";

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(-${drift % lineSpacing}px)`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 700"
        preserveAspectRatio="xMidYMid slice"
      >
        {RATE_LEVELS.map((label, i) => {
          const y = 100 + i * lineSpacing;
          return (
            <g key={i}>
              <line
                x1={0}
                y1={y}
                x2={1920}
                y2={y}
                stroke={gridColor}
                strokeWidth={0.5}
              />
              <text
                x={1900}
                y={y - 6}
                fill={labelColor}
                fontSize={11}
                fontFamily="monospace"
                textAnchor="end"
              >
                {label}
              </text>
            </g>
          );
        })}
        {/* Extra lines above and below for drift continuity */}
        <line x1={0} y1={100 - lineSpacing} x2={1920} y2={100 - lineSpacing} stroke={gridColor} strokeWidth={0.5} />
        <line x1={0} y1={100 + RATE_LEVELS.length * lineSpacing} x2={1920} y2={100 + RATE_LEVELS.length * lineSpacing} stroke={gridColor} strokeWidth={0.5} />
      </svg>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/futuros/layers/PriceGrid.tsx
git commit -m "feat(futuros): add PriceGrid layer for hero animation"
```

---

### Task 3: Create SettlementPath layer (Layer 2)

**Files:**
- Create: `src/components/remotion/futuros/layers/SettlementPath.tsx`

- [ ] **Step 1: Create SettlementPath component**

Pattern: follows `MidgroundCandles.tsx` — spring fade-in, leftward drift, blur 3px. But renders a dashed polyline with settlement dots instead of candle bars.

```tsx
// src/components/remotion/futuros/layers/SettlementPath.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SETTLEMENT_POINTS, COLOR_AMBER } from "../data";

export const SettlementPath: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Spring fade-in starting at frame 20
  const fadeIn = spring({
    frame,
    fps,
    delay: 20,
    config: { damping: 200 },
  });
  const opacity = fadeIn * 0.3;

  // Leftward drift with smooth loop reset
  const loopResetProgress = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rawDrift = frame * 0.4;
  const drift = rawDrift * (frame < durationInFrames - 1 * fps ? 1 : loopResetProgress);

  const chartHeight = 500;
  const chartTop = 100;
  const startX = 500;
  const stepX = 100;

  // Build polyline points
  const points = SETTLEMENT_POINTS.map((val, i) => {
    const x = startX + i * stepX;
    const y = chartTop + (1 - val) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  return (
    <AbsoluteFill
      style={{
        opacity,
        filter: "blur(3px)",
        transform: `translateX(-${drift}px)`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 700"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Dashed settlement price line */}
        <polyline
          points={points}
          fill="none"
          stroke={COLOR_AMBER}
          strokeWidth={2.5}
          strokeDasharray="8,6"
        />

        {/* Settlement day dots */}
        {SETTLEMENT_POINTS.map((val, i) => {
          const x = startX + i * stepX;
          const y = chartTop + (1 - val) * chartHeight;
          const dotScale = spring({
            frame,
            fps,
            delay: 20 + i * 8,
            config: { damping: 200 },
          });
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={5 * dotScale}
              fill={COLOR_AMBER}
              opacity={0.6}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/futuros/layers/SettlementPath.tsx
git commit -m "feat(futuros): add SettlementPath layer for hero animation"
```

---

### Task 4: Create DailyAdjustmentBars layer (Layer 3)

**Files:**
- Create: `src/components/remotion/futuros/layers/DailyAdjustmentBars.tsx`

- [ ] **Step 1: Create DailyAdjustmentBars component**

Pattern: follows `ForegroundCandles.tsx` — spring-animated bars with stagger delay, loop fade, axis lines. But renders vertical P&L bars with day labels instead of candlesticks.

```tsx
// src/components/remotion/futuros/layers/DailyAdjustmentBars.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DAILY_ADJUSTMENTS, COLOR_BULLISH, COLOR_BEARISH } from "../data";
import type { DailyAdjustment } from "../data";

const STAGGER_DELAY = 6;

const AnimatedBar: React.FC<{
  adjustment: DailyAdjustment;
  index: number;
  x: number;
  chartHeight: number;
  barWidth: number;
}> = ({ adjustment, index, x, chartHeight, barWidth }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const color = adjustment.positive ? COLOR_BULLISH : COLOR_BEARISH;
  const targetHeight = adjustment.value * chartHeight;
  const delay = 40 + index * STAGGER_DELAY;

  // Bar grows from bottom with spring
  const barProgress = spring({
    frame,
    fps,
    delay,
    config: { damping: 20, stiffness: 200 },
  });

  const animatedHeight = targetHeight * barProgress;
  const barY = chartHeight - animatedHeight;

  return (
    <g>
      <rect
        x={x}
        y={barY}
        width={barWidth}
        height={animatedHeight}
        fill={color}
        rx={3}
        opacity={barProgress}
      />
      {/* Day label below */}
      <text
        x={x + barWidth / 2}
        y={chartHeight + 16}
        fill="rgba(232, 234, 237, 0.4)"
        fontSize={9}
        fontFamily="monospace"
        textAnchor="middle"
        opacity={barProgress}
      >
        D+{adjustment.day}
      </text>
    </g>
  );
};

export const DailyAdjustmentBars: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Subtle fade for loop reset
  const loopFade = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const chartHeight = 350;
  const barWidth = 18;
  const gap = 14;
  const totalWidth = DAILY_ADJUSTMENTS.length * (barWidth + gap);
  const startX = (1920 - totalWidth) / 2 + 200;

  const axisLeft = startX - 10;
  const axisRight = startX + totalWidth;

  return (
    <AbsoluteFill style={{ opacity: loopFade }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 700"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(0, ${(700 - chartHeight) / 2})`}>
          {/* Subtle axis lines */}
          <line
            x1={axisLeft}
            y1={0}
            x2={axisLeft}
            y2={chartHeight}
            stroke="rgba(141, 245, 228, 0.15)"
            strokeWidth={1}
          />
          <line
            x1={axisLeft}
            y1={chartHeight}
            x2={axisRight}
            y2={chartHeight}
            stroke="rgba(141, 245, 228, 0.15)"
            strokeWidth={1}
          />

          {DAILY_ADJUSTMENTS.map((adj, i) => (
            <AnimatedBar
              key={i}
              adjustment={adj}
              index={i}
              x={startX + i * (barWidth + gap)}
              chartHeight={chartHeight}
              barWidth={barWidth}
            />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/futuros/layers/DailyAdjustmentBars.tsx
git commit -m "feat(futuros): add DailyAdjustmentBars layer for hero animation"
```

---

### Task 5: Create FuturosFloating layer (Layer 4)

**Files:**
- Create: `src/components/remotion/futuros/layers/FuturosFloating.tsx`

- [ ] **Step 1: Create FuturosFloating component**

Pattern: follows `FloatingElements.tsx` exactly — ticker tape at top + floating values with cyclic fade. Uses futures-specific tickers and amber color for floating R$ values.

```tsx
// src/components/remotion/futuros/layers/FuturosFloating.tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FUTURES_TICKERS, FLOATING_VALUES, COLOR_AMBER } from "../data";

const VALUE_CYCLE_DURATION = 60;

const FuturesTicker: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fullTickers = [...FUTURES_TICKERS, ...FUTURES_TICKERS];

  const scrollX = interpolate(frame, [0, durationInFrames], [0, -1200]);

  return (
    <div
      style={{
        position: "absolute",
        top: 15,
        left: 0,
        right: 0,
        overflow: "hidden",
        opacity: fadeIn,
        height: 30,
      }}
    >
      <div
        style={{
          whiteSpace: "nowrap",
          fontFamily: "monospace",
          fontSize: 12,
          letterSpacing: 2,
          transform: `translateX(${scrollX}px)`,
          display: "flex",
          gap: 0,
        }}
      >
        {fullTickers.map((ticker, i) => {
          const arrowColor = ticker.positive
            ? "rgba(0, 200, 83, 0.6)"
            : "rgba(255, 23, 68, 0.6)";
          return (
            <span key={i} style={{ marginRight: 24 }}>
              <span style={{ color: "rgba(141, 245, 228, 0.35)" }}>
                {ticker.symbol} {ticker.price}{" "}
              </span>
              <span style={{ color: arrowColor }}>
                {ticker.positive ? "\u25B2" : "\u25BC"}{ticker.change}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

const FloatingSettlementValue: React.FC<{
  value: string;
  x: number;
  y: number;
  fontSize: number;
  cycleOffset: number;
  driftX: number;
  driftY: number;
}> = ({ value, x, y, fontSize, cycleOffset, driftX, driftY }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cycleFrame = (frame + cycleOffset) % (VALUE_CYCLE_DURATION * 2);
  const cycleOpacity = interpolate(
    cycleFrame,
    [0, VALUE_CYCLE_DURATION * 0.3, VALUE_CYCLE_DURATION, VALUE_CYCLE_DURATION * 1.3, VALUE_CYCLE_DURATION * 2],
    [0, 1, 1, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const posX = x * 1920 + frame * driftX;
  const posY = y * 700 + frame * driftY;

  return (
    <div
      style={{
        position: "absolute",
        left: posX,
        top: posY,
        fontFamily: "monospace",
        fontSize,
        color: COLOR_AMBER,
        opacity: fadeIn * cycleOpacity * 0.15,
        pointerEvents: "none",
      }}
    >
      {value}
    </div>
  );
};

export const FuturosFloating: React.FC = () => {
  return (
    <AbsoluteFill>
      <FuturesTicker />
      {FLOATING_VALUES.map((val, i) => (
        <FloatingSettlementValue key={i} {...val} />
      ))}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/futuros/layers/FuturosFloating.tsx
git commit -m "feat(futuros): add FuturosFloating layer for hero animation"
```

---

### Task 6: Create FuturosAnimation composition

**Files:**
- Create: `src/components/remotion/futuros/FuturosAnimation.tsx`

- [ ] **Step 1: Create FuturosAnimation component**

Pattern: follows `HeroAnimation.tsx` exactly — AbsoluteFill with 4 Sequences, premountFor on layers 2–4.

```tsx
// src/components/remotion/futuros/FuturosAnimation.tsx
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { PriceGrid } from "./layers/PriceGrid";
import { SettlementPath } from "./layers/SettlementPath";
import { DailyAdjustmentBars } from "./layers/DailyAdjustmentBars";
import { FuturosFloating } from "./layers/FuturosFloating";
import { COLOR_BG } from "./data";

export const FuturosAnimation: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR_BG }}>
      {/* Layer 1: Price Grid */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={0}>
        <PriceGrid />
      </Sequence>

      {/* Layer 2: Settlement price path (blurred, amber) */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <SettlementPath />
      </Sequence>

      {/* Layer 3: Daily adjustment bars (main visual anchor) */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <DailyAdjustmentBars />
      </Sequence>

      {/* Layer 4: Futures ticker + floating R$ values */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <FuturosFloating />
      </Sequence>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/futuros/FuturosAnimation.tsx
git commit -m "feat(futuros): add FuturosAnimation composition combining all layers"
```

---

### Task 7: Create FuturosPlayer wrapper

**Files:**
- Create: `src/components/remotion/futuros/FuturosPlayer.tsx`

- [ ] **Step 1: Create FuturosPlayer component**

Pattern: follows `HeroPlayer.tsx` exactly — "use client" wrapper with Player component. Uses 700 height (vs 800 for landing page) to match the slightly shorter hero section.

```tsx
// src/components/remotion/futuros/FuturosPlayer.tsx
"use client";

import { Player } from "@remotion/player";
import { FuturosAnimation } from "./FuturosAnimation";

const COMPOSITION_WIDTH = 1920;
const COMPOSITION_HEIGHT = 700;
const FPS = 30;
const DURATION_IN_FRAMES = 300;

export const FuturosPlayer: React.FC = () => {
  return (
    <Player
      component={FuturosAnimation}
      compositionWidth={COMPOSITION_WIDTH}
      compositionHeight={COMPOSITION_HEIGHT}
      fps={FPS}
      durationInFrames={DURATION_IN_FRAMES}
      loop
      autoPlay
      controls={false}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/futuros/FuturosPlayer.tsx
git commit -m "feat(futuros): add FuturosPlayer client wrapper"
```

---

### Task 8: Add futuros hero strings

**Files:**
- Modify: `src/lib/strings.ts`

- [ ] **Step 1: Add futuros hero strings to the strings object**

Add these entries before the `whyResult` key in `src/lib/strings.ts`:

```ts
  futurosHeroTitle: "Futuros",
  futurosHeroSubtitle: "Contratos futuros e ajuste diário: Margens, liquidação e mecânica operacional da B3.",
```

The title uses the same accent pattern as the landing page (`heroTitle` + `heroTitleAccent`), but for futuros the entire title word "Futuros" is the accent.

- [ ] **Step 2: Commit**

```bash
git add src/lib/strings.ts
git commit -m "feat(futuros): add hero section strings"
```

---

### Task 9: Integrate hero animation into ModulePage

**Files:**
- Modify: `src/components/landing/module-page.tsx`

This is the largest task. The ModulePage component needs to:
1. Dynamically import FuturosPlayer (SSR disabled)
2. Add a text fade-in timer (same pattern as dashboard-page.tsx)
3. Render a full hero section when `themeId === "futuros"`, or the existing plain header for other modules

- [ ] **Step 1: Add dynamic import and state for text reveal**

At the top of `module-page.tsx`, after the existing imports, add:

```ts
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
```

Note: `useState` is already imported. Add `useEffect` to the existing import from `'react'`:

Change:
```ts
import { useState } from 'react';
```
To:
```ts
import { useState, useEffect } from 'react';
```

After all imports (before `getDifficultyStyles`), add the dynamic import:

```ts
const FuturosPlayer = dynamic(
  () => import("@/components/remotion/futuros/FuturosPlayer").then((m) => ({ default: m.FuturosPlayer })),
  { ssr: false }
);
```

- [ ] **Step 2: Add showText state and effect inside ModulePage**

Inside the `ModulePage` function, after the existing state declarations (`const theme = ...`, `const scenarios = ...`), add:

```ts
  const hasFuturosHero = themeId === "futuros";

  const [showText, setShowText] = useState(!hasFuturosHero);

  useEffect(() => {
    if (!hasFuturosHero) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) {
      setShowText(true);
      return;
    }
    const timer = setTimeout(() => setShowText(true), 5000);
    return () => clearTimeout(timer);
  }, [hasFuturosHero]);
```

- [ ] **Step 3: Add the hero section JSX**

Replace the existing `<header>` block (lines 87–105 of module-page.tsx):

```tsx
        <header className="mb-12 relative">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-primary font-semibold hover:opacity-70 transition-opacity cursor-pointer"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="uppercase tracking-widest text-xs">{strings.backToModules}</span>
            </button>
          </div>
          <div className="max-w-3xl">
            <h1 className="font-heading text-5xl font-extrabold tracking-tight text-primary mb-4 leading-none">
              {theme?.label}
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              {theme?.description}
            </p>
          </div>
        </header>
```

With this conditional rendering that wraps the hero section and the existing header:

```tsx
        {hasFuturosHero ? (
          <section className="relative w-screen -ml-[calc((100vw-100%)/2)] min-h-[500px] lg:min-h-[600px] overflow-hidden bg-[#0a1628] mb-12">
            {/* Animation layer — desktop only */}
            <div className="absolute inset-0 hidden lg:block">
              <FuturosPlayer />
            </div>

            {/* Gradient mask — dims animation under text */}
            <div
              className="absolute inset-0 z-[5] hidden lg:block pointer-events-none"
              style={{
                background:
                  "linear-gradient(to right, #0a1628 0%, #0a1628 18%, rgba(10,22,40,0.85) 28%, transparent 48%)",
              }}
            />

            {/* Mobile gradient background */}
            <div
              className="absolute inset-0 lg:hidden"
              style={{
                background:
                  "linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%)",
              }}
            />

            {/* Text content */}
            <div className="relative z-10 flex items-center min-h-[500px] lg:min-h-[600px] px-8 lg:px-16">
              <div
                className="max-w-xl space-y-8 lg:w-[40%]"
                style={{
                  opacity: showText ? 1 : 0,
                  transition: "opacity 1s ease-in-out",
                }}
              >
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2 text-[#8df5e4] font-semibold hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  <span className="uppercase tracking-widest text-xs">{strings.backToModules}</span>
                </button>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-[#e8eaed] leading-[1.1] tracking-tight">
                  <span className="text-[#8df5e4]">{strings.futurosHeroTitle}</span>
                </h1>
                <p className="text-lg lg:text-xl text-[rgba(232,234,237,0.55)] max-w-xl leading-relaxed">
                  {strings.futurosHeroSubtitle}
                </p>
              </div>
            </div>
          </section>
        ) : (
          <header className="mb-12 relative">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-primary font-semibold hover:opacity-70 transition-opacity cursor-pointer"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="uppercase tracking-widest text-xs">{strings.backToModules}</span>
              </button>
            </div>
            <div className="max-w-3xl">
              <h1 className="font-heading text-5xl font-extrabold tracking-tight text-primary mb-4 leading-none">
                {theme?.label}
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                {theme?.description}
              </p>
            </div>
          </header>
        )}
```

- [ ] **Step 4: Verify the build compiles**

Run: `npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/module-page.tsx
git commit -m "feat(futuros): integrate hero animation into ModulePage"
```

---

### Task 10: Visual verification and final commit

- [ ] **Step 1: Start dev server and verify**

Run: `npm run dev`

Open `http://localhost:3000/futuros` in the browser (desktop viewport).

Verify:
1. Hero section fills full viewport width with dark background (#0a1628)
2. Price grid lines (horizontal) fade in with rate labels on the right
3. Amber dashed settlement path appears with dots, blurred, drifting left
4. Green/red daily adjustment bars animate left-to-right with spring physics
5. Futures ticker tape scrolls at top (DI1F26, DOL F26, IND F26, etc.)
6. Floating amber R$ values fade in/out at low opacity
7. Text ("Futuros" in teal, subtitle below) fades in after ~5 seconds
8. Back button works (navigates to /)
9. Scenario cards grid appears below the hero section
10. On mobile viewport: animation hidden, text shows immediately on gradient

- [ ] **Step 2: Verify other module pages are unaffected**

Open `http://localhost:3000/termos` — should show the existing plain header, no animation.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: No new lint errors.

- [ ] **Step 4: Final build verification**

Run: `npm run build`

Expected: Build succeeds.

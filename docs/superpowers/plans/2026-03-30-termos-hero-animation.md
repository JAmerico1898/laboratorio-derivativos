# Termos (NDF) Hero Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an FX trading desk Remotion animation to the Módulo 1 (Termos/NDF) opening page, replacing the plain header with a full-width animated hero.

**Architecture:** 4-layer parallax Remotion composition (grid, blurred rate bars, forward curve, floating FX elements) rendered via `@remotion/player` in a full-width hero section. The `ModulePage` component gains an optional `heroPlayer` prop; when present it renders a hero section above the scenario cards. The `BackgroundGrid` layer is reused from the landing page animation with a configurable SVG pattern ID.

**Tech Stack:** Remotion (useCurrentFrame, interpolate, spring, Sequence, AbsoluteFill), @remotion/player, Next.js dynamic import, React, TypeScript, SVG.

**Spec:** `docs/superpowers/specs/2026-03-30-termos-hero-animation-design.md`

---

### Task 1: Add `patternId` prop to BackgroundGrid for reuse

The existing `BackgroundGrid` hardcodes SVG pattern ID `"hero-grid"`. We need it configurable so the termos animation can mount alongside the landing page without ID collisions.

**Files:**
- Modify: `src/components/remotion/layers/BackgroundGrid.tsx`
- Modify: `src/components/remotion/HeroAnimation.tsx` (pass patternId)

- [ ] **Step 1: Add optional `patternId` prop to BackgroundGrid**

```tsx
// src/components/remotion/layers/BackgroundGrid.tsx
// Change the component signature and pattern ID usage:

export const BackgroundGrid: React.FC<{ patternId?: string }> = ({ patternId = "hero-grid" }) => {
  // ... existing code unchanged, but replace the hardcoded "hero-grid" string:
  // In <pattern id="hero-grid" ...>  →  <pattern id={patternId} ...>
  // In <rect fill="url(#hero-grid)" ...>  →  <rect fill={`url(#${patternId})`} ...>
```

In `BackgroundGrid.tsx`, change line 1 area:
```tsx
export const BackgroundGrid: React.FC<{ patternId?: string }> = ({ patternId = "hero-grid" }) => {
```

Change the `<pattern>` element's `id` attribute from `"hero-grid"` to `{patternId}`.

Change the `<rect>` element's `fill` attribute from `"url(#hero-grid)"` to `` {`url(#${patternId})`} ``.

- [ ] **Step 2: Verify HeroAnimation still works**

`HeroAnimation.tsx` passes no prop, so `BackgroundGrid` defaults to `"hero-grid"` — no change needed there.

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/remotion/layers/BackgroundGrid.tsx
git commit -m "refactor: make BackgroundGrid patternId configurable for reuse"
```

---

### Task 2: Create termos animation data file

**Files:**
- Create: `src/components/remotion/termos/data.ts`

- [ ] **Step 1: Create the data file with NDF-specific data**

```ts
// src/components/remotion/termos/data.ts

export type NdfRate = {
  tenor: string;
  rate: number;
};

export type NdfTicker = {
  symbol: string;
  price: string;
  change: string;
  positive: boolean;
};

export type NdfFloatingNumber = {
  value: string;
  x: number;
  y: number;
  fontSize: number;
  cycleOffset: number;
  driftX: number;
  driftY: number;
};

// Forward curve data points — ascending term structure for USDBRL NDF
export const NDF_RATES: NdfRate[] = [
  { tenor: "Spot", rate: 5.12 },
  { tenor: "1M", rate: 5.18 },
  { tenor: "3M", rate: 5.25 },
  { tenor: "6M", rate: 5.35 },
  { tenor: "12M", rate: 5.48 },
];

// Mid-ground bar heights (normalized 0–1 based on rate range 5.0–5.6)
export const NDF_MID_BARS = NDF_RATES.map((r) => ({
  tenor: r.tenor,
  height: (r.rate - 5.0) / 0.6, // normalize to 0–1 range
}));

export const NDF_TICKERS: NdfTicker[] = [
  { symbol: "USDBRL", price: "5.12", change: "0.4%", positive: true },
  { symbol: "EURBRL", price: "5.58", change: "0.2%", positive: false },
  { symbol: "NDF 1M", price: "5.18", change: "0.1%", positive: true },
  { symbol: "NDF 3M", price: "5.25", change: "0.2%", positive: true },
  { symbol: "CUPOM CDI", price: "11.75%", change: "", positive: true },
  { symbol: "PTAX", price: "5.11", change: "0.1%", positive: false },
  { symbol: "CASADO", price: "28.5", change: "0.3%", positive: true },
];

export const NDF_FLOATING_NUMBERS: NdfFloatingNumber[] = [
  { value: "5.12", x: 0.72, y: 0.14, fontSize: 22, cycleOffset: 0, driftX: 0, driftY: -0.3 },
  { value: "5.25", x: 0.62, y: 0.28, fontSize: 28, cycleOffset: 40, driftX: -0.2, driftY: 0 },
  { value: "11.75%", x: 0.78, y: 0.62, fontSize: 16, cycleOffset: 80, driftX: 0.1, driftY: -0.2 },
  { value: "5.48", x: 0.84, y: 0.42, fontSize: 18, cycleOffset: 120, driftX: -0.3, driftY: 0.1 },
  { value: "▼ 0.2%", x: 0.55, y: 0.20, fontSize: 14, cycleOffset: 160, driftX: 0.2, driftY: -0.1 },
  { value: "PTAX 5.11", x: 0.68, y: 0.52, fontSize: 20, cycleOffset: 200, driftX: -0.1, driftY: -0.2 },
];
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds (file is created but not yet imported anywhere).

- [ ] **Step 3: Commit**

```bash
git add src/components/remotion/termos/data.ts
git commit -m "feat: add NDF forward curve and FX ticker data for termos animation"
```

---

### Task 3: Create MidgroundBars layer

**Files:**
- Create: `src/components/remotion/termos/layers/MidgroundBars.tsx`

- [ ] **Step 1: Create the MidgroundBars component**

This component renders 5 large blurred vertical bars representing NDF maturity rate levels. Pattern follows `src/components/remotion/layers/MidgroundCandles.tsx` but uses teal-colored bars instead of bullish/bearish candles.

```tsx
// src/components/remotion/termos/layers/MidgroundBars.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { NDF_MID_BARS } from "../data";

const CHART_HEIGHT = 450;
const BAR_WIDTH = 40;
const GAP = 50;
const START_X = 650;
const COLOR_TEAL = "#8df5e4";

const RateBar: React.FC<{
  height: number;
  x: number;
  chartHeight: number;
}> = ({ height, x, chartHeight }) => {
  const barHeight = height * chartHeight * 0.7;
  const y = chartHeight - barHeight;

  return (
    <rect
      x={x}
      y={y}
      width={BAR_WIDTH}
      height={barHeight}
      fill={COLOR_TEAL}
      rx={4}
    />
  );
};

export const MidgroundBars: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = spring({
    frame,
    fps,
    delay: 20,
    config: { damping: 200 },
  });
  const opacity = fadeIn * 0.35;

  const loopResetProgress = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rawDrift = frame * 0.4;
  const drift = rawDrift * (frame < durationInFrames - 1 * fps ? 1 : loopResetProgress);

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
        <g transform={`translate(0, ${(700 - CHART_HEIGHT) / 2})`}>
          {NDF_MID_BARS.map((bar, i) => {
            const staggeredScale = spring({
              frame,
              fps,
              delay: 20 + i * 10,
              config: { damping: 200 },
            });
            const x = START_X + i * (BAR_WIDTH + GAP);
            return (
              <g
                key={i}
                style={{
                  transform: `scaleY(${staggeredScale})`,
                  transformOrigin: `${x + BAR_WIDTH / 2}px ${CHART_HEIGHT}px`,
                }}
              >
                <RateBar
                  height={bar.height}
                  x={x}
                  chartHeight={CHART_HEIGHT}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/remotion/termos/layers/MidgroundBars.tsx
git commit -m "feat: add MidgroundBars layer for termos animation"
```

---

### Task 4: Create ForwardCurve layer

**Files:**
- Create: `src/components/remotion/termos/layers/ForwardCurve.tsx`

- [ ] **Step 1: Create the ForwardCurve component**

This is the visual anchor layer — an animated SVG line chart showing the NDF forward curve building point-by-point. Pattern follows `src/components/remotion/layers/ForegroundCandles.tsx` for spring animation and loop fade.

```tsx
// src/components/remotion/termos/layers/ForwardCurve.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { NDF_RATES } from "../data";

const CHART_WIDTH = 600;
const CHART_HEIGHT = 350;
const OFFSET_X = (1920 - CHART_WIDTH) / 2 + 200;
const OFFSET_Y = (700 - CHART_HEIGHT) / 2;

const RATE_MIN = 5.0;
const RATE_MAX = 5.6;

const COLOR_TEAL = "#8df5e4";
const COLOR_SPOT = "rgba(0, 200, 83, 0.4)";
const COLOR_AXIS = "rgba(141, 245, 228, 0.15)";
const COLOR_LABEL = "rgba(141, 245, 228, 0.5)";

function rateToY(rate: number): number {
  return CHART_HEIGHT - ((rate - RATE_MIN) / (RATE_MAX - RATE_MIN)) * CHART_HEIGHT;
}

function tenorToX(index: number): number {
  return (index / (NDF_RATES.length - 1)) * CHART_WIDTH;
}

const DataPoint: React.FC<{
  rate: typeof NDF_RATES[number];
  index: number;
}> = ({ rate, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 60 + index * 12;
  const progress = spring({
    frame,
    fps,
    delay,
    config: { damping: 20, stiffness: 200 },
  });

  const cx = tenorToX(index);
  const cy = rateToY(rate.rate);

  return (
    <g opacity={progress}>
      {/* Data point circle */}
      <circle
        cx={cx}
        cy={cy}
        r={5 * progress}
        fill={COLOR_TEAL}
      />
      {/* Rate label above */}
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fill={COLOR_TEAL}
        fontSize={12}
        fontFamily="monospace"
        opacity={0.8}
      >
        {rate.rate.toFixed(2)}
      </text>
      {/* Tenor label below axis */}
      <text
        x={cx}
        y={CHART_HEIGHT + 20}
        textAnchor="middle"
        fill={COLOR_LABEL}
        fontSize={11}
        fontFamily="monospace"
      >
        {rate.tenor}
      </text>
    </g>
  );
};

export const ForwardCurve: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Loop fade
  const loopFade = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Spot reference line — draws from left to right (frames 40-60)
  const spotLineProgress = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spotY = rateToY(NDF_RATES[0].rate);

  // Curve path — build as SVG path string
  const pathPoints = NDF_RATES.map((r, i) => {
    const x = tenorToX(i);
    const y = rateToY(r.rate);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  // Curve draw progress — synchronized with data points
  // Total path length is approximate; we use a large value and strokeDasharray
  const PATH_LENGTH = 800;
  const curveProgress = interpolate(
    frame,
    [60, 60 + (NDF_RATES.length - 1) * 12 + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: loopFade }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 700"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(${OFFSET_X}, ${OFFSET_Y})`}>
          {/* Y-axis */}
          <line
            x1={-10}
            y1={0}
            x2={-10}
            y2={CHART_HEIGHT}
            stroke={COLOR_AXIS}
            strokeWidth={1}
          />
          {/* X-axis */}
          <line
            x1={-10}
            y1={CHART_HEIGHT}
            x2={CHART_WIDTH + 10}
            y2={CHART_HEIGHT}
            stroke={COLOR_AXIS}
            strokeWidth={1}
          />

          {/* Spot reference dashed line */}
          <line
            x1={0}
            y1={spotY}
            x2={CHART_WIDTH * spotLineProgress}
            y2={spotY}
            stroke={COLOR_SPOT}
            strokeWidth={1}
            strokeDasharray="6,4"
          />
          {spotLineProgress > 0.5 && (
            <text
              x={CHART_WIDTH + 15}
              y={spotY + 4}
              fill={COLOR_SPOT}
              fontSize={10}
              fontFamily="monospace"
              opacity={spotLineProgress}
            >
              Spot
            </text>
          )}

          {/* Curve path */}
          <path
            d={pathPoints}
            fill="none"
            stroke={COLOR_TEAL}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={PATH_LENGTH}
            strokeDashoffset={PATH_LENGTH * (1 - curveProgress)}
          />

          {/* Data points */}
          {NDF_RATES.map((rate, i) => (
            <DataPoint key={i} rate={rate} index={i} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/remotion/termos/layers/ForwardCurve.tsx
git commit -m "feat: add ForwardCurve layer for termos animation"
```

---

### Task 5: Create termos FloatingElements layer

**Files:**
- Create: `src/components/remotion/termos/layers/FloatingElements.tsx`

- [ ] **Step 1: Create the FloatingElements component**

Pattern follows `src/components/remotion/layers/FloatingElements.tsx` exactly, but uses NDF-specific ticker and floating number data.

```tsx
// src/components/remotion/termos/layers/FloatingElements.tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { NDF_TICKERS, NDF_FLOATING_NUMBERS } from "../data";

const TICKER_CYCLE_DURATION = 60;
const COLOR_TEAL = "#8df5e4";

const TickerTape: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
        {/* Duplicate for seamless scroll */}
        {[...NDF_TICKERS, ...NDF_TICKERS].map((ticker, i) => {
          const arrowColor = ticker.positive
            ? "rgba(0, 200, 83, 0.6)"
            : "rgba(255, 23, 68, 0.6)";
          return (
            <span key={i} style={{ marginRight: 24 }}>
              <span style={{ color: "rgba(141, 245, 228, 0.35)" }}>
                {ticker.symbol} {ticker.price}{" "}
              </span>
              {ticker.change && (
                <span style={{ color: arrowColor }}>
                  {ticker.positive ? "▲" : "▼"}{ticker.change}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const FloatingNumber: React.FC<{
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

  const cycleFrame = (frame + cycleOffset) % (TICKER_CYCLE_DURATION * 2);
  const cycleOpacity = interpolate(
    cycleFrame,
    [0, TICKER_CYCLE_DURATION * 0.3, TICKER_CYCLE_DURATION, TICKER_CYCLE_DURATION * 1.3, TICKER_CYCLE_DURATION * 2],
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
        color: COLOR_TEAL,
        opacity: fadeIn * cycleOpacity * 0.25,
        pointerEvents: "none",
      }}
    >
      {value}
    </div>
  );
};

export const FloatingElements: React.FC = () => {
  return (
    <AbsoluteFill>
      <TickerTape />
      {NDF_FLOATING_NUMBERS.map((num, i) => (
        <FloatingNumber key={i} {...num} />
      ))}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/remotion/termos/layers/FloatingElements.tsx
git commit -m "feat: add FloatingElements layer for termos animation"
```

---

### Task 6: Create TermosAnimation composition and TermosPlayer

**Files:**
- Create: `src/components/remotion/termos/TermosAnimation.tsx`
- Create: `src/components/remotion/termos/TermosPlayer.tsx`

- [ ] **Step 1: Create TermosAnimation composition**

Pattern follows `src/components/remotion/HeroAnimation.tsx`.

```tsx
// src/components/remotion/termos/TermosAnimation.tsx
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { BackgroundGrid } from "../layers/BackgroundGrid";
import { MidgroundBars } from "./layers/MidgroundBars";
import { ForwardCurve } from "./layers/ForwardCurve";
import { FloatingElements } from "./layers/FloatingElements";

const COLOR_BG = "#0a1628";

export const TermosAnimation: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR_BG }}>
      {/* Layer 1: Background Grid (reused with unique pattern ID) */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={0}>
        <BackgroundGrid patternId="termos-grid" />
      </Sequence>

      {/* Layer 2: Mid-ground blurred rate bars */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <MidgroundBars />
      </Sequence>

      {/* Layer 3: Foreground forward curve */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <ForwardCurve />
      </Sequence>

      {/* Layer 4: Floating FX tickers + numbers */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <FloatingElements />
      </Sequence>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Create TermosPlayer wrapper**

Pattern follows `src/components/remotion/HeroPlayer.tsx`.

```tsx
// src/components/remotion/termos/TermosPlayer.tsx
"use client";

import { Player } from "@remotion/player";
import { TermosAnimation } from "./TermosAnimation";

const COMPOSITION_WIDTH = 1920;
const COMPOSITION_HEIGHT = 700;
const FPS = 30;
const DURATION_IN_FRAMES = 300;

export const TermosPlayer: React.FC = () => {
  return (
    <Player
      component={TermosAnimation}
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

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/remotion/termos/TermosAnimation.tsx src/components/remotion/termos/TermosPlayer.tsx
git commit -m "feat: add TermosAnimation composition and TermosPlayer wrapper"
```

---

### Task 7: Add hero section to ModulePage

**Files:**
- Modify: `src/components/landing/module-page.tsx`

- [ ] **Step 1: Add `heroPlayer` prop and hero section to ModulePage**

The `ModulePage` component gains an optional `heroPlayer` prop. When present, it renders a full-width hero section (same pattern as `src/components/landing/dashboard-page.tsx` hero) above the scenario cards. When absent, the existing header renders unchanged.

In `src/components/landing/module-page.tsx`:

Add `heroPlayer` to the props interface:

```tsx
interface ModulePageProps {
  themeId: string;
  heroPlayer?: React.ReactNode;
}
```

Update the component signature:

```tsx
export function ModulePage({ themeId, heroPlayer }: ModulePageProps) {
```

Add state and effect for text reveal (place after the existing `useState` calls, near the top of the component):

```tsx
const [showHeroText, setShowHeroText] = useState(false);

useEffect(() => {
  if (!heroPlayer) return;
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  if (!isDesktop) {
    setShowHeroText(true);
    return;
  }
  const timer = setTimeout(() => setShowHeroText(true), 5000);
  return () => clearTimeout(timer);
}, [heroPlayer]);
```

Add `useEffect` to the imports from React:

```tsx
import { useState, useEffect } from 'react';
```

Replace the `return` block. When `heroPlayer` is present, render the hero section before the existing `<main>`. When absent, keep the existing layout unchanged.

The full return becomes:

```tsx
return (
  <div className="bg-surface text-on-surface font-sans antialiased min-h-screen">
    {/* Visual Polish: Background Gradients */}
    <div className="fixed top-0 left-0 -z-10 w-full h-full pointer-events-none overflow-hidden">
      <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/5 blur-[100px] rounded-full" />
    </div>

    {heroPlayer ? (
      <>
        {/* ── Hero Section with Animation ── */}
        <section className="relative w-screen -ml-[calc((100vw-100%)/2)] min-h-[500px] lg:min-h-[600px] overflow-hidden bg-[#0a1628]">
          {/* Animation layer — desktop only */}
          <div className="absolute inset-0 hidden lg:block">
            {heroPlayer}
          </div>

          {/* Gradient mask — dims animation under text */}
          <div
            className="absolute inset-0 z-[5] hidden lg:block pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, #0a1628 0%, #0a1628 20%, rgba(10,22,40,0.85) 30%, transparent 50%)",
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
              className="max-w-xl space-y-6 lg:w-[35%]"
              style={{
                opacity: showHeroText ? 1 : 0,
                transition: "opacity 1s ease-in-out",
              }}
            >
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-[rgba(141,245,228,0.7)] font-semibold hover:opacity-70 transition-opacity cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span className="uppercase tracking-widest text-xs">{strings.backToModules}</span>
              </button>
              <div className="space-y-4">
                <span className="text-[rgba(141,245,228,0.6)] text-xs font-bold uppercase tracking-[3px]">
                  Módulo 1
                </span>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-[#e8eaed] leading-[1.1] tracking-tight">
                  {theme?.label}
                </h1>
                <p className="text-lg lg:text-xl text-[rgba(232,234,237,0.55)] max-w-xl leading-relaxed">
                  {theme?.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Scenario Cards Grid — below hero */}
        <main className="py-16 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarios.map((scenario) => {
              const completion = getCompletionForScenario(scenario.id);
              const isCompleted = !!completion;
              const styles = getDifficultyStyles(scenario.difficulty);
              const isSuperDesafio = scenario.difficulty === 'Super Desafio';
              const isIntermediario = scenario.difficulty === 'Intermediário';

              return (
                <div
                  key={scenario.id}
                  onClick={() => setActiveScenario(scenario)}
                  className={`rounded-xl p-8 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[320px] cursor-pointer ${styles.card}`}
                >
                  {!isSuperDesafio && (
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                        {scenario.difficulty}
                      </span>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <span className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full text-[10px] font-bold">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {completion.score}/{completion.totalScore}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className={`font-heading text-2xl font-bold mb-4 ${styles.title}`}>
                      {scenario.title}
                    </h3>
                    <p className={`leading-relaxed ${styles.narrative}`}>
                      {scenario.context.narrative.replace(/\*\*/g, '')}
                    </p>
                  </div>
                  {isIntermediario ? (
                    <button className={`mt-8 w-fit px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors active:scale-95 cursor-pointer ${styles.cta}`}>
                      {strings.startScenario}
                      <span className="material-symbols-outlined text-sm">trending_flat</span>
                    </button>
                  ) : (
                    <div className={`mt-8 flex items-center justify-between font-bold text-sm group-hover:translate-x-1 transition-transform cursor-pointer ${styles.cta}`}>
                      <span>{strings.startScenario}</span>
                      <span className="material-symbols-outlined">chevron_right</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </>
    ) : (
      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header Section — original layout when no hero */}
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

        {/* Scenario Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((scenario) => {
            const completion = getCompletionForScenario(scenario.id);
            const isCompleted = !!completion;
            const styles = getDifficultyStyles(scenario.difficulty);
            const isSuperDesafio = scenario.difficulty === 'Super Desafio';
            const isIntermediario = scenario.difficulty === 'Intermediário';

            return (
              <div
                key={scenario.id}
                onClick={() => setActiveScenario(scenario)}
                className={`rounded-xl p-8 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[320px] cursor-pointer ${styles.card}`}
              >
                {!isSuperDesafio && (
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
                )}
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                      {scenario.difficulty}
                    </span>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <span className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-full text-[10px] font-bold">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          {completion.score}/{completion.totalScore}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className={`font-heading text-2xl font-bold mb-4 ${styles.title}`}>
                    {scenario.title}
                  </h3>
                  <p className={`leading-relaxed ${styles.narrative}`}>
                    {scenario.context.narrative.replace(/\*\*/g, '')}
                  </p>
                </div>
                {isIntermediario ? (
                  <button className={`mt-8 w-fit px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors active:scale-95 cursor-pointer ${styles.cta}`}>
                    {strings.startScenario}
                    <span className="material-symbols-outlined text-sm">trending_flat</span>
                  </button>
                ) : (
                  <div className={`mt-8 flex items-center justify-between font-bold text-sm group-hover:translate-x-1 transition-transform cursor-pointer ${styles.cta}`}>
                    <span>{strings.startScenario}</span>
                    <span className="material-symbols-outlined">chevron_right</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    )}
  </div>
);
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds. Other module pages (futuros, swaps, etc.) still work — they pass no `heroPlayer` prop.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/module-page.tsx
git commit -m "feat: add optional heroPlayer prop to ModulePage for animated hero sections"
```

---

### Task 8: Wire up TermosPlayer in the termos page

**Files:**
- Modify: `src/app/termos/page.tsx`

- [ ] **Step 1: Update termos page to pass TermosPlayer as heroPlayer**

```tsx
// src/app/termos/page.tsx
import dynamic from "next/dynamic";
import { ModulePage } from '@/components/landing/module-page';

const TermosPlayer = dynamic(
  () => import("@/components/remotion/termos/TermosPlayer").then((m) => ({ default: m.TermosPlayer })),
  { ssr: false }
);

export default function TermosPage() {
  return <ModulePage themeId="ndf" heroPlayer={<TermosPlayer />} />;
}
```

- [ ] **Step 2: Verify build and test**

Run: `npm run build`
Expected: Build succeeds.

Run: `npm run dev`
Navigate to `http://localhost:3000/termos`
Expected: Full-width hero with FX animation on desktop. Back button, "MÓDULO 1" label, "Termos (NDF)" title, and description fade in after 5 seconds. Scenario cards below. On mobile viewport, animation hidden, text shows immediately.

Navigate to `http://localhost:3000/` (landing page)
Expected: Landing page hero animation unchanged.

Navigate to `http://localhost:3000/futuros` (another module)
Expected: Original plain header layout, no hero animation.

- [ ] **Step 3: Commit**

```bash
git add src/app/termos/page.tsx
git commit -m "feat: integrate TermosPlayer into Módulo 1 opening page"
```

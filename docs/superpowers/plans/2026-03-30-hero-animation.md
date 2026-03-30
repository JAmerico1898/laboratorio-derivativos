# Hero Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static hero image with a live layered parallax candlestick animation using Remotion Player.

**Architecture:** A `<Player>` from `@remotion/player` renders a Remotion composition with 4 depth layers (background grid, mid-ground blurred candles, foreground sharp candles, floating ticker/numbers). The Player fills the hero section background. Text overlays on the left with a gradient mask, fading in at 7 seconds via React state. Mobile hides the animation and shows text immediately.

**Tech Stack:** Remotion (`remotion` + `@remotion/player`), React 19, Next.js 16, Tailwind CSS 4, TypeScript.

**Spec:** `docs/superpowers/specs/2026-03-30-hero-animation-design.md`

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/remotion/data.ts` | Hardcoded OHLC candle data + ticker entries |
| Create | `src/components/remotion/layers/BackgroundGrid.tsx` | Layer 1: grid lines fade-in + upward drift |
| Create | `src/components/remotion/layers/MidgroundCandles.tsx` | Layer 2: blurred large candles with leftward drift |
| Create | `src/components/remotion/layers/ForegroundCandles.tsx` | Layer 3: sharp candles building bar-by-bar |
| Create | `src/components/remotion/layers/FloatingElements.tsx` | Layer 4: ticker tape + floating price numbers |
| Create | `src/components/remotion/HeroAnimation.tsx` | Main composition — AbsoluteFill with 4 Sequence layers |
| Create | `src/components/remotion/HeroPlayer.tsx` | "use client" wrapper with @remotion/player |
| Modify | `src/components/landing/dashboard-page.tsx` | Replace hero section with animation + text overlay |

---

### Task 1: Install Remotion Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install remotion and @remotion/player**

Run:
```bash
npm install remotion @remotion/player
```

- [ ] **Step 2: Verify installation**

Run:
```bash
node -e "require('remotion'); require('@remotion/player'); console.log('OK')"
```
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install remotion and @remotion/player dependencies"
```

---

### Task 2: Create Candlestick & Ticker Data

**Files:**
- Create: `src/components/remotion/data.ts`

- [ ] **Step 1: Create the data file with types and hardcoded data**

Create `src/components/remotion/data.ts`:

```ts
export type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
};

export type TickerEntry = {
  symbol: string;
  price: string;
  change: string;
  positive: boolean;
};

export type FloatingNumber = {
  value: string;
  x: number;
  y: number;
  fontSize: number;
  cycleOffset: number;
  driftX: number;
  driftY: number;
};

// Normalized 0–1 values for SVG scaling. Pattern: uptrend with pullbacks.
export const CANDLES: Candle[] = [
  { open: 0.30, high: 0.45, low: 0.25, close: 0.42 },
  { open: 0.42, high: 0.50, low: 0.38, close: 0.35 },
  { open: 0.35, high: 0.55, low: 0.32, close: 0.52 },
  { open: 0.52, high: 0.58, low: 0.48, close: 0.50 },
  { open: 0.50, high: 0.62, low: 0.47, close: 0.60 },
  { open: 0.60, high: 0.65, low: 0.52, close: 0.54 },
  { open: 0.54, high: 0.68, low: 0.50, close: 0.66 },
  { open: 0.66, high: 0.72, low: 0.60, close: 0.62 },
  { open: 0.62, high: 0.75, low: 0.58, close: 0.73 },
  { open: 0.73, high: 0.78, low: 0.65, close: 0.68 },
  { open: 0.68, high: 0.80, low: 0.64, close: 0.78 },
  { open: 0.78, high: 0.82, low: 0.70, close: 0.72 },
  { open: 0.72, high: 0.85, low: 0.68, close: 0.83 },
  { open: 0.83, high: 0.88, low: 0.75, close: 0.77 },
  { open: 0.77, high: 0.90, low: 0.74, close: 0.88 },
  { open: 0.88, high: 0.92, low: 0.80, close: 0.82 },
  { open: 0.82, high: 0.93, low: 0.78, close: 0.91 },
  { open: 0.91, high: 0.95, low: 0.84, close: 0.86 },
  { open: 0.86, high: 0.96, low: 0.82, close: 0.94 },
  { open: 0.94, high: 0.98, low: 0.88, close: 0.90 },
];

// Subset for mid-ground blurred layer — fewer, larger bars.
export const MID_CANDLES: Candle[] = [
  { open: 0.25, high: 0.55, low: 0.20, close: 0.50 },
  { open: 0.50, high: 0.60, low: 0.35, close: 0.38 },
  { open: 0.38, high: 0.70, low: 0.30, close: 0.65 },
  { open: 0.65, high: 0.80, low: 0.55, close: 0.58 },
  { open: 0.58, high: 0.85, low: 0.50, close: 0.82 },
];

export const TICKERS: TickerEntry[] = [
  { symbol: "PETR4", price: "42.15", change: "2.3%", positive: true },
  { symbol: "VALE3", price: "58.90", change: "0.8%", positive: false },
  { symbol: "USDBRL", price: "5.12", change: "0.4%", positive: true },
  { symbol: "DI1F26", price: "13.25%", change: "0.1%", positive: true },
  { symbol: "IBOV", price: "128,450", change: "1.2%", positive: true },
  { symbol: "ITUB4", price: "32.80", change: "0.3%", positive: false },
  { symbol: "BBDC4", price: "14.55", change: "0.6%", positive: true },
];

export const FLOATING_NUMBERS: FloatingNumber[] = [
  { value: "42.15", x: 0.75, y: 0.12, fontSize: 22, cycleOffset: 0, driftX: 0, driftY: -0.3 },
  { value: "5.12", x: 0.65, y: 0.25, fontSize: 28, cycleOffset: 40, driftX: -0.2, driftY: 0 },
  { value: "13.25%", x: 0.80, y: 0.65, fontSize: 16, cycleOffset: 80, driftX: 0.1, driftY: -0.2 },
  { value: "128,450", x: 0.85, y: 0.40, fontSize: 18, cycleOffset: 120, driftX: -0.3, driftY: 0.1 },
  { value: "▼ 0.8%", x: 0.55, y: 0.18, fontSize: 14, cycleOffset: 160, driftX: 0.2, driftY: -0.1 },
  { value: "58.90", x: 0.70, y: 0.50, fontSize: 20, cycleOffset: 200, driftX: -0.1, driftY: -0.2 },
];

// Colors
export const COLOR_BG = "#0a1628";
export const COLOR_TEAL = "#8df5e4";
export const COLOR_BULLISH = "#00c853";
export const COLOR_BEARISH = "#ff1744";
```

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/data.ts
git commit -m "feat: add candlestick and ticker data for hero animation"
```

---

### Task 3: Create BackgroundGrid Layer

**Files:**
- Create: `src/components/remotion/layers/BackgroundGrid.tsx`

- [ ] **Step 1: Create the BackgroundGrid component**

Create `src/components/remotion/layers/BackgroundGrid.tsx`:

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR_TEAL } from "../data";

export const BackgroundGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in over 1 second
  const opacity = interpolate(frame, [0, 1 * fps], [0, 0.08], {
    extrapolateRight: "clamp",
  });

  // Slow upward drift, with smooth reset for looping
  const loopResetProgress = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rawDrift = frame * 0.2;
  const drift = rawDrift * (frame < durationInFrames - 1 * fps ? 1 : loopResetProgress);

  const gridColor = `rgba(141, 245, 228, 0.4)`;
  const gridSize = 30;

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(-${drift % gridSize}px)`,
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="hero-grid"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <line x1={gridSize} y1="0" x2={gridSize} y2={gridSize} stroke={gridColor} strokeWidth="0.5" />
            <line x1="0" y1={gridSize} x2={gridSize} y2={gridSize} stroke={gridColor} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="200%" fill="url(#hero-grid)" />
      </svg>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/layers/BackgroundGrid.tsx
git commit -m "feat: add BackgroundGrid layer for hero animation"
```

---

### Task 4: Create MidgroundCandles Layer

**Files:**
- Create: `src/components/remotion/layers/MidgroundCandles.tsx`

- [ ] **Step 1: Create the MidgroundCandles component**

Create `src/components/remotion/layers/MidgroundCandles.tsx`:

```tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MID_CANDLES, COLOR_BULLISH, COLOR_BEARISH } from "../data";
import type { Candle } from "../data";

const CandleBar: React.FC<{
  candle: Candle;
  x: number;
  chartHeight: number;
  barWidth: number;
}> = ({ candle, x, chartHeight, barWidth }) => {
  const isBullish = candle.close > candle.open;
  const color = isBullish ? COLOR_BULLISH : COLOR_BEARISH;

  const bodyTop = (1 - Math.max(candle.open, candle.close)) * chartHeight;
  const bodyBottom = (1 - Math.min(candle.open, candle.close)) * chartHeight;
  const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
  const wickTop = (1 - candle.high) * chartHeight;
  const wickBottom = (1 - candle.low) * chartHeight;
  const wickX = x + barWidth / 2;

  return (
    <g>
      <line
        x1={wickX}
        y1={wickTop}
        x2={wickX}
        y2={wickBottom}
        stroke={color}
        strokeWidth={2}
      />
      <rect
        x={x}
        y={bodyTop}
        width={barWidth}
        height={bodyHeight}
        fill={color}
        rx={3}
      />
    </g>
  );
};

export const MidgroundCandles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Overall fade-in via spring
  const fadeIn = spring({
    frame,
    fps,
    delay: 20,
    config: { damping: 200 },
  });
  const opacity = fadeIn * 0.25;

  // Leftward drift with smooth loop reset
  const loopResetProgress = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rawDrift = frame * 0.5;
  const drift = rawDrift * (frame < durationInFrames - 1 * fps ? 1 : loopResetProgress);

  const chartHeight = 500;
  const barWidth = 28;
  const gap = 30;
  const startX = 600;

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
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(0, ${(800 - chartHeight) / 2})`}>
          {MID_CANDLES.map((candle, i) => {
            const staggeredScale = spring({
              frame,
              fps,
              delay: 20 + i * 10,
              config: { damping: 200 },
            });
            return (
              <g
                key={i}
                style={{
                  transform: `scaleY(${staggeredScale})`,
                  transformOrigin: `${startX + i * (barWidth + gap) + barWidth / 2}px ${chartHeight}px`,
                }}
              >
                <CandleBar
                  candle={candle}
                  x={startX + i * (barWidth + gap)}
                  chartHeight={chartHeight}
                  barWidth={barWidth}
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

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/layers/MidgroundCandles.tsx
git commit -m "feat: add MidgroundCandles layer for hero animation"
```

---

### Task 5: Create ForegroundCandles Layer

**Files:**
- Create: `src/components/remotion/layers/ForegroundCandles.tsx`

- [ ] **Step 1: Create the ForegroundCandles component**

Create `src/components/remotion/layers/ForegroundCandles.tsx`:

```tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CANDLES, COLOR_BULLISH, COLOR_BEARISH } from "../data";
import type { Candle } from "../data";

const STAGGER_DELAY = 5;

const AnimatedCandle: React.FC<{
  candle: Candle;
  index: number;
  x: number;
  chartHeight: number;
  barWidth: number;
}> = ({ candle, index, x, chartHeight, barWidth }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isBullish = candle.close > candle.open;
  const color = isBullish ? COLOR_BULLISH : COLOR_BEARISH;

  const bodyTop = (1 - Math.max(candle.open, candle.close)) * chartHeight;
  const bodyBottom = (1 - Math.min(candle.open, candle.close)) * chartHeight;
  const bodyHeight = Math.max(bodyBottom - bodyTop, 2);
  const wickTop = (1 - candle.high) * chartHeight;
  const wickBottom = (1 - candle.low) * chartHeight;
  const wickX = x + barWidth / 2;

  const delay = 40 + index * STAGGER_DELAY;

  // Wick extends first
  const wickProgress = spring({
    frame,
    fps,
    delay,
    config: { damping: 20, stiffness: 200 },
  });

  // Body fills slightly after wick
  const bodyProgress = spring({
    frame,
    fps,
    delay: delay + 5,
    config: { damping: 20, stiffness: 200 },
  });

  const wickHeight = (wickBottom - wickTop) * wickProgress;
  const animatedBodyHeight = bodyHeight * bodyProgress;

  return (
    <g>
      <line
        x1={wickX}
        y1={wickBottom - wickHeight}
        x2={wickX}
        y2={wickBottom}
        stroke={color}
        strokeWidth={2}
        opacity={wickProgress}
      />
      <rect
        x={x}
        y={bodyTop + bodyHeight - animatedBodyHeight}
        width={barWidth}
        height={animatedBodyHeight}
        fill={color}
        rx={2}
        opacity={bodyProgress}
      />
    </g>
  );
};

export const ForegroundCandles: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Subtle fade for loop reset
  const loopFade = interpolate(
    frame,
    [durationInFrames - 1 * fps, durationInFrames],
    [1, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const chartHeight = 450;
  const barWidth = 14;
  const gap = 12;
  // Center the chart horizontally, offset to the right side
  const totalWidth = CANDLES.length * (barWidth + gap);
  const startX = (1920 - totalWidth) / 2 + 200;

  // Axis lines
  const axisLeft = startX - 10;
  const axisRight = startX + totalWidth;
  const axisBottom = (800 + chartHeight) / 2;

  return (
    <AbsoluteFill style={{ opacity: loopFade }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(0, ${(800 - chartHeight) / 2})`}>
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

          {CANDLES.map((candle, i) => (
            <AnimatedCandle
              key={i}
              candle={candle}
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
git add src/components/remotion/layers/ForegroundCandles.tsx
git commit -m "feat: add ForegroundCandles layer for hero animation"
```

---

### Task 6: Create FloatingElements Layer

**Files:**
- Create: `src/components/remotion/layers/FloatingElements.tsx`

- [ ] **Step 1: Create the FloatingElements component**

Create `src/components/remotion/layers/FloatingElements.tsx`:

```tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { TICKERS, FLOATING_NUMBERS, COLOR_TEAL } from "../data";

const TICKER_CYCLE_DURATION = 60; // frames per fade cycle for floating numbers

const TickerTape: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Build ticker string
  const tickerText = TICKERS.map(
    (t) => `${t.symbol} ${t.price} ${t.positive ? "▲" : "▼"}${t.change}`
  ).join("   ·   ");

  // Duplicate for seamless scroll
  const fullText = `${tickerText}   ·   ${tickerText}`;

  // Scroll speed: complete one cycle over the full duration
  const scrollX = interpolate(frame, [0, 300], [0, -1200]);

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
        {fullText.split("   ·   ").map((segment, i) => {
          const ticker = TICKERS[i % TICKERS.length];
          const arrowColor = ticker.positive
            ? "rgba(0, 200, 83, 0.6)"
            : "rgba(255, 23, 68, 0.6)";
          return (
            <span key={i} style={{ marginRight: 24 }}>
              <span style={{ color: `rgba(141, 245, 228, 0.35)` }}>
                {ticker.symbol} {ticker.price}{" "}
              </span>
              <span style={{ color: arrowColor }}>
                {ticker.positive ? "▲" : "▼"}{ticker.change}
              </span>
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

  // Cyclic fade: each number fades in and out on its own schedule
  const cycleFrame = (frame + cycleOffset) % (TICKER_CYCLE_DURATION * 2);
  const cycleOpacity = interpolate(
    cycleFrame,
    [0, TICKER_CYCLE_DURATION * 0.3, TICKER_CYCLE_DURATION, TICKER_CYCLE_DURATION * 1.3, TICKER_CYCLE_DURATION * 2],
    [0, 1, 1, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const posX = x * 1920 + frame * driftX;
  const posY = y * 800 + frame * driftY;

  return (
    <div
      style={{
        position: "absolute",
        left: posX,
        top: posY,
        fontFamily: "monospace",
        fontSize,
        color: COLOR_TEAL,
        opacity: fadeIn * cycleOpacity * 0.12,
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
      {FLOATING_NUMBERS.map((num, i) => (
        <FloatingNumber key={i} {...num} />
      ))}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/layers/FloatingElements.tsx
git commit -m "feat: add FloatingElements layer for hero animation"
```

---

### Task 7: Create HeroAnimation Composition

**Files:**
- Create: `src/components/remotion/HeroAnimation.tsx`

- [ ] **Step 1: Create the main composition**

Create `src/components/remotion/HeroAnimation.tsx`:

```tsx
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { BackgroundGrid } from "./layers/BackgroundGrid";
import { MidgroundCandles } from "./layers/MidgroundCandles";
import { ForegroundCandles } from "./layers/ForegroundCandles";
import { FloatingElements } from "./layers/FloatingElements";
import { COLOR_BG } from "./data";

export const HeroAnimation: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR_BG }}>
      {/* Layer 1: Background Grid */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={0}>
        <BackgroundGrid />
      </Sequence>

      {/* Layer 2: Mid-ground blurred candles */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <MidgroundCandles />
      </Sequence>

      {/* Layer 3: Foreground sharp candles */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <ForegroundCandles />
      </Sequence>

      {/* Layer 4: Floating ticker + numbers */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <FloatingElements />
      </Sequence>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/remotion/HeroAnimation.tsx
git commit -m "feat: add HeroAnimation composition combining all layers"
```

---

### Task 8: Create HeroPlayer Client Wrapper

**Files:**
- Create: `src/components/remotion/HeroPlayer.tsx`

- [ ] **Step 1: Create the Player wrapper**

Create `src/components/remotion/HeroPlayer.tsx`:

```tsx
"use client";

import { Player } from "@remotion/player";
import { HeroAnimation } from "./HeroAnimation";

const COMPOSITION_WIDTH = 1920;
const COMPOSITION_HEIGHT = 800;
const FPS = 30;
const DURATION_IN_FRAMES = 300;

export const HeroPlayer: React.FC = () => {
  return (
    <Player
      component={HeroAnimation}
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

- [ ] **Step 2: Verify the build compiles**

Run:
```bash
npm run build
```
Expected: Build succeeds with no TypeScript errors in `src/components/remotion/`.

- [ ] **Step 3: Commit**

```bash
git add src/components/remotion/HeroPlayer.tsx
git commit -m "feat: add HeroPlayer client wrapper for Remotion Player"
```

---

### Task 9: Integrate Hero Animation into Dashboard Page

**Files:**
- Modify: `src/components/landing/dashboard-page.tsx:22-45`

- [ ] **Step 1: Add imports and state for text reveal**

At the top of `src/components/landing/dashboard-page.tsx`, add imports after the existing ones:

```tsx
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const HeroPlayer = dynamic(
  () => import("@/components/remotion/HeroPlayer").then((m) => ({ default: m.HeroPlayer })),
  { ssr: false }
);
```

The `dynamic` import with `ssr: false` is required because Remotion Player uses browser-only APIs.

- [ ] **Step 2: Add text reveal state inside DashboardPage**

Inside the `DashboardPage` function body, after the existing `useCompletedScenarios` hook, add:

```tsx
const [showText, setShowText] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setShowText(true), 7000);
  return () => clearTimeout(timer);
}, []);
```

- [ ] **Step 3: Replace the hero section markup**

Replace the entire hero section (lines 22–45 of the original) — from `{/* ── Hero Section ── */}` through the closing `</section>` — with:

```tsx
      {/* ── Hero Section ── */}
      <section className="relative w-screen -ml-[calc((100vw-100%)/2)] min-h-[600px] lg:min-h-[700px] overflow-hidden bg-[#0a1628]">
        {/* Animation layer — desktop only */}
        <div className="absolute inset-0 hidden lg:block">
          <HeroPlayer />
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
        <div
          className="relative z-10 flex items-center min-h-[600px] lg:min-h-[700px] px-8 lg:px-16"
          style={{
            opacity: showText ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
        >
          <div className="max-w-xl space-y-8 lg:w-[35%]">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-[#e8eaed] leading-[1.1] tracking-tight">
              {strings.heroTitle}{" "}
              <span className="text-[#8df5e4]">{strings.heroTitleAccent}</span>
            </h1>
            <p className="text-lg lg:text-xl text-[rgba(232,234,237,0.55)] max-w-xl leading-relaxed">
              {strings.heroSubtitle}
            </p>
          </div>
        </div>
      </section>
```

- [ ] **Step 4: Make text show immediately on mobile**

Update the style attribute on the text content div to show text immediately when not on desktop. Since Tailwind can't conditionally apply inline styles, we handle this by making the opacity transition only apply on large screens. Replace the `style` prop:

```tsx
        <div
          className="relative z-10 flex items-center min-h-[600px] lg:min-h-[700px] px-8 lg:px-16"
        >
          <div
            className="max-w-xl space-y-8 lg:w-[35%]"
            style={{
              opacity: showText ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          >
```

Wait — on mobile the text should show immediately. Update the state initialization and effect:

```tsx
const [showText, setShowText] = useState(false);

useEffect(() => {
  // On mobile (no animation), show text immediately
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  if (!isDesktop) {
    setShowText(true);
    return;
  }
  const timer = setTimeout(() => setShowText(true), 7000);
  return () => clearTimeout(timer);
}, []);
```

- [ ] **Step 5: Verify dev server renders correctly**

Run:
```bash
npm run dev
```
Expected: Dev server starts. Navigate to `http://localhost:3000`. The hero section shows the animation on desktop with text appearing after 7 seconds. On mobile viewport, text shows immediately on a dark gradient.

- [ ] **Step 6: Verify build succeeds**

Run:
```bash
npm run build
```
Expected: Build completes with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/landing/dashboard-page.tsx
git commit -m "feat: integrate Remotion hero animation into landing page"
```

---

### Task 10: Final Polish and Lint

**Files:**
- All files in `src/components/remotion/`
- `src/components/landing/dashboard-page.tsx`

- [ ] **Step 1: Run lint**

Run:
```bash
npm run lint
```
Expected: No errors. Fix any warnings if present.

- [ ] **Step 2: Run production build**

Run:
```bash
npm run build
```
Expected: Clean build, no warnings related to remotion components.

- [ ] **Step 3: Final commit if any lint fixes were needed**

```bash
git add -A
git commit -m "fix: lint fixes for hero animation components"
```

Only run this step if there were changes from lint fixes.

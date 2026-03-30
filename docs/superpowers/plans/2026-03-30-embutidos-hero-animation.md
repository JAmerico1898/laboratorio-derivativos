# Embutidos Hero Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Remotion hero animation to the Módulo 6 (Derivativos Embutidos) opening page, showing a COE contract decomposing into its embedded components (zero-coupon bond + call option) with a payoff waterfall chart.

**Architecture:** 4-layer Remotion composition (BackgroundGrid + ContractDecomposition + PayoffWaterfall + FloatingLabels) following the exact same pattern as the credito module. Dynamic import loader for SSR safety, integrated via `heroPlayer` prop on `ModulePage`.

**Tech Stack:** Remotion (`@remotion/player`), React, Next.js dynamic imports, SVG animations

**Spec:** `docs/superpowers/specs/2026-03-30-embutidos-hero-animation-design.md`

---

### Task 1: Create embutidos-data.ts (types, colors, coordinates, utilities)

**Files:**
- Create: `src/components/remotion/embutidos/embutidos-data.ts`

- [ ] **Step 1: Create the data file with types and color constants**

```ts
// src/components/remotion/embutidos/embutidos-data.ts

export type Point = { x: number; y: number };

export type EmbutidosFloatingLabel = {
  value: string;
  x: number;
  y: number;
  fontSize: number;
  cycleOffset: number;
  driftX: number;
  driftY: number;
  color: string;
};

// ── Colors ──────────────────────────────────────────────────────────
export const COLOR_BG = "#0a1628";
export const COLOR_TEAL = "#8df5e4";
export const COLOR_GOLD = "#f5c842";
export const COLOR_RED = "#f54242";
export const COLOR_TEXT = "#e8eaed";
export const COLOR_TEXT_DIM = "rgba(232,234,237,0.55)";

// ── Contract Decomposition ─────────────────────────────────────────
export const DECOMP_VIEWBOX_W = 600;
export const DECOMP_VIEWBOX_H = 350;

// COE envelope (center)
export const COE_CENTER: Point = { x: 300, y: 175 };
export const COE_WIDTH = 240;
export const COE_HEIGHT = 140;

// Separated positions
export const ZERO_COUPON_X = 130; // left half center x
export const CALL_OPTION_X = 470; // right half center x
export const HALF_WIDTH = 100;
export const HALF_HEIGHT = 140;

// Particle arcs between separated halves
export const TOP_ARC = {
  start: { x: 180, y: 120 },
  control: { x: 300, y: 60 },
  end: { x: 420, y: 120 },
};

export const BOTTOM_ARC = {
  start: { x: 420, y: 230 },
  control: { x: 300, y: 290 },
  end: { x: 180, y: 230 },
};

export const PARTICLES_PER_ARC = 4;
export const PARTICLE_CYCLE_FRAMES = 90;

// ── Payoff Waterfall ───────────────────────────────────────────────
export const WATERFALL_VIEWBOX_W = 400;
export const WATERFALL_VIEWBOX_H = 300;

export const BAR_WIDTH = 60;
export const AXIS_BASELINE_Y = 250;

export const BARS = [
  { label: "Principal", value: "100%", x: 80, height: 160, yTop: 90, color: COLOR_TEAL },
  { label: "Custo Oport.", value: "-3.2%", x: 180, height: 40, yTop: 90, color: COLOR_RED },
  { label: "Participação", value: "+12%", x: 280, height: 100, yTop: 30, color: COLOR_GOLD },
] as const;

// ── Floating Labels ────────────────────────────────────────────────
export const FLOATING_LABELS: EmbutidosFloatingLabel[] = [
  { value: "COE Principal Garantido", x: 0.72, y: 0.10, fontSize: 16, cycleOffset: 0, driftX: 0, driftY: -0.25, color: COLOR_TEAL },
  { value: "Callable Bond", x: 0.82, y: 0.65, fontSize: 14, cycleOffset: 50, driftX: 0.1, driftY: -0.15, color: COLOR_GOLD },
  { value: "Conversível", x: 0.58, y: 0.08, fontSize: 15, cycleOffset: 100, driftX: -0.15, driftY: 0, color: COLOR_TEAL },
  { value: "Cap/Floor CDI", x: 0.85, y: 0.40, fontSize: 13, cycleOffset: 150, driftX: -0.1, driftY: -0.2, color: COLOR_RED },
  { value: "Pré-pagamento", x: 0.65, y: 0.55, fontSize: 14, cycleOffset: 200, driftX: 0.08, driftY: -0.1, color: COLOR_GOLD },
  { value: "Nota Estruturada", x: 0.90, y: 0.18, fontSize: 16, cycleOffset: 250, driftX: -0.08, driftY: 0.1, color: COLOR_TEAL },
];

// ── Utility Functions ──────────────────────────────────────────────

export function getQuadraticPoint(t: number, p0: Point, p1: Point, p2: Point): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/components/remotion/embutidos/embutidos-data.ts 2>&1 || echo "Check for errors"`

- [ ] **Step 3: Commit**

```bash
git add src/components/remotion/embutidos/embutidos-data.ts
git commit -m "feat(embutidos): add data file with types, colors, coordinates, and utilities"
```

---

### Task 2: Create ContractDecomposition layer

**Files:**
- Create: `src/components/remotion/embutidos/layers/ContractDecomposition.tsx`

- [ ] **Step 1: Create the ContractDecomposition component**

```tsx
// src/components/remotion/embutidos/layers/ContractDecomposition.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  DECOMP_VIEWBOX_H,
  COE_CENTER,
  COE_WIDTH,
  COE_HEIGHT,
  ZERO_COUPON_X,
  CALL_OPTION_X,
  HALF_WIDTH,
  HALF_HEIGHT,
  TOP_ARC,
  BOTTOM_ARC,
  PARTICLES_PER_ARC,
  PARTICLE_CYCLE_FRAMES,
  COLOR_TEAL,
  COLOR_GOLD,
  COLOR_TEXT,
  COLOR_TEXT_DIM,
  getQuadraticPoint,
} from "../embutidos-data";

// ── COE Envelope (whole state) ─────────────────────────────────────

const COEEnvelope: React.FC<{ opacity: number }> = ({ opacity }) => {
  const cx = COE_CENTER.x;
  const cy = COE_CENTER.y;

  return (
    <g opacity={opacity}>
      <rect
        x={cx - COE_WIDTH / 2}
        y={cy - COE_HEIGHT / 2}
        width={COE_WIDTH}
        height={COE_HEIGHT}
        rx={12}
        fill="none"
        stroke={COLOR_TEXT_DIM}
        strokeWidth={2}
        strokeDasharray="8,4"
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={COLOR_TEXT}
        fontSize={20}
        fontFamily="monospace"
        opacity={0.8}
      >
        COE
      </text>
    </g>
  );
};

// ── Half Component (Zero-Coupon or Call Option) ────────────────────

const ContractHalf: React.FC<{
  cx: number;
  cy: number;
  color: string;
  label: string;
  sublabel: string;
  opacity: number;
}> = ({ cx, cy, color, label, sublabel, opacity }) => {
  return (
    <g opacity={opacity}>
      <rect
        x={cx - HALF_WIDTH / 2}
        y={cy - HALF_HEIGHT / 2}
        width={HALF_WIDTH}
        height={HALF_HEIGHT}
        rx={10}
        fill="none"
        stroke={color}
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={13}
        fontFamily="monospace"
        opacity={0.9}
      >
        {label}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={11}
        fontFamily="monospace"
        opacity={0.5}
      >
        {sublabel}
      </text>
    </g>
  );
};

// ── Ghost Outline (stays at center after split) ────────────────────

const GhostOutline: React.FC<{ opacity: number }> = ({ opacity }) => {
  const cx = COE_CENTER.x;
  const cy = COE_CENTER.y;

  return (
    <rect
      x={cx - COE_WIDTH / 2}
      y={cy - COE_HEIGHT / 2}
      width={COE_WIDTH}
      height={COE_HEIGHT}
      rx={12}
      fill="none"
      stroke={COLOR_TEXT_DIM}
      strokeWidth={1}
      strokeDasharray="4,8"
      opacity={opacity * 0.15}
    />
  );
};

// ── Flow Particles ─────────────────────────────────────────────────

const FlowParticles: React.FC<{
  arc: { start: { x: number; y: number }; control: { x: number; y: number }; end: { x: number; y: number } };
  color: string;
  visible: boolean;
}> = ({ arc, color, visible }) => {
  const frame = useCurrentFrame();

  if (!visible) return null;

  const particles = Array.from({ length: PARTICLES_PER_ARC }, (_, i) => {
    const offset = i / PARTICLES_PER_ARC;
    const t = ((frame / PARTICLE_CYCLE_FRAMES) + offset) % 1;
    const point = getQuadraticPoint(t, arc.start, arc.control, arc.end);

    const pulseOpacity = interpolate(
      t,
      [0, 0.15, 0.5, 0.85, 1],
      [0.4, 0.8, 0.9, 0.8, 0.4],
    );

    return (
      <circle
        key={i}
        cx={point.x}
        cy={point.y}
        r={3.5}
        fill={color}
        opacity={pulseOpacity * 0.8}
      />
    );
  });

  return <g>{particles}</g>;
};

// ── Flow Arc Path ──────────────────────────────────────────────────

const FlowArcPath: React.FC<{
  arc: { start: { x: number; y: number }; control: { x: number; y: number }; end: { x: number; y: number } };
  color: string;
  opacity: number;
}> = ({ arc, color, opacity }) => {
  const pathD = `M ${arc.start.x} ${arc.start.y} Q ${arc.control.x} ${arc.control.y} ${arc.end.x} ${arc.end.y}`;

  return (
    <path
      d={pathD}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      opacity={opacity * 0.3}
      strokeDasharray="4,4"
    />
  );
};

// ── Main Component ─────────────────────────────────────────────────

export const ContractDecomposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Entrance (frames 0-30)
  const entrance = spring({
    frame,
    fps,
    delay: 0,
    config: { damping: 200 },
  });

  // Phase 2: Split (frames 60-90)
  const splitProgress = spring({
    frame,
    fps,
    delay: 60,
    config: { damping: 20, stiffness: 180 },
  });

  // Phase 3: Rejoin (frames 210-240)
  const rejoinProgress = spring({
    frame,
    fps,
    delay: 210,
    config: { damping: 20, stiffness: 180 },
  });

  // Combined split state: 0 = whole, 1 = split
  const splitState = splitProgress - rejoinProgress;
  const isSplit = splitState > 0.1;

  // Whole envelope opacity: visible when not split
  const envelopeOpacity = entrance * (1 - splitState);

  // Half positions: interpolate from center to separated
  const leftX = COE_CENTER.x + (ZERO_COUPON_X - COE_CENTER.x) * splitState;
  const rightX = COE_CENTER.x + (CALL_OPTION_X - COE_CENTER.x) * splitState;
  const cy = COE_CENTER.y;

  // Ghost and arc visibility
  const ghostOpacity = splitState;
  const arcOpacity = splitState;

  // Loop reset: fade everything at frame 270-300
  const loopFade = interpolate(frame, [270, 295], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = 1.3;
  const svgOffsetX = 1920 * 0.35;
  const svgOffsetY = (800 - DECOMP_VIEWBOX_H * scale) / 2 - 40;

  return (
    <AbsoluteFill>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          transform={`translate(${svgOffsetX}, ${svgOffsetY}) scale(${scale})`}
          opacity={loopFade}
        >
          {/* Ghost outline at center (visible during split) */}
          <GhostOutline opacity={ghostOpacity} />

          {/* Whole COE envelope */}
          <COEEnvelope opacity={envelopeOpacity} />

          {/* Separated halves */}
          <ContractHalf
            cx={leftX}
            cy={cy}
            color={COLOR_TEAL}
            label="Zero-Coupon"
            sublabel="Hospedeiro"
            opacity={entrance * splitState}
          />
          <ContractHalf
            cx={rightX}
            cy={cy}
            color={COLOR_GOLD}
            label="Call S&P 500"
            sublabel="Embutido"
            opacity={entrance * splitState}
          />

          {/* Flow arc paths */}
          <FlowArcPath arc={TOP_ARC} color={COLOR_TEAL} opacity={arcOpacity} />
          <FlowArcPath arc={BOTTOM_ARC} color={COLOR_GOLD} opacity={arcOpacity} />

          {/* Flow particles */}
          <FlowParticles arc={TOP_ARC} color={COLOR_TEAL} visible={isSplit} />
          <FlowParticles arc={BOTTOM_ARC} color={COLOR_GOLD} visible={isSplit} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/components/remotion/embutidos/layers/ContractDecomposition.tsx 2>&1 || echo "Check for errors"`

- [ ] **Step 3: Commit**

```bash
git add src/components/remotion/embutidos/layers/ContractDecomposition.tsx
git commit -m "feat(embutidos): add ContractDecomposition layer — COE split animation"
```

---

### Task 3: Create PayoffWaterfall layer

**Files:**
- Create: `src/components/remotion/embutidos/layers/PayoffWaterfall.tsx`

- [ ] **Step 1: Create the PayoffWaterfall component**

```tsx
// src/components/remotion/embutidos/layers/PayoffWaterfall.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  WATERFALL_VIEWBOX_H,
  BAR_WIDTH,
  AXIS_BASELINE_Y,
  BARS,
  COLOR_TEXT,
  COLOR_TEXT_DIM,
} from "../embutidos-data";

// ── Axis ───────────────────────────────────────────────────────────

const Axis: React.FC<{ opacity: number }> = ({ opacity }) => {
  return (
    <g opacity={opacity}>
      <line
        x1={40}
        y1={AXIS_BASELINE_Y}
        x2={370}
        y2={AXIS_BASELINE_Y}
        stroke={COLOR_TEXT_DIM}
        strokeWidth={1}
        opacity={0.4}
      />
      <text
        x={30}
        y={AXIS_BASELINE_Y + 20}
        fill={COLOR_TEXT_DIM}
        fontSize={11}
        fontFamily="monospace"
        opacity={0.5}
      >
        Valor
      </text>
    </g>
  );
};

// ── Waterfall Bar ──────────────────────────────────────────────────

const WaterfallBar: React.FC<{
  x: number;
  height: number;
  yTop: number;
  color: string;
  label: string;
  value: string;
  delay: number;
  isNegative?: boolean;
}> = ({ x, height, yTop, color, label, value, delay, isNegative }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const growProgress = spring({
    frame,
    fps,
    delay,
    config: { damping: 20, stiffness: 180 },
  });

  // Bar grows from baseline upward (or downward for negative)
  const barHeight = height * growProgress;
  const barY = isNegative ? yTop : AXIS_BASELINE_Y - barHeight;

  // Value label pulse (after bar is grown)
  const labelOpacity = interpolate(
    frame,
    [delay + 20, delay + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const pulse = interpolate(
    frame % 90,
    [0, 45, 90],
    [0.6, 1, 0.6],
  );

  // Fade for loop reset
  const fadeTo = interpolate(frame, [210, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g opacity={fadeTo}>
      {/* Bar */}
      <rect
        x={x}
        y={barY}
        width={BAR_WIDTH}
        height={barHeight}
        rx={4}
        fill={color}
        opacity={0.3}
      />
      <rect
        x={x}
        y={barY}
        width={BAR_WIDTH}
        height={barHeight}
        rx={4}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.7}
      />

      {/* Value label above bar */}
      <text
        x={x + BAR_WIDTH / 2}
        y={barY - 8}
        textAnchor="middle"
        fill={color}
        fontSize={14}
        fontFamily="monospace"
        fontWeight="bold"
        opacity={labelOpacity * pulse}
      >
        {value}
      </text>

      {/* Name label below baseline */}
      <text
        x={x + BAR_WIDTH / 2}
        y={AXIS_BASELINE_Y + 16}
        textAnchor="middle"
        fill={COLOR_TEXT}
        fontSize={10}
        fontFamily="monospace"
        opacity={growProgress * 0.5}
      >
        {label}
      </text>
    </g>
  );
};

// ── Main Component ─────────────────────────────────────────────────

export const PayoffWaterfall: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Axis entrance synced with first bar
  const axisEntrance = spring({
    frame,
    fps,
    delay: 55,
    config: { damping: 200 },
  });

  const scale = 1.1;
  const svgOffsetX = 1920 * 0.55;
  const svgOffsetY = (800 - WATERFALL_VIEWBOX_H * scale) / 2 + 60;

  return (
    <AbsoluteFill>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(${svgOffsetX}, ${svgOffsetY}) scale(${scale})`}>
          <Axis opacity={axisEntrance} />

          {/* Bar 1: Principal Garantido (teal, grows up from baseline) */}
          <WaterfallBar
            x={BARS[0].x}
            height={BARS[0].height}
            yTop={BARS[0].yTop}
            color={BARS[0].color}
            label={BARS[0].label}
            value={BARS[0].value}
            delay={60}
          />

          {/* Bar 2: Custo de Oportunidade (red, grows down from top of bar 1) */}
          <WaterfallBar
            x={BARS[1].x}
            height={BARS[1].height}
            yTop={BARS[1].yTop}
            color={BARS[1].color}
            label={BARS[1].label}
            value={BARS[1].value}
            delay={80}
            isNegative
          />

          {/* Bar 3: Participação (gold, grows up) */}
          <WaterfallBar
            x={BARS[2].x}
            height={BARS[2].height}
            yTop={BARS[2].yTop}
            color={BARS[2].color}
            label={BARS[2].label}
            value={BARS[2].value}
            delay={100}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/components/remotion/embutidos/layers/PayoffWaterfall.tsx 2>&1 || echo "Check for errors"`

- [ ] **Step 3: Commit**

```bash
git add src/components/remotion/embutidos/layers/PayoffWaterfall.tsx
git commit -m "feat(embutidos): add PayoffWaterfall layer — value decomposition bars"
```

---

### Task 4: Create EmbutidosFloatingLabels layer

**Files:**
- Create: `src/components/remotion/embutidos/layers/EmbutidosFloatingLabels.tsx`

- [ ] **Step 1: Create the EmbutidosFloatingLabels component**

```tsx
// src/components/remotion/embutidos/layers/EmbutidosFloatingLabels.tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FLOATING_LABELS } from "../embutidos-data";

const CYCLE_DURATION = 60;

const FloatingLabel: React.FC<{
  value: string;
  x: number;
  y: number;
  fontSize: number;
  cycleOffset: number;
  driftX: number;
  driftY: number;
  color: string;
}> = ({ value, x, y, fontSize, cycleOffset, driftX, driftY, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [2 * fps, 3 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cyclic fade: each label fades in and out on its own schedule
  const cycleFrame = (frame + cycleOffset) % (CYCLE_DURATION * 2);
  const cycleOpacity = interpolate(
    cycleFrame,
    [0, CYCLE_DURATION * 0.3, CYCLE_DURATION, CYCLE_DURATION * 1.3, CYCLE_DURATION * 2],
    [0, 1, 1, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
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
        color,
        opacity: fadeIn * cycleOpacity * 0.35,
        pointerEvents: "none",
      }}
    >
      {value}
    </div>
  );
};

export const EmbutidosFloatingLabels: React.FC = () => {
  return (
    <AbsoluteFill>
      {FLOATING_LABELS.map((label, i) => (
        <FloatingLabel key={i} {...label} />
      ))}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/components/remotion/embutidos/layers/EmbutidosFloatingLabels.tsx 2>&1 || echo "Check for errors"`

- [ ] **Step 3: Commit**

```bash
git add src/components/remotion/embutidos/layers/EmbutidosFloatingLabels.tsx
git commit -m "feat(embutidos): add EmbutidosFloatingLabels layer — product-type labels"
```

---

### Task 5: Create EmbutidosAnimation composition

**Files:**
- Create: `src/components/remotion/embutidos/EmbutidosAnimation.tsx`

- [ ] **Step 1: Create the main composition component**

```tsx
// src/components/remotion/embutidos/EmbutidosAnimation.tsx
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { BackgroundGrid } from "../layers/BackgroundGrid";
import { ContractDecomposition } from "./layers/ContractDecomposition";
import { PayoffWaterfall } from "./layers/PayoffWaterfall";
import { EmbutidosFloatingLabels } from "./layers/EmbutidosFloatingLabels";
import { COLOR_BG } from "./embutidos-data";

export const EmbutidosAnimation: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR_BG }}>
      {/* Layer 1: Background Grid (reused with unique pattern ID) */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={0}>
        <BackgroundGrid patternId="embutidos-grid" />
      </Sequence>

      {/* Layer 2: Contract Decomposition — COE splits into bond + option */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <ContractDecomposition />
      </Sequence>

      {/* Layer 3: Payoff Waterfall — value decomposition bars */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <PayoffWaterfall />
      </Sequence>

      {/* Layer 4: Floating product-type labels */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <EmbutidosFloatingLabels />
      </Sequence>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/components/remotion/embutidos/EmbutidosAnimation.tsx 2>&1 || echo "Check for errors"`

- [ ] **Step 3: Commit**

```bash
git add src/components/remotion/embutidos/EmbutidosAnimation.tsx
git commit -m "feat(embutidos): add EmbutidosAnimation composition — 4-layer architecture"
```

---

### Task 6: Create EmbutidosPlayer and EmbutidosPlayerLoader

**Files:**
- Create: `src/components/remotion/embutidos/EmbutidosPlayer.tsx`
- Create: `src/components/remotion/embutidos/EmbutidosPlayerLoader.tsx`

- [ ] **Step 1: Create the Player component**

```tsx
// src/components/remotion/embutidos/EmbutidosPlayer.tsx
"use client";

import { Player } from "@remotion/player";
import { EmbutidosAnimation } from "./EmbutidosAnimation";

const COMPOSITION_WIDTH = 1920;
const COMPOSITION_HEIGHT = 800;
const FPS = 30;
const DURATION_IN_FRAMES = 300;

export const EmbutidosPlayer: React.FC = () => {
  return (
    <Player
      component={EmbutidosAnimation}
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

- [ ] **Step 2: Create the PlayerLoader component**

```tsx
// src/components/remotion/embutidos/EmbutidosPlayerLoader.tsx
"use client";

import dynamic from "next/dynamic";

const EmbutidosPlayer = dynamic(
  () => import("./EmbutidosPlayer").then((m) => ({ default: m.EmbutidosPlayer })),
  { ssr: false },
);

export function EmbutidosPlayerLoader() {
  return <EmbutidosPlayer />;
}
```

- [ ] **Step 3: Verify both files compile**

Run: `npx tsc --noEmit src/components/remotion/embutidos/EmbutidosPlayer.tsx src/components/remotion/embutidos/EmbutidosPlayerLoader.tsx 2>&1 || echo "Check for errors"`

- [ ] **Step 4: Commit**

```bash
git add src/components/remotion/embutidos/EmbutidosPlayer.tsx src/components/remotion/embutidos/EmbutidosPlayerLoader.tsx
git commit -m "feat(embutidos): add EmbutidosPlayer and EmbutidosPlayerLoader"
```

---

### Task 7: Integrate into embutidos page

**Files:**
- Modify: `src/app/embutidos/page.tsx`

- [ ] **Step 1: Update the embutidos page to pass the heroPlayer prop**

Replace the full content of `src/app/embutidos/page.tsx` with:

```tsx
import { ModulePage } from '@/components/landing/module-page';
import { EmbutidosPlayerLoader } from '@/components/remotion/embutidos/EmbutidosPlayerLoader';

export default function EmbutidosPage() {
  return <ModulePage themeId="embutidos" heroPlayer={<EmbutidosPlayerLoader />} />;
}
```

- [ ] **Step 2: Verify the dev server builds without errors**

Run: `cd /c/jose_americo/laboratorio-derivativos && npm run build 2>&1 | tail -20`

If build succeeds, proceed. If there are type errors, fix them.

- [ ] **Step 3: Commit**

```bash
git add src/app/embutidos/page.tsx
git commit -m "feat(embutidos): integrate hero animation into Módulo 6 opening page"
```

---

### Task 8: Visual verification and polish

- [ ] **Step 1: Start dev server and verify in browser**

Run: `cd /c/jose_americo/laboratorio-derivativos && npm run dev`

Open `http://localhost:3000/embutidos` in browser.

Verify:
1. Animation plays on desktop (hidden on mobile)
2. BackgroundGrid renders with upward drift
3. COE envelope appears, holds, splits into Zero-Coupon (teal, left) + Call S&P 500 (gold, right)
4. Particle arcs flow between halves during split state
5. Waterfall bars grow sequentially (teal, red, gold) synced with split
6. Floating labels cycle with staggered fade
7. Loop is seamless (no visible jump at 10s boundary)
8. Hero text ("Derivativos Embutidos") fades in after ~7 seconds
9. Mobile view shows gradient background fallback (no animation)

- [ ] **Step 2: Adjust positions/timing if needed**

If the ContractDecomposition and PayoffWaterfall overlap visually, adjust the `svgOffsetX` and `svgOffsetY` values in each component. The decomposition sits left-center (`0.35 * 1920`), the waterfall sits right-center (`0.55 * 1920`).

- [ ] **Step 3: Final commit if adjustments were made**

```bash
git add -u
git commit -m "fix(embutidos): polish animation positions and timing"
```

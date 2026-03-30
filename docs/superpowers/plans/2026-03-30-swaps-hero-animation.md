# Swaps Hero Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a two-stream cash flow exchange Remotion animation to the Módulo 3 (Swaps) opening page, showing two counterparties exchanging DI/CDI and USD/Pré flows with animated particles.

**Architecture:** 4-layer Remotion composition (reused background grid, core swap flow with bidirectional particles on bezier arcs, payment timeline with pulsing ticks, floating rate labels) rendered via `@remotion/player` in a full-width hero section. The `ModulePage` component gains an optional `heroPlayer` prop; when present it renders a hero section above the scenario cards. The core swap diagram is anchored in the right 65% of the composition so it's never obscured by the gradient text mask.

**Tech Stack:** Remotion (useCurrentFrame, interpolate, spring, Sequence, AbsoluteFill), @remotion/player, Next.js dynamic import, React, TypeScript, SVG.

**Spec:** `docs/superpowers/specs/2026-03-30-swaps-hero-animation-design.md`

---

### Task 1: Add `heroPlayer` prop and hero section to ModulePage

The `ModulePage` component gains an optional `heroPlayer` prop. When present, it renders a full-width hero section (same pattern as `src/components/landing/dashboard-page.tsx` hero) above the scenario cards. When absent, the existing header renders unchanged.

**Files:**
- Modify: `src/components/landing/module-page.tsx`

- [ ] **Step 1: Add `heroPlayer` to the props interface and imports**

In `src/components/landing/module-page.tsx`, update the imports to include `useEffect`:

```tsx
import { useState, useEffect } from 'react';
```

Update the interface:

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

- [ ] **Step 2: Add text reveal state and effect**

Place this after the existing `useState` calls, near the top of the component body (after `const [activeScenario, setActiveScenario] = ...`):

```tsx
const [showHeroText, setShowHeroText] = useState(false);

useEffect(() => {
  if (!heroPlayer) return;
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  if (!isDesktop) {
    setShowHeroText(true);
    return;
  }
  const timer = setTimeout(() => setShowHeroText(true), 7000);
  return () => clearTimeout(timer);
}, [heroPlayer]);
```

- [ ] **Step 3: Replace the return block**

Replace the entire `return (...)` block. When `heroPlayer` is present, render a hero section before the scenario cards. When absent, keep the existing layout. The module number is derived from the theme index in THEMES.

```tsx
const moduleNumber = THEMES.findIndex((th) => th.id === themeId) + 1;

if (activeScenario) {
  return (
    <ScenarioPlayer
      scenario={activeScenario}
      onFinish={handleFinish}
      onBack={handleBack}
    />
  );
}

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
        <section className="relative w-screen -ml-[calc((100vw-100%)/2)] min-h-[600px] lg:min-h-[700px] overflow-hidden bg-[#0a1628]">
          {/* Animation layer — desktop only */}
          <div className="absolute inset-0 hidden lg:block">
            {heroPlayer}
          </div>

          {/* Gradient mask — dims animation under text, transparent by 42% */}
          <div
            className="absolute inset-0 z-[5] hidden lg:block pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, #0a1628 0%, #0a1628 18%, rgba(10,22,40,0.85) 28%, transparent 42%)",
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

          {/* Text content — left 35% */}
          <div className="relative z-10 flex items-center min-h-[600px] lg:min-h-[700px] px-8 lg:px-16">
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
                  {`Módulo ${moduleNumber}`}
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

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds. All existing module pages still work (they pass no `heroPlayer` prop, so they render the original layout).

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/module-page.tsx
git commit -m "feat: add optional heroPlayer prop to ModulePage for animated hero sections"
```

---

### Task 2: Create swaps animation data file

**Files:**
- Create: `src/components/remotion/swaps/swaps-data.ts`

- [ ] **Step 1: Create the data file with swap-specific types, data, and bezier utility**

```ts
// src/components/remotion/swaps/swaps-data.ts

export type Point = { x: number; y: number };

export type SwapFloatingLabel = {
  value: string;
  x: number;
  y: number;
  fontSize: number;
  cycleOffset: number;
  driftX: number;
  driftY: number;
  color: string;
};

// Counterparty positions in SVG viewBox (600×260)
export const PARTY_A: Point = { x: 100, y: 130 };
export const PARTY_B: Point = { x: 500, y: 130 };

// Top arc (A→B): DI/CDI flow — quadratic bezier control point
export const ARC_TOP = {
  start: { x: 145, y: 105 },
  control: { x: 300, y: 20 },
  end: { x: 455, y: 105 },
};

// Bottom arc (B→A): USD/Pré flow — quadratic bezier control point
export const ARC_BOTTOM = {
  start: { x: 455, y: 155 },
  control: { x: 300, y: 240 },
  end: { x: 145, y: 155 },
};

export const PARTICLES_PER_ARC = 4;
export const PARTICLE_CYCLE_FRAMES = 90; // 3 seconds at 30fps

export const FLOATING_LABELS: SwapFloatingLabel[] = [
  { value: "CDI 13.25%", x: 0.74, y: 0.10, fontSize: 18, cycleOffset: 0, driftX: 0, driftY: -0.25, color: "#8df5e4" },
  { value: "Pré 12.80%", x: 0.82, y: 0.68, fontSize: 14, cycleOffset: 50, driftX: 0.1, driftY: -0.15, color: "#8df5e4" },
  { value: "USDBRL 5.12", x: 0.55, y: 0.08, fontSize: 15, cycleOffset: 100, driftX: -0.15, driftY: 0, color: "#f5c842" },
  { value: "DI1F26", x: 0.68, y: 0.55, fontSize: 16, cycleOffset: 150, driftX: -0.1, driftY: -0.2, color: "#8df5e4" },
  { value: "R$10M", x: 0.88, y: 0.38, fontSize: 13, cycleOffset: 200, driftX: 0.08, driftY: -0.1, color: "#f5c842" },
  { value: "Cupom 5.8%", x: 0.60, y: 0.72, fontSize: 14, cycleOffset: 250, driftX: -0.12, driftY: 0.1, color: "#8df5e4" },
];

// Colors
export const COLOR_BG = "#0a1628";
export const COLOR_TEAL = "#8df5e4";
export const COLOR_GOLD = "#f5c842";

/**
 * Calculate a point along a quadratic bezier curve at parameter t (0–1).
 */
export function getQuadraticPoint(t: number, p0: Point, p1: Point, p2: Point): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds (file created but not yet imported).

- [ ] **Step 3: Commit**

```bash
git add src/components/remotion/swaps/swaps-data.ts
git commit -m "feat: add swap flow data, bezier utility, and color palette for swaps animation"
```

---

### Task 3: Create SwapFlow layer (core visual — counterparties + arcs + particles)

**Files:**
- Create: `src/components/remotion/swaps/layers/SwapFlow.tsx`

- [ ] **Step 1: Create the SwapFlow component**

This is the visual anchor. Two counterparty circles connected by two curved arcs with animated particles flowing in opposite directions. The entire diagram is positioned in the right ~60% of the SVG viewBox so it's never obscured by the gradient mask.

```tsx
// src/components/remotion/swaps/layers/SwapFlow.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  PARTY_A,
  PARTY_B,
  ARC_TOP,
  ARC_BOTTOM,
  PARTICLES_PER_ARC,
  PARTICLE_CYCLE_FRAMES,
  COLOR_TEAL,
  COLOR_GOLD,
  getQuadraticPoint,
} from "../swaps-data";
import type { Point } from "../swaps-data";

const NODE_RADIUS = 45;

const CounterpartyNode: React.FC<{
  center: Point;
  color: string;
  label: string;
  sublabel: string;
  delay: number;
}> = ({ center, color, label, sublabel, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    delay,
    config: { damping: 20, stiffness: 180 },
  });

  return (
    <g opacity={progress} transform={`translate(${center.x}, ${center.y})`}>
      <circle
        cx={0}
        cy={0}
        r={NODE_RADIUS * progress}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={0.8}
      />
      <text
        x={0}
        y={-5}
        textAnchor="middle"
        fill={color}
        fontSize={12}
        fontFamily="monospace"
        opacity={0.9}
      >
        {label}
      </text>
      <text
        x={0}
        y={12}
        textAnchor="middle"
        fill={color}
        fontSize={9}
        fontFamily="monospace"
        opacity={0.5}
      >
        {sublabel}
      </text>
    </g>
  );
};

const FlowArc: React.FC<{
  arc: { start: Point; control: Point; end: Point };
  color: string;
  delay: number;
}> = ({ arc, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    delay,
    config: { damping: 200 },
  });

  const pathD = `M ${arc.start.x} ${arc.start.y} Q ${arc.control.x} ${arc.control.y} ${arc.end.x} ${arc.end.y}`;

  return (
    <path
      d={pathD}
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      opacity={progress * 0.3}
      strokeDasharray="4,4"
    />
  );
};

const FlowParticles: React.FC<{
  arc: { start: Point; control: Point; end: Point };
  color: string;
  delayFrames: number;
}> = ({ arc, color, delayFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Wait for arc to appear before showing particles
  const arcVisible = spring({
    frame,
    fps,
    delay: delayFrames,
    config: { damping: 200 },
  });

  if (arcVisible < 0.5) return null;

  const particles = Array.from({ length: PARTICLES_PER_ARC }, (_, i) => {
    const offset = i / PARTICLES_PER_ARC;
    const t = ((frame / PARTICLE_CYCLE_FRAMES) + offset) % 1;
    const point = getQuadraticPoint(t, arc.start, arc.control, arc.end);

    // Pulse opacity: peaks in the middle of the journey
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
        opacity={pulseOpacity}
      />
    );
  });

  return <g>{particles}</g>;
};

const ArcLabel: React.FC<{
  text: string;
  x: number;
  y: number;
  color: string;
  delay: number;
}> = ({ text, x, y, color, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    delay,
    config: { damping: 200 },
  });

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill={color}
      fontSize={10}
      fontFamily="monospace"
      opacity={progress * 0.6}
    >
      {text}
    </text>
  );
};

export const SwapFlow: React.FC = () => {
  // SVG viewBox is 600x260, positioned in the right 60% of 1920x800
  const svgOffsetX = 1920 * 0.38; // start at 38% from left → right 62%
  const svgOffsetY = (800 - 260) / 2; // vertically centered

  return (
    <AbsoluteFill>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(${svgOffsetX}, ${svgOffsetY})`}>
          {/* Counterparty nodes */}
          <CounterpartyNode
            center={PARTY_A}
            color={COLOR_TEAL}
            label="Parte A"
            sublabel="Paga DI"
            delay={20}
          />
          <CounterpartyNode
            center={PARTY_B}
            color={COLOR_GOLD}
            label="Parte B"
            sublabel="Paga Pré"
            delay={30}
          />

          {/* Flow arcs */}
          <FlowArc arc={ARC_TOP} color={COLOR_TEAL} delay={40} />
          <FlowArc arc={ARC_BOTTOM} color={COLOR_GOLD} delay={40} />

          {/* Arc labels */}
          <ArcLabel text="DI / CDI →" x={300} y={12} color={COLOR_TEAL} delay={45} />
          <ArcLabel text="← USD / Pré" x={300} y={255} color={COLOR_GOLD} delay={45} />

          {/* Animated particles */}
          <FlowParticles arc={ARC_TOP} color={COLOR_TEAL} delayFrames={50} />
          <FlowParticles arc={ARC_BOTTOM} color={COLOR_GOLD} delayFrames={50} />
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
git add src/components/remotion/swaps/layers/SwapFlow.tsx
git commit -m "feat: add SwapFlow layer with counterparty nodes, bezier arcs, and animated particles"
```

---

### Task 4: Create PaymentTimeline layer

**Files:**
- Create: `src/components/remotion/swaps/layers/PaymentTimeline.tsx`

- [ ] **Step 1: Create the PaymentTimeline component**

Horizontal line with 5 tick markers (T1–T5) below the core swap diagram. Each tick pulses sequentially in sync with the particle cycle.

```tsx
// src/components/remotion/swaps/layers/PaymentTimeline.tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PARTICLE_CYCLE_FRAMES, COLOR_TEAL } from "../swaps-data";

const TICK_COUNT = 5;
const TIMELINE_WIDTH = 400;
const TIMELINE_X_START = 50;

export const PaymentTimeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in after arcs appear
  const fadeIn = spring({
    frame,
    fps,
    delay: 50,
    config: { damping: 200 },
  });

  // Position: aligned with the swap flow SVG group
  // SwapFlow uses svgOffsetX = 1920 * 0.38, svgOffsetY center. Timeline sits below.
  const svgOffsetX = 1920 * 0.38;
  const timelineY = (800 - 260) / 2 + 260 + 30; // below the 260px swap flow area + 30px gap

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g transform={`translate(${svgOffsetX + TIMELINE_X_START}, ${timelineY})`}>
          {/* Horizontal line */}
          <line
            x1={0}
            y1={0}
            x2={TIMELINE_WIDTH}
            y2={0}
            stroke={COLOR_TEAL}
            strokeWidth={1}
            opacity={0.15}
          />

          {/* Tick markers */}
          {Array.from({ length: TICK_COUNT }, (_, i) => {
            const x = (i / (TICK_COUNT - 1)) * TIMELINE_WIDTH;

            // Each tick pulses in sequence within the particle cycle
            const tickPhase = i / TICK_COUNT;
            const cycleProgress = (frame / PARTICLE_CYCLE_FRAMES) % 1;
            // Distance from this tick's phase to current cycle progress (wrapped)
            const dist = Math.abs(cycleProgress - tickPhase);
            const wrappedDist = Math.min(dist, 1 - dist);
            // Pulse: peaks when cycleProgress ≈ tickPhase
            const pulse = interpolate(
              wrappedDist,
              [0, 0.1, 0.2],
              [1, 0.5, 0],
              { extrapolateRight: "clamp" }
            );

            const baseOpacity = 0.2;
            const pulseOpacity = baseOpacity + pulse * 0.5;
            const scale = 1 + pulse * 0.5;

            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={0}
                  r={3 * scale}
                  fill={COLOR_TEAL}
                  opacity={pulseOpacity}
                />
                <text
                  x={x}
                  y={18}
                  textAnchor="middle"
                  fill={COLOR_TEAL}
                  fontSize={8}
                  fontFamily="monospace"
                  opacity={0.3}
                >
                  {`T${i + 1}`}
                </text>
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
git add src/components/remotion/swaps/layers/PaymentTimeline.tsx
git commit -m "feat: add PaymentTimeline layer with pulsing tick markers synced to particle cycle"
```

---

### Task 5: Create SwapFloatingLabels layer

**Files:**
- Create: `src/components/remotion/swaps/layers/SwapFloatingLabels.tsx`

- [ ] **Step 1: Create the SwapFloatingLabels component**

Pattern follows `src/components/remotion/layers/FloatingElements.tsx` but uses swap-specific data and no ticker tape. Each label uses its own color (teal or gold).

```tsx
// src/components/remotion/swaps/layers/SwapFloatingLabels.tsx
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FLOATING_LABELS } from "../swaps-data";

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

  const fadeIn = interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cyclic fade: each label fades in and out on its own schedule
  const cycleFrame = (frame + cycleOffset) % (CYCLE_DURATION * 2);
  const cycleOpacity = interpolate(
    cycleFrame,
    [0, CYCLE_DURATION * 0.3, CYCLE_DURATION, CYCLE_DURATION * 1.3, CYCLE_DURATION * 2],
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
        color,
        opacity: fadeIn * cycleOpacity * 0.15,
        pointerEvents: "none",
      }}
    >
      {value}
    </div>
  );
};

export const SwapFloatingLabels: React.FC = () => {
  return (
    <AbsoluteFill>
      {FLOATING_LABELS.map((label, i) => (
        <FloatingLabel key={i} {...label} />
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
git add src/components/remotion/swaps/layers/SwapFloatingLabels.tsx
git commit -m "feat: add SwapFloatingLabels layer with teal/gold drifting rate labels"
```

---

### Task 6: Create SwapsAnimation composition and SwapsPlayer

**Files:**
- Create: `src/components/remotion/swaps/SwapsAnimation.tsx`
- Create: `src/components/remotion/swaps/SwapsPlayer.tsx`

- [ ] **Step 1: Create SwapsAnimation composition**

Pattern follows `src/components/remotion/HeroAnimation.tsx`. Combines 4 layers with Sequence timing.

```tsx
// src/components/remotion/swaps/SwapsAnimation.tsx
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { BackgroundGrid } from "../layers/BackgroundGrid";
import { SwapFlow } from "./layers/SwapFlow";
import { PaymentTimeline } from "./layers/PaymentTimeline";
import { SwapFloatingLabels } from "./layers/SwapFloatingLabels";
import { COLOR_BG } from "./swaps-data";

export const SwapsAnimation: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLOR_BG }}>
      {/* Layer 1: Background Grid (reused with unique pattern ID) */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={0}>
        <BackgroundGrid patternId="swaps-grid" />
      </Sequence>

      {/* Layer 2: Core Swap Flow — counterparties + arcs + particles */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <SwapFlow />
      </Sequence>

      {/* Layer 3: Payment Timeline with pulsing ticks */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <PaymentTimeline />
      </Sequence>

      {/* Layer 4: Floating rate labels */}
      <Sequence from={0} durationInFrames={durationInFrames} premountFor={1 * fps}>
        <SwapFloatingLabels />
      </Sequence>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Create SwapsPlayer wrapper**

Pattern follows `src/components/remotion/HeroPlayer.tsx`.

```tsx
// src/components/remotion/swaps/SwapsPlayer.tsx
"use client";

import { Player } from "@remotion/player";
import { SwapsAnimation } from "./SwapsAnimation";

const COMPOSITION_WIDTH = 1920;
const COMPOSITION_HEIGHT = 800;
const FPS = 30;
const DURATION_IN_FRAMES = 300;

export const SwapsPlayer: React.FC = () => {
  return (
    <Player
      component={SwapsAnimation}
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
git add src/components/remotion/swaps/SwapsAnimation.tsx src/components/remotion/swaps/SwapsPlayer.tsx
git commit -m "feat: add SwapsAnimation composition and SwapsPlayer wrapper"
```

---

### Task 7: Wire up SwapsPlayer in the swaps page

**Files:**
- Modify: `src/app/swaps/page.tsx`

- [ ] **Step 1: Update swaps page to pass SwapsPlayer as heroPlayer**

Replace the entire contents of `src/app/swaps/page.tsx`:

```tsx
// src/app/swaps/page.tsx
import dynamic from "next/dynamic";
import { ModulePage } from '@/components/landing/module-page';

const SwapsPlayer = dynamic(
  () => import("@/components/remotion/swaps/SwapsPlayer").then((m) => ({ default: m.SwapsPlayer })),
  { ssr: false }
);

export default function SwapsPage() {
  return <ModulePage themeId="swaps" heroPlayer={<SwapsPlayer />} />;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Visual verification**

Run: `npm run dev`
Navigate to `http://localhost:3000/swaps`
Expected:
- Desktop: Full-width hero with dark background. Two counterparty circles (teal "Parte A" on left, gold "Parte B" on right) connected by two curved arcs. Teal particles flow along the top arc left→right, gold particles flow along the bottom arc right→left. Payment timeline ticks pulse below. Floating rate labels (CDI, USDBRL, etc.) drift at low opacity. Title "Swaps" and description fade in after 7 seconds on the left 35%. Scenario cards below.
- Mobile: No animation, text shows immediately on gradient background.

Navigate to `http://localhost:3000/` — landing page hero animation unchanged.
Navigate to `http://localhost:3000/futuros` — original plain header, no hero animation.

- [ ] **Step 4: Commit**

```bash
git add src/app/swaps/page.tsx
git commit -m "feat: integrate SwapsPlayer into Módulo 3 opening page"
```

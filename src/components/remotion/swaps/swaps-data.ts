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

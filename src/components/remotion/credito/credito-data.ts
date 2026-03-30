// src/components/remotion/credito/credito-data.ts

export type Point = { x: number; y: number };

export type CreditoFloatingLabel = {
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

// ── Credit Spread Curve ─────────────────────────────────────────────
export const VIEWBOX_W = 600;
export const VIEWBOX_H = 350;

export const AXIS_LEFT = 50;
export const AXIS_RIGHT = 550;
export const AXIS_TOP = 30;
export const AXIS_BOTTOM = 300;

export const MATURITIES = ["1Y", "2Y", "3Y", "5Y", "7Y", "10Y"];

// Risk-free yield curve (lower, teal)
export const RISK_FREE_CURVE: Point[] = [
  { x: 50, y: 250 },
  { x: 150, y: 230 },
  { x: 250, y: 215 },
  { x: 350, y: 200 },
  { x: 450, y: 190 },
  { x: 550, y: 185 },
];

// Corporate yield curve (upper, gold)
export const CORPORATE_CURVE: Point[] = [
  { x: 50, y: 220 },
  { x: 150, y: 190 },
  { x: 250, y: 165 },
  { x: 350, y: 145 },
  { x: 450, y: 130 },
  { x: 550, y: 120 },
];

// Spread indicator at 5Y maturity (index 3, x=350)
export const SPREAD_X = 350;
export const SPREAD_Y_TOP = 145; // corporate at 5Y
export const SPREAD_Y_BOTTOM = 200; // risk-free at 5Y

// ── CDS Flow ────────────────────────────────────────────────────────
export const PROTECTION_BUYER: Point = { x: 100, y: 100 };
export const PROTECTION_SELLER: Point = { x: 500, y: 100 };
export const REFERENCE_ENTITY: Point = { x: 300, y: 220 };

export const PREMIUM_ARC = {
  start: { x: 145, y: 75 },
  control: { x: 300, y: 10 },
  end: { x: 455, y: 75 },
};

export const PROTECTION_ARC = {
  start: { x: 455, y: 125 },
  control: { x: 300, y: 180 },
  end: { x: 145, y: 125 },
};

export const PARTICLES_PER_ARC = 4;
export const PARTICLE_CYCLE_FRAMES = 90;
export const CREDIT_EVENT_CYCLE = 180;
export const CREDIT_EVENT_TRIGGER_FRAME = 150;

// ── Floating Labels ─────────────────────────────────────────────────
export const FLOATING_LABELS: CreditoFloatingLabel[] = [
  { value: "CDS 150bps", x: 0.72, y: 0.10, fontSize: 18, cycleOffset: 0, driftX: 0, driftY: -0.25, color: COLOR_TEAL },
  { value: "Spread 2.3%", x: 0.82, y: 0.65, fontSize: 14, cycleOffset: 50, driftX: 0.1, driftY: -0.15, color: COLOR_TEAL },
  { value: "BBB+", x: 0.58, y: 0.08, fontSize: 15, cycleOffset: 100, driftX: -0.15, driftY: 0, color: COLOR_GOLD },
  { value: "Default Prob 1.2%", x: 0.85, y: 0.40, fontSize: 13, cycleOffset: 150, driftX: -0.1, driftY: -0.2, color: COLOR_RED },
  { value: "Recovery 40%", x: 0.65, y: 0.55, fontSize: 14, cycleOffset: 200, driftX: 0.08, driftY: -0.1, color: COLOR_GOLD },
  { value: "CVA", x: 0.90, y: 0.18, fontSize: 16, cycleOffset: 250, driftX: -0.08, driftY: 0.1, color: COLOR_TEAL },
];

// ── Utility Functions ───────────────────────────────────────────────

export function getQuadraticPoint(t: number, p0: Point, p1: Point, p2: Point): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}

/**
 * Convert points to a smooth SVG cubic bezier path (Catmull-Rom → Bezier).
 */
export function smoothCurvePath(pts: Point[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * Approximate length of a polyline through given points (with curve buffer).
 */
export function approximatePathLength(pts: Point[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len * 1.15;
}

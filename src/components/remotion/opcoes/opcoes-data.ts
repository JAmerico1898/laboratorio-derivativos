// src/components/remotion/opcoes/opcoes-data.ts

export type Point = { x: number; y: number };

export type OpcoesFloatingLabel = {
  value: string;
  x: number;
  y: number;
  fontSize: number;
  cycleOffset: number;
  driftX: number;
  driftY: number;
  color: string;
};

export type GreekGaugeConfig = {
  symbol: string;
  label: string;
  delay: number; // entrance frame delay
};

// ── Colors ──────────────────────────────────────────────────────────
export const COLOR_BG = "#0a1628";
export const COLOR_TEAL = "#8df5e4";
export const COLOR_GOLD = "#f5c842";
export const COLOR_BULLISH = "#00c853";
export const COLOR_BEARISH = "#ff1744";

// ── SVG ViewBox for Payoff Diagram ──────────────────────────────────
// ViewBox: 0 0 600 350
// Origin (0,0) at top-left. Y increases downward.
// Axes: x-axis at y=245 (zero P&L line), y-axis at x=50
// Strike K at x=300

export const VIEWBOX_W = 600;
export const VIEWBOX_H = 350;

// Axis positions
export const AXIS_LEFT = 50;
export const AXIS_RIGHT = 550;
export const AXIS_TOP = 30;
export const AXIS_BOTTOM = 300;
export const ZERO_Y = 175; // where P&L = 0
export const STRIKE_X = 300; // strike price K

// Premium offset (distance below zero line for flat portion)
export const PREMIUM_OFFSET = 70; // pixels below zero line

// Call payoff polyline points: flat at -premium below K, then angled up above K
export const CALL_POINTS: Point[] = [
  { x: AXIS_LEFT, y: ZERO_Y + PREMIUM_OFFSET },
  { x: STRIKE_X, y: ZERO_Y + PREMIUM_OFFSET },
  { x: AXIS_RIGHT, y: AXIS_TOP + 20 },
];

// Put payoff polyline points: angled down above K (from top-left), then flat at -premium
export const PUT_POINTS: Point[] = [
  { x: AXIS_LEFT, y: AXIS_TOP + 20 },
  { x: STRIKE_X, y: ZERO_Y + PREMIUM_OFFSET },
  { x: AXIS_RIGHT, y: ZERO_Y + PREMIUM_OFFSET },
];

// Break-even points (where payoff crosses zero)
// Call break-even: slightly above K (K + premium)
export const CALL_BREAKEVEN: Point = { x: 370, y: ZERO_Y };
// Put break-even: slightly below K (K - premium)
export const PUT_BREAKEVEN: Point = { x: 230, y: ZERO_Y };

// ── Greeks Gauge Configs ────────────────────────────────────────────
export const GREEKS: GreekGaugeConfig[] = [
  { symbol: "Δ", label: "Delta", delay: 80 },
  { symbol: "Γ", label: "Gamma", delay: 90 },
  { symbol: "θ", label: "Theta", delay: 100 },
  { symbol: "ν", label: "Vega", delay: 110 },
];

// Gauge row position: below the payoff diagram within the same SVG
export const GAUGE_ROW_Y = 320;
export const GAUGE_SPACING = 120;
export const GAUGE_START_X = 180;

// ── Floating Labels ─────────────────────────────────────────────────
export const FLOATING_LABELS: OpcoesFloatingLabel[] = [
  { value: "Call R$3.20", x: 0.72, y: 0.10, fontSize: 18, cycleOffset: 0, driftX: 0, driftY: -0.25, color: COLOR_TEAL },
  { value: "Put R$1.85", x: 0.80, y: 0.65, fontSize: 14, cycleOffset: 50, driftX: 0.1, driftY: -0.15, color: COLOR_GOLD },
  { value: "K = 52", x: 0.58, y: 0.08, fontSize: 15, cycleOffset: 100, driftX: -0.15, driftY: 0, color: COLOR_TEAL },
  { value: "σ = 28%", x: 0.85, y: 0.40, fontSize: 16, cycleOffset: 150, driftX: -0.1, driftY: -0.2, color: COLOR_TEAL },
  { value: "Δ = 0.65", x: 0.65, y: 0.55, fontSize: 13, cycleOffset: 200, driftX: 0.08, driftY: -0.1, color: COLOR_TEAL },
  { value: "θ = −0.04", x: 0.62, y: 0.75, fontSize: 14, cycleOffset: 250, driftX: -0.12, driftY: 0.1, color: COLOR_GOLD },
];

/**
 * Convert an array of Points to an SVG polyline points string.
 */
export function pointsToString(pts: Point[]): string {
  return pts.map((p) => `${p.x},${p.y}`).join(" ");
}

/**
 * Calculate the approximate total length of a polyline (for dashoffset animation).
 */
export function polylineLength(pts: Point[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

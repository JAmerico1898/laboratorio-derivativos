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

export const COE_CENTER: Point = { x: 300, y: 175 };
export const COE_WIDTH = 240;
export const COE_HEIGHT = 140;

export const ZERO_COUPON_X = 130;
export const CALL_OPTION_X = 470;
export const HALF_WIDTH = 100;
export const HALF_HEIGHT = 140;

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
  { value: "Callable Bond", x: 0.42, y: 0.82, fontSize: 14, cycleOffset: 50, driftX: 0.1, driftY: -0.15, color: COLOR_GOLD },
  { value: "Conversível", x: 0.58, y: 0.08, fontSize: 15, cycleOffset: 100, driftX: -0.15, driftY: 0, color: COLOR_TEAL },
  { value: "Cap/Floor CDI", x: 0.85, y: 0.40, fontSize: 13, cycleOffset: 150, driftX: -0.1, driftY: -0.2, color: COLOR_RED },
  { value: "Pré-pagamento", x: 0.78, y: 0.82, fontSize: 14, cycleOffset: 200, driftX: 0.08, driftY: -0.1, color: COLOR_GOLD },
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

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

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

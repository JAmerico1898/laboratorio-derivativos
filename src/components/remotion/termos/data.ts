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

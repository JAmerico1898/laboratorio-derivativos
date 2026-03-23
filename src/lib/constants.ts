/**
 * Paleta de cores para componentes SVG / Recharts.
 * Tailwind classes são usadas em todo o resto.
 */
export const COLORS = {
  bg: "#f8f9fa",
  card: "#ffffff",
  cardHover: "#f3f4f5",
  border: "#bfc9c4",
  accent: "#006b5f",
  accentDim: "rgba(0,107,95,0.10)",
  green: "#059669",
  greenDim: "rgba(5,150,105,0.10)",
  red: "#dc2626",
  redDim: "rgba(220,38,38,0.10)",
  gold: "#d97706",
  goldDim: "rgba(217,119,6,0.10)",
  text: "#191c1d",
  textMuted: "#3f4945",
  textDim: "#707975",
} as const;

export type ColorKey = keyof typeof COLORS;

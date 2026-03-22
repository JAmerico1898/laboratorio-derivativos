/**
 * Paleta de cores do laboratório de derivativos.
 * Usada em estilos inline dos componentes React.
 */
export const COLORS = {
  bg: "#0a0f1a",
  card: "#111827",
  cardHover: "#1a2235",
  border: "#1e2a3a",
  accent: "#22d3ee",
  accentDim: "rgba(34,211,238,0.15)",
  green: "#34d399",
  greenDim: "rgba(52,211,153,0.15)",
  red: "#f87171",
  redDim: "rgba(248,113,113,0.15)",
  gold: "#fbbf24",
  goldDim: "rgba(251,191,36,0.15)",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#475569",
} as const;

export type ColorKey = keyof typeof COLORS;

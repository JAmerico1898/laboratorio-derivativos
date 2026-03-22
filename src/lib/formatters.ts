/**
 * Formata um valor como moeda BRL (Real brasileiro).
 * Exemplo: fmt(1234567.89) → "R$ 1.234.567,89"
 */
export const fmt = (v: number): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);

/**
 * Formata uma taxa com 4 casas decimais no padrão pt-BR.
 * Exemplo: fmtRate(5.2812) → "5,2812"
 */
export const fmtRate = (v: number): string =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(v);

/**
 * Formata um valor como moeda USD (Dólar americano).
 * Exemplo: fmtUSD(1234567) → "USD 1,234,567"
 */
export const fmtUSD = (v: number): string =>
  "USD " +
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);

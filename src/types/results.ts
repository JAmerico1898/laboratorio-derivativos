/* ═══════════════════════════════════════════════════════════════
   TIPOS — RESULTADOS DE CÁLCULO
   ═══════════════════════════════════════════════════════════════ */

/** Resultado do motor genérico (NDF, Futuros, Swaps) */
export interface GenericResult {
  ndfPnL: number;
  forwardRate: number;
  fixingRate: number;
  notional: number;
  hedgedNotional: number;
  spotConversion: number;
  hedgedConversion: number;
  hedgeBenefit: number;
  effectiveRate: number;
}

/**
 * Resultado dos derivativos embutidos.
 * Cada strategy retorna campos distintos — tipo flexível para evitar over-typing.
 */
export type EmbeddedResult = Record<string, number | boolean | undefined>;

/**
 * Resultado dos derivativos de crédito.
 * Estratégias: cds_hedge, trs, cds_spec, basis_trade.
 */
export type CreditResult = Record<string, number | string | boolean | undefined>;

/**
 * Resultado do motor de opções.
 * Estratégias: long_put_hedge, collar, straddle, risk_reversal.
 */
export type OptionsResult = Record<string, number | boolean | undefined>;

/** Resposta registrada em uma etapa de escolha */
export interface Answer {
  stepId: string;
  choiceId: string;
  correct: boolean;
  score: number;
}

/** Cenário concluído com pontuação final */
export interface CompletedScenario {
  id: string;
  score: number;
  totalScore: number;
}

/* ═══════════════════════════════════════════════════════════════
   TIPOS — CENÁRIOS
   ═══════════════════════════════════════════════════════════════ */

export interface Theme {
  id: string;
  label: string;
  icon: string;
}

/**
 * MarketData é flexível: diferentes cenários têm campos muito distintos.
 * NDF/Futuros/Swaps usam spotRate, forwardRate90d, notional_usd, etc.
 * Opções adicionam premium, strike, lotSize, putStrike, callStrike, etc.
 * Crédito usa nocional, spreadBps, recoveryRate, dv01Per10M, etc.
 * Embutidos usam investimento, saldo, participacao, barreira, etc.
 */
export type MarketData = Record<string, number | string | boolean>;

export interface Choice {
  id: string;
  label: string;
  correct: boolean;
  score: number;
  feedback: string;
  next: string;
}

export interface ChoiceStep {
  id: string;
  type: "choice";
  prompt: string;
  choices: Choice[];
}

export interface ResolutionScenario {
  id: string;
  label: string;
  fixingRate: number;
  description: string;
}

export interface ResolutionStep {
  id: string;
  type: "resolution";
  prompt: string;
  scenarios: ResolutionScenario[];
}

export type Step = ChoiceStep | ResolutionStep;

export interface ContextData {
  narrative: string;
  marketData: MarketData;
  displayFields: [string, string][];
  question: string;
}

export interface Scenario {
  id: string;
  title: string;
  theme: string;
  themeId: string;
  instrument: string;
  difficulty: string;
  context: ContextData;
  steps: Step[];
  // Optional strategy fields present in opcoes, credito, embutidos
  optionStrategy?: string;
  creditStrategy?: string;
  embeddedStrategy?: string;
}

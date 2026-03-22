import type { Scenario } from "../../types/scenario";
import { NDF_SCENARIOS } from "./ndf";
import { FUTUROS_SCENARIOS } from "./futuros";
import { SWAPS_SCENARIOS } from "./swaps";
import { OPCOES_SCENARIOS } from "./opcoes";
import { CREDITO_SCENARIOS } from "./credito";
import { EMBUTIDOS_SCENARIOS } from "./embutidos";

export { NDF_SCENARIOS, FUTUROS_SCENARIOS, SWAPS_SCENARIOS, OPCOES_SCENARIOS, CREDITO_SCENARIOS, EMBUTIDOS_SCENARIOS };

export const ALL_SCENARIOS: Scenario[] = [
  ...NDF_SCENARIOS,
  ...FUTUROS_SCENARIOS,
  ...SWAPS_SCENARIOS,
  ...OPCOES_SCENARIOS,
  ...CREDITO_SCENARIOS,
  ...EMBUTIDOS_SCENARIOS,
];

/**
 * Returns all scenarios that belong to the given themeId.
 * themeId matches the Scenario.themeId field (e.g. "ndf", "futuros", etc.)
 */
export function getScenariosByTheme(themeId: string): Scenario[] {
  return ALL_SCENARIOS.filter((s) => s.themeId === themeId);
}

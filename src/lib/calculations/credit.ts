import type { Scenario, ResolutionScenario } from "../../types/scenario";
import type { CreditResult } from "../../types/results";

/**
 * Calcula o resultado de um derivativo de crédito.
 * Suporta: cds_hedge, trs, cds_spec, basis_trade.
 *
 * @param scenarioData - cenário completo (lê creditStrategy e marketData)
 * @param scenario     - cenário de resolução selecionado pelo usuário
 */
export function calculateCreditResult(
  scenarioData: Scenario,
  scenario: ResolutionScenario,
): CreditResult {
  const md = scenarioData.context.marketData;
  const strat = scenarioData.creditStrategy;
  const fixing = scenario.fixingRate;

  if (strat === "cds_hedge") {
    const n = md.nocional as number;
    const spreadAnual = ((md.spreadBps as number) / 10000) * n;
    const custoTotal = spreadAnual * (md.prazoAnos as number);
    const isDefault = scenario.id === "default";
    const spreadFinal = fixing;
    const dv01Total = (md.dv01Per10M as number) * (n / 10000000);

    if (isDefault) {
      const mesesAteDefault = 12;
      const spreadPagoAteDefault = spreadAnual * (mesesAteDefault / 12);
      const indenizacao = n * (1 - (md.recoveryRate as number));
      const resultadoLiquido = indenizacao - spreadPagoAteDefault;
      return {
        custoTotal,
        spreadPagoAteDefault,
        indenizacao,
        resultadoLiquido,
        isDefault,
        nocional: n,
        recoveryRate: md.recoveryRate as number,
        spreadInicial: md.spreadBps as number,
        spreadFinal,
        lgd: 1 - (md.recoveryRate as number),
        dv01Total,
        mtm: 0,
      };
    } else {
      const mtm = dv01Total * (spreadFinal - (md.spreadBps as number));
      const resultadoLiquido = mtm;
      return {
        custoTotal,
        indenizacao: 0,
        resultadoLiquido,
        isDefault,
        nocional: n,
        recoveryRate: md.recoveryRate as number,
        spreadInicial: md.spreadBps as number,
        spreadFinal,
        lgd: 1 - (md.recoveryRate as number),
        dv01Total,
        mtm,
      };
    }
  }

  if (strat === "trs") {
    const n = md.nocional as number;
    const carry = ((md.spreadCupom as number) - (md.spreadFinanc as number)) * n;
    const deltaPreco = (fixing / 100) * n;
    const total = carry + deltaPreco;
    return {
      carry,
      deltaPreco,
      total,
      nocional: n,
      spreadLiq: (md.spreadCupom as number) - (md.spreadFinanc as number),
      varPct: fixing,
    };
  }

  if (strat === "cds_spec") {
    const n = md.nocional as number;
    const dv01Total = (md.dv01Per10M as number) * (n / 10000000);
    const spreadVar = fixing - (md.spreadBps as number);
    const mtm = dv01Total * spreadVar;
    const carryAnual = ((md.spreadBps as number) / 10000) * n;
    const resultadoLiquido = mtm - carryAnual;
    return {
      dv01Total,
      spreadInicial: md.spreadBps as number,
      spreadFinal: fixing,
      spreadVar,
      mtm,
      carryAnual,
      resultadoLiquido,
      nocional: n,
      moeda: (md.moeda as string) || "BRL",
    };
  }

  if (strat === "basis_trade") {
    const n = md.nocional as number;
    const dv01Total = (md.dv01Per10M as number) * (n / 10000000);
    const baseInicial = (md.cdsSpread as number) - (md.bondSpread as number);
    const baseFinal = fixing - (md.bondSpread as number);
    const baseConvergence = baseInicial - baseFinal;
    const mtmBasis = dv01Total * baseConvergence;
    const carryAnualBps = (md.bondSpread as number) - (md.cdsSpread as number);
    const carryAnual = (carryAnualBps / 10000) * n;
    const meses = scenario.id === "convergiu" ? 4 : 12;
    const carryPago = carryAnual * (meses / 12);
    const resultadoLiquido = mtmBasis + carryPago;
    return {
      dv01Total,
      cdsInicial: md.cdsSpread as number,
      cdsFinal: fixing,
      cdsVar: fixing - (md.cdsSpread as number),
      mtmCDS: mtmBasis,
      carryAnual,
      carryPago,
      resultadoLiquido,
      nocional: n,
      baseInicial,
      baseFinal,
      meses,
      bondSpread: md.bondSpread as number,
      baseConvergence,
    };
  }

  return {};
}

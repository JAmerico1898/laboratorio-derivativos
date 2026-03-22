import type { Scenario, ResolutionScenario } from "../../types/scenario";
import type { EmbeddedResult } from "../../types/results";

/**
 * Calcula o resultado de um derivativo embutido.
 * Suporta: coe, prepayment, callable, fx_trigger, trs_sintetico,
 *          credit_stepup, cap_floor, convertible.
 *
 * @param scenarioData - cenário completo (lê embeddedStrategy e marketData)
 * @param scenario     - cenário de resolução selecionado pelo usuário
 */
export function calculateEmbeddedResult(
  scenarioData: Scenario,
  scenario: ResolutionScenario,
): EmbeddedResult {
  const md = scenarioData.context.marketData;
  const strat = scenarioData.embeddedStrategy;
  const fix = scenario.fixingRate;

  if (strat === "coe") {
    const inv = md.investimento as number;
    const cdiTotal = inv * (Math.pow(1 + (md.cdi as number), md.prazoAnos as number) - 1);
    const cdiResult = inv + cdiTotal;
    const retornoSP = fix / 100;
    const participacao = retornoSP > 0 ? (md.participacao as number) * retornoSP * inv : 0;
    const coeResult = inv + participacao;
    const diff = coeResult - cdiResult;
    return { inv, cdiTotal, cdiResult, retornoSP, participacao, coeResult, diff };
  }

  if (strat === "prepayment") {
    const economia = ((md.spreadAtual as number) - (md.spreadNovo as number)) * (md.saldo as number);
    const economiaTotal = economia * (md.prazoRestante as number);
    const multa = (md.multa as number) * (md.saldo as number);
    const ganhoLiquido = economiaTotal - multa;
    return { economia, economiaTotal, multa, ganhoLiquido, saldo: md.saldo as number };
  }

  if (strat === "callable") {
    const premioAnual = (md.premio as number) * 100; // exibido em bps
    return {
      premioAnual,
      callAno: md.callAno as number,
      prazo: md.prazo as number,
      cdiFinal: fix,
    };
  }

  if (strat === "fx_trigger") {
    const triggered =
      fix >= (md.barreira as number) ||
      (fix > (md.barreira as number) - 0.05 && scenario.id === "trigger_near");
    const custoBase = (md.taxaBase as number) * (md.saldo as number);
    const custoTrigger = ((md.taxaBase as number) + (md.stepUp as number)) * (md.saldo as number);
    const impacto = triggered ? (md.stepUp as number) * (md.saldo as number) : 0;
    return {
      triggered,
      custoBase,
      custoTrigger,
      impacto,
      barreira: md.barreira as number,
      fixDolar: fix,
      saldo: md.saldo as number,
      taxaBase: md.taxaBase as number,
      stepUp: md.stepUp as number,
    };
  }

  if (strat === "trs_sintetico") {
    const carry = ((md.spreadRef as number) - (md.spreadEstruturacao as number)) * (md.nocional as number);
    const deltaPreco = (fix / 100) * (md.nocional as number);
    const total =
      scenario.id === "banco_quebrou"
        ? -(md.nocional as number)
        : carry * (md.prazo as number) + deltaPreco;
    return {
      carry,
      deltaPreco,
      total,
      nocional: md.nocional as number,
      bancoQuebrou: scenario.id === "banco_quebrou",
    };
  }

  if (strat === "credit_stepup") {
    const triggered = fix > 0;
    const custoBase = (md.spreadBase as number) * (md.saldo as number);
    const custoPos = (md.spreadPos as number) * (md.saldo as number);
    const impacto = triggered ? ((md.spreadPos as number) - (md.spreadBase as number)) * (md.saldo as number) : 0;
    return { triggered, custoBase, custoPos, impacto, saldo: md.saldo as number };
  }

  if (strat === "cap_floor") {
    const custoRaw = fix / 100 + (md.spread as number);
    const custoEfetivo = Math.min(Math.max(custoRaw, md.floor as number), md.cap as number);
    const impactoCap = custoRaw > (md.cap as number) ? (custoRaw - (md.cap as number)) * (md.saldo as number) : 0;
    const impactoFloor = custoRaw < (md.floor as number) ? ((md.floor as number) - custoRaw) * (md.saldo as number) : 0;
    return {
      cdiFinal: fix,
      custoRaw,
      custoEfetivo,
      impactoCap,
      impactoFloor,
      cap: md.cap as number,
      floor: md.floor as number,
      spread: md.spread as number,
      saldo: md.saldo as number,
    };
  }

  if (strat === "convertible") {
    const precoConv = md.precoConversao as number;
    const acoesPorMil = 1000 / precoConv;
    const valorConversao = acoesPorMil * fix;
    const ganhoConversao = Math.max(valorConversao - 1000, 0);
    const ganhoPct = ganhoConversao / 1000;
    const ganhoTotal = ganhoPct * (md.nocional as number);
    const cupomSacrificado =
      ((md.cupomPlain as number) - (md.cupomConv as number)) *
      (md.nocional as number) *
      (md.prazo as number);
    return {
      precoConv,
      precoFinal: fix,
      acoesPorMil,
      valorConversao,
      ganhoConversao,
      ganhoPct,
      ganhoTotal,
      cupomSacrificado,
      nocional: md.nocional as number,
      valeConverter: fix > precoConv,
    };
  }

  return {};
}

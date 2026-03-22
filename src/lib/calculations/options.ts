import type { Scenario } from "../../types/scenario";
import type { OptionsResult } from "../../types/results";

/**
 * Calcula o resultado de P&L de uma estratégia de opções.
 * Suporta: long_put_hedge, collar, straddle, risk_reversal.
 *
 * @param scenarioData - cenário completo (lê optionStrategy e marketData)
 * @param fixingRate   - preço do ativo no vencimento
 */
export function calculateOptionsResult(
  scenarioData: Scenario,
  fixingRate: number,
): OptionsResult {
  const md = scenarioData.context.marketData;
  const strat = scenarioData.optionStrategy;
  const spot = md.spotRate as number;
  const S = fixingRate;

  if (strat === "long_put_hedge") {
    const K = md.strike as number;
    const prem = md.premium as number;
    const n = md.notional_usd as number;
    const putIntrinsic = Math.max(K - S, 0);
    const putPnL = (putIntrinsic - prem) * n;
    const carteiraPnL = (S - spot) * n;
    const combinedPnL = carteiraPnL + putPnL;
    return {
      putIntrinsic,
      putPnL,
      carteiraPnL,
      combinedPnL,
      premium: prem,
      strike: K,
      spot,
      fixing: S,
      notional: n,
      breakeven: K - prem,
    };
  }

  if (strat === "collar") {
    const pK = md.putStrike as number;
    const pP = md.putPremium as number;
    const cK = md.callStrike as number;
    const cP = md.callPremium as number;
    const n = md.notional_usd as number;
    const netCost = pP - cP;
    const putPayoff = Math.max(pK - S, 0);
    const callPayoff = -Math.max(S - cK, 0); // call vendida
    const optionsPnL = (putPayoff + callPayoff - netCost) * n;
    const receita = S * n;
    const receitaEfetiva =
      receita + (putPayoff + callPayoff) * n - netCost * n;
    return {
      putPayoff,
      callPayoff,
      netCost,
      optionsPnL,
      receita,
      receitaEfetiva,
      putStrike: pK,
      callStrike: cK,
      putPremium: pP,
      callPremium: cP,
      spot,
      fixing: S,
      notional: n,
    };
  }

  if (strat === "straddle") {
    const K = md.strike as number;
    const cP = md.callPremium as number;
    const pP = md.putPremium as number;
    const totalPrem = cP + pP;
    const n = md.notional_usd as number;
    const callIntrinsic = Math.max(S - K, 0);
    const putIntrinsic = Math.max(K - S, 0);
    const pnlPerUnit = callIntrinsic + putIntrinsic - totalPrem;
    const totalPnL = pnlPerUnit * n;
    return {
      callIntrinsic,
      putIntrinsic,
      totalPrem,
      pnlPerUnit,
      totalPnL,
      strike: K,
      spot,
      fixing: S,
      notional: n,
      breakUp: K + totalPrem,
      breakDown: K - totalPrem,
    };
  }

  if (strat === "risk_reversal") {
    const pK = md.putStrike as number;
    const pP = md.putPremium as number;
    const cK = md.callStrike as number;
    const cP = md.callPremium as number;
    const n = md.notional_usd as number;
    const credit = pP - cP;
    const putLoss = -Math.max(pK - S, 0); // put vendida
    const callGain = Math.max(S - cK, 0); // call comprada
    const pnlPerUnit = putLoss + callGain + credit;
    const totalPnL = pnlPerUnit * n;
    return {
      putLoss,
      callGain,
      credit,
      pnlPerUnit,
      totalPnL,
      putStrike: pK,
      callStrike: cK,
      spot,
      fixing: S,
      notional: n,
    };
  }

  return {};
}

/**
 * Gera pontos do gráfico de payoff para estratégias de opções.
 *
 * @param scenarioData - cenário completo (lê optionStrategy e marketData)
 */
export function generateOptionsPayoffData(
  scenarioData: Scenario,
): { fixing: number; pnl: number; zero: number }[] {
  const md = scenarioData.context.marketData;
  const strat = scenarioData.optionStrategy;
  const spot = md.spotRate as number;
  const points: { fixing: number; pnl: number; zero: number }[] = [];
  const min = spot * 0.7;
  const max = spot * 1.3;
  const step = (max - min) / 80;

  for (let S = min; S <= max; S += step) {
    let pnl = 0;

    if (strat === "long_put_hedge") {
      const putPnL =
        (Math.max((md.strike as number) - S, 0) - (md.premium as number)) *
        (md.notional_usd as number);
      const carteira = (S - spot) * (md.notional_usd as number);
      pnl = putPnL + carteira;
    } else if (strat === "collar") {
      const putPay = Math.max((md.putStrike as number) - S, 0);
      const callPay = -Math.max(S - (md.callStrike as number), 0);
      const net = (md.putPremium as number) - (md.callPremium as number);
      pnl =
        (S - spot + putPay + callPay - net) * (md.notional_usd as number);
    } else if (strat === "straddle") {
      const callI = Math.max(S - (md.strike as number), 0);
      const putI = Math.max((md.strike as number) - S, 0);
      pnl =
        (callI +
          putI -
          (md.callPremium as number) -
          (md.putPremium as number)) *
        (md.notional_usd as number);
    } else if (strat === "risk_reversal") {
      const putL = -Math.max((md.putStrike as number) - S, 0);
      const callG = Math.max(S - (md.callStrike as number), 0);
      const credit =
        (md.putPremium as number) - (md.callPremium as number);
      pnl = (putL + callG + credit) * (md.notional_usd as number);
    }

    points.push({
      fixing: parseFloat(S.toFixed(2)),
      pnl: parseFloat(pnl.toFixed(0)),
      zero: 0,
    });
  }

  return points;
}

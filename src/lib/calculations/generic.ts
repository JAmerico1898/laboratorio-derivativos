import type { MarketData } from "../../types/scenario";
import type { GenericResult as GR } from "../../types/results";

/**
 * Calcula o resultado de P&L de um derivativo genérico (NDF, Futuro, Swap).
 *
 * @param marketData  - dados de mercado do cenário (deve conter notional_usd)
 * @param forwardRate - taxa forward contratada
 * @param fixingRate  - taxa de fixing na liquidação
 * @param position    - "sell_usd" (vendido em USD) ou "buy_usd" (comprado em USD)
 * @param hedgeRatio  - proporção do nocional com hedge (0 a 1, padrão 1.0)
 */
export function calculateResult(
  marketData: MarketData,
  forwardRate: number,
  fixingRate: number,
  position: "sell_usd" | "buy_usd",
  hedgeRatio = 1.0,
): GR {
  const notional = marketData.notional_usd as number;
  const hedgedNotional = notional * hedgeRatio;

  // Cálculo por PU (DI futuro): captura convexidade para movimentos grandes de taxa.
  // Ativado quando o cenário declara `pnlMethod: "di_pu"` em marketData.
  const usePuMethod = marketData.pnlMethod === "di_pu";

  let ndfPnL: number;
  if (usePuMethod) {
    const nContracts = (marketData.nContracts as number) ?? 0;
    const du = (marketData.duDays as number) ?? 252;
    const r0 = forwardRate / 100;
    const rT = fixingRate / 100;
    const pu0 = 100000 / Math.pow(1 + r0, du / 252);
    const puT = pu0 * Math.pow(1 + rT, du / 252);
    const pnlPerContract =
      position === "sell_usd" ? 100000 - puT : puT - 100000;
    ndfPnL = pnlPerContract * nContracts * hedgeRatio;
  } else {
    ndfPnL =
      position === "sell_usd"
        ? (forwardRate - fixingRate) * hedgedNotional
        : (fixingRate - forwardRate) * hedgedNotional;
  }

  const spotConversion = fixingRate * notional;
  const hedgedConversion =
    forwardRate * hedgedNotional + fixingRate * (notional - hedgedNotional);

  return {
    ndfPnL,
    forwardRate,
    fixingRate,
    notional,
    hedgedNotional,
    spotConversion,
    hedgedConversion,
    hedgeBenefit: spotConversion - hedgedConversion,
    effectiveRate: hedgedConversion / notional,
  };
}

/**
 * Gera pontos do gráfico de payoff para um derivativo linear.
 *
 * @param forwardRate - taxa forward (centro do gráfico)
 * @param position    - "sell_usd" | "buy_usd"
 * @param notional    - nocional para escalar o P&L
 */
export function generatePayoffData(
  forwardRate: number,
  position: "sell_usd" | "buy_usd",
  notional: number,
): { fixing: number; pnl: number; zero: number }[] {
  const points: { fixing: number; pnl: number; zero: number }[] = [];
  const min = forwardRate * 0.85;
  const max = forwardRate * 1.15;
  const step = (max - min) / 60;

  for (let fixing = min; fixing <= max; fixing += step) {
    const pnl =
      position === "sell_usd"
        ? (forwardRate - fixing) * notional
        : (fixing - forwardRate) * notional;
    points.push({
      fixing: parseFloat(fixing.toFixed(4)),
      pnl: parseFloat(pnl.toFixed(0)),
      zero: 0,
    });
  }
  return points;
}

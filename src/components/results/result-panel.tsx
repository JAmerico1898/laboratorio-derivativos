import { fmt, fmtRate, fmtPct } from "@/lib/formatters";
import { strings, resultOf } from "@/lib/strings";
import { PayoffChart } from "@/components/charts/payoff-chart";
import { EmbeddedResultPanel } from "./embedded-result-panel";
import { CreditResultPanel } from "./credit-result-panel";
import { OptionsResultPanel } from "./options-result-panel";
import type { GenericResult } from "@/types/results";
import type { Scenario, ResolutionScenario } from "@/types/scenario";

interface ResultPanelProps {
  result: GenericResult;
  scenario: ResolutionScenario;
  position: string;
  forwardChosen: number;
  instrument: string;
  scenarioData: Scenario;
}

export function ResultPanel({
  result,
  scenario,
  position,
  forwardChosen,
  instrument,
  scenarioData,
}: ResultPanelProps) {
  // Delegate to specialized panels
  if (scenarioData?.optionStrategy) {
    return <OptionsResultPanel scenario={scenario} scenarioData={scenarioData} />;
  }
  if (scenarioData?.creditStrategy) {
    return <CreditResultPanel scenario={scenario} scenarioData={scenarioData} />;
  }
  if (scenarioData?.embeddedStrategy) {
    return <EmbeddedResultPanel scenario={scenario} scenarioData={scenarioData} />;
  }

  // Calendar spread detection
  const isSpread = instrument?.includes("Spread");
  if (isSpread) {
    const smd = scenarioData.context.marketData;
    const spreadInitial = (smd.spreadBps as number) || 80;
    const newSpread = scenario.fixingRate; // fixingRate stores new spread in bp
    const cShort = (smd.contractsShort as number) || 5000;
    const cLong = (smd.contractsLong as number) || 3840;
    const duShort = (smd.duShort as number) || 504;
    const duLong = (smd.duLong as number) || 756;
    const rateShort = smd.spotRate as number;
    const rateLong = smd.forwardRate90d as number;
    const rateShortNew = (scenario.rateShortNew as number) ?? rateShort;
    const rateLongNew = (scenario.rateLongNew as number) ?? rateLong;

    // PU-based P&L
    const pu0Short = 100000 / Math.pow(1 + rateShort / 100, duShort / 252);
    const pu0Long = 100000 / Math.pow(1 + rateLong / 100, duLong / 252);
    const puTShort = 100000 / Math.pow(1 + rateShortNew / 100, duShort / 252);
    const puTLong = 100000 / Math.pow(1 + rateLongNew / 100, duLong / 252);
    const dPuShort = puTShort - pu0Short;
    const dPuLong = puTLong - pu0Long;
    // Perna curta: comprou taxa = vendeu PU → P&L = -ΔPU × N
    const pnlShort = -dPuShort * cShort;
    // Perna longa: vendeu taxa = comprou PU → P&L = +ΔPU × N
    const pnlLong = dPuLong * cLong;
    const spreadPnl = pnlShort + pnlLong;
    const spreadChange = spreadInitial - newSpread;
    const isGain = spreadPnl > 0;

    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
          <p className="text-sm leading-relaxed text-on-surface-variant">{scenario.description}</p>
        </div>

        <div className={`rounded-xl border p-6 ${isGain ? "bg-emerald-50 border-emerald-200" : spreadPnl === 0 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {strings.resultCalendarSpread}
          </div>
          <div className={`text-3xl font-extrabold font-mono ${isGain ? "text-emerald-600" : "text-red-600"}`}>
            {spreadPnl >= 0 ? "+" : ""}{fmt(spreadPnl)}
          </div>
          <div className="mt-2 text-sm text-on-surface-variant">
            Spread: {spreadInitial}bps → {newSpread}bps ({spreadChange > 0 ? "comprimiu" : spreadChange < 0 ? "alargou" : "estável"} {Math.abs(spreadChange)}bps)
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant p-6 bg-surface-container-lowest">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
            ① Perna curta — Comprar taxa Jan/27 ({cShort.toLocaleString("pt-BR")} contratos)
          </div>
          <div className="text-sm leading-relaxed text-on-surface">
            <div>(1) Posição: comprar taxa (vender PU) no Jan/27. Taxa: {rateShort.toFixed(2)}% → {rateShortNew.toFixed(2)}%</div>
            <div>(2) PU₀ = 100.000 ÷ (1+{rateShort.toFixed(2)}%)^({duShort}/252) = <strong className="text-secondary">{fmt(pu0Short)}</strong></div>
            <div>(3) PU_T = 100.000 ÷ (1+{rateShortNew.toFixed(2)}%)^({duShort}/252) = <strong className="text-secondary">{fmt(puTShort)}</strong></div>
            <div>(4) ΔPU = {fmt(puTShort)} − {fmt(pu0Short)} = <strong>{dPuShort >= 0 ? "+" : ""}{fmt(dPuShort)}</strong></div>
            <div>(5) P&L curto = −ΔPU × {cShort.toLocaleString("pt-BR")} = <strong className={pnlShort >= 0 ? "text-emerald-600" : "text-red-600"}>{pnlShort >= 0 ? "+" : ""}{fmt(pnlShort)}</strong></div>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant p-6 bg-surface-container-lowest">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
            ② Perna longa — Vender taxa Jan/28 ({cLong.toLocaleString("pt-BR")} contratos)
          </div>
          <div className="text-sm leading-relaxed text-on-surface">
            <div>(1) Posição: vender taxa (comprar PU) no Jan/28. Taxa: {rateLong.toFixed(2)}% → {rateLongNew.toFixed(2)}%</div>
            <div>(2) PU₀ = 100.000 ÷ (1+{rateLong.toFixed(2)}%)^({duLong}/252) = <strong className="text-secondary">{fmt(pu0Long)}</strong></div>
            <div>(3) PU_T = 100.000 ÷ (1+{rateLongNew.toFixed(2)}%)^({duLong}/252) = <strong className="text-secondary">{fmt(puTLong)}</strong></div>
            <div>(4) ΔPU = {fmt(puTLong)} − {fmt(pu0Long)} = <strong>{dPuLong >= 0 ? "+" : ""}{fmt(dPuLong)}</strong></div>
            <div>(5) P&L longo = +ΔPU × {cLong.toLocaleString("pt-BR")} = <strong className={pnlLong >= 0 ? "text-emerald-600" : "text-red-600"}>{pnlLong >= 0 ? "+" : ""}{fmt(pnlLong)}</strong></div>
          </div>
        </div>

        <div className={`rounded-xl border p-6 ${isGain ? "bg-secondary/10 border-secondary/30" : "bg-red-50 border-red-200"}`}>
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
            ③ {strings.netSpreadResult}
          </div>
          <div className="text-sm leading-relaxed text-on-surface">
            <div>(1) Spread inicial = {spreadInitial} bps (Jan/28 {rateLong.toFixed(2)}% − Jan/27 {rateShort.toFixed(2)}%)</div>
            <div>(2) Spread final = {newSpread} bps (Jan/28 {rateLongNew.toFixed(2)}% − Jan/27 {rateShortNew.toFixed(2)}%)</div>
            <div>(3) Compressão/alargamento = {spreadChange > 0 ? "+" : ""}{spreadChange} bps</div>
            <div>(4) P&L total = P&L curto ({pnlShort >= 0 ? "+" : ""}{fmt(pnlShort)}) + P&L longo ({pnlLong >= 0 ? "+" : ""}{fmt(pnlLong)}) = <strong className={isGain ? "text-emerald-600" : "text-red-600"}>{spreadPnl >= 0 ? "+" : ""}{fmt(spreadPnl)}</strong></div>
            <div className="mt-3 rounded-lg bg-surface-container-lowest p-3.5">
              {spreadChange > 0
                ? `O spread comprimiu de ${spreadInitial} para ${newSpread} bps como projetado. A variação de PU na perna longa (${dPuLong >= 0 ? "+" : ""}${fmt(dPuLong)}) superou em valor a da perna curta. O flattener capturou a compressão da curva — resultado de ${spreadPnl >= 0 ? "+" : ""}${fmt(spreadPnl)}.`
                : spreadChange < 0
                ? `O spread alargou de ${spreadInitial} para ${newSpread} bps — oposto da tese. A perna longa sofreu mais do que a curta protegeu. Mesmo com pernas calibradas pela sensibilidade do PU para choques paralelos, o alargamento do spread gera perda líquida de ${fmt(Math.abs(spreadPnl))}. O flattener sofre quando a curva inclina.`
                : `O spread ficou praticamente estável. Sem variação relevante de formato entre as pernas. Resultado marginal.`}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isProfit = result.ndfPnL > 0;
  const colorClass = isProfit ? "text-emerald-600" : result.ndfPnL === 0 ? "text-amber-600" : "text-red-600";
  const bgClass = isProfit
    ? "bg-emerald-50 border-emerald-200"
    : result.ndfPnL === 0
    ? "bg-amber-50 border-amber-200"
    : "bg-red-50 border-red-200";
  const isFut =
    instrument?.includes("Futuro") ||
    instrument?.includes("DI") ||
    instrument?.includes("DOL") ||
    instrument?.includes("Spread");
  const isDI =
    (instrument?.includes("DI") || instrument?.includes("Spread")) &&
    !instrument?.includes("Swap");
  const isSwap = instrument?.includes("Swap");
  const isSwapCambial = instrument?.includes("USD");
  const isSwapCDI = isSwap && !isSwapCambial;
  // Cenários de juros cotam taxa em % a.a.; os de câmbio, em R$/USD.
  const fmtQ = (v: number) => (isDI || isSwapCDI ? fmtPct(v) : fmtRate(v));

  // Hedge scenario detection and combined result
  const isHedgeExportador = scenarioData?.id === "ndf_hedge_exportador";
  const isHedgeImportador = scenarioData?.id === "ndf_importador";
  const isHedgeDI = scenarioData?.id === "fut_hedge_di";
  const isHedgeDOL = scenarioData?.id === "fut_hedge_dolar";
  const isSpecDI = scenarioData?.id === "fut_especulacao_di";
  const isSwapCDIHedge = scenarioData?.id === "swap_cdi_pre";
  const isHedge = isHedgeExportador || isHedgeImportador || isHedgeDI || isHedgeDOL || isSpecDI || isSwapCDIHedge;
  // Exporter: total received = spot conversion + NDF P&L
  // Importer: total cost    = spot conversion − NDF P&L
  const hedgeTotal = isHedgeExportador
    ? result.spotConversion + result.ndfPnL
    : result.spotConversion - result.ndfPnL;
  const hedgeEffRate = result.notional > 0 ? hedgeTotal / result.notional : 0;
  const hedgeRatio = result.notional > 0 ? result.hedgedNotional / result.notional : 1;
  // Conjugated past tense for "Você ___ a R$..."
  const posVerb = isDI
    ? position === "buy_usd"
      ? "comprou taxa"
      : "vendeu taxa"
    : isSwapCDI
    ? position === "sell_usd"
      ? "recebeu taxa fixa"
      : "pagou taxa fixa"
    : isSwapCambial
    ? "contratou swap cambial"
    : position === "sell_usd"
    ? "vendeu"
    : "comprou";
  // Participle for "Se tivesse ___ ao invés de ___"
  const posLabel = isDI
    ? position === "buy_usd"
      ? "comprado taxa"
      : "vendido taxa"
    : isSwapCDI
    ? position === "sell_usd"
      ? "recebido taxa fixa"
      : "pago taxa fixa"
    : isSwapCambial
    ? "contratado swap cambial"
    : position === "sell_usd"
    ? "vendido"
    : "comprado";
  const altPos = position === "sell_usd" ? "buy_usd" : "sell_usd";
  const altLabel = isDI
    ? altPos === "buy_usd"
      ? "comprado taxa"
      : "vendido taxa"
    : isSwapCDI
    ? altPos === "sell_usd"
      ? "recebido taxa fixa"
      : "pago taxa fixa"
    : isSwapCambial
    ? "não contratado swap"
    : altPos === "sell_usd"
    ? "vendido"
    : "comprado";
  const altPnL = isSpecDI || isHedgeDI
    ? -result.ndfPnL
    : altPos === "sell_usd"
      ? (forwardChosen - scenario.fixingRate) * result.notional
      : (scenario.fixingRate - forwardChosen) * result.notional;
  const xLabel = isSwapCambial
    ? "Dólar Final (R$/USD)"
    : isSwapCDI
    ? "CDI Médio Acumulado (% a.a.)"
    : isFut
    ? "Taxa / Preço de Liquidação"
    : "Taxa de Fixing (R$/USD)";

  // Arbitrage detection and calculations
  const md = scenarioData?.context?.marketData;

  // DI hedge: portfolio impact via duration approximation
  const diPortfolioValue = (md?.portfolioValue as number) || 0;
  const diPortfolioDuration = (md?.portfolioDuration as number) || 0;
  const diRateChange = scenario.fixingRate - forwardChosen; // percentage points (vértice do DI)
  // Carteira reprecificada via PU: yield carteira move paralelamente ao DI
  const diPortfolioRate = (md?.portfolioRate as number) ?? forwardChosen;
  const diPortfolioDu = (md?.portfolioDu as number) ?? diPortfolioDuration * 252;
  const diPortfolioYieldNew = diPortfolioRate + diRateChange;
  const diPu0 = 1 / Math.pow(1 + diPortfolioRate / 100, diPortfolioDu / 252);
  const diPuT = 1 / Math.pow(1 + diPortfolioYieldNew / 100, diPortfolioDu / 252);
  const diPortfolioReturnPct = diPuT / diPu0 - 1;
  const diPortfolioPnLPv = diPortfolioReturnPct * diPortfolioValue;
  // Perna do futuro: PU inicial atualizado pela nova taxa até o vencimento.
  const diRefContracts = (md?.nContracts as number) || 0;
  const diContracts = Math.round(diRefContracts * hedgeRatio);
  const diFutDu = (md?.duDays as number) || 252;
  const diFutPu0 = 100000 / Math.pow(1 + forwardChosen / 100, diFutDu / 252);
  // Fator que leva valores de hoje ao vencimento do DI pela nova taxa. As duas
  // pernas (carteira e futuro) usam o mesmo fator para permanecerem comparáveis.
  const diCapFactor = Math.pow(1 + scenario.fixingRate / 100, diFutDu / 252);
  const diFutPuT = diFutPu0 * diCapFactor;
  const diFutPnlPerContract =
    position === "buy_usd" ? diFutPuT - 100000 : 100000 - diFutPuT;
  const diPortfolioPnL = diPortfolioPnLPv * diCapFactor;
  const diNetPnL = diPortfolioPnL + result.ndfPnL;
  const diHedgeCoverage =
    diPortfolioPnL !== 0 ? Math.abs(result.ndfPnL / diPortfolioPnL) : 1;
  // Nocional linear equivalente (DV01) para escalar o diagrama de payoff:
  // P&L por 1pp de taxa = contratos × 100.000 × (du/252) ÷ (1+taxa)
  const diChartNotional =
    (diContracts * 100000 * (diFutDu / 252)) / (1 + forwardChosen / 100) / 100;

  // Speculation DI: stop loss and risk/reward context
  const specStopLoss = 5000000; // R$ 5M
  const specTargetRate = 9.50;  // projected terminal rate
  const specRateChange = scenario.fixingRate - forwardChosen; // pp (negative = thesis correct)
  const specBpsChange = specRateChange * 100; // basis points
  const specStopPct = result.notional > 0 ? (Math.abs(result.ndfPnL) / specStopLoss) * 100 : 0;
  const specNContracts = (md?.nContracts as number) || 0;
  const specDuDays = (md?.duDays as number) || 252;
  const specPu0 = 100000 / Math.pow(1 + forwardChosen / 100, specDuDays / 252);
  const specPuT = specPu0 * Math.pow(1 + scenario.fixingRate / 100, specDuDays / 252);
  const specPnlPerContract =
    position === "sell_usd" ? 100000 - specPuT : specPuT - 100000;

  // Swap CDI hedge: rate-based comparison
  const swapSpread = (md?.debtSpread as number) || 0;
  const swapCostWithout = scenario.fixingRate + swapSpread;
  const swapCostWith = forwardChosen + swapSpread;
  const swapSavings = swapCostWithout - swapCostWith;

  const isArbitrage = !!(md?.forwardMercado);
  const arbFwdMercado = (md?.forwardMercado as number) || 0;
  const arbFwdTeorico = (md?.forwardRate90d as number) || 0;
  const arbNotional = (md?.notional_usd as number) || 0;
  const arbSpread = arbFwdMercado - arbFwdTeorico;
  const arbGain = arbSpread * arbNotional;
  const arbNdfPnl = (arbFwdMercado - scenario.fixingRate) * arbNotional;
  const arbSyntheticPnl = (scenario.fixingRate - arbFwdTeorico) * arbNotional;

  // Swap cambial specific calculations
  const spotInicial = (md?.spotRate as number) || 5.2;
  const notionalUSD = (md?.notional_usd as number) || 100000000;
  const nocionalBRL = spotInicial * notionalUSD;
  const prazoAnos = ((md?.tenor as number) || 756) / 252;
  const cdiAA = (md?.cdiRate as number) || 0.1175;
  const cupomCambial = 0.045; // cupom cambial do swap
  const fixDolar = scenario.fixingRate;
  const varCambialPct = ((fixDolar - spotInicial) / spotInicial) * 100;
  const varCambialBRL = (fixDolar - spotInicial) * notionalUSD;

  // Perna ativa (recebe): variação cambial + cupom cambial (juros simples)
  const pernaCambial =
    notionalUSD * fixDolar * (1 + cupomCambial * prazoAnos) - nocionalBRL;
  // Perna passiva (paga): CDI acumulado
  const pernaCDI = nocionalBRL * (Math.pow(1 + cdiAA, prazoAnos) - 1);
  // Resultado líquido do swap = recebe - paga
  const resultadoSwap = pernaCambial - pernaCDI;

  const custoSemSwap = fixDolar * notionalUSD;

  return (
    <div className="flex flex-col gap-5">
      {/* Scenario description */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4">
        <p className="text-sm leading-relaxed text-on-surface-variant">
          {scenario.description}
        </p>
      </div>

      {/* ──── SWAP CAMBIAL: custom 3-panel result ──── */}
      {isSwapCambial ? (
        <>
          {/* Panel 1: Dívida SEM swap */}
          <div className="rounded-xl border border-outline-variant p-6 bg-surface-container-lowest">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              ① Dívida sem swap (exposição cambial aberta)
            </div>
            <div className="text-sm leading-relaxed text-on-surface">
              <div>(1) Dívida = USD {(notionalUSD / 1e6).toFixed(0)}M</div>
              <div>
                (2) Dólar na contratação ={" "}
                <strong className="text-secondary">R$ {spotInicial.toFixed(2)}</strong>
              </div>
              <div>
                (3) Dólar no vencimento ={" "}
                <strong className="text-amber-600">R$ {fixDolar.toFixed(2)}</strong>
              </div>
              <div>
                (4) Variação cambial = ({fixDolar.toFixed(2)} − {spotInicial.toFixed(2)}) ÷{" "}
                {spotInicial.toFixed(2)} ={" "}
                <strong
                  className={varCambialPct >= 0 ? "text-red-600" : "text-emerald-600"}
                >
                  {varCambialPct >= 0 ? "+" : ""}
                  {varCambialPct.toFixed(1)}%
                </strong>
              </div>
              <div>
                (5) Custo da dívida em reais no vencimento = USD{" "}
                {(notionalUSD / 1e6).toFixed(0)}M × R$ {fixDolar.toFixed(2)} ={" "}
                <strong>{fmt(custoSemSwap)}</strong>
              </div>
              <div>
                (6) Impacto cambial vs contratação ={" "}
                <strong
                  className={varCambialBRL >= 0 ? "text-red-600" : "text-emerald-600"}
                >
                  {varCambialBRL >= 0 ? "+" : ""}
                  {fmt(varCambialBRL)}
                </strong>{" "}
                {varCambialBRL > 0
                  ? "(prejuízo: dólar subiu)"
                  : varCambialBRL < 0
                  ? "(benefício: dólar caiu)"
                  : "(neutro)"}
              </div>
            </div>
          </div>

          {/* Panel 2: Resultado do swap isolado — ambas as pernas */}
          <div
            className={`rounded-xl border p-6 ${resultadoSwap >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}
          >
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              ② Resultado do swap cambial (isolado)
            </div>
            <div className="text-sm leading-relaxed text-on-surface">
              <div className="mb-2 font-semibold text-emerald-600">
                Perna ativa — recebe: variação cambial + cupom cambial (
                {(cupomCambial * 100).toFixed(1)}% a.a.)
              </div>
              <div>
                (1) Nocional inicial em reais = USD {(notionalUSD / 1e6).toFixed(0)}M × R${" "}
                {spotInicial.toFixed(2)} = {fmt(nocionalBRL)}
              </div>
              <div>
                (2) Valor final da perna cambial = USD {(notionalUSD / 1e6).toFixed(0)}M × R${" "}
                {fixDolar.toFixed(2)} × (1 + {(cupomCambial * 100).toFixed(1)}% ×{" "}
                {prazoAnos.toFixed(1)})
              </div>
              <div>
                ={" "}
                {fmt(
                  notionalUSD * fixDolar * (1 + cupomCambial * prazoAnos)
                )}
              </div>
              <div>
                (3) Resultado da perna ativa ={" "}
                {fmt(notionalUSD * fixDolar * (1 + cupomCambial * prazoAnos))} −{" "}
                {fmt(nocionalBRL)} ={" "}
                <strong
                  className={pernaCambial >= 0 ? "text-emerald-600" : "text-red-600"}
                >
                  {pernaCambial >= 0 ? "+" : ""}
                  {fmt(pernaCambial)}
                </strong>
              </div>

              <div className="mt-4 mb-2 font-semibold text-red-600">
                Perna passiva — paga: CDI acumulado ({(cdiAA * 100).toFixed(2)}% a.a.)
              </div>
              <div>
                (4) CDI acumulado em {prazoAnos.toFixed(1)} anos = {fmt(nocionalBRL)} × [(1 +{" "}
                {(cdiAA * 100).toFixed(2)}%)^{prazoAnos.toFixed(1)} − 1]
              </div>
              <div>
                = {fmt(nocionalBRL)} ×{" "}
                {(Math.pow(1 + cdiAA, prazoAnos) - 1).toFixed(4)} ={" "}
                <strong className="text-red-600">−{fmt(pernaCDI)}</strong>
              </div>

              <div className="mt-4 border-t border-outline-variant pt-3">
                <div className="font-semibold">
                  Resultado líquido do swap = Perna ativa − Perna passiva
                </div>
                <div>
                  = {fmt(pernaCambial)} − {fmt(pernaCDI)}
                </div>
              </div>
              <div
                className={`mt-1 text-[28px] font-extrabold font-mono ${resultadoSwap >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                = {resultadoSwap >= 0 ? "+" : ""}
                {fmt(resultadoSwap)}
              </div>
            </div>
          </div>

          {/* Panel 3: Resultado combinado (hedge) */}
          <div className="rounded-xl border border-secondary/30 bg-secondary/10 p-6">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
              ③ Resultado combinado (dívida + swap = hedge)
            </div>
            <div className="text-sm leading-relaxed text-on-surface">
              <div>
                (1) Custo da dívida sem swap = {fmt(custoSemSwap)} (USD{" "}
                {(notionalUSD / 1e6).toFixed(0)}M × R$ {fixDolar.toFixed(2)})
              </div>
              <div>
                (2) Resultado líquido do swap ={" "}
                <strong
                  className={resultadoSwap >= 0 ? "text-emerald-600" : "text-red-600"}
                >
                  {resultadoSwap >= 0 ? "+" : ""}
                  {fmt(resultadoSwap)}
                </strong>
              </div>
              <div>
                (3) Custo efetivo da dívida com hedge = {fmt(custoSemSwap)} −{" "}
                {fmt(resultadoSwap)} ={" "}
                <strong className="text-secondary">
                  {fmt(custoSemSwap - resultadoSwap)}
                </strong>
              </div>
              <div className="mt-2">
                (4) Custo original (na contratação) = {fmt(nocionalBRL)}
              </div>
              <div>
                (5) Diferença = {fmt(custoSemSwap - resultadoSwap - nocionalBRL)} → este é o
                custo do CDI líquido do cupom cambial ao longo de {prazoAnos.toFixed(1)} anos.
              </div>

              <div className="mt-3 rounded-lg bg-surface-container-lowest p-3.5">
                {varCambialBRL > 0
                  ? `O dólar subiu ${varCambialPct.toFixed(1)}%. Sem swap, a dívida custaria ${fmt(custoSemSwap)} (${fmt(Math.abs(varCambialBRL))} a mais). Com swap, o custo efetivo foi ${fmt(custoSemSwap - resultadoSwap)} — a variação cambial foi substancialmente neutralizada. O custo residual reflete o CDI pago menos o cupom cambial recebido.`
                  : varCambialBRL < 0
                  ? `O dólar caiu ${Math.abs(varCambialPct).toFixed(1)}%. Sem swap, a dívida custaria apenas ${fmt(custoSemSwap)} (${fmt(Math.abs(varCambialBRL))} a menos). Com swap, o custo efetivo foi ${fmt(custoSemSwap - resultadoSwap)} — a empresa "devolveu" o benefício cambial ao banco. Esse é o custo de oportunidade do hedge.`
                  : `O dólar ficou estável. O swap teve impacto cambial neutro. O custo efetivo reflete apenas o diferencial CDI vs cupom cambial.`}
              </div>
            </div>
          </div>

          {/* Payoff Chart */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-low px-2 py-4">
            <div className="mb-2 pl-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {strings.payoffDiagram} (Swap)
            </div>
            <PayoffChart
              forwardRate={forwardChosen}
              position={position}
              notional={result.hedgedNotional}
              fixingRate={scenario.fixingRate}
              xLabel={xLabel}
              overrideFixingPnL={resultadoSwap}
            />
          </div>
        </>
      ) : isArbitrage ? (
        /* ──── ARBITRAGE: two-leg locked spread ──── */
        <>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Resultado da Arbitragem
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-600">
              +{fmt(arbGain)}
            </div>
            <div className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Lucro travado na montagem: ({fmtQ(arbFwdMercado)} − {fmtQ(arbFwdTeorico)}) × USD {(arbNotional / 1e6).toFixed(0)}M = <strong className="text-emerald-600">+{fmt(arbGain)}</strong>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant p-6 bg-surface-container-lowest">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
              ① NDF vendido (perna de mercado)
            </div>
            <div className="text-sm leading-relaxed text-on-surface">
              <div>(1) Vendeu USD a termo a <strong className="text-secondary">{fmtQ(arbFwdMercado)}</strong></div>
              <div>(2) Fixing = {fmtQ(scenario.fixingRate)}</div>
              <div>(3) Resultado da perna NDF = ({fmtQ(arbFwdMercado)} − {fmtQ(scenario.fixingRate)}) × USD {(arbNotional / 1e6).toFixed(0)}M = <strong className={arbNdfPnl >= 0 ? "text-emerald-600" : "text-red-600"}>{arbNdfPnl >= 0 ? "+" : ""}{fmt(arbNdfPnl)}</strong></div>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant p-6 bg-surface-container-lowest">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
              ② Sintético comprado (perna de paridade coberta)
            </div>
            <div className="text-sm leading-relaxed text-on-surface">
              <div>(1) Tomou CDI emprestado, comprou USD spot a {fmtQ(md?.spotRate as number)}, aplicou no cupom cambial</div>
              <div>(2) Taxa forward implícita do sintético = <strong className="text-secondary">{fmtQ(arbFwdTeorico)}</strong></div>
              <div>(3) Fixing = {fmtQ(scenario.fixingRate)}</div>
              <div>(4) Resultado da perna sintética = ({fmtQ(scenario.fixingRate)} − {fmtQ(arbFwdTeorico)}) × USD {(arbNotional / 1e6).toFixed(0)}M = <strong className={arbSyntheticPnl >= 0 ? "text-emerald-600" : "text-red-600"}>{arbSyntheticPnl >= 0 ? "+" : ""}{fmt(arbSyntheticPnl)}</strong></div>
            </div>
          </div>

          <div className="rounded-xl border border-secondary/30 bg-secondary/10 p-6">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
              ③ Resultado líquido (perna 1 + perna 2)
            </div>
            <div className="text-sm leading-relaxed text-on-surface">
              <div>(1) NDF vendido = {arbNdfPnl >= 0 ? "+" : ""}{fmt(arbNdfPnl)}</div>
              <div>(2) Sintético comprado = {arbSyntheticPnl >= 0 ? "+" : ""}{fmt(arbSyntheticPnl)}</div>
              <div>(3) Total = {fmt(arbNdfPnl)} + {fmt(arbSyntheticPnl)} = <strong className="text-emerald-600">+{fmt(arbGain)}</strong></div>
              <div className="mt-3 rounded-lg bg-surface-container-lowest p-3.5">
                Independente do fixing ({fmtQ(scenario.fixingRate)}), o lucro é sempre R$ {(arbSpread).toFixed(2)}/USD × USD {(arbNotional / 1e6).toFixed(0)}M = {fmt(arbGain)}.
                As duas pernas se cancelam em relação ao mercado: o que a perna NDF perde/ganha com o fixing, a perna sintética ganha/perde exatamente o oposto.
                O lucro foi travado na montagem da operação — por isso se chama arbitragem.
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ──── DEFAULT: NDF, Futuros, Swap CDI×Pré ──── */
        <>
          <div
            className={`rounded-xl border p-6 ${bgClass}`}
          >
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {resultOf(instrument || "Derivativo")}
            </div>
            <div
              className={`text-3xl font-extrabold font-mono ${colorClass}`}
            >
              {result.ndfPnL > 0 ? "+" : ""}
              {fmt(result.ndfPnL)}
            </div>
            <div className="mt-2 text-xs leading-relaxed text-on-surface-variant">
              Você {posVerb} a{" "}
              <strong className="text-secondary">{fmtQ(forwardChosen)}</strong>.
              {isSwapCDI ? " CDI médio: " : isFut ? " Liquidação: " : " Fixing: "}
              <strong className={colorClass}>{fmtQ(scenario.fixingRate)}</strong>.
              {isSwapCDI ? (
                <>
                  <br />
                  Resultado líquido do swap:{" "}
                  <strong className={colorClass}>
                    {result.ndfPnL > 0 ? "+" : ""}
                    {fmt(result.ndfPnL)}
                  </strong>
                </>
              ) : isFut ? (
                <>
                  <br />
                  {isHedgeDI || isSpecDI
                    ? "Resultado da posição no vencimento:"
                    : "Ajustes diários acumulados:"}{" "}
                  <strong className={colorClass}>
                    {result.ndfPnL > 0 ? "+" : ""}
                    {fmt(result.ndfPnL)}
                  </strong>
                </>
              ) : (
                <>
                  <br />
                  Taxa efetiva:{" "}
                  <strong className="text-on-surface">{fmtRate(result.effectiveRate)}</strong>
                </>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-low px-2 py-4">
            <div className="mb-2 pl-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {strings.payoffDiagram}
            </div>
            <PayoffChart
              forwardRate={forwardChosen}
              position={position}
              notional={isHedgeDI ? diChartNotional : result.hedgedNotional}
              ratePct={isDI || isSwapCDI}
              fixingRate={scenario.fixingRate}
              xLabel={xLabel}
              overrideFixingPnL={isSpecDI || isHedgeDI ? result.ndfPnL : undefined}
            />
          </div>
          <div className="rounded-xl border border-outline-variant p-5 bg-surface-container-lowest">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-secondary">
              {strings.whyResult}
            </div>
            <p className="text-sm leading-relaxed text-on-surface">
              {position === "sell_usd" ? (
                <>
                  Ao{" "}
                  {isSwapCDI
                    ? "receber taxa fixa"
                    : isDI
                    ? "vender taxa"
                    : isFut
                    ? "vender o futuro"
                    : "vender a termo"}{" "}
                  a {fmtQ(forwardChosen)}, você travou posição que lucra{" "}
                  {isSwapCDI
                    ? "quando o CDI fica abaixo da taxa fixa"
                    : isDI
                    ? "na queda da taxa"
                    : "na queda do preço"}
                  .
                  {result.ndfPnL > 0
                    ? ` ${
                        isSwapCDI
                          ? `O CDI médio (${fmtQ(scenario.fixingRate)}) ficou abaixo da taxa fixa`
                          : `A taxa de liquidação (${fmtQ(scenario.fixingRate)}) ficou abaixo da entrada`
                      } — resultado positivo.`
                    : result.ndfPnL < 0
                    ? ` ${
                        isSwapCDI
                          ? `O CDI médio (${fmtQ(scenario.fixingRate)}) ficou acima da taxa fixa`
                          : `A taxa de liquidação (${fmtQ(scenario.fixingRate)}) ficou acima da entrada`
                      } — resultado negativo.`
                    : " Resultado neutro."}
                </>
              ) : (
                <>
                  Ao{" "}
                  {isSwapCDI
                    ? "pagar taxa fixa"
                    : isDI
                    ? "comprar taxa"
                    : isFut
                    ? "comprar o futuro"
                    : "comprar a termo"}{" "}
                  a {fmtQ(forwardChosen)}, você travou posição que lucra{" "}
                  {isSwapCDI
                    ? "quando o CDI fica acima da taxa fixa"
                    : isDI
                    ? "na alta da taxa"
                    : "na alta do preço"}
                  .
                  {result.ndfPnL > 0
                    ? ` ${
                        isSwapCDI
                          ? `O CDI médio (${fmtQ(scenario.fixingRate)}) ficou acima da taxa fixa`
                          : `A taxa de liquidação (${fmtQ(scenario.fixingRate)}) ficou acima da entrada`
                      } — resultado positivo.`
                    : result.ndfPnL < 0
                    ? ` ${
                        isSwapCDI
                          ? `O CDI médio (${fmtQ(scenario.fixingRate)}) ficou abaixo da taxa fixa`
                          : `A taxa de liquidação (${fmtQ(scenario.fixingRate)}) ficou abaixo da entrada`
                      } — resultado negativo.`
                    : " Resultado neutro."}
                </>
              )}
            </p>
            {isHedge && (
              <div className="mt-4 rounded-lg bg-secondary/10 p-4 text-sm leading-relaxed text-on-surface">
                <div className="mb-2 font-semibold text-secondary">
                  {isSpecDI ? strings.specView : strings.hedgeView}
                </div>
                {isHedgeDI ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Operação original:</strong> o fundo detém R$ {(diPortfolioValue / 1e6).toFixed(0)}M em títulos
                      prefixados (NTN-F e LTN) com yield médio de {fmtQ(diPortfolioRate)} e duration de {diPortfolioDuration} anos
                      ({diPortfolioDu} d.u.). Títulos prefixados perdem valor quando os juros sobem (preço e taxa se movem em direções opostas).
                    </p>
                    <p>
                      <strong>Impacto na carteira (reprecificação via PU):</strong>{" "}
                      Premissa de movimento paralelo: yield novo = {fmtQ(diPortfolioRate)} {diRateChange >= 0 ? "+" : "−"} {Math.abs(diRateChange).toFixed(2).replace(".", ",")}pp = {fmtQ(diPortfolioYieldNew)}.
                      <br />
                      PU₀ = 1 ÷ (1+{fmtQ(diPortfolioRate)})^({diPortfolioDu}/252) = <strong>{diPu0.toFixed(6).replace(".", ",")}</strong>;
                      PU_T = 1 ÷ (1+{fmtQ(diPortfolioYieldNew)})^({diPortfolioDu}/252) = <strong>{diPuT.toFixed(6).replace(".", ",")}</strong>.
                      <br />
                      Retorno = (PU_T ÷ PU₀ − 1) = <strong>{(diPortfolioReturnPct * 100).toFixed(2).replace(".", ",")}%</strong>;
                      P&L hoje = {(diPortfolioReturnPct * 100).toFixed(2).replace(".", ",")}% × {fmt(diPortfolioValue)} ={" "}
                      <strong>{diPortfolioPnLPv >= 0 ? "+" : ""}{fmt(diPortfolioPnLPv)}</strong>.
                      <br />
                      Levado ao vencimento do DI pela nova taxa: {fmt(diPortfolioPnLPv)} × (1+{fmtQ(scenario.fixingRate)})^({diFutDu}/252) ={" "}
                      <span className={diPortfolioPnL >= 0 ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
                        {diPortfolioPnL >= 0 ? "+" : ""}{fmt(diPortfolioPnL)}
                      </span>.
                    </p>
                    <p>
                      <strong>Resultado do DI futuro ({position === "buy_usd" ? "comprou taxa" : "vendeu taxa"} a {fmtQ(forwardChosen)}, {diContracts.toLocaleString("pt-BR")} contratos):</strong>{" "}
                      <span className={result.ndfPnL >= 0 ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
                        {result.ndfPnL >= 0 ? "+" : ""}{fmt(result.ndfPnL)}
                      </span>.
                    </p>
                    <div className="rounded-md bg-surface-container-lowest/60 p-3 text-[13px] leading-relaxed">
                      <div className="mb-1 font-semibold text-secondary">Memória de cálculo (método PU)</div>
                      <div>(1) PU₀ = 100.000 ÷ (1 + {fmtQ(forwardChosen)})^({diFutDu}/252) = <strong>{fmt(diFutPu0)}</strong></div>
                      <div>(2) PU_T = {fmt(diFutPu0)} × (1 + {fmtQ(scenario.fixingRate)})^({diFutDu}/252) = <strong>{fmt(diFutPuT)}</strong></div>
                      <div>
                        (3) P&L por contrato ({position === "buy_usd" ? "comprado em taxa" : "vendido em taxa"}) ={" "}
                        {position === "buy_usd"
                          ? <>{fmt(diFutPuT)} − 100.000</>
                          : <>100.000 − {fmt(diFutPuT)}</>}{" "}= <strong>{diFutPnlPerContract >= 0 ? "+" : ""}{fmt(diFutPnlPerContract)}</strong>
                      </div>
                      <div>
                        (4) P&L total = {diFutPnlPerContract >= 0 ? "+" : ""}{fmt(diFutPnlPerContract)} × {diContracts.toLocaleString("pt-BR")} contratos ={" "}
                        <strong className={result.ndfPnL >= 0 ? "text-emerald-600" : "text-red-600"}>
                          {result.ndfPnL >= 0 ? "+" : ""}{fmt(result.ndfPnL)}
                        </strong>
                      </div>
                    </div>
                    <p>
                      <strong>Resultado combinado (carteira + DI futuro, ambos no vencimento do DI):</strong>{" "}
                      {fmt(diPortfolioPnL)} {result.ndfPnL >= 0 ? "+" : "−"} {fmt(Math.abs(result.ndfPnL))} ={" "}
                      <strong className="text-secondary">{diNetPnL >= 0 ? "+" : ""}{fmt(diNetPnL)}</strong>.
                    </p>
                    <p>
                      {diRateChange > 0.1
                        ? `Os juros subiram ${diRateChange.toFixed(2).replace(".", ",")}pp e os títulos prefixados perderam valor. O DI futuro gerou ganho de ${fmt(result.ndfPnL)}, cobrindo ${(diHedgeCoverage * 100).toFixed(0)}% da perda na carteira.`
                        : diRateChange < -0.1
                        ? `Os juros caíram ${Math.abs(diRateChange).toFixed(2).replace(".", ",")}pp e os títulos prefixados valorizaram. O DI futuro gerou perda de ${fmt(result.ndfPnL)} — esse é o custo de oportunidade do hedge. Sem a proteção, o fundo teria capturado toda a valorização dos prefixados.`
                        : "A taxa ficou praticamente estável. Impacto marginal tanto na carteira quanto no DI futuro."}
                      {diContracts < diRefContracts
                        ? ` Com ${diContracts.toLocaleString("pt-BR")} contratos ao invés dos ${diRefContracts.toLocaleString("pt-BR")} exigidos pelo casamento nocional via PU, a posição está sub-hedgeada: sobra risco de taxa não protegido, e o resíduo de ${fmt(diNetPnL)} é exatamente essa exposição residual.`
                        : diContracts > diRefContracts
                        ? ` Com ${diContracts.toLocaleString("pt-BR")} contratos ao invés dos ${diRefContracts.toLocaleString("pt-BR")} exigidos pelo casamento nocional via PU, a posição está sobre-hedgeada — o excedente é exposição direcional, não proteção.`
                        : ` Como a duration da carteira (${diPortfolioDuration.toFixed(1).replace(".", ",")}a) é igual à do vértice hedgeado (${(diFutDu / 252).toFixed(1).replace(".", ",")}a), o casamento nocional pelo PU (${diRefContracts.toLocaleString("pt-BR")} contratos) neutraliza a exposição quase integralmente — o resíduo de ${fmt(diNetPnL)} vem apenas do arredondamento do número de contratos.`}
                    </p>
                  </div>
                ) : isSpecDI ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Tese original:</strong> a mesa proprietária projetava queda do DI Jan/27
                      de {fmtQ(forwardChosen)} para {fmtQ(specTargetRate)} (corte de{" "}
                      {((forwardChosen - specTargetRate) * 100).toFixed(0)}bps). Posição:{" "}
                      {position === "sell_usd" ? "vendeu taxa" : "comprou taxa"} no DI futuro.
                      Stop loss da mesa: {fmt(specStopLoss)}.
                    </p>
                    <p>
                      <strong>O que aconteceu:</strong> DI Jan/27 foi de {fmtQ(forwardChosen)} para{" "}
                      {fmtQ(scenario.fixingRate)} — variação de{" "}
                      {specBpsChange >= 0 ? "+" : ""}{specBpsChange.toFixed(0)}bps.
                    </p>
                    <p>
                      <strong>Resultado da posição:</strong>{" "}
                      <span className={result.ndfPnL >= 0 ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
                        {result.ndfPnL >= 0 ? "+" : ""}{fmt(result.ndfPnL)}
                      </span>.
                    </p>
                    <div className="rounded-md bg-surface-container-lowest/60 p-3 text-[13px] leading-relaxed">
                      <div className="mb-1 font-semibold text-secondary">Memória de cálculo (método PU)</div>
                      <div>(1) PU₀ = 100.000 ÷ (1 + {fmtQ(forwardChosen)})^({specDuDays}/252) = <strong>{fmt(specPu0)}</strong></div>
                      <div>(2) PU_T = {fmt(specPu0)} × (1 + {fmtQ(scenario.fixingRate)})^({specDuDays}/252) = <strong>{fmt(specPuT)}</strong></div>
                      <div>
                        (3) P&L por contrato ({position === "sell_usd" ? "vendido em taxa" : "comprado em taxa"}) ={" "}
                        {position === "sell_usd"
                          ? <>100.000 − {fmt(specPuT)}</>
                          : <>{fmt(specPuT)} − 100.000</>}{" "}= <strong>{specPnlPerContract >= 0 ? "+" : ""}{fmt(specPnlPerContract)}</strong>
                      </div>
                      <div>
                        (4) P&L total = {specPnlPerContract >= 0 ? "+" : ""}{fmt(specPnlPerContract)} × {specNContracts.toLocaleString("pt-BR")} contratos ={" "}
                        <strong className={result.ndfPnL >= 0 ? "text-emerald-600" : "text-red-600"}>
                          {result.ndfPnL >= 0 ? "+" : ""}{fmt(result.ndfPnL)}
                        </strong>
                      </div>
                    </div>
                    <p>
                      <strong>Relação com o stop loss:</strong>{" "}
                      {result.ndfPnL >= 0
                        ? `A tese acertou a direção. O ganho de ${fmt(result.ndfPnL)} representa ${specStopPct.toFixed(0)}% do stop loss — relação risco/retorno favorável.`
                        : specStopPct > 100
                        ? `A perda de ${fmt(Math.abs(result.ndfPnL))} excedeu o stop loss de ${fmt(specStopLoss)} (${specStopPct.toFixed(0)}% do limite). Na prática, a mesa teria sido stopada antes desse nível.`
                        : specStopPct > 80
                        ? `A perda de ${fmt(Math.abs(result.ndfPnL))} consumiu ${specStopPct.toFixed(0)}% do stop loss de ${fmt(specStopLoss)} — próximo do limite de encerramento compulsório.`
                        : `A perda de ${fmt(Math.abs(result.ndfPnL))} consumiu ${specStopPct.toFixed(0)}% do stop loss de ${fmt(specStopLoss)} — dentro do limite, mas a tese não se confirmou.`}
                    </p>
                  </div>
                ) : isSwapCDIHedge ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Operação original:</strong> a Infralog tem dívida de{" "}
                      R$ 200M a CDI + {swapSpread.toFixed(2).replace(".", ",")}% a.a.
                      Se o CDI subir, o custo financeiro sobe junto.
                    </p>
                    <p>
                      <strong>Sem swap:</strong> custo = CDI ({fmtQ(scenario.fixingRate)}) +{" "}
                      {swapSpread.toFixed(2).replace(".", ",")}% ={" "}
                      <strong>{swapCostWithout.toFixed(2).replace(".", ",")}% a.a.</strong>
                    </p>
                    <p>
                      <strong>Com swap:</strong> o swap trocou CDI por taxa fixa de{" "}
                      {fmtQ(forwardChosen)}. Custo fixo = {fmtQ(forwardChosen)} +{" "}
                      {swapSpread.toFixed(2).replace(".", ",")}% ={" "}
                      <strong className="text-secondary">{swapCostWith.toFixed(2).replace(".", ",")}% a.a.</strong>
                    </p>
                    <p>
                      <strong>Diferença:</strong>{" "}
                      {swapSavings > 0.01
                        ? <>
                            economia de{" "}
                            <strong className="text-emerald-600">{swapSavings.toFixed(2).replace(".", ",")}% a.a.</strong>{" "}
                            O hedge protegeu a empresa: sem o swap, pagaria {swapCostWithout.toFixed(2).replace(".", ",")}%; com o swap, pagou {swapCostWith.toFixed(2).replace(".", ",")}%.
                          </>
                        : swapSavings < -0.01
                        ? <>
                            custo extra de{" "}
                            <strong className="text-red-600">{Math.abs(swapSavings).toFixed(2).replace(".", ",")}% a.a.</strong>{" "}
                            O CDI caiu e a dívida flutuante teria custado apenas {swapCostWithout.toFixed(2).replace(".", ",")}%.
                            Com o swap travado em {swapCostWith.toFixed(2).replace(".", ",")}%, a empresa pagou a mais — esse é o custo de oportunidade do hedge (o preço da previsibilidade).
                          </>
                        : <>resultado praticamente neutro. O custo com e sem swap ficou muito próximo.</>}
                    </p>
                  </div>
                ) : isHedgeDOL ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Operação original:</strong> a EnergiaVerde S.A. precisa pagar um cupom de USD{" "}
                      {(result.notional / 1e6).toFixed(0)}M do bond internacional em 6 meses.
                      Se o dólar subir, o custo em reais do cupom aumenta.
                    </p>
                    <p>
                      <strong>Sem hedge:</strong> compraria os dólares a{" "}
                      {fmtQ(scenario.fixingRate)} no spot, pagando{" "}
                      {fmt(result.spotConversion)}.
                    </p>
                    <p>
                      <strong>Com o DOL futuro {position === "buy_usd" ? "comprado" : "vendido"} a{" "}
                      {fmtQ(forwardChosen)}:</strong> os ajustes diários acumulados geraram resultado de{" "}
                      <span className={result.ndfPnL >= 0 ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
                        {result.ndfPnL >= 0 ? "+" : ""}{fmt(result.ndfPnL)}
                      </span>.
                    </p>
                    <p>
                      <strong>Custo total (cupom + DOL futuro):</strong>{" "}
                      {fmt(result.spotConversion)} {result.ndfPnL >= 0 ? "−" : "+"}{" "}
                      {fmt(Math.abs(result.ndfPnL))} ={" "}
                      <strong className="text-secondary">{fmt(hedgeTotal)}</strong>.
                    </p>
                    <p>
                      <strong>Taxa efetiva de compra:</strong>{" "}
                      <strong className="text-secondary">R$ {fmtRate(hedgeEffRate)}/USD</strong>.{" "}
                      {Math.abs(hedgeEffRate - forwardChosen) < 0.01
                        ? "O hedge cumpriu seu papel: independente do cenário de câmbio, o custo do cupom em reais ficou travado na cotação do DOL futuro contratada."
                        : "A taxa efetiva divergiu da cotação contratada porque a posição no DOL futuro não corresponde ao hedge natural de um devedor em dólar (comprar DOL)."}
                    </p>
                  </div>
                ) : isHedgeExportador ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Operação original:</strong> a AgroBrasil receberá USD{" "}
                      {(result.notional / 1e6).toFixed(0)}M da exportação de soja. Se o dólar cair, a receita em reais diminui.
                    </p>
                    <p>
                      <strong>Sem hedge:</strong> converteria os dólares a{" "}
                      {fmtQ(scenario.fixingRate)} no spot, recebendo{" "}
                      {fmt(result.spotConversion)}.
                    </p>
                    <p>
                      <strong>Com o NDF {position === "sell_usd" ? "vendido" : "comprado"} a{" "}
                      {fmtQ(forwardChosen)}:</strong> o derivativo gerou resultado de{" "}
                      <span className={result.ndfPnL >= 0 ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
                        {result.ndfPnL >= 0 ? "+" : ""}{fmt(result.ndfPnL)}
                      </span>.
                    </p>
                    <p>
                      <strong>Receita total (exportação + NDF):</strong>{" "}
                      {fmt(result.spotConversion)} {result.ndfPnL >= 0 ? "+" : "−"}{" "}
                      {fmt(Math.abs(result.ndfPnL))} ={" "}
                      <strong className="text-secondary">{fmt(hedgeTotal)}</strong>.
                    </p>
                    <p>
                      <strong>Taxa efetiva de conversão:</strong>{" "}
                      <strong className="text-secondary">R$ {fmtRate(hedgeEffRate)}/USD</strong>.{" "}
                      {Math.abs(hedgeEffRate - forwardChosen) < 0.01
                        ? "O hedge cumpriu seu papel: independente do cenário de câmbio, a receita em reais ficou travada na taxa forward contratada."
                        : "A taxa efetiva divergiu da forward porque a posição no NDF não corresponde ao hedge natural de um exportador (vender USD a termo)."}
                    </p>
                  </div>
                ) : hedgeRatio === 0 ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Operação original:</strong> a TechImport precisa pagar USD{" "}
                      {(result.notional / 1e6).toFixed(0)}M pela importação de componentes eletrônicos. Se o dólar subir, o custo em reais aumenta.
                    </p>
                    <p>
                      Como nenhuma parcela foi protegida com NDF, o custo total da importação é{" "}
                      <strong className="text-secondary">{fmt(result.spotConversion)}</strong>{" "}
                      (USD {(result.notional / 1e6).toFixed(0)}M × R$ {fmtQ(scenario.fixingRate)}),
                      integralmente exposto ao câmbio.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p>
                      <strong>Operação original:</strong> a TechImport precisa pagar USD{" "}
                      {(result.notional / 1e6).toFixed(0)}M pela importação de componentes eletrônicos. Se o dólar subir, o custo em reais aumenta.
                    </p>
                    <p>
                      <strong>Sem hedge:</strong> compraria os dólares a{" "}
                      {fmtQ(scenario.fixingRate)} no spot, desembolsando{" "}
                      {fmt(result.spotConversion)}.
                    </p>
                    <p>
                      <strong>Com o NDF {position === "buy_usd" ? "comprado" : "vendido"} a{" "}
                      {fmtQ(forwardChosen)}
                      {hedgeRatio < 1
                        ? ` sobre ${(hedgeRatio * 100).toFixed(0)}% do nocional (USD ${(result.hedgedNotional / 1e6).toFixed(1)}M)`
                        : ""}
                      :</strong> o derivativo gerou resultado de{" "}
                      <span className={result.ndfPnL >= 0 ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
                        {result.ndfPnL >= 0 ? "+" : ""}{fmt(result.ndfPnL)}
                      </span>.
                    </p>
                    <p>
                      <strong>Custo total (importação + NDF):</strong>{" "}
                      {fmt(result.spotConversion)} {result.ndfPnL >= 0 ? "−" : "+"}{" "}
                      {fmt(Math.abs(result.ndfPnL))} ={" "}
                      <strong className="text-secondary">{fmt(hedgeTotal)}</strong>.
                    </p>
                    <p>
                      <strong>Taxa efetiva de compra:</strong>{" "}
                      <strong className="text-secondary">R$ {fmtRate(hedgeEffRate)}/USD</strong>.{" "}
                      {hedgeRatio === 1 && Math.abs(hedgeEffRate - forwardChosen) < 0.01
                        ? "O hedge cumpriu seu papel: independente do cenário de câmbio, o custo em reais ficou travado na taxa forward contratada."
                        : hedgeRatio < 1
                        ? `O hedge parcial travou ${(hedgeRatio * 100).toFixed(0)}% do nocional a R$ ${fmtQ(forwardChosen)}. Os ${((1 - hedgeRatio) * 100).toFixed(0)}% restantes ficaram expostos ao câmbio.`
                        : "A taxa efetiva divergiu da forward porque a posição no NDF não corresponde ao hedge natural de um importador (comprar USD a termo)."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-600">
              {strings.whatIfDifferent}
            </div>
            <p className="text-sm leading-relaxed text-on-surface">
              Se tivesse <strong>{altLabel}</strong> ao invés de {posLabel}, resultado seria{" "}
              <strong className={altPnL > 0 ? "text-emerald-600" : "text-red-600"}>
                {altPnL > 0 ? "+" : ""}
                {fmt(altPnL)}
              </strong>
              .{" "}
              {altPnL > result.ndfPnL
                ? "Teria sido melhor financeiramente — mas a posição correta depende da exposição, não do resultado ex-post."
                : "Sua escolha foi a mais adequada para o contexto."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

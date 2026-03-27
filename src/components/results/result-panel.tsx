import { fmt, fmtRate } from "@/lib/formatters";
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
    const dv01Short = (smd.dv01Short as number) || 14;
    const dv01Long = (smd.dv01Long as number) || 20;
    const cShort = (smd.contractsShort as number) || 5000;
    const cLong = (smd.contractsLong as number) || 3500;
    const dv01TotalShort = cShort * dv01Short;
    const dv01TotalLong = cLong * dv01Long;
    const spreadChange = spreadInitial - newSpread;
    const spreadPnl = spreadChange * dv01TotalLong;
    const isGain = spreadPnl > 0;
    const rateShort = smd.spotRate as number;
    const rateLong = smd.forwardRate90d as number;

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
            <div>(1) Posição: comprar taxa (vender PU) no Jan/27 a {rateShort.toFixed(2)}%</div>
            <div>(2) DV01 total = {cShort.toLocaleString("pt-BR")} × R$ {dv01Short} = <strong className="text-secondary">R$ {dv01TotalShort.toLocaleString("pt-BR")}/bp</strong></div>
            <div>(3) Em um choque paralelo de +1bp, esta perna <strong className="text-emerald-600">ganha</strong> R$ {dv01TotalShort.toLocaleString("pt-BR")}</div>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant p-6 bg-surface-container-lowest">
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
            ② Perna longa — Vender taxa Jan/28 ({cLong.toLocaleString("pt-BR")} contratos)
          </div>
          <div className="text-sm leading-relaxed text-on-surface">
            <div>(1) Posição: vender taxa (comprar PU) no Jan/28 a {rateLong.toFixed(2)}%</div>
            <div>(2) DV01 total = {cLong.toLocaleString("pt-BR")} × R$ {dv01Long} = <strong className="text-secondary">R$ {dv01TotalLong.toLocaleString("pt-BR")}/bp</strong></div>
            <div>(3) Em um choque paralelo de +1bp, esta perna <strong className="text-red-600">perde</strong> R$ {dv01TotalLong.toLocaleString("pt-BR")}</div>
            <div>(4) DV01 casado: {dv01TotalShort.toLocaleString("pt-BR")} ≈ {dv01TotalLong.toLocaleString("pt-BR")} → risco direcional neutralizado ✓</div>
          </div>
        </div>

        <div className={`rounded-xl border p-6 ${isGain ? "bg-secondary/10 border-secondary/30" : "bg-red-50 border-red-200"}`}>
          <div className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
            ③ {strings.netSpreadResult}
          </div>
          <div className="text-sm leading-relaxed text-on-surface">
            <div>(1) Spread inicial = {spreadInitial} bps (Jan/28 {rateLong.toFixed(2)}% − Jan/27 {rateShort.toFixed(2)}%)</div>
            <div>(2) Spread final = {newSpread} bps</div>
            <div>(3) Compressão/alargamento = {spreadChange > 0 ? "+" : ""}{spreadChange} bps</div>
            <div>(4) P&L = {Math.abs(spreadChange)} bps × R$ {dv01TotalLong.toLocaleString("pt-BR")}/bp = <strong className={isGain ? "text-emerald-600" : "text-red-600"}>{spreadPnl >= 0 ? "+" : ""}{fmt(spreadPnl)}</strong></div>
            <div className="mt-3 rounded-lg bg-surface-container-lowest p-3.5">
              {spreadChange > 0
                ? `O spread comprimiu de ${spreadInitial} para ${newSpread} bps como projetado. A perna longa (vender taxa Jan/28) ganhou mais do que a perna curta (comprar taxa Jan/27) perdeu, pois o vértice longo caiu mais. O flattener capturou a compressão da curva — resultado de +${fmt(spreadPnl)}.`
                : spreadChange < 0
                ? `O spread alargou de ${spreadInitial} para ${newSpread} bps — oposto da tese. A perna longa perdeu mais do que a perna curta ganhou. Embora o DV01 seja casado para choques paralelos, o alargamento do spread gera perda líquida de ${fmt(Math.abs(spreadPnl))}. O flattener sofre quando a curva inclina.`
                : `O spread ficou praticamente estável. Sem variação relevante entre as pernas. Resultado marginal.`}
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
  const altPnL =
    altPos === "sell_usd"
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
  const diRateChange = scenario.fixingRate - forwardChosen; // percentage points
  const diPortfolioPnL = -diPortfolioDuration * (diRateChange / 100) * diPortfolioValue;
  const diNetPnL = diPortfolioPnL + result.ndfPnL;

  // Speculation DI: stop loss and risk/reward context
  const specStopLoss = 5000000; // R$ 5M
  const specTargetRate = 9.50;  // projected terminal rate
  const specDV01 = 14;          // R$ per contract per bp
  const specRateChange = scenario.fixingRate - forwardChosen; // pp (negative = thesis correct)
  const specBpsChange = specRateChange * 100; // basis points
  const specStopPct = result.notional > 0 ? (Math.abs(result.ndfPnL) / specStopLoss) * 100 : 0;

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
              Lucro travado na montagem: ({fmtRate(arbFwdMercado)} − {fmtRate(arbFwdTeorico)}) × USD {(arbNotional / 1e6).toFixed(0)}M = <strong className="text-emerald-600">+{fmt(arbGain)}</strong>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant p-6 bg-surface-container-lowest">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
              ① NDF vendido (perna de mercado)
            </div>
            <div className="text-sm leading-relaxed text-on-surface">
              <div>(1) Vendeu USD a termo a <strong className="text-secondary">{fmtRate(arbFwdMercado)}</strong></div>
              <div>(2) Fixing = {fmtRate(scenario.fixingRate)}</div>
              <div>(3) Resultado da perna NDF = ({fmtRate(arbFwdMercado)} − {fmtRate(scenario.fixingRate)}) × USD {(arbNotional / 1e6).toFixed(0)}M = <strong className={arbNdfPnl >= 0 ? "text-emerald-600" : "text-red-600"}>{arbNdfPnl >= 0 ? "+" : ""}{fmt(arbNdfPnl)}</strong></div>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant p-6 bg-surface-container-lowest">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
              ② Sintético comprado (perna de paridade coberta)
            </div>
            <div className="text-sm leading-relaxed text-on-surface">
              <div>(1) Tomou CDI emprestado, comprou USD spot a {fmtRate(md?.spotRate as number)}, aplicou no cupom cambial</div>
              <div>(2) Taxa forward implícita do sintético = <strong className="text-secondary">{fmtRate(arbFwdTeorico)}</strong></div>
              <div>(3) Fixing = {fmtRate(scenario.fixingRate)}</div>
              <div>(4) Resultado da perna sintética = ({fmtRate(scenario.fixingRate)} − {fmtRate(arbFwdTeorico)}) × USD {(arbNotional / 1e6).toFixed(0)}M = <strong className={arbSyntheticPnl >= 0 ? "text-emerald-600" : "text-red-600"}>{arbSyntheticPnl >= 0 ? "+" : ""}{fmt(arbSyntheticPnl)}</strong></div>
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
                Independente do fixing ({fmtRate(scenario.fixingRate)}), o lucro é sempre R$ {(arbSpread).toFixed(2)}/USD × USD {(arbNotional / 1e6).toFixed(0)}M = {fmt(arbGain)}.
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
              <strong className="text-secondary">{fmtRate(forwardChosen)}</strong>.
              {isSwapCDI ? " CDI médio: " : isFut ? " Liquidação: " : " Fixing: "}
              <strong className={colorClass}>{fmtRate(scenario.fixingRate)}</strong>.
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
                  Ajustes diários acumulados:{" "}
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
              notional={result.hedgedNotional}
              fixingRate={scenario.fixingRate}
              xLabel={xLabel}
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
                  a {fmtRate(forwardChosen)}, você travou posição que lucra{" "}
                  {isSwapCDI
                    ? "quando o CDI fica abaixo da taxa fixa"
                    : isDI
                    ? "na queda da taxa"
                    : "na queda do preço"}
                  .
                  {result.ndfPnL > 0
                    ? ` ${
                        isSwapCDI
                          ? `O CDI médio (${fmtRate(scenario.fixingRate)}) ficou abaixo da taxa fixa`
                          : `A taxa de liquidação (${fmtRate(scenario.fixingRate)}) ficou abaixo da entrada`
                      } — resultado positivo.`
                    : result.ndfPnL < 0
                    ? ` ${
                        isSwapCDI
                          ? `O CDI médio (${fmtRate(scenario.fixingRate)}) ficou acima da taxa fixa`
                          : `A taxa de liquidação (${fmtRate(scenario.fixingRate)}) ficou acima da entrada`
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
                  a {fmtRate(forwardChosen)}, você travou posição que lucra{" "}
                  {isSwapCDI
                    ? "quando o CDI fica acima da taxa fixa"
                    : isDI
                    ? "na alta da taxa"
                    : "na alta do preço"}
                  .
                  {result.ndfPnL > 0
                    ? ` ${
                        isSwapCDI
                          ? `O CDI médio (${fmtRate(scenario.fixingRate)}) ficou acima da taxa fixa`
                          : `A taxa de liquidação (${fmtRate(scenario.fixingRate)}) ficou acima da entrada`
                      } — resultado positivo.`
                    : result.ndfPnL < 0
                    ? ` ${
                        isSwapCDI
                          ? `O CDI médio (${fmtRate(scenario.fixingRate)}) ficou abaixo da taxa fixa`
                          : `A taxa de liquidação (${fmtRate(scenario.fixingRate)}) ficou abaixo da entrada`
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
                      prefixados (NTN-F e LTN) com duration média de {diPortfolioDuration} anos.
                      Títulos prefixados perdem valor quando os juros sobem (preço e taxa se movem em direções opostas).
                    </p>
                    <p>
                      <strong>Impacto na carteira (aproximação por duration):</strong>{" "}
                      ΔTaxa = {fmtRate(scenario.fixingRate)} − {fmtRate(forwardChosen)} ={" "}
                      {diRateChange >= 0 ? "+" : ""}{diRateChange.toFixed(2)}pp.{" "}
                      Variação ≈ −{diPortfolioDuration} × {diRateChange >= 0 ? "+" : ""}{(diRateChange / 100).toFixed(4)} × {fmt(diPortfolioValue)} ={" "}
                      <span className={diPortfolioPnL >= 0 ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
                        {diPortfolioPnL >= 0 ? "+" : ""}{fmt(diPortfolioPnL)}
                      </span>.
                    </p>
                    <p>
                      <strong>Resultado do DI futuro ({position === "buy_usd" ? "comprou taxa" : "vendeu taxa"} a {fmtRate(forwardChosen)}):</strong>{" "}
                      <span className={result.ndfPnL >= 0 ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
                        {result.ndfPnL >= 0 ? "+" : ""}{fmt(result.ndfPnL)}
                      </span>.
                    </p>
                    <p>
                      <strong>Resultado combinado (carteira + DI futuro):</strong>{" "}
                      {fmt(diPortfolioPnL)} {result.ndfPnL >= 0 ? "+" : "−"} {fmt(Math.abs(result.ndfPnL))} ={" "}
                      <strong className="text-secondary">{diNetPnL >= 0 ? "+" : ""}{fmt(diNetPnL)}</strong>.
                    </p>
                    <p>
                      {diRateChange > 0.1
                        ? `Os juros subiram ${diRateChange.toFixed(2)}pp e os títulos prefixados perderam valor. O DI futuro gerou ganho de ${fmt(result.ndfPnL)}, compensando a maior parte da perda na carteira. O hedge cumpriu seu papel de proteção.`
                        : diRateChange < -0.1
                        ? `Os juros caíram ${Math.abs(diRateChange).toFixed(2)}pp e os títulos prefixados valorizaram. O DI futuro gerou perda de ${fmt(result.ndfPnL)} — esse é o custo de oportunidade do hedge. Sem a proteção, o fundo teria capturado toda a valorização dos prefixados.`
                        : "A taxa ficou praticamente estável. Impacto marginal tanto na carteira quanto no DI futuro."}
                    </p>
                  </div>
                ) : isSpecDI ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Tese original:</strong> a mesa proprietária projetava queda do DI Jan/27
                      de {fmtRate(forwardChosen)} para {fmtRate(specTargetRate)} (corte de{" "}
                      {((forwardChosen - specTargetRate) * 100).toFixed(0)}bps). Posição:{" "}
                      {position === "sell_usd" ? "vendeu taxa" : "comprou taxa"} no DI futuro.
                      Stop loss da mesa: {fmt(specStopLoss)}.
                    </p>
                    <p>
                      <strong>O que aconteceu:</strong> DI Jan/27 foi de {fmtRate(forwardChosen)} para{" "}
                      {fmtRate(scenario.fixingRate)} — variação de{" "}
                      {specBpsChange >= 0 ? "+" : ""}{specBpsChange.toFixed(0)}bps.
                    </p>
                    <p>
                      <strong>Resultado da posição:</strong>{" "}
                      <span className={result.ndfPnL >= 0 ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
                        {result.ndfPnL >= 0 ? "+" : ""}{fmt(result.ndfPnL)}
                      </span>.
                    </p>
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
                      R$ {(result.notional / 1e6).toFixed(0)}M a CDI + {swapSpread.toFixed(2)}% a.a.
                      Se o CDI subir, o custo financeiro sobe junto.
                    </p>
                    <p>
                      <strong>Sem swap:</strong> custo = CDI ({fmtRate(scenario.fixingRate)}) +{" "}
                      {swapSpread.toFixed(2)}% ={" "}
                      <strong>{swapCostWithout.toFixed(2)}% a.a.</strong>
                    </p>
                    <p>
                      <strong>Com swap:</strong> o swap trocou CDI por taxa fixa de{" "}
                      {fmtRate(forwardChosen)}. Custo fixo = {fmtRate(forwardChosen)} +{" "}
                      {swapSpread.toFixed(2)}% ={" "}
                      <strong className="text-secondary">{swapCostWith.toFixed(2)}% a.a.</strong>
                    </p>
                    <p>
                      <strong>Diferença:</strong>{" "}
                      {swapSavings > 0.01
                        ? <>
                            economia de{" "}
                            <strong className="text-emerald-600">{swapSavings.toFixed(2)}% a.a.</strong>{" "}
                            O hedge protegeu a empresa: sem o swap, pagaria {swapCostWithout.toFixed(2)}%; com o swap, pagou {swapCostWith.toFixed(2)}%.
                          </>
                        : swapSavings < -0.01
                        ? <>
                            custo extra de{" "}
                            <strong className="text-red-600">{Math.abs(swapSavings).toFixed(2)}% a.a.</strong>{" "}
                            O CDI caiu e a dívida flutuante teria custado apenas {swapCostWithout.toFixed(2)}%.
                            Com o swap travado em {swapCostWith.toFixed(2)}%, a empresa pagou a mais — esse é o custo de oportunidade do hedge (o preço da previsibilidade).
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
                      {fmtRate(scenario.fixingRate)} no spot, pagando{" "}
                      {fmt(result.spotConversion)}.
                    </p>
                    <p>
                      <strong>Com o DOL futuro {position === "buy_usd" ? "comprado" : "vendido"} a{" "}
                      {fmtRate(forwardChosen)}:</strong> os ajustes diários acumulados geraram resultado de{" "}
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
                      <strong className="text-secondary">R$ {hedgeEffRate.toFixed(4)}/USD</strong>.{" "}
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
                      {fmtRate(scenario.fixingRate)} no spot, recebendo{" "}
                      {fmt(result.spotConversion)}.
                    </p>
                    <p>
                      <strong>Com o NDF {position === "sell_usd" ? "vendido" : "comprado"} a{" "}
                      {fmtRate(forwardChosen)}:</strong> o derivativo gerou resultado de{" "}
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
                      <strong className="text-secondary">R$ {hedgeEffRate.toFixed(4)}/USD</strong>.{" "}
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
                      (USD {(result.notional / 1e6).toFixed(0)}M × R$ {fmtRate(scenario.fixingRate)}),
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
                      {fmtRate(scenario.fixingRate)} no spot, desembolsando{" "}
                      {fmt(result.spotConversion)}.
                    </p>
                    <p>
                      <strong>Com o NDF {position === "buy_usd" ? "comprado" : "vendido"} a{" "}
                      {fmtRate(forwardChosen)}
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
                      <strong className="text-secondary">R$ {hedgeEffRate.toFixed(4)}/USD</strong>.{" "}
                      {hedgeRatio === 1 && Math.abs(hedgeEffRate - forwardChosen) < 0.01
                        ? "O hedge cumpriu seu papel: independente do cenário de câmbio, o custo em reais ficou travado na taxa forward contratada."
                        : hedgeRatio < 1
                        ? `O hedge parcial travou ${(hedgeRatio * 100).toFixed(0)}% do nocional a R$ ${fmtRate(forwardChosen)}. Os ${((1 - hedgeRatio) * 100).toFixed(0)}% restantes ficaram expostos ao câmbio.`
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

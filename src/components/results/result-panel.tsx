import { fmt, fmtRate } from "@/lib/formatters";
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
            Resultado do Calendar Spread
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
            ③ Resultado líquido do spread
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
              Diagrama de Payoff do Swap
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
              Resultado do {instrument || "Derivativo"}
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
              Diagrama de Payoff
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
              Por que este resultado?
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
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-600">
              E se você tivesse escolhido diferente?
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

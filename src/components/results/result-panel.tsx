import { COLORS } from "@/lib/constants";
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

  const isProfit = result.ndfPnL > 0;
  const color = isProfit ? COLORS.green : result.ndfPnL === 0 ? COLORS.gold : COLORS.red;
  const bgColor = isProfit ? COLORS.greenDim : result.ndfPnL === 0 ? COLORS.goldDim : COLORS.redDim;
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
  const posLabel = isDI
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

  // Swap cambial specific calculations
  const md = scenarioData?.context?.marketData;
  const spotInicial = (md?.spotRate as number) || 5.2;
  const notionalUSD = (md?.notional_usd as number) || 100000000;
  const nocionalBRL = spotInicial * notionalUSD;
  const prazoAnos = ((md?.tenor as number) || 756) / 252;
  const cdiAA = (md?.cdiRate as number) || 0.1175;
  const cupomCambial = 0.045; // cupom cambial do swap
  const fixDolar = scenario.fixingRate;
  const varCambialPct = ((fixDolar - spotInicial) / spotInicial) * 100;
  const varCambialBRL = (fixDolar - spotInicial) * notionalUSD;

  // Perna ativa (recebe): variação cambial + cupom cambial
  const pernaCambial =
    notionalUSD * fixDolar * Math.pow(1 + cupomCambial, prazoAnos) - nocionalBRL;
  // Perna passiva (paga): CDI acumulado
  const pernaCDI = nocionalBRL * (Math.pow(1 + cdiAA, prazoAnos) - 1);
  // Resultado líquido do swap = recebe - paga
  const resultadoSwap = pernaCambial - pernaCDI;

  const custoSemSwap = fixDolar * notionalUSD;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Scenario description */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: 12,
          background: COLORS.cardHover,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          {scenario.description}
        </p>
      </div>

      {/* ──── SWAP CAMBIAL: custom 3-panel result ──── */}
      {isSwapCambial ? (
        <>
          {/* Panel 1: Dívida SEM swap */}
          <div
            style={{
              padding: "20px 24px",
              borderRadius: 12,
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: COLORS.textMuted,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              ① Dívida sem swap (exposição cambial aberta)
            </div>
            <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.8 }}>
              <div>(1) Dívida = USD {(notionalUSD / 1e6).toFixed(0)}M</div>
              <div>
                (2) Dólar na contratação ={" "}
                <strong style={{ color: COLORS.accent }}>R$ {spotInicial.toFixed(2)}</strong>
              </div>
              <div>
                (3) Dólar no vencimento ={" "}
                <strong style={{ color: COLORS.gold }}>R$ {fixDolar.toFixed(2)}</strong>
              </div>
              <div>
                (4) Variação cambial = ({fixDolar.toFixed(2)} − {spotInicial.toFixed(2)}) ÷{" "}
                {spotInicial.toFixed(2)} ={" "}
                <strong
                  style={{
                    color: varCambialPct >= 0 ? COLORS.red : COLORS.green,
                  }}
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
                  style={{
                    color: varCambialBRL >= 0 ? COLORS.red : COLORS.green,
                  }}
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
            style={{
              padding: "20px 24px",
              borderRadius: 12,
              background: resultadoSwap >= 0 ? COLORS.greenDim : COLORS.redDim,
              border: `1px solid ${resultadoSwap >= 0 ? COLORS.green : COLORS.red}30`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: COLORS.textMuted,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              ② Resultado do swap cambial (isolado)
            </div>
            <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.8 }}>
              <div
                style={{ marginBottom: 8, fontWeight: 600, color: COLORS.green }}
              >
                Perna ativa — recebe: variação cambial + cupom cambial (
                {(cupomCambial * 100).toFixed(1)}% a.a.)
              </div>
              <div>
                (1) Nocional inicial em reais = USD {(notionalUSD / 1e6).toFixed(0)}M × R${" "}
                {spotInicial.toFixed(2)} = {fmt(nocionalBRL)}
              </div>
              <div>
                (2) Valor final da perna cambial = USD {(notionalUSD / 1e6).toFixed(0)}M × R${" "}
                {fixDolar.toFixed(2)} × (1 + {(cupomCambial * 100).toFixed(1)}%)^
                {prazoAnos.toFixed(1)}
              </div>
              <div>
                ={" "}
                {fmt(
                  notionalUSD * fixDolar * Math.pow(1 + cupomCambial, prazoAnos)
                )}
              </div>
              <div>
                (3) Resultado da perna ativa ={" "}
                {fmt(notionalUSD * fixDolar * Math.pow(1 + cupomCambial, prazoAnos))} −{" "}
                {fmt(nocionalBRL)} ={" "}
                <strong
                  style={{
                    color: pernaCambial >= 0 ? COLORS.green : COLORS.red,
                  }}
                >
                  {pernaCambial >= 0 ? "+" : ""}
                  {fmt(pernaCambial)}
                </strong>
              </div>

              <div
                style={{ marginTop: 16, marginBottom: 8, fontWeight: 600, color: COLORS.red }}
              >
                Perna passiva — paga: CDI acumulado ({(cdiAA * 100).toFixed(2)}% a.a.)
              </div>
              <div>
                (4) CDI acumulado em {prazoAnos.toFixed(1)} anos = {fmt(nocionalBRL)} × [(1 +{" "}
                {(cdiAA * 100).toFixed(2)}%)^{prazoAnos.toFixed(1)} − 1]
              </div>
              <div>
                = {fmt(nocionalBRL)} ×{" "}
                {(Math.pow(1 + cdiAA, prazoAnos) - 1).toFixed(4)} ={" "}
                <strong style={{ color: COLORS.red }}>−{fmt(pernaCDI)}</strong>
              </div>

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: `1px solid ${COLORS.border}`,
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  Resultado líquido do swap = Perna ativa − Perna passiva
                </div>
                <div>
                  = {fmt(pernaCambial)} − {fmt(pernaCDI)}
                </div>
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: resultadoSwap >= 0 ? COLORS.green : COLORS.red,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: 4,
                }}
              >
                = {resultadoSwap >= 0 ? "+" : ""}
                {fmt(resultadoSwap)}
              </div>
            </div>
          </div>

          {/* Panel 3: Resultado combinado (hedge) */}
          <div
            style={{
              padding: "20px 24px",
              borderRadius: 12,
              background: COLORS.accentDim,
              border: `1px solid ${COLORS.accent}30`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: COLORS.accent,
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              ③ Resultado combinado (dívida + swap = hedge)
            </div>
            <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.8 }}>
              <div>
                (1) Custo da dívida sem swap = {fmt(custoSemSwap)} (USD{" "}
                {(notionalUSD / 1e6).toFixed(0)}M × R$ {fixDolar.toFixed(2)})
              </div>
              <div>
                (2) Resultado líquido do swap ={" "}
                <strong
                  style={{
                    color: resultadoSwap >= 0 ? COLORS.green : COLORS.red,
                  }}
                >
                  {resultadoSwap >= 0 ? "+" : ""}
                  {fmt(resultadoSwap)}
                </strong>
              </div>
              <div>
                (3) Custo efetivo da dívida com hedge = {fmt(custoSemSwap)} −{" "}
                {fmt(resultadoSwap)} ={" "}
                <strong style={{ color: COLORS.accent }}>
                  {fmt(custoSemSwap - resultadoSwap)}
                </strong>
              </div>
              <div style={{ marginTop: 8 }}>
                (4) Custo original (na contratação) = {fmt(nocionalBRL)}
              </div>
              <div>
                (5) Diferença = {fmt(custoSemSwap - resultadoSwap - nocionalBRL)} → este é o
                custo do CDI líquido do cupom cambial ao longo de {prazoAnos.toFixed(1)} anos.
              </div>

              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: COLORS.card,
                }}
              >
                {varCambialBRL > 0
                  ? `O dólar subiu ${varCambialPct.toFixed(1)}%. Sem swap, a dívida custaria ${fmt(custoSemSwap)} (${fmt(Math.abs(varCambialBRL))} a mais). Com swap, o custo efetivo foi ${fmt(custoSemSwap - resultadoSwap)} — a variação cambial foi substancialmente neutralizada. O custo residual reflete o CDI pago menos o cupom cambial recebido.`
                  : varCambialBRL < 0
                  ? `O dólar caiu ${Math.abs(varCambialPct).toFixed(1)}%. Sem swap, a dívida custaria apenas ${fmt(custoSemSwap)} (${fmt(Math.abs(varCambialBRL))} a menos). Com swap, o custo efetivo foi ${fmt(custoSemSwap - resultadoSwap)} — a empresa "devolveu" o benefício cambial ao banco. Esse é o custo de oportunidade do hedge.`
                  : `O dólar ficou estável. O swap teve impacto cambial neutro. O custo efetivo reflete apenas o diferencial CDI vs cupom cambial.`}
              </div>
            </div>
          </div>

          {/* Payoff Chart */}
          <div
            style={{
              padding: "16px 8px",
              borderRadius: 12,
              background: COLORS.cardHover,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: COLORS.textMuted,
                marginBottom: 8,
                paddingLeft: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
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
      ) : (
        /* ──── DEFAULT: NDF, Futuros, Swap CDI×Pré ──── */
        <>
          <div
            style={{
              padding: "20px 24px",
              borderRadius: 12,
              background: bgColor,
              border: `1px solid ${color}30`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: COLORS.textMuted,
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Resultado do {instrument || "Derivativo"}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {result.ndfPnL > 0 ? "+" : ""}
              {fmt(result.ndfPnL)}
            </div>
            <div
              style={{
                fontSize: 13,
                color: COLORS.textMuted,
                marginTop: 8,
                lineHeight: 1.7,
              }}
            >
              Você {posLabel} a{" "}
              <strong style={{ color: COLORS.accent }}>{fmtRate(forwardChosen)}</strong>.
              {isSwapCDI ? " CDI médio: " : isFut ? " Liquidação: " : " Fixing: "}
              <strong style={{ color }}>{fmtRate(scenario.fixingRate)}</strong>.
              {isSwapCDI ? (
                <>
                  <br />
                  Resultado líquido do swap:{" "}
                  <strong style={{ color }}>
                    {result.ndfPnL > 0 ? "+" : ""}
                    {fmt(result.ndfPnL)}
                  </strong>
                </>
              ) : isFut ? (
                <>
                  <br />
                  Ajustes diários acumulados:{" "}
                  <strong style={{ color }}>
                    {result.ndfPnL > 0 ? "+" : ""}
                    {fmt(result.ndfPnL)}
                  </strong>
                </>
              ) : (
                <>
                  <br />
                  Taxa efetiva:{" "}
                  <strong style={{ color: COLORS.text }}>{fmtRate(result.effectiveRate)}</strong>
                </>
              )}
            </div>
          </div>
          <div
            style={{
              padding: "16px 8px",
              borderRadius: 12,
              background: COLORS.cardHover,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: COLORS.textMuted,
                marginBottom: 8,
                paddingLeft: 12,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
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
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: COLORS.accent,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Por que este resultado?
            </div>
            <p style={{ color: COLORS.text, fontSize: 14, margin: 0, lineHeight: 1.7 }}>
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
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 12,
              background: COLORS.goldDim,
              border: `1px solid ${COLORS.gold}30`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: COLORS.gold,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              E se você tivesse escolhido diferente?
            </div>
            <p style={{ color: COLORS.text, fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              Se tivesse <strong>{altLabel}</strong> ao invés de {posLabel}, resultado seria{" "}
              <strong style={{ color: altPnL > 0 ? COLORS.green : COLORS.red }}>
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

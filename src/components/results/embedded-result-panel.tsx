import { COLORS } from "@/lib/constants";
import { fmt } from "@/lib/formatters";
import { calculateEmbeddedResult } from "@/lib/calculations/embedded";
import type { Scenario, ResolutionScenario } from "@/types/scenario";

interface EmbeddedResultPanelProps {
  scenario: ResolutionScenario;
  scenarioData: Scenario;
}

function Panel({
  title,
  children,
  bg,
}: {
  title: string;
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <div
      style={{
        padding: "20px 24px",
        borderRadius: 12,
        background: bg || COLORS.card,
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
        {title}
      </div>
      <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

function PnLBig({ value, label }: { value: number; label: string }) {
  const c = value >= 0 ? COLORS.green : COLORS.red;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 12, color: COLORS.textMuted }}>{label}</div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: c,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {value >= 0 ? "+" : ""}
        {fmt(value)}
      </div>
    </div>
  );
}

export function EmbeddedResultPanel({ scenario, scenarioData }: EmbeddedResultPanelProps) {
  const r = calculateEmbeddedResult(scenarioData, scenario);
  const strat = scenarioData.embeddedStrategy;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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

      {strat === "coe" && (
        <>
          <Panel title="① Resultado do COE">
            <div>
              (1) S&P 500 variou {(r.retornoSP as number) >= 0 ? "+" : ""}
              {((r.retornoSP as number) * 100).toFixed(0)}%
            </div>
            <div>
              (2) Participação = 70% × {((r.retornoSP as number) * 100).toFixed(0)}% ×{" "}
              {fmt(r.inv as number)} ={" "}
              <strong
                style={{
                  color: (r.participacao as number) > 0 ? COLORS.green : COLORS.textMuted,
                }}
              >
                {fmt(r.participacao as number)}
              </strong>
            </div>
            <div>
              (3) Valor final do COE = {fmt(r.inv as number)} + {fmt(r.participacao as number)} ={" "}
              <strong>{fmt(r.coeResult as number)}</strong>
            </div>
          </Panel>
          <Panel title="② Alternativa: CDI por 2 anos">
            <div>(1) CDI acumulado = {fmt(r.cdiTotal as number)}</div>
            <div>
              (2) Valor final no CDI = <strong>{fmt(r.cdiResult as number)}</strong>
            </div>
          </Panel>
          <Panel
            title="③ Comparação"
            bg={(r.diff as number) >= 0 ? COLORS.greenDim : COLORS.redDim}
          >
            <div>
              COE: {fmt(r.coeResult as number)} vs CDI: {fmt(r.cdiResult as number)}
            </div>
            <PnLBig
              value={r.diff as number}
              label={
                (r.diff as number) >= 0
                  ? "COE superou o CDI"
                  : "Custo de oportunidade (COE vs CDI)"
              }
            />
          </Panel>
        </>
      )}

      {strat === "prepayment" && (
        <>
          <Panel title="① Análise do exercício">
            <div>(1) Economia anual = {fmt(r.economia as number)}</div>
            <div>
              (2) Economia total ({scenarioData.context.marketData.prazoRestante} anos) ={" "}
              {fmt(r.economiaTotal as number)}
            </div>
            <div>(3) Multa de pré-pagamento = {fmt(r.multa as number)}</div>
            <PnLBig value={r.ganhoLiquido as number} label="Ganho líquido do exercício" />
          </Panel>
          <Panel title="② Lição">
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: COLORS.cardHover,
              }}
            >
              {scenario.id === "exerceu"
                ? "A empresa exerceu a opção e economizou. A call sobre a dívida estava 'in the money'."
                : scenario.id === "juros_subiram"
                ? "A janela fechou. A opção voltou a ficar 'out of the money'. O timing do exercício é crítico."
                : "Exerceu cedo demais — se esperasse, teria conseguido taxa ainda melhor. Risco de exercício prematuro."}
            </div>
          </Panel>
        </>
      )}

      {strat === "callable" && (
        <>
          <Panel title="① Resultado do callable bond">
            <div>(1) CDI final = {(r.cdiFinal as number).toFixed(2)}%</div>
            <div>
              (2) Custo de refinanciamento para a emissora = {(r.cdiFinal as number).toFixed(2)}%
              + 2,00% = {((r.cdiFinal as number) + 2).toFixed(2)}%
            </div>
            <div>
              (3) Cupom atual do callable = CDI + 2,50% ={" "}
              {((r.cdiFinal as number) + 2.5).toFixed(2)}%
            </div>
            <div>
              (4){" "}
              {(r.cdiFinal as number) < 10
                ? `Emissora exerce a call — refinancia de ${((r.cdiFinal as number) + 2.5).toFixed(2)}% para ${((r.cdiFinal as number) + 2.0).toFixed(2)}%. Investidor recebe o par e precisa reinvestir a taxas menores.`
                : `Call NÃO exercido — emissora mantém a dívida. Investidor continua recebendo CDI+2,50%.`}
            </div>
          </Panel>
          <Panel
            title="② Análise do prêmio de 50 bps"
            bg={(r.cdiFinal as number) < 10 ? COLORS.redDim : COLORS.greenDim}
          >
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: COLORS.cardHover,
              }}
            >
              {(r.cdiFinal as number) < 10
                ? `Juros caíram e a call foi exercida. O prêmio de 50 bps acumulado por ${r.callAno} anos (${(r.callAno as number) * 50} bps) não compensou o custo de reinvestimento a taxas ${((r.cdiFinal as number) + 2.5 - ((r.cdiFinal as number) + 2.0)).toFixed(1)}% menores por ${(r.prazo as number) - (r.callAno as number)} anos. O risco de reinvestimento se materializou.`
                : (r.cdiFinal as number) > 13
                ? `Juros subiram e o call não foi exercido. O investidor recebeu o prêmio de 50 bps por todos os ${r.prazo} anos (${(r.prazo as number) * 50} bps acumulados). Excelente negócio — a call vendida expirou 'out of the money'.`
                : `Juros estáveis, call não exercido. O investidor recebeu o prêmio integral de 50 bps/ano.`}
            </div>
          </Panel>
        </>
      )}

      {strat === "fx_trigger" && (
        <>
          <Panel
            title={`① Resultado: trigger ${r.triggered ? "ACIONADO" : "NÃO acionado"}`}
            bg={r.triggered ? COLORS.redDim : COLORS.greenDim}
          >
            <div>(1) Dólar final = R$ {(r.fixDolar as number).toFixed(2)}</div>
            <div>(2) Barreira = R$ {(r.barreira as number).toFixed(2)}</div>
            <div>
              (3){" "}
              {r.triggered
                ? `Dólar > barreira → custo sobe de ${((r.taxaBase as number) * 100).toFixed(1)}% para ${(((r.taxaBase as number) + (r.stepUp as number)) * 100).toFixed(1)}%`
                : "Dólar abaixo da barreira → taxa subsidiada mantida"}
            </div>
            {r.triggered && <div>(4) Impacto anual = {fmt(r.impacto as number)}</div>}
          </Panel>
          <Panel title="② Tratamento contábil">
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: COLORS.cardHover,
              }}
            >
              Bifurcação obrigatória: a call digital de dólar (variável: câmbio) não está
              intimamente relacionada ao hospedeiro (empréstimo em BRL). O derivativo deve ser
              separado e marcado a valor justo, independentemente de o trigger ter sido acionado.
            </div>
          </Panel>
        </>
      )}

      {strat === "trs_sintetico" && (
        <>
          {r.bancoQuebrou ? (
            <Panel title="① Risco do emissor materializado" bg={COLORS.redDim}>
              <div>O banco emissor do COE entrou em liquidação.</div>
              <div>O portfólio de referência performou bem, mas o investimento foi perdido.</div>
              <div>O FGC NÃO cobre COE.</div>
              <PnLBig value={-(r.nocional as number)} label="Perda total" />
            </Panel>
          ) : (
            <>
              <Panel title="① Carry + variação de preço">
                <div>
                  (1) Carry anual = {fmt(r.carry as number)}/ano ×{" "}
                  {scenarioData.context.marketData.prazo} anos ={" "}
                  {fmt((r.carry as number) * (scenarioData.context.marketData.prazo as number))}
                </div>
                <div>(2) Variação de preço = {fmt(r.deltaPreco as number)}</div>
                <PnLBig value={r.total as number} label="Resultado total" />
              </Panel>
            </>
          )}
        </>
      )}

      {strat === "credit_stepup" && (
        <>
          <Panel
            title={`① Resultado: step-up ${r.triggered ? "ATIVADO" : "NÃO ativado"}`}
            bg={r.triggered ? COLORS.redDim : COLORS.greenDim}
          >
            <div>
              (1){" "}
              {r.triggered
                ? `Rating rebaixado — spread subiu de CDI+2,50% para CDI+4,00%`
                : `Rating mantido ou melhorado — spread permanece em CDI+2,50%`}
            </div>
            {r.triggered && (
              <div>
                (2) Impacto anual = {fmt(r.impacto as number)} (efeito pró-cíclico)
              </div>
            )}
          </Panel>
        </>
      )}

      {strat === "cap_floor" && (
        <>
          <Panel title="① Corredor de custo">
            <div>(1) CDI final = {(r.cdiFinal as number).toFixed(2)}%</div>
            <div>
              (2) Custo sem limites = CDI + {((r.spread as number) * 100).toFixed(2)}% ={" "}
              {((r.custoRaw as number) * 100).toFixed(2)}%
            </div>
            <div>
              (3) Cap = {((r.cap as number) * 100).toFixed(2)}% | Floor ={" "}
              {((r.floor as number) * 100).toFixed(2)}%
            </div>
            <div>
              (4) Custo efetivo ={" "}
              <strong style={{ color: COLORS.accent }}>
                {((r.custoEfetivo as number) * 100).toFixed(2)}%
              </strong>
            </div>
          </Panel>
          <Panel
            title="② Impacto dos derivativos"
            bg={
              (r.impactoCap as number) > 0
                ? COLORS.greenDim
                : (r.impactoFloor as number) > 0
                ? COLORS.redDim
                : COLORS.card
            }
          >
            {(r.impactoCap as number) > 0 && (
              <div>
                Cap acionado! Economia ={" "}
                <strong style={{ color: COLORS.green }}>
                  +{fmt(r.impactoCap as number)}/ano
                </strong>{" "}
                (banco absorve o excedente)
              </div>
            )}
            {(r.impactoFloor as number) > 0 && (
              <div>
                Floor acionado! Custo extra ={" "}
                <strong style={{ color: COLORS.red }}>
                  +{fmt(r.impactoFloor as number)}/ano
                </strong>{" "}
                (empresa paga acima do CDI+spread)
              </div>
            )}
            {(r.impactoCap as number) === 0 && (r.impactoFloor as number) === 0 && (
              <div>
                Dentro do corredor — nenhum derivativo ativado. Custo = CDI + spread normalmente.
              </div>
            )}
          </Panel>
        </>
      )}

      {strat === "convertible" && (
        <>
          <Panel title="① Análise de conversão">
            <div>(1) Preço de conversão = R$ {(r.precoConv as number).toFixed(2)}</div>
            <div>(2) TECH3 no vencimento = R$ {(r.precoFinal as number).toFixed(2)}</div>
            <div>
              (3) Cada R$ 1.000 converte em {(r.acoesPorMil as number).toFixed(0)} ações
            </div>
            <div>
              (4) Valor das ações = {(r.acoesPorMil as number).toFixed(0)} × R${" "}
              {(r.precoFinal as number).toFixed(2)} = R$ {(r.valorConversao as number).toFixed(2)}{" "}
              por R$ 1.000 de face
            </div>
            <div>
              (5){" "}
              {r.valeConverter
                ? `Conversão vale a pena: ganho de ${((r.ganhoPct as number) * 100).toFixed(1)}% sobre a face`
                : "Conversão NÃO vale — ações valem menos que a face da debênture"}
            </div>
          </Panel>
          {r.valeConverter ? (
            <Panel title="② Resultado da conversão" bg={COLORS.greenDim}>
              <PnLBig
                value={r.ganhoTotal as number}
                label="Ganho de conversão (vs valor de face)"
              />
              <div style={{ marginTop: 8 }}>
                (1) Cupom sacrificado ao longo de 5 anos = {fmt(r.cupomSacrificado as number)}
              </div>
              <div>
                (2) Ganho líquido = {fmt(r.ganhoTotal as number)} −{" "}
                {fmt(r.cupomSacrificado as number)} ={" "}
                <strong
                  style={{
                    color:
                      (r.ganhoTotal as number) - (r.cupomSacrificado as number) >= 0
                        ? COLORS.green
                        : COLORS.red,
                  }}
                >
                  {fmt((r.ganhoTotal as number) - (r.cupomSacrificado as number))}
                </strong>
              </div>
            </Panel>
          ) : (
            <Panel title="② Debênture mantida" bg={COLORS.redDim}>
              <div>
                Conversão não exercida. O investidor mantém a debênture e recebe CDI+1,00% até
                o vencimento.
              </div>
              <div>
                Cupom sacrificado (vs plain vanilla) = {fmt(r.cupomSacrificado as number)} ao
                longo de 5 anos — o preço de uma opção que não foi exercida.
              </div>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}

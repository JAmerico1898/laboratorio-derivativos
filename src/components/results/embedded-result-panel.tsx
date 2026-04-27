import { fmt } from "@/lib/formatters";
import { calculateEmbeddedResult } from "@/lib/calculations/embedded";
import type { Scenario, ResolutionScenario } from "@/types/scenario";

interface EmbeddedResultPanelProps {
  scenario: ResolutionScenario;
  scenarioData: Scenario;
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-outline-variant p-6 ${className ?? 'bg-surface-container-lowest'}`}>
      <div className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{title}</div>
      <div className="text-sm leading-relaxed text-on-surface">{children}</div>
    </div>
  );
}

function PnLBig({ value, label }: { value: number; label: string }) {
  return (
    <div className="mt-2">
      <div className="text-xs text-on-surface-variant">{label}</div>
      <div className={`text-[28px] font-extrabold font-mono ${value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
        {value >= 0 ? "+" : ""}{fmt(value)}
      </div>
    </div>
  );
}

export function EmbeddedResultPanel({ scenario, scenarioData }: EmbeddedResultPanelProps) {
  const r = calculateEmbeddedResult(scenarioData, scenario);
  const strat = scenarioData.embeddedStrategy;

  return (
    <div className="flex flex-col gap-5">
      {scenario.description && scenario.description.trim() !== "" && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {scenario.description}
          </p>
        </div>
      )}

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
                className={(r.participacao as number) > 0 ? 'text-emerald-600' : 'text-on-surface-variant'}
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
            className={(r.diff as number) >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}
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
          {scenario.id === "spread_alargou" ? (
            <>
              <Panel title="① Resultado: opção NÃO exercida" className="bg-red-50 border-red-200">
                <div>(1) A oferta de CDI+2,00% foi retirada — o spread de crédito do setor voltou a se alargar.</div>
                <div>(2) A empresa continua pagando CDI+3,00% sobre {fmt(r.saldo as number)}.</div>
                <div>(3) A opção de pré-pagamento voltou a ficar &apos;fora do dinheiro&apos; (out of the money) — não há ganho de spread a capturar.</div>
              </Panel>
              <Panel title="② Lição">
                <div className="rounded-lg bg-surface-container-low p-3.5">
                  A janela de oportunidade fechou. Em empréstimos pós-fixados em CDI, o gatilho de exercício é a
                  <strong> compressão do spread de crédito</strong> — não o nível de juros. Esse spread depende
                  do rating do tomador e do apetite dos bancos pelo setor, e pode reverter rapidamente. O timing
                  do exercício da call sobre dívida própria é tão crítico quanto o de qualquer opção americana.
                </div>
              </Panel>
            </>
          ) : (
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
                <div className="rounded-lg bg-surface-container-low p-3.5">
                  {scenario.id === "exerceu"
                    ? "A empresa exerceu a opção e economizou. A call sobre a dívida estava 'in the money' — o spread de crédito caiu de 3,00% para 2,00%, criando ganho mesmo com o CDI inalterado."
                    : "Exerceu no momento certo, mas o spread continuou comprimindo depois. Não foi um erro — não há como antecipar a trajetória do prêmio de crédito —, apenas um lembrete de que opções americanas embutem o trade-off entre exercer agora e esperar por condições melhores."}
                </div>
              </Panel>
            </>
          )}
        </>
      )}

      {strat === "callable" && (
        <>
          <Panel title="① Resultado do callable bond">
            <div>(1) Spread de mercado para o emissor = {(r.newSpreadPct as number).toFixed(2)}% a.a.</div>
            <div>
              (2) Cupom atual do callable = CDI + {(r.cupomCallablePct as number).toFixed(2)}%
            </div>
            <div>
              (3) Refinanciamento possível = CDI + {(r.newSpreadPct as number).toFixed(2)}%
            </div>
            <div>
              (4){" "}
              {r.exercised
                ? `Emissora exerce a call — refinancia de CDI+${(r.cupomCallablePct as number).toFixed(2)}% para CDI+${(r.newSpreadPct as number).toFixed(2)}% (spread comprimiu ${((r.cupomCallablePct as number) - (r.newSpreadPct as number)).toFixed(2)} pp). Investidor recebe o par e precisa reinvestir em papéis com prêmio de risco menor.`
                : `Call NÃO exercido — não há compressão suficiente do spread. Investidor continua recebendo CDI+${(r.cupomCallablePct as number).toFixed(2)}%.`}
            </div>
          </Panel>
          <Panel
            title="② Análise do prêmio de 50 bps"
            className={r.exercised ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}
          >
            <div className="rounded-lg bg-surface-container-low p-3.5">
              {r.exercised
                ? `O spread de crédito do emissor comprimiu de ${(r.cupomPlainPct as number).toFixed(2)}% para ${(r.newSpreadPct as number).toFixed(2)}% e a call foi exercida. O prêmio de 50 bps acumulado por ${r.callAno} anos (${(r.callAno as number) * 50} bps) deixou de ser pago nos ${(r.prazo as number) - (r.callAno as number)} anos restantes. Mais grave: o investidor agora reinveste em emissões comparáveis a CDI+${(r.newSpreadPct as number).toFixed(2)}%, perdendo ${((r.cupomCallablePct as number) - (r.newSpreadPct as number)).toFixed(2)} pp de yield por ${(r.prazo as number) - (r.callAno as number)} anos. O risco de reinvestimento se materializou pela compressão do spread de crédito — não por movimento da Selic.`
                : (r.newSpreadPct as number) > (r.cupomCallablePct as number)
                ? `O spread de crédito se alargou para ${(r.newSpreadPct as number).toFixed(2)}% (>${(r.cupomCallablePct as number).toFixed(2)}%). A call expirou 'out of the money' — emissora não tem incentivo para refinanciar a custo maior. Investidor recebeu o prêmio de 50 bps por todos os ${r.prazo} anos (${(r.prazo as number) * 50} bps acumulados). Excelente negócio.`
                : `Spread estável (${(r.newSpreadPct as number).toFixed(2)}%), próximo ao cupom callable. Compressão insuficiente para justificar custos de exercício — call não exercido. Investidor recebeu o prêmio integral de 50 bps/ano.`}
            </div>
          </Panel>
        </>
      )}

      {strat === "fx_trigger" && (
        <>
          <Panel
            title={`① Resultado: trigger ${r.triggered ? "ACIONADO" : "NÃO acionado"}`}
            className={r.triggered ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}
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
            <div className="rounded-lg bg-surface-container-low p-3.5">
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
            <Panel title="① Risco do emissor materializado" className="bg-red-50 border-red-200">
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
            className={r.triggered ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}
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
              <strong className="text-secondary">
                {((r.custoEfetivo as number) * 100).toFixed(2)}%
              </strong>
            </div>
          </Panel>
          <Panel
            title="② Impacto dos derivativos"
            className={
              (r.impactoCap as number) > 0
                ? 'bg-emerald-50 border-emerald-200'
                : (r.impactoFloor as number) > 0
                ? 'bg-red-50 border-red-200'
                : 'bg-surface-container-lowest'
            }
          >
            {(r.impactoCap as number) > 0 && (
              <div>
                Cap acionado! Economia ={" "}
                <strong className="text-emerald-600">
                  +{fmt(r.impactoCap as number)}/ano
                </strong>{" "}
                (banco absorve o excedente)
              </div>
            )}
            {(r.impactoFloor as number) > 0 && (
              <div>
                Floor acionado! Custo extra ={" "}
                <strong className="text-red-600">
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
            <Panel title="② Resultado da conversão" className="bg-emerald-50 border-emerald-200">
              <PnLBig
                value={r.ganhoTotal as number}
                label="Ganho de conversão (vs valor de face)"
              />
              <div className="mt-2">
                (1) Cupom sacrificado ao longo de 5 anos = {fmt(r.cupomSacrificado as number)}
              </div>
              <div>
                (2) Ganho líquido = {fmt(r.ganhoTotal as number)} −{" "}
                {fmt(r.cupomSacrificado as number)} ={" "}
                <strong
                  className={
                    (r.ganhoTotal as number) - (r.cupomSacrificado as number) >= 0
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }
                >
                  {fmt((r.ganhoTotal as number) - (r.cupomSacrificado as number))}
                </strong>
              </div>
            </Panel>
          ) : (
            <Panel title="② Debênture mantida" className="bg-red-50 border-red-200">
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

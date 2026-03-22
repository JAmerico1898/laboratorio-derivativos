import { COLORS } from "@/lib/constants";
import { fmt, fmtUSD } from "@/lib/formatters";
import { calculateCreditResult } from "@/lib/calculations/credit";
import type { Scenario, ResolutionScenario } from "@/types/scenario";

interface CreditResultPanelProps {
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

function PnLBig({
  value,
  label,
  prefix,
  formatFn,
}: {
  value: number;
  label: string;
  prefix?: string;
  formatFn?: (v: number) => string;
}) {
  const c = value >= 0 ? COLORS.green : COLORS.red;
  const p = prefix || "";
  const display = formatFn ? formatFn(value) : fmt(value);
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
        {p}
        {display}
      </div>
    </div>
  );
}

export function CreditResultPanel({ scenario, scenarioData }: CreditResultPanelProps) {
  const r = calculateCreditResult(scenarioData, scenario);
  const strat = scenarioData.creditStrategy;

  if (strat === "cds_hedge") {
    const spreadAnual =
      ((r.spreadInicial as number) / 10000) * (r.nocional as number);
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
        <Panel title="① Contratação do CDS (ativo de proteção)">
          <div>
            (1) Spread contratado = {r.spreadInicial} bps ={" "}
            {((r.spreadInicial as number) / 100).toFixed(2)}% a.a.
          </div>
          <div>
            (2) Custo anual = {((r.spreadInicial as number) / 100).toFixed(2)}% ×{" "}
            {fmt(r.nocional as number)} = {fmt(spreadAnual)}/ano
          </div>
          <div>
            (3) Custo total da proteção (2 anos) = {fmt(r.custoTotal as number)}
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: COLORS.textMuted }}>
            Na contratação, o banco registra um{" "}
            <strong style={{ color: COLORS.accent }}>ativo</strong> de{" "}
            {fmt(r.custoTotal as number)} (direito à proteção de crédito). A saída de caixa
            tem contrapartida no ativo — sem impacto imediato no resultado.
          </div>
        </Panel>
        {r.isDefault ? (
          <>
            <Panel title="② Evento de crédito — CDS acionado" bg={COLORS.greenDim}>
              <div>(1) Default ocorreu após ~12 meses</div>
              <div>
                (2) Spread pago até o default = {fmt(r.spreadPagoAteDefault as number)} (12
                meses de {fmt(spreadAnual)}/ano)
              </div>
              <div>(3) Nocional protegido = {fmt(r.nocional as number)}</div>
              <div>
                (4) Recovery rate = {((r.recoveryRate as number) * 100).toFixed(0)}%
              </div>
              <div>(5) LGD = {((r.lgd as number) * 100).toFixed(0)}%</div>
              <div>
                (6) Indenização recebida = {fmt(r.nocional as number)} ×{" "}
                {((r.lgd as number) * 100).toFixed(0)}% ={" "}
                <strong style={{ color: COLORS.green }}>+{fmt(r.indenizacao as number)}</strong>
              </div>
            </Panel>
            <Panel title="③ Resultado líquido" bg={COLORS.greenDim}>
              <div>(1) Indenização recebida = +{fmt(r.indenizacao as number)}</div>
              <div>
                (2) Spread pago até o default = −{fmt(r.spreadPagoAteDefault as number)}
              </div>
              <PnLBig value={r.resultadoLiquido as number} label="Resultado líquido da proteção" />
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: COLORS.card,
                }}
              >
                O evento de crédito ocorreu. A indenização de {fmt(r.indenizacao as number)}{" "}
                cobriu {((r.lgd as number) * 100).toFixed(0)}% da exposição. Sem o CDS, a
                perda teria sido {fmt((r.nocional as number) * (r.lgd as number))}. Com o CDS,
                o custo foi apenas o spread pago ({fmt(r.spreadPagoAteDefault as number)}) + a
                parcela de recovery ({((r.recoveryRate as number) * 100).toFixed(0)}% ={" "}
                {fmt((r.nocional as number) * (r.recoveryRate as number))}) que depende do
                processo de RJ. O seguro funcionou.
              </div>
            </Panel>
          </>
        ) : (
          <>
            <Panel title="② Marcação a mercado do ativo (CDS)">
              <div>(1) Spread na contratação = {r.spreadInicial} bps</div>
              <div>(2) Spread atual de mercado = {r.spreadFinal} bps</div>
              <div>
                (3) Variação ={" "}
                {(r.spreadFinal as number) - (r.spreadInicial as number) > 0 ? "+" : ""}
                {(r.spreadFinal as number) - (r.spreadInicial as number)} bps
              </div>
              <div>(4) DV01 total = {fmt(r.dv01Total as number)}/bp</div>
              <div>
                (5) Ajuste no valor do ativo = {fmt(r.dv01Total as number)} × (
                {(r.spreadFinal as number) - (r.spreadInicial as number)}) ={" "}
                <strong
                  style={{
                    color: (r.mtm as number) >= 0 ? COLORS.green : COLORS.red,
                  }}
                >
                  {(r.mtm as number) >= 0 ? "+" : ""}
                  {fmt(r.mtm as number)}
                </strong>
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: COLORS.textMuted }}>
                {(r.spreadFinal as number) < (r.spreadInicial as number)
                  ? `O spread comprimiu — a proteção comprada perdeu valor. O ativo que custou ${fmt(r.custoTotal as number)} agora poderia ser revendido por aproximadamente ${fmt((r.custoTotal as number) + (r.mtm as number))}. A diferença de ${fmt(Math.abs(r.mtm as number))} é a perda de marcação a mercado.`
                  : `O spread alargou — a proteção comprada ganhou valor. O ativo que custou ${fmt(r.custoTotal as number)} agora vale mais no mercado — poderia ser revendido com ganho de ${fmt(r.mtm as number)}.`}
              </div>
            </Panel>
            <Panel
              title="③ Resultado econômico"
              bg={(r.resultadoLiquido as number) >= 0 ? COLORS.greenDim : COLORS.redDim}
            >
              <div>
                (1) Valor original do ativo (CDS contratado) = {fmt(r.custoTotal as number)}
              </div>
              <div>
                (2) Ajuste de marcação a mercado ={" "}
                <strong
                  style={{
                    color: (r.mtm as number) >= 0 ? COLORS.green : COLORS.red,
                  }}
                >
                  {(r.mtm as number) >= 0 ? "+" : ""}
                  {fmt(r.mtm as number)}
                </strong>
              </div>
              <div>
                (3) Valor atual do ativo ={" "}
                {fmt((r.custoTotal as number) + (r.mtm as number))}
              </div>
              <PnLBig
                value={r.mtm as number}
                label="Resultado (variação do valor do ativo)"
              />
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: COLORS.card,
                }}
              >
                {(r.spreadFinal as number) < (r.spreadInicial as number)
                  ? `O risco diminuiu e o spread comprimiu de ${r.spreadInicial} para ${r.spreadFinal} bps. O ativo de proteção perdeu ${fmt(Math.abs(r.mtm as number))} de valor. Se o banco encerrar a posição (vender o CDS no mercado), realizaria essa perda. Se mantiver até o vencimento sem evento de crédito, o ativo será totalmente amortizado. O "seguro" cumpriu seu papel durante o período de incerteza — a perda de valor é o custo da proteção que não precisou ser acionada.`
                  : `O spread se manteve estável em ${r.spreadFinal} bps. O ativo de proteção teve variação marginal de valor. O CDS continua cumprindo seu papel de seguro.`}
              </div>
            </Panel>
          </>
        )}
      </div>
    );
  }

  if (strat === "trs") {
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
        <Panel title="① Carry (spread de cupom)">
          <div>
            (1) Cupom recebido = CDI +{" "}
            {((scenarioData.context.marketData.spreadCupom as number) * 100).toFixed(2)}%
          </div>
          <div>
            (2) Custo pago = CDI +{" "}
            {((scenarioData.context.marketData.spreadFinanc as number) * 100).toFixed(2)}%
          </div>
          <div>
            (3) Spread líquido = {((r.spreadLiq as number) * 100).toFixed(2)}% a.a.
          </div>
          <div>
            (4) Carry anual = {((r.spreadLiq as number) * 100).toFixed(2)}% ×{" "}
            {fmt(r.nocional as number)} ={" "}
            <strong style={{ color: COLORS.green }}>+{fmt(r.carry as number)}</strong>
          </div>
        </Panel>
        <Panel title="② Variação de preço da debênture">
          <div>
            (1) Variação ={" "}
            <strong
              style={{
                color: (r.varPct as number) >= 0 ? COLORS.green : COLORS.red,
              }}
            >
              {(r.varPct as number) >= 0 ? "+" : ""}
              {(r.varPct as number).toFixed(1)}%
            </strong>
          </div>
          <div>
            (2) Impacto = {(r.varPct as number).toFixed(1)}% × {fmt(r.nocional as number)} ={" "}
            <strong
              style={{
                color: (r.deltaPreco as number) >= 0 ? COLORS.green : COLORS.red,
              }}
            >
              {(r.deltaPreco as number) >= 0 ? "+" : ""}
              {fmt(r.deltaPreco as number)}
            </strong>
          </div>
        </Panel>
        <Panel
          title="③ Resultado total do TRS"
          bg={(r.total as number) >= 0 ? COLORS.greenDim : COLORS.redDim}
        >
          <div>(1) Carry = +{fmt(r.carry as number)}</div>
          <div>(2) Variação de preço = {fmt(r.deltaPreco as number)}</div>
          <PnLBig value={r.total as number} label="Resultado total" />
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 8,
              background: COLORS.card,
            }}
          >
            {(r.total as number) > 0
              ? `A estratégia funcionou: o carry de ${fmt(r.carry as number)} somado à valorização de ${fmt(r.deltaPreco as number)} gerou resultado positivo. O TRS permitiu capturar o retorno sem desembolsar os ${fmt(r.nocional as number)} da compra direta.`
              : (r.deltaPreco as number) < 0
              ? `A debênture perdeu ${Math.abs(r.varPct as number).toFixed(1)}% de valor, gerando perda de ${fmt(Math.abs(r.deltaPreco as number))} que superou o carry de ${fmt(r.carry as number)}. O TRS transfere o retorno TOTAL — inclusive perdas. A exposição econômica é idêntica à compra direta.`
              : `Sem variação de preço significativa. O resultado foi o carry puro de ${fmt(r.carry as number)}. O cenário-base se materializou.`}
          </div>
        </Panel>
      </div>
    );
  }

  if (strat === "cds_spec") {
    const isUSD = r.moeda === "USD";
    const f = isUSD ? fmtUSD : fmt;
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
        <Panel title="① Mark-to-market (variação do spread)">
          <div>(1) Spread na contratação = {r.spreadInicial} bps</div>
          <div>(2) Spread atual = {r.spreadFinal} bps</div>
          <div>
            (3) Variação ={" "}
            {(r.spreadFinal as number) > (r.spreadInicial as number) ? "+" : ""}
            {r.spreadVar} bps{" "}
            {(r.spreadVar as number) > 0 ? "(alargou — tese acertou)" : "(comprimiu — tese errou)"}
          </div>
          <div>(4) DV01 total = {f(r.dv01Total as number)}/bp</div>
          <div>
            (5) Ganho/perda MTM = {f(r.dv01Total as number)} × {Math.abs(r.spreadVar as number)}{" "}
            bps ={" "}
            <strong
              style={{ color: (r.mtm as number) >= 0 ? COLORS.green : COLORS.red }}
            >
              {(r.mtm as number) >= 0 ? "+" : ""}
              {f(r.mtm as number)}
            </strong>
          </div>
        </Panel>
        <Panel title="② Custo de carregamento (carry)">
          <div>(1) Spread pago = {r.spreadInicial} bps a.a.</div>
          <div>
            (2) Carry anual = {((r.spreadInicial as number) / 100).toFixed(2)}% ×{" "}
            {f(r.nocional as number)} ={" "}
            <strong style={{ color: COLORS.red }}>−{f(r.carryAnual as number)}</strong>
          </div>
        </Panel>
        <Panel
          title="③ Resultado líquido"
          bg={(r.resultadoLiquido as number) >= 0 ? COLORS.greenDim : COLORS.redDim}
        >
          <div>(1) MTM = {f(r.mtm as number)}</div>
          <div>(2) Carry = −{f(r.carryAnual as number)}</div>
          <PnLBig value={r.resultadoLiquido as number} label="Resultado líquido (~12 meses)" formatFn={f} />
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 8,
              background: COLORS.card,
            }}
          >
            {(r.spreadVar as number) > 0
              ? `O spread alargou ${r.spreadVar} bps como projetado. O ganho de MTM (${f(r.mtm as number)}) superou o custo do carry (${f(r.carryAnual as number)}). A aposta na deterioração do crédito acertou.`
              : (r.spreadVar as number) < 0
              ? `O spread comprimiu ${Math.abs(r.spreadVar as number)} bps — oposto da tese. Perda de MTM (${f(Math.abs(r.mtm as number))}) somada ao carry (${f(r.carryAnual as number)}). A posição perdeu mas dentro do stop loss.`
              : `O spread pouco se moveu. Resultado ≈ carry negativo de ${f(r.carryAnual as number)}. A posição carrega custo enquanto espera o movimento.`}
          </div>
        </Panel>
      </div>
    );
  }

  if (strat === "basis_trade") {
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
        <Panel title="① Carry (custo de carregamento da posição)">
          <div>(1) Rendimento da debênture = +{r.bondSpread} bps a.a.</div>
          <div>(2) Custo do CDS = −{r.cdsInicial} bps a.a.</div>
          <div>
            (3) Carry líquido = {r.bondSpread} − {r.cdsInicial} ={" "}
            {(r.bondSpread as number) - (r.cdsInicial as number)} bps a.a. ={" "}
            <strong style={{ color: COLORS.red }}>{fmt(r.carryAnual as number)}/ano</strong>
          </div>
          <div>
            (4) Carry pago em {r.meses} meses ={" "}
            <strong style={{ color: COLORS.red }}>{fmt(r.carryPago as number)}</strong>
          </div>
        </Panel>
        <Panel title="② Mark-to-market do CDS">
          <div>(1) CDS na contratação = {r.cdsInicial} bps</div>
          <div>(2) CDS atual = {r.cdsFinal} bps</div>
          <div>
            (3) Variação ={" "}
            {(r.cdsInicial as number) > (r.cdsFinal as number) ? "−" : "+"}
            {Math.abs(r.cdsVar as number)} bps{" "}
            {(r.cdsVar as number) > 0
              ? "(CDS caiu — base convergiu)"
              : "(CDS subiu — base divergiu)"}
          </div>
          <div>(4) DV01 total = {fmt(r.dv01Total as number)}/bp</div>
          <div>
            (5) Ganho MTM = {fmt(r.dv01Total as number)} × {Math.abs(r.cdsVar as number)} bps
            ={" "}
            <strong
              style={{
                color: (r.mtmCDS as number) >= 0 ? COLORS.green : COLORS.red,
              }}
            >
              {(r.mtmCDS as number) >= 0 ? "+" : ""}
              {fmt(r.mtmCDS as number)}
            </strong>
          </div>
        </Panel>
        <Panel title="③ Base — convergência ou divergência?">
          <div>(1) Base inicial (CDS − bond) = {r.baseInicial} bps</div>
          <div>
            (2) Base final = {r.cdsFinal} − {r.bondSpread} = {r.baseFinal} bps
          </div>
          <div>
            (3) Variação da base = {r.baseInicial} → {r.baseFinal} bps (
            {(r.baseFinal as number) < (r.baseInicial as number)
              ? "convergiu ✓"
              : (r.baseFinal as number) > (r.baseInicial as number)
              ? "divergiu ✗"
              : "estável"}
            )
          </div>
        </Panel>
        <Panel
          title="④ Resultado líquido do basis trade"
          bg={(r.resultadoLiquido as number) >= 0 ? COLORS.greenDim : COLORS.redDim}
        >
          <div>(1) Ganho MTM do CDS = {fmt(r.mtmCDS as number)}</div>
          <div>
            (2) Carry pago ({r.meses} meses) = {fmt(r.carryPago as number)}
          </div>
          <PnLBig value={r.resultadoLiquido as number} label="Resultado líquido" />
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 8,
              background: COLORS.card,
            }}
          >
            {(r.baseFinal as number) < (r.baseInicial as number) * 0.5
              ? `A base convergiu de ${r.baseInicial} para ${r.baseFinal} bps. O ganho de MTM no CDS (${fmt(r.mtmCDS as number)}) superou o carry negativo (${fmt(Math.abs(r.carryPago as number))}). A arbitragem de base funcionou.`
              : (r.baseFinal as number) > (r.baseInicial as number)
              ? `A base divergiu de ${r.baseInicial} para ${r.baseFinal} bps. Em condições de estresse, CDS e bonds podem se descolar ainda mais. O basis trade tem risco de timing — a convergência pode levar mais tempo que o esperado. Porém, se mantiver a posição, a base historicamente converge no médio prazo.`
              : `A base ficou relativamente estável. O custo principal foi o carry negativo de ${fmt(Math.abs(r.carryPago as number))}. O timing risk é o principal inimigo do basis trade.`}
          </div>
        </Panel>
      </div>
    );
  }

  return null;
}

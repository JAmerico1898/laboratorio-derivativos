import { fmt } from "@/lib/formatters";
import { strings } from "@/lib/strings";
import { calculateOptionsResult } from "@/lib/calculations/options";
import { OptionsPayoffChart } from "@/components/charts/options-payoff-chart";
import type { Scenario, ResolutionScenario } from "@/types/scenario";

interface OptionsResultPanelProps {
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

export function OptionsResultPanel({ scenario, scenarioData }: OptionsResultPanelProps) {
  const r = calculateOptionsResult(scenarioData, scenario.fixingRate);
  const strat = scenarioData.optionStrategy;

  if (strat === "long_put_hedge") {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {scenario.description}
          </p>
        </div>
        <Panel title="① Resultado da put (isolada)">
          <div>(1) Strike da put = R$ {(r.strike as number).toFixed(2)}</div>
          <div>
            (2) PETR4 no vencimento ={" "}
            <strong className="text-amber-600">R$ {(r.fixing as number).toFixed(2)}</strong>
          </div>
          <div>
            (3) Valor intrínseco = max(R$ {(r.strike as number).toFixed(2)} − R${" "}
            {(r.fixing as number).toFixed(2)}, 0) ={" "}
            <strong>R$ {(r.putIntrinsic as number).toFixed(2)}/ação</strong>
          </div>
          <div>(4) Prêmio pago = R$ {(r.premium as number).toFixed(2)}/ação</div>
          <div>
            (5) Resultado por ação = R$ {(r.putIntrinsic as number).toFixed(2)} − R${" "}
            {(r.premium as number).toFixed(2)} ={" "}
            <strong
              className={
                (r.putIntrinsic as number) - (r.premium as number) >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }
            >
              R$ {((r.putIntrinsic as number) - (r.premium as number)).toFixed(2)}/ação
            </strong>
          </div>
          <PnLBig
            value={r.putPnL as number}
            label={`Resultado total da put (× ${((r.notional as number) / 1e6).toFixed(1)}M ações)`}
          />
        </Panel>
        <Panel title="② Resultado da carteira de ações (sem hedge)">
          <div>(1) Preço de compra = R$ {(r.spot as number).toFixed(2)}</div>
          <div>(2) Preço no vencimento = R$ {(r.fixing as number).toFixed(2)}</div>
          <div>
            (3) Variação = R$ {((r.fixing as number) - (r.spot as number)).toFixed(2)}/ação (
            {(((r.fixing as number) - (r.spot as number)) / (r.spot as number) * 100).toFixed(1)}
            %)
          </div>
          <PnLBig value={r.carteiraPnL as number} label="Resultado da carteira sem hedge" />
        </Panel>
        <Panel title="③ Resultado combinado (carteira + put = hedge)" className="bg-secondary/10 border-secondary/20">
          <div>
            (1) Resultado da carteira ={" "}
            <strong
              className={(r.carteiraPnL as number) >= 0 ? "text-emerald-600" : "text-red-600"}
            >
              {fmt(r.carteiraPnL as number)}
            </strong>
          </div>
          <div>
            (2) Resultado da put ={" "}
            <strong
              className={(r.putPnL as number) >= 0 ? "text-emerald-600" : "text-red-600"}
            >
              {fmt(r.putPnL as number)}
            </strong>
          </div>
          <div>
            (3) Resultado combinado = {fmt(r.carteiraPnL as number)} +{" "}
            {fmt(r.putPnL as number)}
          </div>
          <PnLBig
            value={r.combinedPnL as number}
            label="Resultado líquido (carteira hedgeada)"
          />
          <div className="mt-3 rounded-lg bg-surface-container-low p-3.5">
            {(r.fixing as number) < (r.strike as number)
              ? `A ação caiu abaixo do strike (R$ ${(r.strike as number).toFixed(2)}). A put compensou R$ ${(r.putIntrinsic as number).toFixed(2)}/ação da queda. Sem o hedge, a perda teria sido ${fmt(r.carteiraPnL as number)}. Com hedge, foi ${fmt(r.combinedPnL as number)}. O seguro funcionou.`
              : (r.fixing as number) > (r.spot as number)
              ? `A ação subiu! A put venceu sem valor (OTM) — o prêmio de R$ ${(r.premium as number).toFixed(2)}/ação foi o custo do seguro. A carteira ganhou ${fmt(r.carteiraPnL as number)}, líquido de ${fmt(r.combinedPnL as number)} após o custo da put. O upside foi preservado.`
              : `A ação caiu, mas ficou acima do strike. A put venceu sem valor. O prêmio foi o custo do seguro que não precisou ser acionado.`}
          </div>
        </Panel>
        <div className="rounded-xl border border-outline-variant bg-surface-container-low px-2 py-4">
          <div className="mb-2 pl-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {strings.payoffDiagram} (Carteira + Put)
          </div>
          <OptionsPayoffChart
            scenarioData={scenarioData}
            fixingRate={scenario.fixingRate}
            optResult={r}
          />
        </div>
      </div>
    );
  }

  if (strat === "collar") {
    const netCostTotal = (r.netCost as number) * (r.notional as number);
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {scenario.description}
          </p>
        </div>
        <Panel title="① Resultado das opções">
          <div>
            (1) Put comprada (strike R$ {(r.putStrike as number).toFixed(2)}): valor intrínseco
            = R$ {(r.putPayoff as number).toFixed(2)}/USD
          </div>
          <div>
            (2) Call vendida (strike R$ {(r.callStrike as number).toFixed(2)}): obrigação = R${" "}
            {Math.abs(r.callPayoff as number).toFixed(2)}/USD{" "}
            {(r.callPayoff as number) < 0 ? "(exercida contra você)" : "(venceu OTM)"}
          </div>
          <div>
            (3) Custo líquido do collar = R$ {(r.netCost as number).toFixed(2)}/USD
          </div>
          <div>
            (4) Resultado das opções por USD = R$ {(r.putPayoff as number).toFixed(2)} + (R${" "}
            {(r.callPayoff as number).toFixed(2)}) − R$ {(r.netCost as number).toFixed(2)} ={" "}
            <strong
              className={
                (r.putPayoff as number) +
                  (r.callPayoff as number) -
                  (r.netCost as number) >=
                0
                  ? "text-emerald-600"
                  : "text-red-600"
              }
            >
              R${" "}
              {(
                (r.putPayoff as number) +
                (r.callPayoff as number) -
                (r.netCost as number)
              ).toFixed(2)}
              /USD
            </strong>
          </div>
        </Panel>
        <Panel title="② Receita efetiva do exportador" className="bg-secondary/10 border-secondary/20">
          <div>
            (1) Receita no mercado spot = R$ {(r.fixing as number).toFixed(2)} × USD{" "}
            {((r.notional as number) / 1e6).toFixed(0)}M = {fmt(r.receita as number)}
          </div>
          <div>
            (2) Ajuste das opções ={" "}
            {fmt(
              ((r.putPayoff as number) + (r.callPayoff as number)) * (r.notional as number)
            )}
          </div>
          <div>(3) Custo do collar = −{fmt(netCostTotal)}</div>
          <PnLBig value={r.receitaEfetiva as number} label="Receita efetiva total" />
          <div className="mt-3 rounded-lg bg-surface-container-low p-3.5">
            {(r.fixing as number) < (r.putStrike as number)
              ? `O dólar caiu abaixo do piso (R$ ${(r.putStrike as number).toFixed(2)}). A put foi exercida, garantindo receita mínima. Sem collar, receita seria ${fmt(r.receita as number)}. Com collar: ${fmt(r.receitaEfetiva as number)}. O piso funcionou.`
              : (r.fixing as number) > (r.callStrike as number)
              ? `O dólar subiu acima do teto (R$ ${(r.callStrike as number).toFixed(2)}). A call foi exercida e o exportador entregou USD a R$ ${(r.callStrike as number).toFixed(2)}. Receita efetiva: ${fmt(r.receitaEfetiva as number)}. "Perdeu" R$ ${((r.fixing as number) - (r.callStrike as number)).toFixed(2)}/USD de upside — o preço do hedge barato.`
              : `O dólar ficou dentro do corredor (R$ ${(r.putStrike as number).toFixed(2)} – R$ ${(r.callStrike as number).toFixed(2)}). Ambas vencem OTM. Receita = spot × nocional − custo collar = ${fmt(r.receitaEfetiva as number)}.`}
          </div>
        </Panel>
        <div className="rounded-xl border border-outline-variant bg-surface-container-low px-2 py-4">
          <div className="mb-2 pl-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {strings.payoffDiagram} (Collar)
          </div>
          <OptionsPayoffChart
            scenarioData={scenarioData}
            fixingRate={scenario.fixingRate}
            optResult={{ totalPnL: r.optionsPnL }}
          />
        </div>
      </div>
    );
  }

  if (strat === "straddle") {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {scenario.description}
          </p>
        </div>
        <Panel title="① Resultado do straddle">
          <div>
            (1) Call ATM (strike R$ {(r.strike as number).toFixed(2)}): valor intrínseco = R${" "}
            {(r.callIntrinsic as number).toFixed(2)}
          </div>
          <div>
            (2) Put ATM (strike R$ {(r.strike as number).toFixed(2)}): valor intrínseco = R${" "}
            {(r.putIntrinsic as number).toFixed(2)}
          </div>
          <div>
            (3) Valor intrínseco total = R${" "}
            {((r.callIntrinsic as number) + (r.putIntrinsic as number)).toFixed(2)}/ação
          </div>
          <div>(4) Custo do straddle = R$ {(r.totalPrem as number).toFixed(2)}/ação</div>
          <div>
            (5) Resultado por ação = R${" "}
            {((r.callIntrinsic as number) + (r.putIntrinsic as number)).toFixed(2)} − R${" "}
            {(r.totalPrem as number).toFixed(2)} ={" "}
            <strong
              className={(r.pnlPerUnit as number) >= 0 ? "text-emerald-600" : "text-red-600"}
            >
              R$ {(r.pnlPerUnit as number).toFixed(2)}/ação
            </strong>
          </div>
          <div>
            (6) Breakeven superior = R$ {(r.breakUp as number).toFixed(2)} (+
            {(((r.breakUp as number) - (r.strike as number)) / (r.strike as number) * 100).toFixed(
              1
            )}
            %)
          </div>
          <div>
            (7) Breakeven inferior = R$ {(r.breakDown as number).toFixed(2)} (−
            {(((r.strike as number) - (r.breakDown as number)) / (r.strike as number) * 100).toFixed(
              1
            )}
            %)
          </div>
          <PnLBig
            value={r.totalPnL as number}
            label={`Resultado total (× ${((r.notional as number) / 1000).toFixed(0)}k ações)`}
          />
          <div className="mt-3 rounded-lg bg-surface-container-low p-3.5">
            {(r.pnlPerUnit as number) > 0
              ? `O ativo se moveu ${Math.abs(((r.fixing as number) - (r.strike as number)) / (r.strike as number) * 100).toFixed(1)}% — ultrapassou o breakeven de ${((r.totalPrem as number) / (r.strike as number) * 100).toFixed(1)}%. A aposta em volatilidade acertou.`
              : (r.pnlPerUnit as number) === -(r.totalPrem as number)
              ? `O ativo ficou exatamente no strike. Perda máxima: todo o prêmio. O pior cenário do straddle.`
              : `O ativo se moveu apenas ${Math.abs(((r.fixing as number) - (r.strike as number)) / (r.strike as number) * 100).toFixed(1)}% — insuficiente para cobrir o custo de R$ ${(r.totalPrem as number).toFixed(2)}/ação. O movimento ficou abaixo do breakeven.`}
          </div>
        </Panel>
        <div className="rounded-xl border border-outline-variant bg-surface-container-low px-2 py-4">
          <div className="mb-2 pl-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {strings.payoffDiagram} (Straddle)
          </div>
          <OptionsPayoffChart
            scenarioData={scenarioData}
            fixingRate={scenario.fixingRate}
            optResult={r}
          />
        </div>
      </div>
    );
  }

  if (strat === "risk_reversal") {
    return (
      <div className="flex flex-col gap-5">
        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {scenario.description}
          </p>
        </div>
        <Panel title="① Put vendida (obrigação)">
          <div>
            (1) Strike = R$ {(r.putStrike as number).toFixed(2)}. Dólar final = R${" "}
            {(r.fixing as number).toFixed(2)}
          </div>
          <div>
            (2) Valor intrínseco contra você = max(R$ {(r.putStrike as number).toFixed(2)} − R${" "}
            {(r.fixing as number).toFixed(2)}, 0) = R${" "}
            {Math.abs(Math.min(r.putLoss as number, 0)).toFixed(2)}/USD
          </div>
          <div>
            (3) Resultado da put vendida ={" "}
            <strong
              className={(r.putLoss as number) >= 0 ? "text-emerald-600" : "text-red-600"}
            >
              {(r.putLoss as number) >= 0 ? "+" : ""}R$ {(r.putLoss as number).toFixed(2)}/USD
            </strong>{" "}
            {(r.putLoss as number) === 0 ? "(venceu OTM — sem obrigação)" : "(exercida contra você)"}
          </div>
        </Panel>
        <Panel title="② Call comprada (direito)">
          <div>
            (1) Strike = R$ {(r.callStrike as number).toFixed(2)}. Dólar final = R${" "}
            {(r.fixing as number).toFixed(2)}
          </div>
          <div>
            (2) Valor intrínseco = max(R$ {(r.fixing as number).toFixed(2)} − R${" "}
            {(r.callStrike as number).toFixed(2)}, 0) = R$ {(r.callGain as number).toFixed(2)}/USD
          </div>
          <div>
            (3) Resultado da call comprada ={" "}
            <strong
              className={(r.callGain as number) > 0 ? "text-emerald-600" : "text-on-surface-variant"}
            >
              +R$ {(r.callGain as number).toFixed(2)}/USD
            </strong>{" "}
            {(r.callGain as number) === 0 ? "(venceu OTM)" : "(exercida a seu favor)"}
          </div>
        </Panel>
        <Panel
          title="③ Resultado líquido do risk reversal"
          className={(r.totalPnL as number) >= 0 ? "bg-emerald-50" : "bg-red-50"}
        >
          <div>
            (1) Put vendida = R$ {(r.putLoss as number).toFixed(2)}/USD ×{" "}
            {((r.notional as number) / 1e6).toFixed(0)}M ={" "}
            {fmt((r.putLoss as number) * (r.notional as number))}
          </div>
          <div>
            (2) Call comprada = R$ {(r.callGain as number).toFixed(2)}/USD ×{" "}
            {((r.notional as number) / 1e6).toFixed(0)}M ={" "}
            {fmt((r.callGain as number) * (r.notional as number))}
          </div>
          <div>
            (3) Crédito líquido recebido = R$ {(r.credit as number).toFixed(2)}/USD ×{" "}
            {((r.notional as number) / 1e6).toFixed(0)}M ={" "}
            {fmt((r.credit as number) * (r.notional as number))}
          </div>
          <div>
            (4) Total = {fmt((r.putLoss as number) * (r.notional as number))} +{" "}
            {fmt((r.callGain as number) * (r.notional as number))} +{" "}
            {fmt((r.credit as number) * (r.notional as number))}
          </div>
          <PnLBig
            value={r.totalPnL as number}
            label="Resultado líquido do risk reversal"
          />
          <div className="mt-3 rounded-lg bg-surface-container-low p-3.5">
            {(r.fixing as number) < (r.putStrike as number)
              ? `O dólar caiu abaixo do strike da put (R$ ${(r.putStrike as number).toFixed(2)}). A put vendida foi exercida contra você — perda de R$ ${Math.abs(r.putLoss as number).toFixed(2)}/USD. O skew se mostrou justificado: o mercado estava certo em precificar mais risco de queda.`
              : (r.fixing as number) > (r.callStrike as number)
              ? `O dólar subiu acima do strike da call (R$ ${(r.callStrike as number).toFixed(2)}). A call foi exercida a seu favor — ganho de R$ ${(r.callGain as number).toFixed(2)}/USD, mais o crédito recebido. O skew estava exagerado e a posição lucrou.`
              : `O dólar ficou dentro do corredor (R$ ${(r.putStrike as number).toFixed(2)} – R$ ${(r.callStrike as number).toFixed(2)}). Ambas venceram OTM. Resultado = crédito líquido de ${fmt((r.credit as number) * (r.notional as number))}. O melhor cenário: embolsou o prêmio do skew.`}
          </div>
        </Panel>
        <div className="rounded-xl border border-outline-variant bg-surface-container-low px-2 py-4">
          <div className="mb-2 pl-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {strings.payoffDiagram} (Risk Reversal)
          </div>
          <OptionsPayoffChart
            scenarioData={scenarioData}
            fixingRate={scenario.fixingRate}
            optResult={r}
          />
        </div>
      </div>
    );
  }

  return null;
}

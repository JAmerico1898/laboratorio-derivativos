# Especificação Final — Módulo de Derivativos de Crédito

## Derivativos Lab | COPPEAD/UFRJ — MBA

**Versão:** Final (pós-implementação e revisão)

---

## 1. Visão geral

O módulo de Derivativos de Crédito é o mais denso conceitualmente do aplicativo. Derivativos de crédito são menos intuitivos que os demais instrumentos, por isso cada cenário tem narrativas mais detalhadas e feedbacks que investem em contextualizar **por que** a mecânica funciona daquela forma.

Estrutura:
- **4 cenários** com dificuldade progressiva
- **Árvore de decisão** em 4 etapas por cenário
- **Memória de cálculo** passo a passo
- **Painéis de resultado** separando ativo de proteção, marcação a mercado e resultado líquido
- **Tratamento contábil correto**: o CDS contratado é registrado como ativo (direito à proteção), não como despesa imediata

---

## 2. Contextualização: o que são derivativos de crédito?

### 2.1. Conceito fundamental

Derivativos de crédito transferem o **risco de crédito** de uma entidade de referência sem transferir a propriedade do ativo subjacente. Funcionam como "seguro" contra default ou deterioração de crédito.

### 2.2. Modalidades autorizadas no Brasil

**Credit Default Swap (CDS):** Comprador de proteção paga spread periódico ao vendedor. Se ocorrer evento de crédito (default, reestruturação, falência), o vendedor indeniza a perda.

**Total Return Swap (TRS):** Uma parte recebe o retorno total de um ativo (juros + variação de preço) e paga taxa de financiamento (CDI + spread). Permite exposição econômica sem comprar o ativo.

### 2.3. Terminologia

| Termo | Significado |
|-------|-------------|
| Entidade de referência | Emissor cuja dívida está sendo protegida |
| Evento de crédito | Default, falência, reestruturação, moratória |
| Comprador de proteção | Paga o spread, recebe indenização (compra seguro) |
| Vendedor de proteção | Recebe o spread, paga indenização (vende seguro) |
| Spread do CDS | Prêmio anual pago pelo comprador (em bps) |
| Recovery rate | % do valor recuperado em caso de default |
| LGD (Loss Given Default) | 1 − recovery rate |
| DV01 | Variação do valor do CDS para 1bp de variação no spread |

---

## 3. Cenário 1 — CDS Corporativo: Hedge de Carteira de Crédito (Intermediário)

### Contexto

Banco Horizonte com R$ 500M em debêntures da Construtora Atlântico (A−, setor imobiliário sob pressão). Comitê de crédito pede redução de exposição sem venda dos títulos. CDS disponível a 280 bps a.a., 2 anos, recovery rate 35%.

### displayFields

| Campo | Valor |
|-------|-------|
| Debêntures | R$ 500M |
| Emissora | Constr. Atlântico (A−) |
| Spread CDS | 280 bps a.a. |
| Recovery rate | 35% |
| Prazo | 2 anos |
| Custo anual | R$ 14M |

### Dados de mercado

- DV01 por R$ 10M: R$ 2.000 (consistente com CDS de 2 anos)
- DV01 total: R$ 2.000 × 50 = R$ 100.000/bp

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Hedge de crédito — proteger contra default sem vender os títulos
- ❌ Especulação — apostar no default (seria naked CDS)
- ❌ Arbitragem — exigiria explorar diferença CDS vs bond spread

**Etapa 2 — Estratégia**
- ✅ Comprar proteção (pagar 280 bps, receber indenização em caso de default)
- ❌ Vender proteção (dobraria a exposição ao crédito)

Feedback correto inclui memória de cálculo da indenização: Nocional R$ 500M × LGD 65% = R$ 325M.

**Etapa 3 — Dimensionamento**
- ✅ R$ 500M (hedge integral)
- ❌ R$ 250M (hedge parcial 50%)
- ❌ R$ 750M (over-hedge — cria posição especulativa)

**Etapa 4 — Resolução**

### Tratamento contábil/econômico (correção importante)

O custo do CDS (R$ 28M total) é registrado como **ativo** (direito à proteção), não como despesa. O resultado é a **variação do valor desse ativo**:

**Cenário A — Default (após 12 meses):**
- Spread pago até o default = R$ 14M (12 meses × R$ 14M/ano)
- Indenização = R$ 500M × 65% = R$ 325M
- Resultado líquido = R$ 325M − R$ 14M = +R$ 311M
- Perda residual = parcela de recovery (35% = R$ 175M) depende do processo de RJ

**Cenário B — Rating elevado, spread comprimiu para 120 bps:**
- Valor original do ativo = R$ 28M
- MTM = DV01 × (spread_atual − spread_contratação) = R$ 100.000 × (120 − 280) = R$ 100.000 × (−160) = **−R$ 16M**
- Valor atual do ativo = R$ 28M − R$ 16M = R$ 12M
- **Resultado = −R$ 16M** (perda de valor do ativo, NÃO −R$ 44M)
- Se o banco vender o CDS no mercado: realiza R$ 12M (perda de R$ 16M vs custo original)
- Se mantiver até o vencimento sem evento: o ativo é totalmente amortizado

**Cenário C — Spread estável em 260 bps:**
- MTM = R$ 100.000 × (260 − 280) = −R$ 2M
- Variação marginal. O "seguro" não foi acionado mas cumpriu seu papel.

### Painéis de resultado implementados

1. **① Contratação do CDS (ativo de proteção)**: custo total, nota sobre registro como ativo
2. **② Evento de crédito OU Marcação a mercado**: conforme cenário
3. **③ Resultado líquido**: indenização − spread pago (default) OU variação do valor do ativo (sem default)

---

## 4. Cenário 2 — TRS: Exposição Sintética a Crédito (Intermediário)

### Contexto

Fundo Crédito Plus FIM, sem caixa, quer exposição a debêntures Energia Renovável (AA), CDI + 1,80% a.a. Banco oferece TRS: fundo recebe retorno total, paga CDI + 0,50%.

### displayFields

| Campo | Valor |
|-------|-------|
| Debênture | Energia Renovável (AA) |
| Cupom | CDI + 1,80% |
| Custo TRS | CDI + 0,50% |
| Spread líquido | 1,30% a.a. |
| Nocional | R$ 200M |
| Prazo | 1 ano |

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Exposição sintética — retorno da debênture sem comprá-la
- ❌ Especulação em juros
- ❌ Hedge

Feedback: "É como 'alugar' a posição — alavancagem implícita."

**Etapa 2 — Estratégia**
- ✅ Receber retorno total (cupom + Δpreço), pagar CDI + 0,50%
- ❌ Pagar retorno total (posição vendida)

Feedback destaca que os CDIs se cancelam parcialmente: resultado = 1,30% + Δpreço. RISCO: perda de preço é absorvida integralmente.

**Etapa 3 — Análise de risco (rebaixamento, preço cai 8%)**
- ✅ Perda de R$ 13,4M (−8% × R$ 200M + carry R$ 2,6M)
- ❌ Sem impacto (errado — TRS transfere retorno TOTAL)
- ❌ R$ 16M (esquece o carry)

**Etapa 4 — Resolução**

| Cenário | Δpreço | Carry | Total |
|---------|--------|-------|-------|
| A: Valorização +3% | +R$ 6M | +R$ 2,6M | +R$ 8,6M |
| B: Desvalorização −12% | −R$ 24M | +R$ 2,6M | −R$ 21,4M |
| C: Estável 0% | R$ 0 | +R$ 2,6M | +R$ 2,6M |

### Painéis: ① Carry, ② Variação de preço, ③ Resultado total

---

## 5. Cenário 3 — Naked CDS: Aposta contra o Soberano (Avançado)

### Contexto

Hedge fund global aposta na deterioração fiscal do Brasil. CDS Brasil 5Y a 180 bps, projeção 350-400 bps. Naked CDS (sem títulos brasileiros). Stop loss USD 5M.

### displayFields

| Campo | Valor |
|-------|-------|
| CDS Brasil 5Y | 180 bps |
| Projeção | 350-400 bps |
| Nocional | USD 50M |
| DV01 / USD 10M | USD 4.500 |
| Stop loss | USD 5M |

### Dados de mercado
- DV01 total = USD 4.500 × 5 = USD 22.500/bp

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Especulação — apostar na piora do crédito soberano
- ❌ Hedge (não há títulos — é naked CDS)
- ❌ Arbitragem

**Etapa 2 — Estratégia**
- ✅ Comprar proteção (pagar 180 bps, lucrar se spread alargar)
- ❌ Vender proteção (lucra se comprimir — oposto da tese)

Feedback: carry anual = USD 900k. Ganho potencial (180→375) = USD 22.500 × 195 = USD 4,39M.

**Etapa 3 — Adequação do nocional ao stop loss**
- ✅ Adequado — stress de −100bps gera perda de USD 2,25M + carry USD 900k = USD 3,15M < stop USD 5M
- ❌ Deveria reduzir (sub-utiliza o limite)
- ❌ Deveria aumentar (estouraria o stop)

**Etapa 4 — Resolução** (valores em USD)

| Cenário | Δspread | MTM | Carry | Líquido |
|---------|---------|-----|-------|---------|
| A: Alargou para 380 (+200bps) | USD +4,5M | −USD 900k | ≈ USD +3,6M |
| B: Comprimiu para 110 (−70bps) | −USD 1,58M | −USD 900k | ≈ −USD 2,48M |
| C: Estável 190 (+10bps) | +USD 225k | −USD 900k | ≈ −USD 675k |

### Painéis: ① MTM (variação do spread), ② Carry, ③ Resultado líquido

---

## 6. Cenário 4 — Super Desafio: CDS Basis Trade

### Contexto

Banco Meridional identifica base negativa na Vale: debênture rende CDI + 1,50% (150 bps), CDS custa 210 bps. Base = 60 bps. Monta basis trade: compra debênture (financiada a CDI) + compra proteção CDS.

### displayFields

| Campo | Valor |
|-------|-------|
| Debênture VALE | CDI + 1,50% |
| CDS VALE 5Y | 210 bps |
| Base (CDS − bond) | 60 bps |
| Nocional | R$ 100M |
| DV01 / R$ 10M | R$ 4.200 |
| Carry | −60 bps a.a. |

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Arbitragem de base — CDS > bond spread, base deve convergir
- ❌ Especulação direcional (basis trade é neutro em crédito)
- ❌ Hedge

**Etapa 2 — Estratégia**
- ✅ Comprar debênture + Comprar proteção CDS (basis trade)
- ❌ Só debênture (direcional longa)
- ❌ Só CDS (naked, direcional vendida)

Feedback: carry líquido = +150 − 210 = −60 bps a.a. = −R$ 600k/ano. Posição neutra em crédito (default na debênture é compensado pelo CDS).

**Etapa 3 — Breakeven de convergência**
- ✅ ~2,9 meses
- ❌ 12 meses
- ❌ Nunca

Memória de cálculo: DV01 total = R$ 42.000/bp. Ganho se base fechar 60 bps = R$ 42.000 × 60 = R$ 2.520.000. Carry anual = R$ 600.000. Breakeven = R$ 600k ÷ R$ 2.520k = 0,238 anos ≈ 2,9 meses.

**Etapa 4 — Resolução**

O P&L do basis trade é calculado pela **convergência da base** (DV01 × variação da base), não pelas pernas individuais:

| Cenário | CDS final | Base final | MTM base | Carry | Líquido |
|---------|-----------|------------|----------|-------|---------|
| A: Convergiu (4 meses) | 155 bps | 5 bps | +R$ 2,31M | −R$ 200k | +R$ 2,11M |
| B: Divergiu (12 meses) | 300 bps | 150 bps | −R$ 3,78M | −R$ 600k | −R$ 4,38M |
| C: Estável (12 meses) | 205 bps | 55 bps | +R$ 210k | −R$ 600k | −R$ 390k |

### Painéis: ① Carry, ② MTM (convergência da base), ③ Evolução da base, ④ Resultado líquido

---

## 7. Motor de cálculo implementado

### 7.1. CDS Hedge (`cds_hedge`)

**Sem default:**
- MTM = DV01_total × (spread_atual − spread_contratação)
- Resultado = MTM (variação do valor do ativo de proteção)
- O custo do spread NÃO é somado como despesa adicional — está embutido no valor do ativo

**Com default:**
- Resultado = Indenização (nocional × LGD) − spread pago até o evento

### 7.2. TRS (`trs`)
- Carry = (spread_cupom − spread_financiamento) × nocional
- Δpreço = variação_percentual × nocional
- Total = carry + Δpreço

### 7.3. CDS Especulativo (`cds_spec`)
- MTM = DV01_total × (spread_atual − spread_inicial)
- Carry = −(spread_inicial / 10.000) × nocional
- Resultado = MTM + carry

### 7.4. Basis Trade (`basis_trade`)
- Base_convergência = (base_inicial − base_final)
- MTM = DV01_total × base_convergência
- Carry = −(CDS_spread − bond_spread) / 10.000 × nocional × (meses/12)
- Resultado = MTM + carry

---

## 8. Resumo dos 4 cenários

| # | Título | Instrumento | Dificuldade | Conceito-chave |
|---|--------|-------------|-------------|----------------|
| 1 | Hedge de Carteira de Crédito | CDS Corporativo | Intermediário | Compra de proteção como ativo, LGD, MTM vs amortização |
| 2 | Exposição Sintética via TRS | Total Return Swap | Intermediário | Alavancagem implícita, retorno total (carry + Δpreço) |
| 3 | Naked CDS — Aposta contra o Soberano | CDS Brasil 5Y | Avançado | Especulação direcional, DV01, sizing por stop loss |
| 4 | CDS Basis Trade | CDS + Debênture | Super Desafio | Arbitragem de base, carry negativo, convergência, timing risk |

---

## 9. Lições aprendidas na implementação

1. **Tratamento contábil do CDS**: O spread pago é um ativo (direito à proteção), não uma despesa. O resultado é a variação do valor desse ativo (MTM), não ativo + MTM.

2. **DV01 realista**: Para CDS de 2 anos, DV01 ≈ R$ 2.000 por R$ 10M de nocional (não R$ 18.000, que geraria valores absurdos).

3. **Sinal do MTM**: Comprador de proteção ganha quando spread alarga (MTM positivo) e perde quando comprime (MTM negativo). Fórmula: MTM = DV01 × (spread_atual − spread_contratação).

4. **Basis trade**: O P&L é calculado pela variação da BASE (CDS − bond spread), não pelas pernas individuais. Quando a base converge, o resultado é positivo independentemente do nível absoluto dos spreads.

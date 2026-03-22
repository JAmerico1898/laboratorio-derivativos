# Especificação Final — Módulo de Swaps

## Derivativos Lab | COPPEAD/UFRJ — MBA

**Versão:** Final (pós-implementação e revisão)

---

## 1. Visão geral

O módulo de Swaps é o terceiro do aplicativo e aborda os principais tipos de swap praticados no Brasil: **CDI × Pré**, **Swap Cambial (USD × CDI)**, **Swap Direcional** e **Swap com CVA**. Este é o módulo que exigiu as correções mais significativas durante o desenvolvimento, especialmente no swap cambial, onde a mecânica de duas pernas com indexadores distintos não se encaixa no motor de P&L linear genérico dos NDFs e futuros.

### Estrutura
- **4 cenários**: 2 Intermediários, 1 Avançado, 1 Super Desafio
- **Árvore de decisão** em 4 etapas por cenário
- **Memória de cálculo** passo a passo
- **ResultPanel customizado** para swap cambial (3 painéis separados: dívida, swap isolado, combinado)

### Nomenclatura adotada
- "Receber taxa fixa" / "Pagar taxa fixa" (para CDI × Pré)
- "Pagar CDI" / "Receber variação cambial + cupom cambial" (para swap cambial)
- "CDI médio" como referência na resolução dos swaps CDI × Pré

---

## 2. Cenário 1 — Swap CDI × Pré: Empresa com Dívida Flutuante (Intermediário)

### Contexto

Infralog S.A., empresa de logística com receitas previsíveis. Empréstimo de **R$ 200M** a **CDI + 2,00%** (custo atual 13,75% a.a.), vencimento em 2 anos. Diretoria quer custo fixo. Banco oferece swap CDI × Pré a **12,50% a.a.**

### displayFields

| Campo | Valor |
|-------|-------|
| CDI atual | 11,75% a.a. |
| Spread | + 2,00% a.a. |
| Custo atual | 13,75% a.a. |
| Taxa swap | 12,50% a.a. |
| Nocional | R$ 200M |
| Prazo | 2 anos |

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Hedge — transformar custo flutuante em fixo
- ❌ Especulação — diretoria quer previsibilidade
- ❌ Arbitragem — motivação operacional

**Etapa 2 — Estratégia**
- ✅ Pagar taxa fixa (12,50%) e receber CDI — o CDI recebido cancela o CDI pago no empréstimo
- ❌ Receber taxa fixa e pagar CDI — dobraria a exposição ao CDI

Feedback com memória de cálculo: (1) Empresa paga CDI + 2% no empréstimo. (2) Swap: recebe CDI, paga 12,50%. (3) CDI cancela. (4) Custo líquido = 12,50% + 2,00% = **14,50% a.a. fixo**.

**Etapa 3 — Custo final fixo**
- ✅ 14,50% a.a. — taxa fixa (12,50%) + spread do empréstimo (2,00%)
- ❌ 12,50% — esquece o spread de crédito
- ❌ 13,75% — custo atual flutuante, não o custo fixo pós-swap

Feedback destaca: "O swap não elimina o spread de crédito! O CDI se cancela e sobra 12,50% + 2,00%."

**Etapa 4 — Resolução**

| Cenário | CDI médio | Custo sem swap | Custo com swap | Resultado |
|---------|-----------|----------------|----------------|-----------|
| A: CDI subiu para 14,25% | 16,25% | 14,50% | Economia de 1,75% a.a. × R$ 200M |
| B: CDI caiu para 8,50% | 10,50% | 14,50% | Custo de oportunidade de 4,00% a.a. |
| C: CDI estável 11,50% | 13,50% | 14,50% | Swap custou ~1,00% a mais |

O ResultPanel usa o motor genérico com labels "pagou taxa fixa" e "CDI médio".

---

## 3. Cenário 2 — Swap Cambial: Dívida em Dólar (Intermediário)

### Contexto

Siderúrgica Nacional S.A. emitiu bond de **USD 100M** a **5,50% a.a. em dólar**, 3 anos. Receita 100% em reais. Dólar spot **R$ 5,20**, cupom cambial **4,50%**, CDI **11,75%**. A empresa contrata swap cambial: paga CDI e recebe variação cambial + cupom cambial. Nocional: **R$ 520M** (USD 100M × R$ 5,20).

### displayFields

| Campo | Valor |
|-------|-------|
| Dívida | USD 100M |
| Cupom USD | 5,50% a.a. |
| Spot inicial | R$ 5,20 |
| CDI | 11,75% a.a. |
| Cupom cambial | 4,50% a.a. |
| Nocional swap | R$ 520M |

### Decisões de design e correções implementadas

Este cenário sofreu **3 rodadas de correção** significativas:

**Problema 1 — Motor genérico incompatível:** O motor original calculava `(fixingRate − forwardRate) × notional` com `fixingRate = 6.80` (dólar) e `forwardRate = 11.75` (CDI), gerando P&L de R$ 2,6 bilhões. Corrigido: `forwardRate90d` alterado de 11.75 (CDI) para 5.20 (spot em R$/USD), com `notional_usd` de 100.000.000 (USD).

**Problema 2 — Perna passiva (CDI) não calculada:** O painel ② mostrava apenas a perna cambial, sem calcular o CDI acumulado. Corrigido: ambas as pernas calculadas explicitamente com juros compostos.

**Problema 3 — FixingDot com valor errado:** O diagrama de payoff usava o P&L do motor genérico. Corrigido via `overrideFixingPnL` que passa o `resultadoSwap` correto ao FixingDot.

### Motor de cálculo (customizado para swap cambial)

```
Perna ativa (recebe) = USD_nocional × dólar_final × (1 + cupomCambial)^prazo − nocional_BRL
Perna passiva (paga) = nocional_BRL × [(1 + CDI)^prazo − 1]
Resultado do swap = Perna ativa − Perna passiva
```

Onde:
- `nocional_BRL = USD_nocional × spot_inicial = 100M × 5,20 = R$ 520M`
- `prazo = tenor / 252 = 756 / 252 = 3,0 anos`
- `cupomCambial = 4,50% a.a.`
- `CDI = 11,75% a.a.`

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Hedge — transformar dívida em dólar em dívida em CDI
- ❌ Especulação — diretoria espera gestão de risco
- ❌ Arbitragem — não há distorção de preço

**Etapa 2 — Estratégia**
- ✅ Pagar CDI no swap e receber variação cambial + cupom cambial (4,50%)
- ❌ Receber CDI e pagar variação cambial — dobraria exposição cambial

Feedback com memória de cálculo: (1) Dívida: paga var. cambial + 5,50%. (2) Swap: recebe var. cambial + 4,50%, paga CDI. (3) Perna cambial cancela parcialmente. (4) Diferencial residual = 5,50% − 4,50% = 1,00% a.a. em USD. (5) Custo final ≈ CDI + 1,00% residual.

**Etapa 3 — Nocional**
- ✅ R$ 520M (USD 100M × spot R$ 5,20)
- ❌ R$ 100M (confunde dólar com real)
- ❌ R$ 530M (usa forward ao invés de spot)

**Etapa 4 — Resolução**

### ResultPanel customizado com 3 painéis

**Painel ① — Dívida sem swap (exposição cambial aberta):**
- Variação cambial, custo da dívida em reais no vencimento, impacto vs contratação

**Painel ② — Resultado do swap cambial (isolado) — ambas as pernas:**
- Perna ativa (recebe): variação cambial + cupom cambial → valor final × (1+4,5%)^3 − nocional BRL
- Perna passiva (paga): CDI acumulado → nocional BRL × [(1+11,75%)^3 − 1]
- Resultado líquido = Perna ativa − Perna passiva

**Painel ③ — Resultado combinado (dívida + swap = hedge):**
- Custo sem swap − Resultado do swap = Custo efetivo com hedge
- Custo original (na contratação) vs custo efetivo → diferença = custo do CDI líquido do cupom cambial

| Cenário | Dólar final | Var. cambial | Resultado swap | Conclusão |
|---------|-------------|--------------|----------------|-----------|
| A: R$ 6,80 (+30,8%) | +R$ 160M custo extra | Perna cambial alta, CDI alto → resultado depende dos dois | Hedge neutralizou variação cambial |
| B: R$ 4,30 (−17,3%) | −R$ 90M economia | Perna cambial baixa, empresa "devolveu" economia | Custo de oportunidade do hedge |
| C: R$ 5,35 (+2,9%) | +R$ 15M marginal | Impacto pequeno | Custo efetivo ≈ CDI líquido de cupom cambial |

---

## 4. Cenário 3 — Swap Direcional: Fundo Multimercado (Avançado)

### Contexto

Gestor de fundo multimercado (PL R$ 800M) aposta em corte agressivo da Selic. CDI atual **11,75%**, swap CDI × Pré a **12,00%**. Stop loss **R$ 10M**. Swap bilateral com banco (sem margem na B3).

### displayFields

| Campo | Valor |
|-------|-------|
| CDI atual | 11,75% a.a. |
| Taxa swap | 12,00% a.a. |
| PL fundo | R$ 800M |
| Stop loss | R$ 10M |
| Prazo | 18 meses |

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Especulação — aposta direcional em queda de juros via swap
- ❌ Hedge — não há exposição a proteger
- ❌ Arbitragem — sem distorção swap vs DI futuro

Feedback: "O swap é alternativa ao DI futuro, com vantagem de não exigir margem na B3 (bilateral com banco)."

**Etapa 2 — Estratégia**
- ✅ Receber taxa fixa (12,00%) e pagar CDI — lucra se CDI < 12,00%
- ❌ Pagar taxa fixa e receber CDI — lucra se CDI > 12,00% (oposto)

Feedback: "Se CDI médio = 9,00%: ganho = 12,00% − 9,00% = 3,00% a.a. sobre nocional."

**Etapa 3 — Sizing pelo stop loss**
- ✅ R$ 222M — R$ 10M ÷ (3,00% × 1,5 anos) = R$ 222M
- ❌ R$ 100M — usa 45% do limite (conservador)
- ❌ R$ 500M — perda no stress = R$ 22,5M (estoura 2,25x)

Memória: Spread de stress = 15% − 12% = 3%. Perda = 3% × nocional × 1,5 anos. Nocional máx = R$ 10M ÷ 0,045 ≈ R$ 222M.

**Etapa 4 — Resolução**

| Cenário | CDI médio | Resultado por unidade | Total |
|---------|-----------|----------------------|-------|
| A: CDI 9,00% (tese acertou) | +3,00% a.a. × 1,5a | ≈ +R$ 10M |
| B: CDI 14,50% (tese errou) | −2,50% a.a. × 1,5a | ≈ −R$ 8,3M |
| C: CDI 11,80% (estável) | +0,20% a.a. × 1,5a | ≈ +R$ 667k |

---

## 5. Cenário 4 — Swap com Risco de Crédito / CVA (Super Desafio)

### Contexto

Banco Meridional recebe pedido de swap CDI × Pré de **R$ 300M** por 3 anos de empresa rating **BB**. Taxa limpa (sem risco): **12,00%**. PD = **8%** em 3 anos, LGD = **60%**, exposição positiva esperada média = **R$ 15M**.

### displayFields

| Campo | Valor |
|-------|-------|
| Taxa limpa | 12,00% a.a. |
| Nocional | R$ 300M |
| PD 3 anos | 8% |
| LGD | 60% |
| Rating | BB |
| Prazo | 3 anos |

### Árvore de decisão

**Etapa 1 — Motivação: por que não oferecer 12,00%?**
- ✅ Risco de crédito da contraparte — se a empresa der default quando o swap vale positivo para o banco, o banco perde
- ❌ "Lucrar mais" — é compensação de perda esperada, não lucro adicional
- ❌ Taxa defasada — 12,00% é o mercado atual para contrapartes sem risco

Feedback: "O CVA (Credit Valuation Adjustment) quantifica a perda esperada de crédito e a embute na taxa."

**Etapa 2 — Cálculo do CVA**
- ✅ CVA = PD × LGD × Exposição = 8% × 60% × R$ 15M = R$ 720.000 (≈ 8 bps a.a.)
- ❌ PD × Nocional = 8% × R$ 300M = R$ 24M (superestima: usa nocional, ignora recovery)
- ❌ LGD × Nocional = 60% × R$ 300M = R$ 180M (confunde LGD com perda total)

Memória de cálculo: (1) PD 3 anos = 8%. (2) LGD = 60%. (3) Exposição esperada = R$ 15M. (4) CVA = 0,08 × 0,60 × 15M = R$ 720k. (5) Anualizado: R$ 720k ÷ (R$ 300M × 3) ≈ 0,08% ≈ 8 bps.

**Etapa 3 — Taxa final**
- ✅ 12,08% a.a. — taxa limpa + CVA de 8 bps
- ❌ 13,00% — spread genérico de 100 bps (sem fundamento)
- ❌ 12,00% — ignora o risco de crédito

**Etapa 4 — Resolução**

| Cenário | Evento | Resultado |
|---------|--------|-----------|
| A: Default no mês 24, CDI subiu para 14% | Swap valia ~R$ 18M para o banco. Perda = R$ 18M × 60% = R$ 10,8M. CVA cobriu fração. |
| B: Sem default, CDI subiu para 14% | Swap positivo para o banco. CVA de 8bps foi "lucro" adicional. |
| C: Sem default, CDI caiu para 9% | Swap negativo para o banco. Risco de crédito irrelevante (banco devedor). |

Feedback do cenário C: "Quando o swap vale negativo para o banco, ele não perde nada com default da contraparte — o risco de crédito é unidirecional."

---

## 6. Motor de cálculo implementado

### 6.1. Swap CDI × Pré e Direcional (motor genérico)
```
Pagar fixo (buy_usd): P&L = (fixing − forward) × notional
  → fixing = CDI médio, forward = taxa fixa
Receber fixo (sell_usd): P&L = (forward − fixing) × notional
```

### 6.2. Swap Cambial (motor customizado)
```
Perna ativa = USD × dólar_final × (1 + cupomCambial)^prazo − nocional_BRL
Perna passiva = nocional_BRL × [(1 + CDI)^prazo − 1]
Resultado = Perna ativa − Perna passiva
```

### 6.3. ResultPanel

O ResultPanel detecta o tipo de swap via `instrument`:
- `isSwapCambial` (instrument inclui "USD"): 3 painéis customizados + `overrideFixingPnL`
- `isSwapCDI` (swap sem USD): motor genérico com labels "pagou taxa fixa" / "recebeu taxa fixa" e "CDI médio"

### 6.4. PayoffChart

O swap cambial usa `overrideFixingPnL={resultadoSwap}` para que o FixingDot mostre o valor correto do resultado (ambas as pernas), não o P&L simplificado do motor linear.

---

## 7. Lições aprendidas na implementação

1. **Motor genérico incompatível com swap cambial:** O motor `(fixing − forward) × notional` funciona para instrumentos lineares com um único indexador (NDF, DI, DOL, CDI×Pré). O swap cambial tem duas pernas com indexadores distintos (câmbio + cupom vs CDI), cada uma com capitalização composta própria. Solução: cálculo dedicado no ResultPanel com ambas as pernas.

2. **Unidades misturadas no marketData:** A versão original usava `forwardRate90d: 11.75` (CDI em %) e `fixingRate: 6.80` (dólar em R$/USD) no mesmo cenário, gerando P&L de R$ 2,6 bilhões. Corrigido: ambos em R$/USD para o motor linear, com cálculo completo das pernas no ResultPanel.

3. **Perna passiva omitida:** O painel ② do swap cambial inicialmente mostrava apenas a perna cambial ("CDI acumulado sobre R$ 520M — pago em reais ao longo do período") sem calcular o valor. Corrigido: ambas as pernas com fórmula explícita de juros compostos.

4. **FixingDot incorreto:** O diagrama de payoff mostrava o P&L do motor genérico (R$ 160M) ao invés do resultado correto do swap (que desconta o CDI). Corrigido via prop `overrideFixingPnL` que permite ao FixingDot exibir um valor calculado externamente.

5. **Separação dívida vs swap vs hedge:** A primeira versão mostrava apenas o resultado do swap isolado. Após feedback, implementados 3 painéis: ① dívida sem swap (para o aluno ver o risco cambial), ② swap isolado (ambas as pernas), ③ combinado (como o hedge neutraliza a variação cambial).

---

## 8. Resumo dos 4 cenários

| # | Título | Instrumento | Dificuldade | Conceito-chave |
|---|--------|-------------|-------------|----------------|
| 1 | CDI × Pré — Dívida Flutuante | Swap CDI × Pré | Intermediário | Cancelamento do CDI, custo fixo = taxa swap + spread crédito |
| 2 | Swap Cambial — Dívida em Dólar | Swap USD × CDI | Intermediário | Duas pernas com juros compostos, diferencial cupom/CDI |
| 3 | Swap Direcional — Fundo Multimercado | Swap CDI × Pré | Avançado | Receber fixo, sizing por stop loss, swap vs DI futuro |
| 4 | Swap com CVA — Risco de Crédito | Swap CDI × Pré | Super Desafio | CVA = PD × LGD × Exposição, precificação de crédito em swap bilateral |

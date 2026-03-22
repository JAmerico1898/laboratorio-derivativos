# Especificação — Módulo de Opções

## Derivativos Lab | COPPEAD/UFRJ — MBA

---

## 1. Visão geral

O módulo de Opções segue o mesmo framework dos módulos anteriores (NDF, Futuros, Swaps):

- **4 cenários** com dificuldade progressiva: Intermediário → Intermediário → Avançado → Super Desafio
- **Árvore de decisão** em 4–5 etapas por cenário (motivação → estratégia → contrato → resolução)
- **Memória de cálculo** passo a passo em todos os feedbacks
- **Diagrama de payoff** adaptado para opções (não-linear, com assimetria)
- **Navegação bidirecional** (avançar e recuar entre etapas)
- **Mercado brasileiro (B3)** com ênfase, e referências internacionais quando relevante

---

## 2. Considerações específicas de opções

### 2.1. Payoff não-linear

Diferente de NDF, futuros e swaps (payoff linear), opções têm payoff assimétrico. O diagrama de payoff precisa de lógica customizada:

- **Call comprada**: max(S − K, 0) − prêmio
- **Call vendida**: prêmio − max(S − K, 0)
- **Put comprada**: max(K − S, 0) − prêmio
- **Put vendida**: prêmio − max(K − S, 0)

O gráfico deve mostrar claramente: o ponto de breakeven, a perda máxima (limitada ao prêmio para o comprador), e o lucro potencial.

### 2.2. Nomenclatura

- Usar "comprar opção" e "vender (lançar) opção"
- Tipo: "call" e "put" (termos já consagrados no mercado brasileiro)
- Strike: "preço de exercício" ou "strike"
- Prêmio: "prêmio da opção"
- Exercício: "exercício europeu" (padrão B3 para opções sobre ações) vs "exercício americano"

### 2.3. Dados de mercado

Para cada cenário, os displayFields devem incluir conforme aplicável:
- Ativo-objeto e preço spot
- Strike(s)
- Prêmio da opção
- Volatilidade implícita (quando relevante)
- Prazo até o vencimento
- Taxa livre de risco (CDI)

---

## 3. Cenário 1 — Hedge com Put Protetiva (Intermediário)

### Contexto

Você é gestor(a) de um fundo de ações com **R$ 300 milhões** em ações da **Petrobras (PETR4)**. O preço atual é **R$ 38,00** por ação (~7,9 milhões de ações). Os resultados trimestrais serão divulgados em **45 dias** e há risco de queda expressiva. A diretoria quer proteger a carteira contra quedas superiores a 10%, sem abrir mão do upside caso os resultados surpreendam positivamente.

Uma put de PETR4 com strike **R$ 34,50** (≈ −9,2% abaixo do spot) e vencimento em 50 dias está sendo negociada a **R$ 1,20** por ação.

### displayFields

| Campo | Valor |
|-------|-------|
| PETR4 spot | R$ 38,00 |
| Strike put | R$ 34,50 |
| Prêmio put | R$ 1,20/ação |
| Ações | 7,9M |
| Custo total | R$ 9,5M |
| Prazo | 50 dias |

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Hedge — proteger contra queda sem abrir mão da alta (put protetiva)
- ❌ Especulação — apostar na queda da ação
- ❌ Arbitragem

Feedback correto: "A put protetiva funciona como um seguro: você paga o prêmio (R$ 1,20/ação) e em troca garante um preço mínimo de venda. Se a ação subir, você perde apenas o prêmio. Diferente do futuro ou NDF, a opção preserva o upside."

**Etapa 2 — Estratégia: qual opção comprar?**
- ✅ Comprar put de PETR4 com strike R$ 34,50 — protege contra quedas abaixo de R$ 34,50
- ❌ Vender call de PETR4 — gera receita mas elimina o upside acima do strike
- ❌ Comprar call de PETR4 — lucra com alta mas não protege contra queda

Feedback correto: "Memória de cálculo: (1) Comprar put com strike R$ 34,50 garante o direito de vender a R$ 34,50. (2) Custo = R$ 1,20 × 7,9M ações = R$ 9,48M (~3,2% do PL). (3) Perda máxima da carteira hedgeada = (R$ 38,00 − R$ 34,50 + R$ 1,20) = R$ 4,70/ação = 12,4% (queda até o strike + prêmio pago). (4) Se PETR4 cair abaixo de R$ 34,50, a put compensa R$ 1 por R$ 1. (5) Se PETR4 subir, o upside é ilimitado, menos o custo do prêmio."

**Etapa 3 — Dimensionamento: quantas puts?**
- ✅ 7.900 contratos (1 contrato = 1.000 ações na B3 → 7,9M ações ÷ 1.000 = 7.900)
- ❌ 300.000 contratos (confunde nocional em reais com número de ações)
- ❌ 3.950 contratos (hedge parcial de 50%)

Feedback correto com memória de cálculo detalhada, incluindo: lote padrão na B3, cálculo do custo total, e custo como % do PL.

**Etapa 4 — Resolução**

Cenários:
- **A: PETR4 caiu para R$ 28,00 (−26,3%)**: Put deep in-the-money. Exercício gera R$ 34,50 − R$ 28,00 = R$ 6,50/ação. Resultado líquido = R$ 6,50 − R$ 1,20 = R$ 5,30/ação de compensação. A carteira caiu R$ 10,00/ação mas recuperou R$ 5,30 via put.
- **B: PETR4 subiu para R$ 45,00 (+18,4%)**: Put vence sem valor (out-of-the-money). Perda = prêmio de R$ 1,20/ação. A carteira ganhou R$ 7,00/ação, líquido de R$ 5,80/ação.
- **C: PETR4 ficou em R$ 35,00 (−7,9%)**: Put ligeiramente in-the-money. Exercício: R$ 34,50 − R$ 35,00 = R$ 0 (não exerce, pois spot > strike). Perda = prêmio. A queda da carteira (R$ 3,00/ação) não é compensada.

---

## 4. Cenário 2 — Financiamento (Collar) — Exportador (Intermediário)

### Contexto

Você é tesoureiro(a) da **Celulose Brasil S.A.** O dólar spot está em **R$ 5,20** e a empresa tem recebíveis de **USD 30 milhões** em 90 dias. O custo da put protetiva (strike R$ 5,00) é **R$ 0,08/USD**, mas a diretoria considera caro. Para baratear o hedge, você propõe um **collar** (financiamento): comprar a put e vender uma call, usando o prêmio da call para financiar (total ou parcialmente) a put.

- Put comprada: strike R$ 5,00, prêmio R$ 0,08/USD
- Call vendida: strike R$ 5,45, prêmio R$ 0,06/USD
- Custo líquido do collar: R$ 0,08 − R$ 0,06 = R$ 0,02/USD

### displayFields

| Campo | Valor |
|-------|-------|
| Spot USD | R$ 5,20 |
| Recebíveis | USD 30M |
| Put strike | R$ 5,00 |
| Put prêmio | R$ 0,08/USD |
| Call strike | R$ 5,45 |
| Call prêmio | R$ 0,06/USD |
| Custo líquido | R$ 0,02/USD |

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Hedge — proteger piso de receita com custo reduzido (collar)
- ❌ Especulação
- ❌ Arbitragem

Feedback: "O collar cria um corredor: piso em R$ 5,00 (put) e teto em R$ 5,45 (call vendida). O custo é R$ 0,02/USD (vs R$ 0,08 da put isolada). A contrapartida: se o dólar ultrapassar R$ 5,45, o exportador não captura o ganho adicional."

**Etapa 2 — Estratégia: estrutura do collar**
- ✅ Comprar put R$ 5,00 + Vender call R$ 5,45 — piso + teto
- ❌ Comprar put R$ 5,00 isolada — protege mas custa R$ 0,08/USD
- ❌ Vender call R$ 5,45 isolada — gera receita mas não protege contra queda

Feedback correto com memória de cálculo: custo da put, receita da call, custo líquido, e o range do corredor.

**Etapa 3 — Custo total do collar**
- ✅ R$ 600.000 (USD 30M × R$ 0,02/USD)
- ❌ R$ 2.400.000 (esqueceu de subtrair o prêmio da call)
- ❌ R$ 0 (assumiu que os prêmios se cancelam — quase, mas não exatamente)

**Etapa 4 — Resolução**

Cenários:
- **A: Dólar caiu para R$ 4,60 (−11,5%)**: Put exercida. Receita garantida = R$ 5,00/USD. Call vence sem valor. Collar protegeu.
- **B: Dólar subiu para R$ 5,70 (+9,6%)**: Put vence sem valor. Call exercida — a empresa entrega dólares a R$ 5,45 ao invés de R$ 5,70. "Perdeu" R$ 0,25/USD de upside — teto do collar.
- **C: Dólar ficou em R$ 5,25 (+1,0%)**: Ambas vencem sem valor. Empresa vende dólares a R$ 5,25 no mercado, menos o custo de R$ 0,02/USD = receita efetiva R$ 5,23.

---

## 5. Cenário 3 — Especulação com Straddle (Avançado)

### Contexto

Você é trader de opções em um fundo multimercado. A **Vale (VALE3)** está em **R$ 62,00** e divulga resultados em **10 dias**. A volatilidade implícita (IV) está em **35% a.a.**, abaixo da média histórica pré-resultado de **50% a.a.**. Você acredita que o resultado vai gerar um **movimento forte** (para cima ou para baixo), mas não sabe a direção. O limite de risco é **R$ 3 milhões**.

Você monta um **straddle** (compra de call + compra de put, ambas ATM):
- Call ATM: strike R$ 62,00, prêmio R$ 2,50
- Put ATM: strike R$ 62,00, prêmio R$ 2,30
- Custo total do straddle: R$ 4,80/ação

### displayFields

| Campo | Valor |
|-------|-------|
| VALE3 spot | R$ 62,00 |
| Strike (ATM) | R$ 62,00 |
| Prêmio call | R$ 2,50 |
| Prêmio put | R$ 2,30 |
| Custo straddle | R$ 4,80/ação |
| IV atual | 35% a.a. |
| IV histórica | 50% a.a. |
| Stop loss | R$ 3M |

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Especulação em volatilidade — aposta que o ativo vai se mover mais do que o mercado precifica
- ❌ Hedge — não há posição a proteger
- ❌ Especulação direcional — o straddle é neutro em direção

Feedback: "O straddle lucra com o MOVIMENTO, não com a DIREÇÃO. Você está comprando volatilidade: a IV está em 35% mas o histórico pré-resultado é 50%. Se o resultado causar um movimento forte (para qualquer lado), o straddle lucra."

**Etapa 2 — Estratégia**
- ✅ Comprar straddle (call ATM + put ATM) — lucra com movimento grande em qualquer direção
- ❌ Vender straddle — lucra se o ativo ficar parado (oposta à sua tese)
- ❌ Comprar apenas call — aposta direcional na alta

Feedback com memória de cálculo: custo total, breakevens superior e inferior, perda máxima.

**Etapa 3 — Dimensionamento pelo stop loss**
- ✅ 625.000 ações (R$ 3M ÷ R$ 4,80/ação) → 625 contratos de 1.000 ações
- ❌ 1.000 contratos (ignora o stop loss)
- ❌ 300 contratos (sub-utiliza o limite)

Memória de cálculo: (1) Perda máxima = custo do straddle = R$ 4,80/ação. (2) Contratos = R$ 3.000.000 ÷ (R$ 4,80 × 1.000 ações) = 625 contratos. (3) Breakeven superior = R$ 62,00 + R$ 4,80 = R$ 66,80 (+7,7%). (4) Breakeven inferior = R$ 62,00 − R$ 4,80 = R$ 57,20 (−7,7%).

**Etapa 4 — Resolução**

Cenários:
- **A: VALE3 caiu para R$ 52,00 (−16,1%)**: Put profundamente ITM. Resultado = (R$ 62,00 − R$ 52,00) − R$ 4,80 = R$ 5,20/ação de lucro. Total: R$ 5,20 × 625.000 = R$ 3.250.000.
- **B: VALE3 subiu para R$ 72,00 (+16,1%)**: Call profundamente ITM. Resultado = (R$ 72,00 − R$ 62,00) − R$ 4,80 = R$ 5,20/ação de lucro. Total idem.
- **C: VALE3 ficou em R$ 63,00 (+1,6%)**: Ambas perto do strike. Call vale R$ 1,00, put vence sem valor. Resultado = R$ 1,00 − R$ 4,80 = −R$ 3,80/ação de perda. O ativo não se moveu o suficiente.

---

## 6. Cenário 4 — Super Desafio: Skew de Volatilidade e Risk Reversal

### Contexto

Você é head de derivativos do **Banco Atlântico**. O dólar spot está em **R$ 5,20** e o mercado de opções de dólar apresenta um **skew de volatilidade** pronunciado:

- Put 25-delta (strike ~R$ 4,90): IV = 18%
- ATM (strike R$ 5,20): IV = 14%
- Call 25-delta (strike ~R$ 5,55): IV = 11%

O skew indica que o mercado precifica mais risco de queda (puts mais caras) do que de alta. Porém, sua análise sugere que o risco real é simétrico. Você quer montar um **risk reversal** para capturar o mispricing do skew: vender a put cara e comprar a call barata.

- Put vendida: strike R$ 4,90, prêmio R$ 0,12/USD (IV 18%)
- Call comprada: strike R$ 5,55, prêmio R$ 0,05/USD (IV 11%)
- Crédito líquido: R$ 0,12 − R$ 0,05 = R$ 0,07/USD
- Nocional: USD 50 milhões

### displayFields

| Campo | Valor |
|-------|-------|
| Spot USD | R$ 5,20 |
| Put strike | R$ 4,90 (IV 18%) |
| Call strike | R$ 5,55 (IV 11%) |
| Prêmio put (recebe) | R$ 0,12/USD |
| Prêmio call (paga) | R$ 0,05/USD |
| Crédito líquido | R$ 0,07/USD |
| Nocional | USD 50M |

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Arbitragem de volatilidade — o skew está exagerado; vender vol cara (put) e comprar vol barata (call)
- ❌ Especulação direcional — o risk reversal tem componente direcional, mas a motivação principal é o mispricing do skew
- ❌ Hedge

Feedback: "O risk reversal explora a distorção do skew. Puts com IV de 18% estão 'caras' em relação às calls com IV de 11%. Ao vender a put cara e comprar a call barata, você embolsa o diferencial de volatilidade. Entretanto, a posição tem risco direcional: se o dólar cair abaixo de R$ 4,90, a put vendida gera prejuízo ilimitado."

**Etapa 2 — Estratégia**
- ✅ Vender put R$ 4,90 + Comprar call R$ 5,55 (risk reversal) — captura o skew com crédito líquido
- ❌ Comprar put R$ 4,90 + Vender call R$ 5,55 — paga o skew ao invés de receber
- ❌ Comprar straddle ATM — posição de volatilidade pura, não explora o skew

Feedback com memória de cálculo: prêmio recebido, prêmio pago, crédito líquido × nocional, e o perfil de risco (perda na queda do dólar abaixo de R$ 4,90).

**Etapa 3 — Análise de risco**
Pergunta: "Qual é a perda máxima se o dólar cair para R$ 4,00?"
- ✅ R$ 41,5M — perda na put vendida = (R$ 4,90 − R$ 4,00) × USD 50M − crédito R$ 0,07 × USD 50M = R$ 45M − R$ 3,5M = R$ 41,5M
- ❌ R$ 3,5M (só considera o crédito líquido como perda máxima — ignora a put vendida)
- ❌ R$ 45M (esquece de subtrair o crédito recebido)

Feedback: "A put vendida tem risco ilimitado (na prática, até o ativo ir a zero). Memória de cálculo: (1) Put vendida: obrigação de comprar USD a R$ 4,90. Se dólar = R$ 4,00, perda = (4,90 − 4,00) × 50M = R$ 45M. (2) Crédito recebido = R$ 0,07 × 50M = R$ 3,5M. (3) Perda líquida = R$ 45M − R$ 3,5M = R$ 41,5M. Esta é a razão pela qual o risk reversal exige margem e gestão de risco rigorosa."

**Etapa 4 — Resolução**

Cenários:
- **A: Dólar caiu para R$ 4,50 (−13,5%)**: Put exercida contra você. Perda = (R$ 4,90 − R$ 4,50) × 50M = R$ 20M, menos crédito R$ 3,5M = −R$ 16,5M. O skew se mostrou justificado — o mercado estava certo em precificar mais risco de queda.
- **B: Dólar subiu para R$ 5,80 (+11,5%)**: Call exercida a seu favor. Ganho = (R$ 5,80 − R$ 5,55) × 50M = R$ 12,5M, mais crédito R$ 3,5M = +R$ 16M. O skew estava exagerado e a call barata rendeu.
- **C: Dólar ficou em R$ 5,15 (−1,0%)**: Ambas vencem OTM. Resultado = crédito líquido de R$ 3,5M. O melhor cenário — embolsou o prêmio do skew sem que nenhuma opção fosse exercida.

---

## 7. Adaptações no motor de cálculo

### 7.1. Payoff não-linear

O `generatePayoffData` precisará de uma versão para opções:

```
generateOptionsPayoffData(strategy, strikes, premiums, notional)
```

Onde `strategy` pode ser: `long_put`, `long_call`, `collar`, `straddle`, `risk_reversal`.

### 7.2. ResultPanel para opções

Deve mostrar:
- **Valor intrínseco** de cada opção no vencimento
- **Prêmio pago/recebido**
- **Resultado líquido** (intrínseco − prêmio)
- **Resultado da carteira hedgeada** (quando aplicável — cenários 1 e 2)
- **Breakeven** destacado no gráfico

### 7.3. FixingDot

Deve mostrar o resultado correto do payoff da estratégia combinada (não o motor linear genérico).

---

## 8. Resumo dos 4 cenários

| # | Título | Instrumento | Dificuldade | Conceito-chave |
|---|--------|-------------|-------------|----------------|
| 1 | Put Protetiva — Fundo de Ações | Put PETR4 | Intermediário | Seguro contra queda, preservando upside |
| 2 | Collar (Financiamento) — Exportador | Put + Call USD | Intermediário | Redução de custo via venda de call |
| 3 | Straddle — Especulação de Volatilidade | Call + Put VALE3 | Avançado | Compra de vol, breakevens, sizing por stop loss |
| 4 | Risk Reversal — Skew de Volatilidade | Put vendida + Call comprada USD | Super Desafio | Arbitragem de skew, risco de put vendida, CVA |

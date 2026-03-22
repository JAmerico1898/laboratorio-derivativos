# Especificação Final — Módulo de Futuros

## Derivativos Lab | COPPEAD/UFRJ — MBA

**Versão:** Final (pós-implementação e revisão)

---

## 1. Visão geral

O módulo de Futuros é o segundo do aplicativo e introduz dois instrumentos centrais do mercado brasileiro: o **DI Futuro** (taxa de juros) e o **Dólar Futuro (DOL)** da B3. O módulo explora as particularidades do mercado de futuros — ajuste diário, PU, convenções de compra/venda de taxa — que não existem nos NDFs.

### Estrutura
- **4 cenários**: 2 Intermediários, 1 Avançado, 1 Super Desafio
- **Árvore de decisão** em 4–5 etapas por cenário
- **Memória de cálculo** passo a passo em todos os feedbacks
- **Payoff linear** com diagrama interativo e ponto de fixing animado

### Convenção de taxa (decisão pedagógica importante)

Após iteração com o professor, a convenção adotada é:

- **"Comprar taxa"** = ganhar com a alta dos juros / perder com a queda
- **"Vender taxa"** = ganhar com a queda dos juros / perder com a alta

Os termos "aplicar" e "tomar" foram **deliberadamente evitados** por serem contraintuitivos para alunos de MBA. A nota técnica sobre PU (comprar taxa = vender PU) é apresentada **subsidiariamente** em cada feedback, para que o aluno entenda a mecânica operacional da B3 sem que essa seja a porta de entrada conceitual.

### Motor de cálculo (DI)

O mapeamento interno entre a convenção de taxa e o motor de P&L:
- **Comprar taxa** (lucra na alta) → `buy_usd` no motor → P&L = (fixing − forward) × notional
- **Vender taxa** (lucra na queda) → `sell_usd` no motor → P&L = (forward − fixing) × notional

O ResultPanel detecta cenários de DI (`isDI`) e usa "comprou taxa" / "vendeu taxa" ao invés de "comprou" / "vendeu" genérico.

---

## 2. Cenário 1 — Hedge de Taxa de Juros: Fundo de Renda Fixa (Intermediário)

### Contexto

Gestor de fundo de renda fixa com **R$ 500M** em títulos prefixados (NTN-F e LTN), duration média de **3 anos**. CDI a **11,75%**, DI Jan/28 a **12,50%**. Copom se reúne em 2 semanas. Risco: se juros subirem, títulos perdem valor.

### displayFields

| Campo | Valor |
|-------|-------|
| CDI atual | 11,75% a.a. |
| DI Jan/28 | 12,50% a.a. |
| PL Fundo | R$ 500M |
| Duration | 3 anos |
| DU até Jan/28 | 630 d.u. |

### Árvore de decisão (5 etapas)

**Etapa 1 — Motivação**
- ✅ Hedge — proteger carteira prefixada contra alta de juros
- ❌ Especulação — há exposição real a proteger
- ❌ Arbitragem — não há distorção de preço

**Etapa 2 — Estratégia**
- ✅ Comprar taxa no DI futuro — lucra se juros subirem, compensando perda nos prefixados
- ❌ Vender taxa — dobraria a exposição (carteira já ganha com queda de juros)

Feedback inclui nota técnica: "Na B3, comprar taxa equivale a vender PU, pois taxa e PU se movem em direções opostas."

**Etapa 3 — Cálculo do PU (etapa adicional)**

Esta etapa foi adicionada para avaliar se o aluno sabe calcular o PU — conhecimento fundamental que era omitido na versão original.

Prompt: "PU = 100.000 ÷ (1 + taxa)^(DU/252). Taxa 12,50%, 630 DU. Qual é o PU?"
- ✅ PU ≈ 73.785 — cálculo composto correto: 100.000 ÷ (1,125)^(2,5) = 100.000 ÷ 1,3554
- ❌ PU = 100.000 — confunde valor de face com PU atual
- ❌ PU ≈ 87.500 — usa desconto linear (simples) ao invés de composto

Feedback correto: "O nocional real de cada contrato hoje é R$ 73.785 — não R$ 100.000! O valor de face (R$ 100k) só é atingido no vencimento."

**Etapa 4 — Número de contratos**

Prompt: "PU ~73.785, carteira R$ 500M com duration 3a, DI Jan/28 duration ~2,5a."
- ❌ 6.777 contratos — matching nocional pelo PU (correto no PU, mas ignora duration)
- ✅ 8.133 contratos — PU + ajuste por duration: (500M ÷ 73.785) × (3,0 ÷ 2,5)
- ❌ 6.000 contratos — valor de face com duration (acerta duration, erra o PU)

Memória de cálculo: (1) Contratos base = R$ 500M ÷ PU 73.785 ≈ 6.777. (2) Ajuste duration = 6.777 × (3,0/2,5) = 6.777 × 1,2 ≈ 8.133.

**Etapa 5 — Resolução**

| Cenário | DI Jan/28 | Resultado |
|---------|-----------|-----------|
| A: Copom surpreende, alta de 75bps | 13,50% | Comprou taxa → lucro. Compensa perda nos prefixados. |
| B: Surpresa dovish, corte | 11,50% | Comprou taxa → perda no futuro. Mas prefixados valorizaram. |
| C: Estável | 12,60% | Resultado marginal. |

---

## 3. Cenário 2 — Hedge com Dólar Futuro: Dívida Corporativa (Intermediário)

### Contexto

EnergiaVerde S.A. emitiu bond de **USD 50M**. Cupom semestral de **USD 2M** em 6 meses. Dólar spot **R$ 5,22**, DOL 6m na B3 **R$ 5,30**. Contrato DOL = USD 50.000.

### displayFields

| Campo | Valor |
|-------|-------|
| Spot | R$ 5,2200 |
| DOL 6m | R$ 5,3000 |
| Cupom USD | USD 2M |
| Prazo | 6 meses |
| Contrato DOL | USD 50k |

### Árvore de decisão (4 etapas)

**Etapa 1 — Motivação**
- ✅ Hedge — travar custo em reais do cupom
- ❌ Especulação — diretoria espera proteção
- ❌ Arbitragem — spread futuro-spot é custo de carregamento, não distorção

Feedback explica que o spread de R$ 0,08 (futuro − spot) reflete diferencial CDI vs cupom cambial.

**Etapa 2 — Estratégia**
- ✅ Comprar dólar futuro — passivo em USD, comprar futuro lucra na alta
- ❌ Vender dólar futuro — dobraria a exposição

Feedback destaca: "Diferente do NDF (liquidação única), o DOL tem ajuste diário — P&L é creditado/debitado todos os dias na conta de margem."

**Etapa 3 — Número de contratos**
- ✅ 40 contratos — USD 2M ÷ USD 50k = 40
- ❌ 20 contratos — hedge parcial 50%
- ❌ 100 contratos — over-hedge 2,5x, viola IFRS 9/CPC 48

Memória de cálculo: Sensibilidade = R$ 500/contrato por centavo. Para 40 contratos: R$ 20.000 por centavo de variação.

**Etapa 4 — Resolução**

| Cenário | Dólar | Resultado |
|---------|-------|-----------|
| A: Dólar R$ 5,65 | +R$ 0,35 | Ajustes acumulados +R$ 700k, compensou custo maior do cupom |
| B: Dólar R$ 4,95 | −R$ 0,35 | Ajustes acumulados −R$ 700k, mas cupom ficou mais barato |
| C: Dólar R$ 5,28 | −R$ 0,02 | Marginal |

---

## 4. Cenário 3 — Especulação em Juros: Prop Trading (Avançado)

### Contexto

Trader de mesa proprietária aposta em corte da Selic. DI Jan/27 a **12,00%**, projeção **9,50%**. PU atual **78.925**. Stop loss **R$ 5 milhões**. DV01 por contrato **R$ 180**.

### displayFields

| Campo | Valor |
|-------|-------|
| DI Jan/27 | 12,00% a.a. |
| Projeção | 9,50% a.a. |
| PU atual | 78.925 |
| DV01/contrato | R$ 180 |
| Stop loss | R$ 5M |

### Decisão de design: sizing fundamentado em limite de risco

O cenário original usava um número arbitrário de contratos sem justificativa. Foi corrigido para fundamentar o sizing no **stop loss** e no **DV01**, usando cenário de stress:

**Etapa 1 — Motivação**
- ✅ Especulação — mesa proprietária, sem carteira a proteger
- ❌ Hedge / ❌ Arbitragem

**Etapa 2 — Estratégia**
- ✅ Vender taxa no DI futuro — lucra se juros caírem
- ❌ Comprar taxa — oposto da convicção

**Etapa 3 — Dimensionamento pelo stop loss**

Prompt: "Stop loss R$ 5M. DV01 R$ 180/contrato. Stress de +150bps. Quantos contratos?"
- ❌ 1.000 contratos — perda = R$ 180 × 150 × 1.000 = R$ 27M (estoura 5,4x o stop!)
- ✅ 185 contratos — R$ 5M ÷ (R$ 180 × 150) = 185. Ganho potencial (−250bps): R$ 8,3M. Risco/retorno: 1,7:1.
- ❌ 500 contratos — perda = R$ 13,5M (estoura 2,7x)

**Etapa 4 — Resolução**

| Cenário | DI Jan/27 | Resultado |
|---------|-----------|-----------|
| A: Caiu para 9,80% (tese acertou) | Lucro via ajustes diários |
| B: Subiu para 13,50% (tese errou) | Perda, mas dentro do stop |
| C: Estável 11,80% | Ganho modesto |

---

## 5. Cenário 4 — Calendar Spread e Basis Risk (Super Desafio)

### Contexto

Estrategista sênior no Asset Management Carioca. Spread entre **DI Jan/28 (12,80%)** e **DI Jan/27 (12,00%)** = **80bps** (Jan/28 − Jan/27). Historicamente, quando Copom inicia corte, o vértice longo cai mais em magnitude que o curto (prêmio de incerteza comprime), e o spread fecha para **30-40bps**.

**Nota sobre a narrativa (correção feita durante desenvolvimento):** A versão original dizia "o vértice curto cai mais rápido", o que era ambíguo entre velocidade temporal e magnitude. A versão final esclarece: "o vértice longo acaba caindo mais em magnitude" e inclui exemplo numérico: Jan/27 cai 200bps → 10,00%, Jan/28 cai 250bps → 10,30%, spread: 80 → 30bps.

### displayFields

| Campo | Valor |
|-------|-------|
| DI Jan/27 | 12,00% a.a. |
| DI Jan/28 | 12,80% a.a. |
| Spread | 80 bps |
| Spread hist. | 30-40 bps |
| Contratos | 5.000 |

### Árvore de decisão (4 etapas)

**Etapa 1 — Motivação**
- ✅ Arbitragem relativa — spread fora do padrão histórico, aposta na convergência
- ❌ Especulação direcional — o calendar spread é neutro em nível de juros
- ❌ Hedge — não há carteira a proteger

**Etapa 2 — Estratégia (flattener)**
- ✅ Vender taxa no Jan/27 + Comprar taxa no Jan/28 — flattener
- ❌ Comprar taxa no Jan/27 + Vender taxa no Jan/28 — steepener (oposto)
- ❌ Apenas vender taxa no Jan/27 — posição direcional, sem neutralização

Feedback: "O flattener aposta que o spread (Jan/28 − Jan/27) vai comprimir. Vende taxa no curto (ganha se cair) e compra taxa no longo (ganha se subir, ou perder menos). Se ambos se moverem na mesma magnitude, as pernas se compensam."

**Etapa 3 — Calibração DV01-neutral**

Prompt: "DV01 Jan/27 = R$ 180/contrato, Jan/28 = R$ 240/contrato. 5.000 no Jan/27. Quantos no Jan/28?"
- ✅ 3.750 — DV01-neutral: 5.000 × 180 = 900k = 3.750 × 240
- ❌ 5.000 cada — matching nocional cria viés (DV01 longo > curto em R$ 300k/bp)
- ❌ 3.000 + 5.000 — inverte a proporção, posição fortemente direcional

Memória de cálculo com verificação: "Um choque paralelo de +1bp gera +R$ 900k numa perna e −R$ 900k na outra, cancelando o risco direcional."

**Etapa 4 — Resolução**

| Cenário | Curva | Spread | Resultado |
|---------|-------|--------|-----------|
| A: Spread comprimiu (Jan/27=10%, Jan/28=10,30%) | 30 bps | Tese acertou — lucro |
| B: Spread abriu (Jan/27=13%, Jan/28=14,50%) | 150 bps | Tese errou — perda |
| C: Spread estável (Jan/27=11,25%, Jan/28=12%) | 75 bps | Quase neutro |

---

## 6. Motor de cálculo implementado

### 6.1. P&L genérico (DI e DOL)
```
Comprar taxa (buy_usd): P&L = (fixing − forward) × notional
Vender taxa (sell_usd): P&L = (forward − fixing) × notional
```

### 6.2. PU do DI
```
PU = 100.000 ÷ (1 + taxa)^(DU/252)
```

### 6.3. Número de contratos (hedge por duration)
```
Contratos = (Nocional_carteira ÷ PU) × (Duration_carteira ÷ Duration_futuro)
```

### 6.4. Dimensionamento por stop loss
```
Contratos_max = Stop_loss ÷ (DV01_contrato × stress_bps)
```

### 6.5. Calendar spread DV01-neutral
```
Contratos_longo = Contratos_curto × (DV01_curto ÷ DV01_longo)
```

### 6.6. Diagrama de payoff
- Range dinâmico expandido para incluir fixingRate
- Tolerância do FixingDot proporcional ao range (range/50)
- Labels adaptados: "Taxa / Preço de Liquidação" no eixo X
- ResultPanel usa "comprou taxa" / "vendeu taxa" para cenários DI

---

## 7. Lições aprendidas na implementação

1. **Convenção de taxa**: "Aplicar" e "tomar" foram substituídos por "comprar taxa" e "vender taxa" — mais intuitivo para alunos de MBA. Nota sobre PU é subsidiária.

2. **Mapeamento buy/sell no motor**: Inicialmente, "tomar taxa" (comprar taxa) estava mapeado para `sell_usd` no motor, gerando P&L com sinal invertido. Corrigido para: comprar taxa = `buy_usd` (lucra quando fixing > forward).

3. **Cálculo do PU**: A versão original aproximava o nocional do contrato a R$ 100k (valor de face). Adicionada uma etapa de cálculo do PU (R$ 73.785), que alterou materialmente o número de contratos (de 6.000 para 8.133).

4. **Sizing por stop loss**: O cenário de especulação originalmente usava número arbitrário de contratos. Corrigido para derivar o tamanho a partir do stop loss e DV01, com cenário de stress.

5. **Narrativa do calendar spread**: "Vértice curto cai mais rápido" era ambíguo. Corrigido para explicar que o longo cai mais em magnitude (comprime o prêmio de incerteza), com exemplo numérico.

6. **Gráfico de payoff para DI**: O FixingDot tinha tolerância fixa de 0.02, insuficiente para taxas de juros (range 10-14%). Corrigido para tolerância proporcional ao range do gráfico.

---

## 8. Resumo dos 4 cenários

| # | Título | Instrumento | Dificuldade | Conceito-chave |
|---|--------|-------------|-------------|----------------|
| 1 | Hedge de Taxa de Juros — Fundo RF | Futuro de DI | Intermediário | PU, duration, comprar taxa para hedge, cálculo de contratos |
| 2 | Hedge com Dólar Futuro — Dívida | DOL B3 | Intermediário | Ajuste diário vs NDF, sizing por nocional, over-hedge e IFRS 9 |
| 3 | Especulação em Juros — Prop Trading | Futuro de DI | Avançado | Vender taxa, sizing por stop loss + DV01, risco/retorno |
| 4 | Calendar Spread e Basis Risk | DI Spread | Super Desafio | Flattener, DV01-neutral, convergência de spread, valor relativo |

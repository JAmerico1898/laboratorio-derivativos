# Especificação — Módulo de Derivativos Embutidos

## Derivativos Lab | COPPEAD/UFRJ — MBA

**Versão:** Inicial (para revisão)

---

## 1. Visão geral

O módulo de Derivativos Embutidos encerra o aplicativo com **8 cenários** — o dobro dos módulos anteriores — cobrindo cada uma das modalidades praticadas no Brasil. Derivativos embutidos são componentes de derivativo inseridos em contratos hospedeiros (títulos de dívida, contratos de empréstimo, produtos estruturados) que modificam os fluxos de caixa de forma contingente.

O desafio pedagógico é duplo: o aluno precisa (a) **identificar** o derivativo embutido dentro do contrato hospedeiro e (b) **avaliar** seu impacto econômico e contábil.

### Estrutura
- **8 cenários**: 3 Intermediários, 3 Avançados, 2 Super Desafios
- **Foco contábil**: cada cenário aborda a exigência de separação (bifurcação) do derivativo embutido conforme CPC 48/IFRS 9
- **Mercado brasileiro** com instrumentos reais praticados

### Referência normativa
- **CPC 48 / IFRS 9**: um derivativo embutido deve ser separado (bifurcado) do contrato hospedeiro quando: (a) o contrato hospedeiro não é mensurado a valor justo pelo resultado, (b) o derivativo embutido, se fosse separado, atenderia à definição de derivativo, e (c) as características econômicas do derivativo não estão intimamente relacionadas às do contrato hospedeiro.

---

## 2. Contextualização: o que são derivativos embutidos?

### 2.1. Conceito fundamental

Um derivativo embutido é uma cláusula contratual que faz com que parte dos fluxos de caixa de um instrumento financeiro varie de forma semelhante a um derivativo autônomo. O contrato que contém o derivativo embutido é chamado de **contrato hospedeiro**.

Analogia para o aluno: imagine uma debênture (contrato hospedeiro) que paga CDI + 2%, mas com uma cláusula que diz "se o dólar ultrapassar R$ 6,00, o cupom sobe para CDI + 4%". Essa cláusula é um derivativo embutido (uma call de dólar digital). A debênture e a call estão "embutidas" no mesmo contrato.

### 2.2. Critério de bifurcação (CPC 48/IFRS 9)

O derivativo embutido deve ser **separado** do contrato hospedeiro e contabilizado como derivativo autônomo quando:

1. O contrato hospedeiro **não** é mensurado a valor justo pelo resultado (VJPR)
2. O derivativo embutido, se separado, **atenderia** à definição de derivativo
3. As características do derivativo **não estão intimamente relacionadas** ao hospedeiro

Se o contrato hospedeiro for mensurado a VJPR, não há necessidade de bifurcação (o valor justo já captura o derivativo).

---

## 3. Cenário 1 — COE de Principal Garantido (Intermediário)

### Contexto

Você é assessor de investimentos e um cliente pessoa física com **R$ 500 mil** em renda fixa quer diversificar. O banco oferece um **COE (Certificado de Operações Estruturadas)** de principal garantido com exposição ao **S&P 500**:

- **Prazo**: 2 anos
- **Principal garantido**: no vencimento, o investidor recebe no mínimo R$ 500 mil (valor investido)
- **Participação**: 70% da alta do S&P 500 no período
- **Sem participação na queda**: se o S&P cair, recebe apenas o principal

O COE embute: (a) um **título de renda fixa zero-cupom** (hospedeiro) que garante o principal e (b) uma **call sobre o S&P 500** (derivativo embutido) que gera a participação na alta.

### displayFields

| Campo | Valor |
|-------|-------|
| Investimento | R$ 500 mil |
| Prazo | 2 anos |
| Principal garantido | 100% |
| Participação na alta | 70% do S&P 500 |
| S&P 500 atual | 5.200 pontos |
| CDI | 11,75% a.a. |

### Árvore de decisão

**Etapa 1 — Identificação do derivativo embutido**
- ✅ Call sobre o S&P 500 — o investidor compra implicitamente uma opção de compra sobre o índice americano
- ❌ Put sobre o S&P 500 — a proteção do principal não é uma put comprada pelo investidor, é financiada pelo desconto do título
- ❌ Swap de taxa de juros — não há troca de indexadores

Feedback: "O COE de principal garantido é composto por duas peças: (1) Um zero-cupom que, descontado ao CDI por 2 anos, garante os R$ 500 mil no vencimento. Memória de cálculo: valor do zero-cupom hoje = R$ 500.000 ÷ (1,1175)² = R$ 500.000 ÷ 1,2488 = R$ 400.480. (2) A diferença R$ 500.000 − R$ 400.480 = R$ 99.520 é usada para comprar a call sobre o S&P 500 com participação de 70%. O banco estrutura a call com o 'troco' do desconto."

**Etapa 2 — Análise de custo de oportunidade**

Pergunta: "Se o cliente investisse os R$ 500 mil no CDI por 2 anos, quanto teria? Compare com o COE."
- ✅ CDI renderia R$ 124.400 (R$ 500k × [(1,1175)² − 1]). No COE, o cliente abre mão dessa renda fixa em troca da call. O custo de oportunidade é o CDI não recebido.
- ❌ Sem custo — o principal é garantido
- ❌ O custo é R$ 500 mil (o valor investido)

Feedback: "Memória de cálculo: (1) CDI 2 anos = R$ 500.000 × (1,1175² − 1) = R$ 500.000 × 0,2488 = R$ 124.400. (2) No COE, se o S&P ficar flat ou cair, o cliente recebe apenas R$ 500.000 — perdendo R$ 124.400 de custo de oportunidade. (3) Para o COE valer a pena, o S&P precisa subir o suficiente para que 70% da alta supere R$ 124.400. Breakeven: 70% × alta × R$ 500k = R$ 124.400 → alta mínima = 35,5%."

**Etapa 3 — Bifurcação contábil (CPC 48)**

Pergunta: "O COE deve ter o derivativo embutido separado na contabilidade?"
- ✅ Não necessariamente — se o COE for classificado como VJPR (valor justo pelo resultado), a bifurcação não é exigida, pois o valor justo total já captura o derivativo
- ❌ Sim, sempre — todo derivativo embutido deve ser separado
- ❌ Não — o COE é um instrumento único e indivisível

Feedback: "Segundo o CPC 48/IFRS 9, a bifurcação só é exigida quando o hospedeiro NÃO é mensurado a VJPR. Se a entidade classifica o COE inteiro a VJPR (o que é comum para produtos estruturados), o valor justo do instrumento combinado já reflete o derivativo. Se classificado a custo amortizado, seria necessário separar a call e marcá-la a valor justo."

**Etapa 4 — Resolução**

| Cenário | S&P 500 | Resultado COE | CDI alternativo | Diferença |
|---------|---------|---------------|-----------------|-----------|
| A: S&P subiu 40% | 7.280 | R$ 500k + 70%×40%×500k = R$ 640.000 | R$ 624.400 | +R$ 15.600 (COE venceu) |
| B: S&P caiu 20% | 4.160 | R$ 500.000 (principal garantido) | R$ 624.400 | −R$ 124.400 (custo oportunidade) |
| C: S&P subiu 15% | 5.980 | R$ 500k + 70%×15%×500k = R$ 552.500 | R$ 624.400 | −R$ 71.900 (COE não compensou) |

---

## 4. Cenário 2 — Opção de Pré-pagamento em Empréstimo (Intermediário)

### Contexto

A **Logística Express Ltda.** tomou um empréstimo de **R$ 50 milhões** a **CDI + 3,00% a.a.** por **5 anos** com o Banco Nacional. O contrato prevê cláusula de **pré-pagamento**: a empresa pode liquidar antecipadamente mediante pagamento de **multa de 2% sobre o saldo devedor**. A Selic caiu de 11,75% para 8,50% a.a. e a empresa recebe oferta de um novo empréstimo a **CDI + 2,00%**.

A cláusula de pré-pagamento é um **derivativo embutido**: uma **opção de compra (call)** que a empresa detém sobre sua própria dívida.

### displayFields

| Campo | Valor |
|-------|-------|
| Empréstimo | R$ 50M |
| Taxa original | CDI + 3,00% |
| Prazo restante | 3 anos |
| Multa pré-pag. | 2% do saldo |
| Nova oferta | CDI + 2,00% |
| CDI atual | 8,50% a.a. |

### Árvore de decisão

**Etapa 1 — Identificação do derivativo embutido**
- ✅ Opção de compra (call) sobre a dívida — a empresa tem o direito (não a obrigação) de "recomprar" sua dívida antes do vencimento
- ❌ Swap de taxa de juros — não há troca de indexadores
- ❌ Put sobre a taxa de juros — a empresa não está vendendo a dívida ao banco

Feedback: "A cláusula de pré-pagamento é economicamente equivalente a uma call: a empresa pode 'chamar' (call) a dívida pagando o saldo + multa. Quando os juros caem, essa opção ganha valor — assim como uma call sobre um bond sobe quando os juros caem."

**Etapa 2 — Análise econômica: vale a pena exercer?**
- ✅ Sim — economia líquida de R$ 500 mil/ano por 3 anos, menos a multa de R$ 1M. Ganho líquido ≈ R$ 500 mil
- ❌ Não — a multa de 2% é muito cara
- ❌ Indiferente — CDI + 3% e CDI + 2% são parecidos

Memória de cálculo: (1) Custo atual = CDI + 3,00% sobre R$ 50M. (2) Custo novo = CDI + 2,00%. (3) Economia anual = 1,00% × R$ 50M = R$ 500.000/ano. (4) Economia em 3 anos (simplificado) = R$ 1.500.000. (5) Multa = 2% × R$ 50M = R$ 1.000.000. (6) Ganho líquido = R$ 1.500.000 − R$ 1.000.000 = R$ 500.000. (7) Breakeven da multa: R$ 1M ÷ R$ 500k/ano = 2 anos. Como faltam 3 anos, vale a pena.

**Etapa 3 — Bifurcação contábil**
- ✅ Não separa — a opção de pré-pagamento está intimamente relacionada ao contrato hospedeiro (empréstimo), pois a variável subjacente é a própria taxa de juros do hospedeiro
- ❌ Separa — é um derivativo independente
- ❌ Depende do valor da multa

Feedback: "Segundo CPC 48, opções de pré-pagamento cujo preço de exercício é aproximadamente o custo amortizado do hospedeiro na data de exercício geralmente estão intimamente relacionadas ao hospedeiro. A multa de 2% é um ajuste pequeno — não há bifurcação."

**Etapa 4 — Resolução**

Cenários: (A) empresa exerce e economiza; (B) juros voltam a subir e a opção ficou fora do dinheiro; (C) juros caem mais ainda — a economia seria ainda maior.

---

## 5. Cenário 3 — Callable Bond (Intermediário)

### Contexto

Você é gestor(a) de renda fixa e avalia a compra de uma **debênture callable** emitida pela **Telecom Brasil S.A.**:
- **Cupom**: CDI + 2,50% a.a.
- **Prazo**: 5 anos
- **Cláusula call**: a emissora pode resgatar antecipadamente a partir do ano 3, ao par (100%)
- **Debênture plain vanilla comparável**: CDI + 2,00% a.a. (sem cláusula call)

O spread adicional de 50 bps (2,50% vs 2,00%) é o **prêmio** que o investidor recebe por vender implicitamente a call à emissora. O derivativo embutido é uma **call vendida** pelo investidor ao emissor.

### displayFields

| Campo | Valor |
|-------|-------|
| Debênture | Telecom Brasil (callable) |
| Cupom | CDI + 2,50% |
| Plain vanilla | CDI + 2,00% |
| Prêmio implícito | 50 bps a.a. |
| Call a partir de | Ano 3 |
| Prazo | 5 anos |

### Árvore de decisão

**Etapa 1 — Identificação**
- ✅ Call vendida pelo investidor ao emissor — a emissora pode "chamar" o bond, e o investidor recebe 50 bps a mais como compensação
- ❌ Call comprada pelo investidor
- ❌ Put comprada pelo investidor

Feedback: "Ao comprar o callable bond, você implicitamente VENDE uma call ao emissor. O prêmio dessa call (50 bps/ano) é embutido no cupom mais alto. Se os juros caírem, a emissora provavelmente exercerá a call (refinancia mais barato) e você terá que reinvestir em taxas menores — risco de reinvestimento."

**Etapa 2 — Análise: quando a emissora exerce a call?**
- ✅ Quando os juros caem significativamente — a emissora refinancia a dívida a custo menor
- ❌ Quando os juros sobem — incorreto, a emissora preferiria manter a dívida barata
- ❌ A emissora sempre exerce no ano 3

Feedback com memória de cálculo: Se CDI cair de 11,75% para 8% no ano 3, a emissora refinancia de CDI+2,50% (=10,50%) para CDI+2,00% (=10,00%), economizando 0,50% a.a. por 2 anos sobre o nocional.

**Etapa 3 — Precificação do prêmio: os 50 bps compensam?**

Pergunta: "O prêmio de 50 bps a.a. por 5 anos (ou até o call) compensa o risco de resgate antecipado no ano 3?"
- ✅ Depende da expectativa de juros — se juros caírem forte, o call será exercido e o investidor perde 2 anos de cupom elevado. Os 50 bps acumulados em 3 anos (≈ 150 bps) podem não compensar o custo de reinvestimento.
- ❌ Sim, sempre — 50 bps é prêmio suficiente
- ❌ Não, nunca — callable bonds são sempre mau negócio para o investidor

**Etapa 4 — Resolução**

Cenários: (A) CDI cai para 8%, emissora exerce call no ano 3 — investidor reinveste a taxas menores; (B) CDI sobe para 14%, emissora não exerce — investidor recebe cupom gordo por 5 anos; (C) CDI estável, call não exercido.

---

## 6. Cenário 4 — Indexação Cambial Implícita (Avançado)

### Contexto

Você é controller da **Agroexport S.A.**, que vende commodities agrícolas e tem receita em dólar. A empresa contrata um **empréstimo rural de R$ 80 milhões** a taxa subsidiada de **8,50% a.a.** (abaixo do CDI de 11,75%). Porém, o contrato tem cláusula: "caso o dólar ultrapasse R$ 5,80, o spread do empréstimo aumenta em 1,50% a.a."

Essa cláusula embute uma **call digital de dólar vendida** pela empresa ao banco: se o dólar ultrapassar a barreira (R$ 5,80), o custo do empréstimo salta. O dólar spot está em R$ 5,20.

### displayFields

| Campo | Valor |
|-------|-------|
| Empréstimo | R$ 80M |
| Taxa base | 8,50% a.a. |
| Barreira dólar | R$ 5,80 |
| Aumento se trigger | +1,50% a.a. |
| Dólar spot | R$ 5,20 |
| CDI | 11,75% a.a. |
| Prazo | 3 anos |

### Árvore de decisão

**Etapa 1 — Identificação**
- ✅ Call digital de dólar — a cláusula se ativa se USD/BRL ultrapassar R$ 5,80, equivalente a uma opção digital (binária) de câmbio
- ❌ NDF de dólar — não há troca de nocional em moedas
- ❌ Swap cambial — não há troca de pernas

Feedback: "É uma call digital (ou binária) de dólar: o payoff é discreto (0 ou 1,50% a.a.), ativado quando o dólar cruza a barreira. A empresa 'vendeu' essa opção ao banco em troca da taxa subsidiada (8,50% vs CDI de 11,75%). A economia de 3,25% a.a. inclui o prêmio implícito da call digital."

**Etapa 2 — Impacto econômico se o trigger for acionado**
- ✅ Custo sobe de 8,50% para 10,00% (ainda abaixo do CDI) — impacto de R$ 1,2M/ano
- ❌ Custo sobe para CDI + 1,50%
- ❌ Sem impacto relevante

Memória de cálculo: (1) Custo base = 8,50% × R$ 80M = R$ 6,8M/ano. (2) Se trigger: custo = 10,00% × R$ 80M = R$ 8,0M/ano. (3) Impacto = R$ 1,2M/ano. (4) Mesmo com trigger, 10,00% < CDI 11,75%. A taxa ainda é subsidiada.

**Etapa 3 — Bifurcação contábil**
- ✅ Deve separar — a variável subjacente (câmbio) NÃO está intimamente relacionada ao hospedeiro (empréstimo em reais). A call digital deve ser bifurcada e marcada a valor justo.
- ❌ Não separa — faz parte do empréstimo
- ❌ Separa apenas se o trigger for acionado

Feedback: "Caso clássico de bifurcação exigida pelo CPC 48: o hospedeiro é um empréstimo em reais e o derivativo é indexado ao câmbio — variáveis econômicas não relacionadas. A call digital deve ser separada, mensurada a valor justo e reconhecida no resultado."

**Etapa 4 — Resolução**

Cenários: (A) dólar sobe para R$ 6,20 — trigger acionado, custo sobe; (B) dólar cai para R$ 4,80 — trigger não acionado, empresa desfruta da taxa subsidiada; (C) dólar oscila perto de R$ 5,80 — incerteza sobre ativação.

---

## 7. Cenário 5 — TRS Sintético via Estrutura de Crédito (Avançado)

### Contexto

O **Fundo Alavancagem FIM** quer exposição a um portfólio de debêntures de infraestrutura mas não pode comprá-las diretamente (limite de concentração). O banco estrutura um **COE referenciado ao retorno total do portfólio**:

- O fundo investe **R$ 100 milhões** no COE
- O COE paga o **retorno total do portfólio** (cupom + variação de preço) menos uma taxa de estruturação de **CDI + 0,80%**
- Economicamente, é um **TRS sintético** embutido em um produto estruturado

### displayFields

| Campo | Valor |
|-------|-------|
| Investimento | R$ 100M |
| Retorno referência | Portfólio debêntures infra |
| Cupom referência | CDI + 2,20% |
| Taxa estruturação | CDI + 0,80% |
| Spread líquido | 1,40% a.a. |
| Prazo | 3 anos |

### Árvore de decisão

**Etapa 1 — Identificação do derivativo embutido**
- ✅ TRS (Total Return Swap) — o COE replica o retorno total do portfólio, economicamente equivalente a um TRS
- ❌ CDS — não há proteção de crédito
- ❌ Opção sobre debêntures

Feedback: "O COE é o contrato hospedeiro (instrumento de captação bancária). Embutido nele há um TRS sintético: o investidor recebe o retorno total do portfólio de referência e paga CDI + 0,80% implicitamente. É funcionalmente idêntico ao TRS autônomo visto no módulo de Derivativos de Crédito."

**Etapa 2 — Análise: comparação com TRS autônomo**
- ✅ O COE tem vantagens (simplicidade operacional, sem necessidade de ISDA) e desvantagens (spread de estruturação de 0,80% vs 0,50% do TRS). Custo extra de 0,30% a.a. é o prêmio de conveniência.
- ❌ Idêntico ao TRS — sem diferença
- ❌ O COE é sempre mais caro e nunca vale a pena

**Etapa 3 — Risco de crédito embutido**
- ✅ O investidor assume risco de crédito do BANCO emissor do COE (se o banco quebrar, perde o investimento) ALÉM do risco do portfólio de referência
- ❌ O risco é apenas do portfólio de referência
- ❌ O COE tem garantia do FGC

Feedback: "Dupla camada de risco: (1) Risco do portfólio de referência (debêntures de infra). (2) Risco do banco emissor do COE. No TRS autônomo, o risco do banco é contratual (contraparte). No COE, é risco de emissão. O FGC não cobre COE."

**Etapa 4 — Resolução**

Cenários baseados na performance do portfólio de referência + risco do banco emissor.

---

## 8. Cenário 6 — Derivativo de Crédito Implícito (Avançado)

### Contexto

Você é analista de crédito do **Banco Meridional**. Uma empresa solicita um **empréstimo de R$ 30 milhões** com a seguinte cláusula: "caso o rating da empresa seja rebaixado para abaixo de BB+, o spread do empréstimo aumenta de 2,50% para 4,00% a.a."

Essa cláusula é um **derivativo de crédito implícito**: economicamente equivalente a um **CDS vendido** pelo tomador ao banco, com trigger no rating.

### displayFields

| Campo | Valor |
|-------|-------|
| Empréstimo | R$ 30M |
| Spread base | CDI + 2,50% |
| Spread pós-trigger | CDI + 4,00% |
| Trigger | Rating < BB+ |
| Rating atual | BBB |
| Prazo | 4 anos |

### Árvore de decisão

**Etapa 1 — Identificação**
- ✅ CDS implícito (proteção de crédito vendida pelo tomador) — a cláusula transfere risco de crédito ao tomador via aumento de custo quando o crédito piora
- ❌ Opção de pré-pagamento
- ❌ Cap de taxa de juros

Feedback: "A cláusula de step-up de spread atrelada ao rating é economicamente um derivativo de crédito: o banco recebe 'indenização' (spread maior) quando o crédito deteriora. O tomador implicitamente vendeu proteção ao banco."

**Etapa 2 — Impacto econômico**
- ✅ Aumento de R$ 450.000/ano (1,50% × R$ 30M) — pode agravar a situação da empresa justamente quando está mais frágil
- ❌ Impacto irrelevante
- ❌ O spread só aumenta no vencimento

Feedback: "Memória de cálculo: (1) Spread base = 2,50% × R$ 30M = R$ 750k/ano. (2) Spread pós-trigger = 4,00% × R$ 30M = R$ 1.200k/ano. (3) Aumento = R$ 450k/ano. Paradoxo: a cláusula aumenta o custo justamente quando a empresa está mais frágil (rating rebaixado) — agravando a dificuldade financeira (efeito pró-cíclico)."

**Etapa 3 — Bifurcação**
- ✅ Deve separar — a variável subjacente (rating de crédito) está indiretamente relacionada ao hospedeiro, mas o step-up modifica significativamente os fluxos. A prática contábil varia, mas se o step-up for material, a bifurcação pode ser exigida.
- ❌ Não separa — está intimamente relacionado
- ❌ Separa apenas se o rating for rebaixado

**Etapa 4 — Resolução**

Cenários: (A) rating rebaixado para BB, spread sobe; (B) rating mantido; (C) rating melhorado para A−.

---

## 9. Cenário 7 — Cap/Floor de Juros em Empréstimo (Super Desafio)

### Contexto

A **Construtora Horizonte S.A.** tomou um empréstimo de **R$ 120 milhões** a **CDI + 1,80% a.a.** por 5 anos. Para limitar o risco de alta de juros, negocia com o banco uma cláusula de **cap**: o custo total do empréstimo não ultrapassará **15,00% a.a.** Em contrapartida, o banco exige um **floor**: o custo mínimo será **10,50% a.a.**

O empréstimo embute um **collar de taxa de juros**: a empresa comprou um cap (limita a alta) e vendeu um floor (abre mão da queda abaixo de 10,50%) — estrutura análoga ao collar cambial do módulo de Opções.

### displayFields

| Campo | Valor |
|-------|-------|
| Empréstimo | R$ 120M |
| Spread | CDI + 1,80% |
| Cap (teto) | 15,00% a.a. total |
| Floor (piso) | 10,50% a.a. total |
| CDI atual | 11,75% a.a. |
| Custo atual | 13,55% a.a. |
| Prazo | 5 anos |

### Árvore de decisão

**Etapa 1 — Identificação dos derivativos embutidos**
- ✅ Cap comprado (opção de teto) + Floor vendido (opção de piso) = collar de taxa de juros embutido
- ❌ Swap de taxa fixa × flutuante
- ❌ Apenas um cap

Feedback: "São dois derivativos embutidos: (1) Cap: o banco vende ao tomador o direito de limitar o custo em 15,00%. Se CDI subir muito, o excedente é absorvido pelo banco. (2) Floor: o tomador vende ao banco o direito de limitar a queda do custo em 10,50%. Se CDI cair muito, o tomador não se beneficia abaixo de 10,50%. É um collar embutido — análogo ao collar cambial do exportador."

**Etapa 2 — Análise: CDI de breakeven do cap e floor**
- ✅ Cap é acionado quando CDI + 1,80% > 15,00% → CDI > 13,20%. Floor é acionado quando CDI + 1,80% < 10,50% → CDI < 8,70%.
- ❌ Cap acionado quando CDI > 15,00%
- ❌ Floor acionado quando CDI < 10,50%

Memória: Cap trigger: 15,00% − 1,80% = CDI 13,20%. Floor trigger: 10,50% − 1,80% = CDI 8,70%. Corredor do CDI: 8,70% a 13,20%.

**Etapa 3 — Bifurcação contábil**
- ✅ Geralmente não separa — cap e floor sobre a taxa de juros do próprio empréstimo estão intimamente relacionados ao hospedeiro (mesmo subjacente: taxa de juros)
- ❌ Sempre separa
- ❌ Separa apenas o floor

Feedback: "Quando o cap e o floor têm como subjacente a mesma taxa de juros do empréstimo, o CPC 48 geralmente não exige bifurcação — as características econômicas estão intimamente relacionadas ao hospedeiro. Exceção: se o cap ou floor forem alavancados (ex: 2× o CDI) ou referenciarem outra taxa, a bifurcação pode ser exigida."

**Etapa 4 — Resolução**

| Cenário | CDI | Custo efetivo | Situação |
|---------|-----|---------------|----------|
| A: CDI subiu para 14,50% | CDI+1,80%=16,30%, mas cap: 15,00% | Cap acionado — banco absorve R$ 1,56M/ano |
| B: CDI caiu para 7,00% | CDI+1,80%=8,80%, mas floor: 10,50% | Floor acionado — empresa paga R$ 2,04M a mais |
| C: CDI estável 11,00% | CDI+1,80%=12,80% | Dentro do corredor — sem ativação |

---

## 10. Cenário 8 — Opção de Conversão em Debênture Conversível (Super Desafio)

### Contexto

Você é analista de equity research e avalia a emissão de **debêntures conversíveis** da **TechBrasil S.A.** (startup listada na B3):

- **Debênture**: R$ 200 milhões, cupom CDI + 1,00% a.a., prazo 5 anos
- **Conversão**: a qualquer momento, o debenturista pode converter em ações TECH3 a R$ 25,00/ação (preço de conversão)
- **Preço atual de TECH3**: R$ 18,00
- **Plain vanilla comparável**: CDI + 3,00% a.a.

O cupom é 200 bps menor que o plain vanilla — o investidor aceita cupom menor em troca da **opção de conversão** (call sobre TECH3). O derivativo embutido é uma **call de ações** com strike R$ 25,00.

### displayFields

| Campo | Valor |
|-------|-------|
| Debênture | R$ 200M, conversível |
| Cupom | CDI + 1,00% |
| Plain vanilla | CDI + 3,00% |
| Preço conversão | R$ 25,00/ação |
| TECH3 spot | R$ 18,00 |
| Prêmio conversão | 38,9% acima do spot |
| Prazo | 5 anos |

### Árvore de decisão

**Etapa 1 — Identificação**
- ✅ Call de ações (opção de conversão) — o investidor tem o direito de trocar a debênture por ações a R$ 25,00
- ❌ Put sobre a debênture
- ❌ Swap de equity

Feedback: "A conversão é economicamente uma call de TECH3 com strike R$ 25,00. O prêmio da call é 'pago' pelo investidor na forma de cupom menor (CDI+1% vs CDI+3% = 200 bps/ano de renda perdida). Memória de cálculo do prêmio implícito: 2,00% × R$ 200M × 5 anos = R$ 20M de cupom 'sacrificado' em troca da opção de conversão."

**Etapa 2 — Análise: quando vale converter?**
- ✅ Quando TECH3 > R$ 25,00 — a conversão cria valor, pois as ações recebidas valem mais que o valor de face da debênture
- ❌ Quando TECH3 > R$ 18,00 (spot atual)
- ❌ Nunca — o cupom sempre vale mais

Memória: (1) Cada R$ 1.000 de debênture converte em 1.000 ÷ 25 = 40 ações. (2) Se TECH3 = R$ 35: valor das ações = 40 × R$ 35 = R$ 1.400. (3) Ganho de conversão = R$ 1.400 − R$ 1.000 = R$ 400 por R$ 1.000 de face = 40%.

**Etapa 3 — Bifurcação contábil**
- ✅ Depende da classificação do hospedeiro E da moeda funcional — se o hospedeiro é um passivo financeiro mensurado a custo amortizado e a conversão é em número fixo de ações da própria entidade na mesma moeda funcional, a opção é classificada como equity (patrimônio líquido), não como derivativo. Caso contrário, bifurca.
- ❌ Sempre bifurca
- ❌ Nunca bifurca

Feedback: "O CPC 48/IAS 32 prevê que a opção de conversão em número fixo de ações próprias é classificada como componente de patrimônio (equity), não como derivativo — desde que seja na moeda funcional da entidade. Neste caso, a debênture é separada em: (a) componente de dívida (mensurado a custo amortizado) e (b) componente de equity (residual, sem remensuração). Se a conversão fosse em moeda diferente ou em número variável de ações, seria derivativo e exigiria bifurcação + marcação a mercado."

**Etapa 4 — Resolução**

| Cenário | TECH3 | Conversão? | Resultado |
|---------|-------|------------|-----------|
| A: TECH3 subiu para R$ 40 | Sim — ações valem 60% mais que face | Ganho de conversão de 60% vs face |
| B: TECH3 caiu para R$ 12 | Não — mantém a debênture | Recebe CDI+1% por 5 anos, opção expirou sem valor |
| C: TECH3 subiu para R$ 26 | Marginalmente in-the-money | Análise caso a caso — considerar cupom perdido vs ganho de conversão |

---

## 11. Adaptações no motor de cálculo

### 11.1. Payoff de derivativos embutidos

Cada cenário tem lógica específica:
- **COE**: max(principal, principal × (1 + participação × retorno_SP500)) vs CDI alternativo
- **Pré-pagamento**: economia de spread × prazo restante − multa
- **Callable**: análise de exercício pelo emissor + risco de reinvestimento
- **Indexação cambial**: custo_base + trigger × step_up
- **TRS sintético**: carry + Δpreço (como TRS do módulo de crédito)
- **Derivativo crédito implícito**: spread_base + trigger × step_up
- **Cap/floor**: min(max(CDI + spread, floor), cap)
- **Conversão**: max(debênture, nAções × preçoAção)

### 11.2. ResultPanel customizado

O ResultPanel para derivativos embutidos deve ter 3 painéis:
1. **① Identificação do derivativo**: o que é, por que é um derivativo
2. **② Resultado econômico**: payoff numérico com memória de cálculo
3. **③ Tratamento contábil**: bifurca ou não bifurca, e por quê

---

## 12. Resumo dos 8 cenários

| # | Título | Derivativo embutido | Dificuldade | Conceito-chave |
|---|--------|---------------------|-------------|----------------|
| 1 | COE de Principal Garantido | Call sobre S&P 500 | Intermediário | Zero-cupom + call, custo de oportunidade |
| 2 | Opção de Pré-pagamento | Call sobre própria dívida | Intermediário | Exercício quando juros caem, análise multa vs economia |
| 3 | Callable Bond | Call vendida ao emissor | Intermediário | Risco de reinvestimento, prêmio de 50 bps |
| 4 | Indexação Cambial Implícita | Call digital de dólar | Avançado | Trigger cambial em empréstimo rural, bifurcação obrigatória |
| 5 | TRS Sintético via COE | TRS embutido em COE | Avançado | Dupla camada de risco (portfólio + emissor) |
| 6 | Derivativo de Crédito Implícito | CDS implícito (step-up) | Avançado | Efeito pró-cíclico, trigger de rating |
| 7 | Cap/Floor de Juros | Collar de taxa embutido | Super Desafio | Corredor de custo, triggers de CDI |
| 8 | Debênture Conversível | Call de ações | Super Desafio | Componente equity vs derivativo, IAS 32 |

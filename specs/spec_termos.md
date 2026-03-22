# Especificação Final — Módulo de Termos (NDF)

## Derivativos Lab | COPPEAD/UFRJ — MBA

**Versão:** Final (pós-implementação)

---

## 1. Visão geral

O módulo de Termos (NDF) é o primeiro e mais fundamental do aplicativo. Introduz os conceitos de hedge, especulação e arbitragem através do instrumento mais simples de derivativo cambial: o Non-Deliverable Forward.

### Estrutura
- **4 cenários**: 2 Intermediários, 1 Avançado, 1 Super Desafio
- **Árvore de decisão** em 4 etapas por cenário (motivação → estratégia → contrato → resolução)
- **Payoff linear** com diagrama interativo (Recharts)
- **Ponto de fixing animado** no gráfico com valor do P&L
- **3 cenários de mercado** por resolução (alta, queda, estável)

### Motor de cálculo
O P&L do NDF é linear:
- **Vendedor de USD a termo**: P&L = (forward − fixing) × nocional
- **Comprador de USD a termo**: P&L = (fixing − forward) × nocional

O ResultPanel mostra: P&L numérico, taxa efetiva, diagrama de payoff, explicação didática e contrafactual.

---

## 2. Cenário 1 — Hedge Cambial: Exportador (Intermediário)

### Contexto

AgroBrasil S.A., exportadora de commodities, fechou contrato de exportação de **USD 5 milhões** com recebimento em **90 dias**. Dólar spot **R$ 5,20**, forward 90d **R$ 5,28**. Risco: queda do dólar reduz receita em reais.

### displayFields

| Campo | Valor |
|-------|-------|
| Spot | R$ 5,2000 |
| Forward 90d | R$ 5,2800 |
| Nocional | USD 5M |
| Prazo | 90 dias |

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Hedge — proteger o valor dos recebíveis
- ❌ Especulação — como tesoureiro, prioridade é proteger fluxo de caixa
- ❌ Arbitragem — não há acesso a dois mercados com preços inconsistentes

**Etapa 2 — Estratégia**
- ✅ Vender USD a termo — travar a taxa de conversão dos recebíveis futuros
- ❌ Comprar USD a termo — hedge de importador, não exportador

**Etapa 3 — Contrato: qual taxa?**
- ✅ R$ 5,28 (taxa de mercado) — reflete diferencial CDI vs cupom cambial
- ❌ R$ 5,20 (spot) — taxa spot não está disponível para contrato a termo
- ❌ R$ 5,35 (acima do forward) — contraparte não aceitaria

**Etapa 4 — Resolução**

| Cenário | Fixing | P&L NDF | Resultado |
|---------|--------|---------|-----------|
| A: Dólar caiu para R$ 4,90 | R$ 4,90 | +R$ 1.900.000 | Hedge funcionou: NDF compensou queda |
| B: Dólar subiu para R$ 5,55 | R$ 5,55 | −R$ 1.350.000 | NDF "custou" mas recebíveis valem mais |
| C: Dólar estável R$ 5,25 | R$ 5,25 | +R$ 150.000 | Resultado marginal |

---

## 3. Cenário 2 — Especulação Cambial: Gestor de Fundo (Avançado)

### Contexto

Gestor de fundo multimercado (PL R$ 200M) acredita que o real vai se valorizar. Dólar spot **R$ 5,30**, forward 60d **R$ 5,36**. Posição puramente direcional via NDF.

### displayFields

| Campo | Valor |
|-------|-------|
| Spot | R$ 5,3000 |
| Forward 60d | R$ 5,3600 |
| Nocional | USD 10M |
| Prazo | 60 dias |

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Especulação — sem exposição cambial subjacente, motivação direcional
- ❌ Hedge — não há ativo/passivo em moeda estrangeira
- ❌ Arbitragem — tese direcional, não mispricing

**Etapa 2 — Estratégia**
- ✅ Vender USD a termo — lucra se dólar cair abaixo do forward
- ❌ Comprar USD a termo — lucra na alta (oposto da tese)

**Etapa 3 — Dimensionamento**
- ❌ USD 2M (~5% do PL) — conservadora demais para convicção
- ✅ USD 10M (~25% do PL) — consistente com tese de convicção
- ❌ USD 30M (~80% do PL) — extremamente agressivo, viola política de risco

**Etapa 4 — Resolução**

| Cenário | Fixing | P&L | Resultado |
|---------|--------|-----|-----------|
| A: Dólar caiu para R$ 4,95 | R$ 4,95 | +R$ 4.100.000 | Tese acertou |
| B: Dólar subiu para R$ 5,60 | R$ 5,60 | −R$ 2.400.000 | Tese errou |
| C: Dólar estável R$ 5,32 | R$ 5,32 | +R$ 400.000 | Marginal |

---

## 4. Cenário 3 — Hedge Cambial: Importador (Intermediário)

### Contexto

TechImport Ltda. importa componentes eletrônicos. Pedido de **USD 3 milhões** com pagamento em **120 dias**. Dólar spot **R$ 5,15**, forward 120d **R$ 5,25**. Risco: alta do dólar aumenta custo.

### displayFields

| Campo | Valor |
|-------|-------|
| Spot | R$ 5,1500 |
| Forward 120d | R$ 5,2500 |
| Nocional | USD 3M |
| Prazo | 120 dias |

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Hedge — travar custo da importação em reais
- ❌ Especulação — diretoria espera proteção
- ❌ Arbitragem — exposição real a gerenciar

**Etapa 2 — Estratégia**
- ✅ Comprar USD a termo — importador precisa COMPRAR dólares
- ❌ Vender USD a termo — hedge de exportador, não importador

**Etapa 3 — Hedge ratio**
- ✅ 100% — proteção integral (prática conservadora recomendada)
- ❌ 50% — hedge parcial mistura hedge com especulação
- ❌ 0% — pura especulação cambial, diretoria pediu proteção

**Etapa 4 — Resolução**

| Cenário | Fixing | P&L NDF | Resultado |
|---------|--------|---------|-----------|
| A: Dólar subiu R$ 5,60 | R$ 5,60 | +R$ 1.050.000 | Hedge protegeu contra alta |
| B: Dólar caiu R$ 4,85 | R$ 4,85 | −R$ 1.200.000 | Custo do hedge (importação ficaria mais barata) |
| C: Dólar estável R$ 5,20 | R$ 5,20 | −R$ 150.000 | Marginal |

---

## 5. Cenário 4 — Arbitragem de Taxa Forward (Super Desafio)

### Contexto

Trader de câmbio do Banco Atlântico identifica distorção: NDF de mercado a **R$ 5,42** vs forward teórico (paridade coberta de juros) de **R$ 5,32**. CDI 11,75%, cupom cambial 4,5%, spot R$ 5,20. Nocional **USD 20 milhões**. Spread de R$ 0,10/USD disponível para arbitragem.

### displayFields

| Campo | Valor |
|-------|-------|
| Spot | R$ 5,2000 |
| Forward Teórico | R$ 5,3200 |
| Forward Mercado | R$ 5,4200 |
| Nocional | USD 20M |
| Prazo | 90 dias |

### Árvore de decisão

**Etapa 1 — Motivação**
- ✅ Arbitragem — forward de mercado acima do forward teórico (mispricing)
- ❌ Especulação — há componente direcional, mas a oportunidade central é a distorção de preço
- ❌ Hedge — não há exposição pré-existente

**Etapa 2 — Estratégia**
- ✅ Vender USD a termo a R$ 5,42 (no forward caro) e montar o sintético comprado a R$ 5,32
- ❌ Comprar USD a termo a R$ 5,42 — comprar no caro é oposto da arbitragem
- ❌ Vender ao preço teórico R$ 5,32 — não é preço disponível no mercado

Lucro travado: R$ 0,10/USD × 20M = R$ 2 milhões, sem risco direcional.

**Etapa 3 — Perna sintética**
- ✅ Tomar CDI emprestado + comprar USD spot + aplicar no cupom cambial — monta o forward sintético comprado
- ❌ Apenas NDF vendido — cria posição direcional, sem a perna que trava o lucro
- ❌ Outro NDF de prazo diferente — risco de basis (descasamento de vencimento)

**Etapa 4 — Resolução**

| Cenário | Fixing | Resultado | Nota |
|---------|--------|-----------|------|
| A: Dólar R$ 4,80 | R$ 4,80 | Lucro travado ~R$ 2M | Arbitragem neutra — resultado independe do fixing |
| B: Dólar R$ 5,80 | R$ 5,80 | Lucro travado ~R$ 2M | Idem |
| C: Dólar R$ 5,35 | R$ 5,35 | Lucro travado ~R$ 2M | Idem |

A arbitragem é neutra em direção — o resultado depende apenas do spread travado entre forward de mercado e forward teórico.

---

## 6. Motor de cálculo implementado

### 6.1. P&L
```
Se posição = sell_usd: P&L = (forward − fixing) × nocional
Se posição = buy_usd: P&L = (fixing − forward) × nocional
```

Para cenário de arbitragem, o forward utilizado é o `forwardMercado` (R$ 5,42), não o teórico.

### 6.2. Hedge ratio
- `full_hedge`: ratio = 1.0
- `partial_hedge`: ratio = 0.5
- `no_hedge`: ratio = 0.0

### 6.3. Taxa efetiva
```
Taxa efetiva = (forward × nocional_hedgeado + fixing × nocional_não_hedgeado) ÷ nocional_total
```

### 6.4. Diagrama de payoff
- Range dinâmico: expande para incluir o fixingRate
- FixingDot com tolerância proporcional ao range (range/50)
- Animação de pulse no ponto de fixing
- Labels: "Entrada" (forward) e "Liquidação" (fixing)

### 6.5. ResultPanel
- P&L numérico com formatação BRL
- Diagrama de payoff interativo
- Explicação didática contextualizada (comprador vs vendedor)
- Contrafactual: "E se tivesse escolhido a posição oposta?"

---

## 7. Funcionalidades de navegação (transversais a todos os módulos)

### 7.1. Navegação bidirecional
- Botão "← Etapa anterior" para voltar um passo
- Barra de progresso clicável (segmentos completados são navegáveis)
- Ao revisitar: banner mostra resposta anterior, botão da resposta selecionada destacado
- Re-responder: descarta respostas subsequentes e recalcula pontuação

### 7.2. Gamificação
- Pontuação por etapa (correta = máximo, parcial para respostas aceitáveis, 0 para erradas)
- Barra de progresso com score acumulado
- Score por cenário na tela home
- Score total acumulado (todos os temas)

---

## 8. Resumo dos 4 cenários

| # | Título | Dificuldade | Conceito-chave |
|---|--------|-------------|----------------|
| 1 | Hedge Cambial — Exportador | Intermediário | Vender USD a termo, taxa forward, proteção de recebíveis |
| 2 | Especulação Cambial — Gestor de Fundo | Avançado | Posição direcional, sizing vs PL, risco de tese errada |
| 3 | Hedge Cambial — Importador | Intermediário | Comprar USD a termo, hedge ratio (100% vs parcial vs zero) |
| 4 | Arbitragem de Taxa Forward | Super Desafio | Paridade coberta de juros, forward sintético, neutralidade direcional |

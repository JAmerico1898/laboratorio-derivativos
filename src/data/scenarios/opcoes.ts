import type { Scenario } from "../../types/scenario";

export const OPCOES_SCENARIOS: Scenario[] = [
  {
    id: "opt_put_protetiva",
    title: "Put Protetiva — Fundo de Ações",
    theme: "Opções", themeId: "opcoes", instrument: "Put PETR4",
    difficulty: "Intermediário",
    optionStrategy: "long_put_hedge",
    context: {
      narrative: "Você é gestor(a) de um fundo de ações com **R$ 300 milhões** em **PETR4** ao preço de **R$ 38,00/ação** (~7,9 milhões de ações). Os resultados trimestrais serão divulgados em **45 dias** e há risco de queda expressiva. A diretoria quer proteger contra quedas superiores a 10%, sem abrir mão do upside. Uma put de PETR4 com strike **R$ 34,50** e vencimento em 50 dias custa **R$ 1,20/ação**. Na B3, cada contrato de opção sobre ação equivale a **100 ações**.",
      marketData: { spotRate: 38.00, forwardRate90d: 34.50, cdiRate: 0.1175, notional_usd: 7900000, tenor: 50, premium: 1.20, strike: 34.50, lotSize: 100 },
      displayFields: [["PETR4 spot", "R$ 38,00"], ["Strike put", "R$ 34,50"], ["Prêmio put", "R$ 1,20/ação"], ["Ações", "7,9M"], ["Custo hedge", "R$ 9,5M"], ["Prazo", "50 dias"]],
      question: "Como proteger a carteira contra queda preservando o upside?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a motivação ao usar opções neste caso?", choices: [
        { id: "hedge", label: "Hedge — proteger contra queda sem abrir mão da alta (put protetiva)", correct: true, score: 20, feedback: "Correto! A put protetiva funciona como um seguro: você paga o prêmio (R$ 1,20/ação) e garante um preço mínimo de venda. Diferente do futuro ou NDF, a opção preserva o upside — se PETR4 subir, você ganha integralmente (menos o prêmio). Essa assimetria é a grande vantagem das opções.", next: "strategy_put" },
        { id: "speculation", label: "Especulação — apostar na queda da ação", correct: false, score: 5, feedback: "Comprar put pode ser especulação, mas aqui há uma carteira de R$ 300M a proteger. A motivação é hedge — proteger o patrimônio existente.", next: "strategy_put" },
        { id: "arbitrage", label: "Arbitragem", correct: false, score: 0, feedback: "Não há distorção de preço a explorar. A motivação é proteger a carteira existente.", next: "strategy_put" },
      ]},
      { id: "strategy_put", type: "choice", prompt: "Qual opção usar para proteger a carteira de PETR4 contra queda?", choices: [
        { id: "buy_usd", label: "Comprar put de PETR4 com strike R$ 34,50 — garante preço mínimo de venda", correct: true, score: 25, feedback: "Memória de cálculo: (1) Comprar put com strike R$ 34,50 = direito de vender PETR4 a R$ 34,50 no vencimento. (2) Custo = R$ 1,20/ação × 7.900.000 ações = R$ 9.480.000 (~3,2% do PL). (3) Se PETR4 cair abaixo de R$ 34,50: a put compensa R$ 1 por R$ 1 de queda. (4) Se PETR4 subir: upside ilimitado, o prêmio é o custo do 'seguro'. (5) Perda máxima da carteira = queda até strike + prêmio = (R$ 38,00 − R$ 34,50) + R$ 1,20 = R$ 4,70/ação = 12,4%.", next: "contract_put" },
        { id: "sell_usd", label: "Vender (lançar) call de PETR4 — gera receita mas limita o upside", correct: false, score: 10, feedback: "Vender call gera receita (prêmio) que amortiza perdas, mas limita o ganho se PETR4 subir acima do strike. A diretoria quer preservar o upside — a call vendida eliminaria justamente isso. Além disso, vender call não protege contra quedas fortes.", next: "contract_put" },
        { id: "sell_usd_teorico", label: "Comprar call de PETR4 — lucra com a alta", correct: false, score: 0, feedback: "Comprar call lucra com a alta, mas não protege contra queda. A carteira já está comprada em PETR4 — comprar call aumentaria a exposição à alta sem endereçar o risco de baixa.", next: "contract_put" },
      ]},
      { id: "contract_put", type: "choice", prompt: "Quantos contratos de put comprar? Na B3, cada contrato de opção sobre ação = 100 ações. A carteira tem 7.900.000 ações de PETR4.", choices: [
        { id: "above_fwd", label: "79.000 contratos", correct: true, score: 20, feedback: "Memória de cálculo: (1) Ações a proteger = 7.900.000. (2) Lote por contrato na B3 = 100 ações. (3) Contratos = 7.900.000 ÷ 100 = 79.000 contratos. (4) Custo total = 79.000 × 100 × R$ 1,20 = R$ 9.480.000. (5) Custo como % do PL = R$ 9,48M ÷ R$ 300M = 3,16%. Esse é o 'prêmio do seguro' para 50 dias de proteção.", next: "resolution_put" },
        { id: "market_fwd", label: "7.900 contratos", correct: false, score: 5, feedback: "Memória de cálculo: 7.900 contratos × 100 ações = 790.000 ações protegidas. Isso é apenas 10% da carteira (790k de 7,9M). Os outros 90% ficariam expostos. O correto: 7.900.000 ÷ 100 = 79.000 contratos.", next: "resolution_put" },
        { id: "spot_rate", label: "39.500 contratos (hedge de 50%)", correct: false, score: 10, feedback: "Memória de cálculo: 39.500 × 100 = 3.950.000 ações = 50% da carteira. Custo menor (R$ 4,74M), mas metade da carteira fica desprotegida. A diretoria pediu proteção contra quedas superiores a 10% — hedge parcial não atende.", next: "resolution_put" },
      ]},
      { id: "resolution_put", type: "resolution", prompt: "50 dias se passaram. PETR4 divulgou resultados. Qual foi o preço no vencimento da put?", scenarios: [
        { id: "queda_forte", label: "Cenário A: PETR4 caiu para R$ 28,00 (−26,3%)", fixingRate: 28.00, description: "Resultado muito abaixo do esperado. A ação despencou." },
        { id: "alta", label: "Cenário B: PETR4 subiu para R$ 45,00 (+18,4%)", fixingRate: 45.00, description: "Resultado surpreendeu positivamente. A ação disparou." },
        { id: "estavel", label: "Cenário C: PETR4 ficou em R$ 36,00 (−5,3%)", fixingRate: 36.00, description: "Resultado em linha. Queda moderada dentro do tolerado." },
      ]},
    ],
  },
  {
    id: "opt_collar",
    title: "Collar (Financiamento) — Exportador",
    theme: "Opções", themeId: "opcoes", instrument: "Collar USD (Put + Call)",
    difficulty: "Intermediário",
    optionStrategy: "collar",
    context: {
      narrative: "Você é tesoureiro(a) da **Celulose Brasil S.A.** O dólar spot está em **R$ 5,20** e a empresa tem recebíveis de **USD 30 milhões** em 90 dias. A put protetiva isolada (strike R$ 5,00) custa **R$ 0,08/USD** — a diretoria considera caro. Para baratear, você propõe um **collar**: comprar a put e vender uma call, usando o prêmio da call para financiar parcialmente a put. Call vendida: strike R$ 5,45, prêmio R$ 0,06/USD.",
      marketData: { spotRate: 5.20, forwardRate90d: 5.20, cdiRate: 0.1175, notional_usd: 30000000, tenor: 90, putStrike: 5.00, putPremium: 0.08, callStrike: 5.45, callPremium: 0.06 },
      displayFields: [["Spot USD", "R$ 5,20"], ["Recebíveis", "USD 30M"], ["Put strike", "R$ 5,00"], ["Put prêmio", "R$ 0,08"], ["Call strike", "R$ 5,45"], ["Call prêmio", "R$ 0,06"], ["Custo líq.", "R$ 0,02/USD"]],
      question: "Como proteger o piso de receita com custo reduzido?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a motivação ao montar um collar?", choices: [
        { id: "hedge", label: "Hedge — criar piso de receita com custo reduzido (collar = put + call vendida)", correct: true, score: 20, feedback: "Correto! O collar cria um corredor: piso em R$ 5,00 (put comprada) e teto em R$ 5,45 (call vendida). Memória de cálculo do custo: put comprada = R$ 0,08/USD (paga), call vendida = R$ 0,06/USD (recebe). Custo líquido = R$ 0,08 − R$ 0,06 = R$ 0,02/USD — 75% mais barato que a put isolada.", next: "strategy_collar" },
        { id: "speculation", label: "Especulação — apostar na direção do câmbio", correct: false, score: 5, feedback: "Há recebíveis reais de USD 30M a proteger. A motivação é operacional, não especulativa.", next: "strategy_collar" },
        { id: "arbitrage", label: "Arbitragem", correct: false, score: 0, feedback: "Não há mispricing a explorar. O collar é uma estratégia de hedge com custo otimizado.", next: "strategy_collar" },
      ]},
      { id: "strategy_collar", type: "choice", prompt: "Qual a estrutura correta do collar para um exportador que vai RECEBER dólares?", choices: [
        { id: "buy_usd", label: "Comprar put R$ 5,00 (piso) + Vender call R$ 5,45 (teto)", correct: true, score: 25, feedback: "Memória de cálculo: (1) Put comprada R$ 5,00: garante venda dos USD a no mínimo R$ 5,00. Se dólar cair abaixo, a put compensa. (2) Call vendida R$ 5,45: obriga a vender USD a R$ 5,45 se o dólar ultrapassar esse nível. (3) Corredor de receita: entre R$ 5,00 e R$ 5,45 por dólar. (4) Custo líquido: R$ 0,02/USD × 30M = R$ 600.000. (5) Tradeoff: proteção no piso custa participação acima do teto.", next: "contract_collar" },
        { id: "sell_usd", label: "Comprar put R$ 5,00 isolada (sem vender call)", correct: false, score: 10, feedback: "A put isolada protege sem limitar o upside, mas custa R$ 0,08/USD × 30M = R$ 2.400.000. A diretoria considera caro. O collar reduz o custo para R$ 0,02/USD × 30M = R$ 600.000 — 75% de economia. O tradeoff é abrir mão do ganho acima de R$ 5,45.", next: "contract_collar" },
        { id: "sell_usd_teorico", label: "Vender call R$ 5,45 isolada (sem comprar put)", correct: false, score: 5, feedback: "Vender call gera receita de R$ 0,06/USD, mas deixa o exportador sem proteção contra queda do dólar. Se o dólar cair para R$ 4,50, a perda de receita é enorme. A call vendida isolada não é hedge — é especulação na estabilidade do câmbio.", next: "contract_collar" },
      ]},
      { id: "contract_collar", type: "choice", prompt: "Qual é o custo total do collar e a receita mínima garantida?", choices: [
        { id: "above_fwd", label: "Custo: R$ 600 mil. Receita mínima: R$ 5,00/USD × 30M = R$ 150M (menos custo R$ 0,6M = R$ 149,4M)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Custo líquido = (R$ 0,08 − R$ 0,06) × 30.000.000 = R$ 600.000. (2) Piso: se dólar < R$ 5,00, exerce put → recebe R$ 5,00/USD. Receita = R$ 5,00 × 30M = R$ 150M − R$ 0,6M = R$ 149,4M. (3) Teto: se dólar > R$ 5,45, call é exercida contra você → entrega USD a R$ 5,45. Receita = R$ 5,45 × 30M = R$ 163,5M − R$ 0,6M = R$ 162,9M. (4) Corredor: entre R$ 149,4M e R$ 162,9M de receita.", next: "resolution_collar" },
        { id: "market_fwd", label: "Custo: R$ 2,4 milhões. Receita mínima: R$ 150M", correct: false, score: 5, feedback: "R$ 2,4M é o custo da put isolada (R$ 0,08 × 30M), sem subtrair a receita da call vendida. Memória de cálculo: Put paga = R$ 0,08 × 30M = R$ 2,4M. Call recebida = R$ 0,06 × 30M = R$ 1,8M. Custo líquido = R$ 2,4M − R$ 1,8M = R$ 600.000.", next: "resolution_collar" },
        { id: "spot_rate", label: "Custo: zero (prêmios se cancelam)", correct: false, score: 0, feedback: "Os prêmios não se cancelam exatamente. Put = R$ 0,08 (paga) vs Call = R$ 0,06 (recebe). Diferença = R$ 0,02/USD × 30M = R$ 600.000 de custo líquido. Para custo zero seria necessário strikes diferentes ou um collar 'zero cost' calibrado para isso.", next: "resolution_collar" },
      ]},
      { id: "resolution_collar", type: "resolution", prompt: "90 dias se passaram. Onde fechou o dólar?", scenarios: [
        { id: "dolar_caiu", label: "Cenário A: Dólar caiu para R$ 4,60 (−11,5%)", fixingRate: 4.60, description: "Real valorizou forte. Sem hedge, receita seria R$ 4,60 × 30M = R$ 138M. Com collar, put exercida: receita = R$ 5,00 × 30M = R$ 150M − custo R$ 0,6M = R$ 149,4M." },
        { id: "dolar_subiu", label: "Cenário B: Dólar subiu para R$ 5,70 (+9,6%)", fixingRate: 5.70, description: "Dólar subiu além do teto. Call exercida contra o exportador: entrega USD a R$ 5,45. Receita = R$ 5,45 × 30M = R$ 163,5M − custo R$ 0,6M = R$ 162,9M. 'Perdeu' R$ 0,25/USD de upside." },
        { id: "dolar_medio", label: "Cenário C: Dólar ficou em R$ 5,25 (+1,0%)", fixingRate: 5.25, description: "Dólar dentro do corredor. Ambas as opções vencem OTM. Receita = R$ 5,25 × 30M = R$ 157,5M − custo R$ 0,6M = R$ 156,9M." },
      ]},
    ],
  },
  {
    id: "opt_straddle",
    title: "Straddle — Especulação em Volatilidade",
    theme: "Opções", themeId: "opcoes", instrument: "Straddle VALE3",
    difficulty: "Avançado",
    optionStrategy: "straddle",
    context: {
      narrative: "Você é trader de opções em um fundo multimercado. A **VALE3** está em **R$ 62,00** e divulga resultados em **10 dias**. A volatilidade implícita (IV) está em **35% a.a.**, abaixo da média histórica pré-resultado de **50% a.a.**. Você acredita que o resultado vai gerar movimento forte, mas não sabe a direção. O limite de risco é **R$ 3 milhões**. Você monta um **straddle** ATM: compra call + compra put, ambas com strike R$ 62,00. Na B3, cada contrato = 100 ações.",
      marketData: { spotRate: 62.00, forwardRate90d: 62.00, cdiRate: 0.1175, notional_usd: 625000, tenor: 10, callPremium: 2.50, putPremium: 2.30, strike: 62.00, lotSize: 100 },
      displayFields: [["VALE3 spot", "R$ 62,00"], ["Strike ATM", "R$ 62,00"], ["Prêmio call", "R$ 2,50"], ["Prêmio put", "R$ 2,30"], ["Custo straddle", "R$ 4,80/ação"], ["IV atual", "35%"], ["IV histórica", "50%"], ["Stop loss", "R$ 3M"]],
      question: "O ativo vai se mover, mas em qual direção? Como lucrar com o movimento?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta operação?", choices: [
        { id: "speculation", label: "Especulação em volatilidade — aposta que o ativo vai se mover mais do que o mercado precifica", correct: true, score: 20, feedback: "Correto! O straddle lucra com o MOVIMENTO, não com a DIREÇÃO. Você está comprando volatilidade: a IV atual (35%) está abaixo da média pré-resultado (50%). Se o resultado causar um movimento forte — para qualquer lado — o straddle lucra. Se o ativo ficar parado, perde o prêmio.", next: "strategy_straddle" },
        { id: "hedge", label: "Hedge — proteger uma posição existente", correct: false, score: 5, feedback: "Não há posição em VALE3 a proteger. O straddle é uma aposta pura em volatilidade.", next: "strategy_straddle" },
        { id: "arbitrage", label: "Especulação direcional — apostar na alta ou queda", correct: false, score: 0, feedback: "O straddle é neutro em direção — lucra tanto na alta quanto na queda. Se soubesse a direção, compraria apenas call ou apenas put, que seriam mais baratas.", next: "strategy_straddle" },
      ]},
      { id: "strategy_straddle", type: "choice", prompt: "Qual estratégia para lucrar com movimento forte em qualquer direção?", choices: [
        { id: "buy_usd", label: "Comprar straddle (call ATM + put ATM) — lucra com movimento grande", correct: true, score: 25, feedback: "Memória de cálculo: (1) Call ATM R$ 62,00: prêmio R$ 2,50. (2) Put ATM R$ 62,00: prêmio R$ 2,30. (3) Custo total = R$ 4,80/ação. (4) Breakeven superior = R$ 62,00 + R$ 4,80 = R$ 66,80 (+7,7%). (5) Breakeven inferior = R$ 62,00 − R$ 4,80 = R$ 57,20 (−7,7%). (6) A ação precisa se mover mais de 7,7% em qualquer direção para o straddle dar lucro. (7) Perda máxima = prêmio total = R$ 4,80/ação (se ação fechar exatamente no strike).", next: "contract_straddle" },
        { id: "sell_usd", label: "Vender straddle — lucra se o ativo ficar parado", correct: false, score: 0, feedback: "Vender straddle lucra com a estabilidade do ativo — oposto da sua tese! Você acredita que o resultado vai gerar movimento forte. Vender straddle teria risco ilimitado se o ativo se mover.", next: "contract_straddle" },
        { id: "sell_usd_teorico", label: "Comprar apenas call — apostar na alta", correct: false, score: 5, feedback: "Comprar apenas call é aposta direcional na alta. Você não sabe a direção — se o resultado for ruim e a ação cair, a call vence sem valor. O straddle lucra em ambas as direções.", next: "contract_straddle" },
      ]},
      { id: "contract_straddle", type: "choice", prompt: "O stop loss é R$ 3 milhões. A perda máxima do straddle é o prêmio total (R$ 4,80/ação). Cada contrato na B3 = 100 ações. Quantos contratos?", choices: [
        { id: "above_fwd", label: "6.250 contratos", correct: true, score: 20, feedback: "Memória de cálculo: (1) Perda máxima por contrato = R$ 4,80 × 100 ações = R$ 480. (2) Contratos máximos = R$ 3.000.000 ÷ R$ 480 = 6.250 contratos. (3) Total de ações = 6.250 × 100 = 625.000 ações. (4) Custo total = 625.000 × R$ 4,80 = R$ 3.000.000 (= stop loss). (5) Para lucrar, VALE3 precisa fechar acima de R$ 66,80 ou abaixo de R$ 57,20.", next: "resolution_straddle" },
        { id: "market_fwd", label: "10.000 contratos", correct: false, score: 5, feedback: "Memória de cálculo: 10.000 × 100 × R$ 4,80 = R$ 4.800.000. Excede o stop loss de R$ 3M em 60%! Correto: R$ 3.000.000 ÷ (R$ 4,80 × 100) = 6.250 contratos.", next: "resolution_straddle" },
        { id: "spot_rate", label: "3.000 contratos", correct: false, score: 10, feedback: "Memória de cálculo: 3.000 × 100 × R$ 4,80 = R$ 1.440.000. Usa apenas 48% do limite de R$ 3M. Sub-utiliza o limite de risco. Correto: 6.250 contratos.", next: "resolution_straddle" },
      ]},
      { id: "resolution_straddle", type: "resolution", prompt: "O resultado de VALE3 saiu. Onde fechou a ação?", scenarios: [
        { id: "queda_forte", label: "Cenário A: VALE3 caiu para R$ 52,00 (−16,1%)", fixingRate: 52.00, description: "Resultado decepcionante. Queda de R$ 10,00 por ação. Put deep ITM, call vence OTM." },
        { id: "alta_forte", label: "Cenário B: VALE3 subiu para R$ 72,00 (+16,1%)", fixingRate: 72.00, description: "Resultado excepcional. Alta de R$ 10,00 por ação. Call deep ITM, put vence OTM." },
        { id: "estavel", label: "Cenário C: VALE3 ficou em R$ 63,00 (+1,6%)", fixingRate: 63.00, description: "Resultado em linha com expectativas. Movimento mínimo — abaixo dos breakevens." },
      ]},
    ],
  },
  {
    id: "opt_risk_reversal",
    title: "Super Desafio — Risk Reversal e Skew de Volatilidade",
    theme: "Opções", themeId: "opcoes", instrument: "Risk Reversal USD",
    difficulty: "Super Desafio",
    optionStrategy: "risk_reversal",
    context: {
      narrative: "Você é head de derivativos do **Banco Atlântico**. O dólar spot está em **R$ 5,20** e o mercado de opções apresenta **skew de volatilidade** pronunciado: puts de dólar (strike R$ 4,90) têm IV de **18%** enquanto calls (strike R$ 5,55) têm IV de apenas **11%**. O skew indica que o mercado precifica mais risco de queda do dólar (puts caras) do que de alta. Sua análise sugere que o risco real é simétrico — o skew está exagerado. Você monta um **risk reversal**: vende a put cara e compra a call barata. Nocional: **USD 50 milhões**.",
      marketData: { spotRate: 5.20, forwardRate90d: 5.20, cdiRate: 0.1175, notional_usd: 50000000, tenor: 90, putStrike: 4.90, putPremium: 0.12, callStrike: 5.55, callPremium: 0.05 },
      displayFields: [["Spot USD", "R$ 5,20"], ["Put strike", "R$ 4,90 (IV 18%)"], ["Call strike", "R$ 5,55 (IV 11%)"], ["Prêmio put", "R$ 0,12 (recebe)"], ["Prêmio call", "R$ 0,05 (paga)"], ["Crédito líq.", "R$ 0,07/USD"], ["Nocional", "USD 50M"]],
      question: "O skew de volatilidade está exagerado. Como capturar essa distorção?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta oportunidade?", choices: [
        { id: "arbitrage", label: "Arbitragem de volatilidade — o skew está exagerado; vender vol cara (put) e comprar vol barata (call)", correct: true, score: 25, feedback: "Correto! O risk reversal explora a distorção do skew. Puts com IV de 18% estão 'caras' em relação às calls com IV de 11%. Ao vender a put cara e comprar a call barata, você embolsa o diferencial. Entretanto, a posição tem risco direcional: se o dólar cair abaixo de R$ 4,90, a put vendida gera prejuízo potencialmente grande.", next: "strategy_rr" },
        { id: "speculation", label: "Especulação direcional — apostar na alta do dólar", correct: false, score: 10, feedback: "O risk reversal tem componente direcional (ganha se dólar sobe), mas a motivação principal é explorar o mispricing do skew — a put está cara demais em relação à call. Se fosse pura direcionalidade, bastaria comprar call.", next: "strategy_rr" },
        { id: "hedge", label: "Hedge de uma posição cambial", correct: false, score: 0, feedback: "Não há exposição cambial a proteger. A operação é de valor relativo — explorar a distorção no preço relativo de puts vs calls.", next: "strategy_rr" },
      ]},
      { id: "strategy_rr", type: "choice", prompt: "Qual a estrutura do risk reversal para capturar o skew?", choices: [
        { id: "buy_usd", label: "Vender put R$ 4,90 (recebe R$ 0,12) + Comprar call R$ 5,55 (paga R$ 0,05) — crédito líquido R$ 0,07", correct: true, score: 30, feedback: "Memória de cálculo: (1) Put vendida R$ 4,90: recebe prêmio R$ 0,12/USD = R$ 0,12 × 50M = R$ 6.000.000. (2) Call comprada R$ 5,55: paga prêmio R$ 0,05/USD = R$ 0,05 × 50M = R$ 2.500.000. (3) Crédito líquido = R$ 6.000.000 − R$ 2.500.000 = R$ 3.500.000. (4) Se dólar entre R$ 4,90 e R$ 5,55: ambas vencem OTM, embolsa crédito. (5) Se dólar > R$ 5,55: call exercida = ganho ilimitado. (6) Se dólar < R$ 4,90: put exercida contra você = risco de perda grande.", next: "contract_rr" },
        { id: "sell_usd", label: "Comprar put R$ 4,90 + Vender call R$ 5,55 — paga o skew", correct: false, score: 0, feedback: "Isso inverte a lógica! Comprando a put cara (IV 18%) e vendendo a call barata (IV 11%), você PAGA o skew ao invés de receber. Custo líquido = R$ 0,07/USD. A operação correta é o oposto.", next: "contract_rr" },
        { id: "sell_usd_teorico", label: "Comprar straddle ATM — posição de volatilidade pura", correct: false, score: 5, feedback: "O straddle compra volatilidade em ambas as direções. Mas o mispricing está no SKEW (diferença entre IV de put e call), não no nível absoluto de vol. O risk reversal é o instrumento correto para capturar distorções de skew.", next: "contract_rr" },
      ]},
      { id: "contract_rr", type: "choice", prompt: "Qual é a perda máxima se o dólar cair para R$ 4,00? Lembre-se: a put vendida obriga você a comprar USD a R$ 4,90.", choices: [
        { id: "above_fwd", label: "R$ 41,5 milhões", correct: true, score: 20, feedback: "Memória de cálculo: (1) Put vendida: obrigação de comprar USD a R$ 4,90. Com dólar a R$ 4,00: perda = (R$ 4,90 − R$ 4,00) × 50M = R$ 45.000.000. (2) Call comprada: vence sem valor (OTM). (3) Crédito líquido recebido = R$ 3.500.000. (4) Perda líquida = R$ 45.000.000 − R$ 3.500.000 = R$ 41.500.000. Esta é a razão pela qual o risk reversal exige margem e limite de risco rigoroso — a put vendida tem risco de perda muito grande se o dólar cair.", next: "resolution_rr" },
        { id: "market_fwd", label: "R$ 3,5 milhões (apenas o crédito recebido)", correct: false, score: 0, feedback: "R$ 3,5M é o crédito líquido recebido — não é a perda máxima! A put vendida cria obrigação ilimitada. Memória de cálculo: se dólar = R$ 4,00, perda na put = (4,90 − 4,00) × 50M = R$ 45M. Menos crédito R$ 3,5M = perda líquida de R$ 41,5M. Confundir crédito recebido com perda máxima é um erro crítico em opções vendidas.", next: "resolution_rr" },
        { id: "spot_rate", label: "R$ 45 milhões", correct: false, score: 10, feedback: "R$ 45M é a perda bruta na put, mas esquece de subtrair o crédito líquido recebido. Memória de cálculo: (1) Perda na put = (4,90 − 4,00) × 50M = R$ 45M. (2) Crédito recebido = R$ 3,5M. (3) Perda líquida = R$ 45M − R$ 3,5M = R$ 41,5M.", next: "resolution_rr" },
      ]},
      { id: "resolution_rr", type: "resolution", prompt: "90 dias se passaram. Onde fechou o dólar?", scenarios: [
        { id: "dolar_caiu", label: "Cenário A: Dólar caiu para R$ 4,50 (−13,5%)", fixingRate: 4.50, description: "O mercado estava certo em precificar mais risco de queda. Put exercida contra o banco." },
        { id: "dolar_subiu", label: "Cenário B: Dólar subiu para R$ 5,80 (+11,5%)", fixingRate: 5.80, description: "O skew estava exagerado. A call comprada entrou ITM e o banco embolsou o crédito + ganho da call." },
        { id: "dolar_estavel", label: "Cenário C: Dólar ficou em R$ 5,15 (−1,0%)", fixingRate: 5.15, description: "Dólar dentro do corredor R$ 4,90 – R$ 5,55. Ambas vencem OTM." },
      ]},
    ],
  },
];

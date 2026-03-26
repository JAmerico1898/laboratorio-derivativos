import type { Scenario } from "../../types/scenario";

export const CREDITO_SCENARIOS: Scenario[] = [
  {
    id: "cds_hedge_carteira",
    title: "CDS Corporativo — Hedge de Carteira de Crédito",
    theme: "Deriv. Crédito", themeId: "credito", instrument: "CDS Corporativo",
    difficulty: "Intermediário",
    creditStrategy: "cds_hedge",
    context: {
      narrative: "Você é gestor(a) de crédito do **Banco Horizonte** e tem **R$ 500 milhões em debêntures da Construtora Atlântico S.A.** (rating A−, setor imobiliário). O setor está sob pressão: juros altos, vendas fracas e dois concorrentes entraram em recuperação judicial. O comitê de crédito pede que você **reduza a exposição sem vender os títulos** (a venda teria forte deságio). Um banco oferece **CDS** sobre a Construtora Atlântico: spread de **280 bps a.a.**, prazo de **2 anos**, taxa de recuperação estimada de **35%**. O CDS funciona como um seguro: você paga o spread e, se houver default, recebe a indenização.",
      marketData: { nocional: 500000000, spreadBps: 280, recoveryRate: 0.35, prazoAnos: 2, dv01Per10M: 2000 },
      displayFields: [["Debêntures", "R$ 500M"], ["Emissora", "Constr. Atlântico (A−)"], ["Spread CDS", "280 bps a.a."], ["Recovery rate", "35%"], ["Prazo", "2 anos"], ["Custo anual", "R$ 14M"]],
      question: "Como proteger a carteira de crédito sem vender os títulos?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a motivação ao contratar um CDS?", choices: [
        { id: "hedge", label: "Hedge de crédito — proteger contra default da emissora sem vender os títulos", correct: true, score: 20, feedback: "Correto! O CDS transfere o risco de crédito mantendo os títulos em carteira. Memória de cálculo do custo: (1) Spread = 280 bps = 2,80% a.a. (2) Custo anual = 2,80% × R$ 500M = R$ 14.000.000/ano. (3) Custo total em 2 anos ≈ R$ 28.000.000. Esse é o 'prêmio do seguro de crédito'. Vantagens vs vender: (a) não realiza perda a mercado, (b) mantém a relação com o emissor, (c) o hedge pode ser desfeito se o risco diminuir.", next: "strategy_cds" },
        { id: "speculation", label: "Especulação — apostar no default da construtora", correct: false, score: 5, feedback: "Há uma carteira real de R$ 500M a proteger. Comprar CDS sem exposição subjacente seria 'naked CDS' (especulação). Aqui a motivação é proteger um ativo existente.", next: "strategy_cds" },
        { id: "arbitrage", label: "Arbitragem entre CDS e debênture", correct: false, score: 0, feedback: "Arbitragem (basis trade) exigiria explorar diferença entre spread do CDS e spread da debênture. Aqui a motivação é operacional: proteger a carteira.", next: "strategy_cds" },
      ]},
      { id: "strategy_cds", type: "choice", prompt: "No CDS, qual posição o Banco Horizonte deve tomar? Lembre-se: o banco JÁ TEM as debêntures (exposição ao risco de crédito).", choices: [
        { id: "buy_usd", label: "Comprar proteção — pagar 280 bps a.a. e receber indenização em caso de default", correct: true, score: 25, feedback: "Memória de cálculo da indenização em caso de default: (1) Nocional = R$ 500M. (2) Recovery rate = 35% (o que se espera recuperar). (3) LGD (Loss Given Default) = 1 − 35% = 65%. (4) Indenização do CDS = R$ 500M × 65% = R$ 325.000.000. (5) Perda residual = R$ 500M × 35% = R$ 175M (parcela do recovery, que o banco pode recuperar no processo de RJ). O CDS cobre a parcela de perda acima do recovery.", next: "contract_cds" },
        { id: "sell_usd", label: "Vender proteção — receber 280 bps a.a. e pagar em caso de default", correct: false, score: 0, feedback: "Vender proteção = ASSUMIR mais risco de crédito sobre a mesma emissora. Você já tem R$ 500M de exposição via debêntures. Vender proteção DOBRARIA a exposição: se a construtora der default, o banco perde nos títulos E paga a indenização do CDS. É exatamente o oposto do hedge!", next: "contract_cds" },
      ]},
      { id: "contract_cds", type: "choice", prompt: "Qual nocional de CDS contratar?", choices: [
        { id: "above_fwd", label: "R$ 500 milhões — hedge integral", correct: true, score: 20, feedback: "Memória de cálculo: (1) Exposição = R$ 500M em debêntures. (2) CDS nocional = R$ 500M → proteção de 100%. (3) Custo anual = 2,80% × R$ 500M = R$ 14M. (4) Em caso de default: indenização = R$ 500M × 65% = R$ 325M. (5) Perda líquida = custo do spread pago + parcela do recovery. O hedge integral é a abordagem mais conservadora.", next: "resolution_cds" },
        { id: "market_fwd", label: "R$ 250 milhões — hedge parcial de 50%", correct: false, score: 10, feedback: "Memória de cálculo: (1) CDS R$ 250M → protege 50%. (2) Se default: indenização = R$ 250M × 65% = R$ 162,5M. (3) Perda sem proteção nos outros R$ 250M = R$ 250M × 65% = R$ 162,5M. (4) Perda total = R$ 162,5M + custo do spread. Hedge parcial economiza no spread mas deixa metade exposta.", next: "resolution_cds" },
        { id: "spot_rate", label: "R$ 750 milhões — over-hedge", correct: false, score: 0, feedback: "Memória de cálculo: (1) CDS R$ 750M sobre exposição de R$ 500M = over-hedge de R$ 250M. (2) O excedente de R$ 250M é posição especulativa: lucra com o default além da perda real. (3) Custo = 2,80% × R$ 750M = R$ 21M/ano. (4) Over-hedge pode gerar problemas regulatórios e contábeis.", next: "resolution_cds" },
      ]},
      { id: "resolution_cds", type: "resolution", prompt: "2 anos se passaram. O que aconteceu com a Construtora Atlântico?", scenarios: [
        { id: "default", label: "Cenário A: Construtora entrou em recuperação judicial (default)", fixingRate: 490, description: "Evento de crédito confirmado após 12 meses." },
        { id: "upgrade", label: "Cenário B: Rating elevado para A+ (risco diminuiu)", fixingRate: 120, description: "Reformas internas e melhora do setor levaram ao upgrade. Spread de mercado caiu de 280 para 120 bps." },
        { id: "estavel", label: "Cenário C: Rating mantido, setor estabilizou", fixingRate: 260, description: "Sem evento de crédito. Spread estável em ~260 bps." },
      ]},
    ],
  },
  {
    id: "trs_exposicao",
    title: "TRS — Exposição Sintética a Crédito",
    theme: "Deriv. Crédito", themeId: "credito", instrument: "Total Return Swap (TRS)",
    difficulty: "Intermediário",
    creditStrategy: "trs",
    context: {
      narrative: "Você é gestor(a) do fundo **Crédito Plus FIM** e identificou oportunidade em debêntures da **Energia Renovável S.A.** (rating AA), que rendem **CDI + 1,80% a.a.** a preço atrativo. Porém, o fundo **não tem caixa disponível** (PL 95% alocado). Um banco oferece **Total Return Swap (TRS)**: o banco mantém as debêntures e o fundo recebe o retorno total (cupom + variação de preço). Em troca, paga **CDI + 0,50% a.a.** O TRS funciona como 'alugar' a posição: você tem a exposição econômica completa sem desembolsar o capital para comprar o papel.",
      marketData: { nocional: 200000000, spreadCupom: 0.018, spreadFinanc: 0.005, prazoAnos: 1 },
      displayFields: [["Debênture", "Energia Renovável (AA)"], ["Cupom", "CDI + 1,80%"], ["Custo TRS", "CDI + 0,50%"], ["Spread líquido", "1,30% a.a."], ["Nocional", "R$ 200M"], ["Prazo", "1 ano"]],
      question: "Como obter exposição a crédito sem caixa disponível?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a motivação ao contratar um TRS?", choices: [
        { id: "hedge", label: "Exposição sintética — obter retorno da debênture sem comprá-la (sem usar caixa)", correct: true, score: 20, feedback: "Correto! O TRS replica a posição econômica sem compra física. Memória de cálculo: (1) Compra direta: desembolso de R$ 200M (indisponível). (2) Via TRS: desembolso ≈ zero (apenas margem de ~5-10%). (3) Retorno recebido = CDI + 1,80% (idêntico a deter o título). (4) Custo pago = CDI + 0,50%. (5) Spread líquido = 1,80% − 0,50% = 1,30% a.a. → R$ 2.600.000/ano (se preço não variar). É como 'alugar' a posição — alavancagem implícita.", next: "strategy_trs" },
        { id: "speculation", label: "Especulação em taxa de juros", correct: false, score: 5, feedback: "O TRS dá exposição ao crédito específico (Energia Renovável), não a juros em geral. A motivação é capturar o spread de crédito atrativo.", next: "strategy_trs" },
        { id: "arbitrage", label: "Hedge de uma posição existente", correct: false, score: 0, feedback: "Não há posição a proteger. O TRS cria uma posição nova — exposição sintética longa em crédito.", next: "strategy_trs" },
      ]},
      { id: "strategy_trs", type: "choice", prompt: "No TRS, qual perna o fundo deve tomar?", choices: [
        { id: "buy_usd", label: "Receber retorno total (cupom + variação de preço) e pagar CDI + 0,50%", correct: true, score: 25, feedback: "Memória de cálculo: (1) Recebe: CDI + 1,80% (cupom) + variação de preço da debênture. (2) Paga: CDI + 0,50% (financiamento). (3) Os CDIs se cancelam parcialmente: resultado = 1,30% a.a. + Δpreço. (4) Se debênture valorizar 3%: ganho = 1,30% + 3,00% = 4,30% × R$ 200M = R$ 8,6M. (5) Se desvalorizar 8%: perda = 1,30% − 8,00% = −6,70% × R$ 200M = −R$ 13,4M. RISCO: o TRS transfere tanto o retorno QUANTO o risco — perda de preço é absorvida integralmente pelo fundo.", next: "contract_trs" },
        { id: "sell_usd", label: "Pagar retorno total e receber CDI + 0,50% (posição vendida)", correct: false, score: 0, feedback: "Pagar retorno total = ficar sinteticamente vendido na debênture. Você lucraria se o papel perdesse valor — uma aposta contra o crédito. Mas a tese é que a debênture está atrativa (quer ganhar com ela, não contra).", next: "contract_trs" },
      ]},
      { id: "contract_trs", type: "choice", prompt: "O rating da Energia Renovável é rebaixado de AA para BBB e o preço da debênture cai 8%. Qual é o impacto no TRS?", choices: [
        { id: "above_fwd", label: "Perda de R$ 13,4M (variação de −8% menos spread de +1,30%)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Variação de preço = −8% × R$ 200M = −R$ 16.000.000. (2) Spread de cupom recebido em 1 ano = 1,30% × R$ 200M = +R$ 2.600.000. (3) Resultado líquido = −R$ 16.000.000 + R$ 2.600.000 = −R$ 13.400.000. O recebedor do retorno total absorve integralmente a perda de preço — o TRS não é um hedge, é uma exposição sintética com todos os riscos do ativo.", next: "resolution_trs" },
        { id: "market_fwd", label: "Sem impacto — o TRS protege contra variação de preço", correct: false, score: 0, feedback: "Errado! O TRS transfere o retorno TOTAL — inclusive perdas. Retorno total = cupom + variação de preço. Se o preço cai 8%, essa perda é do recebedor (o fundo). Memória: −8% × R$ 200M = −R$ 16M, parcialmente compensada pelo spread de R$ 2,6M → perda líquida R$ 13,4M.", next: "resolution_trs" },
        { id: "spot_rate", label: "Perda de R$ 16M (apenas a variação de preço)", correct: false, score: 10, feedback: "R$ 16M é a perda bruta de preço, mas esquece o spread de cupom recebido. Memória: (1) Perda de preço = −R$ 16M. (2) Spread = +R$ 2,6M. (3) Líquido = −R$ 13,4M. O carry parcialmente amortece a perda.", next: "resolution_trs" },
      ]},
      { id: "resolution_trs", type: "resolution", prompt: "1 ano se passou. Qual foi o desempenho da debênture?", scenarios: [
        { id: "valorizou", label: "Cenário A: Debênture valorizou 3% (spread comprimiu)", fixingRate: 3.0, description: "Crédito melhorou." },
        { id: "desvalorizou", label: "Cenário B: Debênture caiu 12% (rebaixamento + estresse)", fixingRate: -12.0, description: "Choque de crédito." },
        { id: "estavel", label: "Cenário C: Preço estável (sem variação)", fixingRate: 0.0, description: "Sem evento adverso." },
      ]},
    ],
  },
  {
    id: "cds_naked_soberano",
    title: "Naked CDS — Aposta contra o Soberano",
    theme: "Deriv. Crédito", themeId: "credito", instrument: "CDS Brasil 5Y",
    difficulty: "Avançado",
    creditStrategy: "cds_spec",
    context: {
      narrative: "Você é gestor(a) de um hedge fund global e analisa o **risco soberano do Brasil**. O CDS de 5 anos está em **180 bps**, mas sua análise sugere deterioração fiscal: déficit primário crescente, dívida/PIB em 85%, risco de rebaixamento. Sua projeção: spread vai **alargar para 350-400 bps** em 12 meses. Você NÃO detém títulos brasileiros — é um **'naked CDS'** (compra de proteção sem ativo subjacente). O limite de risco é **USD 5 milhões**. O DV01 do CDS (sensibilidade a 1bp) é **USD 4.500 por USD 10M de nocional**.",
      marketData: { nocional: 50000000, spreadBps: 180, targetBps: 375, dv01Per10M: 4500, prazoAnos: 5, stopLoss: 5000000, moeda: "USD" },
      displayFields: [["CDS Brasil 5Y", "180 bps"], ["Projeção", "350-400 bps"], ["Nocional", "USD 50M"], ["DV01 / USD 10M", "USD 4.500"], ["Stop loss", "USD 5M"], ["Tipo", "Naked CDS"]],
      question: "O risco fiscal está subestimado. Como apostar na deterioração do crédito soberano?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta operação?", choices: [
        { id: "speculation", label: "Especulação — apostar na deterioração do crédito soberano (alargamento do spread)", correct: true, score: 20, feedback: "Correto! Este é um 'naked CDS' — compra de proteção sem deter títulos brasileiros. É como comprar seguro de uma casa que não é sua: a motivação é puramente especulativa. No mercado de CDS, comprar proteção = apostar na piora do crédito. A posição lucra se o spread subir e perde se comprimir.", next: "strategy_naked" },
        { id: "hedge", label: "Hedge — proteger títulos brasileiros em carteira", correct: false, score: 5, feedback: "Não há títulos brasileiros na carteira. Se houvesse, seria hedge legítimo. Sem o ativo, comprar CDS é especulação pura — 'naked CDS'.", next: "strategy_naked" },
        { id: "arbitrage", label: "Arbitragem", correct: false, score: 0, feedback: "Não há distorção entre instrumentos a explorar. A tese é direcional: o spread do CDS Brasil está baixo demais dado o risco fiscal.", next: "strategy_naked" },
      ]},
      { id: "strategy_naked", type: "choice", prompt: "Para lucrar com o ALARGAMENTO do spread (piora do crédito), qual posição?", choices: [
        { id: "buy_usd", label: "Comprar proteção (pagar 180 bps) — lucra se spread alargar", correct: true, score: 25, feedback: "Memória de cálculo: (1) Custo anual (carry) = 180 bps × USD 50M = USD 900.000/ano. (2) DV01 total = USD 4.500 × (50M/10M) = USD 22.500 por 1bp de variação. (3) Se spread alargar de 180 para 375 bps (195 bps): ganho mark-to-market = USD 22.500 × 195 = USD 4.387.500. (4) Menos carry de ~12 meses = −USD 900.000. (5) Lucro líquido ≈ USD 3.487.500.", next: "contract_naked" },
        { id: "sell_usd", label: "Vender proteção (receber 180 bps) — lucra se spread comprimir", correct: false, score: 0, feedback: "Vender proteção = apostar na MELHORA do crédito brasileiro. Isso é o oposto da sua tese! Se o spread alargar, você perde; se houver default soberano, a perda é catastrófica.", next: "contract_naked" },
      ]},
      { id: "contract_naked", type: "choice", prompt: "O stop loss é USD 5M. No cenário adverso, o spread comprime de 180 para 80 bps (−100 bps). O nocional de USD 50M está adequado?", choices: [
        { id: "above_fwd", label: "Sim — perda seria USD 2,25M + carry, dentro do stop", correct: true, score: 20, feedback: "Memória de cálculo: (1) DV01 total = USD 22.500/bp. (2) Compressão de 100 bps → perda mark-to-market = USD 22.500 × 100 = USD 2.250.000. (3) Carry anual = USD 900.000. (4) Perda total (pior caso 12 meses) ≈ USD 3.150.000. (5) Stop loss = USD 5.000.000. (6) Margem restante = USD 1.850.000. (7) O spread precisaria comprimir ~222 bps para atingir o stop (impossível — iria a −42 bps). Nocional adequado.", next: "resolution_naked" },
        { id: "market_fwd", label: "Não — deveria reduzir para USD 20M", correct: false, score: 10, feedback: "Com USD 20M: DV01 = USD 9.000/bp. Perda no stress (−100bps) = USD 900.000 + carry USD 360k = USD 1.260.000. Muito conservador — usa apenas 25% do limite. Com USD 50M a perda total seria ~USD 3,15M, ainda dentro do stop de USD 5M.", next: "resolution_naked" },
        { id: "spot_rate", label: "Não — deveria aumentar para USD 150M", correct: false, score: 0, feedback: "Com USD 150M: DV01 = USD 67.500/bp. Perda no stress (−100bps) = USD 6.750.000 + carry USD 2.700.000 = USD 9.450.000. Estoura o stop de USD 5M em quase 2x!", next: "resolution_naked" },
      ]},
      { id: "resolution_naked", type: "resolution", prompt: "12 meses se passaram. O que aconteceu com o CDS Brasil?", scenarios: [
        { id: "alargou", label: "Cenário A: Spread alargou para 380 bps (crise fiscal)", fixingRate: 380, description: "Deterioração fiscal confirmada." },
        { id: "comprimiu", label: "Cenário B: Spread comprimiu para 110 bps (reformas aprovadas)", fixingRate: 110, description: "Reformas fiscais surpreenderam positivamente." },
        { id: "estavel", label: "Cenário C: Spread estável em 190 bps", fixingRate: 190, description: "Nem piora nem melhora significativa." },
      ]},
    ],
  },
  {
    id: "cds_basis_trade",
    title: "Super Desafio — CDS Basis Trade",
    theme: "Deriv. Crédito", themeId: "credito", instrument: "CDS Basis Trade",
    difficulty: "Super Desafio",
    creditStrategy: "basis_trade",
    context: {
      narrative: "Você é head de crédito proprietário do **Banco Meridional**. Analisando a **Mineradora Vale S.A.**, identifica uma distorção: a debênture VALE 2028 rende **CDI + 1,50%** (spread de crédito de **150 bps**), enquanto o CDS VALE 5 anos custa **210 bps**. Há uma **base negativa** (CDS > bond spread = 60 bps): o mercado de CDS precifica mais risco do que o de bonds. Historicamente, essa base converge. Você monta um **basis trade**: compra a debênture (financiada a CDI) e compra proteção via CDS, travando a diferença. O DV01 do CDS é **R$ 4.200 por R$ 10M de nocional**.",
      marketData: { nocional: 100000000, bondSpread: 150, cdsSpread: 210, base: 60, dv01Per10M: 4200, prazoAnos: 5 },
      displayFields: [["Debênture VALE", "CDI + 1,50%"], ["CDS VALE 5Y", "210 bps"], ["Base (CDS−bond)", "60 bps"], ["Nocional", "R$ 100M"], ["DV01 / R$ 10M", "R$ 4.200"], ["Carry", "−60 bps a.a."]],
      question: "O CDS está mais caro que o bond. Como capturar a convergência?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta oportunidade?", choices: [
        { id: "arbitrage", label: "Arbitragem de base — CDS spread (210 bps) acima do bond spread (150 bps); a base deve convergir", correct: true, score: 25, feedback: "Correto! A base negativa (CDS > bond) indica distorção. Memória de cálculo: (1) Bond spread = 150 bps (receita). (2) CDS spread = 210 bps (custo da proteção). (3) Base = 210 − 150 = 60 bps. (4) Carry líquido = +150 − 210 = −60 bps a.a. (carrego negativo). A posição paga para carregar, mas lucra quando a base converge — análogo à arbitragem de forward no NDF.", next: "strategy_basis" },
        { id: "speculation", label: "Especulação direcional em crédito", correct: false, score: 5, feedback: "O basis trade é neutro em crédito: se a Vale der default, a debênture perde valor mas o CDS indeniza. A aposta é na convergência da BASE, não na direção do crédito.", next: "strategy_basis" },
        { id: "hedge", label: "Hedge de carteira existente", correct: false, score: 0, feedback: "Não é hedge — é uma posição nova que combina compra de debênture + compra de CDS para capturar a distorção de preço relativo.", next: "strategy_basis" },
      ]},
      { id: "strategy_basis", type: "choice", prompt: "Como montar o basis trade?", choices: [
        { id: "buy_usd", label: "Comprar debênture VALE (CDI + 1,50%) + Comprar proteção CDS VALE (210 bps)", correct: true, score: 30, feedback: "Memória de cálculo: (1) Perna 1 — compra debênture a CDI + 150 bps, financiada a CDI (compromissada). Rendimento líquido = +150 bps. (2) Perna 2 — compra proteção CDS a 210 bps. Custo = −210 bps. (3) Carry líquido = +150 − 210 = −60 bps a.a. = −R$ 600.000/ano sobre R$ 100M. (4) A posição paga para carregar, mas se a base convergir (CDS cair para ~150 bps), o CDS ganha valor e o lucro compensa o carry. (5) Se houver default: perda na debênture é compensada pela indenização do CDS — posição neutra em crédito.", next: "contract_basis" },
        { id: "sell_usd", label: "Comprar debênture VALE sem proteção CDS", correct: false, score: 5, feedback: "Sem o CDS, é uma posição direcional longa em crédito VALE. Lucra se o crédito melhorar, mas perde tudo no default. O basis trade exige ambas as pernas para isolar a base.", next: "contract_basis" },
        { id: "sell_usd_teorico", label: "Apenas comprar CDS VALE (naked)", correct: false, score: 5, feedback: "Naked CDS = especulação na piora do crédito. É uma posição direcional, não arbitragem de base. O basis trade combina debênture + CDS para capturar a convergência da base, neutro em crédito.", next: "contract_basis" },
      ]},
      { id: "contract_basis", type: "choice", prompt: "O carry é −60 bps a.a. (= −R$ 600k/ano). O DV01 do CDS = R$ 4.200 por R$ 10M. Se a base fechar totalmente (CDS cai 60 bps), em quantos meses o ganho paga o carry?", choices: [
        { id: "above_fwd", label: "~2,9 meses", correct: true, score: 20, feedback: "Memória de cálculo: (1) Carry mensal = R$ 600.000 ÷ 12 = R$ 50.000/mês. (2) DV01 total = R$ 4.200 × (100M ÷ 10M) = R$ 42.000 por 1bp. (3) Ganho se base fechar 60 bps = R$ 42.000 × 60 = R$ 2.520.000. (4) Breakeven = R$ 600.000 ÷ R$ 2.520.000 = 0,238 anos ≈ 2,86 meses. Se a base convergir em menos de ~3 meses, a operação já dá lucro. A convergência pode ocorrer a qualquer momento — é aposta de valor relativo, não de prazo fixo.", next: "resolution_basis" },
        { id: "market_fwd", label: "12 meses", correct: false, score: 5, feedback: "12 meses assume que o ganho só ocorre no vencimento. Memória: DV01 total = R$ 42.000/bp. Ganho se base fechar = R$ 42.000 × 60 = R$ 2.520.000. Carry anual = R$ 600.000. Breakeven = R$ 600k ÷ R$ 2.520k = 2,9 meses. A convergência pode ocorrer muito antes do vencimento.", next: "resolution_basis" },
        { id: "spot_rate", label: "Nunca — o carry negativo sempre supera o ganho", correct: false, score: 0, feedback: "Incorreto. O carry de −R$ 600k/ano é linear, mas o ganho de convergência (R$ 2.520.000 para 60 bps) é de uma só vez. O breakeven é ~2,9 meses. O maior risco não é o carry, é a base NÃO convergir (timing risk).", next: "resolution_basis" },
      ]},
      { id: "resolution_basis", type: "resolution", prompt: "Meses se passaram. O que aconteceu com a base CDS-bond?", scenarios: [
        { id: "convergiu", label: "Cenário A: Base convergiu — CDS caiu para 155 bps em 4 meses", fixingRate: 155, description: "A base fechou de 60 para 5 bps." },
        { id: "divergiu", label: "Cenário B: Base divergiu — CDS subiu para 300 bps (estresse)", fixingRate: 300, description: "Estresse de crédito elevou o CDS mas a debênture também caiu." },
        { id: "estavel", label: "Cenário C: Base estável em 55 bps por 1 ano", fixingRate: 205, description: "Pouca convergência." },
      ]},
    ],
  },
];

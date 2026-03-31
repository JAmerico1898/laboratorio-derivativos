import type { Scenario } from "../../types/scenario";

export const NDF_SCENARIOS: Scenario[] = [
  {
    id: "ndf_hedge_exportador",
    title: "Hedge Cambial — Exportador",
    theme: "Termos (NDF)", themeId: "ndf", instrument: "NDF",
    difficulty: "Intermediário",
    context: {
      narrative: "Você é tesoureiro(a) da **AgroBrasil S.A.**, uma exportadora de commodities agrícolas. A empresa fechou um contrato de exportação de soja no valor de **USD 5 milhões**, com recebimento em **90 dias**. O dólar spot está em **R$ 5,20** e o mercado projeta volatilidade cambial devido a incertezas políticas.",
      marketData: { spotRate: 5.20, forwardRate90d: 5.28, cdiRate: 0.1175, cupomCambial: 0.045, notional_usd: 5000000, tenor: 90 },
      displayFields: [["Spot", "R$ 5,2000"], ["Forward 90d", "R$ 5,2800"], ["Nocional", "USD 5M"], ["Prazo", "90 dias"]],
      question: "O risco cambial é real: se o dólar cair, seus recebíveis em reais diminuem.",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é sua motivação ao usar um derivativo neste caso?", choices: [
        { id: "hedge", label: "Hedge — proteger o valor dos recebíveis", correct: true, score: 20, feedback: "Correto! Como exportador com recebíveis em USD, o risco é a queda do dólar. Hedge é a motivação natural.", next: "strategy" },
        { id: "speculation", label: "Especulação — apostar na direção do câmbio", correct: false, score: 5, feedback: "A especulação é possível, mas como tesoureiro de uma empresa com exposição real em USD, a prioridade deveria ser proteger o fluxo de caixa.", next: "strategy" },
        { id: "arbitrage", label: "Arbitragem — explorar diferenças de preço", correct: false, score: 0, feedback: "Arbitragem exigiria acesso simultâneo a dois mercados com preços inconsistentes. Aqui, você tem uma exposição real a gerenciar.", next: "strategy" },
      ]},
      { id: "strategy", type: "choice", prompt: "Qual posição você toma no NDF de dólar?", choices: [
        { id: "sell_usd", label: "Vender USD a termo (travar a venda de dólares no futuro)", correct: true, score: 25, feedback: "Exato! Você vai receber USD no futuro, então vende USD a termo para travar a taxa de conversão.", next: "contract" },
        { id: "buy_usd", label: "Comprar USD a termo (travar a compra de dólares no futuro)", correct: false, score: 0, feedback: "Cuidado! Comprar USD a termo é o hedge de quem tem dívida em dólar (importador). Você é exportador — vai receber USD.", next: "contract" },
      ]},
      { id: "contract", type: "choice", prompt: "Qual taxa de NDF você contrata?", choices: [
        { id: "market_fwd", label: "NDF à taxa de mercado: R$ 5,28 / USD (90 dias)", correct: true, score: 20, feedback: "A taxa forward de R$ 5,28 reflete o diferencial de juros (CDI vs cupom cambial). É o preço justo de mercado.", next: "resolution" },
        { id: "spot_rate", label: "NDF à taxa spot: R$ 5,20 / USD", correct: false, score: 5, feedback: "A taxa spot não está disponível para um contrato a termo. O NDF embute o diferencial de juros.", next: "resolution" },
        { id: "above_fwd", label: "NDF a R$ 5,35 / USD (acima do forward)", correct: false, score: 10, feedback: "Uma taxa de R$ 5,35 seria acima do forward de mercado. Dificilmente uma contraparte aceitaria.", next: "resolution" },
      ]},
      { id: "resolution", type: "resolution", prompt: "90 dias se passaram. Chegou a data de fixing do NDF.", scenarios: [
        { id: "dolar_caiu", label: "Cenário A: Dólar caiu para R$ 4,90", fixingRate: 4.90, description: "A moeda americana recuou com o fluxo de investimentos estrangeiros e a melhora do cenário fiscal." },
        { id: "dolar_subiu", label: "Cenário B: Dólar subiu para R$ 5,55", fixingRate: 5.55, description: "O dólar disparou com a escalada de tensões geopolíticas e saída de capitais de emergentes." },
        { id: "dolar_estavel", label: "Cenário C: Dólar ficou estável em R$ 5,25", fixingRate: 5.25, description: "O mercado cambial operou em faixa estreita." },
      ]},
    ],
  },
  {
    id: "ndf_especulacao",
    title: "Especulação Cambial — Gestor de Fundo",
    theme: "Termos (NDF)", themeId: "ndf", instrument: "NDF",
    difficulty: "Avançado",
    context: {
      narrative: "Você é gestor(a) de um fundo multimercado e acredita que o **real vai se valorizar** nos próximos 60 dias, com o dólar caindo dos atuais **R$ 5,30** para algo em torno de **R$ 5,00**. Sua tese é baseada na expectativa de corte de juros nos EUA e fluxo de capital para emergentes.",
      marketData: { spotRate: 5.30, forwardRate90d: 5.36, cdiRate: 0.1175, cupomCambial: 0.045, notional_usd: 10000000, tenor: 60 },
      displayFields: [["Spot", "R$ 5,3000"], ["Forward 60d", "R$ 5,3600"], ["Nocional", "USD 10M"], ["Prazo", "60 dias"]],
      question: "Você tem convicção na queda do dólar. Como estruturar uma posição especulativa?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é sua motivação ao usar o NDF aqui?", choices: [
        { id: "speculation", label: "Especulação — lucrar com a queda esperada do dólar", correct: true, score: 20, feedback: "Correto! Não há exposição cambial subjacente. A motivação é puramente direcional.", next: "strategy" },
        { id: "hedge", label: "Hedge — proteger uma carteira existente", correct: false, score: 5, feedback: "Não há ativo ou passivo em moeda estrangeira a proteger. A posição é puramente especulativa.", next: "strategy" },
        { id: "arbitrage", label: "Arbitragem — explorar mispricing entre mercados", correct: false, score: 0, feedback: "Sua tese é direcional (dólar vai cair), o que caracteriza especulação, não arbitragem.", next: "strategy" },
      ]},
      { id: "strategy", type: "choice", prompt: "Para lucrar com a queda do dólar, qual posição no NDF?", choices: [
        { id: "sell_usd", label: "Vender USD a termo — lucro se dólar cair abaixo do forward", correct: true, score: 25, feedback: "Perfeito! Vendendo USD a termo, se o fixing vier abaixo dessa taxa, você recebe a diferença.", next: "contract" },
        { id: "buy_usd", label: "Comprar USD a termo — lucro se dólar subir acima do forward", correct: false, score: 0, feedback: "Comprar USD a termo lucra quando o dólar sobe. Mas sua tese é de queda!", next: "contract" },
      ]},
      { id: "contract", type: "choice", prompt: "Qual nocional para a posição? O patrimônio líquido do fundo é R$ 200 milhões.", choices: [
        { id: "conservative", label: "USD 2 milhões (~5% do PL) — posição conservadora", correct: false, score: 10, feedback: "5% do PL é bastante conservadora para um multimercado com convicção. Limita o upside.", next: "resolution_spec" },
        { id: "moderate", label: "USD 10 milhões (~25% do PL) — posição moderada", correct: true, score: 20, feedback: "~25% do PL é consistente com uma tese de convicção. Permite capturar o movimento sem comprometer o patrimônio.", next: "resolution_spec" },
        { id: "aggressive", label: "USD 30 milhões (~80% do PL) — posição agressiva", correct: false, score: 5, feedback: "80% do PL em uma posição direcional é extremamente agressivo e provavelmente viola a política de risco.", next: "resolution_spec" },
      ]},
      { id: "resolution_spec", type: "resolution", prompt: "60 dias se passaram. O fixing do NDF chegou.", scenarios: [
        { id: "dolar_caiu_forte", label: "Cenário A: Dólar caiu para R$ 4,95 (tese acertou!)", fixingRate: 4.95, description: "O Fed cortou juros e o fluxo para emergentes veio forte. O real se valorizou." },
        { id: "dolar_subiu", label: "Cenário B: Dólar subiu para R$ 5,60 (tese errou)", fixingRate: 5.60, description: "Crise geopolítica provocou fuga de capitais e o dólar disparou." },
        { id: "dolar_estavel", label: "Cenário C: Dólar estável em R$ 5,32", fixingRate: 5.32, description: "O mercado andou de lado. Efeito neutro." },
      ]},
    ],
  },
  {
    id: "ndf_importador",
    title: "Hedge Cambial — Importador de Tecnologia",
    theme: "Termos (NDF)", themeId: "ndf", instrument: "NDF",
    difficulty: "Intermediário",
    context: {
      narrative: "Você é CFO da **TechImport Ltda.**, que importa componentes eletrônicos da Ásia. Um pedido de **USD 3 milhões** foi feito, com pagamento em **120 dias**. O dólar spot está em **R$ 5,15**. Se o dólar subir, seu custo em reais aumenta e a margem cai.",
      marketData: { spotRate: 5.15, forwardRate90d: 5.25, cdiRate: 0.1175, cupomCambial: 0.045, notional_usd: 3000000, tenor: 120 },
      displayFields: [["Spot", "R$ 5,1500"], ["Forward 120d", "R$ 5,2500"], ["Nocional", "USD 3M"], ["Prazo", "120 dias"]],
      question: "Você precisa pagar USD no futuro. Como proteger esse passivo cambial?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual a motivação da operação com derivativo?", choices: [
        { id: "hedge", label: "Hedge — travar o custo da importação em reais", correct: true, score: 20, feedback: "Exato! Como importador com pagamento futuro em USD, o risco é a alta do dólar.", next: "strategy_imp" },
        { id: "speculation", label: "Especulação — apostar que o dólar vai cair", correct: false, score: 5, feedback: "Especular significaria não se proteger. Se o dólar subir, o custo explode.", next: "strategy_imp" },
        { id: "arbitrage", label: "Arbitragem", correct: false, score: 0, feedback: "Não há oportunidade de arbitragem. Você tem uma exposição real.", next: "strategy_imp" },
      ]},
      { id: "strategy_imp", type: "choice", prompt: "Qual posição no NDF para proteger o pagamento futuro?", choices: [
        { id: "buy_usd", label: "Comprar USD a termo — travar o preço de compra dos dólares", correct: true, score: 25, feedback: "Perfeito! Como importador, comprando a termo trava a taxa de conversão.", next: "contract_imp" },
        { id: "sell_usd", label: "Vender USD a termo", correct: false, score: 0, feedback: "Vender USD a termo é hedge de exportador. Você é importador!", next: "contract_imp" },
      ]},
      { id: "contract_imp", type: "choice", prompt: "Devemos fazer hedge de 100% do valor ou parcial?", choices: [
        { id: "full_hedge", label: "100% — proteger todo o nocional de USD 3 milhões", correct: true, score: 20, feedback: "Para uma empresa não-financeira, 100% é a prática mais conservadora e recomendada.", next: "resolution_imp" },
        { id: "partial_hedge", label: "50% — proteger USD 1,5 milhão e deixar o resto aberto", correct: false, score: 10, feedback: "Hedge parcial mistura hedge com especulação — a parcela aberta continua exposta.", next: "resolution_imp" },
        { id: "no_hedge", label: "0% — não fazer hedge", correct: false, score: 0, feedback: "100% aberto é pura especulação cambial. A diretoria pediu proteção.", next: "resolution_imp" },
      ]},
      { id: "resolution_imp", type: "resolution", prompt: "120 dias se passaram. Hora de pagar a importação.", scenarios: [
        { id: "dolar_subiu", label: "Cenário A: Dólar subiu para R$ 5,60", fixingRate: 5.60, description: "O dólar valorizou com a alta de juros nos EUA. Importadores não-protegidos viram custos disparar." },
        { id: "dolar_caiu", label: "Cenário B: Dólar caiu para R$ 4,85", fixingRate: 4.85, description: "Investimento estrangeiro e superávit comercial derrubaram o câmbio." },
        { id: "dolar_neutro", label: "Cenário C: Dólar ficou em R$ 5,20", fixingRate: 5.20, description: "O câmbio oscilou pouco." },
      ]},
    ],
  },
  {
    id: "ndf_super_desafio",
    title: "Super Desafio — Arbitragem de Taxa Forward",
    theme: "Termos (NDF)", themeId: "ndf", instrument: "NDF",
    difficulty: "Super Desafio",
    context: {
      narrative: "Você é trader de câmbio no **Banco Atlântico**. O NDF de 90 dias de USD/BRL está cotado a **R$ 5,42** no mercado interbancário, mas o forward teórico (paridade coberta de juros) é **R$ 5,32**. As demais informações do mercado são: CDI em **11,75% a.a.**, cupom cambial **4,5% a.a.**, spot **R$ 5,20**. Nocional: **USD 20 milhões**.",
      marketData: { spotRate: 5.20, forwardRate90d: 5.32, forwardMercado: 5.42, cdiRate: 0.1175, cupomCambial: 0.045, notional_usd: 20000000, tenor: 90 },
      displayFields: [["Spot", "R$ 5,2000"], ["Fwd Teórico", "R$ 5,3200"], ["Fwd Mercado", "R$ 5,4200"], ["Nocional", "USD 20M"], ["Prazo", "90 dias"]],
      question: "O forward de mercado diverge do forward teórico. Como capturar esse spread?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta oportunidade?", choices: [
        { id: "arbitrage", label: "Arbitragem — o forward de mercado está acima do forward teórico", correct: true, score: 25, feedback: "Exato! O spread de R$ 0,10 por dólar é o lucro potencial da arbitragem.", next: "strategy_arb" },
        { id: "speculation", label: "Especulação — apostar na convergência", correct: false, score: 10, feedback: "A oportunidade central é de arbitragem, não direcional. A estratégia correta trava o spread sem risco.", next: "strategy_arb" },
        { id: "hedge", label: "Hedge — proteger posição do banco", correct: false, score: 0, feedback: "Não há exposição pré-existente a proteger.", next: "strategy_arb" },
      ]},
      { id: "strategy_arb", type: "choice", prompt: "Forward de mercado (R$ 5,42) acima do teórico (R$ 5,32). Qual estratégia?", choices: [
        { id: "sell_usd", label: "Vender USD a termo a R$ 5,42 e montar o sintético comprado a R$ 5,32", correct: true, score: 30, feedback: "Perfeito! Vende no preço inflado, monta a posição sintética oposta. Lucro travado: R$ 0,10/USD × 20M = R$ 2 milhões.", next: "contract_arb" },
        { id: "buy_usd", label: "Comprar USD a termo a R$ 5,42", correct: false, score: 0, feedback: "Comprar no forward caro é o contrário do que a arbitragem exige.", next: "contract_arb" },
        { id: "sell_usd_teorico", label: "Vender USD a termo ao preço teórico de R$ 5,32", correct: false, score: 5, feedback: "R$ 5,32 não é um preço disponível no mercado — é o teórico. A arbitragem vende no preço de mercado.", next: "contract_arb" },
      ]},
      { id: "contract_arb", type: "choice", prompt: "Além do NDF vendido a R$ 5,42, como você montaria o sintético comprado a R$ 5,32?", choices: [
        { id: "sintetico_completo", label: "Tomar CDI emprestado, comprar USD spot, aplicar no cupom cambial", correct: true, score: 30, feedback: "Excelente! A perna sintética completa a arbitragem sem risco direcional.", next: "resolution_arb" },
        { id: "apenas_ndf", label: "Nada mais — o NDF vendido basta", correct: false, score: 0, feedback: "Apenas o NDF cria posição direcional vendida. Precisa da perna sintética.", next: "resolution_arb" },
        { id: "outro_ndf", label: "Comprar outro NDF de prazo diferente", correct: false, score: 5, feedback: "Prazo diferente cria risco de basis. A perna correta é o sintético.", next: "resolution_arb" },
      ]},
      { id: "resolution_arb", type: "resolution", prompt: "90 dias se passaram. Liquidação.", scenarios: [
        { id: "dolar_caiu_forte", label: "Cenário A: Dólar caiu para R$ 4,80", fixingRate: 4.80, description: "O dólar despencou. A arbitragem, neutra em direção, depende apenas do spread travado." },
        { id: "dolar_subiu_forte", label: "Cenário B: Dólar subiu para R$ 5,80", fixingRate: 5.80, description: "Crise bancária levou o dólar às máximas. A arbitragem não é afetada pelo nível do fixing." },
        { id: "dolar_no_forward", label: "Cenário C: Dólar estável em R$ 5,35", fixingRate: 5.35, description: "O lucro da arbitragem permanece travado independentemente do fixing." },
      ]},
    ],
  },
];

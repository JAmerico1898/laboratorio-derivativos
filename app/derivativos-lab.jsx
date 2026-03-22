import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Area, AreaChart, Legend
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   TEMAS DISPONÍVEIS
   ═══════════════════════════════════════════════════════════════ */

const THEMES = [
  { id: "ndf", label: "Termos (NDF)", icon: "📄" },
  { id: "futuros", label: "Futuros", icon: "📈" },
  { id: "swaps", label: "Swaps", icon: "🔄" },
  { id: "opcoes", label: "Opções", icon: "🎯" },
  { id: "credito", label: "Deriv. Crédito", icon: "🛡️" },
  { id: "embutidos", label: "Embutidos", icon: "🧩" },
];

/* ═══════════════════════════════════════════════════════════════
   BANCO DE CENÁRIOS — NDF
   ═══════════════════════════════════════════════════════════════ */

const NDF_SCENARIOS = [
  {
    id: "ndf_hedge_exportador",
    title: "Hedge Cambial — Exportador",
    theme: "Termos (NDF)", themeId: "ndf", instrument: "NDF",
    difficulty: "Intermediário",
    context: {
      narrative: "Você é tesoureiro(a) da **AgroBrasil S.A.**, uma exportadora de commodities agrícolas. A empresa fechou um contrato de exportação de soja no valor de **USD 5 milhões**, com recebimento em **90 dias**. O dólar spot está em **R$ 5,20** e o mercado projeta volatilidade cambial devido a incertezas políticas.",
      marketData: { spotRate: 5.20, forwardRate90d: 5.28, cdiRate: 0.1175, cupomCambial: 0.045, notional_usd: 5000000, tenor: 90 },
      displayFields: [["Spot", "R$ 5,2000"], ["Forward 90d", "R$ 5,2800"], ["Nocional", "USD 5M"], ["Prazo", "90 dias"]],
      question: "O risco cambial é real: se o dólar cair, seus recebíveis em reais diminuem."
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é sua motivação ao usar um derivativo neste caso?", choices: [
        { id: "hedge", label: "Hedge — proteger o valor dos recebíveis", correct: true, score: 20, feedback: "Correto! Como exportador com recebíveis em USD, o risco é a queda do dólar. Hedge é a motivação natural.", next: "strategy" },
        { id: "speculation", label: "Especulação — apostar na direção do câmbio", correct: false, score: 5, feedback: "A especulação é possível, mas como tesoureiro de uma empresa com exposição real em USD, a prioridade deveria ser proteger o fluxo de caixa.", next: "strategy" },
        { id: "arbitrage", label: "Arbitragem — explorar diferenças de preço", correct: false, score: 0, feedback: "Arbitragem exigiria acesso simultâneo a dois mercados com preços inconsistentes. Aqui, você tem uma exposição real a gerenciar.", next: "strategy" }
      ]},
      { id: "strategy", type: "choice", prompt: "Qual posição você toma no NDF de dólar?", choices: [
        { id: "sell_usd", label: "Vender USD a termo (travar a venda de dólares no futuro)", correct: true, score: 25, feedback: "Exato! Você vai receber USD no futuro, então vende USD a termo para travar a taxa de conversão.", next: "contract" },
        { id: "buy_usd", label: "Comprar USD a termo (travar a compra de dólares no futuro)", correct: false, score: 0, feedback: "Cuidado! Comprar USD a termo é o hedge de quem tem dívida em dólar (importador). Você é exportador — vai receber USD.", next: "contract" }
      ]},
      { id: "contract", type: "choice", prompt: "Qual taxa de NDF você contrata?", choices: [
        { id: "market_fwd", label: "NDF à taxa de mercado: R$ 5,28 / USD (90 dias)", correct: true, score: 20, feedback: "A taxa forward de R$ 5,28 reflete o diferencial de juros (CDI vs cupom cambial). É o preço justo de mercado.", next: "resolution" },
        { id: "spot_rate", label: "NDF à taxa spot: R$ 5,20 / USD", correct: false, score: 5, feedback: "A taxa spot não está disponível para um contrato a termo. O NDF embute o diferencial de juros.", next: "resolution" },
        { id: "above_fwd", label: "NDF a R$ 5,35 / USD (acima do forward)", correct: false, score: 10, feedback: "Uma taxa de R$ 5,35 seria acima do forward de mercado. Dificilmente uma contraparte aceitaria.", next: "resolution" }
      ]},
      { id: "resolution", type: "resolution", prompt: "90 dias se passaram. Chegou a data de fixing do NDF.", scenarios: [
        { id: "dolar_caiu", label: "Cenário A: Dólar caiu para R$ 4,90", fixingRate: 4.90, description: "A moeda americana recuou com o fluxo de investimentos estrangeiros e a melhora do cenário fiscal." },
        { id: "dolar_subiu", label: "Cenário B: Dólar subiu para R$ 5,55", fixingRate: 5.55, description: "O dólar disparou com a escalada de tensões geopolíticas e saída de capitais de emergentes." },
        { id: "dolar_estavel", label: "Cenário C: Dólar ficou estável em R$ 5,25", fixingRate: 5.25, description: "O mercado cambial operou em faixa estreita." }
      ]}
    ]
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
      question: "Você tem convicção na queda do dólar. Como estruturar uma posição especulativa?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é sua motivação ao usar o NDF aqui?", choices: [
        { id: "speculation", label: "Especulação — lucrar com a queda esperada do dólar", correct: true, score: 20, feedback: "Correto! Não há exposição cambial subjacente. A motivação é puramente direcional.", next: "strategy" },
        { id: "hedge", label: "Hedge — proteger uma carteira existente", correct: false, score: 5, feedback: "Não há ativo ou passivo em moeda estrangeira a proteger. A posição é puramente especulativa.", next: "strategy" },
        { id: "arbitrage", label: "Arbitragem — explorar mispricing entre mercados", correct: false, score: 0, feedback: "Sua tese é direcional (dólar vai cair), o que caracteriza especulação, não arbitragem.", next: "strategy" }
      ]},
      { id: "strategy", type: "choice", prompt: "Para lucrar com a queda do dólar, qual posição no NDF?", choices: [
        { id: "sell_usd", label: "Vender USD a termo — lucro se dólar cair abaixo do forward", correct: true, score: 25, feedback: "Perfeito! Vendendo USD a termo, se o fixing vier abaixo dessa taxa, você recebe a diferença.", next: "contract" },
        { id: "buy_usd", label: "Comprar USD a termo — lucro se dólar subir acima do forward", correct: false, score: 0, feedback: "Comprar USD a termo lucra quando o dólar sobe. Mas sua tese é de queda!", next: "contract" }
      ]},
      { id: "contract", type: "choice", prompt: "Qual nocional para a posição? O patrimônio líquido do fundo é R$ 200 milhões.", choices: [
        { id: "conservative", label: "USD 2 milhões (~5% do PL) — posição conservadora", correct: false, score: 10, feedback: "5% do PL é bastante conservadora para um multimercado com convicção. Limita o upside.", next: "resolution_spec" },
        { id: "moderate", label: "USD 10 milhões (~25% do PL) — posição moderada", correct: true, score: 20, feedback: "~25% do PL é consistente com uma tese de convicção. Permite capturar o movimento sem comprometer o patrimônio.", next: "resolution_spec" },
        { id: "aggressive", label: "USD 30 milhões (~80% do PL) — posição agressiva", correct: false, score: 5, feedback: "80% do PL em uma posição direcional é extremamente agressivo e provavelmente viola a política de risco.", next: "resolution_spec" }
      ]},
      { id: "resolution_spec", type: "resolution", prompt: "60 dias se passaram. O fixing do NDF chegou.", scenarios: [
        { id: "dolar_caiu_forte", label: "Cenário A: Dólar caiu para R$ 4,95 (tese acertou!)", fixingRate: 4.95, description: "O Fed cortou juros e o fluxo para emergentes veio forte. O real se valorizou." },
        { id: "dolar_subiu", label: "Cenário B: Dólar subiu para R$ 5,60 (tese errou)", fixingRate: 5.60, description: "Crise geopolítica provocou fuga de capitais e o dólar disparou." },
        { id: "dolar_estavel", label: "Cenário C: Dólar estável em R$ 5,32", fixingRate: 5.32, description: "O mercado andou de lado. Efeito neutro." }
      ]}
    ]
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
      question: "Você precisa pagar USD no futuro. Como proteger esse passivo cambial?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual a motivação da operação com derivativo?", choices: [
        { id: "hedge", label: "Hedge — travar o custo da importação em reais", correct: true, score: 20, feedback: "Exato! Como importador com pagamento futuro em USD, o risco é a alta do dólar.", next: "strategy_imp" },
        { id: "speculation", label: "Especulação — apostar que o dólar vai cair", correct: false, score: 5, feedback: "Especular significaria não se proteger. Se o dólar subir, o custo explode.", next: "strategy_imp" },
        { id: "arbitrage", label: "Arbitragem", correct: false, score: 0, feedback: "Não há oportunidade de arbitragem. Você tem uma exposição real.", next: "strategy_imp" }
      ]},
      { id: "strategy_imp", type: "choice", prompt: "Qual posição no NDF para proteger o pagamento futuro?", choices: [
        { id: "buy_usd", label: "Comprar USD a termo — travar o preço de compra dos dólares", correct: true, score: 25, feedback: "Perfeito! Como importador, comprando a termo trava a taxa de conversão.", next: "contract_imp" },
        { id: "sell_usd", label: "Vender USD a termo", correct: false, score: 0, feedback: "Vender USD a termo é hedge de exportador. Você é importador!", next: "contract_imp" }
      ]},
      { id: "contract_imp", type: "choice", prompt: "Devemos fazer hedge de 100% do valor ou parcial?", choices: [
        { id: "full_hedge", label: "100% — proteger todo o nocional de USD 3 milhões", correct: true, score: 20, feedback: "Para uma empresa não-financeira, 100% é a prática mais conservadora e recomendada.", next: "resolution_imp" },
        { id: "partial_hedge", label: "50% — proteger USD 1,5 milhão e deixar o resto aberto", correct: false, score: 10, feedback: "Hedge parcial mistura hedge com especulação — a parcela aberta continua exposta.", next: "resolution_imp" },
        { id: "no_hedge", label: "0% — não fazer hedge", correct: false, score: 0, feedback: "100% aberto é pura especulação cambial. A diretoria pediu proteção.", next: "resolution_imp" }
      ]},
      { id: "resolution_imp", type: "resolution", prompt: "120 dias se passaram. Hora de pagar a importação.", scenarios: [
        { id: "dolar_subiu", label: "Cenário A: Dólar subiu para R$ 5,60", fixingRate: 5.60, description: "O dólar valorizou com a alta de juros nos EUA. Importadores não-protegidos viram custos disparar." },
        { id: "dolar_caiu", label: "Cenário B: Dólar caiu para R$ 4,85", fixingRate: 4.85, description: "Investimento estrangeiro e superávit comercial derrubaram o câmbio." },
        { id: "dolar_neutro", label: "Cenário C: Dólar ficou em R$ 5,20", fixingRate: 5.20, description: "O câmbio oscilou pouco." }
      ]}
    ]
  },
  {
    id: "ndf_super_desafio",
    title: "Super Desafio — Arbitragem de Taxa Forward",
    theme: "Termos (NDF)", themeId: "ndf", instrument: "NDF",
    difficulty: "Super Desafio",
    context: {
      narrative: "Você é trader de câmbio no **Banco Atlântico**. O NDF de 90 dias de USD/BRL está cotado a **R$ 5,42** no mercado interbancário, mas o forward teórico (paridade coberta de juros) é **R$ 5,32**. CDI em **11,75% a.a.**, cupom cambial **4,5% a.a.**, spot **R$ 5,20**. Nocional: **USD 20 milhões**.",
      marketData: { spotRate: 5.20, forwardRate90d: 5.32, forwardMercado: 5.42, cdiRate: 0.1175, cupomCambial: 0.045, notional_usd: 20000000, tenor: 90 },
      displayFields: [["Spot", "R$ 5,2000"], ["Fwd Teórico", "R$ 5,3200"], ["Fwd Mercado", "R$ 5,4200"], ["Nocional", "USD 20M"], ["Prazo", "90 dias"]],
      question: "O forward de mercado diverge do forward teórico. Como capturar esse spread?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta oportunidade?", choices: [
        { id: "arbitrage", label: "Arbitragem — o forward de mercado está acima do forward teórico", correct: true, score: 25, feedback: "Exato! O spread de R$ 0,10 por dólar é o lucro potencial da arbitragem.", next: "strategy_arb" },
        { id: "speculation", label: "Especulação — apostar na convergência", correct: false, score: 10, feedback: "A oportunidade central é de arbitragem, não direcional. A estratégia correta trava o spread sem risco.", next: "strategy_arb" },
        { id: "hedge", label: "Hedge — proteger posição do banco", correct: false, score: 0, feedback: "Não há exposição pré-existente a proteger.", next: "strategy_arb" }
      ]},
      { id: "strategy_arb", type: "choice", prompt: "Forward de mercado (R$ 5,42) acima do teórico (R$ 5,32). Qual estratégia?", choices: [
        { id: "sell_usd", label: "Vender USD a termo a R$ 5,42 e montar o sintético comprado a R$ 5,32", correct: true, score: 30, feedback: "Perfeito! Vende no preço inflado, monta a posição sintética oposta. Lucro travado: R$ 0,10/USD × 20M = R$ 2 milhões.", next: "contract_arb" },
        { id: "buy_usd", label: "Comprar USD a termo a R$ 5,42", correct: false, score: 0, feedback: "Comprar no forward caro é o contrário do que a arbitragem exige.", next: "contract_arb" },
        { id: "sell_usd_teorico", label: "Vender USD a termo ao preço teórico de R$ 5,32", correct: false, score: 5, feedback: "R$ 5,32 não é um preço disponível no mercado — é o teórico. A arbitragem vende no preço de mercado.", next: "contract_arb" }
      ]},
      { id: "contract_arb", type: "choice", prompt: "Além do NDF vendido a R$ 5,42, o que mais?", choices: [
        { id: "sintetico_completo", label: "Tomar CDI emprestado, comprar USD spot, aplicar no cupom cambial", correct: true, score: 30, feedback: "Excelente! A perna sintética completa a arbitragem sem risco direcional.", next: "resolution_arb" },
        { id: "apenas_ndf", label: "Nada mais — o NDF vendido basta", correct: false, score: 0, feedback: "Apenas o NDF cria posição direcional vendida. Precisa da perna sintética.", next: "resolution_arb" },
        { id: "outro_ndf", label: "Comprar outro NDF de prazo diferente", correct: false, score: 5, feedback: "Prazo diferente cria risco de basis. A perna correta é o sintético.", next: "resolution_arb" }
      ]},
      { id: "resolution_arb", type: "resolution", prompt: "90 dias se passaram. Liquidação.", scenarios: [
        { id: "dolar_caiu_forte", label: "Cenário A: Dólar caiu para R$ 4,80", fixingRate: 4.80, description: "O dólar despencou. A arbitragem, neutra em direção, depende apenas do spread travado." },
        { id: "dolar_subiu_forte", label: "Cenário B: Dólar subiu para R$ 5,80", fixingRate: 5.80, description: "Crise bancária levou o dólar às máximas. A arbitragem não é afetada pelo nível do fixing." },
        { id: "dolar_no_forward", label: "Cenário C: Dólar estável em R$ 5,35", fixingRate: 5.35, description: "O lucro da arbitragem permanece travado independentemente do fixing." }
      ]}
    ]
  }
];

/* ═══════════════════════════════════════════════════════════════
   BANCO DE CENÁRIOS — FUTUROS
   ═══════════════════════════════════════════════════════════════ */

const FUTUROS_SCENARIOS = [
  {
    id: "fut_hedge_di",
    title: "Hedge de Taxa de Juros — Fundo de Renda Fixa",
    theme: "Futuros", themeId: "futuros", instrument: "Futuro de DI",
    difficulty: "Intermediário",
    context: {
      narrative: "Você é gestor(a) de um fundo de renda fixa com **R$ 500 milhões** em títulos prefixados (NTN-F e LTN) com duration média de **3 anos**. O CDI está em **11,75% a.a.** e o DI futuro de Jan/28 está em **12,50% a.a.**. O Copom se reúne em 2 semanas e o mercado está dividido entre manutenção e alta de 50bps. Se os juros subirem, seus títulos perdem valor.",
      marketData: { spotRate: 11.75, forwardRate90d: 12.50, cdiRate: 0.1175, notional_usd: 5000, tenor: 252 },
      displayFields: [["CDI atual", "11,75% a.a."], ["DI Jan/28", "12,50% a.a."], ["PL Fundo", "R$ 500M"], ["Duration", "3 anos"], ["DU até Jan/28", "630 d.u."]],
      question: "Seus títulos prefixados perdem valor quando os juros sobem. Como proteger a carteira?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é sua motivação ao operar DI futuro?", choices: [
        { id: "hedge", label: "Hedge — proteger a carteira prefixada contra alta de juros", correct: true, score: 20, feedback: "Correto! A carteira é prefixada e perde valor quando os juros sobem. O DI futuro permite neutralizar esse risco.", next: "strategy_di" },
        { id: "speculation", label: "Especulação — apostar na direção dos juros", correct: false, score: 5, feedback: "Há uma exposição real a proteger. A diretoria espera proteção, não especulação.", next: "strategy_di" },
        { id: "arbitrage", label: "Arbitragem — explorar diferenças entre DI e CDI", correct: false, score: 0, feedback: "Não há distorção de preço evidente. O cenário é de risco de mercado sobre uma carteira existente.", next: "strategy_di" }
      ]},
      { id: "strategy_di", type: "choice", prompt: "Para proteger contra a ALTA de juros, qual posição no DI futuro? Convenção: 'comprar taxa' = ganhar com a alta dos juros; 'vender taxa' = ganhar com a queda dos juros.", choices: [
        { id: "buy_usd", label: "Comprar taxa de juros no DI futuro — lucra se juros subirem", correct: true, score: 25, feedback: "Perfeito! Comprar taxa no DI futuro significa ganhar com a alta dos juros. Se os juros subirem, você ganha no futuro e compensa a perda dos seus prefixados. Nota técnica: na B3, comprar taxa equivale a vender PU, pois taxa e PU se movem em direções opostas.", next: "pu_calc" },
        { id: "sell_usd", label: "Vender taxa de juros no DI futuro — lucra se juros caírem", correct: false, score: 0, feedback: "Cuidado! Vender taxa significa ganhar com a queda dos juros. Sua carteira de prefixados já lucra quando juros caem — vender taxa no DI dobraria essa exposição ao invés de proteger! Nota técnica: vender taxa equivale a comprar PU na B3.", next: "pu_calc" }
      ]},
      { id: "pu_calc", type: "choice", prompt: "Antes de calcular o número de contratos, você precisa determinar o PU (Preço Unitário) do DI Jan/28. A taxa é 12,50% a.a. e faltam 630 dias úteis até o vencimento. Recorde: PU = 100.000 ÷ (1 + taxa)^(DU/252). Qual é o PU?", choices: [
        { id: "pu_correct", label: "PU ≈ 73.785 — calculado como 100.000 ÷ (1,1250)^(630/252)", correct: true, score: 20, feedback: "Excelente! PU = 100.000 ÷ (1,125)^(2,5) = 100.000 ÷ 1,3554 ≈ 73.785. Esse é o valor presente de R$ 100.000 descontado pela taxa do DI a 630 dias úteis. O nocional real de cada contrato hoje é R$ 73.785 — não R$ 100.000! O valor de face (R$ 100k) só é atingido no vencimento.", next: "contract_di" },
        { id: "pu_face", label: "PU = 100.000 — o nocional do contrato", correct: false, score: 0, feedback: "R$ 100.000 é o valor de face no vencimento, não o PU de hoje. O PU é o valor presente, obtido descontando R$ 100.000 pela taxa de juros e prazo: PU = 100.000 ÷ (1,125)^(630/252) = 100.000 ÷ 1,3554 ≈ 73.785. Essa distinção é fundamental — o nocional real de cada contrato hoje é R$ 73.785.", next: "contract_di" },
        { id: "pu_wrong_formula", label: "PU ≈ 87.500 — calculado como 100.000 × (1 − 0,125)", correct: false, score: 5, feedback: "Cuidado! O desconto no DI futuro é composto, não simples. A fórmula correta é PU = 100.000 ÷ (1 + taxa)^(DU/252), usando capitalização composta com base em 252 dias úteis. Com taxa de 12,50% e 630 DU: PU = 100.000 ÷ (1,125)^(2,5) ≈ 73.785. Desconto linear geraria um valor incorreto.", next: "contract_di" }
      ]},
      { id: "contract_di", type: "choice", prompt: "Agora calcule o número de contratos. O PU é ~73.785 (nocional real por contrato). A carteira tem R$ 500M e duration de 3 anos. O DI Jan/28 tem duration de ~2,5 anos. Quantos contratos comprar de taxa?", choices: [
        { id: "market_fwd", label: "6.777 contratos — matching nocional pelo PU (R$ 500M ÷ R$ 73.785)", correct: false, score: 10, feedback: "Você acertou em usar o PU real ao invés do valor de face — isso é importante! Porém, matching nocional ignora a diferença de duration. Com duration da carteira (3a) > duration do futuro (2,5a), é preciso ajustar por esse fator.", next: "resolution_di" },
        { id: "above_fwd", label: "8.133 contratos — nocional pelo PU ajustado por duration: (500M ÷ 73.785) × (3,0 ÷ 2,5)", correct: true, score: 20, feedback: "Excelente! O cálculo correto em dois passos: (1) Contratos base = R$ 500M ÷ PU 73.785 ≈ 6.777 contratos. (2) Ajuste por duration = 6.777 × (3,0 / 2,5) = 6.777 × 1,2 ≈ 8.133 contratos. Usar o PU real (não o valor de face) e ajustar por duration garante que a sensibilidade do hedge case com a da carteira.", next: "resolution_di" },
        { id: "spot_rate", label: "6.000 contratos — usando valor de face (500M ÷ 100k) × (3,0 ÷ 2,5)", correct: false, score: 5, feedback: "Você acertou no ajuste por duration (× 1,2), mas usou o valor de face (R$ 100k) ao invés do PU real (R$ 73.785). O nocional efetivo de cada contrato hoje é o PU, não o valor de face. Usando o PU: 500M ÷ 73.785 × 1,2 ≈ 8.133 contratos. A diferença é significativa — 6.000 vs 8.133 — e resulta em sub-hedge.", next: "resolution_di" }
      ]},
      { id: "resolution_di", type: "resolution", prompt: "O Copom decidiu e o mercado reagiu.", scenarios: [
        { id: "juros_subiram", label: "Cenário A: DI Jan/28 subiu para 13,50%", fixingRate: 13.50, description: "Copom surpreendeu com alta de 75bps na Selic. DI futuro disparou. Títulos prefixados sofreram marcação a mercado negativa." },
        { id: "juros_cairam", label: "Cenário B: DI Jan/28 caiu para 11,50%", fixingRate: 11.50, description: "Surpresa dovish: Copom cortou a Selic e indicou ciclo de queda. Prefixados valorizaram forte." },
        { id: "juros_estaveis", label: "Cenário C: DI Jan/28 estável em 12,60%", fixingRate: 12.60, description: "Copom manteve a taxa como esperado. Reação marginal do mercado." }
      ]}
    ]
  },
  {
    id: "fut_hedge_dolar",
    title: "Hedge com Dólar Futuro — Dívida Corporativa",
    theme: "Futuros", themeId: "futuros", instrument: "Dólar Futuro (DOL)",
    difficulty: "Intermediário",
    context: {
      narrative: "Você é tesoureiro(a) da **EnergiaVerde S.A.**, que emitiu um bond de **USD 50 milhões** no mercado internacional. Há um cupom semestral de **USD 2 milhões** em 6 meses. O dólar spot está em **R$ 5,22** e o dólar futuro de 6 meses (DOL) na B3 está em **R$ 5,30**. Cada contrato DOL tem nocional de USD 50.000.",
      marketData: { spotRate: 5.22, forwardRate90d: 5.30, cdiRate: 0.1175, notional_usd: 2000000, tenor: 126 },
      displayFields: [["Spot", "R$ 5,2200"], ["DOL 6m", "R$ 5,3000"], ["Cupom USD", "USD 2M"], ["Prazo", "6 meses"], ["Contrato DOL", "USD 50k"]],
      question: "O pagamento do cupom em USD está chegando. Como proteger o custo em reais?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é sua motivação ao operar dólar futuro?", choices: [
        { id: "hedge", label: "Hedge — travar o custo em reais do cupom a pagar", correct: true, score: 20, feedback: "Correto! Você tem um passivo de USD 2 milhões a pagar em 6 meses. Se o dólar subir, o custo em reais aumenta. Hedge via dólar futuro trava esse custo.", next: "strategy_dol" },
        { id: "speculation", label: "Especulação — apostar na queda do dólar", correct: false, score: 5, feedback: "Não fazer hedge é uma aposta implícita na queda do dólar. Se ele subir, o custo do cupom em reais explode. A diretoria espera proteção, não aposta.", next: "strategy_dol" },
        { id: "arbitrage", label: "Arbitragem entre DOL e dólar spot", correct: false, score: 0, feedback: "O spread entre o futuro (R$ 5,30) e o spot (R$ 5,22) = R$ 0,08, que reflete o custo de carregamento (diferencial CDI vs cupom cambial). Não é distorção — é preço justo.", next: "strategy_dol" }
      ]},
      { id: "strategy_dol", type: "choice", prompt: "Para proteger contra a alta do dólar, qual posição no dólar futuro?", choices: [
        { id: "buy_usd", label: "Comprar dólar futuro — lucra se dólar subir, compensando o custo maior", correct: true, score: 25, feedback: "Perfeito! Você tem passivo em USD (precisa comprar dólares no futuro). Comprando DOL, se o dólar subir, o ajuste diário positivo compensa o custo maior do cupom. Diferente do NDF (liquidação única no vencimento), o DOL tem ajuste diário — o P&L é creditado ou debitado na sua conta de margem todos os dias.", next: "contract_dol" },
        { id: "sell_usd", label: "Vender dólar futuro — lucra se dólar cair", correct: false, score: 0, feedback: "Vender DOL lucra quando o dólar cai. Mas seu risco é justamente a alta do dólar (passivo em USD). Vender dobraria sua exposição: se o dólar subir, você paga mais caro o cupom E perde no futuro.", next: "contract_dol" }
      ]},
      { id: "contract_dol", type: "choice", prompt: "Quantos contratos DOL comprar? Cada contrato tem nocional de USD 50.000 e o cupom a pagar é de USD 2.000.000.", choices: [
        { id: "above_fwd", label: "40 contratos", correct: true, score: 20, feedback: "Exato! Memória de cálculo: (1) Nocional a proteger = USD 2.000.000. (2) Nocional por contrato = USD 50.000. (3) Número de contratos = 2.000.000 ÷ 50.000 = 40 contratos. Sensibilidade: cada variação de R$ 0,01 no dólar gera ajuste de USD 50.000 × R$ 0,01 = R$ 500 por contrato. Para 40 contratos: R$ 500 × 40 = R$ 20.000 por centavo de variação.", next: "resolution_dol" },
        { id: "market_fwd", label: "20 contratos", correct: false, score: 10, feedback: "Memória de cálculo: 20 contratos × USD 50.000 = USD 1.000.000. Isso cobre apenas 50% do cupom de USD 2M. A outra metade (USD 1M) ficaria sem proteção. Se o dólar subir R$ 0,30, a perda na parcela descoberta seria: USD 1M × R$ 0,30 = R$ 300.000. O correto seria 2.000.000 ÷ 50.000 = 40 contratos.", next: "resolution_dol" },
        { id: "spot_rate", label: "100 contratos", correct: false, score: 0, feedback: "Memória de cálculo: 100 contratos × USD 50.000 = USD 5.000.000 — 2,5 vezes o cupom de USD 2M. O excedente de USD 3M é posição especulativa pura. Além do risco, over-hedge pode desqualificar a operação como hedge contábil (IFRS 9 / CPC 48). O correto: 2.000.000 ÷ 50.000 = 40 contratos.", next: "resolution_dol" }
      ]},
      { id: "resolution_dol", type: "resolution", prompt: "6 meses se passaram. Vencimento do DOL e pagamento do cupom.", scenarios: [
        { id: "dolar_subiu_forte", label: "Cenário A: Dólar subiu para R$ 5,65", fixingRate: 5.65, description: "Alta de juros nos EUA e crise fiscal elevaram o dólar. Custo do cupom subiu, mas ajustes diários compensaram." },
        { id: "dolar_caiu", label: "Cenário B: Dólar caiu para R$ 4,95", fixingRate: 4.95, description: "Fluxo estrangeiro derrubou o câmbio. Cupom ficou mais barato, mas ajustes diários geraram débito acumulado." },
        { id: "dolar_estavel", label: "Cenário C: Dólar ficou em R$ 5,28", fixingRate: 5.28, description: "Dólar terminou próximo do nível do futuro contratado. Ajustes acumulados marginais." }
      ]}
    ]
  },
  {
    id: "fut_especulacao_di",
    title: "Especulação em Juros — Prop Trading",
    theme: "Futuros", themeId: "futuros", instrument: "Futuro de DI",
    difficulty: "Avançado",
    context: {
      narrative: "Você é trader de juros em uma mesa proprietária. Sua análise macro sugere que o mercado **subestima o ciclo de corte da Selic**. O DI Jan/27 está em **12,00% a.a.**, mas sua projeção é taxa terminal de **9,50% a.a.**. O PU atual é **78.925** (cada ponto = R$ 1/contrato). O limite de perda (stop loss) da mesa é **R$ 5 milhões** e o DV01 por contrato do Jan/27 é **R$ 180**.",
      marketData: { spotRate: 12.00, forwardRate90d: 12.00, cdiRate: 0.1175, notional_usd: 185, tenor: 504 },
      displayFields: [["DI Jan/27", "12,00% a.a."], ["Projeção", "9,50% a.a."], ["PU atual", "78.925"], ["DV01/contrato", "R$ 180"], ["Stop loss", "R$ 5M"]],
      question: "Você quer lucrar com a queda dos juros. Como posicionar dentro do limite de risco?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta operação?", choices: [
        { id: "speculation", label: "Especulação — aposta direcional em queda dos juros", correct: true, score: 20, feedback: "Correto! Mesa proprietária, sem carteira a proteger. Posição baseada em convicção macro. O dimensionamento deve respeitar o limite de perda (stop loss) de R$ 5 milhões da mesa.", next: "strategy_spec_di" },
        { id: "hedge", label: "Hedge — proteger alguma exposição", correct: false, score: 5, feedback: "Mesa proprietária não tem exposição pré-existente. É puramente especulativa.", next: "strategy_spec_di" },
        { id: "arbitrage", label: "Arbitragem entre vértices da curva", correct: false, score: 10, feedback: "Arbitragem entre vértices seria um spread/butterfly. Sua tese é sobre o nível absoluto — é especulação direcional.", next: "strategy_spec_di" }
      ]},
      { id: "strategy_spec_di", type: "choice", prompt: "Para lucrar com a QUEDA dos juros, qual posição no DI futuro? ('comprar taxa' = ganhar com alta; 'vender taxa' = ganhar com queda)", choices: [
        { id: "sell_usd", label: "Vender taxa de juros no DI futuro — lucra se juros caírem", correct: true, score: 25, feedback: "Perfeito! Vender taxa no DI futuro significa ganhar com a queda dos juros. Se o Copom cortar a Selic como você projeta, a taxa cai e você lucra. Nota técnica: na B3, vender taxa equivale a comprar PU — quando a taxa cai, o PU sobe e o ajuste diário é positivo.", next: "contract_spec_di" },
        { id: "buy_usd", label: "Comprar taxa de juros no DI futuro — lucra se juros subirem", correct: false, score: 0, feedback: "Comprar taxa lucra na ALTA de juros — é exatamente o oposto da sua convicção de queda! Nota técnica: comprar taxa = vender PU na B3.", next: "contract_spec_di" }
      ]},
      { id: "contract_spec_di", type: "choice", prompt: "O stop loss da mesa é R$ 5 milhões. O DV01 por contrato é R$ 180 (perda por contrato para cada 1bp de alta na taxa). Considerando um cenário de stress de +150bps de alta (o oposto da sua tese), quantos contratos vender de taxa?", choices: [
        { id: "conservative", label: "1.000 contratos", correct: false, score: 10, feedback: "Memória de cálculo: (1) Perda por contrato no stress de +150bps = R$ 180 × 150 = R$ 27.000. (2) Perda total = R$ 27.000 × 1.000 = R$ 27.000.000. Essa posição estouraria o stop loss de R$ 5M em mais de 5 vezes! A conta mostra que até 1.000 contratos já é demais para esse limite. Deve-se partir do limite para chegar ao número de contratos.", next: "resolution_spec_di" },
        { id: "moderate", label: "185 contratos", correct: true, score: 20, feedback: "Memória de cálculo: (1) Stop loss = R$ 5.000.000. (2) Perda por contrato no stress de +150bps = R$ 180 × 150 = R$ 27.000. (3) Contratos máximos = R$ 5.000.000 ÷ R$ 27.000 ≈ 185 contratos. (4) Ganho potencial se tese acertar (taxa cai 250bps para 9,50%): R$ 180 × 250 × 185 = R$ 8.325.000. (5) Relação risco/retorno: ganho potencial de R$ 8,3M vs perda máxima de R$ 5M — assimetria favorável de 1,7:1.", next: "resolution_spec_di" },
        { id: "aggressive", label: "500 contratos", correct: false, score: 5, feedback: "Memória de cálculo: (1) Perda por contrato no stress de +150bps = R$ 180 × 150 = R$ 27.000. (2) Perda total = R$ 27.000 × 500 = R$ 13.500.000. (3) Isso excede o stop loss de R$ 5M em 2,7 vezes. O correto: partir do limite → R$ 5.000.000 ÷ R$ 27.000 ≈ 185 contratos.", next: "resolution_spec_di" }
      ]},
      { id: "resolution_spec_di", type: "resolution", prompt: "O Copom conduziu o ciclo monetário. Onde chegou o DI Jan/27?", scenarios: [
        { id: "juros_cairam_forte", label: "Cenário A: DI Jan/27 caiu para 9,80% (quase acertou!)", fixingRate: 9.80, description: "Ciclo agressivo de corte. PU subiu de 78.925 para ~82.300. Posição altamente lucrativa." },
        { id: "juros_subiram", label: "Cenário B: DI Jan/27 subiu para 13,50% (tese furou)", fixingRate: 13.50, description: "Choque inflacionário forçou o Copom a subir juros. PU caiu para ~75.900. Prejuízo relevante." },
        { id: "juros_estaveis", label: "Cenário C: DI Jan/27 estável em 11,80%", fixingRate: 11.80, description: "Ciclo tímido de corte. PU subiu marginalmente para ~79.300. Ganho modesto." }
      ]}
    ]
  },
  {
    id: "fut_super_desafio",
    title: "Super Desafio — Calendar Spread e Basis Risk",
    theme: "Futuros", themeId: "futuros", instrument: "Futuro de DI (Spread)",
    difficulty: "Super Desafio",
    context: {
      narrative: "Você é estrategista sênior de renda fixa no **Asset Management Carioca**. O spread entre **DI Jan/28 (12,80%)** e **DI Jan/27 (12,00%)** está em **80bps** (calculado como Jan/28 − Jan/27). Historicamente, quando o Copom inicia um ciclo de corte, o vértice longo acaba caindo mais em magnitude que o curto — o mercado revisa para baixo toda a curva futura e o prêmio de incerteza no longo comprime. Com isso, o spread costuma fechar para **30-40bps**. Exemplo: se Jan/27 cair 200bps (→ 10,00%) e Jan/28 cair 250bps (→ 10,30%), o spread sai de 80bps para 30bps. Você quer montar um **calendar spread (flattener)** para lucrar com essa compressão sem risco direcional.",
      marketData: { spotRate: 12.00, forwardRate90d: 12.80, forwardMercado: 0.80, cdiRate: 0.1175, notional_usd: 5000, tenor: 504 },
      displayFields: [["DI Jan/27", "12,00% a.a."], ["DI Jan/28", "12,80% a.a."], ["Spread", "80 bps"], ["Spread hist.", "30-40 bps"], ["Contratos", "5.000"]],
      question: "O spread entre vértices está anormalmente largo. Como capturar a compressão?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta operação?", choices: [
        { id: "arbitrage", label: "Arbitragem relativa — spread entre vértices fora do padrão histórico", correct: true, score: 25, feedback: "Exato! Valor relativo: você não aposta se juros vão subir ou cair, mas que o diferencial vai convergir. Arbitragem estatística na curva.", next: "strategy_spread" },
        { id: "speculation", label: "Especulação direcional em queda de juros", correct: false, score: 5, feedback: "Se fosse direcional, bastaria comprar DI. O calendar spread busca lucrar com a MUDANÇA DO FORMATO da curva.", next: "strategy_spread" },
        { id: "hedge", label: "Hedge de uma carteira existente", correct: false, score: 0, feedback: "Não há carteira a proteger. Operação de valor relativo.", next: "strategy_spread" }
      ]},
      { id: "strategy_spread", type: "choice", prompt: "Para lucrar com a COMPRESSÃO do spread (80bps → ~35bps), qual combinação? ('comprar taxa' = ganhar com alta; 'vender taxa' = ganhar com queda)", choices: [
        { id: "sell_usd", label: "Vender taxa no Jan/27 (ganhar com queda do curto) + Comprar taxa no Jan/28 (ganhar com alta do longo) — flattener", correct: true, score: 30, feedback: "Perfeito! O flattener aposta que o spread (Jan/28 − Jan/27) vai comprimir. Você vende taxa no curto (ganha se cair) e compra taxa no longo (ganha se subir, ou perder menos). Se o spread fechar de 80 para 35bps — por exemplo, porque o vértice longo caiu mais em magnitude — você lucra a diferença de 45bps. Se ambos se moverem na mesma magnitude, as pernas se compensam e o risco direcional é neutro. Nota técnica: vender taxa = comprar PU no curto; comprar taxa = vender PU no longo.", next: "contract_spread" },
        { id: "buy_usd", label: "Comprar taxa no Jan/27 + Vender taxa no Jan/28 — steepener", correct: false, score: 0, feedback: "Isso é o steepener — aposta que o spread vai ABRIR mais. Sua tese é de compressão (80bps → 35bps). Essa posição perderia.", next: "contract_spread" },
        { id: "sell_usd_teorico", label: "Apenas vender taxa no Jan/27 (posição direcional)", correct: false, score: 5, feedback: "Posição direcional pura — lucra se juros caírem mas perde se subirem. O calendar spread neutraliza o risco direcional ao combinar as duas pernas, isolando apenas o efeito do formato da curva.", next: "contract_spread" }
      ]},
      { id: "contract_spread", type: "choice", prompt: "Para que o spread seja neutro em risco direcional, como calibrar o número de contratos? Dados: DV01 do Jan/27 = R$ 180 por contrato por 1bp. DV01 do Jan/28 = R$ 240 por contrato por 1bp. Você vai vender taxa em 5.000 contratos no Jan/27.", choices: [
        { id: "sintetico_completo", label: "5.000 no Jan/27 + 3.750 no Jan/28", correct: true, score: 30, feedback: "Excelente! Memória de cálculo: (1) DV01 total da perna curta = 5.000 × R$ 180 = R$ 900.000 por 1bp. (2) Contratos na perna longa para igualar = R$ 900.000 ÷ R$ 240 = 3.750 contratos. (3) Verificação: DV01 longo = 3.750 × R$ 240 = R$ 900.000 por 1bp ✓. As pernas têm mesma sensibilidade: um choque paralelo de +1bp gera +R$ 900k numa perna e −R$ 900k na outra, cancelando o risco direcional.", next: "resolution_spread" },
        { id: "apenas_ndf", label: "5.000 contratos em cada perna", correct: false, score: 10, feedback: "Memória de cálculo: (1) DV01 curto = 5.000 × R$ 180 = R$ 900.000/bp. (2) DV01 longo = 5.000 × R$ 240 = R$ 1.200.000/bp. (3) Diferença = R$ 300.000/bp — isso NÃO é neutro! A perna longa tem exposição R$ 300k/bp maior, criando viés comprador de taxa (aposta líquida na alta de juros). O correto: ajustar pela razão de DV01 = 5.000 × (180 ÷ 240) = 3.750 contratos no longo.", next: "resolution_spread" },
        { id: "outro_ndf", label: "3.000 no Jan/27 + 5.000 no Jan/28", correct: false, score: 0, feedback: "Memória de cálculo: (1) DV01 curto = 3.000 × R$ 180 = R$ 540.000/bp. (2) DV01 longo = 5.000 × R$ 240 = R$ 1.200.000/bp. (3) Diferença = R$ 660.000/bp a favor da perna longa — é uma posição fortemente tomada em taxa, não um spread neutro. Inverte completamente a proporção correta.", next: "resolution_spread" }
      ]},
      { id: "resolution_spread", type: "resolution", prompt: "Meses passaram. O Copom iniciou o ciclo de corte. Como ficou a curva?", scenarios: [
        { id: "spread_comprimiu", label: "Cenário A: Spread comprimiu para 30bps (Jan/27=10,00%, Jan/28=10,30%)", fixingRate: 10.00, description: "Ciclo de corte achatou a curva como esperado. Jan/27 caiu 200bps, Jan/28 caiu 250bps. Spread: 80 → 30bps. Tese acertou." },
        { id: "spread_abriu", label: "Cenário B: Spread ABRIU para 150bps (Jan/27=13,00%, Jan/28=14,50%)", fixingRate: 13.00, description: "Choque inflacionário levou o Copom a subir juros agressivamente. Mercado precificou mais aperto futuro." },
        { id: "spread_estavel", label: "Cenário C: Spread estável em 75bps (Jan/27=11,25%, Jan/28=12,00%)", fixingRate: 11.25, description: "Ciclo gradual e paralelo. Curva desceu uniformemente, spread praticamente inalterado." }
      ]}
    ]
  }
];

/* ═══════════════════════════════════════════════════════════════
   BANCO DE CENÁRIOS — SWAPS
   ═══════════════════════════════════════════════════════════════ */

const SWAPS_SCENARIOS = [
  {
    id: "swap_cdi_pre",
    title: "Swap CDI × Pré — Empresa com Dívida Flutuante",
    theme: "Swaps", themeId: "swaps", instrument: "Swap CDI × Pré",
    difficulty: "Intermediário",
    context: {
      narrative: "Você é CFO da **Infralog S.A.**, uma empresa de logística que captou um empréstimo de **R$ 200 milhões** a **CDI + 2,00% a.a.** com vencimento em **2 anos**. O CDI atual é **11,75% a.a.**, então o custo total hoje é 13,75% a.a. A empresa tem receitas previsíveis (contratos longos de frete) e a diretoria quer transformar a dívida flutuante em custo fixo para facilitar o planejamento financeiro. Um banco oferece um swap CDI × Pré a **12,50% a.a.** (taxa fixa) para 2 anos.",
      marketData: { spotRate: 11.75, forwardRate90d: 12.50, cdiRate: 0.1175, notional_usd: 200000000, tenor: 504 },
      displayFields: [["CDI atual", "11,75% a.a."], ["Spread", "+ 2,00% a.a."], ["Custo atual", "13,75% a.a."], ["Taxa swap", "12,50% a.a."], ["Nocional", "R$ 200M"], ["Prazo", "2 anos"]],
      question: "A dívida é flutuante e a empresa quer custo fixo. Como usar o swap?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a motivação da Infralog ao contratar um swap?", choices: [
        { id: "hedge", label: "Hedge — transformar o custo flutuante (CDI) em custo fixo (prefixado)", correct: true, score: 20, feedback: "Correto! A empresa tem dívida atrelada ao CDI. Se a Selic subir, o custo financeiro sobe junto. O swap permite trocar o indexador flutuante por uma taxa fixa, eliminando a incerteza.", next: "strategy_swap" },
        { id: "speculation", label: "Especulação — apostar que o CDI vai cair", correct: false, score: 5, feedback: "Se a empresa simplesmente espera que o CDI caia, ela está especulando com o custo da dívida. A diretoria quer previsibilidade, não aposta.", next: "strategy_swap" },
        { id: "arbitrage", label: "Arbitragem entre mercados", correct: false, score: 0, feedback: "Não há distorção de preço a explorar. A motivação é operacional — converter um fluxo flutuante em fixo.", next: "strategy_swap" }
      ]},
      { id: "strategy_swap", type: "choice", prompt: "No swap CDI × Pré, a empresa precisa escolher: em qual perna ela fica? Lembre-se: a empresa já PAGA CDI no empréstimo.", choices: [
        { id: "buy_usd", label: "Pagar taxa fixa (12,50%) e receber CDI no swap", correct: true, score: 25, feedback: "Perfeito! Memória de cálculo: (1) A empresa paga CDI + 2% no empréstimo. (2) No swap, ela recebe CDI e paga 12,50% fixo. (3) O CDI recebido no swap cancela o CDI pago no empréstimo. (4) Custo líquido = 12,50% (fixo do swap) + 2,00% (spread do empréstimo) = 14,50% a.a. fixo. A empresa trocou incerteza por previsibilidade.", next: "contract_swap" },
        { id: "sell_usd", label: "Receber taxa fixa (12,50%) e pagar CDI no swap", correct: false, score: 0, feedback: "Cuidado! Se a empresa paga CDI no swap, ela ficaria pagando CDI duas vezes: uma no empréstimo e outra no swap. Isso DOBRA a exposição ao invés de eliminar. O correto é receber CDI no swap para cancelar o CDI do empréstimo.", next: "contract_swap" }
      ]},
      { id: "contract_swap", type: "choice", prompt: "A empresa fechou o swap: paga 12,50% fixo e recebe CDI, nocional de R$ 200M por 2 anos. Qual é o custo final fixo da dívida?", choices: [
        { id: "above_fwd", label: "14,50% a.a. — soma da taxa fixa do swap (12,50%) + spread do empréstimo (2,00%)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Custo do empréstimo = CDI + 2,00%. (2) Swap: paga 12,50% fixo, recebe CDI. (3) Custo líquido = (CDI + 2,00%) − CDI + 12,50% = 12,50% + 2,00% = 14,50% a.a. fixo. O CDI se cancela e sobra a taxa fixa mais o spread. A empresa agora sabe exatamente quanto vai pagar, independentemente do que acontecer com a Selic.", next: "resolution_swap" },
        { id: "market_fwd", label: "12,50% a.a. — apenas a taxa fixa do swap", correct: false, score: 5, feedback: "O swap não elimina o spread de crédito! Memória de cálculo: (1) A empresa continua pagando CDI + 2,00% no empréstimo. (2) O swap cancela apenas o CDI, não o spread. (3) Custo líquido = 12,50% (fixo) + 2,00% (spread) = 14,50% a.a. Esquecer o spread subestima o custo real.", next: "resolution_swap" },
        { id: "spot_rate", label: "13,75% a.a. — o custo atual (CDI 11,75% + 2,00%)", correct: false, score: 0, feedback: "13,75% é o custo de hoje com CDI a 11,75%, mas esse custo muda se o CDI mudar — é exatamente o risco que a empresa quer eliminar. Após o swap, o custo fixo é: 12,50% + 2,00% = 14,50% a.a., independentemente do CDI futuro.", next: "resolution_swap" }
      ]},
      { id: "resolution_swap", type: "resolution", prompt: "2 anos se passaram. Como evoluiu o CDI e qual foi o resultado do swap?", scenarios: [
        { id: "cdi_subiu", label: "Cenário A: CDI subiu para 14,25% a.a.", fixingRate: 14.25, description: "A Selic subiu com pressão inflacionária. Sem o swap, o custo da dívida teria ido a 16,25% (CDI 14,25% + 2%). Com o swap, a empresa travou em 14,50% — economizou 1,75% a.a. sobre R$ 200M." },
        { id: "cdi_caiu", label: "Cenário B: CDI caiu para 8,50% a.a.", fixingRate: 8.50, description: "Ciclo de corte agressivo levou a Selic a mínimas. Sem o swap, o custo teria caído para 10,50% (CDI 8,50% + 2%). Com o swap travado em 14,50%, a empresa paga 4,00% a.a. a mais do que pagaria sem hedge." },
        { id: "cdi_estavel", label: "Cenário C: CDI estável em 11,50% a.a.", fixingRate: 11.50, description: "O CDI praticamente não se moveu. O custo sem swap (13,50%) ficou próximo do custo com swap (14,50%). O swap custou ~1,00% a.a. a mais — o 'preço do seguro'." }
      ]}
    ]
  },
  {
    id: "swap_cambial",
    title: "Swap Cambial — Dívida em Dólar",
    theme: "Swaps", themeId: "swaps", instrument: "Swap Cambial (USD × CDI)",
    difficulty: "Intermediário",
    context: {
      narrative: "Você é tesoureiro(a) da **Siderúrgica Nacional S.A.**, que emitiu um bond de **USD 100 milhões** a **taxa fixa de 5,50% a.a. em dólar** com vencimento em **3 anos**. A receita da empresa é 100% em reais. O dólar spot está em **R$ 5,20**, o cupom cambial limpo é **4,50% a.a.** e o CDI é **11,75% a.a.**. Você contrata um swap cambial: paga CDI e recebe variação cambial + cupom cambial (4,50%). O nocional é **R$ 520 milhões** (USD 100M × R$ 5,20). Na liquidação do swap, compara-se: a perna cambial (variação do dólar + 4,50% a.a.) vs a perna CDI (CDI acumulado). A diferença é o resultado líquido.",
      marketData: { spotRate: 5.20, forwardRate90d: 5.20, cdiRate: 0.1175, notional_usd: 100000000, tenor: 756 },
      displayFields: [["Dívida", "USD 100M"], ["Cupom USD", "5,50% a.a."], ["Spot inicial", "R$ 5,20"], ["CDI", "11,75% a.a."], ["Cupom cambial", "4,50% a.a."], ["Nocional swap", "R$ 520M"]],
      question: "A receita é em reais mas a dívida é em dólar. Como eliminar o descasamento?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a motivação ao contratar um swap cambial?", choices: [
        { id: "hedge", label: "Hedge — transformar a dívida em dólar em dívida em reais", correct: true, score: 20, feedback: "Correto! A empresa tem receita em BRL e dívida em USD. Se o dólar subir, a dívida em reais explode. O swap cambial troca o indexador: a empresa passa a dever em CDI ao invés de variação cambial + cupom em dólar.", next: "strategy_cambial" },
        { id: "speculation", label: "Especulação — apostar na queda do dólar", correct: false, score: 5, feedback: "Deixar a dívida em dólar sem proteção é uma aposta cambial. A diretoria e os acionistas esperam gestão de risco, não especulação.", next: "strategy_cambial" },
        { id: "arbitrage", label: "Arbitragem entre taxas de juros", correct: false, score: 0, feedback: "A motivação não é explorar distorção de preço, mas sim eliminar o descasamento entre a moeda da receita (BRL) e da dívida (USD).", next: "strategy_cambial" }
      ]},
      { id: "strategy_cambial", type: "choice", prompt: "No swap cambial, a empresa precisa definir as pernas. Ela já paga variação cambial + 5,50% na dívida. Qual estrutura do swap?", choices: [
        { id: "buy_usd", label: "Pagar CDI no swap e receber variação cambial + cupom cambial (4,50%)", correct: true, score: 25, feedback: "Memória de cálculo: (1) Dívida original: paga variação cambial + 5,50% a.a. em USD. (2) Swap: recebe variação cambial + cupom cambial (4,50%), paga CDI. (3) A perna cambial do swap cancela parcialmente a dívida. (4) Diferencial residual = cupom da dívida (5,50%) − cupom cambial do swap (4,50%) = 1,00% a.a. sobre o nocional em USD, que a empresa continua pagando em dólar. (5) Custo final ≈ CDI (via swap) + 1,00% a.a. residual em USD. A empresa converteu a maior parte da dívida em dólar para dívida em CDI.", next: "contract_cambial" },
        { id: "sell_usd", label: "Receber CDI no swap e pagar variação cambial + cupom cambial", correct: false, score: 0, feedback: "Se a empresa paga variação cambial no swap, ela ficaria pagando variação cambial duas vezes: na dívida e no swap. Isso dobra a exposição ao dólar! O swap deve receber variação cambial para cancelar o que a empresa paga na dívida.", next: "contract_cambial" }
      ]},
      { id: "contract_cambial", type: "choice", prompt: "O nocional do swap deve ser convertido pelo câmbio spot da contratação. Qual o nocional correto?", choices: [
        { id: "above_fwd", label: "R$ 520 milhões (USD 100M × R$ 5,20)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Dívida = USD 100.000.000. (2) Câmbio spot na contratação = R$ 5,20/USD. (3) Nocional em reais = USD 100M × R$ 5,20 = R$ 520.000.000. Este é o valor sobre o qual incidem os fluxos de CDI do swap. A perna cambial usa o nocional em USD (100M) e converte pela variação do câmbio.", next: "resolution_cambial" },
        { id: "market_fwd", label: "R$ 100 milhões (apenas o valor numérico da dívida)", correct: false, score: 0, feedback: "R$ 100M confunde o nocional em dólares com reais. Memória de cálculo: (1) Dívida = USD 100M. (2) Em reais: USD 100M × R$ 5,20 = R$ 520M. (3) Usar R$ 100M cobre apenas 19% da exposição. A empresa ficaria com 81% da dívida cambial a descoberto.", next: "resolution_cambial" },
        { id: "spot_rate", label: "R$ 530 milhões (usando o forward de 6 meses)", correct: false, score: 5, feedback: "O nocional do swap é fixado pelo câmbio spot da data de contratação, não pelo forward. Memória de cálculo: (1) Spot = R$ 5,20. (2) Nocional = USD 100M × R$ 5,20 = R$ 520M. Usar o forward inflaria o nocional e criaria uma posição especulativa embutida.", next: "resolution_cambial" }
      ]},
      { id: "resolution_cambial", type: "resolution", prompt: "3 anos se passaram. Hora de avaliar o resultado do swap cambial. Na liquidação, compara-se a perna cambial (variação do dólar + cupom) vs a perna CDI.", scenarios: [
        { id: "dolar_disparou", label: "Cenário A: Dólar subiu para R$ 6,80 (+30,8%)", fixingRate: 6.80, description: "O dólar disparou. Sem swap: custo da dívida em reais saltaria de R$ 520M para R$ 680M (variação cambial: +R$ 160M). Com swap: a empresa recebeu a variação cambial (+R$ 160M) na perna do swap, compensando o custo maior da dívida. Pagou CDI em reais — custo previsível. O swap protegeu contra o choque." },
        { id: "dolar_caiu", label: "Cenário B: Dólar caiu para R$ 4,30 (−17,3%)", fixingRate: 4.30, description: "O real se valorizou. Sem swap: a dívida teria caído para R$ 430M (economia de R$ 90M em variação cambial). Com swap: a empresa devolveu essa 'economia' na perna cambial (pagou R$ 90M ao banco) e continuou pagando CDI. O swap 'custou' R$ 90M de oportunidade — mas esse era o preço da proteção." },
        { id: "dolar_estavel", label: "Cenário C: Dólar estável em R$ 5,35 (+2,9%)", fixingRate: 5.35, description: "O câmbio oscilou pouco. A variação cambial foi de +R$ 15M (pequena alta do dólar). O swap neutralizou essa variação. A diferença entre pagar CDI (swap) vs manter a dívida em dólar foi marginal." }
      ]}
    ]
  },
  {
    id: "swap_especulacao",
    title: "Swap Direcional — Fundo Multimercado",
    theme: "Swaps", themeId: "swaps", instrument: "Swap CDI × Pré",
    difficulty: "Avançado",
    context: {
      narrative: "Você é gestor(a) de um fundo multimercado com PL de **R$ 800 milhões**. Sua convicção é de que o Copom vai **cortar a Selic agressivamente** nos próximos 18 meses. O CDI está em **11,75% a.a.** e um banco oferece swap CDI × Pré a **12,00% a.a.** para 18 meses. Você quer montar uma posição direcional via swap ao invés de usar DI futuro, porque o swap não exige margem na B3 (é bilateral com o banco). O limite de risco do fundo para essa estratégia é **R$ 10 milhões** de perda máxima.",
      marketData: { spotRate: 11.75, forwardRate90d: 12.00, cdiRate: 0.1175, notional_usd: 200000000, tenor: 378 },
      displayFields: [["CDI atual", "11,75% a.a."], ["Taxa swap", "12,00% a.a."], ["PL fundo", "R$ 800M"], ["Stop loss", "R$ 10M"], ["Prazo", "18 meses"]],
      question: "Você aposta na queda dos juros. Como usar o swap para capturar esse movimento?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta operação com swap?", choices: [
        { id: "speculation", label: "Especulação — aposta direcional em queda dos juros via swap", correct: true, score: 20, feedback: "Correto! Não há exposição a proteger. O swap é usado como veículo especulativo para apostar na queda dos juros — alternativa ao DI futuro, com a vantagem de não exigir margem na B3 (risco bilateral com o banco).", next: "strategy_spec_swap" },
        { id: "hedge", label: "Hedge — proteger a carteira do fundo", correct: false, score: 5, feedback: "Se fosse hedge, o fundo teria uma exposição pré-existente a proteger. Aqui, a posição é puramente direcional.", next: "strategy_spec_swap" },
        { id: "arbitrage", label: "Arbitragem entre swap e DI futuro", correct: false, score: 10, feedback: "Arbitragem entre swap e DI futuro exigiria que as taxas estivessem descasadas. Aqui a motivação é direcional — apostar na queda de juros.", next: "strategy_spec_swap" }
      ]},
      { id: "strategy_spec_swap", type: "choice", prompt: "Para lucrar com a QUEDA dos juros via swap CDI × Pré, qual perna o fundo escolhe?", choices: [
        { id: "sell_usd", label: "Receber taxa fixa (12,00%) e pagar CDI — lucra se CDI ficar abaixo de 12,00%", correct: true, score: 25, feedback: "Perfeito! Memória de cálculo: (1) O fundo recebe 12,00% fixo e paga CDI flutuante. (2) Se o Copom cortar juros e o CDI médio do período ficar em 9,00%, o fundo ganha a diferença: 12,00% − 9,00% = 3,00% a.a. sobre o nocional. (3) Se o CDI subir acima de 12,00%, o fundo perde a diferença. A posição é análoga a vender taxa no DI futuro.", next: "contract_spec_swap" },
        { id: "buy_usd", label: "Pagar taxa fixa (12,00%) e receber CDI — lucra se CDI ficar acima de 12,00%", correct: false, score: 0, feedback: "Pagar fixo e receber CDI lucra quando os juros SOBEM (CDI > 12,00%). Mas sua tese é de queda! Essa posição é análoga a comprar taxa — o oposto da sua convicção.", next: "contract_spec_swap" }
      ]},
      { id: "contract_spec_swap", type: "choice", prompt: "O stop loss é R$ 10 milhões. No pior cenário (stress), o CDI médio sobe 300bps acima da taxa fixa (CDI médio = 15,00% vs fixo = 12,00%) ao longo dos 18 meses. Qual o nocional máximo do swap?", choices: [
        { id: "moderate", label: "R$ 222 milhões", correct: true, score: 20, feedback: "Memória de cálculo: (1) Perda no cenário de stress = (CDI médio − taxa fixa) × nocional × prazo. (2) Spread de stress = 15,00% − 12,00% = 3,00% a.a. (3) Prazo = 1,5 anos. (4) Perda = 3,00% × nocional × 1,5. (5) Nocional máximo = R$ 10.000.000 ÷ (0,03 × 1,5) = R$ 10.000.000 ÷ 0,045 = R$ 222.222.222 ≈ R$ 222M. (6) Ganho potencial (se CDI médio = 9,00%): (12,00% − 9,00%) × R$ 222M × 1,5 = R$ 10M. Relação risco/retorno: 1:1 no cenário base.", next: "resolution_spec_swap" },
        { id: "conservative", label: "R$ 100 milhões", correct: false, score: 10, feedback: "Memória de cálculo: (1) Perda no stress = 3,00% × R$ 100M × 1,5 = R$ 4.500.000. (2) Isso fica dentro do stop de R$ 10M, mas usa apenas 45% do limite. (3) Ganho potencial = 3,00% × R$ 100M × 1,5 = R$ 4,5M. Posição conservadora — não maximiza o uso do limite de risco. O correto: R$ 10M ÷ (0,03 × 1,5) ≈ R$ 222M.", next: "resolution_spec_swap" },
        { id: "aggressive", label: "R$ 500 milhões", correct: false, score: 5, feedback: "Memória de cálculo: (1) Perda no stress = 3,00% × R$ 500M × 1,5 = R$ 22.500.000. (2) Isso excede o stop de R$ 10M em 2,25 vezes! (3) Nocional máximo = R$ 10M ÷ (0,03 × 1,5) ≈ R$ 222M. Posição de R$ 500M viola a política de risco.", next: "resolution_spec_swap" }
      ]},
      { id: "resolution_spec_swap", type: "resolution", prompt: "18 meses se passaram. Qual foi o CDI médio acumulado no período?", scenarios: [
        { id: "cdi_caiu_forte", label: "Cenário A: CDI médio ficou em 9,00% a.a. (tese acertou!)", fixingRate: 9.00, description: "O Copom cortou agressivamente. O fundo recebeu 12,00% fixo e pagou CDI médio de 9,00%. Ganho de 3,00% a.a. sobre o nocional por 1,5 anos." },
        { id: "cdi_subiu", label: "Cenário B: CDI médio ficou em 14,50% a.a. (tese errou)", fixingRate: 14.50, description: "Inflação persistente forçou alta de juros. O fundo recebeu 12,00% fixo mas pagou CDI médio de 14,50%. Perda de 2,50% a.a. sobre o nocional." },
        { id: "cdi_estavel", label: "Cenário C: CDI médio ficou em 11,80% a.a.", fixingRate: 11.80, description: "Juros pouco se moveram. Ganho modesto de 0,20% a.a. — a posição quase empatou." }
      ]}
    ]
  },
  {
    id: "swap_super_desafio",
    title: "Super Desafio — Swap com Risco de Crédito (CVA)",
    theme: "Swaps", themeId: "swaps", instrument: "Swap CDI × Pré (com CVA)",
    difficulty: "Super Desafio",
    context: {
      narrative: "Você é head de tesouraria do **Banco Meridional**. Uma empresa de rating **BB** (alto risco de crédito) pede um swap CDI × Pré de **R$ 300 milhões** por **3 anos** para fixar o custo da dívida. A taxa de swap 'limpa' (sem risco de crédito) é **12,00% a.a.** O departamento de risco estima a **probabilidade de default** da empresa em **8% acumulada em 3 anos** e a **perda dado default (LGD)** em **60%**. Você precisa precificar o **CVA (Credit Valuation Adjustment)** e definir a taxa do swap que o banco deve oferecer.",
      marketData: { spotRate: 12.00, forwardRate90d: 12.00, cdiRate: 0.1175, notional_usd: 300000000, tenor: 756 },
      displayFields: [["Taxa limpa", "12,00% a.a."], ["Nocional", "R$ 300M"], ["PD 3 anos", "8%"], ["LGD", "60%"], ["Rating", "BB"], ["Prazo", "3 anos"]],
      question: "Qual taxa de swap cobrar para compensar o risco de crédito da contraparte?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Por que o banco não pode simplesmente oferecer a taxa de swap 'limpa' de 12,00% a.a.?", choices: [
        { id: "hedge", label: "Porque há risco de crédito da contraparte — se a empresa der default, o banco perde o valor positivo do swap", correct: true, score: 25, feedback: "Exato! Em um swap bilateral, se a contraparte quebrar quando o swap tem valor positivo para o banco, o banco perde esse valor (ou parte dele). O CVA (Credit Valuation Adjustment) é a precificação desse risco — deve ser embutido na taxa para compensar a perda esperada.", next: "strategy_cva" },
        { id: "speculation", label: "Porque o banco quer lucrar mais com clientes de risco alto", correct: false, score: 5, feedback: "Não é simplesmente 'lucrar mais' — é compensar uma perda esperada real. Se a empresa der default quando o swap vale R$ 20M para o banco, o banco perde parte desse valor. O CVA quantifica essa perda esperada e a embute na taxa.", next: "strategy_cva" },
        { id: "arbitrage", label: "Porque a taxa de mercado já subiu e 12,00% está defasada", correct: false, score: 0, feedback: "12,00% é a taxa de mercado atual para contrapartes sem risco de crédito. O ajuste não é por defasagem de mercado, mas sim pelo risco específico desta contraparte.", next: "strategy_cva" }
      ]},
      { id: "strategy_cva", type: "choice", prompt: "Para uma primeira aproximação, como calcular o CVA? Dados: PD = 8% em 3 anos, LGD = 60%. Suponha que a exposição positiva esperada média do banco ao longo dos 3 anos é de R$ 15 milhões (estimada por simulação).", choices: [
        { id: "buy_usd", label: "CVA ≈ PD × LGD × Exposição esperada = 8% × 60% × R$ 15M = R$ 720.000", correct: true, score: 30, feedback: "Memória de cálculo: (1) Probabilidade de default em 3 anos = 8%. (2) Perda dado default = 60% (o banco recupera 40%). (3) Exposição positiva esperada média = R$ 15M (valor médio que o banco teria a receber). (4) CVA = 0,08 × 0,60 × R$ 15.000.000 = R$ 720.000. (5) Anualizado sobre R$ 300M por 3 anos: R$ 720.000 ÷ (R$ 300M × 3) ≈ 0,08% a.a. ≈ 8bps. A taxa do swap deve ser ajustada para ~12,08% a.a.", next: "contract_cva" },
        { id: "sell_usd", label: "CVA ≈ PD × Nocional = 8% × R$ 300M = R$ 24 milhões", correct: false, score: 5, feedback: "Esse cálculo superestima brutalmente o CVA! Dois erros: (1) Usa o nocional total ao invés da exposição esperada — o banco nunca perde o nocional inteiro em um swap, apenas o valor de mercado positivo. (2) Ignora a taxa de recuperação (LGD). O correto: CVA = PD × LGD × Exposição esperada = 0,08 × 0,60 × R$ 15M = R$ 720 mil.", next: "contract_cva" },
        { id: "sell_usd_teorico", label: "CVA ≈ LGD × Nocional = 60% × R$ 300M = R$ 180 milhões", correct: false, score: 0, feedback: "Isso confunde LGD com perda total. A LGD (60%) é a fração perdida SE houver default, não a perda incondicional. Faltam dois fatores: (1) a probabilidade de default (8%, não 100%) e (2) a exposição correta (R$ 15M de valor esperado do swap, não R$ 300M de nocional). CVA = 0,08 × 0,60 × R$ 15M = R$ 720 mil.", next: "contract_cva" }
      ]},
      { id: "contract_cva", type: "choice", prompt: "O CVA é ~R$ 720 mil, equivalente a ~8bps a.a. sobre o nocional. Qual taxa final o banco deve oferecer à empresa?", choices: [
        { id: "above_fwd", label: "12,08% a.a. — taxa limpa (12,00%) + CVA (0,08%)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Taxa limpa de mercado = 12,00% a.a. (2) CVA anualizado = ~8bps = 0,08% a.a. (3) Taxa com ajuste de crédito = 12,00% + 0,08% = 12,08% a.a. Na prática, o banco pode adicionar um spread comercial adicional, mas o piso econômico é 12,08%. O CVA garante que o banco é compensado pela perda esperada de crédito.", next: "resolution_cva" },
        { id: "market_fwd", label: "13,00% a.a. — taxa limpa + 100bps de 'spread de crédito genérico'", correct: false, score: 5, feedback: "100bps é um spread arbitrário. O CVA calculado é de apenas 8bps. Cobrar 100bps adiciona 92bps de lucro puro sem justificativa econômica — pode perder o negócio para um concorrente que precifique corretamente. O método correto é: 12,00% + CVA (8bps) = 12,08% + spread comercial razoável.", next: "resolution_cva" },
        { id: "spot_rate", label: "12,00% a.a. — mesma taxa de mercado, sem ajuste", correct: false, score: 0, feedback: "Oferecer 12,00% ignora completamente o risco de crédito. Se a empresa der default quando o swap valer R$ 15M para o banco, a perda esperada é de R$ 720 mil. Sem o CVA, o banco está efetivamente subsidiando o risco de crédito da contraparte.", next: "resolution_cva" }
      ]},
      { id: "resolution_cva", type: "resolution", prompt: "3 anos se passaram. O que aconteceu com a contraparte e o swap?", scenarios: [
        { id: "default", label: "Cenário A: A empresa entrou em recuperação judicial no mês 24", fixingRate: 14.00, description: "A empresa deu default quando o swap valia R$ 18M para o banco (CDI subiu). Com LGD de 60%, o banco perdeu R$ 10,8M. O CVA cobrado (R$ 720k) cobriu apenas uma fração — mas sem ele, a perda teria sido ainda maior. O CVA é uma cobertura estatística, não uma garantia." },
        { id: "sobreviveu_cdi_alto", label: "Cenário B: A empresa sobreviveu e o CDI subiu para 14,00%", fixingRate: 14.00, description: "Sem default. O swap valeu positivo para o banco (recebe CDI alto, paga fixo). O CVA cobrado de 8bps foi 'lucro' adicional — a perda de crédito não se materializou neste caso." },
        { id: "sobreviveu_cdi_baixo", label: "Cenário C: A empresa sobreviveu e o CDI caiu para 9,00%", fixingRate: 9.00, description: "Sem default. O swap valeu negativo para o banco (recebe CDI baixo, paga fixo). Neste cenário, o risco de crédito era irrelevante — quando o swap vale negativo para o banco, ele não perde nada com default da contraparte." }
      ]}
    ]
  }
];

/* ═══════════════════════════════════════════════════════════════
   BANCO DE CENÁRIOS — OPÇÕES
   ═══════════════════════════════════════════════════════════════ */

const OPCOES_SCENARIOS = [
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
      question: "Como proteger a carteira contra queda preservando o upside?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a motivação ao usar opções neste caso?", choices: [
        { id: "hedge", label: "Hedge — proteger contra queda sem abrir mão da alta (put protetiva)", correct: true, score: 20, feedback: "Correto! A put protetiva funciona como um seguro: você paga o prêmio (R$ 1,20/ação) e garante um preço mínimo de venda. Diferente do futuro ou NDF, a opção preserva o upside — se PETR4 subir, você ganha integralmente (menos o prêmio). Essa assimetria é a grande vantagem das opções.", next: "strategy_put" },
        { id: "speculation", label: "Especulação — apostar na queda da ação", correct: false, score: 5, feedback: "Comprar put pode ser especulação, mas aqui há uma carteira de R$ 300M a proteger. A motivação é hedge — proteger o patrimônio existente.", next: "strategy_put" },
        { id: "arbitrage", label: "Arbitragem", correct: false, score: 0, feedback: "Não há distorção de preço a explorar. A motivação é proteger a carteira existente.", next: "strategy_put" }
      ]},
      { id: "strategy_put", type: "choice", prompt: "Qual opção usar para proteger a carteira de PETR4 contra queda?", choices: [
        { id: "buy_usd", label: "Comprar put de PETR4 com strike R$ 34,50 — garante preço mínimo de venda", correct: true, score: 25, feedback: "Memória de cálculo: (1) Comprar put com strike R$ 34,50 = direito de vender PETR4 a R$ 34,50 no vencimento. (2) Custo = R$ 1,20/ação × 7.900.000 ações = R$ 9.480.000 (~3,2% do PL). (3) Se PETR4 cair abaixo de R$ 34,50: a put compensa R$ 1 por R$ 1 de queda. (4) Se PETR4 subir: upside ilimitado, o prêmio é o custo do 'seguro'. (5) Perda máxima da carteira = queda até strike + prêmio = (R$ 38,00 − R$ 34,50) + R$ 1,20 = R$ 4,70/ação = 12,4%.", next: "contract_put" },
        { id: "sell_usd", label: "Vender (lançar) call de PETR4 — gera receita mas limita o upside", correct: false, score: 10, feedback: "Vender call gera receita (prêmio) que amortiza perdas, mas limita o ganho se PETR4 subir acima do strike. A diretoria quer preservar o upside — a call vendida eliminaria justamente isso. Além disso, vender call não protege contra quedas fortes.", next: "contract_put" },
        { id: "sell_usd_teorico", label: "Comprar call de PETR4 — lucra com a alta", correct: false, score: 0, feedback: "Comprar call lucra com a alta, mas não protege contra queda. A carteira já está comprada em PETR4 — comprar call aumentaria a exposição à alta sem endereçar o risco de baixa.", next: "contract_put" }
      ]},
      { id: "contract_put", type: "choice", prompt: "Quantos contratos de put comprar? Na B3, cada contrato de opção sobre ação = 100 ações. A carteira tem 7.900.000 ações de PETR4.", choices: [
        { id: "above_fwd", label: "79.000 contratos", correct: true, score: 20, feedback: "Memória de cálculo: (1) Ações a proteger = 7.900.000. (2) Lote por contrato na B3 = 100 ações. (3) Contratos = 7.900.000 ÷ 100 = 79.000 contratos. (4) Custo total = 79.000 × 100 × R$ 1,20 = R$ 9.480.000. (5) Custo como % do PL = R$ 9,48M ÷ R$ 300M = 3,16%. Esse é o 'prêmio do seguro' para 50 dias de proteção.", next: "resolution_put" },
        { id: "market_fwd", label: "7.900 contratos", correct: false, score: 5, feedback: "Memória de cálculo: 7.900 contratos × 100 ações = 790.000 ações protegidas. Isso é apenas 10% da carteira (790k de 7,9M). Os outros 90% ficariam expostos. O correto: 7.900.000 ÷ 100 = 79.000 contratos.", next: "resolution_put" },
        { id: "spot_rate", label: "39.500 contratos (hedge de 50%)", correct: false, score: 10, feedback: "Memória de cálculo: 39.500 × 100 = 3.950.000 ações = 50% da carteira. Custo menor (R$ 4,74M), mas metade da carteira fica desprotegida. A diretoria pediu proteção contra quedas superiores a 10% — hedge parcial não atende.", next: "resolution_put" }
      ]},
      { id: "resolution_put", type: "resolution", prompt: "50 dias se passaram. PETR4 divulgou resultados. Qual foi o preço no vencimento da put?", scenarios: [
        { id: "queda_forte", label: "Cenário A: PETR4 caiu para R$ 28,00 (−26,3%)", fixingRate: 28.00, description: "Resultado muito abaixo do esperado. A ação despencou." },
        { id: "alta", label: "Cenário B: PETR4 subiu para R$ 45,00 (+18,4%)", fixingRate: 45.00, description: "Resultado surpreendeu positivamente. A ação disparou." },
        { id: "estavel", label: "Cenário C: PETR4 ficou em R$ 36,00 (−5,3%)", fixingRate: 36.00, description: "Resultado em linha. Queda moderada dentro do tolerado." }
      ]}
    ]
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
      question: "Como proteger o piso de receita com custo reduzido?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a motivação ao montar um collar?", choices: [
        { id: "hedge", label: "Hedge — criar piso de receita com custo reduzido (collar = put + call vendida)", correct: true, score: 20, feedback: "Correto! O collar cria um corredor: piso em R$ 5,00 (put comprada) e teto em R$ 5,45 (call vendida). Memória de cálculo do custo: put comprada = R$ 0,08/USD (paga), call vendida = R$ 0,06/USD (recebe). Custo líquido = R$ 0,08 − R$ 0,06 = R$ 0,02/USD — 75% mais barato que a put isolada.", next: "strategy_collar" },
        { id: "speculation", label: "Especulação — apostar na direção do câmbio", correct: false, score: 5, feedback: "Há recebíveis reais de USD 30M a proteger. A motivação é operacional, não especulativa.", next: "strategy_collar" },
        { id: "arbitrage", label: "Arbitragem", correct: false, score: 0, feedback: "Não há mispricing a explorar. O collar é uma estratégia de hedge com custo otimizado.", next: "strategy_collar" }
      ]},
      { id: "strategy_collar", type: "choice", prompt: "Qual a estrutura correta do collar para um exportador que vai RECEBER dólares?", choices: [
        { id: "buy_usd", label: "Comprar put R$ 5,00 (piso) + Vender call R$ 5,45 (teto)", correct: true, score: 25, feedback: "Memória de cálculo: (1) Put comprada R$ 5,00: garante venda dos USD a no mínimo R$ 5,00. Se dólar cair abaixo, a put compensa. (2) Call vendida R$ 5,45: obriga a vender USD a R$ 5,45 se o dólar ultrapassar esse nível. (3) Corredor de receita: entre R$ 5,00 e R$ 5,45 por dólar. (4) Custo líquido: R$ 0,02/USD × 30M = R$ 600.000. (5) Tradeoff: proteção no piso custa participação acima do teto.", next: "contract_collar" },
        { id: "sell_usd", label: "Comprar put R$ 5,00 isolada (sem vender call)", correct: false, score: 10, feedback: "A put isolada protege sem limitar o upside, mas custa R$ 0,08/USD × 30M = R$ 2.400.000. A diretoria considera caro. O collar reduz o custo para R$ 0,02/USD × 30M = R$ 600.000 — 75% de economia. O tradeoff é abrir mão do ganho acima de R$ 5,45.", next: "contract_collar" },
        { id: "sell_usd_teorico", label: "Vender call R$ 5,45 isolada (sem comprar put)", correct: false, score: 5, feedback: "Vender call gera receita de R$ 0,06/USD, mas deixa o exportador sem proteção contra queda do dólar. Se o dólar cair para R$ 4,50, a perda de receita é enorme. A call vendida isolada não é hedge — é especulação na estabilidade do câmbio.", next: "contract_collar" }
      ]},
      { id: "contract_collar", type: "choice", prompt: "Qual é o custo total do collar e a receita mínima garantida?", choices: [
        { id: "above_fwd", label: "Custo: R$ 600 mil. Receita mínima: R$ 5,00/USD × 30M = R$ 150M (menos custo R$ 0,6M = R$ 149,4M)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Custo líquido = (R$ 0,08 − R$ 0,06) × 30.000.000 = R$ 600.000. (2) Piso: se dólar < R$ 5,00, exerce put → recebe R$ 5,00/USD. Receita = R$ 5,00 × 30M = R$ 150M − R$ 0,6M = R$ 149,4M. (3) Teto: se dólar > R$ 5,45, call é exercida contra você → entrega USD a R$ 5,45. Receita = R$ 5,45 × 30M = R$ 163,5M − R$ 0,6M = R$ 162,9M. (4) Corredor: entre R$ 149,4M e R$ 162,9M de receita.", next: "resolution_collar" },
        { id: "market_fwd", label: "Custo: R$ 2,4 milhões. Receita mínima: R$ 150M", correct: false, score: 5, feedback: "R$ 2,4M é o custo da put isolada (R$ 0,08 × 30M), sem subtrair a receita da call vendida. Memória de cálculo: Put paga = R$ 0,08 × 30M = R$ 2,4M. Call recebida = R$ 0,06 × 30M = R$ 1,8M. Custo líquido = R$ 2,4M − R$ 1,8M = R$ 600.000.", next: "resolution_collar" },
        { id: "spot_rate", label: "Custo: zero (prêmios se cancelam)", correct: false, score: 0, feedback: "Os prêmios não se cancelam exatamente. Put = R$ 0,08 (paga) vs Call = R$ 0,06 (recebe). Diferença = R$ 0,02/USD × 30M = R$ 600.000 de custo líquido. Para custo zero seria necessário strikes diferentes ou um collar 'zero cost' calibrado para isso.", next: "resolution_collar" }
      ]},
      { id: "resolution_collar", type: "resolution", prompt: "90 dias se passaram. Onde fechou o dólar?", scenarios: [
        { id: "dolar_caiu", label: "Cenário A: Dólar caiu para R$ 4,60 (−11,5%)", fixingRate: 4.60, description: "Real valorizou forte. Sem hedge, receita seria R$ 4,60 × 30M = R$ 138M. Com collar, put exercida: receita = R$ 5,00 × 30M = R$ 150M − custo R$ 0,6M = R$ 149,4M." },
        { id: "dolar_subiu", label: "Cenário B: Dólar subiu para R$ 5,70 (+9,6%)", fixingRate: 5.70, description: "Dólar subiu além do teto. Call exercida contra o exportador: entrega USD a R$ 5,45. Receita = R$ 5,45 × 30M = R$ 163,5M − custo R$ 0,6M = R$ 162,9M. 'Perdeu' R$ 0,25/USD de upside." },
        { id: "dolar_medio", label: "Cenário C: Dólar ficou em R$ 5,25 (+1,0%)", fixingRate: 5.25, description: "Dólar dentro do corredor. Ambas as opções vencem OTM. Receita = R$ 5,25 × 30M = R$ 157,5M − custo R$ 0,6M = R$ 156,9M." }
      ]}
    ]
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
      question: "O ativo vai se mover, mas em qual direção? Como lucrar com o movimento?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta operação?", choices: [
        { id: "speculation", label: "Especulação em volatilidade — aposta que o ativo vai se mover mais do que o mercado precifica", correct: true, score: 20, feedback: "Correto! O straddle lucra com o MOVIMENTO, não com a DIREÇÃO. Você está comprando volatilidade: a IV atual (35%) está abaixo da média pré-resultado (50%). Se o resultado causar um movimento forte — para qualquer lado — o straddle lucra. Se o ativo ficar parado, perde o prêmio.", next: "strategy_straddle" },
        { id: "hedge", label: "Hedge — proteger uma posição existente", correct: false, score: 5, feedback: "Não há posição em VALE3 a proteger. O straddle é uma aposta pura em volatilidade.", next: "strategy_straddle" },
        { id: "arbitrage", label: "Especulação direcional — apostar na alta ou queda", correct: false, score: 0, feedback: "O straddle é neutro em direção — lucra tanto na alta quanto na queda. Se soubesse a direção, compraria apenas call ou apenas put, que seriam mais baratas.", next: "strategy_straddle" }
      ]},
      { id: "strategy_straddle", type: "choice", prompt: "Qual estratégia para lucrar com movimento forte em qualquer direção?", choices: [
        { id: "buy_usd", label: "Comprar straddle (call ATM + put ATM) — lucra com movimento grande", correct: true, score: 25, feedback: "Memória de cálculo: (1) Call ATM R$ 62,00: prêmio R$ 2,50. (2) Put ATM R$ 62,00: prêmio R$ 2,30. (3) Custo total = R$ 4,80/ação. (4) Breakeven superior = R$ 62,00 + R$ 4,80 = R$ 66,80 (+7,7%). (5) Breakeven inferior = R$ 62,00 − R$ 4,80 = R$ 57,20 (−7,7%). (6) A ação precisa se mover mais de 7,7% em qualquer direção para o straddle dar lucro. (7) Perda máxima = prêmio total = R$ 4,80/ação (se ação fechar exatamente no strike).", next: "contract_straddle" },
        { id: "sell_usd", label: "Vender straddle — lucra se o ativo ficar parado", correct: false, score: 0, feedback: "Vender straddle lucra com a estabilidade do ativo — oposto da sua tese! Você acredita que o resultado vai gerar movimento forte. Vender straddle teria risco ilimitado se o ativo se mover.", next: "contract_straddle" },
        { id: "sell_usd_teorico", label: "Comprar apenas call — apostar na alta", correct: false, score: 5, feedback: "Comprar apenas call é aposta direcional na alta. Você não sabe a direção — se o resultado for ruim e a ação cair, a call vence sem valor. O straddle lucra em ambas as direções.", next: "contract_straddle" }
      ]},
      { id: "contract_straddle", type: "choice", prompt: "O stop loss é R$ 3 milhões. A perda máxima do straddle é o prêmio total (R$ 4,80/ação). Cada contrato na B3 = 100 ações. Quantos contratos?", choices: [
        { id: "above_fwd", label: "6.250 contratos", correct: true, score: 20, feedback: "Memória de cálculo: (1) Perda máxima por contrato = R$ 4,80 × 100 ações = R$ 480. (2) Contratos máximos = R$ 3.000.000 ÷ R$ 480 = 6.250 contratos. (3) Total de ações = 6.250 × 100 = 625.000 ações. (4) Custo total = 625.000 × R$ 4,80 = R$ 3.000.000 (= stop loss). (5) Para lucrar, VALE3 precisa fechar acima de R$ 66,80 ou abaixo de R$ 57,20.", next: "resolution_straddle" },
        { id: "market_fwd", label: "10.000 contratos", correct: false, score: 5, feedback: "Memória de cálculo: 10.000 × 100 × R$ 4,80 = R$ 4.800.000. Excede o stop loss de R$ 3M em 60%! Correto: R$ 3.000.000 ÷ (R$ 4,80 × 100) = 6.250 contratos.", next: "resolution_straddle" },
        { id: "spot_rate", label: "3.000 contratos", correct: false, score: 10, feedback: "Memória de cálculo: 3.000 × 100 × R$ 4,80 = R$ 1.440.000. Usa apenas 48% do limite de R$ 3M. Sub-utiliza o limite de risco. Correto: 6.250 contratos.", next: "resolution_straddle" }
      ]},
      { id: "resolution_straddle", type: "resolution", prompt: "O resultado de VALE3 saiu. Onde fechou a ação?", scenarios: [
        { id: "queda_forte", label: "Cenário A: VALE3 caiu para R$ 52,00 (−16,1%)", fixingRate: 52.00, description: "Resultado decepcionante. Queda de R$ 10,00 por ação. Put deep ITM, call vence OTM." },
        { id: "alta_forte", label: "Cenário B: VALE3 subiu para R$ 72,00 (+16,1%)", fixingRate: 72.00, description: "Resultado excepcional. Alta de R$ 10,00 por ação. Call deep ITM, put vence OTM." },
        { id: "estavel", label: "Cenário C: VALE3 ficou em R$ 63,00 (+1,6%)", fixingRate: 63.00, description: "Resultado em linha com expectativas. Movimento mínimo — abaixo dos breakevens." }
      ]}
    ]
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
      question: "O skew de volatilidade está exagerado. Como capturar essa distorção?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta oportunidade?", choices: [
        { id: "arbitrage", label: "Arbitragem de volatilidade — o skew está exagerado; vender vol cara (put) e comprar vol barata (call)", correct: true, score: 25, feedback: "Correto! O risk reversal explora a distorção do skew. Puts com IV de 18% estão 'caras' em relação às calls com IV de 11%. Ao vender a put cara e comprar a call barata, você embolsa o diferencial. Entretanto, a posição tem risco direcional: se o dólar cair abaixo de R$ 4,90, a put vendida gera prejuízo potencialmente grande.", next: "strategy_rr" },
        { id: "speculation", label: "Especulação direcional — apostar na alta do dólar", correct: false, score: 10, feedback: "O risk reversal tem componente direcional (ganha se dólar sobe), mas a motivação principal é explorar o mispricing do skew — a put está cara demais em relação à call. Se fosse pura direcionalidade, bastaria comprar call.", next: "strategy_rr" },
        { id: "hedge", label: "Hedge de uma posição cambial", correct: false, score: 0, feedback: "Não há exposição cambial a proteger. A operação é de valor relativo — explorar a distorção no preço relativo de puts vs calls.", next: "strategy_rr" }
      ]},
      { id: "strategy_rr", type: "choice", prompt: "Qual a estrutura do risk reversal para capturar o skew?", choices: [
        { id: "buy_usd", label: "Vender put R$ 4,90 (recebe R$ 0,12) + Comprar call R$ 5,55 (paga R$ 0,05) — crédito líquido R$ 0,07", correct: true, score: 30, feedback: "Memória de cálculo: (1) Put vendida R$ 4,90: recebe prêmio R$ 0,12/USD = R$ 0,12 × 50M = R$ 6.000.000. (2) Call comprada R$ 5,55: paga prêmio R$ 0,05/USD = R$ 0,05 × 50M = R$ 2.500.000. (3) Crédito líquido = R$ 6.000.000 − R$ 2.500.000 = R$ 3.500.000. (4) Se dólar entre R$ 4,90 e R$ 5,55: ambas vencem OTM, embolsa crédito. (5) Se dólar > R$ 5,55: call exercida = ganho ilimitado. (6) Se dólar < R$ 4,90: put exercida contra você = risco de perda grande.", next: "contract_rr" },
        { id: "sell_usd", label: "Comprar put R$ 4,90 + Vender call R$ 5,55 — paga o skew", correct: false, score: 0, feedback: "Isso inverte a lógica! Comprando a put cara (IV 18%) e vendendo a call barata (IV 11%), você PAGA o skew ao invés de receber. Custo líquido = R$ 0,07/USD. A operação correta é o oposto.", next: "contract_rr" },
        { id: "sell_usd_teorico", label: "Comprar straddle ATM — posição de volatilidade pura", correct: false, score: 5, feedback: "O straddle compra volatilidade em ambas as direções. Mas o mispricing está no SKEW (diferença entre IV de put e call), não no nível absoluto de vol. O risk reversal é o instrumento correto para capturar distorções de skew.", next: "contract_rr" }
      ]},
      { id: "contract_rr", type: "choice", prompt: "Qual é a perda máxima se o dólar cair para R$ 4,00? Lembre-se: a put vendida obriga você a comprar USD a R$ 4,90.", choices: [
        { id: "above_fwd", label: "R$ 41,5 milhões", correct: true, score: 20, feedback: "Memória de cálculo: (1) Put vendida: obrigação de comprar USD a R$ 4,90. Com dólar a R$ 4,00: perda = (R$ 4,90 − R$ 4,00) × 50M = R$ 45.000.000. (2) Call comprada: vence sem valor (OTM). (3) Crédito líquido recebido = R$ 3.500.000. (4) Perda líquida = R$ 45.000.000 − R$ 3.500.000 = R$ 41.500.000. Esta é a razão pela qual o risk reversal exige margem e limite de risco rigoroso — a put vendida tem risco de perda muito grande se o dólar cair.", next: "resolution_rr" },
        { id: "market_fwd", label: "R$ 3,5 milhões (apenas o crédito recebido)", correct: false, score: 0, feedback: "R$ 3,5M é o crédito líquido recebido — não é a perda máxima! A put vendida cria obrigação ilimitada. Memória de cálculo: se dólar = R$ 4,00, perda na put = (4,90 − 4,00) × 50M = R$ 45M. Menos crédito R$ 3,5M = perda líquida de R$ 41,5M. Confundir crédito recebido com perda máxima é um erro crítico em opções vendidas.", next: "resolution_rr" },
        { id: "spot_rate", label: "R$ 45 milhões", correct: false, score: 10, feedback: "R$ 45M é a perda bruta na put, mas esquece de subtrair o crédito líquido recebido. Memória de cálculo: (1) Perda na put = (4,90 − 4,00) × 50M = R$ 45M. (2) Crédito recebido = R$ 3,5M. (3) Perda líquida = R$ 45M − R$ 3,5M = R$ 41,5M.", next: "resolution_rr" }
      ]},
      { id: "resolution_rr", type: "resolution", prompt: "90 dias se passaram. Onde fechou o dólar?", scenarios: [
        { id: "dolar_caiu", label: "Cenário A: Dólar caiu para R$ 4,50 (−13,5%)", fixingRate: 4.50, description: "O mercado estava certo em precificar mais risco de queda. Put exercida contra o banco." },
        { id: "dolar_subiu", label: "Cenário B: Dólar subiu para R$ 5,80 (+11,5%)", fixingRate: 5.80, description: "O skew estava exagerado. A call comprada entrou ITM e o banco embolsou o crédito + ganho da call." },
        { id: "dolar_estavel", label: "Cenário C: Dólar ficou em R$ 5,15 (−1,0%)", fixingRate: 5.15, description: "Dólar dentro do corredor R$ 4,90 – R$ 5,55. Ambas vencem OTM." }
      ]}
    ]
  }
];

/* ═══════════════════════════════════════════════════════════════
   BANCO DE CENÁRIOS — DERIVATIVOS DE CRÉDITO
   ═══════════════════════════════════════════════════════════════ */

const CREDITO_SCENARIOS = [
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
      question: "Como proteger a carteira de crédito sem vender os títulos?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a motivação ao contratar um CDS?", choices: [
        { id: "hedge", label: "Hedge de crédito — proteger contra default da emissora sem vender os títulos", correct: true, score: 20, feedback: "Correto! O CDS transfere o risco de crédito mantendo os títulos em carteira. Memória de cálculo do custo: (1) Spread = 280 bps = 2,80% a.a. (2) Custo anual = 2,80% × R$ 500M = R$ 14.000.000/ano. (3) Custo total em 2 anos ≈ R$ 28.000.000. Esse é o 'prêmio do seguro de crédito'. Vantagens vs vender: (a) não realiza perda a mercado, (b) mantém a relação com o emissor, (c) o hedge pode ser desfeito se o risco diminuir.", next: "strategy_cds" },
        { id: "speculation", label: "Especulação — apostar no default da construtora", correct: false, score: 5, feedback: "Há uma carteira real de R$ 500M a proteger. Comprar CDS sem exposição subjacente seria 'naked CDS' (especulação). Aqui a motivação é proteger um ativo existente.", next: "strategy_cds" },
        { id: "arbitrage", label: "Arbitragem entre CDS e debênture", correct: false, score: 0, feedback: "Arbitragem (basis trade) exigiria explorar diferença entre spread do CDS e spread da debênture. Aqui a motivação é operacional: proteger a carteira.", next: "strategy_cds" }
      ]},
      { id: "strategy_cds", type: "choice", prompt: "No CDS, qual posição o Banco Horizonte deve tomar? Lembre-se: o banco JÁ TEM as debêntures (exposição ao risco de crédito).", choices: [
        { id: "buy_usd", label: "Comprar proteção — pagar 280 bps a.a. e receber indenização em caso de default", correct: true, score: 25, feedback: "Memória de cálculo da indenização em caso de default: (1) Nocional = R$ 500M. (2) Recovery rate = 35% (o que se espera recuperar). (3) LGD (Loss Given Default) = 1 − 35% = 65%. (4) Indenização do CDS = R$ 500M × 65% = R$ 325.000.000. (5) Perda residual = R$ 500M × 35% = R$ 175M (parcela do recovery, que o banco pode recuperar no processo de RJ). O CDS cobre a parcela de perda acima do recovery.", next: "contract_cds" },
        { id: "sell_usd", label: "Vender proteção — receber 280 bps a.a. e pagar em caso de default", correct: false, score: 0, feedback: "Vender proteção = ASSUMIR mais risco de crédito sobre a mesma emissora. Você já tem R$ 500M de exposição via debêntures. Vender proteção DOBRARIA a exposição: se a construtora der default, o banco perde nos títulos E paga a indenização do CDS. É exatamente o oposto do hedge!", next: "contract_cds" }
      ]},
      { id: "contract_cds", type: "choice", prompt: "Qual nocional de CDS contratar?", choices: [
        { id: "above_fwd", label: "R$ 500 milhões — hedge integral", correct: true, score: 20, feedback: "Memória de cálculo: (1) Exposição = R$ 500M em debêntures. (2) CDS nocional = R$ 500M → proteção de 100%. (3) Custo anual = 2,80% × R$ 500M = R$ 14M. (4) Em caso de default: indenização = R$ 500M × 65% = R$ 325M. (5) Perda líquida = custo do spread pago + parcela do recovery. O hedge integral é a abordagem mais conservadora.", next: "resolution_cds" },
        { id: "market_fwd", label: "R$ 250 milhões — hedge parcial de 50%", correct: false, score: 10, feedback: "Memória de cálculo: (1) CDS R$ 250M → protege 50%. (2) Se default: indenização = R$ 250M × 65% = R$ 162,5M. (3) Perda sem proteção nos outros R$ 250M = R$ 250M × 65% = R$ 162,5M. (4) Perda total = R$ 162,5M + custo do spread. Hedge parcial economiza no spread mas deixa metade exposta.", next: "resolution_cds" },
        { id: "spot_rate", label: "R$ 750 milhões — over-hedge", correct: false, score: 0, feedback: "Memória de cálculo: (1) CDS R$ 750M sobre exposição de R$ 500M = over-hedge de R$ 250M. (2) O excedente de R$ 250M é posição especulativa: lucra com o default além da perda real. (3) Custo = 2,80% × R$ 750M = R$ 21M/ano. (4) Over-hedge pode gerar problemas regulatórios e contábeis.", next: "resolution_cds" }
      ]},
      { id: "resolution_cds", type: "resolution", prompt: "2 anos se passaram. O que aconteceu com a Construtora Atlântico?", scenarios: [
        { id: "default", label: "Cenário A: Construtora entrou em recuperação judicial (default)", fixingRate: 490, description: "Evento de crédito confirmado após 12 meses. O CDS foi acionado." },
        { id: "upgrade", label: "Cenário B: Rating elevado para A+ (risco diminuiu)", fixingRate: 120, description: "Reformas internas e melhora do setor levaram ao upgrade. Spread de mercado caiu de 280 para 120 bps." },
        { id: "estavel", label: "Cenário C: Rating mantido, setor estabilizou", fixingRate: 260, description: "Sem evento de crédito. Spread estável em ~260 bps. O seguro não foi acionado." }
      ]}
    ]
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
      question: "Como obter exposição a crédito sem caixa disponível?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a motivação ao contratar um TRS?", choices: [
        { id: "hedge", label: "Exposição sintética — obter retorno da debênture sem comprá-la (sem usar caixa)", correct: true, score: 20, feedback: "Correto! O TRS replica a posição econômica sem compra física. Memória de cálculo: (1) Compra direta: desembolso de R$ 200M (indisponível). (2) Via TRS: desembolso ≈ zero (apenas margem de ~5-10%). (3) Retorno recebido = CDI + 1,80% (idêntico a deter o título). (4) Custo pago = CDI + 0,50%. (5) Spread líquido = 1,80% − 0,50% = 1,30% a.a. → R$ 2.600.000/ano (se preço não variar). É como 'alugar' a posição — alavancagem implícita.", next: "strategy_trs" },
        { id: "speculation", label: "Especulação em taxa de juros", correct: false, score: 5, feedback: "O TRS dá exposição ao crédito específico (Energia Renovável), não a juros em geral. A motivação é capturar o spread de crédito atrativo.", next: "strategy_trs" },
        { id: "arbitrage", label: "Hedge de uma posição existente", correct: false, score: 0, feedback: "Não há posição a proteger. O TRS cria uma posição nova — exposição sintética longa em crédito.", next: "strategy_trs" }
      ]},
      { id: "strategy_trs", type: "choice", prompt: "No TRS, qual perna o fundo deve tomar?", choices: [
        { id: "buy_usd", label: "Receber retorno total (cupom + variação de preço) e pagar CDI + 0,50%", correct: true, score: 25, feedback: "Memória de cálculo: (1) Recebe: CDI + 1,80% (cupom) + variação de preço da debênture. (2) Paga: CDI + 0,50% (financiamento). (3) Os CDIs se cancelam parcialmente: resultado = 1,30% a.a. + Δpreço. (4) Se debênture valorizar 3%: ganho = 1,30% + 3,00% = 4,30% × R$ 200M = R$ 8,6M. (5) Se desvalorizar 8%: perda = 1,30% − 8,00% = −6,70% × R$ 200M = −R$ 13,4M. RISCO: o TRS transfere tanto o retorno QUANTO o risco — perda de preço é absorvida integralmente pelo fundo.", next: "contract_trs" },
        { id: "sell_usd", label: "Pagar retorno total e receber CDI + 0,50% (posição vendida)", correct: false, score: 0, feedback: "Pagar retorno total = ficar sinteticamente vendido na debênture. Você lucraria se o papel perdesse valor — uma aposta contra o crédito. Mas a tese é que a debênture está atrativa (quer ganhar com ela, não contra).", next: "contract_trs" }
      ]},
      { id: "contract_trs", type: "choice", prompt: "O rating da Energia Renovável é rebaixado de AA para BBB e o preço da debênture cai 8%. Qual é o impacto no TRS?", choices: [
        { id: "above_fwd", label: "Perda de R$ 13,4M (variação de −8% menos spread de +1,30%)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Variação de preço = −8% × R$ 200M = −R$ 16.000.000. (2) Spread de cupom recebido em 1 ano = 1,30% × R$ 200M = +R$ 2.600.000. (3) Resultado líquido = −R$ 16.000.000 + R$ 2.600.000 = −R$ 13.400.000. O recebedor do retorno total absorve integralmente a perda de preço — o TRS não é um hedge, é uma exposição sintética com todos os riscos do ativo.", next: "resolution_trs" },
        { id: "market_fwd", label: "Sem impacto — o TRS protege contra variação de preço", correct: false, score: 0, feedback: "Errado! O TRS transfere o retorno TOTAL — inclusive perdas. Retorno total = cupom + variação de preço. Se o preço cai 8%, essa perda é do recebedor (o fundo). Memória: −8% × R$ 200M = −R$ 16M, parcialmente compensada pelo spread de R$ 2,6M → perda líquida R$ 13,4M.", next: "resolution_trs" },
        { id: "spot_rate", label: "Perda de R$ 16M (apenas a variação de preço)", correct: false, score: 10, feedback: "R$ 16M é a perda bruta de preço, mas esquece o spread de cupom recebido. Memória: (1) Perda de preço = −R$ 16M. (2) Spread = +R$ 2,6M. (3) Líquido = −R$ 13,4M. O carry parcialmente amortece a perda.", next: "resolution_trs" }
      ]},
      { id: "resolution_trs", type: "resolution", prompt: "1 ano se passou. Qual foi o desempenho da debênture?", scenarios: [
        { id: "valorizou", label: "Cenário A: Debênture valorizou 3% (spread comprimiu)", fixingRate: 3.0, description: "Crédito melhorou. O papel se valorizou e o fundo capturou o carry + ganho de preço." },
        { id: "desvalorizou", label: "Cenário B: Debênture caiu 12% (rebaixamento + estresse)", fixingRate: -12.0, description: "Choque de crédito. O papel perdeu valor e o fundo absorveu a perda integral." },
        { id: "estavel", label: "Cenário C: Preço estável (sem variação)", fixingRate: 0.0, description: "Sem evento adverso. O fundo capturou apenas o carry." }
      ]}
    ]
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
      question: "O risco fiscal está subestimado. Como apostar na deterioração do crédito soberano?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta operação?", choices: [
        { id: "speculation", label: "Especulação — apostar na deterioração do crédito soberano (alargamento do spread)", correct: true, score: 20, feedback: "Correto! Este é um 'naked CDS' — compra de proteção sem deter títulos brasileiros. É como comprar seguro de uma casa que não é sua: a motivação é puramente especulativa. No mercado de CDS, comprar proteção = apostar na piora do crédito. A posição lucra se o spread subir e perde se comprimir.", next: "strategy_naked" },
        { id: "hedge", label: "Hedge — proteger títulos brasileiros em carteira", correct: false, score: 5, feedback: "Não há títulos brasileiros na carteira. Se houvesse, seria hedge legítimo. Sem o ativo, comprar CDS é especulação pura — 'naked CDS'.", next: "strategy_naked" },
        { id: "arbitrage", label: "Arbitragem", correct: false, score: 0, feedback: "Não há distorção entre instrumentos a explorar. A tese é direcional: o spread do CDS Brasil está baixo demais dado o risco fiscal.", next: "strategy_naked" }
      ]},
      { id: "strategy_naked", type: "choice", prompt: "Para lucrar com o ALARGAMENTO do spread (piora do crédito), qual posição?", choices: [
        { id: "buy_usd", label: "Comprar proteção (pagar 180 bps) — lucra se spread alargar", correct: true, score: 25, feedback: "Memória de cálculo: (1) Custo anual (carry) = 180 bps × USD 50M = USD 900.000/ano. (2) DV01 total = USD 4.500 × (50M/10M) = USD 22.500 por 1bp de variação. (3) Se spread alargar de 180 para 375 bps (195 bps): ganho mark-to-market = USD 22.500 × 195 = USD 4.387.500. (4) Menos carry de ~12 meses = −USD 900.000. (5) Lucro líquido ≈ USD 3.487.500.", next: "contract_naked" },
        { id: "sell_usd", label: "Vender proteção (receber 180 bps) — lucra se spread comprimir", correct: false, score: 0, feedback: "Vender proteção = apostar na MELHORA do crédito brasileiro. Isso é o oposto da sua tese! Se o spread alargar, você perde; se houver default soberano, a perda é catastrófica.", next: "contract_naked" }
      ]},
      { id: "contract_naked", type: "choice", prompt: "O stop loss é USD 5M. No cenário adverso, o spread comprime de 180 para 80 bps (−100 bps). O nocional de USD 50M está adequado?", choices: [
        { id: "above_fwd", label: "Sim — perda seria USD 2,25M + carry, dentro do stop", correct: true, score: 20, feedback: "Memória de cálculo: (1) DV01 total = USD 22.500/bp. (2) Compressão de 100 bps → perda mark-to-market = USD 22.500 × 100 = USD 2.250.000. (3) Carry anual = USD 900.000. (4) Perda total (pior caso 12 meses) ≈ USD 3.150.000. (5) Stop loss = USD 5.000.000. (6) Margem restante = USD 1.850.000. (7) O spread precisaria comprimir ~222 bps para atingir o stop (impossível — iria a −42 bps). Nocional adequado.", next: "resolution_naked" },
        { id: "market_fwd", label: "Não — deveria reduzir para USD 20M", correct: false, score: 10, feedback: "Com USD 20M: DV01 = USD 9.000/bp. Perda no stress (−100bps) = USD 900.000 + carry USD 360k = USD 1.260.000. Muito conservador — usa apenas 25% do limite. Com USD 50M a perda total seria ~USD 3,15M, ainda dentro do stop de USD 5M.", next: "resolution_naked" },
        { id: "spot_rate", label: "Não — deveria aumentar para USD 150M", correct: false, score: 0, feedback: "Com USD 150M: DV01 = USD 67.500/bp. Perda no stress (−100bps) = USD 6.750.000 + carry USD 2.700.000 = USD 9.450.000. Estoura o stop de USD 5M em quase 2x!", next: "resolution_naked" }
      ]},
      { id: "resolution_naked", type: "resolution", prompt: "12 meses se passaram. O que aconteceu com o CDS Brasil?", scenarios: [
        { id: "alargou", label: "Cenário A: Spread alargou para 380 bps (crise fiscal)", fixingRate: 380, description: "Deterioração fiscal confirmada. O spread quase dobrou. A posição lucrou com o mark-to-market." },
        { id: "comprimiu", label: "Cenário B: Spread comprimiu para 110 bps (reformas aprovadas)", fixingRate: 110, description: "Reformas fiscais surpreenderam positivamente. O spread caiu forte e a posição perdeu." },
        { id: "estavel", label: "Cenário C: Spread estável em 190 bps", fixingRate: 190, description: "Nem piora nem melhora significativa. A posição carregou o custo do spread." }
      ]}
    ]
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
      question: "O CDS está mais caro que o bond. Como capturar a convergência?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta oportunidade?", choices: [
        { id: "arbitrage", label: "Arbitragem de base — CDS spread (210 bps) acima do bond spread (150 bps); a base deve convergir", correct: true, score: 25, feedback: "Correto! A base negativa (CDS > bond) indica distorção. Memória de cálculo: (1) Bond spread = 150 bps (receita). (2) CDS spread = 210 bps (custo da proteção). (3) Base = 210 − 150 = 60 bps. (4) Carry líquido = +150 − 210 = −60 bps a.a. (carrego negativo). A posição paga para carregar, mas lucra quando a base converge — análogo à arbitragem de forward no NDF.", next: "strategy_basis" },
        { id: "speculation", label: "Especulação direcional em crédito", correct: false, score: 5, feedback: "O basis trade é neutro em crédito: se a Vale der default, a debênture perde valor mas o CDS indeniza. A aposta é na convergência da BASE, não na direção do crédito.", next: "strategy_basis" },
        { id: "hedge", label: "Hedge de carteira existente", correct: false, score: 0, feedback: "Não é hedge — é uma posição nova que combina compra de debênture + compra de CDS para capturar a distorção de preço relativo.", next: "strategy_basis" }
      ]},
      { id: "strategy_basis", type: "choice", prompt: "Como montar o basis trade?", choices: [
        { id: "buy_usd", label: "Comprar debênture VALE (CDI + 1,50%) + Comprar proteção CDS VALE (210 bps)", correct: true, score: 30, feedback: "Memória de cálculo: (1) Perna 1 — compra debênture a CDI + 150 bps, financiada a CDI (compromissada). Rendimento líquido = +150 bps. (2) Perna 2 — compra proteção CDS a 210 bps. Custo = −210 bps. (3) Carry líquido = +150 − 210 = −60 bps a.a. = −R$ 600.000/ano sobre R$ 100M. (4) A posição paga para carregar, mas se a base convergir (CDS cair para ~150 bps), o CDS ganha valor e o lucro compensa o carry. (5) Se houver default: perda na debênture é compensada pela indenização do CDS — posição neutra em crédito.", next: "contract_basis" },
        { id: "sell_usd", label: "Comprar debênture VALE sem proteção CDS", correct: false, score: 5, feedback: "Sem o CDS, é uma posição direcional longa em crédito VALE. Lucra se o crédito melhorar, mas perde tudo no default. O basis trade exige ambas as pernas para isolar a base.", next: "contract_basis" },
        { id: "sell_usd_teorico", label: "Apenas comprar CDS VALE (naked)", correct: false, score: 5, feedback: "Naked CDS = especulação na piora do crédito. É uma posição direcional, não arbitragem de base. O basis trade combina debênture + CDS para capturar a convergência da base, neutro em crédito.", next: "contract_basis" }
      ]},
      { id: "contract_basis", type: "choice", prompt: "O carry é −60 bps a.a. (= −R$ 600k/ano). O DV01 do CDS = R$ 4.200 por R$ 10M. Se a base fechar totalmente (CDS cai 60 bps), em quantos meses o ganho paga o carry?", choices: [
        { id: "above_fwd", label: "~2,9 meses", correct: true, score: 20, feedback: "Memória de cálculo: (1) Carry mensal = R$ 600.000 ÷ 12 = R$ 50.000/mês. (2) DV01 total = R$ 4.200 × (100M ÷ 10M) = R$ 42.000 por 1bp. (3) Ganho se base fechar 60 bps = R$ 42.000 × 60 = R$ 2.520.000. (4) Breakeven = R$ 600.000 ÷ R$ 2.520.000 = 0,238 anos ≈ 2,86 meses. Se a base convergir em menos de ~3 meses, a operação já dá lucro. A convergência pode ocorrer a qualquer momento — é aposta de valor relativo, não de prazo fixo.", next: "resolution_basis" },
        { id: "market_fwd", label: "12 meses", correct: false, score: 5, feedback: "12 meses assume que o ganho só ocorre no vencimento. Memória: DV01 total = R$ 42.000/bp. Ganho se base fechar = R$ 42.000 × 60 = R$ 2.520.000. Carry anual = R$ 600.000. Breakeven = R$ 600k ÷ R$ 2.520k = 2,9 meses. A convergência pode ocorrer muito antes do vencimento.", next: "resolution_basis" },
        { id: "spot_rate", label: "Nunca — o carry negativo sempre supera o ganho", correct: false, score: 0, feedback: "Incorreto. O carry de −R$ 600k/ano é linear, mas o ganho de convergência (R$ 2.520.000 para 60 bps) é de uma só vez. O breakeven é ~2,9 meses. O maior risco não é o carry, é a base NÃO convergir (timing risk).", next: "resolution_basis" }
      ]},
      { id: "resolution_basis", type: "resolution", prompt: "Meses se passaram. O que aconteceu com a base CDS-bond?", scenarios: [
        { id: "convergiu", label: "Cenário A: Base convergiu — CDS caiu para 155 bps em 4 meses", fixingRate: 155, description: "A base fechou de 60 para 5 bps. O CDS recuou 55 bps e a arbitragem funcionou." },
        { id: "divergiu", label: "Cenário B: Base divergiu — CDS subiu para 300 bps (estresse)", fixingRate: 300, description: "Estresse de crédito elevou o CDS mas a debênture também caiu. A base abriu para 150 bps." },
        { id: "estavel", label: "Cenário C: Base estável em 55 bps por 1 ano", fixingRate: 205, description: "Pouca convergência. O carry corroeu o resultado." }
      ]}
    ]
  }
];

/* ═══════════════════════════════════════════════════════════════
   BANCO DE CENÁRIOS — DERIVATIVOS EMBUTIDOS
   ═══════════════════════════════════════════════════════════════ */

const EMBUTIDOS_SCENARIOS = [
  {
    id: "emb_coe",
    title: "COE de Principal Garantido",
    theme: "Embutidos", themeId: "embutidos", instrument: "COE (Call S&P 500)",
    difficulty: "Intermediário", embeddedStrategy: "coe",
    context: {
      narrative: "Você é assessor de investimentos e um cliente com **R$ 500 mil** quer diversificar. O banco oferece um **COE de principal garantido** com exposição ao **S&P 500**: prazo de **2 anos**, principal 100% garantido, participação de **70% da alta** do S&P. O COE embute: (a) um **zero-cupom** que garante o principal e (b) uma **call sobre o S&P 500** que gera a participação. O CDI está em **11,75% a.a.**",
      marketData: { investimento: 500000, prazoAnos: 2, cdi: 0.1175, participacao: 0.70, sp500Atual: 5200 },
      displayFields: [["Investimento", "R$ 500 mil"], ["Prazo", "2 anos"], ["Principal", "100% garantido"], ["Participação", "70% do S&P"], ["S&P 500", "5.200 pts"], ["CDI", "11,75% a.a."]],
      question: "Qual derivativo está embutido no COE e qual o custo de oportunidade?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido neste COE?", choices: [
        { id: "buy_usd", label: "Call sobre o S&P 500 — o investidor compra implicitamente uma opção de compra sobre o índice", correct: true, score: 25, feedback: "Memória de cálculo da decomposição: (1) Valor do zero-cupom hoje = R$ 500.000 ÷ (1,1175)² = R$ 500.000 ÷ 1,2488 = R$ 400.480. (2) 'Troco' disponível para a call = R$ 500.000 − R$ 400.480 = R$ 99.520. (3) O banco usa os R$ 99.520 para comprar uma call sobre o S&P com participação de 70%. (4) O zero-cupom cresce a CDI e garante R$ 500k no vencimento. A call gera o upside.", next: "contract_coe" },
        { id: "sell_usd", label: "Put sobre o S&P 500 — a proteção do principal é uma put", correct: false, score: 5, feedback: "A proteção do principal não é uma put comprada pelo investidor — é financiada pelo zero-cupom. O 'seguro' vem do fato de que R$ 400.480 investidos ao CDI viram R$ 500k em 2 anos. A opção embutida é uma call (participação na alta).", next: "contract_coe" },
        { id: "sell_usd_teorico", label: "Swap de taxa de juros", correct: false, score: 0, feedback: "Não há troca de indexadores. O COE combina renda fixa (zero-cupom) com uma opção (call sobre o S&P).", next: "contract_coe" }
      ]},
      { id: "contract_coe", type: "choice", prompt: "Se o cliente investisse no CDI por 2 anos, quanto teria? Qual o custo de oportunidade do COE?", choices: [
        { id: "above_fwd", label: "CDI renderia ~R$ 124.400. O custo de oportunidade é abrir mão dessa renda em troca da call.", correct: true, score: 20, feedback: "Memória de cálculo: (1) CDI 2 anos = R$ 500.000 × [(1,1175)² − 1] = R$ 500.000 × 0,2488 = R$ 124.400. (2) No COE, se S&P cair ou ficar flat: recebe apenas R$ 500.000 — perde R$ 124.400 de oportunidade. (3) Breakeven: 70% × alta × R$ 500k = R$ 124.400 → alta mínima do S&P = R$ 124.400 ÷ (0,70 × R$ 500.000) = 35,5%. O S&P precisa subir mais de 35,5% em 2 anos para o COE superar o CDI.", next: "bifurcacao_coe" },
        { id: "market_fwd", label: "Sem custo — o principal é garantido", correct: false, score: 0, feedback: "O principal é garantido em termos nominais (R$ 500k), mas o custo de oportunidade é real: R$ 124.400 de CDI não recebidos. 'Principal garantido' não significa 'sem custo'.", next: "bifurcacao_coe" },
        { id: "spot_rate", label: "O custo é R$ 500 mil", correct: false, score: 0, feedback: "R$ 500k é o investimento, não o custo. O custo de oportunidade é a diferença entre CDI (R$ 624.400) e o COE no pior caso (R$ 500.000) = R$ 124.400.", next: "bifurcacao_coe" }
      ]},
      { id: "bifurcacao_coe", type: "choice", prompt: "O COE deve ter o derivativo embutido separado (bifurcado) na contabilidade (CPC 48)?", choices: [
        { id: "above_fwd_b", label: "Não necessariamente — se classificado a valor justo pelo resultado (VJPR), a bifurcação não é exigida", correct: true, score: 20, feedback: "Segundo o CPC 48/IFRS 9, a bifurcação só é exigida quando o hospedeiro NÃO é mensurado a VJPR. Se a entidade classifica o COE inteiro a VJPR (comum para produtos estruturados), o valor justo total já captura o derivativo. Se classificado a custo amortizado, seria necessário separar a call.", next: "resolution_coe" },
        { id: "market_fwd_b", label: "Sim, sempre — todo derivativo embutido deve ser separado", correct: false, score: 5, feedback: "Nem sempre. O CPC 48 exige bifurcação apenas quando 3 condições são atendidas simultaneamente. Se o hospedeiro já é VJPR, não há necessidade.", next: "resolution_coe" },
        { id: "spot_rate_b", label: "Não — o COE é indivisível", correct: false, score: 0, feedback: "O COE pode sim ser decomposto: zero-cupom + call. A questão é se a norma contábil EXIGE essa separação — e depende da classificação.", next: "resolution_coe" }
      ]},
      { id: "resolution_coe", type: "resolution", prompt: "2 anos se passaram. Como performou o S&P 500?", scenarios: [
        { id: "sp_subiu", label: "Cenário A: S&P subiu 40% (para 7.280)", fixingRate: 40, description: "Mercado americano em forte alta." },
        { id: "sp_caiu", label: "Cenário B: S&P caiu 20% (para 4.160)", fixingRate: -20, description: "Bear market nos EUA." },
        { id: "sp_pouco", label: "Cenário C: S&P subiu 15% (para 5.980)", fixingRate: 15, description: "Alta moderada." }
      ]}
    ]
  },
  {
    id: "emb_prepagamento",
    title: "Opção de Pré-pagamento em Empréstimo",
    theme: "Embutidos", themeId: "embutidos", instrument: "Call sobre dívida própria",
    difficulty: "Intermediário", embeddedStrategy: "prepayment",
    context: {
      narrative: "A **Logística Express Ltda.** tem empréstimo de **R$ 50 milhões** a **CDI + 3,00%** por 5 anos (restam 3). O contrato permite **pré-pagamento** com multa de **2% sobre o saldo**. A Selic caiu e a empresa recebe oferta de novo empréstimo a **CDI + 2,00%**. A cláusula de pré-pagamento é uma **call sobre a própria dívida**: o direito de 'recomprar' o empréstimo antes do vencimento.",
      marketData: { saldo: 50000000, spreadAtual: 0.03, spreadNovo: 0.02, multa: 0.02, prazoRestante: 3 },
      displayFields: [["Empréstimo", "R$ 50M"], ["Taxa atual", "CDI + 3,00%"], ["Nova oferta", "CDI + 2,00%"], ["Multa", "2% do saldo"], ["Prazo restante", "3 anos"], ["Economia/ano", "R$ 500k"]],
      question: "Vale a pena exercer a opção de pré-pagamento?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido na cláusula de pré-pagamento?", choices: [
        { id: "buy_usd", label: "Call sobre a dívida — a empresa tem o direito de 'recomprar' (liquidar) seu empréstimo antecipadamente", correct: true, score: 25, feedback: "A cláusula de pré-pagamento é economicamente uma call: a empresa pode 'chamar' a dívida pagando saldo + multa. Quando juros caem, essa opção ganha valor — assim como uma call sobre um bond sobe quando juros caem. O exercício permite refinanciar a taxa menor.", next: "contract_prepay" },
        { id: "sell_usd", label: "Swap de taxa de juros", correct: false, score: 0, feedback: "Não há troca de indexadores. A cláusula dá à empresa o direito unilateral de liquidar — é uma opção, não um swap.", next: "contract_prepay" },
        { id: "sell_usd_teorico", label: "Put sobre taxa de juros", correct: false, score: 5, feedback: "É uma call (direito de comprar/liquidar), não uma put. A empresa exerce quando quer — não é obrigada.", next: "contract_prepay" }
      ]},
      { id: "contract_prepay", type: "choice", prompt: "A economia é 1,00% a.a. (CDI+3% → CDI+2%) sobre R$ 50M = R$ 500k/ano. A multa é 2% × R$ 50M = R$ 1M. Vale exercer?", choices: [
        { id: "above_fwd", label: "Sim — economia líquida de R$ 500 mil (R$ 1,5M em 3 anos menos multa de R$ 1M)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Economia anual = 1,00% × R$ 50M = R$ 500.000. (2) Economia em 3 anos = R$ 1.500.000. (3) Multa = 2% × R$ 50M = R$ 1.000.000. (4) Ganho líquido = R$ 1.500.000 − R$ 1.000.000 = R$ 500.000. (5) Breakeven: R$ 1M ÷ R$ 500k/ano = 2 anos. Como restam 3 anos, vale exercer.", next: "bifurcacao_prepay" },
        { id: "market_fwd", label: "Não — a multa de R$ 1M é muito cara", correct: false, score: 5, feedback: "A multa (R$ 1M) é recuperada em 2 anos de economia (R$ 500k/ano). Como restam 3 anos, há 1 ano de economia líquida = R$ 500k de ganho.", next: "bifurcacao_prepay" },
        { id: "spot_rate", label: "Indiferente — CDI+3% e CDI+2% são parecidos", correct: false, score: 0, feedback: "1,00% de diferença sobre R$ 50M = R$ 500k/ano. Em 3 anos = R$ 1,5M. Descontar a multa de R$ 1M ainda deixa ganho de R$ 500k.", next: "bifurcacao_prepay" }
      ]},
      { id: "bifurcacao_prepay", type: "choice", prompt: "A opção de pré-pagamento deve ser bifurcada (CPC 48)?", choices: [
        { id: "above_fwd_b", label: "Não — a opção está intimamente relacionada ao hospedeiro (mesma variável: taxa de juros do empréstimo)", correct: true, score: 20, feedback: "Segundo CPC 48, opções de pré-pagamento cujo preço de exercício é aproximadamente o custo amortizado na data de exercício estão intimamente relacionadas ao hospedeiro. A multa de 2% é um ajuste pequeno — não há bifurcação.", next: "resolution_prepay" },
        { id: "market_fwd_b", label: "Sim — é um derivativo separável", correct: false, score: 5, feedback: "Embora tecnicamente separável, o CPC 48 dispensa a bifurcação quando o derivativo está intimamente relacionado ao hospedeiro. Opções de pré-pagamento em empréstimos a taxa de juros atendem esse critério.", next: "resolution_prepay" },
        { id: "spot_rate_b", label: "Depende do valor da multa", correct: false, score: 0, feedback: "O critério não é o valor da multa, mas sim se o derivativo está intimamente relacionado ao hospedeiro.", next: "resolution_prepay" }
      ]},
      { id: "resolution_prepay", type: "resolution", prompt: "O que aconteceu após a decisão?", scenarios: [
        { id: "exerceu", label: "Cenário A: Exerceu o pré-pagamento, refinanciou a CDI+2%", fixingRate: 1, description: "A empresa pagou a multa de R$ 1M e refinanciou. Economia líquida de R$ 500k em 3 anos." },
        { id: "juros_subiram", label: "Cenário B: Não exerceu. Juros voltaram a subir — a oferta de CDI+2% desapareceu", fixingRate: 0, description: "A janela de oportunidade fechou. A empresa continua pagando CDI+3%. A opção voltou a ficar 'fora do dinheiro'." },
        { id: "juros_cairam_mais", label: "Cenário C: Exerceu. Juros caíram ainda mais — poderia ter refinanciado a CDI+1,50%", fixingRate: 2, description: "Exerceu cedo demais. Se esperasse, teria conseguido CDI+1,50% — economia adicional de R$ 250k/ano." }
      ]}
    ]
  },
  {
    id: "emb_callable",
    title: "Callable Bond — Risco de Reinvestimento",
    theme: "Embutidos", themeId: "embutidos", instrument: "Debênture Callable",
    difficulty: "Intermediário", embeddedStrategy: "callable",
    context: {
      narrative: "Você é gestor(a) de renda fixa e avalia uma **debênture callable** da **Telecom Brasil S.A.**: cupom **CDI + 2,50%**, prazo 5 anos, com cláusula call a partir do ano 3 (ao par). Uma debênture **plain vanilla** comparável rende **CDI + 2,00%**. O spread adicional de **50 bps** é o prêmio que o investidor recebe por **vender implicitamente** a call ao emissor.",
      marketData: { cupomCallable: 0.025, cupomPlain: 0.020, premio: 0.005, callAno: 3, prazo: 5 },
      displayFields: [["Callable", "CDI + 2,50%"], ["Plain vanilla", "CDI + 2,00%"], ["Prêmio implícito", "50 bps a.a."], ["Call a partir de", "Ano 3"], ["Prazo total", "5 anos"]],
      question: "O prêmio de 50 bps compensa o risco de resgate antecipado?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido na debênture callable?", choices: [
        { id: "buy_usd", label: "Call vendida pelo investidor ao emissor — a emissora tem o direito de resgatar antecipadamente", correct: true, score: 25, feedback: "Ao comprar a callable, você implicitamente VENDE uma call ao emissor. O prêmio (50 bps/ano) está embutido no cupom mais alto. Se juros caírem, a emissora exercerá a call (refinancia mais barato) e você terá que reinvestir a taxas menores — o risco de reinvestimento.", next: "contract_callable" },
        { id: "sell_usd", label: "Call comprada pelo investidor", correct: false, score: 0, feedback: "O investidor não tem o direito de exercer nada. É a EMISSORA que pode chamar o bond. O investidor vendeu a call.", next: "contract_callable" },
        { id: "sell_usd_teorico", label: "Put comprada pelo investidor", correct: false, score: 5, feedback: "Put seria o direito do investidor de devolver o bond (puttable bond). Aqui é o contrário: a emissora chama o bond (callable).", next: "contract_callable" }
      ]},
      { id: "contract_callable", type: "choice", prompt: "Quando a emissora provavelmente exercerá a call?", choices: [
        { id: "above_fwd", label: "Quando os juros caírem significativamente — a emissora refinancia a custo menor", correct: true, score: 20, feedback: "Memória de cálculo: (1) Se CDI cair de 11,75% para 8% no ano 3, custo atual = 8% + 2,50% = 10,50%. (2) A emissora pode emitir nova debênture a 8% + 2,00% = 10,00%. (3) Economia = 0,50% a.a. por 2 anos (anos 4-5). (4) A call é exercida — o investidor recebe o par (100%) e precisa reinvestir a CDI+2,00% ao invés de CDI+2,50%. Perdeu 50 bps/ano por 2 anos de cupom.", next: "bifurcacao_callable" },
        { id: "market_fwd", label: "Quando os juros subirem", correct: false, score: 0, feedback: "Se juros subirem, a dívida da emissora fica barata (abaixo do mercado). Ela NUNCA exerceria a call para refinanciar a taxas maiores.", next: "bifurcacao_callable" },
        { id: "spot_rate", label: "A emissora sempre exerce no ano 3", correct: false, score: 5, feedback: "O exercício depende das condições de mercado. A emissora só exerce se for economicamente vantajoso — geralmente quando juros caem significativamente.", next: "bifurcacao_callable" }
      ]},
      { id: "bifurcacao_callable", type: "choice", prompt: "Os 50 bps de prêmio compensam o risco do call em 3 anos?", choices: [
        { id: "above_fwd_b", label: "Depende da expectativa de juros — se caírem forte, o call será exercido e o investidor perde 2 anos de cupom elevado", correct: true, score: 20, feedback: "Memória de cálculo: (1) Prêmio acumulado em 3 anos = 50 bps × 3 = 150 bps. (2) Se call exercido no ano 3: perde 50 bps/ano × 2 anos restantes = 100 bps de cupom. (3) Ganho líquido = 150 − 100 = 50 bps. (4) Porém, o reinvestimento será a taxas menores. Se CDI caiu de 11,75% para 8%, o custo de reinvestimento pode superar o prêmio acumulado. A análise exige modelar cenários de juros.", next: "resolution_callable" },
        { id: "market_fwd_b", label: "Sim, sempre — 50 bps é prêmio suficiente", correct: false, score: 5, feedback: "50 bps pode ser insuficiente se juros caírem 300+ bps. O custo de reinvestimento a taxas menores pode superar o prêmio acumulado.", next: "resolution_callable" },
        { id: "spot_rate_b", label: "Não, nunca — callable é sempre mau negócio", correct: false, score: 0, feedback: "Callable bonds podem ser atrativos se os juros subirem ou ficarem estáveis — o investidor recebe o prêmio e o call não é exercido.", next: "resolution_callable" }
      ]},
      { id: "resolution_callable", type: "resolution", prompt: "3 anos se passaram. O que a emissora decidiu?", scenarios: [
        { id: "call_exercido", label: "Cenário A: CDI caiu para 8%. Emissora exerceu a call.", fixingRate: 8.0, description: "A emissora refinanciou mais barato. O investidor recebe o par e precisa reinvestir a taxas menores." },
        { id: "call_nao", label: "Cenário B: CDI subiu para 14%. Call NÃO exercido.", fixingRate: 14.0, description: "Juros subiram. A emissora mantém a dívida barata. O investidor continua recebendo CDI+2,50% por 5 anos — ótimo negócio." },
        { id: "call_neutro", label: "Cenário C: CDI estável em 11,50%. Call não exercido.", fixingRate: 11.5, description: "Sem incentivo para refinanciar. Investidor mantém cupom de CDI+2,50%." }
      ]}
    ]
  },
  {
    id: "emb_cambial",
    title: "Indexação Cambial Implícita",
    theme: "Embutidos", themeId: "embutidos", instrument: "Call Digital USD",
    difficulty: "Avançado", embeddedStrategy: "fx_trigger",
    context: {
      narrative: "Você é controller da **Agroexport S.A.** A empresa tem **empréstimo rural de R$ 80 milhões** a taxa subsidiada de **8,50% a.a.** (abaixo do CDI de 11,75%). O contrato tem cláusula: **se o dólar ultrapassar R$ 5,80, o spread sobe 1,50% a.a.** Isso embute uma **call digital de dólar vendida** pela empresa ao banco. Dólar spot: R$ 5,20.",
      marketData: { saldo: 80000000, taxaBase: 0.085, stepUp: 0.015, barreira: 5.80, spotUSD: 5.20, cdi: 0.1175, prazo: 3 },
      displayFields: [["Empréstimo", "R$ 80M"], ["Taxa base", "8,50% a.a."], ["Barreira USD", "R$ 5,80"], ["Step-up", "+1,50% a.a."], ["Dólar spot", "R$ 5,20"], ["CDI", "11,75%"]],
      question: "Qual derivativo está embutido e o que exige a contabilidade?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido nesta cláusula?", choices: [
        { id: "buy_usd", label: "Call digital de dólar — ativação binária quando USD cruza R$ 5,80", correct: true, score: 25, feedback: "É uma call digital (binária): payoff discreto (0 ou 1,50% a.a.), ativado quando o dólar cruza a barreira R$ 5,80. A empresa 'vendeu' essa opção ao banco em troca da taxa subsidiada (8,50% vs CDI 11,75%). A economia de 3,25% a.a. inclui o prêmio implícito da call digital.", next: "contract_fx" },
        { id: "sell_usd", label: "NDF de dólar", correct: false, score: 0, feedback: "Não há troca de nocional em moedas. É uma opção binária — o payoff é discreto (0 ou 1,50%), não linear como um NDF.", next: "contract_fx" },
        { id: "sell_usd_teorico", label: "Swap cambial", correct: false, score: 5, feedback: "Não há troca de pernas CDI × câmbio. É uma cláusula contingente com trigger no dólar.", next: "contract_fx" }
      ]},
      { id: "contract_fx", type: "choice", prompt: "Se o dólar ultrapassar R$ 5,80, qual o impacto no custo do empréstimo?", choices: [
        { id: "above_fwd", label: "Custo sobe de 8,50% para 10,00% — impacto de R$ 1,2M/ano, mas ainda abaixo do CDI", correct: true, score: 20, feedback: "Memória de cálculo: (1) Custo base = 8,50% × R$ 80M = R$ 6.800.000/ano. (2) Com trigger: 10,00% × R$ 80M = R$ 8.000.000/ano. (3) Impacto = R$ 1.200.000/ano. (4) Mesmo com trigger, 10,00% < CDI 11,75% — a taxa ainda é subsidiada, mas a vantagem diminuiu de 3,25% para 1,75%.", next: "bifurcacao_fx" },
        { id: "market_fwd", label: "Custo sobe para CDI + 1,50%", correct: false, score: 0, feedback: "O step-up é sobre a taxa base (8,50% + 1,50% = 10,00%), não sobre o CDI.", next: "bifurcacao_fx" },
        { id: "spot_rate", label: "Sem impacto relevante", correct: false, score: 0, feedback: "R$ 1,2M/ano é 1,5% sobre R$ 80M — impacto material para uma empresa agrícola.", next: "bifurcacao_fx" }
      ]},
      { id: "bifurcacao_fx", type: "choice", prompt: "A call digital de dólar deve ser bifurcada (CPC 48)?", choices: [
        { id: "above_fwd_b", label: "Sim — a variável (câmbio) NÃO está intimamente relacionada ao hospedeiro (empréstimo em reais)", correct: true, score: 20, feedback: "Caso clássico de bifurcação obrigatória: o hospedeiro é um empréstimo em reais indexado a taxa de juros, mas o derivativo é indexado ao câmbio — variáveis econômicas não relacionadas. A call digital deve ser separada, mensurada a valor justo e reconhecida no resultado periodicamente.", next: "resolution_fx" },
        { id: "market_fwd_b", label: "Não — faz parte do empréstimo", correct: false, score: 0, feedback: "O fato de estar no mesmo contrato não dispensa a bifurcação. A variável do derivativo (câmbio) é diferente da variável do hospedeiro (taxa de juros em BRL).", next: "resolution_fx" },
        { id: "spot_rate_b", label: "Só bifurca se o trigger for acionado", correct: false, score: 5, feedback: "A bifurcação independe de o trigger ter sido acionado. O derivativo existe desde a contratação e deve ser marcado a valor justo continuamente.", next: "resolution_fx" }
      ]},
      { id: "resolution_fx", type: "resolution", prompt: "3 anos se passaram. Onde fechou o dólar?", scenarios: [
        { id: "trigger_on", label: "Cenário A: Dólar subiu para R$ 6,20 — trigger acionado", fixingRate: 6.20, description: "Dólar ultrapassou R$ 5,80. Custo subiu para 10,00% a.a. Impacto de R$ 1,2M/ano." },
        { id: "trigger_off", label: "Cenário B: Dólar caiu para R$ 4,80 — trigger NÃO acionado", fixingRate: 4.80, description: "Dólar longe da barreira. Empresa desfruta da taxa subsidiada de 8,50%." },
        { id: "trigger_near", label: "Cenário C: Dólar oscilou entre R$ 5,60 e R$ 5,85", fixingRate: 5.85, description: "Trigger acionado brevemente. Incerteza contábil sobre o reconhecimento." }
      ]}
    ]
  },
  {
    id: "emb_trs_sintetico",
    title: "TRS Sintético via COE",
    theme: "Embutidos", themeId: "embutidos", instrument: "TRS embutido em COE",
    difficulty: "Avançado", embeddedStrategy: "trs_sintetico",
    context: {
      narrative: "O **Fundo Alavancagem FIM** quer exposição a debêntures de infraestrutura mas não pode comprá-las (limite de concentração). O banco estrutura um **COE** de R$ 100M que paga o **retorno total do portfólio** menos **CDI + 0,80%** de taxa de estruturação. O cupom de referência é **CDI + 2,20%**. Economicamente, é um **TRS sintético** embutido em produto estruturado.",
      marketData: { nocional: 100000000, spreadRef: 0.022, spreadEstruturacao: 0.008, prazo: 3 },
      displayFields: [["Nocional", "R$ 100M"], ["Cupom ref.", "CDI + 2,20%"], ["Custo estrut.", "CDI + 0,80%"], ["Spread líq.", "1,40% a.a."], ["Prazo", "3 anos"]],
      question: "Qual derivativo está embutido e quais os riscos adicionais?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido neste COE?", choices: [
        { id: "buy_usd", label: "TRS (Total Return Swap) — o COE replica o retorno total do portfólio", correct: true, score: 25, feedback: "O COE é o hospedeiro (captação bancária). Embutido há um TRS sintético: o investidor recebe retorno total do portfólio e paga CDI + 0,80% implicitamente. Spread líquido = 2,20% − 0,80% = 1,40% a.a. = R$ 1.400.000/ano. Funcionalmente idêntico ao TRS do módulo de Derivativos de Crédito.", next: "contract_trs_s" },
        { id: "sell_usd", label: "CDS — proteção de crédito", correct: false, score: 0, feedback: "Não há proteção de crédito. O investidor RECEBE exposição ao crédito (retorno total), não se protege dele.", next: "contract_trs_s" },
        { id: "sell_usd_teorico", label: "Opção sobre debêntures", correct: false, score: 5, feedback: "Não há opcionalidade — o retorno é linear (cupom + Δpreço). É um TRS, não uma opção.", next: "contract_trs_s" }
      ]},
      { id: "contract_trs_s", type: "choice", prompt: "Qual risco adicional o COE tem em relação a um TRS autônomo?", choices: [
        { id: "above_fwd", label: "Risco do banco emissor — se o banco quebrar, o investidor perde o investimento, ALÉM do risco do portfólio", correct: true, score: 20, feedback: "Dupla camada de risco: (1) Risco do portfólio de referência (debêntures de infra). (2) Risco do banco emissor do COE (se quebrar, o investimento é perda total). No TRS autônomo, o risco do banco é contratual (contraparte). No COE, é risco de emissão. Nota: o FGC não cobre COE.", next: "bifurcacao_trs_s" },
        { id: "market_fwd", label: "Apenas o risco do portfólio de referência", correct: false, score: 5, feedback: "Falta considerar o risco do banco emissor. O COE é uma obrigação do banco — se ele quebrar, o investidor não recebe nada, independentemente do portfólio.", next: "bifurcacao_trs_s" },
        { id: "spot_rate", label: "Sem risco adicional — o COE tem garantia do FGC", correct: false, score: 0, feedback: "O FGC NÃO cobre COE. Esse é um erro comum. O COE é risco integral do banco emissor.", next: "bifurcacao_trs_s" }
      ]},
      { id: "bifurcacao_trs_s", type: "choice", prompt: "O TRS embutido deve ser bifurcado?", choices: [
        { id: "above_fwd_b", label: "Se o COE for classificado a VJPR, não precisa bifurcar. Se a custo amortizado, sim.", correct: true, score: 20, feedback: "Mesma lógica do COE de principal garantido: se o instrumento inteiro é mensurado a valor justo pelo resultado, a bifurcação é desnecessária. Na prática, COEs costumam ser VJPR.", next: "resolution_trs_s" },
        { id: "market_fwd_b", label: "Sempre bifurca", correct: false, score: 5, feedback: "Depende da classificação do hospedeiro.", next: "resolution_trs_s" },
        { id: "spot_rate_b", label: "Nunca bifurca", correct: false, score: 0, feedback: "Se classificado a custo amortizado, o TRS embutido deve ser separado.", next: "resolution_trs_s" }
      ]},
      { id: "resolution_trs_s", type: "resolution", prompt: "3 anos se passaram. Como performou o portfólio?", scenarios: [
        { id: "valorizou", label: "Cenário A: Portfólio valorizou 5%", fixingRate: 5.0, description: "Spread de crédito comprimiu. Ganho = carry + valorização." },
        { id: "desvalorizou", label: "Cenário B: Portfólio caiu 10% (estresse de crédito)", fixingRate: -10.0, description: "Rebaixamentos no setor de infra. Perda de preço supera o carry." },
        { id: "banco_quebrou", label: "Cenário C: O banco emissor entrou em liquidação", fixingRate: 0.0, description: "O portfólio performou bem, mas o banco quebrou. Investimento perdido — o risco de emissão se materializou." }
      ]}
    ]
  },
  {
    id: "emb_credito_implicito",
    title: "Derivativo de Crédito Implícito (Step-up)",
    theme: "Embutidos", themeId: "embutidos", instrument: "CDS implícito (step-up)",
    difficulty: "Avançado", embeddedStrategy: "credit_stepup",
    context: {
      narrative: "Você é analista de crédito do **Banco Meridional**. Uma empresa solicita empréstimo de **R$ 30 milhões** com cláusula: **se o rating for rebaixado abaixo de BB+, o spread sobe de CDI + 2,50% para CDI + 4,00%**. Essa cláusula é um **derivativo de crédito implícito**: o tomador 'vendeu' proteção ao banco — quando o crédito piora, o banco recebe compensação (spread maior). Rating atual: **BBB**.",
      marketData: { saldo: 30000000, spreadBase: 0.025, spreadPos: 0.04, ratingAtual: "BBB", triggerRating: "BB+", prazo: 4 },
      displayFields: [["Empréstimo", "R$ 30M"], ["Spread base", "CDI + 2,50%"], ["Spread pós-trigger", "CDI + 4,00%"], ["Trigger", "Rating < BB+"], ["Rating atual", "BBB"], ["Prazo", "4 anos"]],
      question: "Qual derivativo está embutido e qual o efeito econômico?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido na cláusula de step-up?", choices: [
        { id: "buy_usd", label: "CDS implícito — o tomador vendeu proteção de crédito ao banco via aumento de spread", correct: true, score: 25, feedback: "A cláusula de step-up atrelada ao rating é um derivativo de crédito: o banco recebe 'indenização' (spread maior) quando o crédito deteriora. O tomador implicitamente vendeu proteção. Paradoxo: o custo aumenta justamente quando a empresa está mais frágil — efeito pró-cíclico.", next: "contract_credit" },
        { id: "sell_usd", label: "Opção de pré-pagamento", correct: false, score: 0, feedback: "Pré-pagamento é o direito de liquidar antecipadamente. O step-up é uma cláusula automática atrelada ao rating.", next: "contract_credit" },
        { id: "sell_usd_teorico", label: "Cap de taxa de juros", correct: false, score: 5, feedback: "Um cap limita a taxa máxima. O step-up aumenta a taxa sem limite. São mecanismos opostos.", next: "contract_credit" }
      ]},
      { id: "contract_credit", type: "choice", prompt: "Se o rating for rebaixado para BB, qual o impacto financeiro anual?", choices: [
        { id: "above_fwd", label: "Aumento de R$ 450.000/ano (1,50% × R$ 30M)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Spread base = 2,50% × R$ 30M = R$ 750.000/ano. (2) Spread pós-trigger = 4,00% × R$ 30M = R$ 1.200.000/ano. (3) Aumento = R$ 450.000/ano. (4) Efeito pró-cíclico: a empresa já está em dificuldade (rating rebaixado) e agora paga R$ 450k a mais por ano — agravando a situação financeira.", next: "bifurcacao_credit" },
        { id: "market_fwd", label: "Impacto irrelevante", correct: false, score: 0, feedback: "R$ 450k/ano é 1,5% sobre R$ 30M — material para qualquer empresa.", next: "bifurcacao_credit" },
        { id: "spot_rate", label: "O spread só muda no vencimento", correct: false, score: 5, feedback: "O step-up se aplica imediatamente após o rebaixamento, não no vencimento.", next: "bifurcacao_credit" }
      ]},
      { id: "bifurcacao_credit", type: "choice", prompt: "A cláusula de step-up deve ser bifurcada (CPC 48)?", choices: [
        { id: "above_fwd_b", label: "Pode ser exigida — a variável (rating de crédito) modifica significativamente os fluxos, e a prática contábil pode exigir bifurcação se o step-up for material", correct: true, score: 20, feedback: "Caso de julgamento: o step-up é atrelado ao crédito do próprio tomador (intimamente relacionado ao hospedeiro), mas o aumento de 150 bps é significativo. Na prática, se o step-up modifica substancialmente os fluxos, a bifurcação pode ser exigida. A análise é caso a caso.", next: "resolution_credit" },
        { id: "market_fwd_b", label: "Não — está intimamente relacionado ao hospedeiro", correct: false, score: 10, feedback: "Argumentável, mas o passo de 150 bps é material e pode requerer separação. A prática de mercado varia.", next: "resolution_credit" },
        { id: "spot_rate_b", label: "Sempre bifurca", correct: false, score: 5, feedback: "Nem sempre. Se o step-up fosse de 10 bps, provavelmente não exigiria bifurcação por imaterialidade.", next: "resolution_credit" }
      ]},
      { id: "resolution_credit", type: "resolution", prompt: "4 anos se passaram. O que aconteceu com o rating?", scenarios: [
        { id: "rebaixado", label: "Cenário A: Rating rebaixado para BB — step-up ativado", fixingRate: 1, description: "Crise setorial levou ao rebaixamento. Spread subiu para CDI+4%. Custo adicional de R$ 450k/ano." },
        { id: "mantido", label: "Cenário B: Rating mantido em BBB", fixingRate: 0, description: "Empresa estável. Spread permanece em CDI+2,50%." },
        { id: "melhorou", label: "Cenário C: Rating elevado para A−", fixingRate: -1, description: "Empresa melhorou. O step-up nunca foi ativado. A cláusula não gerou impacto." }
      ]}
    ]
  },
  {
    id: "emb_cap_floor",
    title: "Super Desafio — Cap/Floor de Juros em Empréstimo",
    theme: "Embutidos", themeId: "embutidos", instrument: "Collar de juros embutido",
    difficulty: "Super Desafio", embeddedStrategy: "cap_floor",
    context: {
      narrative: "A **Construtora Horizonte S.A.** tem empréstimo de **R$ 120 milhões** a **CDI + 1,80%** por 5 anos. Para limitar risco, negocia: **cap de 15,00% a.a.** (teto do custo total) e, em contrapartida, o banco exige **floor de 10,50% a.a.** (piso do custo). O CDI atual é **11,75%** (custo atual = 13,55%). O empréstimo embute um **collar de juros**: cap comprado + floor vendido.",
      marketData: { saldo: 120000000, spread: 0.018, cap: 0.15, floor: 0.105, cdi: 0.1175, prazo: 5 },
      displayFields: [["Empréstimo", "R$ 120M"], ["Spread", "CDI + 1,80%"], ["Cap (teto)", "15,00% a.a."], ["Floor (piso)", "10,50% a.a."], ["CDI atual", "11,75%"], ["Custo atual", "13,55%"]],
      question: "Quais derivativos estão embutidos e quando são ativados?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Quais derivativos estão embutidos neste empréstimo?", choices: [
        { id: "buy_usd", label: "Cap comprado (teto) + Floor vendido (piso) = collar de taxa de juros", correct: true, score: 25, feedback: "São dois derivativos: (1) Cap: o banco limita o custo em 15,00%. Se CDI subir muito, o excedente é absorvido pelo banco. (2) Floor: o tomador garante piso de 10,50% ao banco. Se CDI cair muito, o tomador não se beneficia abaixo de 10,50%. É um collar embutido — análogo ao collar cambial do módulo de Opções.", next: "contract_capfloor" },
        { id: "sell_usd", label: "Swap de taxa fixa × flutuante", correct: false, score: 5, feedback: "O swap troca CDI por taxa fixa em todo o range. O collar limita apenas os extremos — dentro do corredor, o empréstimo continua flutuante.", next: "contract_capfloor" },
        { id: "sell_usd_teorico", label: "Apenas um cap de juros", correct: false, score: 10, feedback: "Há também o floor (piso). O banco não oferece o cap 'de graça' — exige o floor como contrapartida. São dois derivativos embutidos.", next: "contract_capfloor" }
      ]},
      { id: "contract_capfloor", type: "choice", prompt: "Em qual nível de CDI o cap e o floor são acionados?", choices: [
        { id: "above_fwd", label: "Cap: CDI > 13,20% (pois 13,20% + 1,80% = 15,00%). Floor: CDI < 8,70% (pois 8,70% + 1,80% = 10,50%)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Cap trigger: custo total = cap → CDI + 1,80% = 15,00% → CDI = 13,20%. (2) Floor trigger: custo total = floor → CDI + 1,80% = 10,50% → CDI = 8,70%. (3) Corredor de CDI: 8,70% a 13,20%. Dentro desse corredor, o empréstimo funciona normalmente (CDI + 1,80%). Fora, o cap ou floor é ativado.", next: "bifurcacao_capfloor" },
        { id: "market_fwd", label: "Cap: CDI > 15,00%. Floor: CDI < 10,50%", correct: false, score: 5, feedback: "15,00% e 10,50% são os limites do custo TOTAL (CDI + spread). O CDI trigger é descontado do spread: 15,00% − 1,80% = 13,20% e 10,50% − 1,80% = 8,70%.", next: "bifurcacao_capfloor" },
        { id: "spot_rate", label: "O cap e floor são acionados no vencimento", correct: false, score: 0, feedback: "Cap e floor são verificados em cada período de pagamento de juros, não apenas no vencimento.", next: "bifurcacao_capfloor" }
      ]},
      { id: "bifurcacao_capfloor", type: "choice", prompt: "O collar de juros deve ser bifurcado (CPC 48)?", choices: [
        { id: "above_fwd_b", label: "Geralmente não — cap e floor sobre a taxa de juros do próprio empréstimo estão intimamente relacionados ao hospedeiro", correct: true, score: 20, feedback: "Quando cap e floor têm como subjacente a mesma taxa de juros do empréstimo, o CPC 48 geralmente não exige bifurcação — as características econômicas estão intimamente relacionadas ao hospedeiro. Exceção: se o cap ou floor forem alavancados (ex: 2× CDI) ou referenciarem outra taxa (ex: IPCA), a bifurcação pode ser exigida.", next: "resolution_capfloor" },
        { id: "market_fwd_b", label: "Sempre bifurca", correct: false, score: 5, feedback: "Quando o subjacente do derivativo é o mesmo do hospedeiro (taxa de juros), geralmente não bifurca.", next: "resolution_capfloor" },
        { id: "spot_rate_b", label: "Bifurca apenas o floor", correct: false, score: 0, feedback: "Cap e floor são analisados juntos como collar. Ambos têm o mesmo subjacente do hospedeiro.", next: "resolution_capfloor" }
      ]},
      { id: "resolution_capfloor", type: "resolution", prompt: "5 anos se passaram. Como evoluiu o CDI?", scenarios: [
        { id: "cdi_alto", label: "Cenário A: CDI subiu para 14,50% — cap acionado", fixingRate: 14.50, description: "CDI + 1,80% = 16,30%, mas cap limita a 15,00%. Economia de R$ 1.560.000/ano para a empresa." },
        { id: "cdi_baixo", label: "Cenário B: CDI caiu para 7,00% — floor acionado", fixingRate: 7.00, description: "CDI + 1,80% = 8,80%, mas floor fixa em 10,50%. Empresa paga R$ 2.040.000/ano a mais do que sem floor." },
        { id: "cdi_medio", label: "Cenário C: CDI estável em 11,00% — dentro do corredor", fixingRate: 11.00, description: "Custo = 12,80%. Dentro do corredor (10,50%–15,00%). Nenhum derivativo ativado." }
      ]}
    ]
  },
  {
    id: "emb_conversivel",
    title: "Super Desafio — Debênture Conversível",
    theme: "Embutidos", themeId: "embutidos", instrument: "Call de ações (conversão)",
    difficulty: "Super Desafio", embeddedStrategy: "convertible",
    context: {
      narrative: "Você é analista de equity research e avalia **debêntures conversíveis** da **TechBrasil S.A.** (startup listada): **R$ 200M**, cupom **CDI + 1,00%**, prazo 5 anos. O debenturista pode converter em ações **TECH3 a R$ 25,00** (preço de conversão). Ação atual: **R$ 18,00**. Uma debênture plain vanilla comparável rende **CDI + 3,00%**. O cupom é 200 bps menor — o investidor aceita menos renda em troca da **opção de conversão** (call sobre TECH3).",
      marketData: { nocional: 200000000, cupomConv: 0.01, cupomPlain: 0.03, precoConversao: 25.00, precoAtual: 18.00, prazo: 5 },
      displayFields: [["Debênture", "R$ 200M (conversível)"], ["Cupom", "CDI + 1,00%"], ["Plain vanilla", "CDI + 3,00%"], ["Preço conversão", "R$ 25,00/ação"], ["TECH3 spot", "R$ 18,00"], ["Prêmio conv.", "38,9% acima do spot"]],
      question: "Qual derivativo está embutido e como contabilizar?"
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido na debênture conversível?", choices: [
        { id: "buy_usd", label: "Call de ações — o investidor tem o direito de trocar a debênture por ações TECH3 a R$ 25,00", correct: true, score: 25, feedback: "A conversão é uma call de TECH3 com strike R$ 25,00. Memória de cálculo do prêmio implícito: (1) Cupom sacrificado = CDI+3% − CDI+1% = 2,00% a.a. (2) Valor do cupom perdido = 2,00% × R$ 200M × 5 anos = R$ 20M. (3) Esse é o 'preço' da opção de conversão. (4) Prêmio sobre o spot: (R$ 25 − R$ 18) ÷ R$ 18 = 38,9% — a ação precisa subir quase 39% para a conversão valer a pena.", next: "contract_conv" },
        { id: "sell_usd", label: "Put sobre a debênture", correct: false, score: 0, feedback: "Put seria o direito de devolver a debênture ao emissor. A conversão é o direito de trocar por ações — é uma call.", next: "contract_conv" },
        { id: "sell_usd_teorico", label: "Swap de equity", correct: false, score: 5, feedback: "Não é um swap — o investidor tem o DIREITO (não a obrigação) de converter. É uma opção, não uma troca obrigatória.", next: "contract_conv" }
      ]},
      { id: "contract_conv", type: "choice", prompt: "Quando vale a pena converter a debênture em ações?", choices: [
        { id: "above_fwd", label: "Quando TECH3 > R$ 25,00 — as ações recebidas valem mais que o valor de face da debênture", correct: true, score: 20, feedback: "Memória de cálculo: (1) Cada R$ 1.000 de face converte em 1.000 ÷ 25 = 40 ações. (2) Se TECH3 = R$ 35: valor das ações = 40 × R$ 35 = R$ 1.400. (3) Ganho de conversão = R$ 1.400 − R$ 1.000 = R$ 400 por R$ 1.000 de face (40%). (4) Para todo o nocional: ganho = 40% × R$ 200M = R$ 80M. (5) Porém, o investidor abriu mão de 2% a.a. de cupom — deve comparar o ganho de conversão com o cupom sacrificado.", next: "bifurcacao_conv" },
        { id: "market_fwd", label: "Quando TECH3 > R$ 18,00 (spot atual)", correct: false, score: 5, feedback: "R$ 18 é o preço atual, não o strike. A conversão só cria valor acima de R$ 25 (preço de conversão).", next: "bifurcacao_conv" },
        { id: "spot_rate", label: "Nunca — o cupom de CDI+1% sempre vale mais", correct: false, score: 0, feedback: "Se TECH3 subir para R$ 50, cada R$ 1.000 de face converte em 40 ações × R$ 50 = R$ 2.000 — dobra o valor. O cupom perdido de 2% a.a. seria amplamente compensado.", next: "bifurcacao_conv" }
      ]},
      { id: "bifurcacao_conv", type: "choice", prompt: "Como contabilizar a opção de conversão (CPC 48/IAS 32)?", choices: [
        { id: "above_fwd_b", label: "Componente de equity (patrimônio líquido) — se a conversão é em número fixo de ações próprias na mesma moeda funcional", correct: true, score: 20, feedback: "O CPC 48/IAS 32 prevê que a opção de conversão em número fixo de ações próprias é classificada como componente de patrimônio (equity), não como derivativo. A debênture é separada em: (a) componente de dívida (custo amortizado) e (b) componente equity (valor residual, sem remensuração). Se a conversão fosse em moeda diferente ou número variável de ações, seria derivativo com bifurcação + marcação a mercado.", next: "resolution_conv" },
        { id: "market_fwd_b", label: "Derivativo bifurcado — sempre separa e marca a mercado", correct: false, score: 10, feedback: "Somente se a conversão for em número variável de ações ou em moeda diferente da funcional. Se for número fixo de ações próprias na moeda funcional, é equity.", next: "resolution_conv" },
        { id: "spot_rate_b", label: "Não separa — mantém como instrumento único", correct: false, score: 0, feedback: "A separação é obrigatória — a questão é SE como equity OU como derivativo.", next: "resolution_conv" }
      ]},
      { id: "resolution_conv", type: "resolution", prompt: "5 anos se passaram. Onde fechou TECH3?", scenarios: [
        { id: "acao_disparou", label: "Cenário A: TECH3 subiu para R$ 40,00 (+122%)", fixingRate: 40.0, description: "Startup virou unicórnio. Conversão gera ganho expressivo." },
        { id: "acao_caiu", label: "Cenário B: TECH3 caiu para R$ 12,00 (−33%)", fixingRate: 12.0, description: "Empresa não decolou. Conversão não vale a pena — mantém a debênture." },
        { id: "acao_perto", label: "Cenário C: TECH3 subiu para R$ 26,00 (+44%)", fixingRate: 26.0, description: "Marginalmente acima do strike. Conversão vale pouco — precisa analisar vs cupom." }
      ]}
    ]
  }
];

const ALL_SCENARIOS = [...NDF_SCENARIOS, ...FUTUROS_SCENARIOS, ...SWAPS_SCENARIOS, ...OPCOES_SCENARIOS, ...CREDITO_SCENARIOS, ...EMBUTIDOS_SCENARIOS];

/* ═══════════════════════════════════════════════════════════════
   MOTOR DE CÁLCULO — DERIVATIVOS EMBUTIDOS
   ═══════════════════════════════════════════════════════════════ */

function calculateEmbeddedResult(scenarioData, scenario) {
  const md = scenarioData.context.marketData;
  const strat = scenarioData.embeddedStrategy;
  const fix = scenario.fixingRate;

  if (strat === "coe") {
    const inv = md.investimento;
    const cdiTotal = inv * (Math.pow(1 + md.cdi, md.prazoAnos) - 1);
    const cdiResult = inv + cdiTotal;
    const retornoSP = fix / 100;
    const participacao = retornoSP > 0 ? md.participacao * retornoSP * inv : 0;
    const coeResult = inv + participacao;
    const diff = coeResult - cdiResult;
    return { inv, cdiTotal, cdiResult, retornoSP, participacao, coeResult, diff };
  }
  if (strat === "prepayment") {
    const economia = (md.spreadAtual - md.spreadNovo) * md.saldo;
    const economiaTotal = economia * md.prazoRestante;
    const multa = md.multa * md.saldo;
    const ganhoLiquido = economiaTotal - multa;
    return { economia, economiaTotal, multa, ganhoLiquido, saldo: md.saldo };
  }
  if (strat === "callable") {
    const premioAnual = md.premio * 100; // in bps display
    return { premioAnual, callAno: md.callAno, prazo: md.prazo, cdiFinal: fix };
  }
  if (strat === "fx_trigger") {
    const triggered = fix >= md.barreira || (fix > md.barreira - 0.05 && scenario.id === "trigger_near");
    const custoBase = md.taxaBase * md.saldo;
    const custoTrigger = (md.taxaBase + md.stepUp) * md.saldo;
    const impacto = triggered ? md.stepUp * md.saldo : 0;
    return { triggered, custoBase, custoTrigger, impacto, barreira: md.barreira, fixDolar: fix, saldo: md.saldo, taxaBase: md.taxaBase, stepUp: md.stepUp };
  }
  if (strat === "trs_sintetico") {
    const carry = (md.spreadRef - md.spreadEstruturacao) * md.nocional;
    const deltaPreco = (fix / 100) * md.nocional;
    const total = scenario.id === "banco_quebrou" ? -md.nocional : carry * md.prazo + deltaPreco;
    return { carry, deltaPreco, total, nocional: md.nocional, bancoQuebrou: scenario.id === "banco_quebrou" };
  }
  if (strat === "credit_stepup") {
    const triggered = fix > 0;
    const custoBase = md.spreadBase * md.saldo;
    const custoPos = md.spreadPos * md.saldo;
    const impacto = triggered ? (md.spreadPos - md.spreadBase) * md.saldo : 0;
    return { triggered, custoBase, custoPos, impacto, saldo: md.saldo };
  }
  if (strat === "cap_floor") {
    const custoSemLimite = (md.cdi + md.spread) < 0.001 ? fix / 100 + md.spread : fix / 100 + md.spread;
    const custoRaw = fix / 100 + md.spread;
    const custoEfetivo = Math.min(Math.max(custoRaw, md.floor), md.cap);
    const impactoCap = custoRaw > md.cap ? (custoRaw - md.cap) * md.saldo : 0;
    const impactoFloor = custoRaw < md.floor ? (md.floor - custoRaw) * md.saldo : 0;
    return { cdiFinal: fix, custoRaw, custoEfetivo, impactoCap, impactoFloor, cap: md.cap, floor: md.floor, spread: md.spread, saldo: md.saldo };
  }
  if (strat === "convertible") {
    const precoConv = md.precoConversao;
    const acoesPorMil = 1000 / precoConv;
    const valorConversao = acoesPorMil * fix;
    const ganhoConversao = Math.max(valorConversao - 1000, 0);
    const ganhoPct = ganhoConversao / 1000;
    const ganhoTotal = ganhoPct * md.nocional;
    const cupomSacrificado = (md.cupomPlain - md.cupomConv) * md.nocional * md.prazo;
    return { precoConv, precoFinal: fix, acoesPorMil, valorConversao, ganhoConversao, ganhoPct, ganhoTotal, cupomSacrificado, nocional: md.nocional, valeConverter: fix > precoConv };
  }
  return {};
}

function EmbeddedResultPanel({ scenario, scenarioData }) {
  const r = calculateEmbeddedResult(scenarioData, scenario);
  const strat = scenarioData.embeddedStrategy;

  const Panel = ({ title, children, bg }) => (
    <div style={{ padding: "20px 24px", borderRadius: 12, background: bg || COLORS.card, border: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
  const PnLBig = ({ value, label }) => {
    const c = value >= 0 ? COLORS.green : COLORS.red;
    return (<div style={{ marginTop: 8 }}><div style={{ fontSize: 12, color: COLORS.textMuted }}>{label}</div><div style={{ fontSize: 28, fontWeight: 800, color: c, fontFamily: "'JetBrains Mono', monospace" }}>{value >= 0 ? "+" : ""}{fmt(value)}</div></div>);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
        <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>{scenario.description}</p>
      </div>

      {strat === "coe" && (<>
        <Panel title="① Resultado do COE">
          <div>(1) S&P 500 variou {r.retornoSP >= 0 ? "+" : ""}{(r.retornoSP*100).toFixed(0)}%</div>
          <div>(2) Participação = 70% × {(r.retornoSP*100).toFixed(0)}% × {fmt(r.inv)} = <strong style={{color: r.participacao > 0 ? COLORS.green : COLORS.textMuted}}>{fmt(r.participacao)}</strong></div>
          <div>(3) Valor final do COE = {fmt(r.inv)} + {fmt(r.participacao)} = <strong>{fmt(r.coeResult)}</strong></div>
        </Panel>
        <Panel title="② Alternativa: CDI por 2 anos">
          <div>(1) CDI acumulado = {fmt(r.cdiTotal)}</div>
          <div>(2) Valor final no CDI = <strong>{fmt(r.cdiResult)}</strong></div>
        </Panel>
        <Panel title="③ Comparação" bg={r.diff >= 0 ? COLORS.greenDim : COLORS.redDim}>
          <div>COE: {fmt(r.coeResult)} vs CDI: {fmt(r.cdiResult)}</div>
          <PnLBig value={r.diff} label={r.diff >= 0 ? "COE superou o CDI" : "Custo de oportunidade (COE vs CDI)"} />
        </Panel>
      </>)}

      {strat === "prepayment" && (<>
        <Panel title="① Análise do exercício">
          <div>(1) Economia anual = {fmt(r.economia)}</div>
          <div>(2) Economia total ({scenarioData.context.marketData.prazoRestante} anos) = {fmt(r.economiaTotal)}</div>
          <div>(3) Multa de pré-pagamento = {fmt(r.multa)}</div>
          <PnLBig value={r.ganhoLiquido} label="Ganho líquido do exercício" />
        </Panel>
        <Panel title="② Lição">
          <div style={{padding: "10px 14px", borderRadius: 8, background: COLORS.cardHover}}>
            {scenario.id === "exerceu" ? "A empresa exerceu a opção e economizou. A call sobre a dívida estava 'in the money'."
             : scenario.id === "juros_subiram" ? "A janela fechou. A opção voltou a ficar 'out of the money'. O timing do exercício é crítico."
             : "Exerceu cedo demais — se esperasse, teria conseguido taxa ainda melhor. Risco de exercício prematuro."}
          </div>
        </Panel>
      </>)}

      {strat === "callable" && (<>
        <Panel title="① Resultado do callable bond">
          <div>(1) CDI final = {r.cdiFinal.toFixed(2)}%</div>
          <div>(2) Custo de refinanciamento para a emissora = {r.cdiFinal.toFixed(2)}% + 2,00% = {(r.cdiFinal + 2).toFixed(2)}%</div>
          <div>(3) Cupom atual do callable = CDI + 2,50% = {(r.cdiFinal + 2.5).toFixed(2)}%</div>
          <div>(4) {r.cdiFinal < 10 ? `Emissora exerce a call — refinancia de ${(r.cdiFinal+2.5).toFixed(2)}% para ${(r.cdiFinal+2.0).toFixed(2)}%. Investidor recebe o par e precisa reinvestir a taxas menores.` : `Call NÃO exercido — emissora mantém a dívida. Investidor continua recebendo CDI+2,50%.`}</div>
        </Panel>
        <Panel title="② Análise do prêmio de 50 bps" bg={r.cdiFinal < 10 ? COLORS.redDim : COLORS.greenDim}>
          <div style={{padding: "10px 14px", borderRadius: 8, background: COLORS.cardHover}}>
            {r.cdiFinal < 10 ? `Juros caíram e a call foi exercida. O prêmio de 50 bps acumulado por ${r.callAno} anos (${r.callAno * 50} bps) não compensou o custo de reinvestimento a taxas ${(r.cdiFinal + 2.5 - (r.cdiFinal + 2.0)).toFixed(1)}% menores por ${r.prazo - r.callAno} anos. O risco de reinvestimento se materializou.`
             : r.cdiFinal > 13 ? `Juros subiram e o call não foi exercido. O investidor recebeu o prêmio de 50 bps por todos os ${r.prazo} anos (${r.prazo * 50} bps acumulados). Excelente negócio — a call vendida expirou 'out of the money'.`
             : `Juros estáveis, call não exercido. O investidor recebeu o prêmio integral de 50 bps/ano.`}
          </div>
        </Panel>
      </>)}

      {strat === "fx_trigger" && (<>
        <Panel title={`① Resultado: trigger ${r.triggered ? "ACIONADO" : "NÃO acionado"}`} bg={r.triggered ? COLORS.redDim : COLORS.greenDim}>
          <div>(1) Dólar final = R$ {r.fixDolar.toFixed(2)}</div>
          <div>(2) Barreira = R$ {r.barreira.toFixed(2)}</div>
          <div>(3) {r.triggered ? `Dólar > barreira → custo sobe de ${(r.taxaBase*100).toFixed(1)}% para ${((r.taxaBase+r.stepUp)*100).toFixed(1)}%` : "Dólar abaixo da barreira → taxa subsidiada mantida"}</div>
          {r.triggered && <div>(4) Impacto anual = {fmt(r.impacto)}</div>}
        </Panel>
        <Panel title="② Tratamento contábil">
          <div style={{padding: "10px 14px", borderRadius: 8, background: COLORS.cardHover}}>
            Bifurcação obrigatória: a call digital de dólar (variável: câmbio) não está intimamente relacionada ao hospedeiro (empréstimo em BRL). O derivativo deve ser separado e marcado a valor justo, independentemente de o trigger ter sido acionado.
          </div>
        </Panel>
      </>)}

      {strat === "trs_sintetico" && (<>
        {r.bancoQuebrou ? (
          <Panel title="① Risco do emissor materializado" bg={COLORS.redDim}>
            <div>O banco emissor do COE entrou em liquidação.</div>
            <div>O portfólio de referência performou bem, mas o investimento foi perdido.</div>
            <div>O FGC NÃO cobre COE.</div>
            <PnLBig value={-r.nocional} label="Perda total" />
          </Panel>
        ) : (<>
          <Panel title="① Carry + variação de preço">
            <div>(1) Carry anual = {fmt(r.carry)}/ano × {scenarioData.context.marketData.prazo} anos = {fmt(r.carry * scenarioData.context.marketData.prazo)}</div>
            <div>(2) Variação de preço = {fmt(r.deltaPreco)}</div>
            <PnLBig value={r.total} label="Resultado total" />
          </Panel>
        </>)}
      </>)}

      {strat === "credit_stepup" && (<>
        <Panel title={`① Resultado: step-up ${r.triggered ? "ATIVADO" : "NÃO ativado"}`} bg={r.triggered ? COLORS.redDim : COLORS.greenDim}>
          <div>(1) {r.triggered ? `Rating rebaixado — spread subiu de CDI+2,50% para CDI+4,00%` : `Rating mantido ou melhorado — spread permanece em CDI+2,50%`}</div>
          {r.triggered && <div>(2) Impacto anual = {fmt(r.impacto)} (efeito pró-cíclico)</div>}
        </Panel>
      </>)}

      {strat === "cap_floor" && (<>
        <Panel title="① Corredor de custo">
          <div>(1) CDI final = {r.cdiFinal.toFixed(2)}%</div>
          <div>(2) Custo sem limites = CDI + {(r.spread*100).toFixed(2)}% = {(r.custoRaw*100).toFixed(2)}%</div>
          <div>(3) Cap = {(r.cap*100).toFixed(2)}% | Floor = {(r.floor*100).toFixed(2)}%</div>
          <div>(4) Custo efetivo = <strong style={{color: COLORS.accent}}>{(r.custoEfetivo*100).toFixed(2)}%</strong></div>
        </Panel>
        <Panel title="② Impacto dos derivativos" bg={r.impactoCap > 0 ? COLORS.greenDim : r.impactoFloor > 0 ? COLORS.redDim : COLORS.card}>
          {r.impactoCap > 0 && <div>Cap acionado! Economia = <strong style={{color: COLORS.green}}>+{fmt(r.impactoCap)}/ano</strong> (banco absorve o excedente)</div>}
          {r.impactoFloor > 0 && <div>Floor acionado! Custo extra = <strong style={{color: COLORS.red}}>+{fmt(r.impactoFloor)}/ano</strong> (empresa paga acima do CDI+spread)</div>}
          {r.impactoCap === 0 && r.impactoFloor === 0 && <div>Dentro do corredor — nenhum derivativo ativado. Custo = CDI + spread normalmente.</div>}
        </Panel>
      </>)}

      {strat === "convertible" && (<>
        <Panel title="① Análise de conversão">
          <div>(1) Preço de conversão = R$ {r.precoConv.toFixed(2)}</div>
          <div>(2) TECH3 no vencimento = R$ {r.precoFinal.toFixed(2)}</div>
          <div>(3) Cada R$ 1.000 converte em {r.acoesPorMil.toFixed(0)} ações</div>
          <div>(4) Valor das ações = {r.acoesPorMil.toFixed(0)} × R$ {r.precoFinal.toFixed(2)} = R$ {r.valorConversao.toFixed(2)} por R$ 1.000 de face</div>
          <div>(5) {r.valeConverter ? `Conversão vale a pena: ganho de ${(r.ganhoPct*100).toFixed(1)}% sobre a face` : "Conversão NÃO vale — ações valem menos que a face da debênture"}</div>
        </Panel>
        {r.valeConverter ? (
          <Panel title="② Resultado da conversão" bg={COLORS.greenDim}>
            <PnLBig value={r.ganhoTotal} label="Ganho de conversão (vs valor de face)" />
            <div style={{marginTop: 8}}>(1) Cupom sacrificado ao longo de 5 anos = {fmt(r.cupomSacrificado)}</div>
            <div>(2) Ganho líquido = {fmt(r.ganhoTotal)} − {fmt(r.cupomSacrificado)} = <strong style={{color: r.ganhoTotal - r.cupomSacrificado >= 0 ? COLORS.green : COLORS.red}}>{fmt(r.ganhoTotal - r.cupomSacrificado)}</strong></div>
          </Panel>
        ) : (
          <Panel title="② Debênture mantida" bg={COLORS.redDim}>
            <div>Conversão não exercida. O investidor mantém a debênture e recebe CDI+1,00% até o vencimento.</div>
            <div>Cupom sacrificado (vs plain vanilla) = {fmt(r.cupomSacrificado)} ao longo de 5 anos — o preço de uma opção que não foi exercida.</div>
          </Panel>
        )}
      </>)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOTOR DE CÁLCULO — DERIVATIVOS DE CRÉDITO
   ═══════════════════════════════════════════════════════════════ */

function calculateCreditResult(scenarioData, scenario) {
  const md = scenarioData.context.marketData;
  const strat = scenarioData.creditStrategy;
  const fixing = scenario.fixingRate;

  if (strat === "cds_hedge") {
    const n = md.nocional;
    const spreadAnual = md.spreadBps / 10000 * n;
    const custoTotal = spreadAnual * md.prazoAnos; // valor do ativo (proteção contratada)
    const isDefault = scenario.id === "default";
    const spreadFinal = fixing;
    const dv01Total = md.dv01Per10M * (n / 10000000);

    if (isDefault) {
      // Evento de crédito: CDS é acionado
      const mesesAteDefault = 12;
      const spreadPagoAteDefault = spreadAnual * (mesesAteDefault / 12);
      const indenizacao = n * (1 - md.recoveryRate);
      const resultadoLiquido = indenizacao - spreadPagoAteDefault;
      return { custoTotal, spreadPagoAteDefault, indenizacao, resultadoLiquido, isDefault, nocional: n, recoveryRate: md.recoveryRate, spreadInicial: md.spreadBps, spreadFinal, lgd: 1 - md.recoveryRate, dv01Total, mtm: 0 };
    } else {
      // Sem evento de crédito: avaliar o MTM do ativo
      const valorMercadoAtual = dv01Total * spreadFinal * (md.prazoAnos); // simplificação: valor proporcional ao spread atual
      // Perda/ganho = variação do valor do ativo
      const mtm = dv01Total * (spreadFinal - md.spreadBps); // negativo se spread caiu (ativo perdeu valor)
      const resultadoLiquido = mtm; // o resultado é a variação do valor do ativo, não ativo + MTM
      return { custoTotal, indenizacao: 0, resultadoLiquido, isDefault, nocional: n, recoveryRate: md.recoveryRate, spreadInicial: md.spreadBps, spreadFinal, lgd: 1 - md.recoveryRate, dv01Total, mtm };
    }
  }

  if (strat === "trs") {
    const n = md.nocional;
    const carry = (md.spreadCupom - md.spreadFinanc) * n;
    const deltaPreco = (fixing / 100) * n;
    const total = carry + deltaPreco;
    return { carry, deltaPreco, total, nocional: n, spreadLiq: md.spreadCupom - md.spreadFinanc, varPct: fixing };
  }

  if (strat === "cds_spec") {
    const n = md.nocional;
    const dv01Total = md.dv01Per10M * (n / 10000000);
    const spreadVar = fixing - md.spreadBps;
    const mtm = dv01Total * spreadVar;
    const carryAnual = (md.spreadBps / 10000) * n;
    const resultadoLiquido = mtm - carryAnual;
    return { dv01Total, spreadInicial: md.spreadBps, spreadFinal: fixing, spreadVar, mtm, carryAnual, resultadoLiquido, nocional: n, moeda: md.moeda || "BRL" };
  }

  if (strat === "basis_trade") {
    const n = md.nocional;
    const dv01Total = md.dv01Per10M * (n / 10000000);
    const cdsVar = fixing - md.cdsSpread; // positive when spread widens (bad for basis trade)
    const mtmCDS = dv01Total * cdsVar; // buyer of protection: + when spread widens, - when compresses
    // But in basis trade, we WANT the CDS to fall (base converges), so the bond gain compensates
    // Bond MTM roughly mirrors: when CDS falls, bond spread also tightens → bond gains
    // For simplicity, approximate the bond MTM as offsetting CDS MTM partially, net = base convergence gain
    // Net basis P&L ≈ DV01 × (base_initial - base_final) = DV01 × (old_CDS - old_bond - (new_CDS - bond))
    const baseInicial = md.cdsSpread - md.bondSpread;
    const baseFinal = fixing - md.bondSpread;
    const baseConvergence = baseInicial - baseFinal; // positive when base narrows
    const mtmBasis = dv01Total * baseConvergence; // net basis P&L
    const carryAnualBps = md.bondSpread - md.cdsSpread;
    const carryAnual = (carryAnualBps / 10000) * n;
    const meses = scenario.id === "convergiu" ? 4 : 12;
    const carryPago = carryAnual * (meses / 12);
    const resultadoLiquido = mtmBasis + carryPago;
    return { dv01Total, cdsInicial: md.cdsSpread, cdsFinal: fixing, cdsVar, mtmCDS: mtmBasis, carryAnual, carryPago, resultadoLiquido, nocional: n, baseInicial, baseFinal, meses, bondSpread: md.bondSpread, baseConvergence };
  }
  return {};
}

function CreditResultPanel({ scenario, scenarioData }) {
  const r = calculateCreditResult(scenarioData, scenario);
  const strat = scenarioData.creditStrategy;

  const Panel = ({ title, children, bg }) => (
    <div style={{ padding: "20px 24px", borderRadius: 12, background: bg || COLORS.card, border: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
  const PnLBig = ({ value, label, prefix }) => {
    const c = value >= 0 ? COLORS.green : COLORS.red;
    const p = prefix || "";
    return (<div style={{ marginTop: 8 }}><div style={{ fontSize: 12, color: COLORS.textMuted }}>{label}</div><div style={{ fontSize: 28, fontWeight: 800, color: c, fontFamily: "'JetBrains Mono', monospace" }}>{value >= 0 ? "+" : ""}{p}{fmt(value)}</div></div>);
  };
  const fmtUSD = (v) => "USD " + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);

  if (strat === "cds_hedge") {
    const spreadAnual = r.spreadInicial / 10000 * r.nocional;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
          <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>{scenario.description}</p>
        </div>
        <Panel title="① Contratação do CDS (ativo de proteção)">
          <div>(1) Spread contratado = {r.spreadInicial} bps = {(r.spreadInicial/100).toFixed(2)}% a.a.</div>
          <div>(2) Custo anual = {(r.spreadInicial/100).toFixed(2)}% × {fmt(r.nocional)} = {fmt(spreadAnual)}/ano</div>
          <div>(3) Custo total da proteção (2 anos) = {fmt(r.custoTotal)}</div>
          <div style={{marginTop: 8, fontSize: 13, color: COLORS.textMuted}}>
            Na contratação, o banco registra um <strong style={{color: COLORS.accent}}>ativo</strong> de {fmt(r.custoTotal)} (direito à proteção de crédito). A saída de caixa tem contrapartida no ativo — sem impacto imediato no resultado.
          </div>
        </Panel>
        {r.isDefault ? (
          <>
            <Panel title="② Evento de crédito — CDS acionado" bg={COLORS.greenDim}>
              <div>(1) Default ocorreu após ~12 meses</div>
              <div>(2) Spread pago até o default = {fmt(r.spreadPagoAteDefault)} (12 meses de {fmt(spreadAnual)}/ano)</div>
              <div>(3) Nocional protegido = {fmt(r.nocional)}</div>
              <div>(4) Recovery rate = {(r.recoveryRate*100).toFixed(0)}%</div>
              <div>(5) LGD = {(r.lgd*100).toFixed(0)}%</div>
              <div>(6) Indenização recebida = {fmt(r.nocional)} × {(r.lgd*100).toFixed(0)}% = <strong style={{color: COLORS.green}}>+{fmt(r.indenizacao)}</strong></div>
            </Panel>
            <Panel title="③ Resultado líquido" bg={COLORS.greenDim}>
              <div>(1) Indenização recebida = +{fmt(r.indenizacao)}</div>
              <div>(2) Spread pago até o default = −{fmt(r.spreadPagoAteDefault)}</div>
              <PnLBig value={r.resultadoLiquido} label="Resultado líquido da proteção" />
              <div style={{marginTop: 12, padding: "10px 14px", borderRadius: 8, background: COLORS.card}}>
                O evento de crédito ocorreu. A indenização de {fmt(r.indenizacao)} cobriu {(r.lgd*100).toFixed(0)}% da exposição. Sem o CDS, a perda teria sido {fmt(r.nocional * r.lgd)}. Com o CDS, o custo foi apenas o spread pago ({fmt(r.spreadPagoAteDefault)}) + a parcela de recovery ({(r.recoveryRate*100).toFixed(0)}% = {fmt(r.nocional * r.recoveryRate)}) que depende do processo de RJ. O seguro funcionou.
              </div>
            </Panel>
          </>
        ) : (
          <>
            <Panel title="② Marcação a mercado do ativo (CDS)">
              <div>(1) Spread na contratação = {r.spreadInicial} bps</div>
              <div>(2) Spread atual de mercado = {r.spreadFinal} bps</div>
              <div>(3) Variação = {r.spreadFinal - r.spreadInicial > 0 ? "+" : ""}{r.spreadFinal - r.spreadInicial} bps</div>
              <div>(4) DV01 total = {fmt(r.dv01Total)}/bp</div>
              <div>(5) Ajuste no valor do ativo = {fmt(r.dv01Total)} × ({r.spreadFinal - r.spreadInicial}) = <strong style={{color: r.mtm >= 0 ? COLORS.green : COLORS.red}}>{r.mtm >= 0 ? "+" : ""}{fmt(r.mtm)}</strong></div>
              <div style={{marginTop: 8, fontSize: 13, color: COLORS.textMuted}}>
                {r.spreadFinal < r.spreadInicial
                  ? `O spread comprimiu — a proteção comprada perdeu valor. O ativo que custou ${fmt(r.custoTotal)} agora poderia ser revendido por aproximadamente ${fmt(r.custoTotal + r.mtm)}. A diferença de ${fmt(Math.abs(r.mtm))} é a perda de marcação a mercado.`
                  : `O spread alargou — a proteção comprada ganhou valor. O ativo que custou ${fmt(r.custoTotal)} agora vale mais no mercado — poderia ser revendido com ganho de ${fmt(r.mtm)}.`}
              </div>
            </Panel>
            <Panel title="③ Resultado econômico" bg={r.resultadoLiquido >= 0 ? COLORS.greenDim : COLORS.redDim}>
              <div>(1) Valor original do ativo (CDS contratado) = {fmt(r.custoTotal)}</div>
              <div>(2) Ajuste de marcação a mercado = <strong style={{color: r.mtm >= 0 ? COLORS.green : COLORS.red}}>{r.mtm >= 0 ? "+" : ""}{fmt(r.mtm)}</strong></div>
              <div>(3) Valor atual do ativo = {fmt(r.custoTotal + r.mtm)}</div>
              <PnLBig value={r.mtm} label="Resultado (variação do valor do ativo)" />
              <div style={{marginTop: 12, padding: "10px 14px", borderRadius: 8, background: COLORS.card}}>
                {r.spreadFinal < r.spreadInicial
                  ? `O risco diminuiu e o spread comprimiu de ${r.spreadInicial} para ${r.spreadFinal} bps. O ativo de proteção perdeu ${fmt(Math.abs(r.mtm))} de valor. Se o banco encerrar a posição (vender o CDS no mercado), realizaria essa perda. Se mantiver até o vencimento sem evento de crédito, o ativo será totalmente amortizado. O "seguro" cumpriu seu papel durante o período de incerteza — a perda de valor é o custo da proteção que não precisou ser acionada.`
                  : `O spread se manteve estável em ${r.spreadFinal} bps. O ativo de proteção teve variação marginal de valor. O CDS continua cumprindo seu papel de seguro.`}
              </div>
            </Panel>
          </>
        )}
      </div>
    );
  }

  if (strat === "trs") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
          <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>{scenario.description}</p>
        </div>
        <Panel title="① Carry (spread de cupom)">
          <div>(1) Cupom recebido = CDI + {(scenarioData.context.marketData.spreadCupom*100).toFixed(2)}%</div>
          <div>(2) Custo pago = CDI + {(scenarioData.context.marketData.spreadFinanc*100).toFixed(2)}%</div>
          <div>(3) Spread líquido = {(r.spreadLiq*100).toFixed(2)}% a.a.</div>
          <div>(4) Carry anual = {(r.spreadLiq*100).toFixed(2)}% × {fmt(r.nocional)} = <strong style={{color: COLORS.green}}>+{fmt(r.carry)}</strong></div>
        </Panel>
        <Panel title="② Variação de preço da debênture">
          <div>(1) Variação = <strong style={{color: r.varPct >= 0 ? COLORS.green : COLORS.red}}>{r.varPct >= 0 ? "+" : ""}{r.varPct.toFixed(1)}%</strong></div>
          <div>(2) Impacto = {r.varPct.toFixed(1)}% × {fmt(r.nocional)} = <strong style={{color: r.deltaPreco >= 0 ? COLORS.green : COLORS.red}}>{r.deltaPreco >= 0 ? "+" : ""}{fmt(r.deltaPreco)}</strong></div>
        </Panel>
        <Panel title="③ Resultado total do TRS" bg={r.total >= 0 ? COLORS.greenDim : COLORS.redDim}>
          <div>(1) Carry = +{fmt(r.carry)}</div>
          <div>(2) Variação de preço = {fmt(r.deltaPreco)}</div>
          <PnLBig value={r.total} label="Resultado total" />
          <div style={{marginTop: 12, padding: "10px 14px", borderRadius: 8, background: COLORS.card}}>
            {r.total > 0
              ? `A estratégia funcionou: o carry de ${fmt(r.carry)} somado à valorização de ${fmt(r.deltaPreco)} gerou resultado positivo. O TRS permitiu capturar o retorno sem desembolsar os ${fmt(r.nocional)} da compra direta.`
              : r.deltaPreco < 0
              ? `A debênture perdeu ${Math.abs(r.varPct).toFixed(1)}% de valor, gerando perda de ${fmt(Math.abs(r.deltaPreco))} que superou o carry de ${fmt(r.carry)}. O TRS transfere o retorno TOTAL — inclusive perdas. A exposição econômica é idêntica à compra direta.`
              : `Sem variação de preço significativa. O resultado foi o carry puro de ${fmt(r.carry)}. O cenário-base se materializou.`}
          </div>
        </Panel>
      </div>
    );
  }

  if (strat === "cds_spec") {
    const isUSD = r.moeda === "USD";
    const f = isUSD ? fmtUSD : fmt;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
          <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>{scenario.description}</p>
        </div>
        <Panel title="① Mark-to-market (variação do spread)">
          <div>(1) Spread na contratação = {r.spreadInicial} bps</div>
          <div>(2) Spread atual = {r.spreadFinal} bps</div>
          <div>(3) Variação = {r.spreadFinal > r.spreadInicial ? "+" : ""}{r.spreadVar} bps {r.spreadVar > 0 ? "(alargou — tese acertou)" : "(comprimiu — tese errou)"}</div>
          <div>(4) DV01 total = {f(r.dv01Total)}/bp</div>
          <div>(5) Ganho/perda MTM = {f(r.dv01Total)} × {Math.abs(r.spreadVar)} bps = <strong style={{color: r.mtm >= 0 ? COLORS.green : COLORS.red}}>{r.mtm >= 0 ? "+" : ""}{f(r.mtm)}</strong></div>
        </Panel>
        <Panel title="② Custo de carregamento (carry)">
          <div>(1) Spread pago = {r.spreadInicial} bps a.a.</div>
          <div>(2) Carry anual = {(r.spreadInicial/100).toFixed(2)}% × {f(r.nocional)} = <strong style={{color: COLORS.red}}>−{f(r.carryAnual)}</strong></div>
        </Panel>
        <Panel title="③ Resultado líquido" bg={r.resultadoLiquido >= 0 ? COLORS.greenDim : COLORS.redDim}>
          <div>(1) MTM = {f(r.mtm)}</div>
          <div>(2) Carry = −{f(r.carryAnual)}</div>
          <PnLBig value={r.resultadoLiquido} label="Resultado líquido (~12 meses)" />
          <div style={{marginTop: 12, padding: "10px 14px", borderRadius: 8, background: COLORS.card}}>
            {r.spreadVar > 0
              ? `O spread alargou ${r.spreadVar} bps como projetado. O ganho de MTM (${f(r.mtm)}) superou o custo do carry (${f(r.carryAnual)}). A aposta na deterioração do crédito acertou.`
              : r.spreadVar < 0
              ? `O spread comprimiu ${Math.abs(r.spreadVar)} bps — oposto da tese. Perda de MTM (${f(Math.abs(r.mtm))}) somada ao carry (${f(r.carryAnual)}). A posição perdeu mas dentro do stop loss.`
              : `O spread pouco se moveu. Resultado ≈ carry negativo de ${f(r.carryAnual)}. A posição carrega custo enquanto espera o movimento.`}
          </div>
        </Panel>
      </div>
    );
  }

  if (strat === "basis_trade") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
          <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>{scenario.description}</p>
        </div>
        <Panel title="① Carry (custo de carregamento da posição)">
          <div>(1) Rendimento da debênture = +{r.bondSpread} bps a.a.</div>
          <div>(2) Custo do CDS = −{r.cdsInicial} bps a.a.</div>
          <div>(3) Carry líquido = {r.bondSpread} − {r.cdsInicial} = {r.bondSpread - r.cdsInicial} bps a.a. = <strong style={{color: COLORS.red}}>{fmt(r.carryAnual)}/ano</strong></div>
          <div>(4) Carry pago em {r.meses} meses = <strong style={{color: COLORS.red}}>{fmt(r.carryPago)}</strong></div>
        </Panel>
        <Panel title="② Mark-to-market do CDS">
          <div>(1) CDS na contratação = {r.cdsInicial} bps</div>
          <div>(2) CDS atual = {r.cdsFinal} bps</div>
          <div>(3) Variação = {r.cdsInicial > r.cdsFinal ? "−" : "+"}{Math.abs(r.cdsVar)} bps {r.cdsVar > 0 ? "(CDS caiu — base convergiu)" : "(CDS subiu — base divergiu)"}</div>
          <div>(4) DV01 total = {fmt(r.dv01Total)}/bp</div>
          <div>(5) Ganho MTM = {fmt(r.dv01Total)} × {Math.abs(r.cdsVar)} bps = <strong style={{color: r.mtmCDS >= 0 ? COLORS.green : COLORS.red}}>{r.mtmCDS >= 0 ? "+" : ""}{fmt(r.mtmCDS)}</strong></div>
        </Panel>
        <Panel title="③ Base — convergência ou divergência?">
          <div>(1) Base inicial (CDS − bond) = {r.baseInicial} bps</div>
          <div>(2) Base final = {r.cdsFinal} − {r.bondSpread} = {r.baseFinal} bps</div>
          <div>(3) Variação da base = {r.baseInicial} → {r.baseFinal} bps ({r.baseFinal < r.baseInicial ? "convergiu ✓" : r.baseFinal > r.baseInicial ? "divergiu ✗" : "estável"})</div>
        </Panel>
        <Panel title="④ Resultado líquido do basis trade" bg={r.resultadoLiquido >= 0 ? COLORS.greenDim : COLORS.redDim}>
          <div>(1) Ganho MTM do CDS = {fmt(r.mtmCDS)}</div>
          <div>(2) Carry pago ({r.meses} meses) = {fmt(r.carryPago)}</div>
          <PnLBig value={r.resultadoLiquido} label="Resultado líquido" />
          <div style={{marginTop: 12, padding: "10px 14px", borderRadius: 8, background: COLORS.card}}>
            {r.baseFinal < r.baseInicial * 0.5
              ? `A base convergiu de ${r.baseInicial} para ${r.baseFinal} bps. O ganho de MTM no CDS (${fmt(r.mtmCDS)}) superou o carry negativo (${fmt(Math.abs(r.carryPago))}). A arbitragem de base funcionou.`
              : r.baseFinal > r.baseInicial
              ? `A base divergiu de ${r.baseInicial} para ${r.baseFinal} bps. Em condições de estresse, CDS e bonds podem se descolar ainda mais. O basis trade tem risco de timing — a convergência pode levar mais tempo que o esperado. Porém, se mantiver a posição, a base historicamente converge no médio prazo.`
              : `A base ficou relativamente estável. O custo principal foi o carry negativo de ${fmt(Math.abs(r.carryPago))}. O timing risk é o principal inimigo do basis trade.`}
          </div>
        </Panel>
      </div>
    );
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   MOTOR DE CÁLCULO — OPÇÕES
   ═══════════════════════════════════════════════════════════════ */

function calculateOptionsResult(scenarioData, fixingRate) {
  const md = scenarioData.context.marketData;
  const strat = scenarioData.optionStrategy;
  const spot = md.spotRate;
  const S = fixingRate;

  if (strat === "long_put_hedge") {
    const K = md.strike;
    const prem = md.premium;
    const n = md.notional_usd;
    const putIntrinsic = Math.max(K - S, 0);
    const putPnL = (putIntrinsic - prem) * n;
    const carteiraPnL = (S - spot) * n;
    const combinedPnL = carteiraPnL + putPnL;
    return { putIntrinsic, putPnL, carteiraPnL, combinedPnL, premium: prem, strike: K, spot, fixing: S, notional: n, breakeven: K - prem };
  }
  if (strat === "collar") {
    const pK = md.putStrike, pP = md.putPremium, cK = md.callStrike, cP = md.callPremium;
    const n = md.notional_usd;
    const netCost = pP - cP;
    const putPayoff = Math.max(pK - S, 0);
    const callPayoff = -Math.max(S - cK, 0); // sold call
    const optionsPnL = (putPayoff + callPayoff - netCost) * n;
    const receita = S * n;
    const receitaEfetiva = receita + (putPayoff + callPayoff) * n - netCost * n;
    return { putPayoff, callPayoff, netCost, optionsPnL, receita, receitaEfetiva, putStrike: pK, callStrike: cK, putPremium: pP, callPremium: cP, spot, fixing: S, notional: n };
  }
  if (strat === "straddle") {
    const K = md.strike;
    const cP = md.callPremium, pP = md.putPremium;
    const totalPrem = cP + pP;
    const n = md.notional_usd;
    const callIntrinsic = Math.max(S - K, 0);
    const putIntrinsic = Math.max(K - S, 0);
    const pnlPerUnit = callIntrinsic + putIntrinsic - totalPrem;
    const totalPnL = pnlPerUnit * n;
    return { callIntrinsic, putIntrinsic, totalPrem, pnlPerUnit, totalPnL, strike: K, spot, fixing: S, notional: n, breakUp: K + totalPrem, breakDown: K - totalPrem };
  }
  if (strat === "risk_reversal") {
    const pK = md.putStrike, pP = md.putPremium, cK = md.callStrike, cP = md.callPremium;
    const n = md.notional_usd;
    const credit = pP - cP;
    const putLoss = -Math.max(pK - S, 0); // sold put
    const callGain = Math.max(S - cK, 0); // bought call
    const pnlPerUnit = putLoss + callGain + credit;
    const totalPnL = pnlPerUnit * n;
    return { putLoss, callGain, credit, pnlPerUnit, totalPnL, putStrike: pK, callStrike: cK, spot, fixing: S, notional: n };
  }
  return {};
}

function generateOptionsPayoffData(scenarioData) {
  const md = scenarioData.context.marketData;
  const strat = scenarioData.optionStrategy;
  const spot = md.spotRate;
  const points = [];
  const min = spot * 0.7, max = spot * 1.3;
  const step = (max - min) / 80;

  for (let S = min; S <= max; S += step) {
    let pnl = 0;
    if (strat === "long_put_hedge") {
      const putPnL = (Math.max(md.strike - S, 0) - md.premium) * md.notional_usd;
      const carteira = (S - spot) * md.notional_usd;
      pnl = putPnL + carteira; // combined
    } else if (strat === "collar") {
      const putPay = Math.max(md.putStrike - S, 0);
      const callPay = -Math.max(S - md.callStrike, 0);
      const net = md.putPremium - md.callPremium;
      pnl = (S - spot + putPay + callPay - net) * md.notional_usd; // receita vs spot
    } else if (strat === "straddle") {
      const callI = Math.max(S - md.strike, 0);
      const putI = Math.max(md.strike - S, 0);
      pnl = (callI + putI - md.callPremium - md.putPremium) * md.notional_usd;
    } else if (strat === "risk_reversal") {
      const putL = -Math.max(md.putStrike - S, 0);
      const callG = Math.max(S - md.callStrike, 0);
      const credit = md.putPremium - md.callPremium;
      pnl = (putL + callG + credit) * md.notional_usd;
    }
    points.push({ fixing: parseFloat(S.toFixed(2)), pnl: parseFloat(pnl.toFixed(0)), zero: 0 });
  }
  return points;
}

/* ═══════════════════════════════════════════════════════════════
   MOTOR DE CÁLCULO P&L
   ═══════════════════════════════════════════════════════════════ */

function calculateResult(marketData, forwardRate, fixingRate, position, hedgeRatio = 1.0) {
  const notional = marketData.notional_usd;
  const hedgedNotional = notional * hedgeRatio;
  let ndfPnL;
  if (position === "sell_usd") {
    ndfPnL = (forwardRate - fixingRate) * hedgedNotional;
  } else {
    ndfPnL = (fixingRate - forwardRate) * hedgedNotional;
  }
  const spotConversion = fixingRate * notional;
  const hedgedConversion = forwardRate * hedgedNotional + fixingRate * (notional - hedgedNotional);
  return { ndfPnL, forwardRate, fixingRate, notional, hedgedNotional, spotConversion, hedgedConversion, hedgeBenefit: spotConversion - hedgedConversion, effectiveRate: hedgedConversion / notional };
}

function generatePayoffData(forwardRate, position, notional) {
  const points = [];
  const min = forwardRate * 0.85;
  const max = forwardRate * 1.15;
  const step = (max - min) / 60;
  for (let fixing = min; fixing <= max; fixing += step) {
    let pnl = position === "sell_usd" ? (forwardRate - fixing) * notional : (fixing - forwardRate) * notional;
    points.push({ fixing: parseFloat(fixing.toFixed(4)), pnl: parseFloat(pnl.toFixed(0)), zero: 0 });
  }
  return points;
}

/* ═══════════════════════════════════════════════════════════════
   FORMATADORES & CORES
   ═══════════════════════════════════════════════════════════════ */

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
const fmtRate = (v) => new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(v);

const COLORS = {
  bg: "#0a0f1a", card: "#111827", cardHover: "#1a2235", border: "#1e2a3a",
  accent: "#22d3ee", accentDim: "rgba(34,211,238,0.15)",
  green: "#34d399", greenDim: "rgba(52,211,153,0.15)",
  red: "#f87171", redDim: "rgba(248,113,113,0.15)",
  gold: "#fbbf24", goldDim: "rgba(251,191,36,0.15)",
  text: "#e2e8f0", textMuted: "#94a3b8", textDim: "#475569",
};

function MarkdownText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (<span>{parts.map((p, i) => p.startsWith("**") && p.endsWith("**") ? <strong key={i} style={{ color: COLORS.accent, fontWeight: 700 }}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>)}</span>);
}

function ScoreBar({ score, maxScore }) {
  const pct = maxScore > 0 ? Math.min((score / maxScore) * 100, 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: COLORS.border, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.green})`, transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
      </div>
      <span style={{ color: COLORS.gold, fontWeight: 700, fontSize: 14, fontFamily: "'JetBrains Mono', monospace", minWidth: 60, textAlign: "right" }}>{score} / {maxScore}</span>
    </div>
  );
}

function FixingDot({ cx, cy, payload, fixingRate, fixingPnL, tolerance, overridePnL }) {
  if (!fixingRate || Math.abs(payload.fixing - fixingRate) > (tolerance || 0.02)) return null;
  const displayPnL = overridePnL !== undefined ? overridePnL : fixingPnL;
  const isProfit = displayPnL >= 0;
  const color = isProfit ? COLORS.green : COLORS.red;
  return (
    <g>
      <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.15}><animate attributeName="r" from="10" to="18" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" from="0.2" to="0" dur="2s" repeatCount="indefinite" /></circle>
      <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.2} />
      <circle cx={cx} cy={cy} r={6} fill={color} stroke="#fff" strokeWidth={2} />
      <rect x={cx - 70} y={cy - 38} width={140} height={24} rx={6} fill={COLORS.card} stroke={color} strokeWidth={1} opacity={0.95} />
      <text x={cx} y={cy - 22} textAnchor="middle" fill={color} fontSize={12} fontWeight="bold" fontFamily="'JetBrains Mono', monospace">{isProfit ? "+" : ""}{fmt(displayPnL)}</text>
    </g>
  );
}

function PayoffChart({ forwardRate, position, notional, fixingRate, xLabel, overrideFixingPnL }) {
  // Expand range to include both forwardRate and fixingRate
  let min = forwardRate * 0.85;
  let max = forwardRate * 1.15;
  if (fixingRate) {
    min = Math.min(min, fixingRate * 0.95);
    max = Math.max(max, fixingRate * 1.05);
  }
  const range = max - min;
  const step = range / 60;
  const tolerance = range / 50; // proportional tolerance for dot matching

  const data = [];
  for (let fixing = min; fixing <= max; fixing += step) {
    let pnl = position === "sell_usd" ? (forwardRate - fixing) * notional : (fixing - forwardRate) * notional;
    data.push({ fixing: parseFloat(fixing.toFixed(4)), pnl: parseFloat(pnl.toFixed(0)), zero: 0 });
  }

  let fixingPnL = 0;
  if (fixingRate) { fixingPnL = position === "sell_usd" ? (forwardRate - fixingRate) * notional : (fixingRate - forwardRate) * notional; }
  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 40, right: 20, left: 20, bottom: 10 }}>
          <defs><linearGradient id="pnlGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS.green} stopOpacity={0.4} /><stop offset="100%" stopColor={COLORS.green} stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis dataKey="fixing" stroke={COLORS.textDim} tick={{ fontSize: 11, fill: COLORS.textMuted }} label={{ value: xLabel || "Taxa de Liquidação", position: "insideBottom", offset: -5, fill: COLORS.textMuted, fontSize: 11 }} />
          <YAxis stroke={COLORS.textDim} tick={{ fontSize: 11, fill: COLORS.textMuted }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} label={{ value: "P&L (R$)", angle: -90, position: "insideLeft", fill: COLORS.textMuted, fontSize: 11 }} />
          <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }} formatter={(v) => [fmt(v), "P&L"]} labelFormatter={(v) => `${fmtRate(v)}`} />
          <ReferenceLine y={0} stroke={COLORS.textDim} strokeDasharray="4 4" />
          {fixingRate && <ReferenceLine x={fixingRate} stroke={COLORS.gold} strokeWidth={2} label={{ value: `Liquidação: ${fmtRate(fixingRate)}`, fill: COLORS.gold, fontSize: 12, fontWeight: 700, position: "insideBottomRight" }} />}
          <ReferenceLine x={forwardRate} stroke={COLORS.accent} strokeDasharray="4 4" label={{ value: `Entrada: ${fmtRate(forwardRate)}`, fill: COLORS.accent, fontSize: 11, position: "top" }} />
          <Area type="monotone" dataKey="pnl" stroke={COLORS.accent} strokeWidth={2} fill="url(#pnlGreen)" dot={(props) => <FixingDot key={props.index} {...props} fixingRate={fixingRate} fixingPnL={fixingPnL} tolerance={tolerance} overridePnL={overrideFixingPnL} />} activeDot={{ r: 4, fill: COLORS.accent, stroke: COLORS.text }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function OptionsPayoffChart({ scenarioData, fixingRate, optResult }) {
  const data = generateOptionsPayoffData(scenarioData);
  const md = scenarioData.context.marketData;
  const spot = md.spotRate;
  const totalPnL = optResult?.totalPnL ?? optResult?.combinedPnL ?? optResult?.optionsPnL ?? 0;
  const range = (spot * 1.3) - (spot * 0.7);
  const tol = range / 50;

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 40, right: 20, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id="optGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.4} />
              <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
          <XAxis dataKey="fixing" stroke={COLORS.textDim} tick={{ fontSize: 11, fill: COLORS.textMuted }}
            label={{ value: "Preço do Ativo no Vencimento", position: "insideBottom", offset: -5, fill: COLORS.textMuted, fontSize: 11 }} />
          <YAxis stroke={COLORS.textDim} tick={{ fontSize: 11, fill: COLORS.textMuted }}
            tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`}
            label={{ value: "P&L (R$)", angle: -90, position: "insideLeft", fill: COLORS.textMuted, fontSize: 11 }} />
          <Tooltip contentStyle={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
            formatter={(v) => [fmt(v), "P&L"]} labelFormatter={(v) => `Preço: R$ ${Number(v).toFixed(2)}`} />
          <ReferenceLine y={0} stroke={COLORS.textDim} strokeDasharray="4 4" />
          {fixingRate && <ReferenceLine x={fixingRate} stroke={COLORS.gold} strokeWidth={2}
            label={{ value: `Vcto: R$ ${fixingRate.toFixed(2)}`, fill: COLORS.gold, fontSize: 12, fontWeight: 700, position: "insideBottomRight" }} />}
          <ReferenceLine x={spot} stroke={COLORS.accent} strokeDasharray="4 4"
            label={{ value: `Spot: R$ ${spot.toFixed(2)}`, fill: COLORS.accent, fontSize: 11, position: "top" }} />
          <Area type="monotone" dataKey="pnl" stroke={COLORS.accent} strokeWidth={2} fill="url(#optGreen)"
            dot={(props) => <FixingDot key={props.index} {...props} fixingRate={fixingRate} fixingPnL={0} tolerance={tol} overridePnL={totalPnL} />}
            activeDot={{ r: 4, fill: COLORS.accent, stroke: COLORS.text }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function OptionsResultPanel({ scenario, scenarioData }) {
  const r = calculateOptionsResult(scenarioData, scenario.fixingRate);
  const strat = scenarioData.optionStrategy;
  const md = scenarioData.context.marketData;

  const Panel = ({ title, children, color: bgTint }) => (
    <div style={{ padding: "20px 24px", borderRadius: 12, background: bgTint || COLORS.card, border: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.8 }}>{children}</div>
    </div>
  );

  const PnLBig = ({ value, label }) => {
    const c = value >= 0 ? COLORS.green : COLORS.red;
    return (
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 12, color: COLORS.textMuted }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: c, fontFamily: "'JetBrains Mono', monospace" }}>
          {value >= 0 ? "+" : ""}{fmt(value)}
        </div>
      </div>
    );
  };

  if (strat === "long_put_hedge") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
          <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>{scenario.description}</p>
        </div>
        <Panel title="① Resultado da put (isolada)">
          <div>(1) Strike da put = R$ {r.strike.toFixed(2)}</div>
          <div>(2) PETR4 no vencimento = <strong style={{color: COLORS.gold}}>R$ {r.fixing.toFixed(2)}</strong></div>
          <div>(3) Valor intrínseco = max(R$ {r.strike.toFixed(2)} − R$ {r.fixing.toFixed(2)}, 0) = <strong>R$ {r.putIntrinsic.toFixed(2)}/ação</strong></div>
          <div>(4) Prêmio pago = R$ {r.premium.toFixed(2)}/ação</div>
          <div>(5) Resultado por ação = R$ {r.putIntrinsic.toFixed(2)} − R$ {r.premium.toFixed(2)} = <strong style={{color: (r.putIntrinsic - r.premium) >= 0 ? COLORS.green : COLORS.red}}>R$ {(r.putIntrinsic - r.premium).toFixed(2)}/ação</strong></div>
          <PnLBig value={r.putPnL} label={`Resultado total da put (× ${(r.notional/1e6).toFixed(1)}M ações)`} />
        </Panel>
        <Panel title="② Resultado da carteira de ações (sem hedge)">
          <div>(1) Preço de compra = R$ {r.spot.toFixed(2)}</div>
          <div>(2) Preço no vencimento = R$ {r.fixing.toFixed(2)}</div>
          <div>(3) Variação = R$ {(r.fixing - r.spot).toFixed(2)}/ação ({((r.fixing - r.spot)/r.spot * 100).toFixed(1)}%)</div>
          <PnLBig value={r.carteiraPnL} label="Resultado da carteira sem hedge" />
        </Panel>
        <Panel title="③ Resultado combinado (carteira + put = hedge)" color={COLORS.accentDim}>
          <div>(1) Resultado da carteira = <strong style={{color: r.carteiraPnL >= 0 ? COLORS.green : COLORS.red}}>{fmt(r.carteiraPnL)}</strong></div>
          <div>(2) Resultado da put = <strong style={{color: r.putPnL >= 0 ? COLORS.green : COLORS.red}}>{fmt(r.putPnL)}</strong></div>
          <div>(3) Resultado combinado = {fmt(r.carteiraPnL)} + {fmt(r.putPnL)}</div>
          <PnLBig value={r.combinedPnL} label="Resultado líquido (carteira hedgeada)" />
          <div style={{marginTop: 12, padding: "10px 14px", borderRadius: 8, background: COLORS.card}}>
            {r.fixing < r.strike
              ? `A ação caiu abaixo do strike (R$ ${r.strike.toFixed(2)}). A put compensou R$ ${r.putIntrinsic.toFixed(2)}/ação da queda. Sem o hedge, a perda teria sido ${fmt(r.carteiraPnL)}. Com hedge, foi ${fmt(r.combinedPnL)}. O seguro funcionou.`
              : r.fixing > r.spot
              ? `A ação subiu! A put venceu sem valor (OTM) — o prêmio de R$ ${r.premium.toFixed(2)}/ação foi o custo do seguro. A carteira ganhou ${fmt(r.carteiraPnL)}, líquido de ${fmt(r.combinedPnL)} após o custo da put. O upside foi preservado.`
              : `A ação caiu, mas ficou acima do strike. A put venceu sem valor. O prêmio foi o custo do seguro que não precisou ser acionado.`}
          </div>
        </Panel>
        <div style={{ padding: "16px 8px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8, paddingLeft: 12, textTransform: "uppercase", letterSpacing: 1 }}>Diagrama de Payoff (Carteira + Put)</div>
          <OptionsPayoffChart scenarioData={scenarioData} fixingRate={scenario.fixingRate} optResult={r} />
        </div>
      </div>
    );
  }

  if (strat === "collar") {
    const netCostTotal = r.netCost * r.notional;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
          <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>{scenario.description}</p>
        </div>
        <Panel title="① Resultado das opções">
          <div>(1) Put comprada (strike R$ {r.putStrike.toFixed(2)}): valor intrínseco = R$ {r.putPayoff.toFixed(2)}/USD</div>
          <div>(2) Call vendida (strike R$ {r.callStrike.toFixed(2)}): obrigação = R$ {Math.abs(r.callPayoff).toFixed(2)}/USD {r.callPayoff < 0 ? "(exercida contra você)" : "(venceu OTM)"}</div>
          <div>(3) Custo líquido do collar = R$ {r.netCost.toFixed(2)}/USD</div>
          <div>(4) Resultado das opções por USD = R$ {r.putPayoff.toFixed(2)} + (R$ {r.callPayoff.toFixed(2)}) − R$ {r.netCost.toFixed(2)} = <strong style={{color: (r.putPayoff + r.callPayoff - r.netCost) >= 0 ? COLORS.green : COLORS.red}}>R$ {(r.putPayoff + r.callPayoff - r.netCost).toFixed(2)}/USD</strong></div>
        </Panel>
        <Panel title="② Receita efetiva do exportador" color={COLORS.accentDim}>
          <div>(1) Receita no mercado spot = R$ {r.fixing.toFixed(2)} × USD {(r.notional/1e6).toFixed(0)}M = {fmt(r.receita)}</div>
          <div>(2) Ajuste das opções = {fmt((r.putPayoff + r.callPayoff) * r.notional)}</div>
          <div>(3) Custo do collar = −{fmt(netCostTotal)}</div>
          <PnLBig value={r.receitaEfetiva} label="Receita efetiva total" />
          <div style={{marginTop: 12, padding: "10px 14px", borderRadius: 8, background: COLORS.card}}>
            {r.fixing < r.putStrike
              ? `O dólar caiu abaixo do piso (R$ ${r.putStrike.toFixed(2)}). A put foi exercida, garantindo receita mínima. Sem collar, receita seria ${fmt(r.receita)}. Com collar: ${fmt(r.receitaEfetiva)}. O piso funcionou.`
              : r.fixing > r.callStrike
              ? `O dólar subiu acima do teto (R$ ${r.callStrike.toFixed(2)}). A call foi exercida e o exportador entregou USD a R$ ${r.callStrike.toFixed(2)}. Receita efetiva: ${fmt(r.receitaEfetiva)}. "Perdeu" R$ ${(r.fixing - r.callStrike).toFixed(2)}/USD de upside — o preço do hedge barato.`
              : `O dólar ficou dentro do corredor (R$ ${r.putStrike.toFixed(2)} – R$ ${r.callStrike.toFixed(2)}). Ambas vencem OTM. Receita = spot × nocional − custo collar = ${fmt(r.receitaEfetiva)}.`}
          </div>
        </Panel>
        <div style={{ padding: "16px 8px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8, paddingLeft: 12, textTransform: "uppercase", letterSpacing: 1 }}>Diagrama de Payoff (Collar)</div>
          <OptionsPayoffChart scenarioData={scenarioData} fixingRate={scenario.fixingRate} optResult={{totalPnL: r.optionsPnL}} />
        </div>
      </div>
    );
  }

  if (strat === "straddle") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
          <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>{scenario.description}</p>
        </div>
        <Panel title="① Resultado do straddle">
          <div>(1) Call ATM (strike R$ {r.strike.toFixed(2)}): valor intrínseco = R$ {r.callIntrinsic.toFixed(2)}</div>
          <div>(2) Put ATM (strike R$ {r.strike.toFixed(2)}): valor intrínseco = R$ {r.putIntrinsic.toFixed(2)}</div>
          <div>(3) Valor intrínseco total = R$ {(r.callIntrinsic + r.putIntrinsic).toFixed(2)}/ação</div>
          <div>(4) Custo do straddle = R$ {r.totalPrem.toFixed(2)}/ação</div>
          <div>(5) Resultado por ação = R$ {(r.callIntrinsic + r.putIntrinsic).toFixed(2)} − R$ {r.totalPrem.toFixed(2)} = <strong style={{color: r.pnlPerUnit >= 0 ? COLORS.green : COLORS.red}}>R$ {r.pnlPerUnit.toFixed(2)}/ação</strong></div>
          <div>(6) Breakeven superior = R$ {r.breakUp.toFixed(2)} (+{((r.breakUp - r.strike)/r.strike * 100).toFixed(1)}%)</div>
          <div>(7) Breakeven inferior = R$ {r.breakDown.toFixed(2)} (−{((r.strike - r.breakDown)/r.strike * 100).toFixed(1)}%)</div>
          <PnLBig value={r.totalPnL} label={`Resultado total (× ${(r.notional/1000).toFixed(0)}k ações)`} />
          <div style={{marginTop: 12, padding: "10px 14px", borderRadius: 8, background: COLORS.card}}>
            {r.pnlPerUnit > 0
              ? `O ativo se moveu ${Math.abs(((r.fixing - r.strike)/r.strike * 100)).toFixed(1)}% — ultrapassou o breakeven de ${((r.totalPrem)/r.strike * 100).toFixed(1)}%. A aposta em volatilidade acertou.`
              : r.pnlPerUnit === -r.totalPrem
              ? `O ativo ficou exatamente no strike. Perda máxima: todo o prêmio. O pior cenário do straddle.`
              : `O ativo se moveu apenas ${Math.abs(((r.fixing - r.strike)/r.strike * 100)).toFixed(1)}% — insuficiente para cobrir o custo de R$ ${r.totalPrem.toFixed(2)}/ação. O movimento ficou abaixo do breakeven.`}
          </div>
        </Panel>
        <div style={{ padding: "16px 8px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8, paddingLeft: 12, textTransform: "uppercase", letterSpacing: 1 }}>Diagrama de Payoff (Straddle)</div>
          <OptionsPayoffChart scenarioData={scenarioData} fixingRate={scenario.fixingRate} optResult={r} />
        </div>
      </div>
    );
  }

  if (strat === "risk_reversal") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
          <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>{scenario.description}</p>
        </div>
        <Panel title="① Put vendida (obrigação)">
          <div>(1) Strike = R$ {r.putStrike.toFixed(2)}. Dólar final = R$ {r.fixing.toFixed(2)}</div>
          <div>(2) Valor intrínseco contra você = max(R$ {r.putStrike.toFixed(2)} − R$ {r.fixing.toFixed(2)}, 0) = R$ {Math.abs(Math.min(r.putLoss, 0)).toFixed(2)}/USD</div>
          <div>(3) Resultado da put vendida = <strong style={{color: r.putLoss >= 0 ? COLORS.green : COLORS.red}}>{r.putLoss >= 0 ? "+" : ""}R$ {r.putLoss.toFixed(2)}/USD</strong> {r.putLoss === 0 ? "(venceu OTM — sem obrigação)" : "(exercida contra você)"}</div>
        </Panel>
        <Panel title="② Call comprada (direito)">
          <div>(1) Strike = R$ {r.callStrike.toFixed(2)}. Dólar final = R$ {r.fixing.toFixed(2)}</div>
          <div>(2) Valor intrínseco = max(R$ {r.fixing.toFixed(2)} − R$ {r.callStrike.toFixed(2)}, 0) = R$ {r.callGain.toFixed(2)}/USD</div>
          <div>(3) Resultado da call comprada = <strong style={{color: r.callGain > 0 ? COLORS.green : COLORS.textMuted}}>+R$ {r.callGain.toFixed(2)}/USD</strong> {r.callGain === 0 ? "(venceu OTM)" : "(exercida a seu favor)"}</div>
        </Panel>
        <Panel title="③ Resultado líquido do risk reversal" color={r.totalPnL >= 0 ? COLORS.greenDim : COLORS.redDim}>
          <div>(1) Put vendida = R$ {r.putLoss.toFixed(2)}/USD × {(r.notional/1e6).toFixed(0)}M = {fmt(r.putLoss * r.notional)}</div>
          <div>(2) Call comprada = R$ {r.callGain.toFixed(2)}/USD × {(r.notional/1e6).toFixed(0)}M = {fmt(r.callGain * r.notional)}</div>
          <div>(3) Crédito líquido recebido = R$ {r.credit.toFixed(2)}/USD × {(r.notional/1e6).toFixed(0)}M = {fmt(r.credit * r.notional)}</div>
          <div>(4) Total = {fmt(r.putLoss * r.notional)} + {fmt(r.callGain * r.notional)} + {fmt(r.credit * r.notional)}</div>
          <PnLBig value={r.totalPnL} label="Resultado líquido do risk reversal" />
          <div style={{marginTop: 12, padding: "10px 14px", borderRadius: 8, background: COLORS.card}}>
            {r.fixing < r.putStrike
              ? `O dólar caiu abaixo do strike da put (R$ ${r.putStrike.toFixed(2)}). A put vendida foi exercida contra você — perda de R$ ${Math.abs(r.putLoss).toFixed(2)}/USD. O skew se mostrou justificado: o mercado estava certo em precificar mais risco de queda.`
              : r.fixing > r.callStrike
              ? `O dólar subiu acima do strike da call (R$ ${r.callStrike.toFixed(2)}). A call foi exercida a seu favor — ganho de R$ ${r.callGain.toFixed(2)}/USD, mais o crédito recebido. O skew estava exagerado e a posição lucrou.`
              : `O dólar ficou dentro do corredor (R$ ${r.putStrike.toFixed(2)} – R$ ${r.callStrike.toFixed(2)}). Ambas venceram OTM. Resultado = crédito líquido de ${fmt(r.credit * r.notional)}. O melhor cenário: embolsou o prêmio do skew.`}
          </div>
        </Panel>
        <div style={{ padding: "16px 8px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8, paddingLeft: 12, textTransform: "uppercase", letterSpacing: 1 }}>Diagrama de Payoff (Risk Reversal)</div>
          <OptionsPayoffChart scenarioData={scenarioData} fixingRate={scenario.fixingRate} optResult={r} />
        </div>
      </div>
    );
  }

  return null;
}

function ResultPanel({ result, scenario, position, forwardChosen, instrument, scenarioData }) {
  // Delegate to specialized panels
  if (scenarioData?.optionStrategy) {
    return <OptionsResultPanel scenario={scenario} scenarioData={scenarioData} />;
  }
  if (scenarioData?.creditStrategy) {
    return <CreditResultPanel scenario={scenario} scenarioData={scenarioData} />;
  }
  if (scenarioData?.embeddedStrategy) {
    return <EmbeddedResultPanel scenario={scenario} scenarioData={scenarioData} />;
  }

  const isProfit = result.ndfPnL > 0;
  const color = isProfit ? COLORS.green : result.ndfPnL === 0 ? COLORS.gold : COLORS.red;
  const bgColor = isProfit ? COLORS.greenDim : result.ndfPnL === 0 ? COLORS.goldDim : COLORS.redDim;
  const isFut = instrument?.includes("Futuro") || instrument?.includes("DI") || instrument?.includes("DOL") || instrument?.includes("Spread");
  const isDI = (instrument?.includes("DI") || instrument?.includes("Spread")) && !instrument?.includes("Swap");
  const isSwap = instrument?.includes("Swap");
  const isSwapCambial = instrument?.includes("USD");
  const isSwapCDI = isSwap && !isSwapCambial;
  const posLabel = isDI ? (position === "buy_usd" ? "comprou taxa" : "vendeu taxa") : isSwapCDI ? (position === "sell_usd" ? "recebeu taxa fixa" : "pagou taxa fixa") : isSwapCambial ? "contratou swap cambial" : (position === "sell_usd" ? "vendeu" : "comprou");
  const altPos = position === "sell_usd" ? "buy_usd" : "sell_usd";
  const altLabel = isDI ? (altPos === "buy_usd" ? "comprado taxa" : "vendido taxa") : isSwapCDI ? (altPos === "sell_usd" ? "recebido taxa fixa" : "pago taxa fixa") : isSwapCambial ? "não contratado swap" : (altPos === "sell_usd" ? "vendido" : "comprado");
  const altPnL = altPos === "sell_usd" ? (forwardChosen - scenario.fixingRate) * result.notional : (scenario.fixingRate - forwardChosen) * result.notional;
  const xLabel = isSwapCambial ? "Dólar Final (R$/USD)" : isSwapCDI ? "CDI Médio Acumulado (% a.a.)" : isFut ? "Taxa / Preço de Liquidação" : "Taxa de Fixing (R$/USD)";

  // Swap cambial specific calculations
  const md = scenarioData?.context?.marketData;
  const spotInicial = md?.spotRate || 5.20;
  const notionalUSD = md?.notional_usd || 100000000;
  const nocionalBRL = spotInicial * notionalUSD;
  const prazoAnos = (md?.tenor || 756) / 252;
  const cdiAA = md?.cdiRate || 0.1175;
  const cupomCambial = 0.045; // cupom cambial do swap
  const fixDolar = scenario.fixingRate;
  const varCambialPct = ((fixDolar - spotInicial) / spotInicial * 100);
  const varCambialBRL = (fixDolar - spotInicial) * notionalUSD;

  // Perna ativa (recebe): variação cambial + cupom cambial
  const pernaCambial = notionalUSD * fixDolar * Math.pow(1 + cupomCambial, prazoAnos) - nocionalBRL;
  // Perna passiva (paga): CDI acumulado
  const pernaCDI = nocionalBRL * (Math.pow(1 + cdiAA, prazoAnos) - 1);
  // Resultado líquido do swap = recebe - paga
  const resultadoSwap = pernaCambial - pernaCDI;

  const custoSemSwap = fixDolar * notionalUSD;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Scenario description */}
      <div style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
        <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>{scenario.description}</p>
      </div>

      {/* ──── SWAP CAMBIAL: custom 3-panel result ──── */}
      {isSwapCambial ? (
        <>
          {/* Panel 1: Dívida SEM swap */}
          <div style={{ padding: "20px 24px", borderRadius: 12, background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              ① Dívida sem swap (exposição cambial aberta)
            </div>
            <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.8 }}>
              <div>(1) Dívida = USD {(notionalUSD/1e6).toFixed(0)}M</div>
              <div>(2) Dólar na contratação = <strong style={{color: COLORS.accent}}>R$ {spotInicial.toFixed(2)}</strong></div>
              <div>(3) Dólar no vencimento = <strong style={{color: COLORS.gold}}>R$ {fixDolar.toFixed(2)}</strong></div>
              <div>(4) Variação cambial = ({fixDolar.toFixed(2)} − {spotInicial.toFixed(2)}) ÷ {spotInicial.toFixed(2)} = <strong style={{color: varCambialPct >= 0 ? COLORS.red : COLORS.green}}>{varCambialPct >= 0 ? "+" : ""}{varCambialPct.toFixed(1)}%</strong></div>
              <div>(5) Custo da dívida em reais no vencimento = USD {(notionalUSD/1e6).toFixed(0)}M × R$ {fixDolar.toFixed(2)} = <strong>{fmt(custoSemSwap)}</strong></div>
              <div>(6) Impacto cambial vs contratação = <strong style={{color: varCambialBRL >= 0 ? COLORS.red : COLORS.green}}>{varCambialBRL >= 0 ? "+" : ""}{fmt(varCambialBRL)}</strong> {varCambialBRL > 0 ? "(prejuízo: dólar subiu)" : varCambialBRL < 0 ? "(benefício: dólar caiu)" : "(neutro)"}</div>
            </div>
          </div>

          {/* Panel 2: Resultado do swap isolado — ambas as pernas */}
          <div style={{ padding: "20px 24px", borderRadius: 12, background: resultadoSwap >= 0 ? COLORS.greenDim : COLORS.redDim, border: `1px solid ${resultadoSwap >= 0 ? COLORS.green : COLORS.red}30` }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              ② Resultado do swap cambial (isolado)
            </div>
            <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.8 }}>
              <div style={{marginBottom: 8, fontWeight: 600, color: COLORS.green}}>Perna ativa — recebe: variação cambial + cupom cambial ({(cupomCambial*100).toFixed(1)}% a.a.)</div>
              <div>(1) Nocional inicial em reais = USD {(notionalUSD/1e6).toFixed(0)}M × R$ {spotInicial.toFixed(2)} = {fmt(nocionalBRL)}</div>
              <div>(2) Valor final da perna cambial = USD {(notionalUSD/1e6).toFixed(0)}M × R$ {fixDolar.toFixed(2)} × (1 + {(cupomCambial*100).toFixed(1)}%)^{prazoAnos.toFixed(1)}</div>
              <div>= {fmt(notionalUSD * fixDolar * Math.pow(1 + cupomCambial, prazoAnos))}</div>
              <div>(3) Resultado da perna ativa = {fmt(notionalUSD * fixDolar * Math.pow(1 + cupomCambial, prazoAnos))} − {fmt(nocionalBRL)} = <strong style={{color: pernaCambial >= 0 ? COLORS.green : COLORS.red}}>{pernaCambial >= 0 ? "+" : ""}{fmt(pernaCambial)}</strong></div>

              <div style={{marginTop: 16, marginBottom: 8, fontWeight: 600, color: COLORS.red}}>Perna passiva — paga: CDI acumulado ({(cdiAA*100).toFixed(2)}% a.a.)</div>
              <div>(4) CDI acumulado em {prazoAnos.toFixed(1)} anos = {fmt(nocionalBRL)} × [(1 + {(cdiAA*100).toFixed(2)}%)^{prazoAnos.toFixed(1)} − 1]</div>
              <div>= {fmt(nocionalBRL)} × {(Math.pow(1 + cdiAA, prazoAnos) - 1).toFixed(4)} = <strong style={{color: COLORS.red}}>−{fmt(pernaCDI)}</strong></div>

              <div style={{marginTop: 16, paddingTop: 12, borderTop: `1px solid ${COLORS.border}`}}>
                <div style={{fontWeight: 600}}>Resultado líquido do swap = Perna ativa − Perna passiva</div>
                <div>= {fmt(pernaCambial)} − {fmt(pernaCDI)}</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: resultadoSwap >= 0 ? COLORS.green : COLORS.red, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                = {resultadoSwap >= 0 ? "+" : ""}{fmt(resultadoSwap)}
              </div>
            </div>
          </div>

          {/* Panel 3: Resultado combinado (hedge) */}
          <div style={{ padding: "20px 24px", borderRadius: 12, background: COLORS.accentDim, border: `1px solid ${COLORS.accent}30` }}>
            <div style={{ fontSize: 13, color: COLORS.accent, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              ③ Resultado combinado (dívida + swap = hedge)
            </div>
            <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.8 }}>
              <div>(1) Custo da dívida sem swap = {fmt(custoSemSwap)} (USD {(notionalUSD/1e6).toFixed(0)}M × R$ {fixDolar.toFixed(2)})</div>
              <div>(2) Resultado líquido do swap = <strong style={{color: resultadoSwap >= 0 ? COLORS.green : COLORS.red}}>{resultadoSwap >= 0 ? "+" : ""}{fmt(resultadoSwap)}</strong></div>
              <div>(3) Custo efetivo da dívida com hedge = {fmt(custoSemSwap)} − {fmt(resultadoSwap)} = <strong style={{color: COLORS.accent}}>{fmt(custoSemSwap - resultadoSwap)}</strong></div>
              <div style={{marginTop: 8}}>(4) Custo original (na contratação) = {fmt(nocionalBRL)}</div>
              <div>(5) Diferença = {fmt(custoSemSwap - resultadoSwap - nocionalBRL)} → este é o custo do CDI líquido do cupom cambial ao longo de {prazoAnos.toFixed(1)} anos.</div>

              <div style={{marginTop: 12, padding: "10px 14px", borderRadius: 8, background: COLORS.card}}>
                {varCambialBRL > 0
                  ? `O dólar subiu ${varCambialPct.toFixed(1)}%. Sem swap, a dívida custaria ${fmt(custoSemSwap)} (${fmt(Math.abs(varCambialBRL))} a mais). Com swap, o custo efetivo foi ${fmt(custoSemSwap - resultadoSwap)} — a variação cambial foi substancialmente neutralizada. O custo residual reflete o CDI pago menos o cupom cambial recebido.`
                  : varCambialBRL < 0
                  ? `O dólar caiu ${Math.abs(varCambialPct).toFixed(1)}%. Sem swap, a dívida custaria apenas ${fmt(custoSemSwap)} (${fmt(Math.abs(varCambialBRL))} a menos). Com swap, o custo efetivo foi ${fmt(custoSemSwap - resultadoSwap)} — a empresa "devolveu" o benefício cambial ao banco. Esse é o custo de oportunidade do hedge.`
                  : `O dólar ficou estável. O swap teve impacto cambial neutro. O custo efetivo reflete apenas o diferencial CDI vs cupom cambial.`}
              </div>
            </div>
          </div>

          {/* Payoff Chart */}
          <div style={{ padding: "16px 8px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8, paddingLeft: 12, textTransform: "uppercase", letterSpacing: 1 }}>Diagrama de Payoff do Swap</div>
            <PayoffChart forwardRate={forwardChosen} position={position} notional={result.hedgedNotional} fixingRate={scenario.fixingRate} xLabel={xLabel} overrideFixingPnL={resultadoSwap} />
          </div>
        </>
      ) : (
        /* ──── DEFAULT: NDF, Futuros, Swap CDI×Pré ──── */
        <>
          <div style={{ padding: "20px 24px", borderRadius: 12, background: bgColor, border: `1px solid ${color}30` }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Resultado do {instrument || "Derivativo"}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace" }}>{result.ndfPnL > 0 ? "+" : ""}{fmt(result.ndfPnL)}</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8, lineHeight: 1.7 }}>
              Você {posLabel} a <strong style={{ color: COLORS.accent }}>{fmtRate(forwardChosen)}</strong>.
              {isSwapCDI ? " CDI médio: " : isFut ? " Liquidação: " : " Fixing: "}<strong style={{ color }}>{fmtRate(scenario.fixingRate)}</strong>.
              {isSwapCDI ? <><br />Resultado líquido do swap: <strong style={{ color }}>{result.ndfPnL > 0 ? "+" : ""}{fmt(result.ndfPnL)}</strong></> : isFut ? <><br />Ajustes diários acumulados: <strong style={{ color }}>{result.ndfPnL > 0 ? "+" : ""}{fmt(result.ndfPnL)}</strong></> : <><br />Taxa efetiva: <strong style={{ color: COLORS.text }}>{fmtRate(result.effectiveRate)}</strong></>}
            </div>
          </div>
          <div style={{ padding: "16px 8px", borderRadius: 12, background: COLORS.cardHover, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8, paddingLeft: 12, textTransform: "uppercase", letterSpacing: 1 }}>Diagrama de Payoff</div>
            <PayoffChart forwardRate={forwardChosen} position={position} notional={result.hedgedNotional} fixingRate={scenario.fixingRate} xLabel={xLabel} />
          </div>
          <div style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 13, color: COLORS.accent, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Por que este resultado?</div>
            <p style={{ color: COLORS.text, fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              {position === "sell_usd" ? (
                <>Ao {isSwapCDI ? "receber taxa fixa" : isDI ? "vender taxa" : isFut ? "vender o futuro" : "vender a termo"} a {fmtRate(forwardChosen)}, você travou posição que lucra {isSwapCDI ? "quando o CDI fica abaixo da taxa fixa" : isDI ? "na queda da taxa" : "na queda do preço"}.{result.ndfPnL > 0 ? ` ${isSwapCDI ? `O CDI médio (${fmtRate(scenario.fixingRate)}) ficou abaixo da taxa fixa` : `A taxa de liquidação (${fmtRate(scenario.fixingRate)}) ficou abaixo da entrada`} — resultado positivo.` : result.ndfPnL < 0 ? ` ${isSwapCDI ? `O CDI médio (${fmtRate(scenario.fixingRate)}) ficou acima da taxa fixa` : `A taxa de liquidação (${fmtRate(scenario.fixingRate)}) ficou acima da entrada`} — resultado negativo.` : " Resultado neutro."}</>
              ) : (
                <>Ao {isSwapCDI ? "pagar taxa fixa" : isDI ? "comprar taxa" : isFut ? "comprar o futuro" : "comprar a termo"} a {fmtRate(forwardChosen)}, você travou posição que lucra {isSwapCDI ? "quando o CDI fica acima da taxa fixa" : isDI ? "na alta da taxa" : "na alta do preço"}.{result.ndfPnL > 0 ? ` ${isSwapCDI ? `O CDI médio (${fmtRate(scenario.fixingRate)}) ficou acima da taxa fixa` : `A taxa de liquidação (${fmtRate(scenario.fixingRate)}) ficou acima da entrada`} — resultado positivo.` : result.ndfPnL < 0 ? ` ${isSwapCDI ? `O CDI médio (${fmtRate(scenario.fixingRate)}) ficou abaixo da taxa fixa` : `A taxa de liquidação (${fmtRate(scenario.fixingRate)}) ficou abaixo da entrada`} — resultado negativo.` : " Resultado neutro."}</>
              )}
            </p>
          </div>
          <div style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.goldDim, border: `1px solid ${COLORS.gold}30` }}>
            <div style={{ fontSize: 13, color: COLORS.gold, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>E se você tivesse escolhido diferente?</div>
            <p style={{ color: COLORS.text, fontSize: 14, margin: 0, lineHeight: 1.7 }}>
              Se tivesse <strong>{altLabel}</strong> ao invés de {posLabel}, resultado seria{" "}
              <strong style={{ color: altPnL > 0 ? COLORS.green : COLORS.red }}>{altPnL > 0 ? "+" : ""}{fmt(altPnL)}</strong>.{" "}
              {altPnL > result.ndfPnL ? "Teria sido melhor financeiramente — mas a posição correta depende da exposição, não do resultado ex-post." : "Sua escolha foi a mais adequada para o contexto."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APP PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */

export default function DerivativosLab() {
  const [screen, setScreen] = useState("home");
  const [selectedTheme, setSelectedTheme] = useState("ndf");
  const [currentScenario, setCurrentScenario] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [completedScenarios, setCompletedScenarios] = useState([]);
  const [fadeIn, setFadeIn] = useState(true);

  const triggerFade = (fn) => { setFadeIn(false); setTimeout(() => { fn(); setFadeIn(true); }, 250); };

  const startScenario = (sc) => { triggerFade(() => { setCurrentScenario(sc); setStepIndex(0); setAnswers([]); setScore(0); setTotalScore(0); setSelectedResolution(null); setShowResult(false); setScreen("playing"); }); };

  const handleChoice = (choice, step) => {
    // Check if this step was already answered (re-answering after going back)
    const existingIdx = answers.findIndex((a) => a.stepId === step.id);
    let newAnswers;
    if (existingIdx >= 0) {
      // Replace this answer and remove all subsequent answers (they depend on this choice)
      newAnswers = [...answers.slice(0, existingIdx), { stepId: step.id, choiceId: choice.id, correct: choice.correct, score: choice.score }];
    } else {
      newAnswers = [...answers, { stepId: step.id, choiceId: choice.id, correct: choice.correct, score: choice.score }];
    }
    setAnswers(newAnswers);
    // Recalculate score from all answers
    const newScore = newAnswers.reduce((sum, a) => sum + (a.score || 0), 0);
    const newTotal = newAnswers.reduce((sum, a) => {
      const s = currentScenario.steps.find((st) => st.id === a.stepId);
      return sum + (s ? Math.max(...s.choices.map((c) => c.score)) : 0);
    }, 0);
    setScore(newScore);
    setTotalScore(newTotal);
    // Reset resolution if going back changed things
    setSelectedResolution(null);
    setShowResult(false);
    setTimeout(() => { triggerFade(() => { setStepIndex((i) => i + 1); }); }, 100);
  };

  const goBack = () => {
    if (showResult) {
      // From result view, go back to resolution selection
      setSelectedResolution(null);
      setShowResult(false);
      return;
    }
    if (stepIndex > 0) {
      triggerFade(() => { setStepIndex((i) => i - 1); });
    }
  };

  const goToStep = (idx) => {
    // Can only go to steps that have been answered or the current step
    if (idx <= stepIndex) {
      if (showResult) { setSelectedResolution(null); setShowResult(false); }
      triggerFade(() => { setStepIndex(idx); });
    }
  };

  const handleResolution = (res) => { setSelectedResolution(res); setShowResult(true); };
  const finishScenario = () => { setCompletedScenarios((prev) => [...prev, { id: currentScenario.id, score, totalScore }]); triggerFade(() => { setScreen("home"); setCurrentScenario(null); }); };

  const currentStep = currentScenario?.steps[stepIndex] || null;

  // Find if the current step has a previously saved answer (for revisiting)
  const currentStepAnswer = currentStep ? answers.find((a) => a.stepId === currentStep.id) : null;
  const currentStepChoice = currentStepAnswer && currentStep?.type === "choice"
    ? currentStep.choices.find((c) => c.id === currentStepAnswer.choiceId) : null;

  // Find the feedback from the step just before (for the banner above current step)
  const prevStepIndex = stepIndex - 1;
  const prevStep = prevStepIndex >= 0 ? currentScenario?.steps[prevStepIndex] : null;
  const prevAnswer = prevStep ? answers.find((a) => a.stepId === prevStep.id) : null;
  const prevChoice = prevAnswer && prevStep?.type === "choice"
    ? prevStep.choices.find((c) => c.id === prevAnswer.choiceId) : null;

  const strategyAnswer = answers.find((a) => a.choiceId === "sell_usd" || a.choiceId === "buy_usd");
  const position = strategyAnswer?.choiceId || "sell_usd";

  const getForwardRate = () => {
    if (!currentScenario) return 5.28;
    const md = currentScenario.context.marketData;
    const cc = answers.find((a) => ["market_fwd","spot_rate","above_fwd","conservative","moderate","aggressive","full_hedge","partial_hedge","no_hedge","sintetico_completo","apenas_ndf","outro_ndf"].includes(a.choiceId))?.choiceId;
    if (cc === "spot_rate") return md.spotRate;
    if (cc === "above_fwd") return md.forwardRate90d + (md.forwardMercado ? 0 : 0.07);
    if (md.forwardMercado && currentScenario.themeId === "ndf") return md.forwardMercado;
    return md.forwardRate90d;
  };

  const getHedgeRatio = () => {
    const c = answers.find((a) => ["full_hedge","partial_hedge","no_hedge"].includes(a.choiceId))?.choiceId;
    if (c === "partial_hedge") return 0.5;
    if (c === "no_hedge") return 0;
    return 1.0;
  };

  const filteredScenarios = ALL_SCENARIOS.filter((s) => s.themeId === selectedTheme);

  // ──────── HOME ────────
  if (screen === "home") {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", padding: "0 16px", transition: "opacity 0.3s", opacity: fadeIn ? 1 : 0 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", paddingTop: 48 }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 20, background: COLORS.accentDim, color: COLORS.accent, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>COPPEAD / UFRJ — MBA</div>
            <h1 style={{ fontSize: 40, fontWeight: 800, margin: "0 0 8px", background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -1 }}>Derivativos Lab</h1>
            <p style={{ fontSize: 16, color: COLORS.textMuted, margin: 0, lineHeight: 1.6 }}>Tome decisões reais com derivativos. Escolha um tema e navegue pela árvore de decisão.</p>
          </div>

          {/* Theme tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {THEMES.map((t) => {
              const active = selectedTheme === t.id;
              const done = completedScenarios.filter((c) => ALL_SCENARIOS.find((s) => s.id === c.id)?.themeId === t.id).length;
              const total = ALL_SCENARIOS.filter((s) => s.themeId === t.id).length;
              return (
                <button key={t.id} onClick={() => setSelectedTheme(t.id)} style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${active ? COLORS.accent : COLORS.border}`, background: active ? COLORS.accentDim : COLORS.card, color: active ? COLORS.accent : COLORS.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{t.icon}</span> {t.label}
                  {done > 0 && <span style={{ fontSize: 11, color: COLORS.green, fontFamily: "'JetBrains Mono', monospace" }}>{done}/{total}</span>}
                </button>
              );
            })}
          </div>

          {/* Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredScenarios.map((sc) => {
              const completed = completedScenarios.find((c) => c.id === sc.id);
              return (
                <div key={sc.id} onClick={() => startScenario(sc)} style={{ padding: "20px 24px", borderRadius: 14, background: COLORS.card, border: `1px solid ${completed ? COLORS.green + "40" : COLORS.border}`, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.cardHover; e.currentTarget.style.borderColor = COLORS.accent + "60"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.card; e.currentTarget.style.borderColor = completed ? COLORS.green + "40" : COLORS.border; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>{sc.title}</h3>
                      <p style={{ margin: 0, fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5, maxWidth: 500 }}><MarkdownText text={sc.context.narrative.slice(0, 120) + "..."} /></p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: sc.difficulty === "Super Desafio" ? "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.25))" : sc.difficulty === "Avançado" ? COLORS.redDim : COLORS.goldDim,
                        color: sc.difficulty === "Super Desafio" ? "#c084fc" : sc.difficulty === "Avançado" ? COLORS.red : COLORS.gold,
                        border: sc.difficulty === "Super Desafio" ? "1px solid rgba(168,85,247,0.3)" : "none",
                      }}>{sc.difficulty}</span>
                      {completed && <span style={{ fontSize: 12, color: COLORS.green, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>✓ {completed.score}/{completed.totalScore}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {completedScenarios.length > 0 && (
            <div style={{ marginTop: 24, padding: "16px 20px", borderRadius: 12, background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Pontuação Acumulada</div>
              <ScoreBar score={completedScenarios.reduce((a, c) => a + c.score, 0)} maxScore={completedScenarios.reduce((a, c) => a + c.totalScore, 0)} />
            </div>
          )}
          <p style={{ fontSize: 12, color: COLORS.textDim, textAlign: "center", marginTop: 32, paddingBottom: 32 }}>Laboratório de Derivativos — Prof. José Américo</p>
        </div>
      </div>
    );
  }

  // ──────── PLAYING ────────
  const maxPS = currentScenario ? currentScenario.steps.filter((s) => s.type === "choice").reduce((a, s) => a + Math.max(...s.choices.map((c) => c.score)), 0) : 0;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", padding: "0 16px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", paddingTop: 24, paddingBottom: 48, transition: "opacity 0.3s", opacity: fadeIn ? 1 : 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => triggerFade(() => setScreen("home"))} style={{ background: "none", border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>← Início</button>
            {(stepIndex > 0 || showResult) && (
              <button onClick={goBack} style={{ background: "none", border: `1px solid ${COLORS.accent}40`, color: COLORS.accent, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.accentDim; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
                ← Etapa anterior
              </button>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1 }}>Pontuação</div>
            <div style={{ width: 150 }}><ScoreBar score={score} maxScore={maxPS} /></div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{currentScenario.title}</h2>
          <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: COLORS.accentDim, color: COLORS.accent }}>{currentScenario.instrument}</span>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {currentScenario.steps.map((s, i) => {
            const isCompleted = i < stepIndex || answers.find((a) => a.stepId === s.id);
            const isCurrent = i === stepIndex;
            const canClick = i <= stepIndex;
            return (
              <div key={s.id} onClick={() => canClick && goToStep(i)}
                style={{
                  flex: 1, height: canClick ? 6 : 4, borderRadius: 3,
                  background: i < stepIndex ? COLORS.accent : isCurrent ? COLORS.gold : COLORS.border,
                  transition: "all 0.3s",
                  cursor: canClick ? "pointer" : "default",
                  opacity: canClick ? 1 : 0.5,
                }}
                onMouseEnter={(e) => { if (canClick) e.currentTarget.style.opacity = "0.7"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = canClick ? "1" : "0.5"; }}
              />
            );
          })}
        </div>

        <div style={{ padding: "20px 24px", borderRadius: 14, background: COLORS.card, border: `1px solid ${COLORS.border}`, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: COLORS.accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Contexto</div>
          <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}><MarkdownText text={currentScenario.context.narrative} /></p>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
            {(currentScenario.context.displayFields || []).map(([label, val]) => (
              <div key={label} style={{ padding: "8px 12px", borderRadius: 8, background: COLORS.accentDim, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent, fontFamily: "'JetBrains Mono', monospace" }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback from previous step */}
        {prevChoice && (
          <div style={{ padding: "14px 20px", borderRadius: 12, background: prevChoice.correct ? COLORS.greenDim : COLORS.redDim, border: `1px solid ${prevChoice.correct ? COLORS.green : COLORS.red}30`, marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
            <span style={{ fontWeight: 700, color: prevChoice.correct ? COLORS.green : COLORS.red }}>{prevChoice.correct ? "✓ Correto" : "✗ Pode melhorar"} — </span>{prevChoice.feedback}
          </div>
        )}

        {/* If revisiting a step, show which answer was previously selected */}
        {currentStepChoice && (
          <div style={{ padding: "12px 20px", borderRadius: 12, background: COLORS.cardHover, border: `1px dashed ${COLORS.accent}40`, marginBottom: 16, fontSize: 13, lineHeight: 1.6, color: COLORS.textMuted }}>
            Resposta anterior: <strong style={{ color: COLORS.accent }}>{currentStepChoice.label}</strong> — você pode manter ou escolher outra opção.
          </div>
        )}

        {currentStep?.type === "choice" && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{currentStep.prompt}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {currentStep.choices.map((ch) => {
                const wasSelected = currentStepAnswer?.choiceId === ch.id;
                return (
                  <button key={ch.id} onClick={() => handleChoice(ch, currentStep)}
                    style={{
                      padding: "16px 20px", borderRadius: 12,
                      background: wasSelected ? COLORS.accentDim : COLORS.card,
                      border: `1px solid ${wasSelected ? COLORS.accent : COLORS.border}`,
                      color: COLORS.text, fontSize: 15, fontWeight: 500, textAlign: "left",
                      cursor: "pointer", transition: "all 0.2s", lineHeight: 1.5,
                      position: "relative",
                    }}
                    onMouseEnter={(e) => { if (!wasSelected) { e.currentTarget.style.background = COLORS.cardHover; e.currentTarget.style.borderColor = COLORS.accent + "60"; e.currentTarget.style.transform = "translateX(4px)"; }}}
                    onMouseLeave={(e) => { if (!wasSelected) { e.currentTarget.style.background = COLORS.card; e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = "translateX(0)"; }}}>
                    {wasSelected && <span style={{ position: "absolute", top: 8, right: 12, fontSize: 11, color: COLORS.accent, fontWeight: 600 }}>resposta atual</span>}
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {currentStep?.type === "resolution" && !showResult && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{currentStep.prompt}</h3>
            <p style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 16 }}>Selecione um cenário de mercado:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {currentStep.scenarios.map((sc) => (
                <button key={sc.id} onClick={() => handleResolution(sc)}
                  style={{ padding: "16px 20px", borderRadius: 12, background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 15, fontWeight: 500, textAlign: "left", cursor: "pointer", transition: "all 0.2s", lineHeight: 1.5 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.cardHover; e.currentTarget.style.borderColor = COLORS.gold + "60"; e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.card; e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = "translateX(0)"; }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{sc.label}</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted }}>{sc.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {showResult && selectedResolution && (
          <div>
            <ResultPanel result={calculateResult(currentScenario.context.marketData, getForwardRate(), selectedResolution.fixingRate, position, getHedgeRatio())} scenario={selectedResolution} position={position} forwardChosen={getForwardRate()} instrument={currentScenario.instrument} scenarioData={currentScenario} />
            <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
              <button onClick={() => { setSelectedResolution(null); setShowResult(false); }} style={{ padding: "12px 24px", borderRadius: 10, background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.text, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Testar outro cenário</button>
              <button onClick={finishScenario} style={{ padding: "12px 24px", borderRadius: 10, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`, border: "none", color: COLORS.bg, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Finalizar e voltar →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

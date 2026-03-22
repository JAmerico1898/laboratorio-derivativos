import type { Scenario } from "../../types/scenario";

export const FUTUROS_SCENARIOS: Scenario[] = [
  {
    id: "fut_hedge_di",
    title: "Hedge de Taxa de Juros — Fundo de Renda Fixa",
    theme: "Futuros", themeId: "futuros", instrument: "Futuro de DI",
    difficulty: "Intermediário",
    context: {
      narrative: "Você é gestor(a) de um fundo de renda fixa com **R$ 500 milhões** em títulos prefixados (NTN-F e LTN) com duration média de **3 anos**. O CDI está em **11,75% a.a.** e o DI futuro de Jan/28 está em **12,50% a.a.**. O Copom se reúne em 2 semanas e o mercado está dividido entre manutenção e alta de 50bps. Se os juros subirem, seus títulos perdem valor.",
      marketData: { spotRate: 11.75, forwardRate90d: 12.50, cdiRate: 0.1175, notional_usd: 5000, tenor: 252 },
      displayFields: [["CDI atual", "11,75% a.a."], ["DI Jan/28", "12,50% a.a."], ["PL Fundo", "R$ 500M"], ["Duration", "3 anos"], ["DU até Jan/28", "630 d.u."]],
      question: "Seus títulos prefixados perdem valor quando os juros sobem. Como proteger a carteira?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é sua motivação ao operar DI futuro?", choices: [
        { id: "hedge", label: "Hedge — proteger a carteira prefixada contra alta de juros", correct: true, score: 20, feedback: "Correto! A carteira é prefixada e perde valor quando os juros sobem. O DI futuro permite neutralizar esse risco.", next: "strategy_di" },
        { id: "speculation", label: "Especulação — apostar na direção dos juros", correct: false, score: 5, feedback: "Há uma exposição real a proteger. A diretoria espera proteção, não especulação.", next: "strategy_di" },
        { id: "arbitrage", label: "Arbitragem — explorar diferenças entre DI e CDI", correct: false, score: 0, feedback: "Não há distorção de preço evidente. O cenário é de risco de mercado sobre uma carteira existente.", next: "strategy_di" },
      ]},
      { id: "strategy_di", type: "choice", prompt: "Para proteger contra a ALTA de juros, qual posição no DI futuro? Convenção: 'comprar taxa' = ganhar com a alta dos juros; 'vender taxa' = ganhar com a queda dos juros.", choices: [
        { id: "buy_usd", label: "Comprar taxa de juros no DI futuro — lucra se juros subirem", correct: true, score: 25, feedback: "Perfeito! Comprar taxa no DI futuro significa ganhar com a alta dos juros. Se os juros subirem, você ganha no futuro e compensa a perda dos seus prefixados. Nota técnica: na B3, comprar taxa equivale a vender PU, pois taxa e PU se movem em direções opostas.", next: "pu_calc" },
        { id: "sell_usd", label: "Vender taxa de juros no DI futuro — lucra se juros caírem", correct: false, score: 0, feedback: "Cuidado! Vender taxa significa ganhar com a queda dos juros. Sua carteira de prefixados já lucra quando juros caem — vender taxa no DI dobraria essa exposição ao invés de proteger! Nota técnica: vender taxa equivale a comprar PU na B3.", next: "pu_calc" },
      ]},
      { id: "pu_calc", type: "choice", prompt: "Antes de calcular o número de contratos, você precisa determinar o PU (Preço Unitário) do DI Jan/28. A taxa é 12,50% a.a. e faltam 630 dias úteis até o vencimento. Recorde: PU = 100.000 ÷ (1 + taxa)^(DU/252). Qual é o PU?", choices: [
        { id: "pu_correct", label: "PU ≈ 73.785 — calculado como 100.000 ÷ (1,1250)^(630/252)", correct: true, score: 20, feedback: "Excelente! PU = 100.000 ÷ (1,125)^(2,5) = 100.000 ÷ 1,3554 ≈ 73.785. Esse é o valor presente de R$ 100.000 descontado pela taxa do DI a 630 dias úteis. O nocional real de cada contrato hoje é R$ 73.785 — não R$ 100.000! O valor de face (R$ 100k) só é atingido no vencimento.", next: "contract_di" },
        { id: "pu_face", label: "PU = 100.000 — o nocional do contrato", correct: false, score: 0, feedback: "R$ 100.000 é o valor de face no vencimento, não o PU de hoje. O PU é o valor presente, obtido descontando R$ 100.000 pela taxa de juros e prazo: PU = 100.000 ÷ (1,125)^(630/252) = 100.000 ÷ 1,3554 ≈ 73.785. Essa distinção é fundamental — o nocional real de cada contrato hoje é R$ 73.785.", next: "contract_di" },
        { id: "pu_wrong_formula", label: "PU ≈ 87.500 — calculado como 100.000 × (1 − 0,125)", correct: false, score: 5, feedback: "Cuidado! O desconto no DI futuro é composto, não simples. A fórmula correta é PU = 100.000 ÷ (1 + taxa)^(DU/252), usando capitalização composta com base em 252 dias úteis. Com taxa de 12,50% e 630 DU: PU = 100.000 ÷ (1,125)^(2,5) ≈ 73.785. Desconto linear geraria um valor incorreto.", next: "contract_di" },
      ]},
      { id: "contract_di", type: "choice", prompt: "Agora calcule o número de contratos. O PU é ~73.785 (nocional real por contrato). A carteira tem R$ 500M e duration de 3 anos. O DI Jan/28 tem duration de ~2,5 anos. Quantos contratos comprar de taxa?", choices: [
        { id: "market_fwd", label: "6.777 contratos — matching nocional pelo PU (R$ 500M ÷ R$ 73.785)", correct: false, score: 10, feedback: "Você acertou em usar o PU real ao invés do valor de face — isso é importante! Porém, matching nocional ignora a diferença de duration. Com duration da carteira (3a) > duration do futuro (2,5a), é preciso ajustar por esse fator.", next: "resolution_di" },
        { id: "above_fwd", label: "8.133 contratos — nocional pelo PU ajustado por duration: (500M ÷ 73.785) × (3,0 ÷ 2,5)", correct: true, score: 20, feedback: "Excelente! O cálculo correto em dois passos: (1) Contratos base = R$ 500M ÷ PU 73.785 ≈ 6.777 contratos. (2) Ajuste por duration = 6.777 × (3,0 / 2,5) = 6.777 × 1,2 ≈ 8.133 contratos. Usar o PU real (não o valor de face) e ajustar por duration garante que a sensibilidade do hedge case com a da carteira.", next: "resolution_di" },
        { id: "spot_rate", label: "6.000 contratos — usando valor de face (500M ÷ 100k) × (3,0 ÷ 2,5)", correct: false, score: 5, feedback: "Você acertou no ajuste por duration (× 1,2), mas usou o valor de face (R$ 100k) ao invés do PU real (R$ 73.785). O nocional efetivo de cada contrato hoje é o PU, não o valor de face. Usando o PU: 500M ÷ 73.785 × 1,2 ≈ 8.133 contratos. A diferença é significativa — 6.000 vs 8.133 — e resulta em sub-hedge.", next: "resolution_di" },
      ]},
      { id: "resolution_di", type: "resolution", prompt: "O Copom decidiu e o mercado reagiu.", scenarios: [
        { id: "juros_subiram", label: "Cenário A: DI Jan/28 subiu para 13,50%", fixingRate: 13.50, description: "Copom surpreendeu com alta de 75bps na Selic. DI futuro disparou. Títulos prefixados sofreram marcação a mercado negativa." },
        { id: "juros_cairam", label: "Cenário B: DI Jan/28 caiu para 11,50%", fixingRate: 11.50, description: "Surpresa dovish: Copom cortou a Selic e indicou ciclo de queda. Prefixados valorizaram forte." },
        { id: "juros_estaveis", label: "Cenário C: DI Jan/28 estável em 12,60%", fixingRate: 12.60, description: "Copom manteve a taxa como esperado. Reação marginal do mercado." },
      ]},
    ],
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
      question: "O pagamento do cupom em USD está chegando. Como proteger o custo em reais?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é sua motivação ao operar dólar futuro?", choices: [
        { id: "hedge", label: "Hedge — travar o custo em reais do cupom a pagar", correct: true, score: 20, feedback: "Correto! Você tem um passivo de USD 2 milhões a pagar em 6 meses. Se o dólar subir, o custo em reais aumenta. Hedge via dólar futuro trava esse custo.", next: "strategy_dol" },
        { id: "speculation", label: "Especulação — apostar na queda do dólar", correct: false, score: 5, feedback: "Não fazer hedge é uma aposta implícita na queda do dólar. Se ele subir, o custo do cupom em reais explode. A diretoria espera proteção, não aposta.", next: "strategy_dol" },
        { id: "arbitrage", label: "Arbitragem entre DOL e dólar spot", correct: false, score: 0, feedback: "O spread entre o futuro (R$ 5,30) e o spot (R$ 5,22) = R$ 0,08, que reflete o custo de carregamento (diferencial CDI vs cupom cambial). Não é distorção — é preço justo.", next: "strategy_dol" },
      ]},
      { id: "strategy_dol", type: "choice", prompt: "Para proteger contra a alta do dólar, qual posição no dólar futuro?", choices: [
        { id: "buy_usd", label: "Comprar dólar futuro — lucra se dólar subir, compensando o custo maior", correct: true, score: 25, feedback: "Perfeito! Você tem passivo em USD (precisa comprar dólares no futuro). Comprando DOL, se o dólar subir, o ajuste diário positivo compensa o custo maior do cupom. Diferente do NDF (liquidação única no vencimento), o DOL tem ajuste diário — o P&L é creditado ou debitado na sua conta de margem todos os dias.", next: "contract_dol" },
        { id: "sell_usd", label: "Vender dólar futuro — lucra se dólar cair", correct: false, score: 0, feedback: "Vender DOL lucra quando o dólar cai. Mas seu risco é justamente a alta do dólar (passivo em USD). Vender dobraria sua exposição: se o dólar subir, você paga mais caro o cupom E perde no futuro.", next: "contract_dol" },
      ]},
      { id: "contract_dol", type: "choice", prompt: "Quantos contratos DOL comprar? Cada contrato tem nocional de USD 50.000 e o cupom a pagar é de USD 2.000.000.", choices: [
        { id: "above_fwd", label: "40 contratos", correct: true, score: 20, feedback: "Exato! Memória de cálculo: (1) Nocional a proteger = USD 2.000.000. (2) Nocional por contrato = USD 50.000. (3) Número de contratos = 2.000.000 ÷ 50.000 = 40 contratos. Sensibilidade: cada variação de R$ 0,01 no dólar gera ajuste de USD 50.000 × R$ 0,01 = R$ 500 por contrato. Para 40 contratos: R$ 500 × 40 = R$ 20.000 por centavo de variação.", next: "resolution_dol" },
        { id: "market_fwd", label: "20 contratos", correct: false, score: 10, feedback: "Memória de cálculo: 20 contratos × USD 50.000 = USD 1.000.000. Isso cobre apenas 50% do cupom de USD 2M. A outra metade (USD 1M) ficaria sem proteção. Se o dólar subir R$ 0,30, a perda na parcela descoberta seria: USD 1M × R$ 0,30 = R$ 300.000. O correto seria 2.000.000 ÷ 50.000 = 40 contratos.", next: "resolution_dol" },
        { id: "spot_rate", label: "100 contratos", correct: false, score: 0, feedback: "Memória de cálculo: 100 contratos × USD 50.000 = USD 5.000.000 — 2,5 vezes o cupom de USD 2M. O excedente de USD 3M é posição especulativa pura. Além do risco, over-hedge pode desqualificar a operação como hedge contábil (IFRS 9 / CPC 48). O correto: 2.000.000 ÷ 50.000 = 40 contratos.", next: "resolution_dol" },
      ]},
      { id: "resolution_dol", type: "resolution", prompt: "6 meses se passaram. Vencimento do DOL e pagamento do cupom.", scenarios: [
        { id: "dolar_subiu_forte", label: "Cenário A: Dólar subiu para R$ 5,65", fixingRate: 5.65, description: "Alta de juros nos EUA e crise fiscal elevaram o dólar. Custo do cupom subiu, mas ajustes diários compensaram." },
        { id: "dolar_caiu", label: "Cenário B: Dólar caiu para R$ 4,95", fixingRate: 4.95, description: "Fluxo estrangeiro derrubou o câmbio. Cupom ficou mais barato, mas ajustes diários geraram débito acumulado." },
        { id: "dolar_estavel", label: "Cenário C: Dólar ficou em R$ 5,28", fixingRate: 5.28, description: "Dólar terminou próximo do nível do futuro contratado. Ajustes acumulados marginais." },
      ]},
    ],
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
      question: "Você quer lucrar com a queda dos juros. Como posicionar dentro do limite de risco?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta operação?", choices: [
        { id: "speculation", label: "Especulação — aposta direcional em queda dos juros", correct: true, score: 20, feedback: "Correto! Mesa proprietária, sem carteira a proteger. Posição baseada em convicção macro. O dimensionamento deve respeitar o limite de perda (stop loss) de R$ 5 milhões da mesa.", next: "strategy_spec_di" },
        { id: "hedge", label: "Hedge — proteger alguma exposição", correct: false, score: 5, feedback: "Mesa proprietária não tem exposição pré-existente. É puramente especulativa.", next: "strategy_spec_di" },
        { id: "arbitrage", label: "Arbitragem entre vértices da curva", correct: false, score: 10, feedback: "Arbitragem entre vértices seria um spread/butterfly. Sua tese é sobre o nível absoluto — é especulação direcional.", next: "strategy_spec_di" },
      ]},
      { id: "strategy_spec_di", type: "choice", prompt: "Para lucrar com a QUEDA dos juros, qual posição no DI futuro? ('comprar taxa' = ganhar com alta; 'vender taxa' = ganhar com queda)", choices: [
        { id: "sell_usd", label: "Vender taxa de juros no DI futuro — lucra se juros caírem", correct: true, score: 25, feedback: "Perfeito! Vender taxa no DI futuro significa ganhar com a queda dos juros. Se o Copom cortar a Selic como você projeta, a taxa cai e você lucra. Nota técnica: na B3, vender taxa equivale a comprar PU — quando a taxa cai, o PU sobe e o ajuste diário é positivo.", next: "contract_spec_di" },
        { id: "buy_usd", label: "Comprar taxa de juros no DI futuro — lucra se juros subirem", correct: false, score: 0, feedback: "Comprar taxa lucra na ALTA de juros — é exatamente o oposto da sua convicção de queda! Nota técnica: comprar taxa = vender PU na B3.", next: "contract_spec_di" },
      ]},
      { id: "contract_spec_di", type: "choice", prompt: "O stop loss da mesa é R$ 5 milhões. O DV01 por contrato é R$ 180 (perda por contrato para cada 1bp de alta na taxa). Considerando um cenário de stress de +150bps de alta (o oposto da sua tese), quantos contratos vender de taxa?", choices: [
        { id: "conservative", label: "1.000 contratos", correct: false, score: 10, feedback: "Memória de cálculo: (1) Perda por contrato no stress de +150bps = R$ 180 × 150 = R$ 27.000. (2) Perda total = R$ 27.000 × 1.000 = R$ 27.000.000. Essa posição estouraria o stop loss de R$ 5M em mais de 5 vezes! A conta mostra que até 1.000 contratos já é demais para esse limite. Deve-se partir do limite para chegar ao número de contratos.", next: "resolution_spec_di" },
        { id: "moderate", label: "185 contratos", correct: true, score: 20, feedback: "Memória de cálculo: (1) Stop loss = R$ 5.000.000. (2) Perda por contrato no stress de +150bps = R$ 180 × 150 = R$ 27.000. (3) Contratos máximos = R$ 5.000.000 ÷ R$ 27.000 ≈ 185 contratos. (4) Ganho potencial se tese acertar (taxa cai 250bps para 9,50%): R$ 180 × 250 × 185 = R$ 8.325.000. (5) Relação risco/retorno: ganho potencial de R$ 8,3M vs perda máxima de R$ 5M — assimetria favorável de 1,7:1.", next: "resolution_spec_di" },
        { id: "aggressive", label: "500 contratos", correct: false, score: 5, feedback: "Memória de cálculo: (1) Perda por contrato no stress de +150bps = R$ 180 × 150 = R$ 27.000. (2) Perda total = R$ 27.000 × 500 = R$ 13.500.000. (3) Isso excede o stop loss de R$ 5M em 2,7 vezes. O correto: partir do limite → R$ 5.000.000 ÷ R$ 27.000 ≈ 185 contratos.", next: "resolution_spec_di" },
      ]},
      { id: "resolution_spec_di", type: "resolution", prompt: "O Copom conduziu o ciclo monetário. Onde chegou o DI Jan/27?", scenarios: [
        { id: "juros_cairam_forte", label: "Cenário A: DI Jan/27 caiu para 9,80% (quase acertou!)", fixingRate: 9.80, description: "Ciclo agressivo de corte. PU subiu de 78.925 para ~82.300. Posição altamente lucrativa." },
        { id: "juros_subiram", label: "Cenário B: DI Jan/27 subiu para 13,50% (tese furou)", fixingRate: 13.50, description: "Choque inflacionário forçou o Copom a subir juros. PU caiu para ~75.900. Prejuízo relevante." },
        { id: "juros_estaveis", label: "Cenário C: DI Jan/27 estável em 11,80%", fixingRate: 11.80, description: "Ciclo tímido de corte. PU subiu marginalmente para ~79.300. Ganho modesto." },
      ]},
    ],
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
      question: "O spread entre vértices está anormalmente largo. Como capturar a compressão?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta operação?", choices: [
        { id: "arbitrage", label: "Arbitragem relativa — spread entre vértices fora do padrão histórico", correct: true, score: 25, feedback: "Exato! Valor relativo: você não aposta se juros vão subir ou cair, mas que o diferencial vai convergir. Arbitragem estatística na curva.", next: "strategy_spread" },
        { id: "speculation", label: "Especulação direcional em queda de juros", correct: false, score: 5, feedback: "Se fosse direcional, bastaria comprar DI. O calendar spread busca lucrar com a MUDANÇA DO FORMATO da curva.", next: "strategy_spread" },
        { id: "hedge", label: "Hedge de uma carteira existente", correct: false, score: 0, feedback: "Não há carteira a proteger. Operação de valor relativo.", next: "strategy_spread" },
      ]},
      { id: "strategy_spread", type: "choice", prompt: "Para lucrar com a COMPRESSÃO do spread (80bps → ~35bps), qual combinação? ('comprar taxa' = ganhar com alta; 'vender taxa' = ganhar com queda)", choices: [
        { id: "sell_usd", label: "Vender taxa no Jan/27 (ganhar com queda do curto) + Comprar taxa no Jan/28 (ganhar com alta do longo) — flattener", correct: true, score: 30, feedback: "Perfeito! O flattener aposta que o spread (Jan/28 − Jan/27) vai comprimir. Você vende taxa no curto (ganha se cair) e compra taxa no longo (ganha se subir, ou perder menos). Se o spread fechar de 80 para 35bps — por exemplo, porque o vértice longo caiu mais em magnitude — você lucra a diferença de 45bps. Se ambos se moverem na mesma magnitude, as pernas se compensam e o risco direcional é neutro. Nota técnica: vender taxa = comprar PU no curto; comprar taxa = vender PU no longo.", next: "contract_spread" },
        { id: "buy_usd", label: "Comprar taxa no Jan/27 + Vender taxa no Jan/28 — steepener", correct: false, score: 0, feedback: "Isso é o steepener — aposta que o spread vai ABRIR mais. Sua tese é de compressão (80bps → 35bps). Essa posição perderia.", next: "contract_spread" },
        { id: "sell_usd_teorico", label: "Apenas vender taxa no Jan/27 (posição direcional)", correct: false, score: 5, feedback: "Posição direcional pura — lucra se juros caírem mas perde se subirem. O calendar spread neutraliza o risco direcional ao combinar as duas pernas, isolando apenas o efeito do formato da curva.", next: "contract_spread" },
      ]},
      { id: "contract_spread", type: "choice", prompt: "Para que o spread seja neutro em risco direcional, como calibrar o número de contratos? Dados: DV01 do Jan/27 = R$ 180 por contrato por 1bp. DV01 do Jan/28 = R$ 240 por contrato por 1bp. Você vai vender taxa em 5.000 contratos no Jan/27.", choices: [
        { id: "sintetico_completo", label: "5.000 no Jan/27 + 3.750 no Jan/28", correct: true, score: 30, feedback: "Excelente! Memória de cálculo: (1) DV01 total da perna curta = 5.000 × R$ 180 = R$ 900.000 por 1bp. (2) Contratos na perna longa para igualar = R$ 900.000 ÷ R$ 240 = 3.750 contratos. (3) Verificação: DV01 longo = 3.750 × R$ 240 = R$ 900.000 por 1bp ✓. As pernas têm mesma sensibilidade: um choque paralelo de +1bp gera +R$ 900k numa perna e −R$ 900k na outra, cancelando o risco direcional.", next: "resolution_spread" },
        { id: "apenas_ndf", label: "5.000 contratos em cada perna", correct: false, score: 10, feedback: "Memória de cálculo: (1) DV01 curto = 5.000 × R$ 180 = R$ 900.000/bp. (2) DV01 longo = 5.000 × R$ 240 = R$ 1.200.000/bp. (3) Diferença = R$ 300.000/bp — isso NÃO é neutro! A perna longa tem exposição R$ 300k/bp maior, criando viés comprador de taxa (aposta líquida na alta de juros). O correto: ajustar pela razão de DV01 = 5.000 × (180 ÷ 240) = 3.750 contratos no longo.", next: "resolution_spread" },
        { id: "outro_ndf", label: "3.000 no Jan/27 + 5.000 no Jan/28", correct: false, score: 0, feedback: "Memória de cálculo: (1) DV01 curto = 3.000 × R$ 180 = R$ 540.000/bp. (2) DV01 longo = 5.000 × R$ 240 = R$ 1.200.000/bp. (3) Diferença = R$ 660.000/bp a favor da perna longa — é uma posição fortemente tomada em taxa, não um spread neutro. Inverte completamente a proporção correta.", next: "resolution_spread" },
      ]},
      { id: "resolution_spread", type: "resolution", prompt: "Meses passaram. O Copom iniciou o ciclo de corte. Como ficou a curva?", scenarios: [
        { id: "spread_comprimiu", label: "Cenário A: Spread comprimiu para 30bps (Jan/27=10,00%, Jan/28=10,30%)", fixingRate: 10.00, description: "Ciclo de corte achatou a curva como esperado. Jan/27 caiu 200bps, Jan/28 caiu 250bps. Spread: 80 → 30bps. Tese acertou." },
        { id: "spread_abriu", label: "Cenário B: Spread ABRIU para 150bps (Jan/27=13,00%, Jan/28=14,50%)", fixingRate: 13.00, description: "Choque inflacionário levou o Copom a subir juros agressivamente. Mercado precificou mais aperto futuro." },
        { id: "spread_estavel", label: "Cenário C: Spread estável em 75bps (Jan/27=11,25%, Jan/28=12,00%)", fixingRate: 11.25, description: "Ciclo gradual e paralelo. Curva desceu uniformemente, spread praticamente inalterado." },
      ]},
    ],
  },
];

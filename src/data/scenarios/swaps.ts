import type { Scenario } from "../../types/scenario";

export const SWAPS_SCENARIOS: Scenario[] = [
  {
    id: "swap_cdi_pre",
    title: "Swap CDI × Pré — Empresa com Dívida Flutuante",
    theme: "Swaps", themeId: "swaps", instrument: "Swap CDI × Pré",
    difficulty: "Intermediário",
    context: {
      narrative: "Você é CFO da **Infralog S.A.**, uma empresa de logística que captou um empréstimo de **R$ 200 milhões** a **CDI + 2,00% a.a.** com vencimento em **2 anos**. O CDI atual é **11,75% a.a.**, então o custo total hoje é 13,75% a.a. A empresa tem receitas previsíveis (contratos longos de frete) e a diretoria quer transformar a dívida flutuante em custo fixo para facilitar o planejamento financeiro. Um banco oferece um swap CDI × Pré a **12,50% a.a.** (taxa fixa) para 2 anos.",
      marketData: { spotRate: 11.75, forwardRate90d: 12.50, cdiRate: 0.1175, notional_usd: 200000000, tenor: 504 },
      displayFields: [["CDI atual", "11,75% a.a."], ["Spread", "+ 2,00% a.a."], ["Custo atual", "13,75% a.a."], ["Taxa swap", "12,50% a.a."], ["Nocional", "R$ 200M"], ["Prazo", "2 anos"]],
      question: "A dívida é flutuante e a empresa quer custo fixo. Como usar o swap?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a motivação da Infralog ao contratar um swap?", choices: [
        { id: "hedge", label: "Hedge — transformar o custo flutuante (CDI) em custo fixo (prefixado)", correct: true, score: 20, feedback: "Correto! A empresa tem dívida atrelada ao CDI. Se a Selic subir, o custo financeiro sobe junto. O swap permite trocar o indexador flutuante por uma taxa fixa, eliminando a incerteza.", next: "strategy_swap" },
        { id: "speculation", label: "Especulação — apostar que o CDI vai cair", correct: false, score: 5, feedback: "Se a empresa simplesmente espera que o CDI caia, ela está especulando com o custo da dívida. A diretoria quer previsibilidade, não aposta.", next: "strategy_swap" },
        { id: "arbitrage", label: "Arbitragem entre mercados", correct: false, score: 0, feedback: "A motivação não é explorar distorção de preço, mas sim converter um fluxo flutuante em fixo.", next: "strategy_swap" },
      ]},
      { id: "strategy_swap", type: "choice", prompt: "No swap CDI × Pré, a empresa precisa escolher: em qual perna ela fica? Lembre-se: a empresa já PAGA CDI no empréstimo.", choices: [
        { id: "buy_usd", label: "Pagar taxa fixa (12,50%) e receber CDI no swap", correct: true, score: 25, feedback: "Perfeito! Memória de cálculo: (1) A empresa paga CDI + 2% no empréstimo. (2) No swap, ela recebe CDI e paga 12,50% fixo. (3) O CDI recebido no swap cancela o CDI pago no empréstimo. (4) Custo líquido = 12,50% (fixo do swap) + 2,00% (spread do empréstimo) = 14,50% a.a. fixo. A empresa trocou incerteza por previsibilidade.", next: "contract_swap" },
        { id: "sell_usd", label: "Receber taxa fixa (12,50%) e pagar CDI no swap", correct: false, score: 0, feedback: "Cuidado! Se a empresa paga CDI no swap, ela ficaria pagando CDI duas vezes: uma no empréstimo e outra no swap. Isso DOBRA a exposição ao invés de eliminar. O correto é receber CDI no swap para cancelar o CDI do empréstimo.", next: "contract_swap" },
      ]},
      { id: "contract_swap", type: "choice", prompt: "A empresa fechou o swap: paga 12,50% fixo e recebe CDI, nocional de R$ 200M por 2 anos. Qual é o custo final fixo da dívida?", choices: [
        { id: "swap_custo_total", label: "14,50% a.a. — soma da taxa fixa do swap (12,50%) + spread do empréstimo (2,00%)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Custo do empréstimo = CDI + 2,00%. (2) Swap: paga 12,50% fixo, recebe CDI. (3) Custo líquido = (CDI + 2,00%) − CDI + 12,50% = 12,50% + 2,00% = 14,50% a.a. fixo. O CDI se cancela e sobra a taxa fixa mais o spread. A empresa agora sabe exatamente quanto vai pagar, independentemente do que acontecer com a Selic.", next: "resolution_swap" },
        { id: "swap_taxa_fixa", label: "12,50% a.a. — apenas a taxa fixa do swap", correct: false, score: 5, feedback: "O swap não elimina o spread de crédito! Memória de cálculo: (1) A empresa continua pagando CDI + 2,00% no empréstimo. (2) O swap cancela apenas o CDI, não o spread. (3) Custo líquido = 12,50% (fixo) + 2,00% (spread) = 14,50% a.a. Esquecer o spread subestima o custo real.", next: "resolution_swap" },
        { id: "swap_custo_atual", label: "13,75% a.a. — o custo atual (CDI 11,75% + 2,00%)", correct: false, score: 0, feedback: "13,75% é o custo de hoje com CDI a 11,75%, mas esse custo muda se o CDI mudar — é exatamente o risco que a empresa quer eliminar. Após o swap, o custo fixo é: 12,50% + 2,00% = 14,50% a.a., independentemente do CDI futuro.", next: "resolution_swap" },
      ]},
      { id: "resolution_swap", type: "resolution", prompt: "2 anos se passaram. Como evoluiu o CDI e qual foi o resultado do swap?", scenarios: [
        { id: "cdi_subiu", label: "Cenário A: CDI subiu para 14,25% a.a.", fixingRate: 14.25, description: "A Selic subiu com pressão inflacionária. Sem o swap, o custo da dívida teria ido a 16,25% (CDI 14,25% + 2%). Com o swap, a empresa travou em 14,50% — economizou 1,75% a.a. sobre R$ 200M." },
        { id: "cdi_caiu", label: "Cenário B: CDI caiu para 8,50% a.a.", fixingRate: 8.50, description: "Ciclo de corte agressivo levou a Selic a mínimas. Sem o swap, o custo teria caído para 10,50% (CDI 8,50% + 2%). Com o swap travado em 14,50%, a empresa paga 4,00% a.a. a mais do que pagaria sem hedge." },
        { id: "cdi_estavel", label: "Cenário C: CDI estável em 11,50% a.a.", fixingRate: 11.50, description: "O CDI praticamente não se moveu. O custo sem swap (13,50%) ficou próximo do custo com swap (14,50%). O swap custou ~1,00% a.a. a mais — o 'preço do seguro'." },
      ]},
    ],
  },
  {
    id: "swap_cambial",
    title: "Swap Cambial — Dívida em Dólar",
    theme: "Swaps", themeId: "swaps", instrument: "Swap Cambial (USD × CDI)",
    difficulty: "Intermediário",
    context: {
      narrative: "Você é tesoureiro(a) da **Siderúrgica Nacional S.A.**, que tem dívida de **USD 100 milhões** com vencimento em **3 anos**. A receita da empresa é 100% em reais. A Diretoria deseja contratar um **swap cambial** para gerenciar a exposição cambial passiva que a dívida representa. O dólar spot está em **R$ 5,20**, o cupom cambial é **4,50% a.a.** (juros simples) e o CDI é **11,75% a.a.**.",
      marketData: { spotRate: 5.20, forwardRate90d: 5.20, cdiRate: 0.1175, notional_usd: 100000000, tenor: 756 },
      displayFields: [["Dívida", "USD 100M"], ["Spot", "R$ 5,20"], ["CDI", "11,75% a.a."], ["Cupom cambial", "4,50% a.a."], ["Prazo", "3 anos"]],
      question: "A receita é em reais mas a dívida é em dólar. Como eliminar o descasamento cambial?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a motivação ao contratar um swap cambial?", choices: [
        { id: "hedge", label: "Hedge — transformar a dívida em dólar em dívida em reais", correct: true, score: 20, feedback: "Correto! A empresa tem receita em BRL e dívida em USD. Se o dólar subir, a dívida em reais explode. O swap cambial troca o indexador: a empresa passa a dever em CDI ao invés de variação cambial + cupom em dólar.", next: "strategy_cambial" },
        { id: "speculation", label: "Especulação — apostar na queda do dólar", correct: false, score: 5, feedback: "Deixar a dívida em dólar sem proteção é uma aposta cambial. A diretoria e os acionistas esperam gestão de risco, não especulação.", next: "strategy_cambial" },
        { id: "arbitrage", label: "Arbitragem entre taxas de juros", correct: false, score: 0, feedback: "A motivação não é explorar distorção de preço, mas sim eliminar o descasamento entre a moeda da receita (BRL) e da dívida (USD).", next: "strategy_cambial" },
      ]},
      { id: "strategy_cambial", type: "choice", prompt: "No swap cambial, a empresa precisa definir as pernas. Ela já paga variação cambial na dívida. Qual estrutura do swap?", choices: [
        { id: "buy_usd", label: "Pagar CDI no swap e receber variação cambial + cupom cambial (4,50%)", correct: true, score: 25, feedback: "Perfeito! A perna cambial recebida no swap compensa a variação cambial da dívida. O custo final da empresa fica indexado ao CDI — previsível em reais.", next: "contract_cambial" },
        { id: "sell_usd", label: "Receber CDI no swap e pagar variação cambial + cupom cambial", correct: false, score: 0, feedback: "Se a empresa paga variação cambial no swap, ela ficaria pagando variação cambial duas vezes: na dívida e no swap. Isso dobra a exposição ao dólar!", next: "contract_cambial" },
      ]},
      { id: "contract_cambial", type: "choice", prompt: "O nocional do swap deve ser convertido pelo câmbio spot da contratação. Qual o nocional correto em reais?", choices: [
        { id: "swap_520m", label: "R$ 520 milhões (USD 100M × R$ 5,20)", correct: true, score: 20, feedback: "Correto! Nocional em reais = USD 100M × R$ 5,20 = R$ 520.000.000. Este é o valor sobre o qual incide o CDI do swap.", next: "resolution_cambial" },
        { id: "swap_100m", label: "R$ 100 milhões (apenas o valor numérico da dívida)", correct: false, score: 0, feedback: "R$ 100M confunde o nocional em dólares com reais. USD 100M × R$ 5,20 = R$ 520M. Usar R$ 100M cobre apenas 19% da exposição.", next: "resolution_cambial" },
        { id: "swap_530m", label: "R$ 530 milhões (usando o forward de 6 meses)", correct: false, score: 5, feedback: "O nocional é fixado pelo câmbio spot da data de contratação, não pelo forward. Nocional = USD 100M × R$ 5,20 = R$ 520M.", next: "resolution_cambial" },
      ]},
      { id: "resolution_cambial", type: "resolution", prompt: "3 anos se passaram. Hora de avaliar o resultado do swap cambial.", scenarios: [
        { id: "dolar_disparou", label: "Cenário A: Dólar subiu para R$ 6,80 (+30,8%)", fixingRate: 6.80, description: "O dólar disparou. Sem swap, custo da dívida em reais saltaria. Com swap, a empresa recebeu a variação cambial, compensando o custo maior da dívida. Pagou CDI em reais — custo previsível." },
        { id: "dolar_caiu", label: "Cenário B: Dólar caiu para R$ 4,30 (−17,3%)", fixingRate: 4.30, description: "O real se valorizou. Sem swap, a dívida teria caído em reais. Com swap, a empresa devolveu essa 'economia' na perna cambial e continuou pagando CDI." },
        { id: "dolar_estavel", label: "Cenário C: Dólar estável em R$ 5,35 (+2,9%)", fixingRate: 5.35, description: "O câmbio oscilou pouco. A variação cambial foi pequena e o swap neutralizou o impacto." },
      ]},
    ],
  },
  {
    id: "swap_especulacao",
    title: "Swap Direcional — Fundo Multimercado",
    theme: "Swaps", themeId: "swaps", instrument: "Swap CDI × Pré",
    difficulty: "Avançado",
    context: {
      narrative: "Você é gestor(a) de um fundo multimercado com PL de **R$ 800 milhões**. Sua convicção é de que o Copom vai **cortar a Selic agressivamente** nos próximos 18 meses. O CDI está em **11,75% a.a.** e um banco oferece swap CDI × Pré a **12,00% a.a.** para 18 meses. Você quer montar uma posição direcional via swap ao invés de usar DI futuro, porque o swap não exige margem na B3 (é bilateral com o banco). O limite de risco do fundo para essa estratégia é **R$ 10 milhões** de perda máxima.",
      marketData: { spotRate: 11.75, forwardRate90d: 12.00, cdiRate: 0.1175, notional_usd: 3333333, tenor: 378 },
      displayFields: [["CDI atual", "11,75% a.a."], ["Taxa swap", "12,00% a.a."], ["PL fundo", "R$ 800M"], ["Stop loss", "R$ 10M"], ["Prazo", "18 meses"]],
      question: "Você aposta na queda dos juros. Como usar o swap para capturar esse movimento?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual é a natureza desta operação com swap?", choices: [
        { id: "speculation", label: "Especulação — aposta direcional em queda dos juros via swap", correct: true, score: 20, feedback: "Correto! Não há exposição a proteger. O swap é usado como veículo especulativo para apostar na queda dos juros — alternativa ao DI futuro, com a vantagem de não exigir margem na B3 (risco bilateral com o banco).", next: "strategy_spec_swap" },
        { id: "hedge", label: "Hedge — proteger a carteira do fundo", correct: false, score: 5, feedback: "Se fosse hedge, o fundo teria uma exposição pré-existente a proteger. Aqui, a posição é puramente direcional.", next: "strategy_spec_swap" },
        { id: "arbitrage", label: "Arbitragem entre swap e DI futuro", correct: false, score: 10, feedback: "Arbitragem entre swap e DI futuro exigiria que as taxas estivessem descasadas. Aqui a motivação é direcional — apostar na queda de juros.", next: "strategy_spec_swap" },
      ]},
      { id: "strategy_spec_swap", type: "choice", prompt: "Para lucrar com a QUEDA dos juros via swap CDI × Pré, qual perna o fundo escolhe?", choices: [
        { id: "sell_usd", label: "Receber taxa fixa (12,00%) e pagar CDI — lucra se CDI ficar abaixo de 12,00%", correct: true, score: 25, feedback: "Perfeito! O fundo recebe 12,00% fixo e paga CDI flutuante. Se o Copom cortar juros e o CDI médio ficar em 9,00%, o fundo ganha: (12,00% − 9,00%) × R$ 222M × 1,5 anos = R$ 10M.", next: "contract_spec_swap" },
        { id: "buy_usd", label: "Pagar taxa fixa (12,00%) e receber CDI — lucra se CDI ficar acima de 12,00%", correct: false, score: 0, feedback: "Pagar fixo e receber CDI lucra quando os juros SOBEM (CDI > 12,00%). Mas sua tese é de queda!", next: "contract_spec_swap" },
      ]},
      { id: "contract_spec_swap", type: "choice", prompt: "O stop loss é R$ 10 milhões. No pior cenário (stress), o CDI médio sobe 300bps acima da taxa fixa (CDI médio = 15,00% vs fixo = 12,00%) ao longo dos 18 meses. Qual o nocional máximo do swap?", choices: [
        { id: "moderate", label: "R$ 222 milhões", correct: true, score: 20, feedback: "Memória de cálculo: (1) Perda no cenário de stress = (CDI médio − taxa fixa) × nocional × prazo. (2) Spread de stress = 15,00% − 12,00% = 3,00% a.a. (3) Prazo = 1,5 anos. (4) Perda = 3,00% × nocional × 1,5. (5) Nocional máximo = R$ 10.000.000 ÷ (0,03 × 1,5) = R$ 222.222.222 ≈ R$ 222M. (6) Ganho potencial (se CDI médio = 9,00%): (12,00% − 9,00%) × R$ 222M × 1,5 = R$ 10M. Relação risco/retorno: 1:1 no cenário base.", next: "resolution_spec_swap" },
        { id: "conservative", label: "R$ 100 milhões", correct: false, score: 10, feedback: "Perda no stress = 3,00% × R$ 100M × 1,5 = R$ 4,5M. Usa apenas 45% do limite. Nocional máximo: R$ 10M ÷ (0,03 × 1,5) ≈ R$ 222M.", next: "resolution_spec_swap" },
        { id: "aggressive", label: "R$ 500 milhões", correct: false, score: 5, feedback: "Perda no stress = 3,00% × R$ 500M × 1,5 = R$ 22,5M. Excede o stop de R$ 10M em 2,25 vezes!", next: "resolution_spec_swap" },
      ]},
      { id: "resolution_spec_swap", type: "resolution", prompt: "18 meses se passaram. Qual foi o CDI médio acumulado no período?", scenarios: [
        { id: "cdi_caiu_forte", label: "Cenário A: CDI médio ficou em 9,00% a.a. (tese acertou!)", fixingRate: 9.00, description: "O Copom cortou agressivamente. O fundo recebeu 12,00% fixo e pagou CDI médio de 9,00%. Ganho = (12,00% − 9,00%) × R$ 222M × 1,5 = +R$ 10M." },
        { id: "cdi_subiu", label: "Cenário B: CDI médio ficou em 14,50% a.a. (tese errou)", fixingRate: 14.50, description: "Inflação persistente forçou alta de juros. O fundo recebeu 12,00% fixo mas pagou CDI médio de 14,50%. Perda = (12,00% − 14,50%) × R$ 222M × 1,5 = −R$ 8,3M." },
        { id: "cdi_estavel", label: "Cenário C: CDI médio ficou em 11,80% a.a.", fixingRate: 11.80, description: "Juros pouco se moveram. Ganho = (12,00% − 11,80%) × R$ 222M × 1,5 = +R$ 667 mil. A posição quase empatou." },
      ]},
    ],
  },
  {
    id: "swap_super_desafio",
    title: "Super Desafio — Swap com Risco de Crédito (CVA)",
    theme: "Swaps", themeId: "swaps", instrument: "Swap CDI × Pré (com CVA)",
    difficulty: "Super Desafio",
    context: {
      narrative: "Você é head de tesouraria do **Banco Meridional**. Uma empresa de rating **BB** (alto risco de crédito) pede um swap CDI × Pré de **R$ 300 milhões** por **3 anos** para fixar o custo da dívida. A taxa de swap 'limpa' (sem risco de crédito) é **12,00% a.a.** O departamento de risco estima a **probabilidade de default** da empresa em **8% acumulada em 3 anos** e a **perda dado default (LGD)** em **60%**. Você precisa precificar o **CVA (Credit Valuation Adjustment)** e definir a taxa do swap que o banco deve oferecer.",
      marketData: { spotRate: 12.00, forwardRate90d: 12.08, cdiRate: 0.1175, notional_usd: 9000000, tenor: 756 },
      displayFields: [["Taxa limpa", "12,00% a.a."], ["Nocional", "R$ 300M"], ["PD 3 anos", "8%"], ["LGD", "60%"], ["Rating", "BB"], ["Prazo", "3 anos"]],
      question: "Qual taxa de swap cobrar para compensar o risco de crédito da contraparte?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Por que o banco não pode simplesmente oferecer a taxa de swap 'limpa' de 12,00% a.a.?", choices: [
        { id: "hedge", label: "Porque há risco de crédito da contraparte — se a empresa der default, o banco perde o valor positivo do swap", correct: true, score: 25, feedback: "Exato! Em um swap bilateral, se a contraparte quebrar quando o swap tem valor positivo para o banco, o banco perde esse valor (ou parte dele). O CVA (Credit Valuation Adjustment) é a precificação desse risco — deve ser embutido na taxa para compensar a perda esperada.", next: "strategy_cva" },
        { id: "speculation", label: "Porque o banco quer lucrar mais com clientes de risco alto", correct: false, score: 5, feedback: "Não é simplesmente 'lucrar mais' — é compensar uma perda esperada real. O CVA quantifica essa perda esperada e a embute na taxa.", next: "strategy_cva" },
        { id: "arbitrage", label: "Porque a taxa de mercado já subiu e 12,00% está defasada", correct: false, score: 0, feedback: "12,00% é a taxa de mercado atual para contrapartes sem risco de crédito. O ajuste é pelo risco específico desta contraparte.", next: "strategy_cva" },
      ]},
      { id: "strategy_cva", type: "choice", prompt: "Para uma primeira aproximação, como calcular o CVA? Dados: PD = 8% em 3 anos, LGD = 60%. Suponha que a exposição positiva esperada média do banco ao longo dos 3 anos é de R$ 15 milhões (estimada por simulação).", choices: [
        { id: "cva_correct", label: "CVA ≈ PD × LGD × Exposição esperada = 8% × 60% × R$ 15M = R$ 720.000", correct: true, score: 30, feedback: "Memória de cálculo: (1) Probabilidade de default em 3 anos = 8%. (2) Perda dado default = 60% (o banco recupera 40%). (3) Exposição positiva esperada média = R$ 15M. (4) CVA = 0,08 × 0,60 × R$ 15.000.000 = R$ 720.000. (5) Anualizado sobre R$ 300M por 3 anos: R$ 720.000 ÷ (R$ 300M × 3) ≈ 0,08% a.a. ≈ 8bps. A taxa do swap deve ser ajustada para ~12,08% a.a.", next: "contract_cva" },
        { id: "cva_nocional", label: "CVA ≈ PD × Nocional = 8% × R$ 300M = R$ 24 milhões", correct: false, score: 5, feedback: "Superestima brutalmente o CVA! Usa o nocional total ao invés da exposição esperada e ignora a taxa de recuperação. O correto: CVA = PD × LGD × Exposição esperada = 0,08 × 0,60 × R$ 15M = R$ 720 mil.", next: "contract_cva" },
        { id: "cva_lgd_total", label: "CVA ≈ LGD × Nocional = 60% × R$ 300M = R$ 180 milhões", correct: false, score: 0, feedback: "Confunde LGD com perda total. Faltam a probabilidade de default (8%) e a exposição correta (R$ 15M). CVA = 0,08 × 0,60 × R$ 15M = R$ 720 mil.", next: "contract_cva" },
      ]},
      { id: "contract_cva", type: "choice", prompt: "O CVA é ~R$ 720 mil, equivalente a ~8bps a.a. sobre o nocional. Qual taxa final o banco deve oferecer à empresa?", choices: [
        { id: "cva_adjusted", label: "12,08% a.a. — taxa limpa (12,00%) + CVA (0,08%)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Taxa limpa de mercado = 12,00% a.a. (2) CVA anualizado = ~8bps = 0,08% a.a. (3) Taxa com ajuste de crédito = 12,00% + 0,08% = 12,08% a.a. O CVA garante que o banco é compensado pela perda esperada de crédito.", next: "resolution_cva" },
        { id: "cva_generic", label: "13,00% a.a. — taxa limpa + 100bps de 'spread de crédito genérico'", correct: false, score: 5, feedback: "100bps é um spread arbitrário. O CVA calculado é de apenas 8bps. Cobrar 100bps pode perder o negócio para um concorrente que precifique corretamente.", next: "resolution_cva" },
        { id: "cva_clean", label: "12,00% a.a. — mesma taxa de mercado, sem ajuste", correct: false, score: 0, feedback: "Ignora completamente o risco de crédito. Sem o CVA, o banco está subsidiando o risco de crédito da contraparte.", next: "resolution_cva" },
      ]},
      { id: "resolution_cva", type: "resolution", prompt: "3 anos se passaram. O que aconteceu com a contraparte e o swap?", scenarios: [
        { id: "default", label: "Cenário A: A empresa entrou em recuperação judicial no mês 24", fixingRate: 14.00, description: "A empresa deu default quando o swap valia R$ 18M para o banco (CDI subiu). Com LGD de 60%, o banco perdeu R$ 10,8M. O CVA cobrado (R$ 720k) cobriu apenas uma fração — mas sem ele, a perda teria sido ainda maior." },
        { id: "sobreviveu_cdi_alto", label: "Cenário B: A empresa sobreviveu e o CDI subiu para 14,00%", fixingRate: 14.00, description: "Sem default. O swap gerou resultado negativo para o banco: recebeu CDI alto mas pagou taxa fixa ao cliente. O CVA cobrado de 8bps foi 'lucro' adicional — a perda de crédito não se materializou." },
        { id: "sobreviveu_cdi_baixo", label: "Cenário C: A empresa sobreviveu e o CDI caiu para 9,00%", fixingRate: 9.00, description: "Sem default. O swap gerou resultado positivo para o banco (recebe CDI-equivalente, paga fixo baixo ao cliente). Neste cenário, o risco de crédito era irrelevante — quando o swap vale negativo para o banco, ele não perde nada com default da contraparte." },
      ]},
    ],
  },
];

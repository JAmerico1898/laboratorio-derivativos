import type { Scenario } from "../../types/scenario";

export const EMBUTIDOS_SCENARIOS: Scenario[] = [
  {
    id: "emb_coe",
    title: "COE de Principal Garantido",
    theme: "Embutidos", themeId: "embutidos", instrument: "COE (Call S&P 500)",
    difficulty: "Intermediário", embeddedStrategy: "coe",
    context: {
      narrative: "Você é assessor de investimentos e um cliente com **R$ 500 mil** quer diversificar. O banco oferece um **COE de principal garantido** com exposição ao **S&P 500**: prazo de **2 anos**, principal 100% garantido, participação de **70% da alta** do S&P. O COE embute: (a) um **zero-cupom** que garante o principal e (b) uma **call sobre o S&P 500** que gera a participação. O CDI está em **11,75% a.a.**",
      marketData: { investimento: 500000, prazoAnos: 2, cdi: 0.1175, participacao: 0.70, sp500Atual: 5200 },
      displayFields: [["Investimento", "R$ 500 mil"], ["Prazo", "2 anos"], ["Principal", "100% garantido"], ["Participação", "70% do S&P"], ["S&P 500", "5.200 pts"], ["CDI", "11,75% a.a."]],
      question: "Qual derivativo está embutido no COE e qual o custo de oportunidade?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido neste COE?", choices: [
        { id: "buy_usd", label: "Call sobre o S&P 500 — o investidor compra implicitamente uma opção de compra sobre o índice", correct: true, score: 25, feedback: "Memória de cálculo da decomposição: (1) Valor do zero-cupom hoje = R$ 500.000 ÷ (1,1175)² = R$ 500.000 ÷ 1,2488 = R$ 400.480. (2) 'Troco' disponível para a call = R$ 500.000 − R$ 400.480 = R$ 99.520. (3) O banco usa os R$ 99.520 para comprar uma call sobre o S&P com participação de 70%. (4) O zero-cupom cresce a CDI e garante R$ 500k no vencimento. A call gera o upside.", next: "contract_coe" },
        { id: "sell_usd", label: "Put sobre o S&P 500 — a proteção do principal é uma put", correct: false, score: 5, feedback: "A proteção do principal não é uma put comprada pelo investidor — é financiada pelo zero-cupom. O 'seguro' vem do fato de que R$ 400.480 investidos ao CDI viram R$ 500k em 2 anos. A opção embutida é uma call (participação na alta).", next: "contract_coe" },
        { id: "sell_usd_teorico", label: "Swap de taxa de juros", correct: false, score: 0, feedback: "Não há troca de indexadores. O COE combina renda fixa (zero-cupom) com uma opção (call sobre o S&P).", next: "contract_coe" },
      ]},
      { id: "contract_coe", type: "choice", prompt: "Se o cliente investisse no CDI por 2 anos, quanto teria? Qual o custo de oportunidade do COE?", choices: [
        { id: "above_fwd", label: "CDI renderia ~R$ 124.400. O custo de oportunidade é abrir mão dessa renda em troca da call.", correct: true, score: 20, feedback: "Memória de cálculo: (1) CDI 2 anos = R$ 500.000 × [(1,1175)² − 1] = R$ 500.000 × 0,2488 = R$ 124.400. (2) No COE, se S&P cair ou ficar flat: recebe apenas R$ 500.000 — perde R$ 124.400 de oportunidade. (3) Breakeven: 70% × alta × R$ 500k = R$ 124.400 → alta mínima do S&P = R$ 124.400 ÷ (0,70 × R$ 500.000) = 35,5%. O S&P precisa subir mais de 35,5% em 2 anos para o COE superar o CDI.", next: "bifurcacao_coe" },
        { id: "market_fwd", label: "Sem custo — o principal é garantido", correct: false, score: 0, feedback: "O principal é garantido em termos nominais (R$ 500k), mas o custo de oportunidade é real: R$ 124.400 de CDI não recebidos. 'Principal garantido' não significa 'sem custo'.", next: "bifurcacao_coe" },
        { id: "spot_rate", label: "O custo é R$ 500 mil", correct: false, score: 0, feedback: "R$ 500k é o investimento, não o custo. O custo de oportunidade é a diferença entre CDI (R$ 624.400) e o COE no pior caso (R$ 500.000) = R$ 124.400.", next: "bifurcacao_coe" },
      ]},
      { id: "bifurcacao_coe", type: "choice", prompt: "O COE deve ter o derivativo embutido separado (bifurcado) na contabilidade (CPC 48)?", choices: [
        { id: "above_fwd_b", label: "Não necessariamente — se classificado a valor justo pelo resultado (VJPR), a bifurcação não é exigida", correct: true, score: 20, feedback: "Segundo o CPC 48/IFRS 9, a bifurcação só é exigida quando o hospedeiro NÃO é mensurado a VJPR. Se a entidade classifica o COE inteiro a VJPR (comum para produtos estruturados), o valor justo total já captura o derivativo. Se classificado a custo amortizado, seria necessário separar a call.", next: "resolution_coe" },
        { id: "market_fwd_b", label: "Sim, sempre — todo derivativo embutido deve ser separado", correct: false, score: 5, feedback: "Nem sempre. O CPC 48 exige bifurcação apenas quando 3 condições são atendidas simultaneamente. Se o hospedeiro já é VJPR, não há necessidade.", next: "resolution_coe" },
        { id: "spot_rate_b", label: "Não — o COE é indivisível", correct: false, score: 0, feedback: "O COE pode sim ser decomposto: zero-cupom + call. A questão é se a norma contábil EXIGE essa separação — e depende da classificação.", next: "resolution_coe" },
      ]},
      { id: "resolution_coe", type: "resolution", prompt: "2 anos se passaram. Como performou o S&P 500?", scenarios: [
        { id: "sp_subiu", label: "Cenário A: S&P subiu 40% (para 7.280)", fixingRate: 40, description: "" },
        { id: "sp_caiu", label: "Cenário B: S&P caiu 20% (para 4.160)", fixingRate: -20, description: "" },
        { id: "sp_pouco", label: "Cenário C: S&P subiu 15% (para 5.980)", fixingRate: 15, description: "" },
      ]},
    ],
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
      question: "Vale a pena exercer a opção de pré-pagamento?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido na cláusula de pré-pagamento?", choices: [
        { id: "buy_usd", label: "Call sobre a dívida — a empresa tem o direito de 'recomprar' (liquidar) seu empréstimo antecipadamente", correct: true, score: 25, feedback: "A cláusula de pré-pagamento é economicamente uma call: a empresa pode 'chamar' a dívida pagando saldo + multa. Quando juros caem, essa opção ganha valor — assim como uma call sobre um bond sobe quando juros caem. O exercício permite refinanciar a taxa menor.", next: "contract_prepay" },
        { id: "sell_usd", label: "Swap de taxa de juros", correct: false, score: 0, feedback: "Não há troca de indexadores. A cláusula dá à empresa o direito unilateral de liquidar — é uma opção, não um swap.", next: "contract_prepay" },
        { id: "sell_usd_teorico", label: "Put sobre taxa de juros", correct: false, score: 5, feedback: "É uma call (direito de comprar/liquidar), não uma put. A empresa exerce quando quer — não é obrigada.", next: "contract_prepay" },
      ]},
      { id: "contract_prepay", type: "choice", prompt: "A economia é 1,00% a.a. (CDI+3% → CDI+2%) sobre R$ 50M = R$ 500k/ano. A multa é 2% × R$ 50M = R$ 1M. Vale exercer?", choices: [
        { id: "above_fwd", label: "Sim — economia líquida de R$ 500 mil (R$ 1,5M em 3 anos menos multa de R$ 1M)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Economia anual = 1,00% × R$ 50M = R$ 500.000. (2) Economia em 3 anos = R$ 1.500.000. (3) Multa = 2% × R$ 50M = R$ 1.000.000. (4) Ganho líquido = R$ 1.500.000 − R$ 1.000.000 = R$ 500.000. (5) Breakeven: R$ 1M ÷ R$ 500k/ano = 2 anos. Como restam 3 anos, vale exercer.", next: "bifurcacao_prepay" },
        { id: "market_fwd", label: "Não — a multa de R$ 1M é muito cara", correct: false, score: 5, feedback: "A multa (R$ 1M) é recuperada em 2 anos de economia (R$ 500k/ano). Como restam 3 anos, há 1 ano de economia líquida = R$ 500k de ganho.", next: "bifurcacao_prepay" },
        { id: "spot_rate", label: "Indiferente — CDI+3% e CDI+2% são parecidos", correct: false, score: 0, feedback: "1,00% de diferença sobre R$ 50M = R$ 500k/ano. Em 3 anos = R$ 1,5M. Descontar a multa de R$ 1M ainda deixa ganho de R$ 500k.", next: "bifurcacao_prepay" },
      ]},
      { id: "bifurcacao_prepay", type: "choice", prompt: "A opção de pré-pagamento deve ser bifurcada (CPC 48)?", choices: [
        { id: "above_fwd_b", label: "Não — a opção está intimamente relacionada ao hospedeiro (mesma variável: taxa de juros do empréstimo)", correct: true, score: 20, feedback: "Segundo CPC 48, opções de pré-pagamento cujo preço de exercício é aproximadamente o custo amortizado na data de exercício estão intimamente relacionadas ao hospedeiro. A multa de 2% é um ajuste pequeno — não há bifurcação.", next: "resolution_prepay" },
        { id: "market_fwd_b", label: "Sim — é um derivativo separável", correct: false, score: 5, feedback: "Embora tecnicamente separável, o CPC 48 dispensa a bifurcação quando o derivativo está intimamente relacionado ao hospedeiro. Opções de pré-pagamento em empréstimos a taxa de juros atendem esse critério.", next: "resolution_prepay" },
        { id: "spot_rate_b", label: "Depende do valor da multa", correct: false, score: 0, feedback: "O critério não é o valor da multa, mas sim se o derivativo está intimamente relacionado ao hospedeiro.", next: "resolution_prepay" },
      ]},
      { id: "resolution_prepay", type: "resolution", prompt: "O que aconteceu após a decisão?", scenarios: [
        { id: "exerceu", label: "Cenário A: Exerceu o pré-pagamento, refinanciou a CDI+2%", fixingRate: 1, description: "" },
        { id: "juros_subiram", label: "Cenário B: Não exerceu. Juros voltaram a subir — a oferta de CDI+2% desapareceu", fixingRate: 0, description: "" },
        { id: "juros_cairam_mais", label: "Cenário C: Exerceu. Juros caíram ainda mais — poderia ter refinanciado a CDI+1,50%", fixingRate: 2, description: "" },
      ]},
    ],
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
      question: "O prêmio de 50 bps compensa o risco de resgate antecipado?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido na debênture callable?", choices: [
        { id: "buy_usd", label: "Call vendida pelo investidor ao emissor — a emissora tem o direito de resgatar antecipadamente", correct: true, score: 25, feedback: "Ao comprar a callable, você implicitamente VENDE uma call ao emissor. O prêmio (50 bps/ano) está embutido no cupom mais alto. Se juros caírem, a emissora exercerá a call (refinancia mais barato) e você terá que reinvestir a taxas menores — o risco de reinvestimento.", next: "contract_callable" },
        { id: "sell_usd", label: "Call comprada pelo investidor", correct: false, score: 0, feedback: "O investidor não tem o direito de exercer nada. É a EMISSORA que pode chamar o bond. O investidor vendeu a call.", next: "contract_callable" },
        { id: "sell_usd_teorico", label: "Put comprada pelo investidor", correct: false, score: 5, feedback: "Put seria o direito do investidor de devolver o bond (puttable bond). Aqui é o contrário: a emissora chama o bond (callable).", next: "contract_callable" },
      ]},
      { id: "contract_callable", type: "choice", prompt: "Quando a emissora provavelmente exercerá a call?", choices: [
        { id: "above_fwd", label: "Quando os juros caírem significativamente — a emissora refinancia a custo menor", correct: true, score: 20, feedback: "Memória de cálculo: (1) Se CDI cair de 11,75% para 8% no ano 3, custo atual = 8% + 2,50% = 10,50%. (2) A emissora pode emitir nova debênture a 8% + 2,00% = 10,00%. (3) Economia = 0,50% a.a. por 2 anos (anos 4-5). (4) A call é exercida — o investidor recebe o par (100%) e precisa reinvestir a CDI+2,00% ao invés de CDI+2,50%. Perdeu 50 bps/ano por 2 anos de cupom.", next: "bifurcacao_callable" },
        { id: "market_fwd", label: "Quando os juros subirem", correct: false, score: 0, feedback: "Se juros subirem, a dívida da emissora fica barata (abaixo do mercado). Ela NUNCA exerceria a call para refinanciar a taxas maiores.", next: "bifurcacao_callable" },
        { id: "spot_rate", label: "A emissora sempre exerce no ano 3", correct: false, score: 5, feedback: "O exercício depende das condições de mercado. A emissora só exerce se for economicamente vantajoso — geralmente quando juros caem significativamente.", next: "bifurcacao_callable" },
      ]},
      { id: "bifurcacao_callable", type: "choice", prompt: "Os 50 bps de prêmio compensam o risco do call em 3 anos?", choices: [
        { id: "above_fwd_b", label: "Depende da expectativa de juros — se caírem forte, o call será exercido e o investidor perde 2 anos de cupom elevado", correct: true, score: 20, feedback: "Memória de cálculo: (1) Prêmio acumulado em 3 anos = 50 bps × 3 = 150 bps. (2) Se call exercido no ano 3: perde 50 bps/ano × 2 anos restantes = 100 bps de cupom. (3) Ganho líquido = 150 − 100 = 50 bps. (4) Porém, o reinvestimento será a taxas menores. Se CDI caiu de 11,75% para 8%, o custo de reinvestimento pode superar o prêmio acumulado. A análise exige modelar cenários de juros.", next: "resolution_callable" },
        { id: "market_fwd_b", label: "Sim, sempre — 50 bps é prêmio suficiente", correct: false, score: 5, feedback: "50 bps pode ser insuficiente se juros caírem 300+ bps. O custo de reinvestimento a taxas menores pode superar o prêmio acumulado.", next: "resolution_callable" },
        { id: "spot_rate_b", label: "Não, nunca — callable é sempre mau negócio", correct: false, score: 0, feedback: "Callable bonds podem ser atrativos se os juros subirem ou ficarem estáveis — o investidor recebe o prêmio e o call não é exercido.", next: "resolution_callable" },
      ]},
      { id: "resolution_callable", type: "resolution", prompt: "3 anos se passaram. O que a emissora decidiu?", scenarios: [
        { id: "call_exercido", label: "Cenário A: CDI caiu para 8%. Emissora exerceu a call.", fixingRate: 8.0, description: "" },
        { id: "call_nao", label: "Cenário B: CDI subiu para 14%. Call NÃO exercido.", fixingRate: 14.0, description: "" },
        { id: "call_neutro", label: "Cenário C: CDI estável em 11,50%. Call não exercido.", fixingRate: 11.5, description: "" },
      ]},
    ],
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
      question: "Qual derivativo está embutido e o que exige a contabilidade?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido nesta cláusula?", choices: [
        { id: "buy_usd", label: "Call digital de dólar — ativação binária quando USD cruza R$ 5,80", correct: true, score: 25, feedback: "É uma call digital (binária): payoff discreto (0 ou 1,50% a.a.), ativado quando o dólar cruza a barreira R$ 5,80. A empresa 'vendeu' essa opção ao banco em troca da taxa subsidiada (8,50% vs CDI 11,75%). A economia de 3,25% a.a. inclui o prêmio implícito da call digital.", next: "contract_fx" },
        { id: "sell_usd", label: "NDF de dólar", correct: false, score: 0, feedback: "Não há troca de nocional em moedas. É uma opção binária — o payoff é discreto (0 ou 1,50%), não linear como um NDF.", next: "contract_fx" },
        { id: "sell_usd_teorico", label: "Swap cambial", correct: false, score: 5, feedback: "Não há troca de pernas CDI × câmbio. É uma cláusula contingente com trigger no dólar.", next: "contract_fx" },
      ]},
      { id: "contract_fx", type: "choice", prompt: "Se o dólar ultrapassar R$ 5,80, qual o impacto no custo do empréstimo?", choices: [
        { id: "above_fwd", label: "Custo sobe de 8,50% para 10,00% — impacto de R$ 1,2M/ano, mas ainda abaixo do CDI", correct: true, score: 20, feedback: "Memória de cálculo: (1) Custo base = 8,50% × R$ 80M = R$ 6.800.000/ano. (2) Com trigger: 10,00% × R$ 80M = R$ 8.000.000/ano. (3) Impacto = R$ 1.200.000/ano. (4) Mesmo com trigger, 10,00% < CDI 11,75% — a taxa ainda é subsidiada, mas a vantagem diminuiu de 3,25% para 1,75%.", next: "bifurcacao_fx" },
        { id: "market_fwd", label: "Custo sobe para CDI + 1,50%", correct: false, score: 0, feedback: "O step-up é sobre a taxa base (8,50% + 1,50% = 10,00%), não sobre o CDI.", next: "bifurcacao_fx" },
        { id: "spot_rate", label: "Sem impacto relevante", correct: false, score: 0, feedback: "R$ 1,2M/ano é 1,5% sobre R$ 80M — impacto material para uma empresa agrícola.", next: "bifurcacao_fx" },
      ]},
      { id: "bifurcacao_fx", type: "choice", prompt: "A call digital de dólar deve ser bifurcada (CPC 48)?", choices: [
        { id: "above_fwd_b", label: "Sim — a variável (câmbio) NÃO está intimamente relacionada ao hospedeiro (empréstimo em reais)", correct: true, score: 20, feedback: "Caso clássico de bifurcação obrigatória: o hospedeiro é um empréstimo em reais indexado a taxa de juros, mas o derivativo é indexado ao câmbio — variáveis econômicas não relacionadas. A call digital deve ser separada, mensurada a valor justo e reconhecida no resultado periodicamente.", next: "resolution_fx" },
        { id: "market_fwd_b", label: "Não — faz parte do empréstimo", correct: false, score: 0, feedback: "O fato de estar no mesmo contrato não dispensa a bifurcação. A variável do derivativo (câmbio) é diferente da variável do hospedeiro (taxa de juros em BRL).", next: "resolution_fx" },
        { id: "spot_rate_b", label: "Só bifurca se o trigger for acionado", correct: false, score: 5, feedback: "A bifurcação independe de o trigger ter sido acionado. O derivativo existe desde a contratação e deve ser marcado a valor justo continuamente.", next: "resolution_fx" },
      ]},
      { id: "resolution_fx", type: "resolution", prompt: "3 anos se passaram. Onde fechou o dólar?", scenarios: [
        { id: "trigger_on", label: "Cenário A: Dólar subiu para R$ 6,20 — trigger acionado", fixingRate: 6.20, description: "" },
        { id: "trigger_off", label: "Cenário B: Dólar caiu para R$ 4,80 — trigger NÃO acionado", fixingRate: 4.80, description: "" },
        { id: "trigger_near", label: "Cenário C: Dólar oscilou entre R$ 5,60 e R$ 5,85", fixingRate: 5.85, description: "Trigger acionado brevemente." },
      ]},
    ],
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
      question: "Qual derivativo está embutido e quais os riscos adicionais?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido neste COE?", choices: [
        { id: "buy_usd", label: "TRS (Total Return Swap) — o COE replica o retorno total do portfólio", correct: true, score: 25, feedback: "O COE é o hospedeiro (captação bancária). Embutido há um TRS sintético: o investidor recebe retorno total do portfólio e paga CDI + 0,80% implicitamente. Spread líquido = 2,20% − 0,80% = 1,40% a.a. = R$ 1.400.000/ano. Funcionalmente idêntico ao TRS do módulo de Derivativos de Crédito.", next: "contract_trs_s" },
        { id: "sell_usd", label: "CDS — proteção de crédito", correct: false, score: 0, feedback: "Não há proteção de crédito. O investidor RECEBE exposição ao crédito (retorno total), não se protege dele.", next: "contract_trs_s" },
        { id: "sell_usd_teorico", label: "Opção sobre debêntures", correct: false, score: 5, feedback: "Não há opcionalidade — o retorno é linear (cupom + Δpreço). É um TRS, não uma opção.", next: "contract_trs_s" },
      ]},
      { id: "contract_trs_s", type: "choice", prompt: "Qual risco adicional o COE tem em relação a um TRS autônomo?", choices: [
        { id: "above_fwd", label: "Risco do banco emissor — se o banco quebrar, o investidor perde o investimento, ALÉM do risco do portfólio", correct: true, score: 20, feedback: "Dupla camada de risco: (1) Risco do portfólio de referência (debêntures de infra). (2) Risco do banco emissor do COE (se quebrar, o investimento é perda total). No TRS autônomo, o risco do banco é contratual (contraparte). No COE, é risco de emissão. Nota: o FGC não cobre COE.", next: "bifurcacao_trs_s" },
        { id: "market_fwd", label: "Apenas o risco do portfólio de referência", correct: false, score: 5, feedback: "Falta considerar o risco do banco emissor. O COE é uma obrigação do banco — se ele quebrar, o investidor não recebe nada, independentemente do portfólio.", next: "bifurcacao_trs_s" },
        { id: "spot_rate", label: "Sem risco adicional — o COE tem garantia do FGC", correct: false, score: 0, feedback: "O FGC NÃO cobre COE. Esse é um erro comum. O COE é risco integral do banco emissor.", next: "bifurcacao_trs_s" },
      ]},
      { id: "bifurcacao_trs_s", type: "choice", prompt: "O TRS embutido deve ser bifurcado?", choices: [
        { id: "above_fwd_b", label: "Se o COE for classificado a VJPR, não precisa bifurcar. Se a custo amortizado, sim.", correct: true, score: 20, feedback: "Mesma lógica do COE de principal garantido: se o instrumento inteiro é mensurado a valor justo pelo resultado, a bifurcação é desnecessária. Na prática, COEs costumam ser VJPR.", next: "resolution_trs_s" },
        { id: "market_fwd_b", label: "Sempre bifurca", correct: false, score: 5, feedback: "Depende da classificação do hospedeiro.", next: "resolution_trs_s" },
        { id: "spot_rate_b", label: "Nunca bifurca", correct: false, score: 0, feedback: "Se classificado a custo amortizado, o TRS embutido deve ser separado.", next: "resolution_trs_s" },
      ]},
      { id: "resolution_trs_s", type: "resolution", prompt: "3 anos se passaram. Como performou o portfólio?", scenarios: [
        { id: "valorizou", label: "Cenário A: Portfólio valorizou 5%", fixingRate: 5.0, description: "" },
        { id: "desvalorizou", label: "Cenário B: Portfólio caiu 10% (estresse de crédito)", fixingRate: -10.0, description: "" },
        { id: "banco_quebrou", label: "Cenário C: O banco emissor entrou em liquidação", fixingRate: 0.0, description: "" },
      ]},
    ],
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
      question: "Qual derivativo está embutido e qual o efeito econômico?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido na cláusula de step-up?", choices: [
        { id: "buy_usd", label: "CDS implícito — o tomador vendeu proteção de crédito ao banco via aumento de spread", correct: true, score: 25, feedback: "A cláusula de step-up atrelada ao rating é um derivativo de crédito: o banco recebe 'indenização' (spread maior) quando o crédito deteriora. O tomador implicitamente vendeu proteção. Paradoxo: o custo aumenta justamente quando a empresa está mais frágil — efeito pró-cíclico.", next: "contract_credit" },
        { id: "sell_usd", label: "Opção de pré-pagamento", correct: false, score: 0, feedback: "Pré-pagamento é o direito de liquidar antecipadamente. O step-up é uma cláusula automática atrelada ao rating.", next: "contract_credit" },
        { id: "sell_usd_teorico", label: "Cap de taxa de juros", correct: false, score: 5, feedback: "Um cap limita a taxa máxima. O step-up aumenta a taxa sem limite. São mecanismos opostos.", next: "contract_credit" },
      ]},
      { id: "contract_credit", type: "choice", prompt: "Se o rating for rebaixado para BB, qual o impacto financeiro anual?", choices: [
        { id: "above_fwd", label: "Aumento de R$ 450.000/ano (1,50% × R$ 30M)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Spread base = 2,50% × R$ 30M = R$ 750.000/ano. (2) Spread pós-trigger = 4,00% × R$ 30M = R$ 1.200.000/ano. (3) Aumento = R$ 450.000/ano. (4) Efeito pró-cíclico: a empresa já está em dificuldade (rating rebaixado) e agora paga R$ 450k a mais por ano — agravando a situação financeira.", next: "bifurcacao_credit" },
        { id: "market_fwd", label: "Impacto irrelevante", correct: false, score: 0, feedback: "R$ 450k/ano é 1,5% sobre R$ 30M — material para qualquer empresa.", next: "bifurcacao_credit" },
        { id: "spot_rate", label: "O spread só muda no vencimento", correct: false, score: 5, feedback: "O step-up se aplica imediatamente após o rebaixamento, não no vencimento.", next: "bifurcacao_credit" },
      ]},
      { id: "bifurcacao_credit", type: "choice", prompt: "A cláusula de step-up deve ser bifurcada (CPC 48)?", choices: [
        { id: "above_fwd_b", label: "Pode ser exigida — a variável (rating de crédito) modifica significativamente os fluxos, e a prática contábil pode exigir bifurcação se o step-up for material", correct: true, score: 20, feedback: "Caso de julgamento: o step-up é atrelado ao crédito do próprio tomador (intimamente relacionado ao hospedeiro), mas o aumento de 150 bps é significativo. Na prática, se o step-up modifica substancialmente os fluxos, a bifurcação pode ser exigida. A análise é caso a caso.", next: "resolution_credit" },
        { id: "market_fwd_b", label: "Não — está intimamente relacionado ao hospedeiro", correct: false, score: 10, feedback: "Argumentável, mas o passo de 150 bps é material e pode requerer separação. A prática de mercado varia.", next: "resolution_credit" },
        { id: "spot_rate_b", label: "Sempre bifurca", correct: false, score: 5, feedback: "Nem sempre. Se o step-up fosse de 10 bps, provavelmente não exigiria bifurcação por imaterialidade.", next: "resolution_credit" },
      ]},
      { id: "resolution_credit", type: "resolution", prompt: "4 anos se passaram. O que aconteceu com o rating?", scenarios: [
        { id: "rebaixado", label: "Cenário A: Rating rebaixado para BB — step-up ativado", fixingRate: 1, description: "" },
        { id: "mantido", label: "Cenário B: Rating mantido em BBB", fixingRate: 0, description: "" },
        { id: "melhorou", label: "Cenário C: Rating elevado para A−", fixingRate: -1, description: "Empresa melhorou." },
      ]},
    ],
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
      question: "Quais derivativos estão embutidos e quando são ativados?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Quais derivativos estão embutidos neste empréstimo?", choices: [
        { id: "buy_usd", label: "Cap comprado (teto) + Floor vendido (piso) = collar de taxa de juros", correct: true, score: 25, feedback: "São dois derivativos: (1) Cap: o banco limita o custo em 15,00%. Se CDI subir muito, o excedente é absorvido pelo banco. (2) Floor: o tomador garante piso de 10,50% ao banco. Se CDI cair muito, o tomador não se beneficia abaixo de 10,50%. É um collar embutido — análogo ao collar cambial do módulo de Opções.", next: "contract_capfloor" },
        { id: "sell_usd", label: "Swap de taxa fixa × flutuante", correct: false, score: 5, feedback: "O swap troca CDI por taxa fixa em todo o range. O collar limita apenas os extremos — dentro do corredor, o empréstimo continua flutuante.", next: "contract_capfloor" },
        { id: "sell_usd_teorico", label: "Apenas um cap de juros", correct: false, score: 10, feedback: "Há também o floor (piso). O banco não oferece o cap 'de graça' — exige o floor como contrapartida. São dois derivativos embutidos.", next: "contract_capfloor" },
      ]},
      { id: "contract_capfloor", type: "choice", prompt: "Em qual nível de CDI o cap e o floor são acionados?", choices: [
        { id: "above_fwd", label: "Cap: CDI > 13,20% (pois 13,20% + 1,80% = 15,00%). Floor: CDI < 8,70% (pois 8,70% + 1,80% = 10,50%)", correct: true, score: 20, feedback: "Memória de cálculo: (1) Cap trigger: custo total = cap → CDI + 1,80% = 15,00% → CDI = 13,20%. (2) Floor trigger: custo total = floor → CDI + 1,80% = 10,50% → CDI = 8,70%. (3) Corredor de CDI: 8,70% a 13,20%. Dentro desse corredor, o empréstimo funciona normalmente (CDI + 1,80%). Fora, o cap ou floor é ativado.", next: "bifurcacao_capfloor" },
        { id: "market_fwd", label: "Cap: CDI > 15,00%. Floor: CDI < 10,50%", correct: false, score: 5, feedback: "15,00% e 10,50% são os limites do custo TOTAL (CDI + spread). O CDI trigger é descontado do spread: 15,00% − 1,80% = 13,20% e 10,50% − 1,80% = 8,70%.", next: "bifurcacao_capfloor" },
        { id: "spot_rate", label: "O cap e floor são acionados no vencimento", correct: false, score: 0, feedback: "Cap e floor são verificados em cada período de pagamento de juros, não apenas no vencimento.", next: "bifurcacao_capfloor" },
      ]},
      { id: "bifurcacao_capfloor", type: "choice", prompt: "O collar de juros deve ser bifurcado (CPC 48)?", choices: [
        { id: "above_fwd_b", label: "Geralmente não — cap e floor sobre a taxa de juros do próprio empréstimo estão intimamente relacionados ao hospedeiro", correct: true, score: 20, feedback: "Quando cap e floor têm como subjacente a mesma taxa de juros do empréstimo, o CPC 48 geralmente não exige bifurcação — as características econômicas estão intimamente relacionadas ao hospedeiro. Exceção: se o cap ou floor forem alavancados (ex: 2× CDI) ou referenciarem outra taxa (ex: IPCA), a bifurcação pode ser exigida.", next: "resolution_capfloor" },
        { id: "market_fwd_b", label: "Sempre bifurca", correct: false, score: 5, feedback: "Quando o subjacente do derivativo é o mesmo do hospedeiro (taxa de juros), geralmente não bifurca.", next: "resolution_capfloor" },
        { id: "spot_rate_b", label: "Bifurca apenas o floor", correct: false, score: 0, feedback: "Cap e floor são analisados juntos como collar. Ambos têm o mesmo subjacente do hospedeiro.", next: "resolution_capfloor" },
      ]},
      { id: "resolution_capfloor", type: "resolution", prompt: "5 anos se passaram. Como evoluiu o CDI?", scenarios: [
        { id: "cdi_alto", label: "Cenário A: CDI subiu para 14,50% — cap acionado", fixingRate: 14.50, description: "" },
        { id: "cdi_baixo", label: "Cenário B: CDI caiu para 7,00% — floor acionado", fixingRate: 7.00, description: "" },
        { id: "cdi_medio", label: "Cenário C: CDI estável em 11,00% — dentro do corredor", fixingRate: 11.00, description: "" },
      ]},
    ],
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
      question: "Qual derivativo está embutido e como contabilizar?",
    },
    steps: [
      { id: "motivation", type: "choice", prompt: "Qual derivativo está embutido na debênture conversível?", choices: [
        { id: "buy_usd", label: "Call de ações — o investidor tem o direito de trocar a debênture por ações TECH3 a R$ 25,00", correct: true, score: 25, feedback: "A conversão é uma call de TECH3 com strike R$ 25,00. Memória de cálculo do prêmio implícito: (1) Cupom sacrificado = CDI+3% − CDI+1% = 2,00% a.a. (2) Valor do cupom perdido = 2,00% × R$ 200M × 5 anos = R$ 20M. (3) Esse é o 'preço' da opção de conversão. (4) Prêmio sobre o spot: (R$ 25 − R$ 18) ÷ R$ 18 = 38,9% — a ação precisa subir quase 39% para a conversão valer a pena.", next: "contract_conv" },
        { id: "sell_usd", label: "Put sobre a debênture", correct: false, score: 0, feedback: "Put seria o direito de devolver a debênture ao emissor. A conversão é o direito de trocar por ações — é uma call.", next: "contract_conv" },
        { id: "sell_usd_teorico", label: "Swap de equity", correct: false, score: 5, feedback: "Não é um swap — o investidor tem o DIREITO (não a obrigação) de converter. É uma opção, não uma troca obrigatória.", next: "contract_conv" },
      ]},
      { id: "contract_conv", type: "choice", prompt: "Quando vale a pena converter a debênture em ações?", choices: [
        { id: "above_fwd", label: "Quando TECH3 > R$ 25,00 — as ações recebidas valem mais que o valor de face da debênture", correct: true, score: 20, feedback: "Memória de cálculo: (1) Cada R$ 1.000 de face converte em 1.000 ÷ 25 = 40 ações. (2) Se TECH3 = R$ 35: valor das ações = 40 × R$ 35 = R$ 1.400. (3) Ganho de conversão = R$ 1.400 − R$ 1.000 = R$ 400 por R$ 1.000 de face (40%). (4) Para todo o nocional: ganho = 40% × R$ 200M = R$ 80M. (5) Porém, o investidor abriu mão de 2% a.a. de cupom — deve comparar o ganho de conversão com o cupom sacrificado.", next: "bifurcacao_conv" },
        { id: "market_fwd", label: "Quando TECH3 > R$ 18,00 (spot atual)", correct: false, score: 5, feedback: "R$ 18 é o preço atual, não o strike. A conversão só cria valor acima de R$ 25 (preço de conversão).", next: "bifurcacao_conv" },
        { id: "spot_rate", label: "Nunca — o cupom de CDI+1% sempre vale mais", correct: false, score: 0, feedback: "Se TECH3 subir para R$ 50, cada R$ 1.000 de face converte em 40 ações × R$ 50 = R$ 2.000 — dobra o valor. O cupom perdido de 2% a.a. seria amplamente compensado.", next: "bifurcacao_conv" },
      ]},
      { id: "bifurcacao_conv", type: "choice", prompt: "Como contabilizar a opção de conversão (CPC 48/IAS 32)?", choices: [
        { id: "above_fwd_b", label: "Componente de equity (patrimônio líquido) — se a conversão é em número fixo de ações próprias na mesma moeda funcional", correct: true, score: 20, feedback: "O CPC 48/IAS 32 prevê que a opção de conversão em número fixo de ações próprias é classificada como componente de patrimônio (equity), não como derivativo. A debênture é separada em: (a) componente de dívida (custo amortizado) e (b) componente equity (valor residual, sem remensuração). Se a conversão fosse em moeda diferente ou número variável de ações, seria derivativo com bifurcação + marcação a mercado.", next: "resolution_conv" },
        { id: "market_fwd_b", label: "Derivativo bifurcado — sempre separa e marca a mercado", correct: false, score: 10, feedback: "Somente se a conversão for em número variável de ações ou em moeda diferente da funcional. Se for número fixo de ações próprias na moeda funcional, é equity.", next: "resolution_conv" },
        { id: "spot_rate_b", label: "Não separa — mantém como instrumento único", correct: false, score: 0, feedback: "A separação é obrigatória — a questão é SE como equity OU como derivativo.", next: "resolution_conv" },
      ]},
      { id: "resolution_conv", type: "resolution", prompt: "5 anos se passaram. Onde fechou TECH3?", scenarios: [
        { id: "acao_disparou", label: "Cenário A: TECH3 subiu para R$ 40,00 (+122%)", fixingRate: 40.0, description: "" },
        { id: "acao_caiu", label: "Cenário B: TECH3 caiu para R$ 12,00 (−33%)", fixingRate: 12.0, description: "" },
        { id: "acao_perto", label: "Cenário C: TECH3 subiu para R$ 26,00 (+44%)", fixingRate: 26.0, description: "" },
      ]},
    ],
  },
];

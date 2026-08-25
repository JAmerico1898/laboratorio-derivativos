# Laboratório de Derivativos

Aplicação web educacional para o ensino de derivativos financeiros, desenvolvida para
turmas de MBA do COPPEAD/UFRJ.

Cada módulo apresenta cenários interativos em que o aluno assume o papel de um agente de
mercado — gestor de fundo, tesoureiro, trader — e toma decisões encadeadas: identificar a
motivação da operação, escolher a posição, dimensionar o hedge e, por fim, ver o resultado
sob diferentes desfechos de mercado. O feedback é imediato e traz a memória de cálculo
completa, inclusive para as respostas erradas.

Todo o conteúdo é em português e usa convenções do mercado brasileiro (B3, DI futuro, CDI,
PU, dias úteis/252).

## Módulos

| Rota | Módulo | Conteúdo |
|------|--------|----------|
| `/termos` | Termos (NDF) | Contratos a termo e NDFs: estruturação, precificação e hedge cambial |
| `/futuros` | Futuros | Contratos futuros e ajuste diário: margens, liquidação e mecânica da B3 |
| `/swaps` | Swaps | Swaps de juros e câmbio: troca de fluxos, DI × dólar e pré-fixados |
| `/opcoes` | Opções | Opções vanilla e estratégias: calls, puts, Black & Scholes e as gregas |
| `/credito` | Derivativos de Crédito | CDS: risco de contraparte e spreads de crédito |
| `/embutidos` | Derivativos Embutidos | Identificação em notas estruturadas e COEs |

Cada módulo reúne cenários de dificuldade crescente: Intermediário, Avançado e Super Desafio.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** com tokens Material Design 3, sobre base shadcn
- **Recharts** para os diagramas de payoff
- **Remotion** para as animações de abertura dos módulos
- Deploy na **Vercel**

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção (roda o TypeScript)
npm run lint
```

## Organização

```
src/
├── app/                    # rotas (uma por módulo) + layout e API de contato
├── components/
│   ├── scenario/           # player de cenários (etapas, escolhas, pontuação)
│   ├── results/            # painéis de resultado, um por família de instrumento
│   └── charts/             # diagrama de payoff
├── data/scenarios/         # os cenários, em arquivos por módulo
├── hooks/                  # estado do player de cenários
├── lib/
│   ├── calculations/       # motores de P&L (generic, options, credit, embedded)
│   ├── formatters.ts       # formatação pt-BR (moeda, taxa, percentual)
│   └── strings.ts          # strings de UI centralizadas
└── types/                  # tipos de cenário e de resultado
```

### Adicionar ou editar um cenário

Os cenários são dados, não código: cada um é um objeto em `src/data/scenarios/<módulo>.ts`
com `context` (narrativa e dados de mercado), `steps` (as escolhas encadeadas) e o passo de
`resolution` (os desfechos). O cálculo de P&L é escolhido pelo campo `pnlMethod` em
`marketData` — por exemplo, `di_pu_mtm` marca uma posição em DI futuro a mercado pela
variação do PU. Textos de UI ficam em `src/lib/strings.ts`.

---

Prof. José Américo — COPPEAD/UFRJ

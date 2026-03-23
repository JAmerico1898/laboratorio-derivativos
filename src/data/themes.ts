import type { Theme } from "../types/scenario";

export const THEMES: Theme[] = [
  { id: "ndf",       label: "Termos (NDF)",   icon: "📄", materialIcon: "contract",          route: "/termos",    description: "Contratos a termo e NDFs: Estruturação, precificação e estratégias de hedge cambial." },
  { id: "futuros",   label: "Futuros",        icon: "📈", materialIcon: "history_toggle_off", route: "/futuros",   description: "Contratos futuros e ajuste diário: Margens, liquidação e mecânica operacional da B3." },
  { id: "swaps",     label: "Swaps",          icon: "🔄", materialIcon: "currency_exchange",  route: "/swaps",     description: "Swaps de taxa de juros e câmbio: Troca de fluxos, DI vs dólar e swaps pré-fixados." },
  { id: "opcoes",    label: "Opções",         icon: "🎯", materialIcon: "hdr_strong",         route: "/opcoes",    description: "Opções vanilla e estratégias: Calls, Puts, Black & Scholes e as Gregas aplicadas." },
  { id: "credito",   label: "Deriv. Crédito", icon: "🛡️", materialIcon: "security",           route: "/credito",   description: "CDS e derivativos de crédito: Gerenciamento de risco de contraparte e spreads de crédito." },
  { id: "embutidos", label: "Derivativos Embutidos", icon: "🧩", materialIcon: "extension",    route: "/embutidos", description: "Derivativos embutidos em contratos: Identificação em notas estruturadas e COEs." },
];

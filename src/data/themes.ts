import type { Theme } from "../types/scenario";

export const THEMES: Theme[] = [
  { id: "ndf",       label: "Termos (NDF)",   icon: "📄", route: "/termos",    description: "Contratos a termo e NDFs" },
  { id: "futuros",   label: "Futuros",        icon: "📈", route: "/futuros",   description: "Contratos futuros e ajuste diário" },
  { id: "swaps",     label: "Swaps",          icon: "🔄", route: "/swaps",     description: "Swaps de taxa de juros e câmbio" },
  { id: "opcoes",    label: "Opções",         icon: "🎯", route: "/opcoes",    description: "Opções vanilla e estratégias" },
  { id: "credito",   label: "Deriv. Crédito", icon: "🛡️", route: "/credito",   description: "CDS e derivativos de crédito" },
  { id: "embutidos", label: "Embutidos",      icon: "🧩", route: "/embutidos", description: "Derivativos embutidos em contratos" },
];

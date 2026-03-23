# Dashboard Frontpage Design

## Summary

Replace the current monolithic landing page (which mixes frontpage chrome with module/scenario browsing) with a clean, independent dashboard-style hub built on shadcn/ui components and Tailwind CSS.

## Goals

- Decouple the frontpage from module/scenario internals
- Use shadcn/ui components and shadcn default dark theme
- Provide a dashboard hub with navigation cards to each module
- Show minimal overall progress (scenario count only, no scores)

## Layout

```
┌─────────────────────────────────────┐
│  LocaleSwitcher (top-right, as now) │
│                                     │
│  Header: Badge + Title + Subtitle   │
│                                     │
│  "4 de 18 cenários concluídos"      │
│                                     │
│  ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │ Termos  │ │ Futuros │ │ Swaps │ │
│  │  (NDF)  │ │         │ │       │ │
│  └─────────┘ └─────────┘ └───────┘ │
│  ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │ Opções  │ │ Crédito │ │Embut. │ │
│  │         │ │         │ │       │ │
│  └─────────┘ └─────────┘ └───────┘ │
│                                     │
│  Footer (Prof. José Américo)        │
└─────────────────────────────────────┘
```

- 3 columns on desktop (lg), 2 columns on tablet (sm), 1 column on mobile
- Max width ~900px, centered
- Tailwind classes only (no inline styles)
- shadcn default dark theme palette

## Components

### New: `src/components/landing/dashboard-page.tsx`

Client component ("use client"). Renders the full dashboard layout.

**Header:**
- shadcn `Badge` for "COPPEAD/UFRJ" label
- Gradient title "Laboratório de Derivativos" (Tailwind gradient utilities)
- Subtitle text (muted)
- Overall progress line: "X de Y cenários concluídos" (translated via next-intl)

**Module Cards (Bento Grid):**
- Uses shadcn `Card` (`CardHeader`, `CardContent`)
- Each card shows: emoji icon (large), module name (bold), 1-line description, progress text ("2/3 concluídos")
- Hover: border highlight + subtle lift (`hover:border-primary hover:-translate-y-1 transition-all`)
- Click: navigates to module route via `Link` from `@/i18n/navigation`
- Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

**Footer:**
- Copyright text: "Prof. José Américo — COPPEAD/UFRJ"
- Subtle top border separator
- Muted text styling

### Existing: `src/components/landing/locale-switcher.tsx`

No changes. Reused as-is.

### Existing: `src/components/landing/landing-page.tsx`

No changes in this scope. Stays for now (module pages may use it later or it gets deprecated).

## Data Changes

### `src/types/scenario.ts` — Theme type

Add two new fields:

```ts
interface Theme {
  id: string;
  label: string;
  icon: string;
  route: string;       // NEW
  description: string; // NEW
}
```

### `src/data/themes.ts` — Theme data

```ts
export const THEMES: Theme[] = [
  { id: "ndf",       label: "Termos (NDF)",   icon: "📄", route: "/termos",    description: "Contratos a termo e NDFs" },
  { id: "futuros",   label: "Futuros",        icon: "📈", route: "/futuros",   description: "Contratos futuros e ajuste diário" },
  { id: "swaps",     label: "Swaps",          icon: "🔄", route: "/swaps",     description: "Swaps de taxa de juros e câmbio" },
  { id: "opcoes",    label: "Opções",         icon: "🎯", route: "/opcoes",    description: "Opções vanilla e estratégias" },
  { id: "credito",   label: "Deriv. Crédito", icon: "🛡️", route: "/credito",   description: "CDS e derivativos de crédito" },
  { id: "embutidos", label: "Embutidos",      icon: "🧩", route: "/embutidos", description: "Derivativos embutidos em contratos" },
];
```

## i18n Keys

New keys to add to both `messages/pt.json` and `messages/en.json` under `"app"`:

**PT:**
```json
"progressLine": "{completed} de {total} cenários concluídos",
"moduleProgress": "{completed}/{total} concluídos"
```

**EN:**
```json
"progressLine": "{completed} of {total} scenarios completed",
"moduleProgress": "{completed}/{total} completed"
```

Existing keys reused: `app.badge`, `app.title`, `app.subtitle`, `app.footer`.

## Theme Descriptions

Per CLAUDE.md convention ("Scenario content stays in Portuguese"), theme descriptions are domain-specific content and stay hardcoded in Portuguese — not translated via next-intl.

## Route Change

`src/app/[locale]/page.tsx` renders `DashboardPage` instead of `LandingPage`.

## Progress Data

Uses existing `useCompletedScenarios()` hook and `getScenariosByTheme()` to compute:
- Total scenarios across all themes (for "X de Y" line)
- Per-module completion count (for each card's progress text)

## Styling

- shadcn default dark theme (replaces custom COLORS palette on this page)
- All styling via Tailwind utility classes
- No inline styles

## Out of Scope

- Scores/gamification on the frontpage
- Navbar
- Module-level pages (existing routes unchanged)
- Changes to `landing-page.tsx`

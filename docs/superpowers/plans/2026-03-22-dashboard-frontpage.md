# Dashboard Frontpage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the monolithic landing page with a clean dashboard hub using shadcn/ui components and Tailwind CSS.

**Architecture:** New `DashboardPage` client component renders a header, bento grid of 6 module cards (shadcn Card), and footer. Each card links to its module route. Progress data comes from existing `useCompletedScenarios()` hook. Old `LandingPage` stays untouched.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, shadcn/ui (Card, Badge), next-intl

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `src/types/scenario.ts:5-9` | Add `route` and `description` fields to `Theme` interface |
| Modify | `src/data/themes.ts` | Add `route` and `description` values to each theme |
| Modify | `messages/pt.json` | Add `progressLine` and `moduleProgress` keys |
| Modify | `messages/en.json` | Add `progressLine` and `moduleProgress` keys |
| Create | `src/components/landing/dashboard-page.tsx` | New dashboard component |
| Modify | `src/app/[locale]/page.tsx` | Swap `LandingPage` for `DashboardPage` |

---

### Task 1: Extend Theme type and data

**Files:**
- Modify: `src/types/scenario.ts:5-9`
- Modify: `src/data/themes.ts`

- [ ] **Step 1: Add `route` and `description` to the Theme interface**

In `src/types/scenario.ts`, update the `Theme` interface:

```ts
export interface Theme {
  id: string;
  label: string;
  icon: string;
  route: string;
  description: string;
}
```

- [ ] **Step 2: Update theme data with new fields**

In `src/data/themes.ts`:

```ts
import type { Theme } from "../types/scenario";

export const THEMES: Theme[] = [
  { id: "ndf",       label: "Termos (NDF)",   icon: "📄", route: "/termos",    description: "Contratos a termo e NDFs" },
  { id: "futuros",   label: "Futuros",        icon: "📈", route: "/futuros",   description: "Contratos futuros e ajuste diário" },
  { id: "swaps",     label: "Swaps",          icon: "🔄", route: "/swaps",     description: "Swaps de taxa de juros e câmbio" },
  { id: "opcoes",    label: "Opções",         icon: "🎯", route: "/opcoes",    description: "Opções vanilla e estratégias" },
  { id: "credito",   label: "Deriv. Crédito", icon: "🛡️", route: "/credito",   description: "CDS e derivativos de crédito" },
  { id: "embutidos", label: "Embutidos",      icon: "🧩", route: "/embutidos", description: "Derivativos embutidos em contratos" },
];
```

- [ ] **Step 3: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: No errors (existing usages of `Theme` don't destructure, so adding fields is non-breaking).

- [ ] **Step 4: Commit**

```bash
git add src/types/scenario.ts src/data/themes.ts
git commit -m "feat: add route and description fields to Theme type"
```

---

### Task 2: Add i18n message keys

**Files:**
- Modify: `messages/pt.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add new keys to `messages/pt.json`**

Add inside the `"app"` object:

```json
"progressLine": "{completed} de {total} cenários concluídos",
"moduleProgress": "{completed}/{total} concluídos"
```

- [ ] **Step 2: Add new keys to `messages/en.json`**

Add inside the `"app"` object:

```json
"progressLine": "{completed} of {total} scenarios completed",
"moduleProgress": "{completed}/{total} completed"
```

- [ ] **Step 3: Commit**

```bash
git add messages/pt.json messages/en.json
git commit -m "feat: add dashboard progress i18n keys"
```

---

### Task 3: Create DashboardPage component

**Files:**
- Create: `src/components/landing/dashboard-page.tsx`

- [ ] **Step 1: Create the dashboard component**

Create `src/components/landing/dashboard-page.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { THEMES } from "@/data/themes";
import { ALL_SCENARIOS } from "@/data/scenarios";
import { getScenariosByTheme } from "@/data/scenarios";
import { useCompletedScenarios } from "@/hooks/use-completed-scenarios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocaleSwitcher } from "./locale-switcher";

export function DashboardPage() {
  const t = useTranslations("app");
  const { completedScenarios } = useCompletedScenarios();

  const totalScenarios = ALL_SCENARIOS.length;
  const uniqueCompleted = new Set(completedScenarios.map((cs) => cs.id)).size;

  function getModuleProgress(themeId: string) {
    const scenarios = getScenariosByTheme(themeId);
    const completedIds = new Set(completedScenarios.map((cs) => cs.id));
    const done = scenarios.filter((s) => completedIds.has(s.id)).length;
    return { completed: done, total: scenarios.length };
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LocaleSwitcher />

      <div className="mx-auto max-w-[900px] px-4 pt-12 pb-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-4">
            {t("badge")}
          </Badge>
          <h1 className="mb-3 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-4xl font-black leading-tight text-transparent sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-lg text-base text-muted-foreground">
            {t("subtitle")}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("progressLine", { completed: uniqueCompleted, total: totalScenarios })}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((theme) => {
            const progress = getModuleProgress(theme.id);
            return (
              <Link key={theme.id} href={theme.route} className="block">
                <Card className="h-full cursor-pointer transition-all hover:-translate-y-1 hover:border-primary">
                  <CardHeader>
                    <div className="text-3xl">{theme.icon}</div>
                    <CardTitle className="text-lg font-bold">
                      {theme.label}
                    </CardTitle>
                    <CardDescription>{theme.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {t("moduleProgress", {
                        completed: progress.completed,
                        total: progress.total,
                      })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          {t("footer")}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/dashboard-page.tsx
git commit -m "feat: create DashboardPage component with shadcn bento grid"
```

---

### Task 4: Wire up the route

**Files:**
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Replace LandingPage with DashboardPage**

Update `src/app/[locale]/page.tsx`:

```tsx
import { DashboardPage } from '@/components/landing/dashboard-page';

export default function LocalePage() {
  return <DashboardPage />;
}
```

- [ ] **Step 2: Verify the build succeeds**

Run: `npm run build`
Expected: Build completes without errors.

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev`
Verify:
- Dashboard renders with 6 module cards in a grid
- Cards show emoji, title, description, and progress count
- Clicking a card navigates to the correct module route
- Locale switcher works
- Responsive layout: 1 col on mobile, 2 on tablet, 3 on desktop
- Footer shows "Prof. José Américo"

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: wire dashboard as frontpage, replacing old landing page"
```

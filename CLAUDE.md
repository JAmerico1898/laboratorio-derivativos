# Derivativos Lab

## Project
Educational web app for teaching financial derivatives to MBA students at COPPEAD/UFRJ. Migrated from a monolithic React component to Next.js App Router.

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Recharts for payoff diagrams
- next-intl for i18n (PT/EN)

## Conventions
- Source code in `src/`
- Client components must have `"use client"` directive
- Scenario content stays in Portuguese (domain-specific)
- UI chrome (buttons, labels, navigation) is translated via next-intl
- Dark theme by default (#0a0f1a background)
- Module routes: /termos, /futuros, /swaps, /opcoes, /credito, /embutidos

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint

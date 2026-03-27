# Derivativos Lab

## Project
Educational web app for teaching financial derivatives to MBA students at COPPEAD/UFRJ. Migrated from a monolithic React component to Next.js App Router.

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Recharts for payoff diagrams
- Portuguese-only UI strings in `src/lib/strings.ts`

## Conventions
- Source code in `src/`
- Client components must have `"use client"` directive
- All content in Portuguese (domain-specific)
- UI strings centralized in `src/lib/strings.ts`
- Dark theme by default (#0a0f1a background)
- Module routes: /termos, /futuros, /swaps, /opcoes, /credito, /embutidos

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint

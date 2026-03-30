# Embutidos Hero Animation Design

## Context

Módulo 6 (Derivativos Embutidos) is the only module without a hero animation on its opening page. All other modules (Termos, Futuros, Swaps, Opções, Crédito) have Remotion-based hero animations following a consistent 4-layer architecture. This spec defines the animation for Embutidos, using a **contract decomposition** metaphor that visually represents the core concept of the module: derivatives embedded inside host contracts.

## Composition

- **Size:** 1920 × 800 px
- **FPS:** 30
- **Duration:** 300 frames (10 seconds)
- **Loop:** seamless, autoPlay, no controls
- **Background:** `#0a1628`

## Layer Architecture

### Layer 1: BackgroundGrid (shared)

Reuses `src/components/remotion/layers/BackgroundGrid.tsx` with `patternId="embutidos-grid"`.

- Fade-in: 0 → 0.15 opacity over 1 second
- Upward drift: 0.2 px/frame
- Smooth reset for looping

### Layer 2: ContractDecomposition

SVG visualization showing a COE (Certificado de Operações Estruturadas) that splits into its two embedded components.

**Elements:**
- **COE Envelope:** Rounded rectangle with dashed border, label "COE" centered. Color: `rgba(232, 234, 237, 0.3)` border.
- **Zero-Coupon Bond (left half):** Solid-bordered rectangle, teal (`#8df5e4`). Label: "Zero-Coupon".
- **Call Option (right half):** Solid-bordered rectangle, gold (`#f5c842`). Label: "Call S&P 500".
- **Ghost outline:** After split, a faint dashed outline remains at original center position.
- **Particle arcs:** 2 quadratic bezier arcs between the separated halves (like credito's CDSFlow), 4 particles per arc cycling every 90 frames. Top arc teal (bond → option), bottom arc gold (option → bond).

**Choreography:**
| Frame Range | Action |
|-------------|--------|
| 0–30 | COE envelope fades in via `spring({ damping: 200 })` |
| 30–60 | COE stays whole, "COE" label visible |
| 60–90 | Split animation — halves spring apart horizontally via `spring({ damping: 20, stiffness: 180 })` |
| 90–210 | Separated state: ghost outline visible, particle arcs flowing between halves |
| 210–240 | Halves spring back together |
| 240–300 | Whole again, fade resets for seamless loop |

**SVG Viewbox:** 600 × 350

**Key coordinates:**
- COE envelope center: (300, 175)
- COE envelope size: 240 × 140
- Separated left position (Zero-Coupon): x = 130
- Separated right position (Call Option): x = 470
- Particle arc top: control point at (300, 60)
- Particle arc bottom: control point at (300, 290)

### Layer 3: PayoffWaterfall

SVG waterfall chart showing the value decomposition of the COE into its components.

**Elements:**
- **Baseline axis:** Horizontal line at bottom, with "Valor" label
- **Bar 1 — Principal Garantido:** Teal (`#8df5e4`), grows upward. Represents the guaranteed principal (zero-coupon bond value).
- **Bar 2 — Custo de Oportunidade:** Red (`#f54242`), grows downward from top of Bar 1. Represents the opportunity cost (foregone interest).
- **Bar 3 — Participação:** Gold (`#f5c842`), grows upward from Bar 2 baseline. Represents the potential option upside.
- **Value labels:** Small text above each bar showing percentage values (e.g., "100%", "-3.2%", "+12%"). Pulse opacity cyclically.

**Choreography:**
| Frame Range | Action |
|-------------|--------|
| 0–60 | Not visible (waiting for split) |
| 60–80 | Bar 1 grows up via spring (synced with split moment) |
| 80–100 | Bar 2 grows down via spring |
| 100–120 | Bar 3 grows up via spring |
| 120–210 | All bars visible, value labels pulse |
| 210–240 | Bars fade to opacity 0.1 |
| 240–300 | Reset for seamless loop |

**SVG Viewbox:** 400 × 300

**Key coordinates:**
- Bars positioned at x = 80, 180, 280 (width 60 each)
- Axis baseline at y = 250
- Bar 1 height: 160px (grows to y = 90)
- Bar 2 height: 40px (grows down from y = 90 to y = 130)
- Bar 3 height: 100px (grows from y = 130 to y = 30)

### Layer 4: EmbutidosFloatingLabels

Product-type floating labels with independent fade cycles and drift. Follows the same pattern as `CreditoFloatingLabels`.

**Labels:**

| Value | x | y | fontSize | cycleOffset | driftX | driftY | color |
|-------|---|---|----------|-------------|--------|--------|-------|
| "COE Principal Garantido" | 0.72 | 0.10 | 16 | 0 | 0 | -0.25 | COLOR_TEAL |
| "Callable Bond" | 0.82 | 0.65 | 14 | 50 | 0.1 | -0.15 | COLOR_GOLD |
| "Conversível" | 0.58 | 0.08 | 15 | 100 | -0.15 | 0 | COLOR_TEAL |
| "Cap/Floor CDI" | 0.85 | 0.40 | 13 | 150 | -0.1 | -0.2 | COLOR_RED |
| "Pré-pagamento" | 0.65 | 0.55 | 14 | 200 | 0.08 | -0.1 | COLOR_GOLD |
| "Nota Estruturada" | 0.90 | 0.18 | 16 | 250 | -0.08 | 0.1 | COLOR_TEAL |

**Cycle duration:** 150 frames per label (5 seconds visible, 5 seconds hidden, staggered).

## File Structure

```
src/components/remotion/embutidos/
├── EmbutidosPlayerLoader.tsx    # Dynamic import wrapper (ssr: false)
├── EmbutidosPlayer.tsx          # @remotion/player component
├── EmbutidosAnimation.tsx       # Main composition (AbsoluteFill + 4 Sequences)
├── embutidos-data.ts            # Types, colors, coordinates, floating labels, utilities
└── layers/
    ├── ContractDecomposition.tsx # Layer 2: COE split animation
    ├── PayoffWaterfall.tsx       # Layer 3: Value waterfall bars
    └── EmbutidosFloatingLabels.tsx # Layer 4: Product-type floating text
```

## Page Integration

Update `src/app/embutidos/page.tsx`:

```tsx
import { EmbutidosPlayerLoader } from '@/components/remotion/embutidos/EmbutidosPlayerLoader';

export default function EmbutidosPage() {
  return <ModulePage themeId="embutidos" heroPlayer={<EmbutidosPlayerLoader />} />;
}
```

## Color Palette

| Constant | Value | Usage |
|----------|-------|-------|
| COLOR_BG | `#0a1628` | Background |
| COLOR_TEAL | `#8df5e4` | Zero-coupon bond, host contract accents |
| COLOR_GOLD | `#f5c842` | Call option, embedded derivative accents |
| COLOR_RED | `#f54242` | Opportunity cost, negative values |
| COLOR_TEXT | `#e8eaed` | Primary text |
| COLOR_TEXT_DIM | `rgba(232,234,237,0.55)` | Secondary text |

## Animation Principles

- All animations driven by `useCurrentFrame()` + `interpolate()` / `spring()`
- No CSS transitions or Tailwind animate classes
- Spring configs: `{ damping: 200 }` for smooth reveals, `{ damping: 20, stiffness: 180 }` for snappy split
- All `<Sequence>` elements use `premountFor` for preloading
- Particle flow uses `getQuadraticPoint()` utility (duplicated into `embutidos-data.ts` to keep modules self-contained)
- Stroke dash animation for envelope drawing effect

## Verification

1. Run `npm run dev` and navigate to `/embutidos`
2. Verify animation plays on desktop (hidden on mobile)
3. Confirm 4 layers render: grid, decomposition, waterfall, floating labels
4. Check seamless loop (no jump at 10s boundary)
5. Verify text fade-in after 7 seconds (handled by ModulePage)
6. Test mobile fallback (gradient background, no animation)

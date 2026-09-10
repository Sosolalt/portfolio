# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## What this is

A one-page dark-mode portfolio for Lucas Majerczyk, built from the _Ciel V7 Constellation_ design
handoff. No backend, no data fetching, no routing — every string is static and lives in `src/data/`.
All copy is in French.

## Commands

```bash
npm run dev            # dev server
npm run build          # tsc -b + vite build → dist/
npm run lint           # ESLint (type-checked)
npm run typecheck      # tsc -b
npm run test           # Vitest unit tests
npm run test:e2e       # Playwright — builds and previews automatically
npm run format         # Prettier --write
npm run verify         # lint + test + build; run before pushing
```

`npm run test:e2e:install` once, to fetch browsers. A single unit test:
`npx vitest run tests/unit/Projects.test.tsx`. A single e2e project:
`npx playwright test --project=desktop` (also `mobile-360`, `reduced-motion`).

## Stack

Vite 8 · React 19 · TypeScript 6 (strict, plus `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes`, `erasableSyntaxOnly`, `verbatimModuleSyntax`) · CSS Modules ·
Vitest 4 + Testing Library · Playwright · ESLint 9 with `jsx-a11y`.

Imports inside `src/` use the `@/` alias. Components are named exports, one per file, each with a
sibling `X.module.css`.

## Architecture

`App.tsx` holds the only reactive state in the app: `modalIndex: number | null`.

Everything animated deliberately lives **outside** React state, because a 60fps canvas and a
per-character typewriter would otherwise re-render the page continuously:

- `src/lib/starfield.ts` is a framework-free engine (injected `random` and frame scheduler, so it is
  deterministically unit-testable). `useStarfield` only does lifecycle. It pauses the rAF loop when
  the tab is hidden or the hero scrolls out of view.
- `useTypewriter` runs a timeout chain that writes to a ref'd node's `textContent`.
- `useReveal` toggles the global `.reveal` / `.is-revealed` classes via IntersectionObserver.

The case-study modal is mounted only while open, so open/close _is_ mount/unmount. It portals into
`document.body`, traps focus, restores focus to the card that opened it, and locks body scroll
through a module-level counter in `useBodyScrollLock`.

## Invariants — do not break these

**Copy is verbatim.** `src/data/projects.ts` is copied character-for-character from the handoff and
is machine-verified against it. Never paraphrase, re-punctuate or "fix" it. Two strings in
`src/data/site.ts` contain a literal U+00A0 before `:` and `?` (French typography) — never normalise
them, and note that Testing Library's default normalizer will silently collapse them, so assertions
on those strings must pass `normalizer: (t) => t`.

**Design values are final.** They live once, in `src/styles/tokens.css`. Components reference tokens,
not literals. Per-project accents flow down as a `--accent` custom property set inline. The one
deliberate deviation from the handoff palette is `--color-text-muted`, lifted from `#64748B` to
`#708097` for WCAG AA; the reason is documented at the token and guarded by an e2e test.

**`prefers-reduced-motion: reduce` disables all motion.** `global.css` kills every animation and
transition declaratively; the starfield, typewriter and reveals each short-circuit in JS as well.
Any new motion must opt out on both sides.

**Keyframes belong in the module that uses them.** CSS Modules rewrites `animation-name` to a scoped
identifier. A `@keyframes` block in the unscoped `global.css` keeps its global name, so the reference
resolves to nothing and the animation silently never runs — this shipped once and was invisible to
unit tests (Vitest uses `classNameStrategy: 'non-scoped'`) and to the dev server. Only a production
build shows it.

**Vendor-prefix order matters.** Lightning CSS (Vite 8's minifier) collapses a prefixed/unprefixed
pair to whichever comes last. Write `-webkit-backdrop-filter` first, `backdrop-filter` second.

**Text is stored in natural case** and uppercased in CSS, so assistive tech and copy/paste get
properly cased strings. Never uppercase in JS.

No images, no icon libraries, no CSS frameworks. `✦ ● → ↗ ✕` are plain text characters. Layout must
hold to 360px with no horizontal overflow and no layout shift.

## The handoff

`design_handoff_portfolio_ciel/` is the design source of truth, kept for reference and excluded from
lint, formatting and the build.

- `README.md` — the spec: tokens, per-component layout, and the verbatim project content.
- `Ciel V7 - Constellation.dc.html` — the design reference prototype. Markup lives in an `<x-dc>` tag
  using `{{ }}` bindings and a `class Component`. Read it as spec for exact values and for the
  canvas/typewriter/modal logic; it is not runnable and not code to copy.
- `support.js` — prototype runtime. Ignore it entirely.

# Portfolio « Ciel » — Lucas Majerczyk

One-page dark-mode portfolio built from the _V7 Constellation_ design handoff, shipped in the
**Orbite** direction (`variants/05-orbite.html`, chosen on 10 September 2026). Calm, night-sky
aesthetic: an interactive starfield you can click to make a wish, heartbeat pulse rings behind the
hero, a name that rises into place above a rotating line of fields, two next steps, then a
full-width project ledger opening bottom-docked case-study sheets, about and contact — everything
below the hero on one centre axis. All copy is in French.

**No backend, no data fetching** — every string is static and lives in `src/data/`.

## Stack

|               |                                                                                    |
| ------------- | ---------------------------------------------------------------------------------- |
| Build         | Vite 8                                                                             |
| UI            | React 19                                                                           |
| Language      | TypeScript 6, `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` |
| Styling       | CSS Modules over a design-token layer (`src/styles/tokens.css`)                    |
| Unit tests    | Vitest 4 + Testing Library (jsdom)                                                 |
| E2E           | Playwright (desktop, 360px mobile, reduced-motion)                                 |
| Lint / format | ESLint 9 (type-checked) + `jsx-a11y`, Prettier                                     |

## Commands

```bash
npm install
npm run dev            # dev server with HMR
npm run build          # typecheck + production build to dist/
npm run preview        # serve the production build

npm run lint           # ESLint
npm run typecheck      # tsc -b
npm run test           # Vitest unit tests
npm run test:watch     # Vitest in watch mode
npm run test:e2e       # Playwright (builds and previews automatically)
npm run format         # Prettier --write

npm run verify         # lint + test + build — run this before pushing
```

First e2e run needs browsers: `npm run test:e2e:install`.

## Architecture

```
src/
├─ main.tsx                    entry — mounts <App> in StrictMode
├─ App.tsx                     the only reactive state: modalIndex: number | null
├─ types.ts                    Project, ProjectLink, AccentColor
├─ data/
│  ├─ projects.ts              the 4 projects, verbatim French copy
│  └─ site.ts                  nav, hero, about, contact copy
├─ styles/
│  ├─ tokens.css               every validated design value, as CSS custom properties
│  └─ global.css               reset, focus ring, section shell, reveal classes, reduced-motion
├─ lib/starfield.ts            framework-free canvas engine (pure, unit-tested)
├─ hooks/
│  ├─ usePrefersReducedMotion  reactive media query
│  ├─ useReveal                IntersectionObserver fade-in, once, optional cascade delay
│  ├─ useStarfield             React lifecycle around the starfield engine
│  ├─ useRotator               interval swapping the hero phrases, by class
│  ├─ useScrolledPast          class toggle once the page leaves the top
│  └─ useBodyScrollLock        scroll lock while the modal is open
└─ components/
   ├─ Icon/                    the four drawn marks (arrow, external, close, star)
   ├─ Nav/                     fixed, transparent over the sky, solid once scrolled
   ├─ Hero/                    Starfield · PulseRings · Rotator · content
   ├─ Projects/                ledger + ProjectRow
   ├─ CaseStudyModal/          portal, focus trap, Escape / backdrop / ✕
   ├─ About/
   └─ Contact/                 footer
```

### Why the animation state lives outside React

The starfield runs one `requestAnimationFrame` loop at 60fps; the rotator swaps a class every 3.2s
and the nav toggles one on scroll. Routing any of them through `useState` would re-render the page
for no visual benefit. They write to DOM nodes through refs instead, so React re-renders only when a
case study opens or closes.

The starfield's maths is deliberately split into `src/lib/starfield.ts` — a framework-free module
with injected randomness — so it can be unit-tested deterministically without a canvas.

### Reduced motion

`prefers-reduced-motion: reduce` disables **all** motion, per the handoff:

- `global.css` kills every `animation` and `transition`, and turns off smooth scrolling
- the starfield draws a single static frame, with no loop and no shooting stars (clicks do nothing)
- the rotator shows the first phrase only, scheduling no interval, and its timer rule is hidden
- scroll reveals never hide anything in the first place

## Design fidelity

Colours, type scale, letter-spacing, spacing and animation timings come from the handoff and are
**final**. They live once, in `src/styles/tokens.css`; components reference tokens rather than
literals. Per-project accent colours are passed down as a `--accent` custom property.

The French copy in `src/data/` is verbatim from the handoff and is verified against it — including
the two non-breaking spaces French typography requires before `:` and `?`. Do not paraphrase or
re-punctuate it.

**One deliberate deviation.** `--color-text-muted` ships as `#708097` rather than the handoff's
`#64748B`. The original scores 4.01:1 on the page background and 3.85:1 in the modal, below the
4.5:1 WCAG AA floor for text under 24px — and every use of it (wish hint, separators, STACK label,
copyright) is small text. The handoff asks for both final colours and "sufficient
contrast throughout"; this is the smallest lift that satisfies the second without visibly changing
the first. An end-to-end test fails if the original value is restored.

The design source of truth stays in `design_handoff_portfolio_ciel/` for reference. It is excluded
from lint, formatting and the build.

## Accessibility

- Visible keyboard focus ring on every interactive element, plus a skip link
- The case-study modal is a real `role="dialog" aria-modal="true"`: focus moves in on open, is
  trapped while open, and returns to the card that opened it on close; Escape closes it
- The starfield canvas and every drawn mark (arrow, external, close, star) are `aria-hidden`; the
  detail bullets and the metric separators are CSS, so nothing decorative sits in the text layer
- The rotating hero line is `aria-hidden`; a visually hidden sibling carries all four phrases as
  static text
- Labels and tags are stored in natural case and uppercased in CSS, so assistive tech and
  copy/paste get properly cased text
- `lang="fr"`, semantic landmarks, and a `<noscript>` fallback with contact details

## Deployment

Static output in `dist/` — any static host works.

- **GitHub Pages** — `.github/workflows/deploy.yml` builds every push to `main` with
  `GITHUB_PAGES=true` (so assets resolve under `/portfolio/`) and force-pushes `dist/` to the
  `gh-pages` branch. This is the live site.
- **Netlify** — `netlify.toml`
- **Vercel** — `vercel.json`

Both set a strict Content-Security-Policy (self + Google Fonts + Fontshare only), HSTS,
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `X-Frame-Options: DENY`, and
cache hashed assets immutably while keeping `index.html` revalidated.

Update the canonical URL in `index.html`, `public/sitemap.xml` and `public/robots.txt` when the real
domain is set.

## CI

`.github/workflows/ci.yml` runs format check, lint, typecheck, unit tests with coverage and a build
on every push and PR, plus the Playwright suite in a second job.

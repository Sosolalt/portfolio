# Handoff: Portfolio "Ciel" — Lucas Majerczyk (V7 Constellation)

## Overview
One-page dark-mode portfolio for Lucas Majerczyk, ingénieur informatique spécialité IA (Paris). Calm, night-sky aesthetic: interactive starfield with shooting stars ("faire un vœu" on click), heartbeat pulse rings behind the hero, typewriter effect, 2×2 project grid opening rich case-study modals, about + contact sections. All copy is in French.

## About the Design Files
The file in this bundle (`Ciel V7 - Constellation.dc.html`) is a **design reference created in HTML** — a prototype showing intended look and behavior, not production code to copy directly. The task is to **recreate this design in the target codebase's environment** (React, Vue, plain HTML/JS, etc.) using its established patterns — or, if no environment exists yet, pick the most appropriate stack (a single static page with vanilla JS or a small React app both work; there is no backend).

Note on the file format: it is a "Design Component" prototype — the markup lives inside an `<x-dc>` tag with `{{ hole }}` template bindings, `<sc-for>`/`<sc-if>` control flow, and a `class Component` script containing all data (projects array) and behavior (canvas, typewriter, modal, reveals). Read it as spec, not as runnable standalone HTML. `support.js` is prototype runtime only — ignore it.

## Fidelity
**High-fidelity.** Colors, typography, spacing, animation timings and copy are final and validated. Recreate pixel-perfectly.

## Design Tokens

Colors:
- Page background: `#0A0F1E` · Modal background: `#0D1426`
- Card surface: `rgba(148,163,184,0.045)` · hover surface: `rgba(148,163,184,0.09)`
- Borders: cards `rgba(148,163,184,0.22)` · hairlines/chips `rgba(148,163,184,0.30–0.34)` · section rules `rgba(148,163,184,0.32)`
- Text: `#E2E8F0` · secondary `#94A3B8` · body-soft `#CBD5E1` · muted `#64748B`
- Pastel accents: mint `#8FE3CF` (primary), lavender `#C4B5FD`, sky `#9CC7FD`, peach `#FBC8A9`
- Forbidden: acid green, saturated neons, bright orange
- Text selection: mint background, `#0A0F1E` text

Typography:
- Headings (`h1`, `h3`, project titles, big email link): **Space Grotesk** (Google Fonts, 400–700)
- Body: **Satoshi** (Fontshare, 400/500/700), fallback ui-sans-serif/system-ui
- Labels/meta (uppercase eyebrows, tags, buttons, section titles): **Geist Mono** (Google Fonts, 400/500)

Type scale (letter-spacing values are validated — do not substitute):
- Hero name H1: Space Grotesk 700, `clamp(2.7rem,7.5vw,5.4rem)`, ls `-0.02em`, lh 1.04
- Role line under name: Geist Mono 13px uppercase, ls `0.2em`, mint `#8FE3CF`
- Hero eyebrow: Geist Mono 12px uppercase, ls `0.24em` + `padding-left:0.24em` (optical centering), `#64748B`
- Section titles (PROJETS / À PROPOS / CONTACT): Geist Mono 14px, weight 400, uppercase, ls `0.3em` + `padding-left:0.3em`, `#64748B`, centered
- Project card title: Space Grotesk 600, 1.5rem, lh 1.25
- Card tag: Geist Mono 10px uppercase, ls `0.14em`, project accent color
- Pill buttons / links: Geist Mono 11px uppercase, ls `0.18em` (some `0.14em` after tuning — check file)
- Body copy: 14–15px, lh 1.6–1.7; about paragraph `clamp(1.05rem,2vw,1.25rem)`, lh 1.8
- Contact big email: Space Grotesk 600, `clamp(1.5rem,4.2vw,3rem)`, ls `-0.018em`
- Typewriter line: `clamp(1rem,2.2vw,1.35rem)`, `#94A3B8`, fixed height `2.2em` (no layout shift)

Spacing/shape:
- Sections: `padding: 110px 24px`; projects grid gap 20px; card padding 32px
- Radius: pills `999px`; cards `0 0 16px 16px` (square top — see accent rule); modal `20px 20px 0 0`

## Screens / Views (single page, anchors `#top #projets #a-propos #contact`)

### Fixed nav
`position:fixed` top, `rgba(10,15,30,0.7)` + `backdrop-filter: blur(12px)`, 1px bottom border `rgba(148,163,184,0.14)`, padding `18px 28px`. Left: logo "Lucas Majerczyk" — Space Grotesk 600, 15px, "Majerczyk" in mint... actually logo text is `Lucas <span mint>Majerczyk</span>`. Right: three links Projets / À propos / Contact, Geist Mono 11px uppercase, `#94A3B8` → white on hover.

### Hero (100svh, min 560px, all centered)
Three layers back→front:

**Layer 1 — interactive starfield canvas** (absolute inset 0, `cursor:pointer`, `aria-hidden`):
- 170 white stars `#E2E8F0`, radius 0.4–1.7px by random depth
- Twinkle: sinusoidal opacity, per-star speed 0.4–1.2, max alpha ~0.9
- Mouse parallax by depth: near stars shift up to ~26px x / ~18px y, far ones ~6px; lerp smoothing factor 0.04
- Auto shooting stars: every ~4.5s (× random 0.7–1.5), max 2 concurrent; spawn in top third, travel down-left (vx −3.2..−5.6, vy 1.6..3.0), 110px white→transparent gradient trail, 1.5px width, head dot `#F8FAFC`, ~1.5s lifetime fading out
- **"Faire un vœu"**: click anywhere in hero spawns a shooting star at click point
- devicePixelRatio capped at 2, one rAF loop, resize handler, cleanup on unmount

**Layer 2 — heartbeat rings** (centered 460×460px, max 92vw, `pointer-events:none`):
- 3 static concentric circles at inset 27% / 16% / 4%, 1px borders `rgba(148,163,184,0.20/0.15/0.10)`
- 2 pulsing rings, keyframes `scale(0.52) → scale(1.9)`, opacity 0 → 0.85 (peak at 6%) → 0.25 (at 55%) → 0, duration **3.4s**, easing `cubic-bezier(0.25,0.6,0.4,1)`
- Second ring delayed **0.45s** (lub-dub rhythm); borders 1.5px `rgba(186,201,219,0.75)` / `0.55`, glow `box-shadow: 0 0 18px rgba(148,163,184,0.18), inset 0 0 18px rgba(148,163,184,0.10)`

**Layer 3 — content** (`pointer-events:none` except buttons/links so clicks reach canvas):
- Eyebrow: `INGÉNIEUR INFORMATIQUE · SPÉCIALITÉ IA — PARIS`
- H1: `Lucas Majerczyk`
- Role line (mint, Geist Mono): `AI ENGINEER & BUSINESS DEVELOPER`
- Typewriter with blinking mint `|` cursor (blink 1.05s step-start), loops typing/deleting: « Streaming & data lakes. » → « Trading quantitatif. » → « Agents outillés. » → « ML temporel. » (type ~95ms/char, delete ~45ms, 1.6s pause when complete)
- 3 pill buttons (anchor links) Projets · À propos · Contact: bg `rgba(10,15,30,0.35)`, border `rgba(148,163,184,0.3)`; hover: white text + mint border (0.3s transitions)
- Bottom of hero, centered: `CLIQUE DANS LE CIEL POUR FAIRE UN VŒU ✦` — Geist Mono 11px uppercase, `#64748B`

### Projets (max-width 1060px)
Centered section title `PROJETS`. Grid `repeat(auto-fit,minmax(min(100%,340px),1fr))` (2×2 desktop, 1 col mobile), gap 20px. Each card is a `<button>` opening a modal:
- **V7 signature: 2px top border in the project's accent color**, other borders 1px `rgba(148,163,184,0.22)`, radius `0 0 16px 16px`, bg `rgba(148,163,184,0.045)`, padding 32px, flex column gap 14px
- Hover: `translateY(-3px)` + bg `rgba(148,163,184,0.09)` (0.4s transitions)
- Contents: accent tag (uppercase 10px mono) → title (1.5rem) → short description (14px `#94A3B8`) → 3 metric chips (11px, bg `rgba(148,163,184,0.10)`, border `rgba(148,163,184,0.30)`, `#CBD5E1`, pill) → `ÉTUDE DE CAS →` in accent, pushed to bottom (`margin-top:auto`)

### Case-study modal
Overlay `rgba(4,7,16,0.72)` + blur 8px, `role="dialog" aria-modal="true"`, closes on outside click / ✕ button / Escape; body scroll locked while open. Panel: `#0D1426`, border 1px, `max-width:42rem`, `max-height:88svh` scrollable, docked to bottom (`align-items:flex-end`), radius `20px 20px 0 0`, padding `40px 36px`. Contents: tag, H3 title (1.7rem), description, detail bullets as flex rows with accent `●`, "STACK" label + chips, external-link pill button in accent color if the project has one (hover: filled accent, dark text).

### À propos
1px top+bottom section borders `rgba(148,163,184,0.32)`. Centered, max-width 48rem, padding 110px 24px. Title `À PROPOS`, paragraph:
« En diplôme d'ingénieur en informatique, spécialité IA, je travaille à l'intersection du machine learning et de l'ingénierie logicielle : streaming distribué, trading quantitatif, agents outillés. Ce qui m'intéresse, c'est ce qui tient en production — pas seulement en notebook. »
Skill chips (same chip style, uppercase): Python · Scala · Kafka · Spark · FastAPI · React · ML temporel · Agents IA.

### Contact (footer)
Centered. Title `CONTACT`, hook « Un projet, un stage, une question ? Parlons-en. » (500, `clamp(1.1rem,2.4vw,1.5rem)`).
**V7 signature: giant email link** `lucas.majerczyk@gmail.com` — Space Grotesk 600, `clamp(1.5rem,4.2vw,3rem)`, mint bottom border `rgba(143,227,207,0.4)`, hover text mint. Then pill buttons `GITHUB ↗` → https://github.com/NCH04 and `LINKEDIN ↗` → https://www.linkedin.com/in/lucas-majerczyk/ (border `rgba(148,163,184,0.45)`, hover white text + mint border). Bottom: `© 2026 · LUCAS MAJERCZYK` (Geist Mono 11px uppercase, `#64748B`).

## Exact project data (4 projects — copy verbatim, no invented data)

**1. FreightPulse** — accent mint `#8FE3CF` — tag « Data engineering · Streaming »
- Short: « Plateforme IoT temps réel pour conteneurs frigorifiques : télémétrie toutes les 30 s, alertes SMS basse latence, data lake Bronze/Silver/Gold. »
- Metrics: 5 composants Scala · Kafka · Spark · Redis · MinIO · Alertes basse latence
- Details: (1) Une flotte simulée d'appareils émet température, humidité, salinité et GPS toutes les 30 secondes vers Kafka. (2) Sélecteur d'alertes : consumer Kafka croisé avec des seuils stockés dans Redis, publication sur un topic dédié freight-alerts, notification « SMS » en aval. (3) Data lake médaillon sur MinIO : trois jobs Spark distincts (Ingest → Bronze, Silver, Gold), puis analyse batch répondant à 4 questions métier. (4) Choix d'architecture assumé : 5 projets sbt totalement indépendants (5 build.sbt, 5 Main), exécutables isolément, sans Docker — Kafka, Redis et MinIO tournent nativement.
- Stack: Scala, Kafka, Spark, Redis, MinIO (S3), sbt
- Link: « DEPLOYMENT.md sur GitHub » → https://github.com/NCH04/freightpulse-/blob/main/DEPLOYMENT.md

**2. IMC Trading Competition 2026** — accent lavender `#C4B5FD` — tag « Trading quantitatif »
- Short: « Deux compétitions en une : un Qualifier conclu #6 en France, puis une Finale — un pari Black-Scholes exposé, et un pivot Round 5 vers l'arbitrage structurel. »
- Metrics: #6 France (Qualifier) · Options · IV smile · Pivot stratégique R5
- Details: (1) Format en deux temps : Qualifier (R1+R2) puis Finale (R3+R4+R5) avec remise à zéro du classement. (2) Qualifier solide terminé 6e en France sur des stratégies de market making et de suivi de signal. (3) La Finale a introduit un nouvel univers d'options : mon pari fondé sur Black-Scholes et le smile de volatilité implicite s'est retrouvé sans garde-fou face au régime réel du marché. (4) Round 5 : pivot vers l'arbitrage structurel entre produits liés — l'approche qui a enfin cliqué, et la vraie leçon du tournoi : la robustesse bat l'élégance théorique.
- Stack: Python, Black-Scholes, Market making, Arbitrage — no external link

**3. Mitsui Commodity Prediction** — accent sky `#9CC7FD` — tag « Machine learning · Séries temporelles »
- Short: « Soumission finale au challenge Kaggle : prédire les mouvements de 424 cibles financières multi-actifs à partir de séries temporelles historiques. »
- Metrics: 424 cibles · Anti look-ahead bias · Validation walk-forward
- Details: (1) Données financières intrinsèquement bruitées : l'approche privilégie la stabilité du signal plutôt que la performance de backtest. (2) Prévention systématique du look-ahead bias à chaque étape du feature engineering. (3) Extraction de signaux cross-asset stables entre classes d'actifs (métaux, énergie, FX…). (4) Pipeline de validation robuste conçu pour limiter l'overfitting temporel — le vrai différenciateur sur ce type de compétition.
- Stack: Python, Gradient boosting, Feature engineering, Validation temporelle
- Link: « Compétition sur Kaggle » → https://www.kaggle.com/competitions/mitsui-commodity-prediction-challenge

**4. Signalement citoyen urbain** — accent peach `#FBC8A9` — tag « Full-stack · Agent IA »
- Short: « Application complète (FastAPI + React) : un citoyen photographie une dégradation urbaine, un agent IA en évalue la gravité en croisant le contexte OpenStreetMap. »
- Metrics: Classification d'image · Agent + tool calling · Contexte géo OSM
- Details: (1) Upload photo + coordonnées GPS du dégât constaté par le citoyen. (2) Classification automatique du type de dégradation à partir de l'image. (3) Un agent IA évalue ensuite la gravité : il croise le type de dégât avec le contexte géographique (proximité d'une école, d'un axe passant…) obtenu via tool calling sur OpenStreetMap. (4) Le projet démontre la chaîne complète : produit web, modèle de vision, et raisonnement agentique outillé.
- Stack: FastAPI, React, Agent IA, Tool calling, OpenStreetMap — no external link

## Interactions & Behavior
- Anchor navigation with smooth scroll (`scroll-behavior:smooth`)
- Card click → open modal (state: selected project index or null); lock `body { overflow:hidden }` while open; Escape/outside-click/✕ close it
- Canvas click → spawn shooting star at pointer position
- Scroll reveal: each section/card fades in + `translateY(22px→0)`, 0.8s ease, IntersectionObserver at 15% threshold, once only; the 4 project cards cascade +100ms each
- Hover states as listed per component; no other animation (no 3D tilt, no animated gradients, no hover:scale)
- `prefers-reduced-motion: reduce`: disable ALL animations — pulse rings, typewriter (show first word statically), reveals, canvas becomes a static starfield (single draw, no shooting stars)

## State Management
- `modalIndex: number | null`
- Canvas internals (stars, shooters, lerped mouse) live outside React state — refs + one rAF loop
- Typewriter driven by timeouts on a ref'd span (not state) to avoid re-renders
- No data fetching; all content static

## Responsive
- Impeccable down to 360px: hero readable, grid 1 column, modal full-width docked to bottom, ring container max 92vw
- No layout shift: typewriter line has fixed 2.2em height

## Accessibility
- Visible keyboard focus; modal `role="dialog" aria-modal="true"` + Escape; canvas `aria-hidden="true"`; sufficient contrast throughout

## Assets
No images. Fonts only: Space Grotesk + Geist Mono (Google Fonts), Satoshi (Fontshare). The `✦` and `●` glyphs are plain text characters.

## Files
- `Ciel V7 - Constellation.dc.html` — the validated design reference (all markup, styles, data and behavior)
- `support.js` — prototype runtime, ignore

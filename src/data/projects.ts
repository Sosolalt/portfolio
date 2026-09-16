import type { Project } from '@/types';

/**
 * The projects. The first four are copied verbatim from the design handoff;
 * anything appended after them follows the same shape and the same voice.
 *
 * This copy is validated French content — do not paraphrase, re-order, fix
 * typography or "improve" it. Metrics are always three per project; details
 * always four.
 */
export const projects: readonly Project[] = [
  {
    id: 'freightpulse',
    title: 'FreightPulse',
    accent: '#8FE3CF',
    tag: 'Data engineering · Streaming',
    short:
      'Plateforme IoT temps réel pour conteneurs frigorifiques : télémétrie toutes les 30 s, alertes SMS basse latence, data lake Bronze/Silver/Gold.',
    metrics: ['5 composants Scala', 'Kafka · Spark · Redis · MinIO', 'Alertes basse latence'],
    details: [
      "Une flotte simulée d'appareils émet température, humidité, salinité et GPS toutes les 30 secondes vers Kafka.",
      "Sélecteur d'alertes : consumer Kafka croisé avec des seuils stockés dans Redis, publication sur un topic dédié freight-alerts, notification « SMS » en aval.",
      'Data lake médaillon sur MinIO : trois jobs Spark distincts (Ingest → Bronze, Silver, Gold), puis analyse batch répondant à 4 questions métier.',
      "Choix d'architecture assumé : 5 projets sbt totalement indépendants (5 build.sbt, 5 Main), exécutables isolément, sans Docker — Kafka, Redis et MinIO tournent nativement.",
    ],
    stack: ['Scala', 'Kafka', 'Spark', 'Redis', 'MinIO (S3)', 'sbt'],
    link: {
      label: 'DEPLOYMENT.md sur GitHub',
      href: 'https://github.com/NCH04/freightpulse-/blob/main/DEPLOYMENT.md',
    },
  },
  {
    id: 'imc-trading-2026',
    title: 'IMC Trading Competition 2026',
    accent: '#C4B5FD',
    tag: 'Trading quantitatif',
    short:
      "Deux compétitions en une : un Qualifier conclu #6 en France, puis une Finale — un pari Black-Scholes exposé, et un pivot Round 5 vers l'arbitrage structurel.",
    metrics: ['#6 France (Qualifier)', 'Options · IV smile', 'Pivot stratégique R5'],
    details: [
      'Format en deux temps : Qualifier (R1+R2) puis Finale (R3+R4+R5) avec remise à zéro du classement.',
      'Qualifier solide terminé 6e en France sur des stratégies de market making et de suivi de signal.',
      "La Finale a introduit un nouvel univers d'options : mon pari fondé sur Black-Scholes et le smile de volatilité implicite s'est retrouvé sans garde-fou face au régime réel du marché.",
      "Round 5 : pivot vers l'arbitrage structurel entre produits liés — l'approche qui a enfin cliqué, et la vraie leçon du tournoi : la robustesse bat l'élégance théorique.",
    ],
    stack: ['Python', 'Black-Scholes', 'Market making', 'Arbitrage'],
    link: null,
  },
  {
    id: 'mitsui-commodity-prediction',
    title: 'Mitsui Commodity Prediction',
    accent: '#9CC7FD',
    tag: 'Machine learning · Séries temporelles',
    short:
      'Soumission finale au challenge Kaggle : prédire les mouvements de 424 cibles financières multi-actifs à partir de séries temporelles historiques.',
    metrics: ['424 cibles', 'Anti look-ahead bias', 'Validation walk-forward'],
    details: [
      "Données financières intrinsèquement bruitées : l'approche privilégie la stabilité du signal plutôt que la performance de backtest.",
      'Prévention systématique du look-ahead bias à chaque étape du feature engineering.',
      "Extraction de signaux cross-asset stables entre classes d'actifs (métaux, énergie, FX…).",
      "Pipeline de validation robuste conçu pour limiter l'overfitting temporel — le vrai différenciateur sur ce type de compétition.",
    ],
    stack: ['Python', 'Gradient boosting', 'Feature engineering', 'Validation temporelle'],
    link: {
      label: 'Compétition sur Kaggle',
      href: 'https://www.kaggle.com/competitions/mitsui-commodity-prediction-challenge',
    },
  },
  {
    id: 'signalement-citoyen-urbain',
    title: 'Signalement citoyen urbain',
    accent: '#FBC8A9',
    tag: 'Full-stack · Agent IA',
    short:
      'Application complète (FastAPI + React) : un citoyen photographie une dégradation urbaine, un agent IA en évalue la gravité en croisant le contexte OpenStreetMap.',
    metrics: ["Classification d'image", 'Agent + tool calling', 'Contexte géo OSM'],
    details: [
      'Upload photo + coordonnées GPS du dégât constaté par le citoyen.',
      "Classification automatique du type de dégradation à partir de l'image.",
      "Un agent IA évalue ensuite la gravité : il croise le type de dégât avec le contexte géographique (proximité d'une école, d'un axe passant…) obtenu via tool calling sur OpenStreetMap.",
      'Le projet démontre la chaîne complète : produit web, modèle de vision, et raisonnement agentique outillé.',
    ],
    stack: ['FastAPI', 'React', 'Agent IA', 'Tool calling', 'OpenStreetMap'],
    link: null,
  },
  {
    id: 'encheres-combinatoires-vcg',
    title: 'Enchères combinatoires & VCG',
    accent: '#8FE3CF',
    tag: 'Optimisation combinatoire · Enchères',
    short:
      'Deux solveurs exacts — CP-SAT et PLNE — pour le Winner Determination Problem en enchères combinatoires, étendus au mécanisme VCG pour le calcul des paiements.',
    metrics: ['CP-SAT vs PLNE', '18 instances CATS', '45 tests automatisés'],
    details: [
      'Modélisation du Winner Determination Problem en Set Packing : un item attribué à au plus une offre gagnante, plafonds de budget global et par soumissionnaire, groupes XOR par soumissionnaire.',
      "Deux solveurs exacts confrontés sur les mêmes instances — CP-SAT (OR-Tools) et PLNE (PuLP/CBC) — sur 20 benchmarks synthétiques et 18 instances CATS officielles, avec mesure du gap d'intégralité par relaxation linéaire.",
      "Extension au mécanisme VCG, séparé en deux régimes : canonique (véracité dominante, rationalité individuelle, efficacité) et sous contrainte de budget, où la véracité tombe — démonstration algébrique et contre-exemple numérique de manipulation à l'appui.",
      "Rôle de tech lead sur une équipe de trois : solveurs, VCG et intégration, plus la tenue du dépôt — issues tracées avec critères d'acceptation, feature branches, relecture croisée sur chaque PR.",
    ],
    stack: ['Python', 'OR-Tools CP-SAT', 'PuLP / CBC', 'VCG', 'pytest', 'Jupyter'],
    link: null,
  },
  {
    id: 'cautela-ma-gatekeeper',
    title: 'Cautela — M&A Gatekeeper',
    accent: '#FBC8A9',
    tag: 'Agents LLM · Observabilité',
    short:
      'Revue de contrats de fusion-acquisition par agents : chaque signalement remonte à la clause dont il vient, chaque verdict à sa trace Arize Phoenix.',
    metrics: ['7 classifieurs en parallèle', 'Gemini · ADK · Phoenix', '571 tests Python'],
    details: [
      "Chaîne d'agents Google ADK : extraction des clauses d'un Exhibit 2.1 via Gemini Files API, fan-out de 7 classifieurs en parallèle (clause MAC, changement de contrôle, anti-cession, vesting, exclusivité, cession d'IP, non-concurrence), résolution des renvois de définitions, puis un juge de risque qui cite ses passages verbatim.",
      "Le routeur qui tranche entre validation automatique, escalade et blocage est du Python déterministe, jamais un LLM — et un verdict n'est auto-validé que si deux évaluateurs indépendants, hallucination et fidélité, passent tous les deux.",
      "Dix points d'accroche Arize Phoenix : traces OpenInference, LLM-as-judge en ligne, annotations de spans, dataset de régression auto-alimenté. Un verdict bloquant s'ouvre sur son prompt, sa réponse, son score d'évaluateur et son span.",
      "Boucle d'amélioration nocturne sous double garde-fou : une modification de prompt n'est promue que si elle franchit un intervalle de confiance par bootstrap apparié et ne régresse pas sur un fold gelé. Les bornes basses publiées sont les pires cas, pas les meilleurs.",
    ],
    stack: ['Python', 'Gemini', 'Google ADK', 'Arize Phoenix', 'FastAPI', 'Next.js'],
    link: {
      label: 'Dépôt sur GitHub',
      href: 'https://github.com/Sosolalt/Cautela',
    },
  },
];

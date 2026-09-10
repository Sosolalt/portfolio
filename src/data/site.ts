/**
 * Static site content: everything outside the four projects.
 *
 * Copy is validated French from the design handoff. Strings are stored in
 * natural case — the uppercase look of eyebrows, section titles and pill
 * buttons comes from `text-transform: uppercase` in CSS, so that screen
 * readers and copy/paste get properly cased text.
 *
 * Two strings below contain a literal U+00A0 non-breaking space, required by
 * French typography before `:` and `?`. Do not replace it with a plain space.
 */

export interface NavLink {
  readonly label: string;
  /** In-page anchor, e.g. `#projets`. */
  readonly href: string;
}

/**
 * Interface strings that have no counterpart in the design handoff — the
 * handoff shows no skip link and gives the nav no accessible name. Both are
 * required for accessibility, so the copy is authored here rather than being
 * buried in a component.
 */
export const ui = {
  navLabel: 'Navigation principale',
  skipToContent: 'Aller au contenu',
} as const;

export const navLinks: readonly NavLink[] = [
  { label: 'Projets', href: '#projets' },
  { label: 'À propos', href: '#a-propos' },
  { label: 'Contact', href: '#contact' },
];

export const hero = {
  eyebrow: 'Ingénieur informatique · Spécialité IA — Paris',
  /** Rendered as two nodes so "Majerczyk" can be tinted mint in the nav logo. */
  firstName: 'Lucas',
  lastName: 'Majerczyk',
  name: 'Lucas Majerczyk',
  role: 'AI Engineer & Business Developer',
  /** Cycled by the typewriter, in order, looping forever. */
  typewriterWords: [
    'Streaming & data lakes.',
    'Trading quantitatif.',
    'Agents outillés.',
    'ML temporel.',
  ] as const,
  wishHint: 'clique dans le ciel pour faire un vœu ✦',
} as const;

export const projectsSection = {
  title: 'Projets',
  /** Card call-to-action. The `→` is decorative and marked aria-hidden. */
  cta: 'Étude de cas',
  /** Accessible name for a card, e.g. « Étude de cas : FreightPulse ». */
  cardLabel: (projectTitle: string) => `Étude de cas : ${projectTitle}`,
  stackLabel: 'Stack',
  closeLabel: 'Fermer',
} as const;

export const about = {
  title: 'À propos',
  paragraph:
    "En diplôme d'ingénieur en informatique, spécialité IA, je travaille à l'intersection du machine learning et de l'ingénierie logicielle : streaming distribué, trading quantitatif, agents outillés. Ce qui m'intéresse, c'est ce qui tient en production — pas seulement en notebook.",
  skills: [
    'Python',
    'Scala',
    'Kafka',
    'Spark',
    'FastAPI',
    'React',
    'ML temporel',
    'Agents IA',
  ] as const,
} as const;

export const contact = {
  title: 'Contact',
  hook: 'Un projet, un stage, une question ? Parlons-en.',
  email: 'lucas.majerczyk@gmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/NCH04' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lucas-majerczyk/' },
  ],
  copyright: '© 2026 · Lucas Majerczyk',
} as const;

export const site = {
  title: 'Lucas Majerczyk — Portfolio',
  description:
    'Portfolio de Lucas Majerczyk, ingénieur informatique spécialité IA à Paris : data engineering, trading quantitatif, machine learning temporel et agents IA.',
  url: 'https://lucasmajerczyk.com',
  locale: 'fr_FR',
} as const;

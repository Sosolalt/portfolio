/**
 * Static site content: everything outside the projects.
 *
 * Copy is validated French from the design handoff. Strings are stored in
 * natural case — the uppercase look of the tags, pill buttons and mono labels
 * comes from `text-transform: uppercase` in CSS, so that screen readers and
 * copy/paste get properly cased text.
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
  /** Rendered as two nodes so "Majerczyk" can be tinted mint in the nav logo. */
  firstName: 'Lucas',
  lastName: 'Majerczyk',
  name: 'Lucas Majerczyk',
  /**
   * The single line the hero leads with. The longer job title below is not
   * displayed — it belongs to the document metadata in `index.html`, which
   * cannot import from here and therefore repeats it.
   */
  title: 'AI Engineer',
  where: 'Paris',
  role: 'AI Engineer & Business Developer',
  /** Cycled by the rotator, in order, looping forever. */
  phrases: [
    'Streaming & data lakes.',
    'Trading quantitatif.',
    'Agents outillés.',
    'ML temporel.',
    'Optimisation sous contrainte.',
  ] as const,
  /** The two next steps under the profile; the first one is the primary action. */
  actions: [
    { label: 'Projets', href: '#projets' },
    { label: 'Contact', href: '#contact' },
  ] as const,
  /** The `✦` of the handoff is drawn as an SVG star by the component. */
  wishHint: 'clique dans le ciel pour faire un vœu',
} as const;

export const projectsSection = {
  title: 'Projets',
  /** Ledger row call-to-action. The arrow next to it is a decorative SVG. */
  cta: 'Étude de cas',
  /** Accessible name for a row, e.g. « Étude de cas : FreightPulse ». */
  rowLabel: (projectTitle: string) => `Étude de cas : ${projectTitle}`,
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
  url: 'https://sosolalt.github.io/portfolio',
  locale: 'fr_FR',
} as const;

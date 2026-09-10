/**
 * Shared domain types for the portfolio.
 *
 * Content is entirely static (no backend, no fetching) — these types describe
 * the shape of the data hard-coded in `src/data/`.
 */

/** The four validated pastel accents. No other accent colour may be introduced. */
export type AccentColor = '#8FE3CF' | '#C4B5FD' | '#9CC7FD' | '#FBC8A9';

/** An outbound link shown as a pill button at the bottom of a case-study modal. */
export interface ProjectLink {
  /** Visible label. The `↗` affordance is appended by the component, not stored here. */
  readonly label: string;
  readonly href: string;
}

/** One project: a card in the grid and, when opened, a case-study modal. */
export interface Project {
  /** Stable identifier, used for React keys and for e2e selectors. */
  readonly id: string;
  readonly title: string;
  readonly accent: AccentColor;
  /** Uppercased by CSS — stored in natural case. */
  readonly tag: string;
  /** Short description shown on the card and at the top of the modal. */
  readonly short: string;
  /** Exactly three chips on the card. */
  readonly metrics: readonly string[];
  /** Case-study bullets, rendered with an accent `●` marker. */
  readonly details: readonly string[];
  readonly stack: readonly string[];
  /** `null` when the project has no public link. */
  readonly link: ProjectLink | null;
}

import type { ReactElement } from 'react';
import styles from './Icon.module.css';

/**
 * The five drawn marks of the Orbite variant.
 *
 * The handoff's `→ ↗ ✕ ✦` are text glyphs; drawn strokes read as intentional
 * where a glyph reads as filler, and they inherit `currentColor` and the
 * surrounding font size. Still no icon library: these are four `<path>`s.
 */
export type IconName = 'arrow' | 'external' | 'close' | 'star';

const PATHS: Record<IconName, ReactElement> = {
  arrow: <path d="M2.5 8h11M9.5 4l4 4-4 4" />,
  external: <path d="M4 12 12 4M6.5 4H12v5.5" />,
  close: <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />,
  star: (
    <path
      d="M8 1.5C8.6 5.2 10.8 7.4 14.5 8 10.8 8.6 8.6 10.8 8 14.5 7.4 10.8 5.2 8.6 1.5 8 5.2 7.4 7.4 5.2 8 1.5Z"
      fill="currentColor"
      stroke="none"
    />
  ),
};

export interface IconProps {
  readonly name: IconName;
  /**
   * Extra module class, for the few icons that need their own size or colour.
   * `undefined` is admitted because a CSS-module lookup is typed as possibly
   * missing under `noUncheckedIndexedAccess`.
   */
  readonly className?: string | undefined;
}

/**
 * Always decorative: every icon here sits next to its own label, so it is
 * hidden from assistive tech and taken out of the tab order.
 */
export function Icon({ name, className }: IconProps): ReactElement {
  return (
    <svg
      className={className === undefined ? styles.icon : `${styles.icon} ${className}`}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

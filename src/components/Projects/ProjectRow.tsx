import { Fragment } from 'react';
import type { CSSProperties } from 'react';
import type { Project } from '@/types';
import { projectsSection } from '@/data/site';
import { Icon } from '@/components/Icon/Icon';
import { useReveal } from '@/hooks/useReveal';
import styles from './ProjectRow.module.css';

/** Mirrors `--reveal-cascade-step` in `tokens.css`; the delay is applied from JS. */
const CASCADE_STEP_MS = 100;

export interface ProjectRowProps {
  readonly project: Project;
  /** Position in the ledger — drives both the cascade delay and the modal it opens. */
  readonly index: number;
  readonly onOpen: (index: number) => void;
}

/**
 * One project as a full-width ruled row.
 *
 * A ledger rather than a grid of bordered cards: the projects differ in
 * length, and a register lets each one take the room it needs while the rules
 * keep the page on one axis. The project's accent is the hairline that draws
 * itself across the top edge on hover.
 *
 * Everything inside the `<button>` is a `<span>`: a button's content model is
 * phrasing content only, and the flex column blockifies them anyway.
 */
export function ProjectRow({ project, index, onOpen }: ProjectRowProps) {
  const ref = useReveal<HTMLButtonElement>({ delayMs: index * CASCADE_STEP_MS });

  return (
    <button
      ref={ref}
      type="button"
      className={styles.row}
      style={{ '--accent': project.accent } as CSSProperties}
      // Read verbatim, the row is a paragraph-long wall of text. This names the
      // control by what it does and to which project, and still contains the
      // visible "Étude de cas" label so speech control keeps working.
      aria-label={projectsSection.rowLabel(project.title)}
      onClick={() => {
        onOpen(index);
      }}
    >
      <span className={styles.tag}>{project.tag}</span>
      <span className={styles.title}>{project.title}</span>
      <span className={styles.short}>{project.short}</span>

      {/* One mono line rather than three bordered chips: the metrics are read
          together, and the pills were the same "generated" tell everywhere. */}
      <span className={styles.metrics}>
        {project.metrics.map((metric, metricIndex) => (
          <Fragment key={metric}>
            {metricIndex > 0 && (
              <span className={styles.separator} aria-hidden="true">
                ·
              </span>
            )}
            <span>{metric}</span>
          </Fragment>
        ))}
      </span>

      <span className={styles.cta}>
        {projectsSection.cta}
        <Icon name="arrow" className={styles.ctaIcon} />
      </span>
    </button>
  );
}

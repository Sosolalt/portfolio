import type { CSSProperties } from 'react';
import type { Project } from '@/types';
import { projectsSection } from '@/data/site';
import { useReveal } from '@/hooks/useReveal';
import styles from './ProjectCard.module.css';

/** Mirrors `--reveal-cascade-step` in `tokens.css`; the delay is applied from JS. */
const CASCADE_STEP_MS = 100;

export interface ProjectCardProps {
  readonly project: Project;
  /** Position in the grid — drives both the cascade delay and the modal it opens. */
  readonly index: number;
  readonly onOpen: (index: number) => void;
}

/**
 * One project as a clickable card.
 *
 * Everything inside the `<button>` is a `<span>`: a button's content model is
 * phrasing content only, and the flex column blockifies them anyway.
 */
export function ProjectCard({ project, index, onOpen }: ProjectCardProps) {
  const ref = useReveal<HTMLButtonElement>({ delayMs: index * CASCADE_STEP_MS });

  return (
    <button
      ref={ref}
      type="button"
      className={styles.card}
      style={{ '--accent': project.accent } as CSSProperties}
      // Read verbatim, the card is a paragraph-long wall of text. This names the
      // control by what it does and to which project, and still contains the
      // visible "Étude de cas" label so speech control keeps working.
      aria-label={projectsSection.cardLabel(project.title)}
      onClick={() => {
        onOpen(index);
      }}
    >
      <span className={styles.tag}>{project.tag}</span>
      <span className={styles.title}>{project.title}</span>
      <span className={styles.short}>{project.short}</span>
      <span className={styles.metrics}>
        {project.metrics.map((metric) => (
          <span key={metric} className={styles.chip}>
            {metric}
          </span>
        ))}
      </span>
      {/* The arrow needs no aria-hidden: `aria-label` above already replaces
          this button's inner text as its accessible name. */}
      <span className={styles.cta}>{projectsSection.cta} →</span>
    </button>
  );
}

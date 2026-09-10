import { useId } from 'react';
import { projects } from '@/data/projects';
import { projectsSection } from '@/data/site';
import { useReveal } from '@/hooks/useReveal';
import { ProjectCard } from './ProjectCard';
import styles from './Projects.module.css';

export interface ProjectsProps {
  /** Receives the index into `projects`; `App` owns the open/closed state. */
  readonly onOpenProject: (index: number) => void;
}

/** The 2×2 project grid (one column below 340px of usable width). */
export function Projects({ onOpenProject }: ProjectsProps) {
  const titleId = useId();
  const titleRef = useReveal<HTMLHeadingElement>();

  return (
    <section id="projets" className={styles.section} aria-labelledby={titleId}>
      <h2 id={titleId} ref={titleRef} className={styles.title}>
        {projectsSection.title}
      </h2>

      <div className={styles.grid}>
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} onOpen={onOpenProject} />
        ))}
      </div>
    </section>
  );
}

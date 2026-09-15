import { useId } from 'react';
import { projects } from '@/data/projects';
import { projectsSection } from '@/data/site';
import { useReveal } from '@/hooks/useReveal';
import { ProjectRow } from './ProjectRow';
import styles from './Projects.module.css';

export interface ProjectsProps {
  /** Receives the index into `projects`; `App` owns the open/closed state. */
  readonly onOpenProject: (index: number) => void;
}

/** The projects as one full-width ledger, on the page's centre axis. */
export function Projects({ onOpenProject }: ProjectsProps) {
  const titleId = useId();
  const titleRef = useReveal<HTMLHeadingElement>();

  return (
    <section id="projets" className="section" aria-labelledby={titleId}>
      <div className="sectionGrid">
        <div className="sectionLabel">
          <h2 id={titleId} ref={titleRef}>
            {projectsSection.title}
          </h2>
        </div>

        <ul className={styles.ledger} role="list">
          {projects.map((project, index) => (
            <li key={project.id}>
              <ProjectRow project={project} index={index} onOpen={onOpenProject} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

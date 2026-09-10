import { useId } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { about } from '@/data/site';
import styles from './About.module.css';

export function About() {
  const titleId = useId();
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <section id="a-propos" className="section" aria-labelledby={titleId}>
      <div className="sectionGrid">
        <div className="sectionLabel">
          <h2 id={titleId}>{about.title}</h2>
        </div>

        <div ref={revealRef} className={styles.body}>
          <p className={styles.paragraph}>{about.paragraph}</p>

          {/* Still a list — the separators are drawn by CSS, so the semantics
              survive the one-line mono setting. */}
          <ul className={styles.skills} role="list">
            {about.skills.map((skill) => (
              <li key={skill} className={styles.skill}>
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

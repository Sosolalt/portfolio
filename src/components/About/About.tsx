import { useReveal } from '@/hooks/useReveal';
import { about } from '@/data/site';
import styles from './About.module.css';

export function About() {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <section id="a-propos" className={styles.section}>
      <div ref={revealRef} className={styles.inner}>
        <h2 className={styles.title}>{about.title}</h2>
        <p className={styles.paragraph}>{about.paragraph}</p>

        <ul className={styles.skills} role="list">
          {about.skills.map((skill) => (
            <li key={skill} className={styles.skill}>
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { hero, navLinks } from '@/data/site';
import { Starfield } from './Starfield';
import { PulseRings } from './PulseRings';
import { Typewriter } from './Typewriter';
import styles from './Hero.module.css';

/**
 * Three stacked layers, back to front: the interactive starfield, the
 * heartbeat rings, and the centred content.
 *
 * The content layer is `pointer-events:none` — restored only on the three
 * pills — so that a click anywhere else in the hero falls through to the
 * canvas below and makes a wish.
 */
export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <Starfield />
      <PulseRings />

      <div className={styles.content}>
        <p className={styles.eyebrow}>{hero.eyebrow}</p>
        <h1 className={styles.name}>{hero.name}</h1>
        <p className={styles.role}>{hero.role}</p>

        <Typewriter />

        <div className={styles.pills}>
          {navLinks.map((link) => (
            <a key={link.href} className={styles.pill} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <p className={styles.hint}>{hero.wishHint}</p>
    </section>
  );
}

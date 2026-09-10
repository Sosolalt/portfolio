import { hero } from '@/data/site';
import { Icon } from '@/components/Icon/Icon';
import { Starfield } from './Starfield';
import { PulseRings } from './PulseRings';
import { Rotator } from './Rotator';
import styles from './Hero.module.css';

/**
 * Three stacked layers, back to front: the interactive starfield, the
 * heartbeat rings, and the centred content.
 *
 * The content layer is `pointer-events:none` — restored only on the two action
 * pills — so that a click anywhere else in the hero falls through to the
 * canvas below and makes a wish.
 *
 * Orbite states one thing at a time: the name, the job title, the city, the
 * rotating field, then the next step. The long "Ingénieur informatique ·
 * Spécialité IA — Paris" line of the original said the same as the title twice.
 */
export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <Starfield />
      <PulseRings />

      <div className={styles.content}>
        {/* The name rises out of a clipping window: the one scripted entrance
            in the page, instead of the same fade repeated on every section. */}
        <h1 className={styles.name}>
          <span className={styles.line}>
            <span className={styles.lineIn}>{hero.name}</span>
          </span>
        </h1>

        <p className={styles.title}>{hero.title}</p>
        <p className={styles.where}>{hero.where}</p>

        <Rotator />

        <div className={styles.actions}>
          {hero.actions.map((action, index) => (
            <a
              key={action.href}
              className={index === 0 ? `${styles.pill} ${styles.pillPrimary}` : styles.pill}
              href={action.href}
            >
              {action.label}
              {index === 0 && <Icon name="arrow" className={styles.pillIcon} />}
            </a>
          ))}
        </div>
      </div>

      <p className={styles.hint}>
        <Icon name="star" className={styles.hintIcon} />
        {hero.wishHint}
      </p>
    </section>
  );
}

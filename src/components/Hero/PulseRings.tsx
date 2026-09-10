import styles from './PulseRings.module.css';

/**
 * The heartbeat behind the hero: three still circles plus two expanding ones,
 * the second offset by 0.45s to give the lub-dub. Purely decorative, and never
 * in the way of a click meant for the starfield.
 */
export function PulseRings() {
  return (
    <div className={styles.layer} aria-hidden="true">
      <div className={styles.field}>
        <div className={styles.ringOuter} />
        <div className={styles.ringMiddle} />
        <div className={styles.ringInner} />
        <div className={`${styles.pulse} ${styles.pulseLub}`} />
        <div className={`${styles.pulse} ${styles.pulseDub}`} />
      </div>
    </div>
  );
}

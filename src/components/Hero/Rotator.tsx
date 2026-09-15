import { hero } from '@/data/site';
import { useRotator } from '@/hooks/useRotator';
import styles from './Rotator.module.css';

/**
 * The hero phrases, one at a time, with a mint rule counting the beat.
 *
 * The animated stack is hidden from assistive tech — a node whose visible text
 * swaps every 3.2s is noise, not information. A visually hidden sibling
 * carries every phrase as static text instead, so a screen reader gets the
 * complete content in one calm read, identical whether or not motion is
 * reduced.
 */
export function Rotator() {
  const { listRef, timerRef } = useRotator();

  return (
    <>
      <div ref={listRef} className={styles.rotator} aria-hidden="true">
        {hero.phrases.map((phrase, index) => (
          // The first phrase is up from the first paint; the hook moves the rest.
          <span key={phrase} className={index === 0 ? `${styles.phrase} is-in` : styles.phrase}>
            {phrase}
          </span>
        ))}
      </div>

      <span className="srOnly">{hero.phrases.join(' ')}</span>

      <span ref={timerRef} className={styles.timer} aria-hidden="true" />
    </>
  );
}

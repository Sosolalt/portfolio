import { hero } from '@/data/site';
import { useTypewriter } from '@/hooks/useTypewriter';
import styles from './Typewriter.module.css';

/**
 * The looping hero line, with its blinking mint caret.
 *
 * The animated span is hidden from assistive tech — a node whose text changes
 * every 45ms is noise, not information. A visually hidden sibling carries all
 * four phrases as static text instead, so a screen reader gets the complete
 * content in one calm read, identical whether or not motion is reduced.
 */
export function Typewriter() {
  const textRef = useTypewriter(hero.typewriterWords);

  return (
    <div className={styles.row}>
      <span ref={textRef} className={styles.text} aria-hidden="true" />
      <span className="srOnly">{hero.typewriterWords.join(' ')}</span>
      <span className={styles.cursor} aria-hidden="true">
        |
      </span>
    </div>
  );
}

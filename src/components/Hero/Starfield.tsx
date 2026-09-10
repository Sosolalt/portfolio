import { useStarfield } from '@/hooks/useStarfield';
import styles from './Starfield.module.css';

/**
 * Hero layer 1. Purely decorative, hence `aria-hidden` and no keyboard
 * affordance: the wish is a delight, not a feature anyone must be able to
 * reach. Sits behind the content layer, which is `pointer-events:none` so
 * that clicks land here.
 */
export function Starfield() {
  const { canvasRef, onClick } = useStarfield();

  return <canvas ref={canvasRef} className={styles.canvas} onClick={onClick} aria-hidden="true" />;
}

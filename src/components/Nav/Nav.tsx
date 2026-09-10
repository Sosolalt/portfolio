import { hero, navLinks, ui } from '@/data/site';
import { useScrolledPast } from '@/hooks/useScrolledPast';
import styles from './Nav.module.css';

/** Past this many pixels the bar takes a solid background and a hairline. */
const SCROLLED_OFFSET_PX = 24;

/**
 * Fixed top bar. Transparent over the hero sky, opaque once the page moves —
 * a solid fill rather than a blur, which is the most recognisable "generated
 * interface" tell of the original.
 *
 * Named explicitly because the hero renders a second group of anchor links,
 * and two unlabelled navs are indistinguishable to a screen-reader user
 * browsing landmarks.
 */
export function Nav() {
  const navRef = useScrolledPast<HTMLElement>(SCROLLED_OFFSET_PX, styles.isScrolled);

  return (
    <nav ref={navRef} className={styles.nav} aria-label={ui.navLabel}>
      <a className={styles.logo} href="#top">
        {hero.firstName} <span className={styles.logoLastName}>{hero.lastName}</span>
      </a>

      <ul className={styles.links} role="list">
        {navLinks.map((link) => (
          <li key={link.href}>
            <a className={styles.link} href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

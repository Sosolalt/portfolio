import { hero, navLinks, ui } from '@/data/site';
import styles from './Nav.module.css';

/**
 * Fixed, translucent top bar. Named explicitly because the hero renders a
 * second group of anchor links, and two unlabelled navs are indistinguishable
 * to a screen-reader user browsing landmarks.
 */
export function Nav() {
  return (
    <nav className={styles.nav} aria-label={ui.navLabel}>
      <a className={styles.logo} href="#top">
        {hero.firstName} <span className={styles.logoLastName}>{hero.lastName}</span>
      </a>

      <div className={styles.links}>
        {navLinks.map((link) => (
          <a key={link.href} className={styles.link} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

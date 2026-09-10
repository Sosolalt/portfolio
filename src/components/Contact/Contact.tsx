import { useId } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { contact } from '@/data/site';
import { Icon } from '@/components/Icon/Icon';
import styles from './Contact.module.css';

export function Contact() {
  const titleId = useId();
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <footer id="contact" className="section" aria-labelledby={titleId}>
      <div className="sectionGrid">
        <div className="sectionLabel">
          <h2 id={titleId}>{contact.title}</h2>
        </div>

        <div ref={revealRef} className={styles.body}>
          <p className={styles.hook}>{contact.hook}</p>

          <a className={styles.email} href={`mailto:${contact.email}`}>
            {contact.email}
          </a>

          <div className={styles.socials}>
            {contact.socials.map((social) => (
              <a
                key={social.href}
                className={styles.social}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.label}
                {/* Decorative "opens elsewhere" mark: keeps the name as "GitHub" / "LinkedIn". */}
                <Icon name="external" className={styles.socialIcon} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <p className={styles.colophon}>{contact.copyright}</p>
    </footer>
  );
}

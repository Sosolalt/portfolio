import { useReveal } from '@/hooks/useReveal';
import { contact } from '@/data/site';
import styles from './Contact.module.css';

export function Contact() {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <footer id="contact" className={styles.footer}>
      <div ref={revealRef}>
        <h2 className={styles.title}>{contact.title}</h2>
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
              <span aria-hidden="true"> ↗</span>
            </a>
          ))}
        </div>

        <div className={styles.copyright}>{contact.copyright}</div>
      </div>
    </footer>
  );
}

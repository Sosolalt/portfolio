import { useCallback, useEffect, useId, useRef } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactElement } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '@/types';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { projectsSection } from '@/data/site';
import styles from './CaseStudyModal.module.css';

/** Everything that can hold focus inside the panel, in DOM order. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface CaseStudyModalProps {
  readonly project: Project;
  readonly onClose: () => void;
}

/**
 * The case-study sheet.
 *
 * Mounted only while a project is open, so open/close *is* mount/unmount and
 * every effect below doubles as the corresponding teardown. Rendered through a
 * portal into `document.body` so no ancestor's `overflow` or stacking context
 * can clip a `position: fixed` overlay.
 */
export function CaseStudyModal({ project, onClose }: CaseStudyModalProps): ReactElement | null {
  const titleId = useId();
  const stackLabelId = useId();

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<Element | null>(null);

  // A backdrop dismissal is only a dismissal if the whole gesture happened on
  // the backdrop. Selecting text inside the panel and releasing over the
  // overlay still fires a `click` whose target is the overlay (the common
  // ancestor of the two), which is exactly the misfire these two guard.
  const pressedOnBackdrop = useRef(false);
  const releasedOnBackdrop = useRef(false);

  useBodyScrollLock();

  useEffect(() => {
    // Captured once and never re-captured: StrictMode's second mount would
    // otherwise record the close button as the place to return focus to.
    returnFocusRef.current ??= document.activeElement;
    closeRef.current?.focus();

    return () => {
      const origin = returnFocusRef.current;
      if (origin instanceof HTMLElement && origin.isConnected) origin.focus();
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }

      const active = document.activeElement;
      const inside = panel.contains(active);

      if (event.shiftKey ? active === first || !inside : active === last || !inside) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleMouseDown = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    pressedOnBackdrop.current = event.target === event.currentTarget;
    releasedOnBackdrop.current = false;
  }, []);

  const handleMouseUp = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    releasedOnBackdrop.current = event.target === event.currentTarget;
  }, []);

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const dismissed =
        event.target === event.currentTarget &&
        pressedOnBackdrop.current &&
        releasedOnBackdrop.current;

      pressedOnBackdrop.current = false;
      releasedOnBackdrop.current = false;

      if (dismissed) onClose();
    },
    [onClose],
  );

  return createPortal(
    // The overlay is pure chrome: `role="presentation"` keeps the backdrop out
    // of the accessibility tree, and the dialog semantics sit on the panel.
    <div
      className={styles.overlay}
      style={{ '--accent': project.accent } as CSSProperties}
      role="presentation"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          aria-label={projectsSection.closeLabel}
          onClick={onClose}
        >
          ✕
        </button>

        <p className={styles.tag}>{project.tag}</p>
        <h3 id={titleId} className={styles.title}>
          {project.title}
        </h3>
        <p className={styles.short}>{project.short}</p>

        <ul className={styles.details} role="list">
          {project.details.map((detail) => (
            <li key={detail} className={styles.detail}>
              <span className={styles.bullet} aria-hidden="true">
                ●
              </span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>

        <p id={stackLabelId} className={styles.stackLabel}>
          {projectsSection.stackLabel}
        </p>
        <ul className={styles.chips} role="list" aria-labelledby={stackLabelId}>
          {project.stack.map((item) => (
            <li key={item} className={styles.chip}>
              {item}
            </li>
          ))}
        </ul>

        {project.link !== null && (
          <a
            className={styles.link}
            href={project.link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {`${project.link.label} ↗`}
          </a>
        )}
      </div>
    </div>,
    document.body,
  );
}

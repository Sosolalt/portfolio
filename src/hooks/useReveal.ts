import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Matches the `.reveal` / `.is-revealed` pair declared in `global.css`. */
const HIDDEN_CLASS = 'reveal';
const VISIBLE_CLASS = 'is-revealed';

/** Fraction of the element that must be visible before it reveals. */
const THRESHOLD = 0.15;

export interface UseRevealOptions {
  /**
   * Stagger, in milliseconds. The project cards cascade at +100ms each;
   * everything else reveals with no delay.
   */
  delayMs?: number;
}

/**
 * Fades an element in (+22px → 0) the first time it scrolls into view.
 *
 * Returns a ref to attach to the element itself — deliberately not a wrapper
 * component, so revealed elements stay direct children of their grid or flex
 * parent and the layout is untouched.
 *
 * Reveals once and then stops observing. Under `prefers-reduced-motion` the
 * element is simply never hidden, so there is nothing to reveal.
 */
export function useReveal<T extends HTMLElement>(
  options: UseRevealOptions = {},
): React.RefObject<T | null> {
  const { delayMs = 0 } = options;
  const ref = useRef<T>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Hide before first paint, otherwise the element flashes at full opacity.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion) return;
    el.classList.add(HIDDEN_CLASS);
    if (delayMs > 0) el.style.transitionDelay = `${String(delayMs)}ms`;
  }, [prefersReducedMotion, delayMs]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion) {
      // The setting can flip mid-session; make sure nothing stays hidden.
      el.classList.remove(HIDDEN_CLASS);
      el.style.transitionDelay = '';
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add(VISIBLE_CLASS);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(VISIBLE_CLASS);
          observer.unobserve(entry.target);
        }
      },
      { threshold: THRESHOLD },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [prefersReducedMotion]);

  return ref;
}

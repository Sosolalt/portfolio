import { useEffect, useRef } from 'react';

/**
 * Toggles a class on an element once the page has scrolled past `offsetPx`.
 *
 * A ref and a class rather than React state, for the same reason the starfield
 * and the rotator live outside the tree: a scroll listener that sets state
 * re-renders on every crossing, and this one only ever paints a background.
 * The listener is passive, and writes only when the answer actually changed.
 */
export function useScrolledPast<T extends HTMLElement>(
  offsetPx: number,
  /** A CSS-module lookup, hence possibly `undefined` — see `vite/client`. */
  className: string | undefined,
): React.RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || className === undefined) return;

    let scrolled: boolean | null = null;

    const sync = (): void => {
      const next = window.scrollY > offsetPx;
      if (next === scrolled) return;
      scrolled = next;
      el.classList.toggle(className, next);
    };

    sync();
    window.addEventListener('scroll', sync, { passive: true });
    return () => {
      window.removeEventListener('scroll', sync);
      el.classList.remove(className);
    };
  }, [offsetPx, className]);

  return ref;
}

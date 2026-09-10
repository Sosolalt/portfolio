import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function getMediaQueryList(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(QUERY);
}

function subscribe(onChange: () => void): () => void {
  const mql = getMediaQueryList();
  if (!mql) return () => {};
  mql.addEventListener('change', onChange);
  return () => {
    mql.removeEventListener('change', onChange);
  };
}

function getSnapshot(): boolean {
  return getMediaQueryList()?.matches ?? false;
}

/**
 * Tracks `prefers-reduced-motion: reduce`, reactively.
 *
 * The handoff requires that this setting disable *all* motion. CSS handles the
 * declarative half (see `global.css`); this hook lets the imperative half —
 * the starfield loop, the typewriter, the scroll reveals — opt out too, and
 * re-run if the user flips the setting mid-session.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

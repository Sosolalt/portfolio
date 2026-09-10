import { useEffect } from 'react';

/**
 * Lock state lives at module scope, not per hook instance.
 *
 * React 19's StrictMode mounts every effect twice in development, and a second
 * overlay could in principle open over the first; a plain boolean would then
 * unlock the page while a dialog is still up, or capture `hidden` as the value
 * to "restore". Counting acquisitions makes both cases correct.
 */
let lockCount = 0;
/** Whatever inline `overflow` the document already had — often the empty string. */
let restoreValue = '';

/**
 * Freezes page scroll for as long as the calling component is mounted.
 *
 * The first lock records the existing inline value and the last unlock puts
 * exactly that back, so a pre-existing `body { overflow: … }` set by anything
 * else survives untouched.
 */
export function useBodyScrollLock(): void {
  useEffect(() => {
    const { body } = document;

    if (lockCount === 0) {
      restoreValue = body.style.overflow;
      body.style.overflow = 'hidden';
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) body.style.overflow = restoreValue;
    };
  }, []);
}

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** Validated timings from the handoff — do not round. */
const TYPE_MS = 95;
const DELETE_MS = 45;
/** Beat held once a word is fully typed, before it starts deleting. */
const WORD_PAUSE_MS = 1600;

/**
 * Drives a looping type/delete effect on a span, by writing straight to its
 * `textContent`.
 *
 * Deliberately not React state: a character every 45–95ms would mean a
 * re-render of the whole hero several times a second. The timeout chain and
 * the cursor position live in the closure, the DOM node is the only output,
 * and every pending timeout is cleared on unmount.
 *
 * `words` must be referentially stable (a module-level constant) — a new array
 * on every render restarts the animation.
 */
export function useTypewriter(words: readonly string[]): React.RefObject<HTMLSpanElement | null> {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const firstWord = words[0];
    if (!el || firstWord === undefined) return;

    // Reduced motion: the first word, statically, and not a single timer.
    if (prefersReducedMotion) {
      el.textContent = firstWord;
      return;
    }

    const node = el;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const schedule = (delayMs: number): void => {
      const id = setTimeout(() => {
        timers.delete(id);
        tick();
      }, delayMs);
      timers.add(id);
    };

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = (): void => {
      const word = words[wordIndex] ?? '';

      if (!deleting) {
        charIndex += 1;
        node.textContent = word.slice(0, charIndex);
        if (charIndex === word.length) {
          deleting = true;
          schedule(WORD_PAUSE_MS);
          return;
        }
        schedule(TYPE_MS);
        return;
      }

      charIndex -= 1;
      node.textContent = word.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
      schedule(DELETE_MS);
    };

    // The first character lands immediately, as in the prototype.
    tick();

    return () => {
      for (const id of timers) clearTimeout(id);
      timers.clear();
    };
  }, [words, prefersReducedMotion]);

  return ref;
}

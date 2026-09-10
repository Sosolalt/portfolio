import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/** How long each phrase holds before the next one slides up. */
const INTERVAL_MS = 3200;

/** Global state classes, styled by `Rotator.module.css` — see `.reveal`. */
const IN_CLASS = 'is-in';
const OUT_CLASS = 'is-out';
const RUNNING_CLASS = 'is-running';

/** Reading a layout box flushes the pending style change, restarting the bar. */
function reflow(el: HTMLElement): number {
  return el.offsetWidth;
}

export interface UseRotatorResult {
  /** The element whose children are the phrases, in order. */
  listRef: React.RefObject<HTMLDivElement | null>;
  /** The thin progress rule under them. */
  timerRef: React.RefObject<HTMLSpanElement | null>;
}

/**
 * Cycles the hero's phrases, one sliding up as the previous one slides out.
 *
 * Deliberately not React state: the phrases and the timer bar are DOM classes,
 * so a 3.2s cycle never re-renders the hero. The first phrase carries `is-in`
 * from the server-free first render, which is also the whole of the
 * reduced-motion behaviour — no interval is ever created in that case.
 */
export function useRotator(): UseRotatorResult {
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const list = listRef.current;
    if (!list || prefersReducedMotion) return;

    const phrases = [...list.children].filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
    if (phrases.length < 2) return;

    const timer = timerRef.current;
    const restartTimer = (): void => {
      if (!timer) return;
      timer.classList.remove(RUNNING_CLASS);
      reflow(timer);
      timer.classList.add(RUNNING_CLASS);
    };

    let index = 0;
    restartTimer();

    const id = setInterval(() => {
      const previous = phrases[index];
      index = (index + 1) % phrases.length;
      const next = phrases[index];

      previous?.classList.replace(IN_CLASS, OUT_CLASS);
      next?.classList.remove(OUT_CLASS);
      next?.classList.add(IN_CLASS);
      restartTimer();
    }, INTERVAL_MS);

    return () => {
      clearInterval(id);
      timer?.classList.remove(RUNNING_CLASS);
      // Back to the first phrase, so flipping the motion preference mid-session
      // leaves a legible line rather than whichever one happened to be up.
      phrases.forEach((phrase, i) => {
        phrase.classList.remove(OUT_CLASS);
        phrase.classList.toggle(IN_CLASS, i === 0);
      });
    };
  }, [prefersReducedMotion]);

  return { listRef, timerRef };
}

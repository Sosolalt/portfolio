import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Rotator } from '@/components/Hero/Rotator';
import { hero } from '@/data/site';
import { setPrefersReducedMotion } from './setup';

/** One phrase's turn, matching `INTERVAL_MS` in `useRotator`. */
const INTERVAL_MS = 3200;

function renderRotator() {
  const view = render(<Rotator />);
  // `classNameStrategy: 'non-scoped'` keeps CSS module class names verbatim.
  const phrases = [...view.container.querySelectorAll('.phrase')];
  const timer = view.container.querySelector('.timer');
  return { ...view, phrases, timer };
}

function advance(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

/** The phrase currently up, by index — exactly one at any time. */
function shown(phrases: readonly Element[]): number {
  const up = phrases.filter((phrase) => phrase.classList.contains('is-in'));
  expect(up).toHaveLength(1);
  return phrases.indexOf(up[0]!);
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Rotator', () => {
  it('renders every phrase, with the first one up from the first paint', () => {
    const { phrases } = renderRotator();

    expect(phrases.map((phrase) => phrase.textContent)).toEqual([...hero.phrases]);
    expect(shown(phrases)).toBe(0);
  });

  it('moves to the next phrase every 3.2s and wraps around', () => {
    const { phrases } = renderRotator();

    advance(INTERVAL_MS - 1);
    expect(shown(phrases)).toBe(0);

    advance(1);
    expect(shown(phrases)).toBe(1);
    // The phrase that left slides out rather than simply disappearing.
    expect(phrases[0]).toHaveClass('is-out');

    advance(INTERVAL_MS * (hero.phrases.length - 1));
    expect(shown(phrases)).toBe(0);
    expect(phrases[0]).not.toHaveClass('is-out');
  });

  it('restarts the timer rule on every change', () => {
    const { phrases, timer } = renderRotator();

    expect(timer).toHaveClass('is-running');

    advance(INTERVAL_MS);
    expect(shown(phrases)).toBe(1);
    expect(timer).toHaveClass('is-running');
  });

  it('clears its interval on unmount', () => {
    const { unmount } = renderRotator();
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows the first phrase, with no timer at all, under reduced motion', () => {
    setPrefersReducedMotion(true);
    const { phrases, timer } = renderRotator();

    expect(shown(phrases)).toBe(0);
    expect(timer).not.toHaveClass('is-running');
    expect(vi.getTimerCount()).toBe(0);

    advance(INTERVAL_MS * 2);
    expect(shown(phrases)).toBe(0);
  });

  it('exposes every phrase to assistive tech as static text', () => {
    const { container } = renderRotator();

    expect(container.querySelector('.srOnly')?.textContent).toBe(hero.phrases.join(' '));
    expect(container.querySelector('.rotator')).toHaveAttribute('aria-hidden', 'true');
  });
});

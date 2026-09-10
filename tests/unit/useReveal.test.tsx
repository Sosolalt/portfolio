import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useReveal } from '@/hooks/useReveal';
import { setPrefersReducedMotion, triggerIntersection } from './setup';

/** Number of IntersectionObservers constructed since the current test began. */
let observerCount = 0;

beforeEach(() => {
  // Runs after setup.ts has installed its mock, so this wraps (not replaces) it.
  const BaseObserver = globalThis.IntersectionObserver;

  class CountingObserver extends BaseObserver {
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      super(callback, options);
      observerCount += 1;
    }
  }

  observerCount = 0;
  vi.stubGlobal('IntersectionObserver', CountingObserver);
});

function Probe({ delayMs }: { delayMs?: number }) {
  const ref = useReveal<HTMLDivElement>(delayMs === undefined ? {} : { delayMs });
  return <div ref={ref} data-testid="target" />;
}

const target = () => screen.getByTestId('target');

describe('useReveal', () => {
  it('hides the element before first paint', () => {
    render(<Probe />);

    expect(target()).toHaveClass('reveal');
    expect(target()).not.toHaveClass('is-revealed');
  });

  it('reveals the element once it intersects', () => {
    render(<Probe />);

    act(() => {
      triggerIntersection();
    });

    expect(target()).toHaveClass('reveal', 'is-revealed');
  });

  it('stops observing after the first reveal', () => {
    render(<Probe />);

    act(() => {
      triggerIntersection();
    });

    // Nothing is observed any more, so a second pass cannot touch the element.
    const addClass = vi.spyOn(target().classList, 'add');
    act(() => {
      triggerIntersection();
    });

    expect(addClass).not.toHaveBeenCalled();
    expect(target()).toHaveClass('is-revealed');
  });

  it('turns a delay into a transition-delay', () => {
    render(<Probe delayMs={300} />);

    expect(target().style.transitionDelay).toBe('300ms');
  });

  it('never hides anything, and creates no observer, under reduced motion', () => {
    setPrefersReducedMotion(true);
    render(<Probe delayMs={300} />);

    expect(target()).not.toHaveClass('reveal');
    expect(target()).not.toHaveClass('is-revealed');
    expect(target().style.transitionDelay).toBe('');
    expect(observerCount).toBe(0);
  });
});

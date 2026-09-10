import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

/**
 * jsdom implements neither of the two browser APIs this site leans on, so both
 * are stubbed here. `setPrefersReducedMotion` lets a test flip the media query.
 */

let reducedMotion = false;

export function setPrefersReducedMotion(value: boolean): void {
  reducedMotion = value;
}

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: readonly number[] = [];
  readonly scrollMargin: string = '';
  private readonly targets = new Set<Element>();
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observers.add(this);
  }

  observe(target: Element): void {
    this.targets.add(target);
  }
  unobserve(target: Element): void {
    this.targets.delete(target);
  }
  disconnect(): void {
    this.targets.clear();
    observers.delete(this);
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Test helper: pretend everything observed just scrolled into view. */
  triggerAll(isIntersecting = true): void {
    const entries = [...this.targets].map(
      (target) => ({ target, isIntersecting }) as IntersectionObserverEntry,
    );
    if (entries.length > 0) this.callback(entries, this);
  }
}

const observers = new Set<MockIntersectionObserver>();

/** Test helper: fire every live IntersectionObserver. */
export function triggerIntersection(isIntersecting = true): void {
  for (const observer of [...observers]) observer.triggerAll(isIntersecting);
}

beforeEach(() => {
  reducedMotion = false;
  observers.clear();

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.style.overflow = '';
});

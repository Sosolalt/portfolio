import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Typewriter } from '@/components/Hero/Typewriter';
import { hero } from '@/data/site';
import { setPrefersReducedMotion } from './setup';

const TYPE_MS = 95;
const DELETE_MS = 45;
const WORD_PAUSE_MS = 1600;

const [FIRST, SECOND] = hero.typewriterWords;
const LAST = hero.typewriterWords[hero.typewriterWords.length - 1]!;

/**
 * Time from the first character of a word appearing to the first character of
 * the next one: the rest of the word typed, the pause, then every character
 * deleted plus the hop to the next word.
 */
function cycleMs(word: string): number {
  return (word.length - 1) * TYPE_MS + WORD_PAUSE_MS + word.length * DELETE_MS;
}

function renderTypewriter() {
  const view = render(<Typewriter />);
  const node = view.container.querySelector('span[aria-hidden="true"]');
  if (!node) throw new Error('typewriter span not found');
  return { ...view, node };
}

function advance(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Typewriter', () => {
  it('types the first word one character at a time, every 95ms', () => {
    const { node } = renderTypewriter();

    expect(node.textContent).toBe(FIRST.slice(0, 1));

    advance(TYPE_MS);
    expect(node.textContent).toBe(FIRST.slice(0, 2));

    advance(TYPE_MS - 1);
    expect(node.textContent).toBe(FIRST.slice(0, 2));

    advance(1);
    expect(node.textContent).toBe(FIRST.slice(0, 3));

    advance(TYPE_MS * 3);
    expect(node.textContent).toBe(FIRST.slice(0, 6));
  });

  it('holds the finished word for 1600ms before deleting', () => {
    const { node } = renderTypewriter();

    advance((FIRST.length - 1) * TYPE_MS);
    expect(node.textContent).toBe(FIRST);

    advance(WORD_PAUSE_MS - 1);
    expect(node.textContent).toBe(FIRST);

    advance(1);
    expect(node.textContent).toBe(FIRST.slice(0, -1));
  });

  it('deletes one character every 45ms, then types the next word', () => {
    const { node } = renderTypewriter();

    advance((FIRST.length - 1) * TYPE_MS + WORD_PAUSE_MS);
    expect(node.textContent).toBe(FIRST.slice(0, -1));

    advance(DELETE_MS);
    expect(node.textContent).toBe(FIRST.slice(0, -2));

    advance(DELETE_MS * (FIRST.length - 2));
    expect(node.textContent).toBe('');

    advance(DELETE_MS);
    expect(node.textContent).toBe(SECOND.slice(0, 1));
  });

  it('wraps from the last word back to the first', () => {
    const { node } = renderTypewriter();

    for (const word of hero.typewriterWords.slice(0, -1)) advance(cycleMs(word));
    expect(node.textContent).toBe(LAST.slice(0, 1));

    advance(cycleMs(LAST));
    expect(node.textContent).toBe(FIRST.slice(0, 1));
  });

  it('clears every pending timeout on unmount', () => {
    const { node, unmount } = renderTypewriter();

    advance(TYPE_MS * 4);
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);

    // Nothing keeps writing to the detached node.
    const frozen = node.textContent;
    advance(WORD_PAUSE_MS);
    expect(node.textContent).toBe(frozen);
  });

  it('renders the first word statically, with no timers, under reduced motion', () => {
    setPrefersReducedMotion(true);
    const { node } = renderTypewriter();

    expect(node.textContent).toBe(FIRST);
    expect(vi.getTimerCount()).toBe(0);

    advance(WORD_PAUSE_MS * 2);
    expect(node.textContent).toBe(FIRST);
  });

  it('exposes the four phrases to assistive tech as static text', () => {
    const { container } = renderTypewriter();

    const readable = container.querySelector('.srOnly');
    expect(readable?.textContent).toBe(hero.typewriterWords.join(' '));
  });
});

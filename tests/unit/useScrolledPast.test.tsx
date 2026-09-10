import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useScrolledPast } from '@/hooks/useScrolledPast';

const OFFSET_PX = 24;

function Probe({ className }: { className?: string | undefined }) {
  const ref = useScrolledPast<HTMLDivElement>(OFFSET_PX, className);
  return <div ref={ref} data-testid="target" />;
}

const target = () => screen.getByTestId('target');

/** jsdom never scrolls on its own; move the position, then fire the event. */
function scrollTo(y: number): void {
  act(() => {
    window.scrollY = y;
    window.dispatchEvent(new Event('scroll'));
  });
}

describe('useScrolledPast', () => {
  it('adds the class past the offset and removes it back at the top', () => {
    render(<Probe className="isScrolled" />);
    expect(target()).not.toHaveClass('isScrolled');

    scrollTo(OFFSET_PX);
    expect(target(), 'exactly at the offset is not past it').not.toHaveClass('isScrolled');

    scrollTo(OFFSET_PX + 1);
    expect(target()).toHaveClass('isScrolled');

    scrollTo(0);
    expect(target()).not.toHaveClass('isScrolled');
  });

  it('applies the class on mount when the page is already scrolled', () => {
    window.scrollY = 400;
    render(<Probe className="isScrolled" />);

    expect(target()).toHaveClass('isScrolled');
    scrollTo(0);
  });

  it('does nothing at all without a class name', () => {
    render(<Probe />);

    scrollTo(400);
    expect(target().className).toBe('');
    scrollTo(0);
  });
});

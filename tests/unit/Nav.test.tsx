import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Nav } from '@/components/Nav/Nav';
import { hero, navLinks } from '@/data/site';

describe('Nav', () => {
  it('renders the logo with the surname in its own element', () => {
    render(<Nav />);

    const logo = screen.getByRole('link', { name: hero.name });
    expect(logo).toHaveAttribute('href', '#top');

    // The mint half is a separate node so it can be tinted.
    const lastName = screen.getByText(hero.lastName);
    expect(lastName.tagName).toBe('SPAN');
    expect(logo).toContainElement(lastName);
  });

  it('renders the three anchor links with their hrefs', () => {
    render(<Nav />);

    for (const link of navLinks) {
      expect(screen.getByRole('link', { name: link.label })).toHaveAttribute('href', link.href);
    }
  });

  it('exposes an accessible name, since the hero has a second link group', () => {
    render(<Nav />);

    expect(screen.getByRole('navigation', { name: 'Navigation principale' })).toBeInTheDocument();
  });
});

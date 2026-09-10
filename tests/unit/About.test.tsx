import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { About } from '@/components/About/About';
import { about } from '@/data/site';

/** Keeps U+00A0 intact — the default normalizer would collapse it to a space. */
const verbatim = (text: string) => text;

describe('About', () => {
  it('renders the section title', () => {
    render(<About />);

    expect(screen.getByRole('heading', { level: 2, name: about.title })).toBeInTheDocument();
  });

  it('renders the paragraph verbatim, non-breaking space included', () => {
    render(<About />);

    const paragraph = screen.getByText(about.paragraph, { normalizer: verbatim });
    expect(paragraph.tagName).toBe('P');
    expect(paragraph.textContent).toBe(about.paragraph);

    // French typography: the space before the colon must stay unbreakable.
    expect(about.paragraph).toContain('\u00A0');
    expect(paragraph.textContent).toContain('\u00A0');
  });

  it('renders the eight skill chips as a list', () => {
    render(<About />);

    const chips = screen.getAllByRole('listitem');
    expect(chips).toHaveLength(8);
    expect(about.skills).toHaveLength(8);
    expect(chips.map((chip) => chip.textContent)).toEqual([...about.skills]);
  });
});

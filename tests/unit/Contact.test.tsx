import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Contact } from '@/components/Contact/Contact';
import { contact } from '@/data/site';

/** Keeps U+00A0 intact — the default normalizer would collapse it to a space. */
const verbatim = (text: string) => text;

describe('Contact', () => {
  it('renders the title and the hook verbatim', () => {
    render(<Contact />);

    expect(screen.getByRole('heading', { level: 2, name: contact.title })).toBeInTheDocument();

    const hook = screen.getByText(contact.hook, { normalizer: verbatim });
    expect(hook.textContent).toBe(contact.hook);
    expect(hook.textContent).toContain('\u00A0');
  });

  it('renders the giant email link as a mailto', () => {
    render(<Contact />);

    expect(screen.getByRole('link', { name: contact.email })).toHaveAttribute(
      'href',
      `mailto:${contact.email}`,
    );
  });

  it('renders both social links safely, with the drawn arrow kept out of the name', () => {
    render(<Contact />);

    for (const social of contact.socials) {
      const link = screen.getByRole('link', { name: social.label });
      expect(link).toHaveAttribute('href', social.href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      // The "opens elsewhere" mark is an aria-hidden SVG, so it contributes
      // neither to the accessible name nor to the copied text.
      expect(link.textContent).toBe(social.label);
      expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('renders the copyright line', () => {
    render(<Contact />);

    expect(screen.getByText(contact.copyright)).toBeInTheDocument();
  });
});

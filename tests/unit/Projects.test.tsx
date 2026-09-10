import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Projects } from '@/components/Projects/Projects';
import { projects } from '@/data/projects';

function renderProjects() {
  const onOpenProject = vi.fn<(index: number) => void>();
  render(<Projects onOpenProject={onOpenProject} />);
  return { onOpenProject, cards: screen.getAllByRole('button') };
}

describe('Projects', () => {
  it('renders the section title and one card per project', () => {
    const { cards } = renderProjects();

    expect(screen.getByRole('heading', { level: 2, name: 'Projets' })).toBeInTheDocument();
    expect(cards).toHaveLength(4);
    expect(cards).toHaveLength(projects.length);
  });

  it('shows the tag, title, short description, three metric chips and the case-study affordance', () => {
    const { cards } = renderProjects();

    projects.forEach((project, index) => {
      const card = cards[index]!;

      expect(within(card).getByText(project.tag)).toBeInTheDocument();
      expect(within(card).getByText(project.title)).toBeInTheDocument();
      expect(within(card).getByText(project.short)).toBeInTheDocument();
      expect(within(card).getByText('Étude de cas →')).toBeInTheDocument();

      // `classNameStrategy: 'non-scoped'` keeps CSS module class names verbatim.
      expect(card.querySelectorAll('.chip')).toHaveLength(3);
      for (const metric of project.metrics) {
        expect(within(card).getByText(metric)).toBeInTheDocument();
      }
    });
  });

  it('names each card after the case study it opens', () => {
    renderProjects();

    for (const project of projects) {
      expect(
        screen.getByRole('button', { name: `Étude de cas : ${project.title}` }),
      ).toBeInTheDocument();
    }
  });

  it('sets the project accent as a CSS custom property on each card', () => {
    const { cards } = renderProjects();

    projects.forEach((project, index) => {
      expect(cards[index]!.style.getPropertyValue('--accent')).toBe(project.accent);
    });
  });

  it('calls onOpenProject with the index of the clicked card', async () => {
    const user = userEvent.setup();
    const { onOpenProject, cards } = renderProjects();

    await user.click(cards[2]!);
    expect(onOpenProject).toHaveBeenCalledWith(2);

    await user.click(cards[0]!);
    expect(onOpenProject).toHaveBeenNthCalledWith(2, 0);
    expect(onOpenProject).toHaveBeenCalledTimes(2);
  });

  it('cascades the reveal of the cards by 100ms each', () => {
    const { cards } = renderProjects();

    // The first card has no delay, so `useReveal` leaves the style untouched.
    expect(cards.map((card) => card.style.transitionDelay)).toEqual([
      '',
      '100ms',
      '200ms',
      '300ms',
    ]);

    for (const card of cards) expect(card).toHaveClass('reveal');
  });
});

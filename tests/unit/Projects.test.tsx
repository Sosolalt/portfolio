import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Projects } from '@/components/Projects/Projects';
import { projects } from '@/data/projects';

function renderProjects() {
  const onOpenProject = vi.fn<(index: number) => void>();
  render(<Projects onOpenProject={onOpenProject} />);
  return { onOpenProject, rows: screen.getAllByRole('button') };
}

describe('Projects', () => {
  it('renders the section title and one row per project', () => {
    const { rows } = renderProjects();

    expect(screen.getByRole('heading', { level: 2, name: 'Projets' })).toBeInTheDocument();
    expect(rows).toHaveLength(6);
    expect(rows).toHaveLength(projects.length);
  });

  it('shows the tag, title, short description, the three metrics and the case-study affordance', () => {
    const { rows } = renderProjects();

    projects.forEach((project, index) => {
      const row = rows[index]!;

      expect(within(row).getByText(project.tag)).toBeInTheDocument();
      expect(within(row).getByText(project.title)).toBeInTheDocument();
      expect(within(row).getByText(project.short)).toBeInTheDocument();
      expect(within(row).getByText('Étude de cas')).toBeInTheDocument();

      expect(project.metrics).toHaveLength(3);
      for (const metric of project.metrics) {
        expect(within(row).getByText(metric)).toBeInTheDocument();
      }

      // The separators between the metrics are decorative only.
      // `classNameStrategy: 'non-scoped'` keeps CSS module class names verbatim.
      const separators = row.querySelectorAll('.separator');
      expect(separators).toHaveLength(project.metrics.length - 1);
      for (const separator of separators) {
        expect(separator).toHaveAttribute('aria-hidden', 'true');
      }
    });
  });

  it('names each row after the case study it opens', () => {
    renderProjects();

    for (const project of projects) {
      expect(
        screen.getByRole('button', { name: `Étude de cas : ${project.title}` }),
      ).toBeInTheDocument();
    }
  });

  it('sets the project accent as a CSS custom property on each row', () => {
    const { rows } = renderProjects();

    projects.forEach((project, index) => {
      expect(rows[index]!.style.getPropertyValue('--accent')).toBe(project.accent);
    });
  });

  it('calls onOpenProject with the index of the clicked row', async () => {
    const user = userEvent.setup();
    const { onOpenProject, rows } = renderProjects();

    await user.click(rows[2]!);
    expect(onOpenProject).toHaveBeenCalledWith(2);

    await user.click(rows[0]!);
    expect(onOpenProject).toHaveBeenNthCalledWith(2, 0);
    expect(onOpenProject).toHaveBeenCalledTimes(2);
  });

  it('cascades the reveal of the rows by 100ms each', () => {
    const { rows } = renderProjects();

    // The first row has no delay, so `useReveal` leaves the style untouched.
    expect(rows.map((row) => row.style.transitionDelay)).toEqual(
      projects.map((_, index) => (index === 0 ? '' : `${index * 100}ms`)),
    );

    for (const row of rows) expect(row).toHaveClass('reveal');
  });
});

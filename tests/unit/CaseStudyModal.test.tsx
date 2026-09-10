import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CaseStudyModal } from '@/components/CaseStudyModal/CaseStudyModal';
import { projects } from '@/data/projects';
import type { Project } from '@/types';

/** FreightPulse — the fixture with an external link. */
const linked: Project = projects[0]!;
/** IMC Trading Competition 2026 — the fixture without one. */
const unlinked: Project = projects[1]!;

function renderModal(project: Project = linked) {
  const onClose = vi.fn<() => void>();
  const view = render(<CaseStudyModal project={project} onClose={onClose} />);
  const dialog = screen.getByRole('dialog');
  return {
    ...view,
    onClose,
    dialog,
    // The backdrop is the portal's outermost node; the panel carries the role.
    overlay: dialog.parentElement!,
    close: within(dialog).getByRole('button', { name: 'Fermer' }),
  };
}

describe('CaseStudyModal — content', () => {
  it('renders the tag, title, short description, every detail and every stack chip', () => {
    const { dialog } = renderModal();

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByText(linked.tag)).toBeInTheDocument();
    expect(
      within(dialog).getByRole('heading', { level: 3, name: linked.title }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(linked.short)).toBeInTheDocument();

    for (const detail of linked.details) {
      expect(within(dialog).getByText(detail)).toBeInTheDocument();
    }
    for (const item of linked.stack) {
      expect(within(dialog).getByText(item)).toBeInTheDocument();
    }
  });

  it('labels the dialog with its title and hides the decorative bullets', () => {
    const { dialog } = renderModal();

    expect(dialog).toHaveAccessibleName(linked.title);
    const bullets = dialog.querySelectorAll('[aria-hidden="true"]');
    expect(bullets).toHaveLength(linked.details.length);
    for (const bullet of bullets) expect(bullet).toHaveTextContent('●');
  });

  it('carries the project accent as a CSS custom property', () => {
    const { overlay } = renderModal(unlinked);
    expect(overlay.style.getPropertyValue('--accent')).toBe(unlinked.accent);
  });

  it('renders the external link only when the project has one', () => {
    const { unmount } = renderModal(linked);
    const link = screen.getByRole('link', { name: `${linked.link!.label} ↗` });

    expect(link).toHaveAttribute('href', linked.link!.href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    unmount();

    renderModal(unlinked);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});

describe('CaseStudyModal — dismissal', () => {
  it('closes on the ✕ button', async () => {
    const user = userEvent.setup();
    const { onClose, close } = renderModal();

    await user.click(close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on a backdrop click', async () => {
    const user = userEvent.setup();
    const { onClose, overlay } = renderModal();

    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on a click inside the panel', async () => {
    const user = userEvent.setup();
    const { onClose, dialog } = renderModal();

    await user.click(within(dialog).getByText(linked.short));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close when a drag starts in the panel and is released on the backdrop', () => {
    const { onClose, dialog, overlay } = renderModal();
    const paragraph = within(dialog).getByText(linked.short);

    // Text selection that runs off the edge of the panel: the browser still
    // dispatches `click` on the overlay, their common ancestor.
    fireEvent.mouseDown(paragraph);
    fireEvent.mouseUp(overlay);
    fireEvent.click(overlay);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not close when a press starts on the backdrop and is released in the panel', () => {
    const { onClose, dialog, overlay } = renderModal();

    fireEvent.mouseDown(overlay);
    fireEvent.mouseUp(within(dialog).getByText(linked.short));
    fireEvent.click(overlay);

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('CaseStudyModal — body scroll lock', () => {
  it('locks the body while open and restores the previous inline value', () => {
    document.body.style.overflow = 'scroll';

    const { unmount } = renderModal();
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('leaves no inline overflow behind when there was none', () => {
    expect(document.body.style.overflow).toBe('');

    const { unmount } = renderModal();
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});

describe('CaseStudyModal — focus management', () => {
  it('moves focus to the close button and restores it on unmount', () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();

    const { unmount, close } = renderModal();
    expect(close).toHaveFocus();

    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it('traps Tab and Shift+Tab inside the dialog', async () => {
    const user = userEvent.setup();
    const { close } = renderModal(linked);
    const link = screen.getByRole('link');

    expect(close).toHaveFocus();

    await user.tab();
    expect(link).toHaveFocus();

    // Past the last focusable element, focus wraps back to the first.
    await user.tab();
    expect(close).toHaveFocus();

    await user.tab({ shift: true });
    expect(link).toHaveFocus();
  });

  it('keeps focus on the only focusable element when the project has no link', async () => {
    const user = userEvent.setup();
    const { close } = renderModal(unlinked);

    expect(close).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
  });
});

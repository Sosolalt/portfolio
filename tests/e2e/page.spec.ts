/**
 * Document, hero, project grid, about, contact and in-page navigation.
 *
 * Content is identical in every project (viewport and motion preference change
 * the layout, never the copy), so these run everywhere — that parity is part of
 * what is being asserted.
 */
import { projects } from '../../src/data/projects';
import { about, contact, hero, site, ui } from '../../src/data/site';
import { cardFor, expect, gotoHome, rgbOf, test } from './helpers';

test.beforeEach(async ({ page }) => {
  await gotoHome(page);
});

test('serves a French document with the expected title', async ({ page }) => {
  await expect(page).toHaveTitle(site.title);
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('the hero shows the eyebrow, the name, the mint role line and the wish hint', async ({
  page,
}) => {
  await expect(page.getByText(hero.eyebrow)).toBeVisible();

  const heading = page.getByRole('heading', { level: 1, name: hero.name });
  await expect(heading).toBeVisible();

  const role = page.getByText(hero.role, { exact: true });
  await expect(role).toBeVisible();
  await expect(role).toHaveCSS('color', rgbOf('#8FE3CF'));

  await expect(page.getByText(hero.wishHint)).toBeVisible();
});

test.describe('project cards', () => {
  test('renders exactly four of them', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^Étude de cas : / })).toHaveCount(
      projects.length,
    );
  });

  for (const [index, project] of projects.entries()) {
    test(`card ${String(index + 1)} — ${project.title}`, async ({ page }) => {
      const card = cardFor(page, project);
      await expect(card).toBeVisible();

      await expect(card.getByText(project.tag, { exact: true })).toBeVisible();
      await expect(card.getByText(project.title, { exact: true })).toBeVisible();
      await expect(card.getByText(project.short, { exact: true })).toBeVisible();

      expect(project.metrics).toHaveLength(3);
      for (const metric of project.metrics) {
        await expect(card.getByText(metric, { exact: true })).toBeVisible();
      }
    });

    test(`card ${String(index + 1)} wears the ${project.accent} accent on its top edge`, async ({
      page,
    }) => {
      const card = cardFor(page, project);

      // V7 signature: the top edge alone carries the accent, at double width.
      await expect(card).toHaveCSS('border-top-color', rgbOf(project.accent));
      await expect(card).toHaveCSS('border-top-width', '2px');
      await expect(card).toHaveCSS('border-right-width', '1px');
      await expect(card).toHaveCSS('border-bottom-width', '1px');
      await expect(card).toHaveCSS('border-left-width', '1px');
    });
  }
});

test('the about section shows its paragraph and all eight skill chips', async ({ page }) => {
  const section = page.locator('#a-propos');

  await expect(section.getByRole('heading', { name: about.title })).toBeVisible();
  await expect(section.getByText(about.paragraph)).toBeVisible();

  const chips = section.getByRole('listitem');
  await expect(chips).toHaveCount(about.skills.length);
  await expect(chips).toHaveText([...about.skills]);
});

test('the contact section shows the hook, the address, both socials and the copyright', async ({
  page,
}) => {
  const footer = page.locator('#contact');

  await expect(footer.getByText(contact.hook)).toBeVisible();

  const email = footer.getByRole('link', { name: contact.email, exact: true });
  await expect(email).toHaveAttribute('href', `mailto:${contact.email}`);

  for (const social of contact.socials) {
    const link = footer.getByRole('link', { name: social.label, exact: true });
    await expect(link).toHaveAttribute('href', social.href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }

  await expect(footer.getByText(contact.copyright)).toBeVisible();
});

test.describe('in-page navigation', () => {
  for (const link of [
    { label: 'Projets', id: '#projets' },
    { label: 'À propos', id: '#a-propos' },
    { label: 'Contact', id: '#contact' },
  ]) {
    test(`the nav's "${link.label}" anchor scrolls its section into view`, async ({ page }) => {
      const nav = page.getByRole('navigation', { name: ui.navLabel });
      expect(await page.evaluate(() => window.scrollY)).toBe(0);

      await nav.getByRole('link', { name: link.label, exact: true }).click();

      // Polling *is* the synchronisation here: `scroll-behavior: smooth` means
      // the section slides into place over several frames, and the last one
      // may be clamped by the end of the document (the footer is shorter than
      // the viewport on desktop, so it never reaches the 72px scroll padding).
      await expect
        .poll(
          () =>
            page.evaluate((selector) => {
              const rect = document.querySelector(selector)?.getBoundingClientRect();
              if (!rect) return false;
              return rect.top >= 0 && rect.top <= window.innerHeight * 0.6 && rect.bottom > 0;
            }, link.id),
          { message: `${link.id} should have scrolled into the top of the viewport` },
        )
        .toBe(true);

      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    });
  }
});

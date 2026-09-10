/**
 * The case-study sheet: content, every dismissal path, the scroll lock and the
 * focus trap.
 *
 * Desktop only — the dismissal gestures need a backdrop wide enough to press,
 * drag across and click, and at 360px the panel fills all but the top strip of
 * the viewport.
 */
import { projects } from '../../src/data/projects';
import { cardFor, dialogFor, expect, gotoHome, test } from './helpers';

/** A point in the overlay that is never covered by the panel at 1440×900. */
const BACKDROP_POINT = { x: 1260, y: 450 };

const [freightpulse, imc, mitsui, signalement] = projects;

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'the dismissal gestures need a desktop backdrop');
  await gotoHome(page);
});

for (const project of projects) {
  test(`opens the case study for ${project.title}`, async ({ page }) => {
    await cardFor(page, project).click();

    const dialog = dialogFor(page, project);
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    await expect(dialog.getByText(project.tag, { exact: true })).toBeVisible();
    await expect(dialog.getByRole('heading', { name: project.title, exact: true })).toBeVisible();
    await expect(dialog.getByText(project.short, { exact: true })).toBeVisible();

    // Two lists in the panel, in DOM order: the detail bullets, then the stack
    // chips (the latter is the only one with an accessible name).
    const details = dialog.getByRole('list').first().getByRole('listitem');
    await expect(details).toHaveCount(project.details.length);
    // `toContainText`, not `toHaveText`: each bullet is prefixed by an
    // aria-hidden `●` that `textContent` still sees.
    await expect(details).toContainText([...project.details]);

    await expect(dialog.getByText('Stack', { exact: true })).toBeVisible();
    const chips = dialog.getByRole('list', { name: 'Stack' }).getByRole('listitem');
    await expect(chips).toHaveCount(project.stack.length);
    await expect(chips).toHaveText([...project.stack]);
  });
}

test.describe('external link', () => {
  for (const project of [freightpulse, mitsui]) {
    test(`${project.title} links out`, async ({ page }) => {
      const { link } = project;
      expect(link).not.toBeNull();
      if (link === null) return;

      await cardFor(page, project).click();
      const anchor = dialogFor(page, project).getByRole('link');

      await expect(anchor).toHaveCount(1);
      await expect(anchor).toHaveAttribute('href', link.href);
      await expect(anchor).toHaveAttribute('target', '_blank');
      await expect(anchor).toHaveAttribute('rel', /noopener/);
      await expect(anchor).toContainText(link.label);
    });
  }

  for (const project of [imc, signalement]) {
    test(`${project.title} shows no link`, async ({ page }) => {
      expect(project.link).toBeNull();

      await cardFor(page, project).click();
      await expect(dialogFor(page, project).getByRole('link')).toHaveCount(0);
    });
  }
});

test.describe('dismissal', () => {
  test('closes on the ✕ button', async ({ page }) => {
    const card = cardFor(page, projects[0]);
    await card.click();
    const dialog = page.getByRole('dialog');

    await dialog.getByRole('button', { name: 'Fermer' }).click();
    await expect(dialog).toHaveCount(0);
  });

  test('closes on Escape', async ({ page }) => {
    await cardFor(page, projects[0]).click();
    const dialog = page.getByRole('dialog');

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });

  test('closes on a backdrop click', async ({ page }) => {
    await cardFor(page, projects[0]).click();
    const dialog = page.getByRole('dialog');

    await page.mouse.click(BACKDROP_POINT.x, BACKDROP_POINT.y);
    await expect(dialog).toHaveCount(0);
  });

  test('stays open on a click inside the panel', async ({ page }) => {
    await cardFor(page, projects[0]).click();
    const dialog = page.getByRole('dialog');

    await dialog.getByText(projects[0].short, { exact: true }).click();
    await expect(dialog).toBeVisible();
  });

  test('stays open when a drag started inside the panel ends on the backdrop', async ({ page }) => {
    await cardFor(page, projects[0]).click();
    const dialog = page.getByRole('dialog');

    // Selecting text in the panel and releasing over the overlay still fires a
    // `click` whose target is the overlay — the regression this guards.
    const panel = (await dialog.boundingBox())!;
    await page.mouse.move(panel.x + 40, panel.y + 140);
    await page.mouse.down();
    await page.mouse.move(BACKDROP_POINT.x, 200, { steps: 10 });
    await page.mouse.up();

    await expect(dialog).toBeVisible();
  });
});

test.describe('scroll lock', () => {
  test('freezes the body while open and restores its previous value', async ({ page }) => {
    const card = cardFor(page, projects[0]);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');

    await card.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    expect(await page.evaluate(() => getComputedStyle(document.body).overflowY)).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  });

  test('the page behind does not scroll', async ({ page }) => {
    await cardFor(page, projects[1]).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(BACKDROP_POINT.x, BACKDROP_POINT.y);
    await page.mouse.wheel(0, 800);

    // A wheel event is fire-and-forget; give the compositor a couple of frames
    // to apply a scroll, if it were going to, before reading the position back.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        }),
    );
    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });
});

test.describe('focus', () => {
  test('moves into the dialog on open and back to the card on close', async ({ page }) => {
    const card = cardFor(page, projects[2]);
    await card.click();

    const dialog = page.getByRole('dialog');
    const close = dialog.getByRole('button', { name: 'Fermer' });
    await expect(close).toBeFocused();
    expect(
      await page.evaluate(() =>
        document.querySelector('[role="dialog"]')?.contains(document.activeElement),
      ),
    ).toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(card).toBeFocused();
  });

  test('Tab never escapes the panel', async ({ page }) => {
    await cardFor(page, projects[0]).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    for (let i = 0; i < 15; i += 1) {
      await page.keyboard.press('Tab');
      expect(
        await page.evaluate(() =>
          document.querySelector('[role="dialog"]')?.contains(document.activeElement),
        ),
        `focus escaped the panel after ${String(i + 1)} tab(s)`,
      ).toBe(true);
    }
  });
});

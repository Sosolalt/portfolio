/**
 * Automated accessibility checks.
 *
 * `color-contrast` is asserted in tests of its own rather than left in the
 * general scans, for two unrelated reasons — a real bug and an axe artifact.
 * Both are documented on the tests below; no rule is silently dropped.
 */
import AxeBuilder from '@axe-core/playwright';
import { projects } from '../../src/data/projects';
import { ui } from '../../src/data/site';
import { cardFor, expect, gotoHome, revealEverything, test } from './helpers';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21aa'];

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one axe pass is enough; the DOM is identical');
  await gotoHome(page);
  // Anything still faded in by `useReveal` is skipped by axe, so walk the page
  // first — otherwise the scan only ever covers the hero.
  await revealEverything(page);
});

test('the page has no accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .withTags(WCAG)
    .disableRules(['color-contrast'])
    .analyze();

  expect(results.violations).toEqual([]);
});

/**
 * Regression guard for the one deliberate deviation from the handoff palette.
 * `--color-text-muted` shipped as `#64748B`, which is 4.01:1 on `--color-bg`
 * and 3.85:1 on `--color-bg-modal` — under the 4.5:1 WCAG AA floor for text
 * below 24px, and every use of it (section titles, hero eyebrow, wish hint,
 * STACK label, copyright) is small text. It was lifted to `#708097`; this test
 * fails if anyone ever puts the original value back.
 */
test('every text colour clears WCAG AA contrast', async ({ page }) => {
  const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();

  expect(results.violations).toEqual([]);
});

test('an open case study has no accessibility violations', async ({ page }) => {
  await cardFor(page, projects[0]).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(WCAG)
    .disableRules(['color-contrast'])
    .analyze();

  expect(results.violations).toEqual([]);
});

/**
 * Scoped to the dialog on purpose, and this is the axe artifact rather than a
 * bug: with the sheet open, the `rgba(4, 7, 16, 0.72)` overlay sits over the
 * whole page, and axe composites it into the *foreground* colour of the text
 * behind it as well as the background. That reports ratios of ~1.05:1 for
 * copy that is deliberately dimmed and visually obscured while a modal is up —
 * meaningless numbers. Inside the panel, above the overlay, the check is
 * sound, and it catches the same `--color-text-muted` bug on the STACK label.
 */
test('the open dialog clears WCAG AA contrast', async ({ page }) => {
  await cardFor(page, projects[0]).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include('[role="dialog"]')
    .withRules(['color-contrast'])
    .analyze();

  expect(results.violations).toEqual([]);
});

test('the skip link appears on focus and hands focus to the main content', async ({ page }) => {
  const skipLink = page.getByRole('link', { name: ui.skipToContent, exact: true });

  const parked = await skipLink.boundingBox();
  expect(parked).not.toBeNull();
  expect(parked?.y, 'the skip link should sit above the viewport until focused').toBeLessThan(0);

  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();

  const shown = await skipLink.boundingBox();
  expect(shown?.y, 'focusing the skip link should drop it into view').toBeGreaterThanOrEqual(0);

  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#contenu');

  // `<main>` is not focusable, so the anchor sets the sequential focus
  // navigation starting point instead: the next Tab must land inside it.
  await page.keyboard.press('Tab');
  expect(
    await page.evaluate(() => document.querySelector('#contenu')?.contains(document.activeElement)),
  ).toBe(true);
});

test('the starfield is hidden from assistive technology', async ({ page }) => {
  await expect(page.locator('canvas')).toHaveAttribute('aria-hidden', 'true');
});

/**
 * The 360px contract: readable, single-column, and not one pixel of sideways
 * scroll or layout shift.
 */
import { projects } from '../../src/data/projects';
import { contact, ui } from '../../src/data/site';
import { documentWidths, expect, gotoHome, jumpToSection, rotator, rowFor, test } from './helpers';

const SECTION_IDS = ['#top', '#projets', '#a-propos', '#contact'];

/** Long enough for the rotator to swap phrases at least once. */
const ROTATOR_OBSERVATION_MS = 3600;

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-360', 'the 360px contract');
  await gotoHome(page);
});

test('the page never scrolls sideways', async ({ page }) => {
  const top = await documentWidths(page);
  expect(top.scroll, 'horizontal overflow at the top of the page').toBeLessThanOrEqual(top.client);

  for (const id of SECTION_IDS) {
    await jumpToSection(page, id);
    const widths = await documentWidths(page);
    expect(widths.scroll, `horizontal overflow at ${id}`).toBeLessThanOrEqual(widths.client);
  }

  await jumpToSection(page, '#projets');
  await rowFor(page, projects[3]).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const withModal = await documentWidths(page);
  expect(withModal.scroll, 'horizontal overflow with a case study open').toBeLessThanOrEqual(
    withModal.client,
  );
});

test('the ledger stays one full-width column', async ({ page }) => {
  const boxes = [];
  for (const project of projects) {
    const box = await rowFor(page, project).boundingBox();
    expect(box).not.toBeNull();
    if (box) boxes.push(box);
  }

  expect(boxes).toHaveLength(projects.length);
  const [first] = boxes;
  for (const box of boxes) {
    expect(box.x, 'every row should start at the same x in one column').toBe(first.x);
    expect(box.width).toBe(first.width);
  }
  // A single column also means every row sits below the previous one.
  for (let i = 1; i < boxes.length; i += 1) {
    expect(boxes[i].y).toBeGreaterThan(boxes[i - 1].y);
  }
});

test('the giant email link stays inside the footer', async ({ page }) => {
  const footer = await page.locator('#contact').boundingBox();
  const email = await page.getByRole('link', { name: contact.email, exact: true }).boundingBox();

  expect(footer).not.toBeNull();
  expect(email).not.toBeNull();
  if (!footer || !email) return;

  expect(email.x).toBeGreaterThanOrEqual(footer.x);
  expect(email.x + email.width).toBeLessThanOrEqual(footer.x + footer.width);
});

test('the nav does not overlap the hero heading', async ({ page }) => {
  const nav = await page.getByRole('navigation', { name: ui.navLabel }).boundingBox();
  const heading = await page.getByRole('heading', { level: 1 }).boundingBox();

  expect(nav).not.toBeNull();
  expect(heading).not.toBeNull();
  if (!nav || !heading) return;

  expect(nav.y + nav.height, 'the fixed bar must clear the H1').toBeLessThanOrEqual(heading.y);
});

test('the rotator shifts nothing as the phrases change', async ({ page }) => {
  const heading = page.getByRole('heading', { level: 1 });
  const row = rotator(page);

  const headingBefore = await heading.boundingBox();
  const rowBefore = await row.boundingBox();

  // A deliberate observation window, not a synchronisation wait: the point is
  // that a full change of phrase — the longest is twice the shortest — moves
  // nothing on the page.
  await page.waitForTimeout(ROTATOR_OBSERVATION_MS);

  const headingAfter = await heading.boundingBox();
  const rowAfter = await row.boundingBox();

  expect(headingAfter).toEqual(headingBefore);
  // The phrases are absolutely positioned inside a window of fixed height, so
  // the row's own box is the same box throughout.
  expect(rowAfter).toEqual(rowBefore);
});

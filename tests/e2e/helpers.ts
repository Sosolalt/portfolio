/**
 * Shared fixtures, locators and small utilities for the end-to-end suite.
 *
 * Every spec imports `test` and `expect` from here rather than from
 * `@playwright/test`, so that the console/pageerror guard below is armed for
 * every test in every project without anyone having to remember it.
 */
import { expect, test as base } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import type { Project } from '../../src/types';

/**
 * Auto-used fixture: fails the test if the page logged a `console.error` or
 * threw an uncaught error at any point, including during teardown-time
 * navigation. Attached before the first `goto`, so nothing is missed.
 */
export const test = base.extend<{ pageErrorGuard: void }>({
  pageErrorGuard: [
    async ({ page }, use) => {
      const problems: string[] = [];

      page.on('console', (message) => {
        if (message.type() === 'error') problems.push(`console.error: ${message.text()}`);
      });
      page.on('pageerror', (error) => {
        problems.push(`uncaught: ${error.message}`);
      });

      await use();

      expect(problems, 'the page must log no console errors and throw nothing').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** `#8FE3CF` → `rgb(143, 227, 207)`, the shape `getComputedStyle` returns. */
export function rgbOf(hex: string): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const channels = [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
  return `rgb(${channels.map((c) => String(c)).join(', ')})`;
}

/**
 * Loads the site and waits for the webfonts to settle. Fonts are the one thing
 * that legitimately reflows the page after first paint, so every geometry
 * assertion in the suite depends on this having happened first.
 */
export async function gotoHome(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

/** The project card, addressed by the accessible name `ProjectCard` gives it. */
export function cardFor(page: Page, project: Project): Locator {
  return page.getByRole('button', { name: `Étude de cas : ${project.title}`, exact: true });
}

/** The case-study dialog for a project — named by its `<h3>` via `aria-labelledby`. */
export function dialogFor(page: Page, project: Project): Locator {
  return page.getByRole('dialog', { name: project.title, exact: true });
}

/**
 * The typewriter row: the `<div>` after the hero's `<h1>` and role line.
 *
 * Structural rather than role-based on purpose. The animated span is
 * `aria-hidden` (a node whose text changes every 45ms is noise to a screen
 * reader) and its visible twin is deliberately unlabelled, so it has no role,
 * no accessible name and no stable text to query by.
 */
export function typewriterRow(page: Page): Locator {
  return page.locator('#top h1 + p + div');
}

/** The animated span inside the row — first of the row's two `aria-hidden` spans. */
export function typewriterText(page: Page): Locator {
  return typewriterRow(page).locator('> span[aria-hidden="true"]').first();
}

/** The decorative heartbeat layer: the hero's only `aria-hidden` child `<div>`. */
export function pulseLayer(page: Page): Locator {
  return page.locator('#top > div[aria-hidden="true"]');
}

/** A PNG snapshot of the starfield's current frame. */
export function canvasFrame(page: Page): Promise<string> {
  return page.locator('canvas').evaluate((el) => (el as HTMLCanvasElement).toDataURL());
}

/** `documentElement.scrollWidth` and `clientWidth`, for the overflow guards. */
export function documentWidths(page: Page): Promise<{ scroll: number; client: number }> {
  return page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
}

/** Jumps (no smooth scrolling, no animation) so a section sits at the top. */
export async function jumpToSection(page: Page, id: string): Promise<void> {
  await page.evaluate((selector) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, id);
}

/**
 * Walks the whole page so every `useReveal` element has intersected, then
 * returns once all of them have finished fading in.
 *
 * Two rAFs per step because `IntersectionObserver` delivers its records in the
 * rendering steps, not synchronously after `scrollTo`. The final poll replaces
 * a fixed wait for the 0.8s reveal transition.
 */
export async function revealEverything(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(1, Math.round(window.innerHeight / 2));
    const nextFrame = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });

    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await nextFrame();
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    await nextFrame();
  });

  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.querySelectorAll('.reveal')].every(
          (el) => getComputedStyle(el).opacity === '1',
        ),
      ),
    )
    .toBe(true);
}

/**
 * Everything that moves — and everything that must not move once
 * `prefers-reduced-motion: reduce` is set.
 *
 * The fixed waits in this file are deliberate sampling windows, not
 * synchronisation: the assertions are literally "this changed / did not change
 * over N ms", so there is nothing to poll for.
 */
import { hero } from '../../src/data/site';
import { canvasFrame, expect, gotoHome, pulseLayer, rotator, shownPhrase, test } from './helpers';

/** Longer than the rotator's own 3.2s turn, so a phrase must have changed. */
const ROTATOR_SAMPLE_MS = 3600;
/** Long enough for the twinkle sine to move every star's alpha. */
const CANVAS_SAMPLE_MS = 400;
/** Long enough to prove the reduced-motion sky is genuinely frozen. */
const STATIC_SAMPLE_MS = 700;

test.describe('motion on', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'the default-motion baseline runs on desktop');
    await gotoHome(page);
  });

  test('the rotator moves from one phrase to the next', async ({ page }) => {
    const phrase = shownPhrase(page);
    await expect(phrase).toHaveCount(1);

    const first = await phrase.textContent();
    expect(hero.phrases).toContain(first);

    await page.waitForTimeout(ROTATOR_SAMPLE_MS);

    // Still exactly one phrase up, and it is a different one.
    await expect(phrase).toHaveCount(1);
    const second = await phrase.textContent();
    expect(second).not.toBe(first);
    expect(hero.phrases).toContain(second);
  });

  /**
   * Regression guard for a bug that a production build alone exposes: CSS
   * Modules rewrites `animation-name` exactly like a class name, so keyframes
   * referenced from a module must be declared inside that module. Declared in
   * `global.css` instead, the name resolves to nothing and the heartbeat
   * silently never runs — invisible to the unit tests, which use
   * `classNameStrategy: 'non-scoped'`.
   */
  test('the pulse rings run their heartbeat', async ({ page }) => {
    const running = await pulseLayer(page).evaluate(
      (layer) =>
        [...layer.querySelectorAll('*')]
          .flatMap((node) => node.getAnimations())
          .filter((animation) => animation.playState === 'running').length,
    );

    // Two expanding rings, offset by 0.45s for the lub-dub.
    expect(running).toBeGreaterThanOrEqual(2);
  });

  /** Same scoping trap as the pulse rings, for the rotator's own keyframes. */
  test('the rotator and its timer rule are animated', async ({ page }) => {
    const running = await rotator(page).evaluate(
      (node) => node.getAnimations({ subtree: true }).length,
    );

    expect(running).toBeGreaterThan(0);
  });

  test('the starfield renders and twinkles', async ({ page }) => {
    const first = await canvasFrame(page);
    expect(first.startsWith('data:image/png;base64,')).toBe(true);
    expect(first.length).toBeGreaterThan(1000);

    await page.waitForTimeout(CANVAS_SAMPLE_MS);
    expect(await canvasFrame(page)).not.toBe(first);
  });

  test('clicking the sky makes a wish without breaking anything', async ({ page }) => {
    // The hero content layer is `pointer-events: none`, so a click on this
    // point falls through to the canvas underneath.
    await page.locator('canvas').click({ position: { x: 1100, y: 240 } });
    await page.waitForTimeout(CANVAS_SAMPLE_MS);

    // The console/pageerror guard in `helpers.ts` covers "no error"; the sky
    // still being painted covers "still alive".
    expect((await canvasFrame(page)).length).toBeGreaterThan(1000);
  });
});

test.describe('motion off', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'reduced-motion', 'needs prefers-reduced-motion: reduce');
    await gotoHome(page);
  });

  test('nothing on the page is animating', async ({ page }) => {
    const durations = await page.evaluate(() =>
      document.getAnimations().map((animation) => {
        const timing = animation.effect?.getComputedTiming();
        return (timing?.activeDuration ?? 0) as number;
      }),
    );

    // Either no animations at all, or none with any effective duration.
    expect(durations.filter((duration) => duration > 0)).toEqual([]);
  });

  test('the rotator shows the first phrase and never changes', async ({ page }) => {
    const phrase = shownPhrase(page);
    await expect(phrase).toHaveText(hero.phrases[0]);

    await page.waitForTimeout(ROTATOR_SAMPLE_MS);
    await expect(phrase).toHaveCount(1);
    await expect(phrase).toHaveText(hero.phrases[0]);
  });

  test('the sky is static and a click makes no wish', async ({ page }) => {
    const first = await canvasFrame(page);
    await page.waitForTimeout(STATIC_SAMPLE_MS);
    expect(await canvasFrame(page)).toBe(first);

    await page.locator('canvas').click({ position: { x: 1100, y: 240 } });
    await page.waitForTimeout(STATIC_SAMPLE_MS);
    expect(await canvasFrame(page)).toBe(first);
  });

  test('every revealed element is already visible, unscrolled', async ({ page }) => {
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll('h2, footer div, button, li, p')]
        .filter((el) => getComputedStyle(el).opacity !== '1')
        .map((el) => el.className || el.tagName),
    );
    expect(hidden).toEqual([]);
    // The class the reveal hides with is never applied in the first place.
    expect(await page.locator('.reveal').count()).toBe(0);
  });

  test('scrolling is instant', async ({ page }) => {
    await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  });
});

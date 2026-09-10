import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  advanceShooter,
  autoSpawnPosition,
  canAutoSpawn,
  clampFrameDelta,
  createShooter,
  createStar,
  createStarfield,
  createStars,
  isShooterExpired,
  lerp,
  MAX_AUTO_SHOOTERS,
  MAX_FRAME_DELTA,
  normalisePointer,
  parallaxOffset,
  PARALLAX_LERP,
  shooterFade,
  STAR_COUNT,
  STATIC_STAR_ALPHA,
  stepShooters,
  TRAIL_LENGTH,
  trailTail,
  twinkleAlpha,
  type RandomFn,
  type Shooter,
} from '@/lib/starfield';
import { triggerIntersection } from './setup';

/* ------------------------------------------------------------- Test doubles */

/** Deterministic PRNG (mulberry32) — same seed, same sky, every run. */
function mulberry32(seed: number): RandomFn {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Replays a fixed list of "random" numbers, so call order can be asserted. */
function sequence(values: readonly number[]): RandomFn {
  let index = 0;
  return () => {
    const value = values[index % values.length] ?? 0;
    index += 1;
    return value;
  };
}

interface RecordedCall {
  name: string;
  args: unknown[];
}

/** A recording stand-in for CanvasRenderingContext2D — we assert calls, not pixels. */
function createContextStub() {
  const calls: RecordedCall[] = [];
  const fillStyles: string[] = [];
  const gradientStops: [number, string][] = [];
  let fillStyle = '';

  const record =
    (name: string) =>
    (...args: unknown[]): void => {
      calls.push({ name, args });
    };

  return {
    calls,
    fillStyles,
    gradientStops,
    get fillStyle(): string {
      return fillStyle;
    },
    set fillStyle(value: string) {
      fillStyle = value;
    },
    strokeStyle: '' as unknown,
    lineWidth: 0,
    lineCap: 'butt' as CanvasLineCap,
    setTransform: record('setTransform'),
    clearRect: record('clearRect'),
    beginPath: record('beginPath'),
    arc: record('arc'),
    moveTo: record('moveTo'),
    lineTo: record('lineTo'),
    stroke: record('stroke'),
    fill(): void {
      calls.push({ name: 'fill', args: [] });
      fillStyles.push(fillStyle);
    },
    createLinearGradient(...args: unknown[]) {
      calls.push({ name: 'createLinearGradient', args });
      return {
        addColorStop(offset: number, color: string): void {
          gradientStops.push([offset, color]);
        },
      };
    },
  };
}

type ContextStub = ReturnType<typeof createContextStub>;

function countCalls(ctx: ContextStub, name: string): number {
  return ctx.calls.filter((call) => call.name === name).length;
}

function lastCall(ctx: ContextStub, name: string): RecordedCall | undefined {
  return ctx.calls.filter((call) => call.name === name).at(-1);
}

function createTestCanvas(ctx: ContextStub, width = 800, height = 600): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(canvas, 'clientHeight', { value: height, configurable: true });
  canvas.getContext = (() => ctx) as unknown as HTMLCanvasElement['getContext'];
  return canvas;
}

/** Hand-cranked requestAnimationFrame, so "one frame" is an explicit test step. */
function createFrameDriver() {
  let pending: ((timeMs: number) => void) | null = null;
  let handle = 0;
  let time = 0;

  return {
    get isPending(): boolean {
      return pending !== null;
    },
    get time(): number {
      return time;
    },
    requestFrame: (callback: (timeMs: number) => void): number => {
      pending = callback;
      handle += 1;
      return handle;
    },
    cancelFrame: (): void => {
      pending = null;
    },
    /** Runs exactly one frame at `time + stepMs`. */
    step(stepMs = 16): void {
      const callback = pending;
      pending = null;
      time += stepMs;
      callback?.(time);
    },
    /** Runs ~60fps frames until `seconds` of wall time have passed. */
    run(seconds: number): void {
      const target = time + seconds * 1000;
      while (time < target) this.step(16);
    },
  };
}

type FrameDriver = ReturnType<typeof createFrameDriver>;

/** Live shooting stars are countable: each one draws exactly one trail gradient. */
function shootersDrawnNextFrame(driver: FrameDriver, ctx: ContextStub): number {
  ctx.calls.length = 0;
  driver.step();
  return countCalls(ctx, 'createLinearGradient');
}

/* --------------------------------------------------------------- The stars */

describe('star generation', () => {
  it('creates STAR_COUNT stars by default', () => {
    expect(createStars(STAR_COUNT, mulberry32(1))).toHaveLength(170);
  });

  it('keeps every field inside its documented range', () => {
    const random = mulberry32(42);
    for (const star of createStars(500, random)) {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThan(1);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThan(1);
      expect(star.depth).toBeGreaterThanOrEqual(0);
      expect(star.depth).toBeLessThan(1);
      expect(star.radius).toBeGreaterThanOrEqual(0.4);
      expect(star.radius).toBeLessThan(1.7);
      expect(star.phase).toBeGreaterThanOrEqual(0);
      expect(star.phase).toBeLessThan(Math.PI * 2);
      expect(star.speed).toBeGreaterThanOrEqual(0.4);
      expect(star.speed).toBeLessThan(1.2);
    }
  });

  it('consumes six random values, in field order', () => {
    expect(createStar(sequence([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]))).toEqual({
      x: 0.1,
      y: 0.2,
      depth: 0.3,
      radius: 0.4 + 0.4 * 1.3,
      phase: 0.5 * Math.PI * 2,
      speed: 0.4 + 0.6 * 0.8,
    });
  });

  it('is reproducible for a given seed', () => {
    expect(createStars(20, mulberry32(7))).toEqual(createStars(20, mulberry32(7)));
  });
});

describe('twinkle', () => {
  const star = { phase: 0, speed: 1 };

  it('stays within [0.27, 0.9] for any time', () => {
    for (let timeMs = 0; timeMs < 20000; timeMs += 37) {
      const alpha = twinkleAlpha({ phase: 1.234, speed: 0.9 }, timeMs);
      expect(alpha).toBeGreaterThanOrEqual(0.27);
      expect(alpha).toBeLessThanOrEqual(0.9);
    }
  });

  it('bottoms out at 0.27 when the sine crosses zero', () => {
    expect(twinkleAlpha(star, 0)).toBeCloseTo(0.27, 10);
  });

  it('peaks at 0.9 at the crest of the sine', () => {
    // sin(t * 0.001) === 1 at t = 500π ms.
    expect(twinkleAlpha(star, 500 * Math.PI)).toBeCloseTo(0.9, 10);
  });

  it('uses a flat 0.7 for the reduced-motion sky', () => {
    expect(STATIC_STAR_ALPHA).toBe(0.7);
  });
});

describe('parallax', () => {
  it('shifts the farthest stars by 6px / 4px at full deflection', () => {
    expect(parallaxOffset(0, { x: 1, y: 1 })).toEqual({ x: 6, y: 4 });
  });

  it('shifts the nearest stars by 26px / 18px at full deflection', () => {
    expect(parallaxOffset(1, { x: 1, y: 1 })).toEqual({ x: 26, y: 18 });
  });

  it('mirrors for a pointer on the other side of the viewport', () => {
    expect(parallaxOffset(1, { x: -1, y: -1 })).toEqual({ x: -26, y: -18 });
  });

  it('scales linearly with depth', () => {
    expect(parallaxOffset(0.5, { x: 1, y: 1 })).toEqual({ x: 16, y: 11 });
  });

  it('normalises the pointer to [-1,1] against the viewport', () => {
    expect(normalisePointer(0, 0, 1000, 500)).toEqual({ x: -1, y: -1 });
    expect(normalisePointer(500, 250, 1000, 500)).toEqual({ x: 0, y: 0 });
    expect(normalisePointer(1000, 500, 1000, 500)).toEqual({ x: 1, y: 1 });
  });

  it('lerps toward the pointer by 4% a frame', () => {
    expect(PARALLAX_LERP).toBe(0.04);
    expect(lerp(0, 1, PARALLAX_LERP)).toBeCloseTo(0.04, 10);
    expect(lerp(0.04, 1, PARALLAX_LERP)).toBeCloseTo(0.0784, 10);
    // Converges on, but never overshoots, the target.
    let value = 0;
    for (let i = 0; i < 500; i += 1) value = lerp(value, 1, PARALLAX_LERP);
    expect(value).toBeGreaterThan(0.99);
    expect(value).toBeLessThanOrEqual(1);
  });
});

describe('frame delta', () => {
  it('passes a normal frame through untouched', () => {
    expect(clampFrameDelta(1 / 60)).toBeCloseTo(0.016666, 5);
  });

  it('clamps a long stall to 50ms', () => {
    expect(MAX_FRAME_DELTA).toBe(0.05);
    expect(clampFrameDelta(5)).toBe(0.05);
  });

  it('floors negative or non-finite deltas at zero', () => {
    expect(clampFrameDelta(-2)).toBe(0);
    expect(clampFrameDelta(Number.NaN)).toBe(0);
  });
});

/* ------------------------------------------------------ The shooting stars */

describe('shooting stars', () => {
  it('is born travelling down-left, within the documented velocity range', () => {
    const slow = createShooter(0, 0, sequence([0]));
    expect(slow.vx).toBe(-3.2);
    expect(slow.vy).toBe(1.6);

    const fast = createShooter(0, 0, sequence([0.999999]));
    expect(fast.vx).toBeGreaterThan(-5.6);
    expect(fast.vx).toBeLessThan(-5.59);
    expect(fast.vy).toBeGreaterThan(2.99);
    expect(fast.vy).toBeLessThan(3.0);

    expect(slow.life).toBe(0);
    expect(slow.maxLife).toBe(1.5);
  });

  it('auto-spawns in the top third, right of the far left edge', () => {
    expect(autoSpawnPosition(1000, 900, sequence([0]))).toEqual({ x: 200, y: 0 });
    const late = autoSpawnPosition(1000, 900, sequence([1]));
    expect(late).toEqual({ x: 1000, y: 297 });
    expect(late.y).toBeLessThanOrEqual(900 / 3);
  });

  it('integrates position per 1/60s of velocity', () => {
    const shooter = createShooter(500, 100, sequence([0]));
    advanceShooter(shooter, 1 / 60);
    expect(shooter.x).toBeCloseTo(500 - 3.2, 10);
    expect(shooter.y).toBeCloseTo(100 + 1.6, 10);
    expect(shooter.life).toBeCloseTo(1 / 60, 10);
  });

  it('expires strictly after maxLife', () => {
    const alive: Shooter = { x: 0, y: 0, vx: -1, vy: 1, life: 1.5, maxLife: 1.5 };
    expect(isShooterExpired(alive)).toBe(false);
    expect(isShooterExpired({ ...alive, life: 1.51 })).toBe(true);
  });

  it('fades linearly from 1 to 0 across its life', () => {
    const shooter: Shooter = { x: 0, y: 0, vx: -1, vy: 1, life: 0, maxLife: 1.5 };
    expect(shooterFade(shooter)).toBe(1);
    expect(shooterFade({ ...shooter, life: 0.75 })).toBeCloseTo(0.5, 10);
    expect(shooterFade({ ...shooter, life: 1.5 })).toBe(0);
  });

  it('drops expired shooters and keeps the rest', () => {
    const shooters: Shooter[] = [
      { x: 0, y: 0, vx: -1, vy: 1, life: 1.49, maxLife: 1.5 },
      { x: 0, y: 0, vx: -1, vy: 1, life: 0, maxLife: 1.5 },
    ];
    stepShooters(shooters, 0.05);
    expect(shooters).toHaveLength(1);
    expect(shooters[0]?.life).toBeCloseTo(0.05, 10);
  });

  it('lays the trail 110px behind the head, along the reversed velocity', () => {
    const tail = trailTail({ x: 100, y: 100, vx: -3, vy: 4 });
    expect(tail).toEqual({ x: 100 + 0.6 * TRAIL_LENGTH, y: 100 - 0.8 * TRAIL_LENGTH });
    expect(Math.hypot(tail.x - 100, tail.y - 100)).toBeCloseTo(TRAIL_LENGTH, 10);
  });

  it('degenerates safely for a motionless shooter', () => {
    expect(trailTail({ x: 7, y: 9, vx: 0, vy: 0 })).toEqual({ x: 7, y: 9 });
  });

  it('caps the automatic spawner at two concurrent shooters', () => {
    expect(MAX_AUTO_SHOOTERS).toBe(2);
    expect(canAutoSpawn(0)).toBe(true);
    expect(canAutoSpawn(1)).toBe(true);
    expect(canAutoSpawn(2)).toBe(false);
    expect(canAutoSpawn(3)).toBe(false);
  });
});

/* --------------------------------------------------------------- The engine */

describe('createStarfield', () => {
  let ctx: ContextStub;
  let canvas: HTMLCanvasElement;
  let driver: FrameDriver;

  beforeEach(() => {
    ctx = createContextStub();
    canvas = createTestCanvas(ctx);
    driver = createFrameDriver();
  });

  function build(options: Partial<Parameters<typeof createStarfield>[1]> = {}) {
    return createStarfield(canvas, {
      random: mulberry32(3),
      requestFrame: driver.requestFrame,
      cancelFrame: driver.cancelFrame,
      ...options,
    });
  }

  it('sizes the backing store by devicePixelRatio, capped at 2', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 3, configurable: true });
    build({ starCount: 0 });
    expect(canvas.width).toBe(1600);
    expect(canvas.height).toBe(1200);
    expect(lastCall(ctx, 'setTransform')?.args).toEqual([2, 0, 0, 2, 0, 0]);
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
  });

  it('draws every star once a frame', () => {
    const field = build({ starCount: 5 });
    field.start();
    ctx.calls.length = 0;
    driver.step();
    expect(countCalls(ctx, 'arc')).toBe(5);
    expect(countCalls(ctx, 'clearRect')).toBe(1);
    field.destroy();
  });

  it('swallows the first frame delta so a resumed loop cannot jump', () => {
    const field = build({ starCount: 0 });
    field.start();
    field.spawnShootingStar(300, 100);
    ctx.calls.length = 0;
    driver.step(4000); // first frame: dt is reset to 0, nothing moves
    expect(lastCall(ctx, 'arc')?.args.slice(0, 2)).toEqual([300, 100]);
    field.destroy();
  });

  it('clamps a huge frame gap to 50ms of travel', () => {
    const field = build({ starCount: 0, random: sequence([0]) });
    field.start();
    driver.step(); // absorb the clock reset
    field.spawnShootingStar(300, 100);
    ctx.calls.length = 0;
    driver.step(5000);
    // vx = -3.2, dt clamped to 0.05 => 3.2 * 0.05 * 60 = 9.6px, not 960px.
    const head = lastCall(ctx, 'arc');
    expect(head?.args[0]).toBeCloseTo(300 - 9.6, 6);
    expect(head?.args[1]).toBeCloseTo(100 + 4.8, 6);
    field.destroy();
  });

  it('auto-spawns on the interval and stops at two, while a click always gets through', () => {
    const field = build({ starCount: 0, random: () => 0, intervalSeconds: 0.2 });
    field.start();
    driver.run(0.15);
    expect(shootersDrawnNextFrame(driver, ctx)).toBe(0);

    // Interval 0.2s, jitter 0.7 => spawns at 0.2s, 0.34s, 0.48s; lifetime is
    // 1.5s, so the third attempt meets a full sky and is refused.
    driver.run(0.6);
    expect(shootersDrawnNextFrame(driver, ctx)).toBe(2);
    driver.run(0.3);
    expect(shootersDrawnNextFrame(driver, ctx)).toBe(2);

    // A wish ignores the cap. That asymmetry is deliberate.
    field.spawnShootingStar(400, 50);
    expect(shootersDrawnNextFrame(driver, ctx)).toBe(3);
    field.destroy();
  });

  it('retires a shooting star once its 1.5s are up', () => {
    const field = build({ starCount: 0, random: sequence([0]), intervalSeconds: 1e9 });
    field.start();
    driver.step();
    field.spawnShootingStar(400, 50);
    driver.run(1.4);
    expect(shootersDrawnNextFrame(driver, ctx)).toBe(1);
    driver.run(0.2);
    expect(shootersDrawnNextFrame(driver, ctx)).toBe(0);
    field.destroy();
  });

  it('paints the trail as a fading gradient with a bright head', () => {
    const field = build({ starCount: 0, random: sequence([0]), intervalSeconds: 1e9 });
    field.start();
    driver.step();
    field.spawnShootingStar(400, 50);
    ctx.calls.length = 0;
    ctx.gradientStops.length = 0;
    ctx.fillStyles.length = 0;
    driver.step();

    expect(ctx.gradientStops).toHaveLength(2);
    expect(ctx.gradientStops[0]?.[0]).toBe(0);
    expect(ctx.gradientStops[0]?.[1]).toMatch(/^rgba\(248,250,252,0\.8\d\d\)$/);
    expect(ctx.gradientStops[1]).toEqual([1, 'rgba(248,250,252,0)']);
    expect(ctx.lineWidth).toBe(1.5);
    expect(ctx.lineCap).toBe('round');
    expect(lastCall(ctx, 'arc')?.args[2]).toBe(1.8);
    expect(ctx.fillStyles.at(-1)).toMatch(/^rgba\(248,250,252,0\.9\d\d\)$/);
    field.destroy();
  });

  it('parallaxes the sky toward the pointer', () => {
    const field = build({ starCount: 1, random: sequence([0.5]) });
    field.start();
    driver.step();
    const before = lastCall(ctx, 'arc')?.args[0];

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: window.innerWidth, clientY: 0 }));
    for (let i = 0; i < 200; i += 1) driver.step();
    const after = lastCall(ctx, 'arc')?.args[0];

    // Star depth 0.5 => up to 16px of horizontal drift, fully to the right.
    expect(typeof before).toBe('number');
    expect(typeof after).toBe('number');
    expect((after as number) - (before as number)).toBeGreaterThan(15);
    field.destroy();
  });

  it('pauses off-screen and when the tab is hidden, and resumes cleanly', () => {
    const field = build({ starCount: 3 });
    field.start();
    expect(driver.isPending).toBe(true);

    triggerIntersection(false);
    expect(driver.isPending).toBe(false);

    triggerIntersection(true);
    expect(driver.isPending).toBe(true);

    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(driver.isPending).toBe(false);

    visibility.mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(driver.isPending).toBe(true);

    field.destroy();
  });

  it('repaints on resize', () => {
    const field = build({ starCount: 4 });
    field.start();
    driver.step();
    ctx.calls.length = 0;
    window.dispatchEvent(new Event('resize'));
    expect(countCalls(ctx, 'setTransform')).toBe(1);
    field.destroy();
  });

  it('detaches everything on destroy, and stays destroyed', () => {
    const field = build({ starCount: 2 });
    field.start();
    field.destroy();
    field.destroy();
    expect(driver.isPending).toBe(false);

    ctx.calls.length = 0;
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }));
    triggerIntersection(true);
    expect(ctx.calls).toHaveLength(0);

    field.spawnShootingStar(10, 10);
    expect(driver.isPending).toBe(false);
  });

  it('can be stopped and is inert afterwards', () => {
    const field = build({ starCount: 2 });
    field.start();
    field.stop();
    expect(driver.isPending).toBe(false);
    field.destroy();
  });

  it('survives a canvas with no 2D context', () => {
    canvas.getContext = (() => null) as HTMLCanvasElement['getContext'];
    const field = build();
    expect(() => {
      field.start();
      field.resize();
      field.spawnShootingStar(1, 1);
      field.stop();
      field.destroy();
    }).not.toThrow();
    expect(driver.isPending).toBe(false);
  });
});

describe('createStarfield under prefers-reduced-motion', () => {
  let ctx: ContextStub;
  let canvas: HTMLCanvasElement;
  let driver: FrameDriver;

  beforeEach(() => {
    ctx = createContextStub();
    canvas = createTestCanvas(ctx);
    driver = createFrameDriver();
  });

  function buildStatic() {
    return createStarfield(canvas, {
      random: mulberry32(11),
      reducedMotion: true,
      starCount: 12,
      requestFrame: driver.requestFrame,
      cancelFrame: driver.cancelFrame,
    });
  }

  it('draws the sky exactly once, at a flat 0.7 alpha, with no loop', () => {
    const field = buildStatic();
    field.start();
    expect(driver.isPending).toBe(false);
    expect(countCalls(ctx, 'arc')).toBe(12);
    expect(new Set(ctx.fillStyles)).toEqual(new Set(['rgba(226,232,240,0.700)']));
    field.destroy();
  });

  it('ignores wishes', () => {
    const field = buildStatic();
    field.start();
    ctx.calls.length = 0;
    field.spawnShootingStar(100, 100);
    expect(countCalls(ctx, 'createLinearGradient')).toBe(0);
    expect(driver.isPending).toBe(false);
    field.destroy();
  });

  it('never listens for the pointer', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const field = buildStatic();
    const events = add.mock.calls.map((call) => call[0]);
    expect(events).toContain('resize');
    expect(events).not.toContain('mousemove');
    field.destroy();
  });

  it('still redraws on resize', () => {
    const field = buildStatic();
    field.start();
    ctx.calls.length = 0;
    ctx.fillStyles.length = 0;
    window.dispatchEvent(new Event('resize'));
    expect(countCalls(ctx, 'arc')).toBe(12);
    expect(ctx.fillStyles.every((style) => style === 'rgba(226,232,240,0.700)')).toBe(true);
    field.destroy();
  });
});

/**
 * The hero starfield — 170 twinkling stars, mouse parallax by depth, and
 * shooting stars you can wish on.
 *
 * Deliberately framework-free: every number, every draw call and the whole
 * frame loop live here, so the maths can be unit-tested without React, jsdom
 * or a real canvas. Randomness and the frame scheduler are injected for the
 * same reason. `useStarfield` owns nothing but lifecycle.
 *
 * All values below are transcribed from the design handoff (§Hero Layer 1 and
 * the `initCanvas()` / `wish()` methods of the prototype) and are final.
 */

/** Injectable source of randomness, so tests can seed it. */
export type RandomFn = () => number;

export interface Vec2 {
  x: number;
  y: number;
}

export interface Star {
  /** Normalised position in `[0,1)`, multiplied by the canvas size at draw time. */
  x: number;
  y: number;
  /** `[0,1)` — drives both the parallax amplitude and the visual size. */
  depth: number;
  radius: number;
  /** Twinkle phase offset, so the sky does not pulse in unison. */
  phase: number;
  speed: number;
}

export interface Shooter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Seconds lived so far; the star is removed once this passes `maxLife`. */
  life: number;
  maxLife: number;
}

/* -------------------------------------------------------------- Constants */

export const STAR_COUNT = 170;

/** Retina is worth it; 3x on a phone is not. */
export const MAX_DEVICE_PIXEL_RATIO = 2;

/** A tab that was backgrounded must not resume with one enormous frame. */
export const MAX_FRAME_DELTA = 0.05;

/** Pointer smoothing: the drawn offset chases the real pointer by 4% a frame. */
export const PARALLAX_LERP = 0.04;
export const PARALLAX_BASE_X = 6;
export const PARALLAX_DEPTH_X = 20;
export const PARALLAX_BASE_Y = 4;
export const PARALLAX_DEPTH_Y = 14;

/** Auto-spawned shooting stars are capped; a click ignores the cap (see `spawnShootingStar`). */
export const MAX_AUTO_SHOOTERS = 2;
export const SHOOT_INTERVAL_SECONDS = 4.5;
export const SHOOTER_LIFETIME_SECONDS = 1.5;
export const TRAIL_LENGTH = 110;
export const TRAIL_WIDTH = 1.5;
export const SHOOTER_HEAD_RADIUS = 1.8;

/** Peak twinkle alpha, and the flat alpha used under `prefers-reduced-motion`. */
export const MAX_STAR_ALPHA = 0.9;
export const STATIC_STAR_ALPHA = 0.7;

/** `--star-color` and `--shooting-star-color` from `tokens.css`, as raw channels:
 *  canvas fill styles are strings, not CSS declarations, so they cannot use `var()`. */
const STAR_RGB = '226,232,240';
const SHOOTER_RGB = '248,250,252';

const TAU = Math.PI * 2;

/* ----------------------------------------------------------- Pure helpers */

export function lerp(from: number, to: number, factor: number): number {
  return from + (to - from) * factor;
}

/** Clamps a frame delta (seconds) into `[0, MAX_FRAME_DELTA]`. */
export function clampFrameDelta(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds < 0) return 0;
  return Math.min(seconds, MAX_FRAME_DELTA);
}

export function createStar(random: RandomFn): Star {
  return {
    x: random(),
    y: random(),
    depth: random(),
    radius: 0.4 + random() * 1.3,
    phase: random() * TAU,
    speed: 0.4 + random() * 0.8,
  };
}

export function createStars(count: number, random: RandomFn): Star[] {
  return Array.from({ length: count }, () => createStar(random));
}

/** Sinusoidal twinkle, in `[0.27, 0.9]`. */
export function twinkleAlpha(star: Pick<Star, 'phase' | 'speed'>, timeMs: number): number {
  return (
    MAX_STAR_ALPHA * (0.3 + 0.7 * Math.abs(Math.sin(star.phase + timeMs * 0.001 * star.speed)))
  );
}

/**
 * Pixel offset for a star at `depth`, given the smoothed pointer in `[-1,1]`.
 * Near stars (depth 1) travel ~26px/~18px, far ones (depth 0) ~6px/~4px.
 */
export function parallaxOffset(depth: number, pointer: Vec2): Vec2 {
  return {
    x: pointer.x * (PARALLAX_BASE_X + depth * PARALLAX_DEPTH_X),
    y: pointer.y * (PARALLAX_BASE_Y + depth * PARALLAX_DEPTH_Y),
  };
}

/** Normalises a pointer event to `[-1,1]` against the viewport, not the canvas. */
export function normalisePointer(
  clientX: number,
  clientY: number,
  viewportWidth: number,
  viewportHeight: number,
): Vec2 {
  return {
    x: viewportWidth === 0 ? 0 : (clientX / viewportWidth) * 2 - 1,
    y: viewportHeight === 0 ? 0 : (clientY / viewportHeight) * 2 - 1,
  };
}

export function createShooter(x: number, y: number, random: RandomFn): Shooter {
  return {
    x,
    y,
    vx: -(3.2 + random() * 2.4),
    vy: 1.6 + random() * 1.4,
    life: 0,
    maxLife: SHOOTER_LIFETIME_SECONDS,
  };
}

/** Auto-spawn origin: right-ish of centre, in the top third of the canvas. */
export function autoSpawnPosition(width: number, height: number, random: RandomFn): Vec2 {
  return {
    x: width * (0.2 + random() * 0.8),
    y: height * random() * 0.33,
  };
}

/**
 * Only the *automatic* spawner respects the concurrency cap — a click always
 * gets its wish. The asymmetry is intentional and comes from the prototype.
 */
export function canAutoSpawn(liveCount: number): boolean {
  return liveCount < MAX_AUTO_SHOOTERS;
}

/** Velocities are per 1/60s, hence the `* 60`. */
export function advanceShooter(shooter: Shooter, dt: number): void {
  shooter.life += dt;
  shooter.x += shooter.vx * dt * 60;
  shooter.y += shooter.vy * dt * 60;
}

export function isShooterExpired(shooter: Pick<Shooter, 'life' | 'maxLife'>): boolean {
  return shooter.life > shooter.maxLife;
}

export function shooterFade(shooter: Pick<Shooter, 'life' | 'maxLife'>): number {
  return 1 - shooter.life / shooter.maxLife;
}

/** Advances every shooter and drops the expired ones, in place. */
export function stepShooters(shooters: Shooter[], dt: number): Shooter[] {
  for (let i = shooters.length - 1; i >= 0; i -= 1) {
    const shooter = shooters[i];
    if (shooter === undefined) continue;
    advanceShooter(shooter, dt);
    if (isShooterExpired(shooter)) shooters.splice(i, 1);
  }
  return shooters;
}

/** End of the 110px trail: behind the head, along the reversed velocity. */
export function trailTail(shooter: Pick<Shooter, 'x' | 'y' | 'vx' | 'vy'>): Vec2 {
  const magnitude = Math.hypot(shooter.vx, shooter.vy);
  if (magnitude === 0) return { x: shooter.x, y: shooter.y };
  return {
    x: shooter.x - (shooter.vx / magnitude) * TRAIL_LENGTH,
    y: shooter.y - (shooter.vy / magnitude) * TRAIL_LENGTH,
  };
}

/* ------------------------------------------------------------- The engine */

export interface StarfieldOptions {
  random?: RandomFn;
  starCount?: number;
  /** Seconds between automatic shooting stars, before jitter. */
  intervalSeconds?: number;
  /** Static sky: one draw at flat alpha, no loop, no shooting stars. */
  reducedMotion?: boolean;
  requestFrame?: (callback: (timeMs: number) => void) => number;
  cancelFrame?: (handle: number) => void;
}

export interface StarfieldHandle {
  /** Draws the sky and, unless reduced motion is on, starts the frame loop. */
  start(): void;
  /** Pauses the loop; the canvas keeps its last frame. */
  stop(): void;
  /** Stops everything and detaches every listener. Idempotent. */
  destroy(): void;
  /** "Faire un vœu" — spawns a shooting star at canvas-space `x`/`y`. */
  spawnShootingStar(x: number, y: number): void;
  /** Re-measures the backing store and repaints if the loop is not running. */
  resize(): void;
}

const NOOP_HANDLE: StarfieldHandle = {
  start() {},
  stop() {},
  destroy() {},
  spawnShootingStar() {},
  resize() {},
};

export function createStarfield(
  canvas: HTMLCanvasElement,
  options: StarfieldOptions = {},
): StarfieldHandle {
  const {
    random = Math.random,
    starCount = STAR_COUNT,
    intervalSeconds = SHOOT_INTERVAL_SECONDS,
    reducedMotion = false,
    requestFrame = (callback: (timeMs: number) => void) => window.requestAnimationFrame(callback),
    cancelFrame = (handle: number) => {
      window.cancelAnimationFrame(handle);
    },
  } = options;

  const context2d = canvas.getContext('2d');
  // No 2D context (very old browser, or a canvas already claimed by WebGL):
  // the starfield is decorative, so degrade to nothing rather than throw.
  if (context2d === null) return NOOP_HANDLE;
  // Re-bound with a non-nullable type: the hoisted draw functions below would
  // otherwise lose the narrowing above (and we do not use `!` in src/).
  const ctx: CanvasRenderingContext2D = context2d;

  const stars = createStars(starCount, random);
  const shooters: Shooter[] = [];

  /** Raw pointer, and the value that actually chases it. Both in `[-1,1]`. */
  const pointer: Vec2 = { x: 0, y: 0 };
  const smoothed: Vec2 = { x: 0, y: 0 };

  let width = 0;
  let height = 0;
  let frameHandle = 0;
  let looping = false;
  let lastFrameMs = 0;
  let resetClock = true;
  let spawnCountdown = intervalSeconds;

  let started = false;
  let destroyed = false;
  let documentVisible = true;
  let onScreen = true;

  function measure(): void {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawStars(timeMs: number): void {
    for (const star of stars) {
      const offset = parallaxOffset(star.depth, smoothed);
      const alpha = reducedMotion ? STATIC_STAR_ALPHA : twinkleAlpha(star, timeMs);
      ctx.beginPath();
      ctx.arc(star.x * width + offset.x, star.y * height + offset.y, star.radius, 0, TAU);
      ctx.fillStyle = `rgba(${STAR_RGB},${alpha.toFixed(3)})`;
      ctx.fill();
    }
  }

  function drawShooter(shooter: Shooter): void {
    const fade = shooterFade(shooter);
    const tail = trailTail(shooter);

    const gradient = ctx.createLinearGradient(shooter.x, shooter.y, tail.x, tail.y);
    gradient.addColorStop(0, `rgba(${SHOOTER_RGB},${(0.9 * fade).toFixed(3)})`);
    gradient.addColorStop(1, `rgba(${SHOOTER_RGB},0)`);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = TRAIL_WIDTH;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(shooter.x, shooter.y);
    ctx.lineTo(tail.x, tail.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(shooter.x, shooter.y, SHOOTER_HEAD_RADIUS, 0, TAU);
    ctx.fillStyle = `rgba(${SHOOTER_RGB},${fade.toFixed(3)})`;
    ctx.fill();
  }

  function paintStatic(): void {
    ctx.clearRect(0, 0, width, height);
    drawStars(lastFrameMs);
  }

  function frame(timeMs: number): void {
    if (!looping) return;
    frameHandle = requestFrame(frame);

    // After a pause (hidden tab, scrolled away) the timestamp has jumped;
    // swallow that frame's delta instead of teleporting every shooting star.
    if (resetClock) {
      lastFrameMs = timeMs;
      resetClock = false;
    }
    const dt = clampFrameDelta((timeMs - lastFrameMs) / 1000);
    lastFrameMs = timeMs;

    smoothed.x = lerp(smoothed.x, pointer.x, PARALLAX_LERP);
    smoothed.y = lerp(smoothed.y, pointer.y, PARALLAX_LERP);

    ctx.clearRect(0, 0, width, height);
    drawStars(timeMs);

    // Counting down in accumulated (clamped) frame time rather than wall time
    // means a paused loop cannot come back to a burst of queued spawns.
    spawnCountdown -= dt;
    if (spawnCountdown <= 0) {
      if (canAutoSpawn(shooters.length)) {
        const origin = autoSpawnPosition(width, height, random);
        shooters.push(createShooter(origin.x, origin.y, random));
      }
      spawnCountdown = intervalSeconds * (0.7 + random() * 0.8);
    }

    stepShooters(shooters, dt);
    for (const shooter of shooters) drawShooter(shooter);
  }

  function startLoop(): void {
    if (looping) return;
    looping = true;
    resetClock = true;
    frameHandle = requestFrame(frame);
  }

  function stopLoop(): void {
    if (!looping) return;
    looping = false;
    cancelFrame(frameHandle);
    frameHandle = 0;
  }

  /** The loop runs only when it is both wanted and worth running. */
  function syncLoop(): void {
    if (started && !destroyed && !reducedMotion && documentVisible && onScreen) startLoop();
    else stopLoop();
  }

  function handleResize(): void {
    measure();
    // Resizing wipes the backing store, so a paused or static sky must repaint.
    if (started && !looping) paintStatic();
  }

  function handlePointerMove(event: MouseEvent): void {
    const next = normalisePointer(
      event.clientX,
      event.clientY,
      window.innerWidth,
      window.innerHeight,
    );
    pointer.x = next.x;
    pointer.y = next.y;
  }

  function handleVisibilityChange(): void {
    documentVisible = document.visibilityState !== 'hidden';
    syncLoop();
  }

  let observer: IntersectionObserver | null = null;

  measure();
  window.addEventListener('resize', handleResize);

  if (!reducedMotion) {
    window.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (typeof IntersectionObserver !== 'undefined') {
      // Scrolled past the hero, the sky is invisible; stop burning a frame budget on it.
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) onScreen = entry.isIntersecting;
        syncLoop();
      });
      observer.observe(canvas);
    }
  }

  return {
    start(): void {
      if (destroyed || started) return;
      started = true;
      measure();
      if (reducedMotion) {
        paintStatic();
        return;
      }
      syncLoop();
    },

    stop(): void {
      started = false;
      stopLoop();
    },

    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      started = false;
      stopLoop();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer?.disconnect();
      observer = null;
    },

    spawnShootingStar(x: number, y: number): void {
      if (destroyed || reducedMotion) return;
      shooters.push(createShooter(x, y, random));
    },

    resize: handleResize,
  };
}

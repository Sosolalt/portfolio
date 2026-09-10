import { useCallback, useEffect, useRef } from 'react';
import { createStarfield, type StarfieldHandle } from '@/lib/starfield';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface UseStarfieldResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onClick: React.MouseEventHandler<HTMLCanvasElement>;
}

/**
 * Lifecycle only — every pixel and every number lives in `@/lib/starfield`.
 *
 * The engine is rebuilt whenever the motion preference flips, because a static
 * sky and an animated one are genuinely different objects (one has no loop and
 * no listeners at all). `destroy()` is exhaustive and idempotent, so React 19's
 * double-mounted StrictMode effects leave no orphaned loop behind.
 */
export function useStarfield(): UseStarfieldResult {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<StarfieldHandle | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    const handle = createStarfield(canvas, { reducedMotion: prefersReducedMotion });
    handleRef.current = handle;
    handle.start();

    return () => {
      handle.destroy();
      if (handleRef.current === handle) handleRef.current = null;
    };
  }, [prefersReducedMotion]);

  // "Faire un vœu": the click point is in viewport space, the canvas is not.
  const onClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const handle = handleRef.current;
    if (handle === null) return;
    const rect = event.currentTarget.getBoundingClientRect();
    handle.spawnShootingStar(event.clientX - rect.left, event.clientY - rect.top);
  }, []);

  return { canvasRef, onClick };
}

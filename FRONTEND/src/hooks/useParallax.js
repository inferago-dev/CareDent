import { useEffect, useRef } from 'react';

/**
 * Smooth scroll-linked parallax using rAF + lerp.
 * - Reads the element's Y position relative to viewport center
 * - Lerps current value toward target with a gentle easing factor
 * - Uses will-change + translate3d for GPU-composited, jank-free motion
 */
export default function useParallax(speed = 0.08) {
  const ref = useRef(null);
  const current = useRef(0);
  const target = useRef(0);
  const rafId = useRef(null);
  const isRunning = useRef(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    // Skip entirely on phones/small screens and when the user has asked for
    // reduced motion. A per-frame rAF + scroll-listener transform on every
    // section is cheap on desktop but adds up to real jank on weaker mobile
    // CPUs - this is the difference between the site feeling smooth vs
    // "shaggy" on a phone. Desktop keeps the full effect.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 1023px)').matches;
    if (prefersReducedMotion || isSmallScreen) return undefined;

    // Promote to its own compositor layer
    node.style.willChange = 'transform';

    const updateTarget = () => {
      const rect = node.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      // Clamp to avoid over-translating on very tall pages
      const raw = (viewportCenter - elementCenter) * speed;
      target.current = Math.max(-60, Math.min(60, raw));
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      if (!isRunning.current) return;

      // Gentle lerp factor — 0.05 gives a ~200ms ease-out feel at 60fps
      current.current = lerp(current.current, target.current, 0.05);

      // Only write to DOM if the change is perceptible (> 0.02px)
      if (Math.abs(target.current - current.current) > 0.02) {
        node.style.transform = `translate3d(0, ${current.current.toFixed(3)}px, 0)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    updateTarget();

    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', updateTarget, { passive: true });

    rafId.current = requestAnimationFrame(animate);

    return () => {
      isRunning.current = false;
      window.removeEventListener('scroll', updateTarget);
      window.removeEventListener('resize', updateTarget);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      // Reset transform on unmount
      if (node) node.style.transform = '';
    };
  }, [speed]);

  return ref;
}

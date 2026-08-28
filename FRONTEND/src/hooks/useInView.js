import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Tracks whether an element has scrolled into view.
 * Fires once by default, which is what reveal animations want.
 */
export default function useInView({
  threshold = 0.15,
  rootMargin = '0px 0px -12% 0px',
  once = true,
} = {}) {
  const ref = useRef(null);

  // Respect users who have asked for reduced motion: start visible rather than
  // animating in. This is knowable before the first paint, so it belongs in the
  // initial state - deciding it in an effect meant one frame of hidden content
  // for exactly the users who asked not to see movement.
  const [inView, setInView] = useState(prefersReducedMotion);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(node);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

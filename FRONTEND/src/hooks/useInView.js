import { useEffect, useRef, useState } from 'react';

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
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    // Respect users who have asked for reduced motion: show content immediately.
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      setInView(true);
      return undefined;
    }

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

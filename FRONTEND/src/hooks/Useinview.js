import { useEffect, useRef, useState } from 'react';

/**
 * Tracks whether an element has scrolled into view.
 * Fires once by default (good for one-time reveal animations).
 */
export default function useInView({
    threshold = 0.15,
    rootMargin = '0px 0px -10% 0px',
    once = true,
} = {}) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        // Respect users who've asked for reduced motion — just show content.
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;
        if (prefersReducedMotion) {
            setInView(true);
            return;
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
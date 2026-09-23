import { useEffect } from 'react';

/**
 * Freezes the page behind an overlay while `locked` is true.
 *
 * Without this, scrolling inside an open modal or the mobile nav drawer runs
 * out and starts scrolling the page underneath - so closing the overlay drops
 * you somewhere else on the page. Worst on phones, which is where both of
 * those overlays are used most.
 *
 * Replacing the scrollbar's width with padding keeps the layout from jumping
 * sideways on desktop when `overflow: hidden` removes it.
 *
 * Nested locks are counted, so an overlay opened from inside another one does
 * not release the page early when only the inner one closes.
 */
let lockCount = 0;
let restore = null;

export default function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;

    if (lockCount === 0) {
      const { overflow, paddingRight } = document.body.style;
      restore = () => {
        document.body.style.overflow = overflow;
        document.body.style.paddingRight = paddingRight;
      };
      const gutter = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0 && restore) {
        restore();
        restore = null;
      }
    };
  }, [locked]);
}

import React from 'react';
import useInView from '../hooks/useInView';

/**
 * Animates content the first time it scrolls into view.
 *
 *   <Reveal>...</Reveal>                       fade + rise (default)
 *   <Reveal delay={120}>...</Reveal>           stagger an item in a list
 *   <Reveal variant="scale">...</Reveal>       fade + gentle zoom, for cards
 *   <Reveal variant="left">...</Reveal>        slide in from the left
 *   <Reveal variant="blur">...</Reveal>        fade + defocus, for headlines
 *   <Reveal y={0}>...</Reveal>                 fade only
 *
 * Uses a soft overshoot easing so sections arrive with a bit of life instead of
 * sliding in linearly. Honours prefers-reduced-motion via useInView.
 */

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

function hiddenTransform(variant, y, x, scale) {
  switch (variant) {
    case 'scale': return `translateY(${y}px) scale(${scale})`;
    case 'left': return `translate3d(${-x}px, 0, 0)`;
    case 'right': return `translate3d(${x}px, 0, 0)`;
    case 'blur': return `translateY(${y}px)`;
    default: return `translateY(${y}px)`;
  }
}

export default function Reveal({
  children,
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  duration = 800,
  y = 28,
  x = 40,
  scale = 0.96,
  once = true,
  threshold,
  className = '',
  style = {},
}) {
  const [ref, inView] = useInView({ once, threshold });

  return (
    <Tag
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translate3d(0,0,0) scale(1)' : hiddenTransform(variant, y, x, scale),
        filter: variant === 'blur' && !inView ? 'blur(10px)' : 'blur(0px)',
        transitionProperty: 'opacity, transform, filter',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: EASE,
        transitionDelay: inView ? `${delay}ms` : '0ms',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

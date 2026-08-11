import React from 'react';
import useInView from '../hooks/useInView';

/**
 * Wraps content and animates it in the first time it scrolls into view.
 *
 * <Reveal>...</Reveal>                     simple fade-up
 * <Reveal delay={120}>...</Reveal>         staggered item in a list
 * <Reveal y={0} className="...">...</Reveal>  fade only, no vertical motion
 */
export default function Reveal({
    children,
    as: Tag = 'div',
    delay = 0,
    duration = 700,
    y = 24,
    once = true,
    threshold,
    className = '',
    style = {},
}) {
    const [ref, inView] = useInView({ once, threshold });

    return (
        <Tag
            ref={ref}
            className={`transition-[opacity,transform] ease-out will-change-transform ${className}`}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : `translateY(${y}px)`,
                transitionDuration: `${duration}ms`,
                transitionDelay: inView ? `${delay}ms` : '0ms',
                ...style,
            }}
        >
            {children}
        </Tag>
    );
}